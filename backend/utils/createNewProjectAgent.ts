import { Project, Task, Subtask, AIInteraction } from "../models";
import { ChatOllama } from '@langchain/ollama'
import { createDeepAgent } from 'deepagents'
import * as z from 'zod'
import { HumanMessage, AIMessage } from "@langchain/core/messages";

const projectSchema = z.object({
    title: z.string().describe('The title of the project'),
    description: z.string().optional().describe('The description of the project'),
    priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).describe('The priority of the project'),
    urgent_important_matrix: z.enum(['urgent & important', 'urgent & not important', 'not urgent & important', 'not urgent & not important']).describe('The urgent important matrix classification'),
    success_criteria: z.array(z.string()).optional().describe('The success criteria for the project'),
    is_public: z.boolean().describe('Whether the project is public'),
    start_date: z.date().optional().describe('The start date of the project'),
    end_date: z.date().optional().describe('The end date of the project'),
    status: z.enum(['todo', 'in progress', 'done']).describe('The initial status of the project'),
    completed_at: z.date().optional().describe('When the project was completed'),
    tasks: z.array(z.object({
        title: z.string().describe('The title of the task'),
        description: z.string().optional().describe('The description of the task'),
        status: z.enum(['todo', 'in progress', 'done']).describe('The status of the task'),
        order_weight: z.number().optional().describe('Ordering weight for the task'),
        due_date: z.date().optional().describe('The due date for the task'),
        completed_at: z.date().optional().describe('When the task was completed'),
        subtasks: z.array(z.object({
            title: z.string().describe('The title of the subtask'),
            description: z.string().optional().describe('The description of the subtask'),
            status: z.enum(['todo', 'in progress', 'done']).describe('The status of the subtask'),
            order_weight: z.number().optional().describe('Ordering weight for the subtask'),
            due_date: z.date().optional().describe('The due date for the subtask'),
            completed_at: z.date().optional().describe('When the subtask was completed'),
        })).optional().describe('Subtasks for this task'),
    })).describe('Tasks included in the project'),
})

const createProjectTool = async (x: any, context: any) => {
    const input = await projectSchema.parseAsync(x)

    const newProject = await Project.create({
        ownerId: context.user.id,
        title: input.title,
        description: input.description,
        priority: input.priority,
        urgentImportantMatrix: input.urgent_important_matrix,
        successCriteria: input.success_criteria,
        isPublic: input.is_public,
        startDate: input.start_date,
        endDate: input.end_date,
        status: input.status,
    })

    for (const task of input.tasks) {
        const newTask = await Task.create({
            projectId: newProject.id,
            title: task.title,
            description: task.description,
            status: task.status,
            orderWeight: task.order_weight,
            dueDate: task.due_date,
        })

        if (task.subtasks) {
            for (const subtask of task.subtasks) {
                await Subtask.create({
                    taskId: newTask.id,
                    title: subtask.title,
                    description: subtask.description,
                    status: subtask.status,
                    orderWeight: subtask.order_weight,
                    dueDate: subtask.due_date,
                })
            }
        }
    }

    return `Project "${newProject.title}" successfully created with ID: ${newProject.id}`
}

const currentTimestamp = () => {
    return `Current timestamp: ${new Date().toLocaleString()}`
}

const tools: any = (context: any) => [
    {
        name: 'createProject',
        description: 'Finalize and create the project in the database. Call this when you have enough information about the project, its tasks, and subtasks.',
        schema: projectSchema,
        func: (x: any) => createProjectTool(x, context)
    },
    {
        name: 'currentTimestamp',
        description: 'Get current date and time',
        func: currentTimestamp
    }
]

const createProject: (input: any, context: any) => Promise<AIInteraction> = async (input: any, context: any) => {
    const llm = new ChatOllama({ model: 'qwen2.5:0.5b' })
    const systemPrompt = `
You are an expert project planning assistant. Your goal is to help the user create a new project.

### CRITICAL: PRE-FLIGHT CHECK
Before using the "createProject" tool, carefully evaluate if the user's prompt (and chat history) provides sufficient detail for a high-quality project plan.
- If the prompt is vague (e.g., "make a marketing project"), DO NOT use the tool. Instead, ask the user for specific details like the project goal, key tasks, and timelines.
- If the prompt is detailed (e.g., "create a 3-month marketing campaign project with tasks for SEO, Social Media, and Email, each with 2 subtasks"), use the "createProject" tool to finalize the plan.

### Project Structure Guidelines:
- Title and description are required.
- Priority and urgent/important matrix should be decided based on the prompt context.
- Breakdown the project into logical, actionable tasks.
- For complex projects, provide subtasks for better granularity.

Current Time: ${new Date().toLocaleString()}
`.trim()


    const agent = createDeepAgent({ model: llm, tools: tools(context), systemPrompt: systemPrompt })

    const whereClose: any = {
        userId: context.user.id,
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
        actionType: 'create',
        response: typeof agentResponse === 'string' ? agentResponse : JSON.stringify(agentResponse),
        metadata: typeof agentResponse === 'object' ? agentResponse : { content: agentResponse }
    })
}

export default createProject