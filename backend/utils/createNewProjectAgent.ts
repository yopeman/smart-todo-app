import { Project, Task, Subtask, AIInteraction, User } from "../models";
import addProjectHistory from "./addProjectHistory";
import { ChatOllama } from '@langchain/ollama';
import { ChatGroq } from "@langchain/groq";
import { createAgent } from 'langchain';
import { tool } from '@langchain/core/tools';
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import * as z from 'zod';

const projectSchema = z.object({
    title: z.string().describe('The title of the project'),
    description: z.string().optional().describe('The description of the project'),
    priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).describe('The priority of the project'),
    urgentImportantMatrix: z.enum(['urgent & important', 'urgent & not important', 'not urgent & important', 'not urgent & not important']).describe('The urgent important matrix classification'),
    successCriteria: z.array(z.string()).optional().describe('The success criteria for the project'),
    isPublic: z.boolean().describe('Whether the project is public'),
    startDate: z.union([z.date(), z.string().transform((str) => new Date(str)), z.number().transform((num) => new Date(num)), z.null()]).optional().describe('The start date of the project (can be date string, Date object, timestamp number, or null)'),
    endDate: z.union([z.date(), z.string().transform((str) => new Date(str)), z.number().transform((num) => new Date(num)), z.null()]).optional().describe('The end date of the project (can be date string, Date object, timestamp number, or null)'),
    status: z.enum(['todo', 'in progress', 'done']).describe('The initial status of the project'),
    completedAt: z.union([z.date(), z.string().transform((str) => new Date(str)), z.number().transform((num) => new Date(num)), z.null()]).optional().describe('When the project was completed (can be date string, Date object, timestamp number, or null)'),
    tasks: z.array(z.object({
        title: z.string().describe('The title of the task'),
        description: z.string().optional().describe('The description of the task'),
        status: z.enum(['todo', 'in progress', 'done']).describe('The status of the task'),
        orderWeight: z.number().optional().describe('Ordering weight for the task'),
        dueDate: z.union([z.date(), z.string().transform((str) => new Date(str)), z.number().transform((num) => new Date(num)), z.null()]).optional().describe('The due date for the task (can be date string, Date object, timestamp number, or null)'),
        completedAt: z.union([z.date(), z.string().transform((str) => new Date(str)), z.number().transform((num) => new Date(num)), z.null()]).optional().describe('When the task was completed (can be date string, Date object, timestamp number, or null)'),
        subtasks: z.array(z.object({
            title: z.string().describe('The title of the subtask'),
            description: z.string().optional().describe('The description of the subtask'),
            status: z.enum(['todo', 'in progress', 'done']).describe('The status of the subtask'),
            orderWeight: z.number().optional().describe('Ordering weight for the subtask'),
            dueDate: z.union([z.date(), z.string().transform((str) => new Date(str)), z.number().transform((num) => new Date(num)), z.null()]).optional().describe('The due date for the subtask (can be date string, Date object, timestamp number, or null)'),
            completedAt: z.union([z.date(), z.string().transform((str) => new Date(str)), z.number().transform((num) => new Date(num)), z.null()]).optional().describe('When the subtask was completed (can be date string, Date object, timestamp number, or null)'),
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
        urgentImportantMatrix: input.urgentImportantMatrix,
        successCriteria: input.successCriteria,
        isPublic: input.isPublic,
        startDate: input.startDate,
        endDate: input.endDate,
        status: input.status,
    })

    await addProjectHistory(
        newProject.id,
        'project',
        newProject.id,
        'create',
        `Project "${newProject.title}" created via AI`,
        context.user.id,
    )

    for (const task of input.tasks) {
        const newTask = await Task.create({
            projectId: newProject.id,
            title: task.title,
            description: task.description,
            status: task.status,
            orderWeight: task.orderWeight,
            dueDate: task.dueDate,
        })

        await addProjectHistory(
            newProject.id,
            'task',
            newTask.id,
            'create',
            `Task "${newTask.title}" created via AI`,
            context.user.id,
        )

        if (task.subtasks) {
            for (const subtask of task.subtasks) {
                const newSubtask = await Subtask.create({
                    taskId: newTask.id,
                    title: subtask.title,
                    description: subtask.description,
                    status: subtask.status,
                    orderWeight: subtask.orderWeight,
                    dueDate: subtask.dueDate,
                })
                await addProjectHistory(
                    newProject.id,
                    'subtask',
                    newSubtask.id,
                    'create',
                    `Subtask "${newSubtask.title}" created via AI`,
                    context.user.id,
                )
            }
        }
    }

    return `Project "${newProject.title}" successfully created with ID: ${newProject.id}`
}

const currentTimestamp = () => {
    return `Current timestamp: ${new Date().toLocaleString()}`
}

function createProjectTools(context: any) {
  return [
    tool(async (x) => await createProjectTool(x, context), {
      name: 'createProject',
      description: 'Finalize and create the project in the database. Call this when you have enough information about the project, its tasks, and subtasks. Requires title, priority, urgent/important matrix, and optional tasks with subtasks.',
      schema: projectSchema,
    }),
    tool(currentTimestamp, {
      name: 'currentTimestamp',
      description: 'Get current date and time for reference when setting project timelines, task deadlines, or scheduling.',
      schema: z.object({}),
    }),
  ];
}

const createProject: (input: any, context: any) => Promise<AIInteraction> = async (input: any, context: any) => {
    try {
        const llm = new ChatGroq({ model: 'llama-3.1-8b-instant' });
        // const llm = new ChatOllama({ model: 'llama3.2:3b' })

        const systemPrompt = `
# 🚀 Project Creation & Planning Assistant

You are an expert Project Planning Assistant specializing in comprehensive project creation and strategic task breakdown. Your role is to transform user ideas into well-structured, actionable project plans.

## 📋 Project Creation Framework

### Phase 1: Requirements Validation
- **Specificity Assessment**: Evaluate if user input provides sufficient detail for quality project creation
  - ✅ Good: "Create a 3-month marketing campaign with SEO, Social Media, and Email tasks"
  - ❌ Bad: "make a marketing project" (too vague)
- **Information Gathering**: Ask clarifying questions when details are missing
- **Scope Definition**: Help users define realistic project boundaries

### Phase 2: Project Structure Design
- **Essential Elements**: Title, description, priority, urgent/important matrix
- **Task Breakdown**: Logical, actionable tasks with clear deliverables
- **Subtask Strategy**: Provide granularity for complex tasks
- **Timeline Planning**: Set realistic start/end dates and deadlines

### Phase 3: Quality Assurance
- **Completeness Check**: Ensure all required fields are populated
- **Logical Flow**: Verify task dependencies and progression
- **Feasibility Assessment**: Validate timeline and resource assumptions

## 🎯 Project Planning Guidelines

### Core Requirements
- **Title & Description**: Clear, descriptive project identity
- **Priority Classification**: HIGH/MEDIUM/LOW based on business impact
- **Urgent/Important Matrix**: Strategic categorization for execution focus
- **Success Criteria**: Measurable outcomes that define project success

### Task Architecture
- **Logical Grouping**: Related tasks grouped by function or timeline
- **Action-Oriented**: Tasks written as clear, executable actions
- **Subtask Granularity**: Break complex tasks into manageable steps
- **Deadline Strategy**: Set realistic due dates based on complexity

### Quality Standards
- **Specificity**: Every task should have clear deliverables
- **Measurability**: Success criteria should be quantifiable
- **Achievability**: Scope should be realistic for given timeline
- **Relevance**: All tasks should align with project goals

## 📊 Creation Context
- **Current Time**: ${new Date().toLocaleString()}
- **User Role**: Project creator and primary stakeholder
- **Your Function**: Transform ideas into structured, executable project plans
- **Output Format**: Complete project with tasks, subtasks, and metadata

## ⚡ Execution Protocol
1. **Assess input completeness** - ask for missing critical information
2. **Design project structure** - break down into logical tasks/subtasks
3. **Set strategic parameters** - priority, matrix, success criteria
4. **Establish timeline** - realistic dates and deadlines
5. **Validate completeness** - ensure all required elements are present
6. **Execute creation** - use createProject tool when plan is comprehensive

## 🎨 Best Practices
- Use industry-standard terminology
- Include 3-7 main tasks for most projects
- Add subtasks for complex or multi-step tasks
- Set clear, measurable success criteria
- Choose priority matrix based on business impact and urgency
- Consider resource availability when setting timelines

Remember: Your goal is to create comprehensive, actionable project plans that set users up for successful execution and delivery.
`.trim();

        const tools = createProjectTools(context);
        const agent = createAgent({ model: llm, tools: tools, systemPrompt: systemPrompt });

        let chatHistory: (HumanMessage | AIMessage)[] = [];
        if (input.parent_interaction_id) {
            const histories = await AIInteraction.findAll({
                where: {
                    userId: context.user.id,
                    isDeleted: false,
                    parentInteractionId: input.parent_interaction_id,
                },
                order: [['createdAt', 'ASC']],
                limit: 5,
                raw: true,
            });

            if (histories.length > 0) {
                chatHistory = histories.flatMap((h) => [
                    new HumanMessage(h.prompt),
                    new AIMessage(h.response),
                ]);
            }
        }

        const agentResponse = await agent.invoke({
            messages: [...chatHistory, new HumanMessage(input.prompt)],
        });

        const messages = agentResponse?.messages ?? [];
        const lastMessage = messages[messages.length - 1];
        const responseContent = lastMessage?.content ?? '';

        const interaction = await AIInteraction.create({
            userId: context.user.id,
            parentInteractionId: input.parent_interaction_id,
            actionType: 'create',
            prompt: input.prompt,
            response: responseContent,
            metadata: {
                model: llm.model,
                toolCalls: messages.flatMap((m: any) => m.tool_calls || []),
                usage: messages[messages.length - 1]?.response_metadata || {},
            },
        });

        return interaction;
    } catch (error) {
        console.error('Error in create project agent:', error);
        throw error;
    }
}

export default createProject
