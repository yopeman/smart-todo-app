import { Project, Task, ProjectHistory, ProjectMember, AIInteraction, User } from "../models";
import { ChatOllama } from '@langchain/ollama'
import * as z from 'zod'
import { HumanMessage, AIMessage } from "@langchain/core/messages";

const projectSchema = z.object({
    title: z.string(),
    description: z.string().optional(),
    priority: z.enum(['HIGH', 'MEDIUM', 'LOW']),
    urgent_important_matrix: z.enum(['urgent & important', 'urgent & not important', 'not urgent & important', 'not urgent & not important']),
    success_criteria: z.array(z.string()).optional(),
    is_public: z.boolean(),
    start_date: z.date().optional(),
    end_date: z.date().optional(),
    status: z.enum(['todo', 'in progress', 'done']),
    completed_at: z.date().optional(),
    tasks: z.array(z.object({
        title: z.string(),
        description: z.string().optional(),
        status: z.enum(['todo', 'in progress', 'done']),
        order_weight: z.number().optional(),
        due_date: z.date().optional(),
        completed_at: z.date().optional(),
        subtasks: z.array(z.object({
            title: z.string(),
            description: z.string().optional(),
            status: z.enum(['todo', 'in progress', 'done']),
            order_weight: z.number().optional(),
            due_date: z.date().optional(),
            completed_at: z.date().optional(),
        })),
    })),
})

const decideIsUserPromptUsefulForProjectCreationSchema = z.object({
    is_useful: z.boolean(),
    reason: z.string().optional(),
})

const createProject: (input: any, context: any) => Promise<AIInteraction> = async (input: any, context: any) => {
    const llm = new ChatOllama({ model: 'qwen2.5:0.5b' })
    const structuredLLMForProjectCreation = llm.withStructuredOutput(projectSchema)
    const structuredLLMForDecide = llm.withStructuredOutput(decideIsUserPromptUsefulForProjectCreationSchema)

    const whereClose: any = {
        userId: context.user.id,
        isDeleted: false,
    }

    if (input.parentInteractionId) {
        whereClose.parentInteractionId = input.parentInteractionId
    }

    const histories = await AIInteraction.findAll({
        where: whereClose,
        order: [['createdAt', 'DESC']],
        limit: 10,
    })
    const historyMessages = histories.map((history) => `${new HumanMessage(history.prompt)} \n${new AIMessage(history.response)}`).join('\n')

    const response1 = await structuredLLMForDecide.invoke(`
            You are a helpful assistant that decides if the user prompt is useful for project creation based on the project structure.
            If the user prompt is useful for project creation, return true. Otherwise, return false. If the user prompt is not useful for project creation, return the reason why.
            Previous conversations: "${historyMessages}"
            The user prompt is: "${input.prompt}"
            Project structure: "${projectSchema.shape}"
            Return JSON format: "${decideIsUserPromptUsefulForProjectCreationSchema.shape}"
            `.trim()
    )

    if (!response1.is_useful) {
        const response2: AIMessage = await llm.invoke(`
            You are a helpful assistant that asks the user to provide a more detailed prompt for project creation based on the project structure.
            The user prompt is: "${input.prompt}"
            Project structure: "${projectSchema.shape}"
            Reason why the user prompt is not useful for project creation: "${response1.reason}"
            Ask the user to provide a more detailed prompt for project creation based on the project structure.
            `.trim())

        const response2Content = response2.content
        const response2Metadata = response2
        response2Metadata.content = ''

        const interaction1 = await AIInteraction.create({
            ...input,
            userId: context.user.id,
            response: response2Content,
            metadata: response2Metadata,
        })
        return interaction1.toJSON()
    }

    const response3 = await structuredLLMForProjectCreation.invoke(`
        You are a helpful assistant that plan for project creation based on the project structure.
        Create the project based on the project structure.
        Previous conversations: "${historyMessages}"
        The user prompt is: "${input.prompt}"
        Project structure: "${projectSchema.shape}"
        Return JSON format: "${projectSchema.shape}"
        `.trim()
    )

    const newProject = await Project.create({
        ownerId: context.user.id,
        title: response3.title,
        description: response3.description,
        priority: response3.priority,
        urgentImportantMatrix: response3.urgent_important_matrix,
        successCriteria: response3.success_criteria,
        isPublic: response3.is_public,
        startDate: response3.start_date,
        endDate: response3.end_date,
        status: response3.status,
    })

    for (const task of response3.tasks) {
        const newTask = await Task.create({
            projectId: newProject.id,
            title: task.title,
            description: task.description,
            status: task.status,
            orderWeight: task.order_weight,
            dueDate: task.due_date,
        })

        for (const subtask of task.subtasks) {
            const newSubtask = await Task.create({
                projectId: newProject.id,
                parentTaskId: newTask.id,
                title: subtask.title,
                description: subtask.description,
                status: subtask.status,
                orderWeight: subtask.order_weight,
                dueDate: subtask.due_date,
            })
        }
    }

    const interaction2 = await AIInteraction.create({
        ...input,
        userId: context.user.id,
        response: `Project "${newProject.title}" successfully created`,
    })
    return interaction2.toJSON()
}

export default createProject