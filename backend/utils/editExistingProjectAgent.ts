import { Project, Task, Subtask, ProjectHistory, ProjectMember, AIInteraction, User } from "../models";
import { ChatOllama } from '@langchain/ollama'
import { createDeepAgent } from 'deepagents'
import { Tool } from "@langchain/core/tools";
import * as z from 'zod'
import { HumanMessage, AIMessage } from "@langchain/core/messages";


const projectUpdateSchema = z.object({
    id: z.string().describe('The id of the project to update'),
    title: z.string().optional().describe('The title of the project'),
    description: z.string().optional().describe('The description of the project'),
    priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).optional().describe('The priority of the project'),
    urgentImportantMatrix: z.enum(['urgent & important', 'urgent & not important', 'not urgent & important', 'not urgent & not important']).optional().describe('The urgent important matrix of the project'),
    successCriteria: z.array(z.string()).optional().describe('The success criteria of the project'),
    isPublic: z.boolean().optional().describe('The is public of the project'),
    startDate: z.date().optional().describe('The start date of the project'),
    endDate: z.date().optional().describe('The end date of the project'),
    status: z.enum(['todo', 'in progress', 'done']).optional().describe('The status of the project'),
    completedAt: z.date().optional().describe('The completed at of the project'),
    isDeleted: z.boolean().optional().describe('The is deleted of the project'),
    deletedAt: z.date().optional().describe('The deleted at of the project'),
})

const taskCreateSchema = z.object({
    projectId: z.string().describe('The id of the project to update'),
    title: z.string().describe('The title of the task'),
    description: z.string().optional().describe('The description of the task'),
    status: z.enum(['todo', 'in progress', 'done']).optional().describe('The status of the task'),
    orderWeight: z.number().optional().describe('The order weight of the task'),
    dueDate: z.date().optional().describe('The due date of the task'),
    completedAt: z.date().optional().describe('The completed at of the task'),
})

const subtaskCreateSchema = z.object({
    taskId: z.string().describe('The id of the task to update'),
    title: z.string().describe('The title of the subtask'),
    description: z.string().optional().describe('The description of the subtask'),
    status: z.enum(['todo', 'in progress', 'done']).optional().describe('The status of the subtask'),
    orderWeight: z.number().optional().describe('The order weight of the subtask'),
    dueDate: z.date().optional().describe('The due date of the subtask'),
    completedAt: z.date().optional().describe('The completed at of the subtask'),
})

const taskUpdateSchema = z.object({
    id: z.string().describe('The id of the task to update'),
    projectId: z.string().describe('The id of the project to update'),
    title: z.string().optional().describe('The title of the task'),
    description: z.string().optional().describe('The description of the task'),
    status: z.enum(['todo', 'in progress', 'done']).optional().describe('The status of the task'),
    orderWeight: z.number().optional().describe('The order weight of the task'),
    dueDate: z.date().optional().describe('The due date of the task'),
    completedAt: z.date().optional().describe('The completed at of the task'),
    isDeleted: z.boolean().optional().describe('The is deleted of the task'),
    deletedAt: z.date().optional().describe('The deleted at of the task'),
})

const subtaskUpdateSchema = z.object({
    id: z.string().describe('The id of the subtask to update'),
    taskId: z.string().describe('The id of the task to update'),
    title: z.string().optional().describe('The title of the subtask'),
    description: z.string().optional().describe('The description of the subtask'),
    status: z.enum(['todo', 'in progress', 'done']).optional().describe('The status of the subtask'),
    orderWeight: z.number().optional().describe('The order weight of the subtask'),
    dueDate: z.date().optional().describe('The due date of the subtask'),
    completedAt: z.date().optional().describe('The completed at of the subtask'),
    isDeleted: z.boolean().optional().describe('The is deleted of the subtask'),
    deletedAt: z.date().optional().describe('The deleted at of the subtask'),
})


const editProjectTool = async (x: any) => {
    const input = await projectUpdateSchema.parseAsync(x)

    const project = await Project.findByPk(input.id)
    if (!project) return 'Error: Project not found with the provided "id". Please verify the id is correct.'

    const updatedProject = await project.update(input)
    return `Project updated successfully: \n\n${JSON.stringify(updatedProject.toJSON(), null, 2)}`
}


const addNewTaskTool = async (x: any) => {
    const input = await taskCreateSchema.parseAsync(x)

    const project = await Project.findByPk(input.projectId)
    if (!project) return 'Error: Project not found with the provided "projectId".'

    const newTask = await Task.create(input)
    return `Task created successfully: \n\n${JSON.stringify(newTask.toJSON(), null, 2)}`
}


const editTaskTool = async (x: any) => {
    const input = await taskUpdateSchema.parseAsync(x)

    const task = await Task.findByPk(input.id)
    if (!task) return 'Error: Task not found with the provided "id". Please verify the id.'

    const updatedTask = await task.update(input)
    return `Task updated successfully: \n\n${JSON.stringify(updatedTask.toJSON(), null, 2)}`
}

const addNewSubtaskTool = async (x: any) => {
    const input = await subtaskCreateSchema.parseAsync(x)

    const task = await Task.findByPk(input.taskId)
    if (!task) return 'Error: Parent task not found. Cannot add subtask.'

    const newSubtask = await Subtask.create(input)
    return `Subtask created successfully: \n\n${JSON.stringify(newSubtask.toJSON(), null, 2)}`
}

const editSubtaskTool = async (x: any) => {
    const input = await subtaskUpdateSchema.parseAsync(x)

    const subtask = await Subtask.findByPk(input.id)
    if (!subtask) return 'Error: Subtask not found. Please check the id.'

    const updatedSubtask = await subtask.update(input)
    return `Subtask updated successfully: \n\n${JSON.stringify(updatedSubtask.toJSON(), null, 2)}`
}

const currentTimestamp = () => {
    return `Current timestamp: ${new Date().toLocaleString()}`
}



const tools: any = [
    {
        name: 'editProject',
        description: 'Update project details like title, description, priority, etc.',
        schema: projectUpdateSchema,
        func: editProjectTool
    },
    {
        name: 'addNewTask',
        description: 'Add a new task to the project.',
        schema: taskCreateSchema,
        func: addNewTaskTool
    },
    {
        name: 'editTask',
        description: 'Edit an existing task in the project.',
        schema: taskUpdateSchema,
        func: editTaskTool
    },
    {
        name: 'addNewSubtask',
        description: 'Add a new subtask to an existing task.',
        schema: subtaskCreateSchema,
        func: addNewSubtaskTool
    },
    {
        name: 'editSubtask',
        description: 'Edit an existing subtask.',
        schema: subtaskUpdateSchema,
        func: editSubtaskTool
    },
    {
        name: 'currentTimestamp',
        description: 'Get the current date and time.',
        func: currentTimestamp
    }
]


const editProject: (input: any, context: any) => Promise<AIInteraction> = async (input: any, context: any) => {
    const llm = new ChatOllama({ model: 'qwen2.5:0.5b' })

    const project = await Project.findOne({
        where: {
            id: input.project_id,
            isDeleted: false,
        },
        include: [
            {
                model: Task,
                as: 'tasks',
                include: [
                    {
                        model: Subtask,
                        as: 'subtasks',
                    }
                ]
            }
        ]
    })
    if (!project) throw new Error('Project not found')

    const whereClose: any = {
        userId: context.user.id,
        projectId: input.project_id,
        isDeleted: false,
    }

    if (input.parent_interaction_id) {
        whereClose.parentInteractionId = input.parent_interaction_id
    }

    const histories = await AIInteraction.findAll({
        where: whereClose,
        order: [['createdAt', 'DESC']],
        limit: 10,
    })

    const systemPrompt = `
You are an expert project management assistant. Your goal is to help the user edit their existing project.
You have access to the current project state, including its tasks and subtasks below.

### CRITICAL: PRE-FLIGHT CHECK
Before calling any editing tools (editProject, addNewTask, editTask, etc.), verify if the user's request is specific enough to act upon safely.
- If the request is ambiguous (e.g., "change the task"), ask the user WHICH task they mean and WHAT details need changing.
- If the request is specific (e.g., "change the status of the 'Research' task to 'in progress'"), use the appropriate tool to perform the update.
- Always cross-reference IDs from the "Current Project Data" provided below.

### Current Project Data:
${JSON.stringify(project.toJSON(), null, 2)}

### Guidelines:
- If you create or update a record, the tool's response will contain updated data/IDs.
- Use the "currentTimestamp" tool if you need to calculate deadlines or track time-based status.
- Be concise and professional.

Current Time: ${new Date().toLocaleString()}
`.trim()


    const agent = createDeepAgent({ model: llm, tools: tools, systemPrompt: systemPrompt })


    // Build chat history
    const chatHistory = histories.reverse().flatMap(h => [
        new HumanMessage(h.prompt),
        new AIMessage(h.response)
    ])

    const agentResponse = await agent.invoke({
        input: input.prompt,
        chat_history: chatHistory
    })

    return await AIInteraction.create({
        ...input,
        userId: context.user.id,
        actionType: 'edit',
        response: typeof agentResponse === 'string' ? agentResponse : JSON.stringify(agentResponse),
        metadata: typeof agentResponse === 'object' ? agentResponse : { content: agentResponse }
    })
}


export default editProject