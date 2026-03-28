import { Project, Task, Subtask, AIInteraction, User } from "../models";
import addProjectHistory from "./addProjectHistory";
import { ChatOllama } from '@langchain/ollama';
import { ChatGroq } from "@langchain/groq";
import { createAgent } from 'langchain';
import { tool } from '@langchain/core/tools';
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import * as z from 'zod';

const dateSchema = z.union([
        z.date(),
        z.string().transform((str) => {
            // Handle YYYY-MM-DD format
            if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
                return new Date(str + 'T00:00:00Z');
            }
            // Handle ISO string
            return new Date(str);
        }),
        z.number().transform((num) => new Date(num)),
        z.null()
    ]).optional()

const projectSchema = z.object({
    title: z.string().describe('The title of the project'),
    description: z.string().optional().describe('The description of the project'),
    priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).optional().describe('The priority of the project'),
    urgentImportantMatrix: z.enum(['urgent & important', 'urgent & not important', 'not urgent & important', 'not urgent & not important']).optional().describe('The urgent important matrix classification'),
    successCriteria: z.array(z.string()).optional().describe('The success criteria for the project'),
    isPublic: z.boolean().optional().describe('Whether the project is public'),
    startDate: dateSchema.optional().describe('The start date of the project (can be date string, Date object, timestamp number, or null)'),
    endDate: dateSchema.optional().describe('The end date of the project (can be date string, Date object, timestamp number, or null)'),
    status: z.enum(['todo', 'in progress', 'done']).optional().describe('The initial status of the project'),
    completedAt: dateSchema.optional().describe('When the project was completed (can be date string, Date object, timestamp number, or null)'),
    tasks: z.array(z.object({
        title: z.string().describe('The title of the task'),
        description: z.string().optional().describe('The description of the task'),
        status: z.enum(['todo', 'in progress', 'done']).optional().describe('The status of the task'),
        orderWeight: z.number().optional().describe('Ordering weight for the task'),
        dueDate: dateSchema.optional().describe('The due date for the task (can be date string, Date object, timestamp number, or null)'),
        completedAt: dateSchema.optional().describe('When the task was completed (can be date string, Date object, timestamp number, or null)'),
        subtasks: z.array(z.object({
            title: z.string().describe('The title of the subtask'),
            description: z.string().optional().describe('The description of the subtask'),
            status: z.enum(['todo', 'in progress', 'done']).optional().describe('The status of the subtask'),
            orderWeight: z.number().optional().describe('Ordering weight for the subtask'),
            dueDate: dateSchema.optional().describe('The due date for the subtask (can be date string, Date object, timestamp number, or null)'),
            completedAt: dateSchema.optional().describe('When the subtask was completed (can be date string, Date object, timestamp number, or null)'),
        })).optional().describe('Subtasks for this task'),
    })).optional().describe('Tasks included in the project'),
})

const createProjectTool = async (x: any, context: any) => {
    // Helper function to normalize urgentImportantMatrix to lowercase
    const normalizeMatrix = (value: string | undefined) => {
        if (!value) return undefined;
        // Convert to lowercase and ensure proper format
        const lower = value.toLowerCase();
        if (lower.includes('urgent') && lower.includes('important')) {
            if (lower.includes('not urgent') && lower.includes('important')) {
                return 'not urgent & important';
            } else if (lower.includes('urgent') && lower.includes('not important')) {
                return 'urgent & not important';
            } else if (lower.includes('urgent') && lower.includes('important')) {
                return 'urgent & important';
            } else if (lower.includes('not urgent') && lower.includes('not important')) {
                return 'not urgent & not important';
            }
        }
        return value; // Return original if no match
    };
    
    // Helper function to normalize date strings
    const normalizeDate = (dateStr: string | Date | number | null | undefined) => {
        if (!dateStr) return null;
        if (dateStr instanceof Date) return dateStr;
        if (typeof dateStr === 'number') return new Date(dateStr);
        if (typeof dateStr === 'string') {
            if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
                return new Date(dateStr + 'T00:00:00Z');
            }
            return new Date(dateStr);
        }
        return null;
    };
    
    // Process the input
    const processedInput = {
        ...x,
        urgentImportantMatrix: normalizeMatrix(x.urgentImportantMatrix),
        startDate: normalizeDate(x.startDate),
        endDate: normalizeDate(x.endDate),
        tasks: x.tasks?.map((task: any) => ({
            ...task,
            urgentImportantMatrix: normalizeMatrix(task.urgentImportantMatrix),
            dueDate: normalizeDate(task.dueDate),
            completedAt: normalizeDate(task.completedAt),
            subtasks: task.subtasks?.map((subtask: any) => ({
                ...subtask,
                urgentImportantMatrix: normalizeMatrix(subtask.urgentImportantMatrix),
                dueDate: normalizeDate(subtask.dueDate),
                completedAt: normalizeDate(subtask.completedAt),
            }))
        }))
    };
    
    // Set defaults for missing required fields
    const defaultPriority = 'MEDIUM';
    const defaultUrgentImportantMatrix = 'not urgent & important';
    
    const inputWithDefaults = {
        ...processedInput,
        priority: processedInput.priority || defaultPriority,
        urgentImportantMatrix: processedInput.urgentImportantMatrix || defaultUrgentImportantMatrix,
        tasks: processedInput.tasks?.map((task: any) => ({
            ...task,
            priority: task.priority || processedInput.priority || defaultPriority,
            urgentImportantMatrix: task.urgentImportantMatrix || processedInput.urgentImportantMatrix || defaultUrgentImportantMatrix,
        }))
    };
    
    const input = await projectSchema.parseAsync(inputWithDefaults);
    
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
        newProject.toJSON().id,
        'project',
        newProject.toJSON().id,
        'create',
        `Project "${newProject.toJSON().title}" created via AI`,
        context.user.id,
    )

    if (input.tasks) {
        for (const task of input.tasks) {
        const newTask = await Task.create({
            projectId: newProject.toJSON().id,
            title: task.title,
            description: task.description,
            status: task.status,
            orderWeight: task.orderWeight,
            dueDate: task.dueDate,
        })

        await addProjectHistory(
            newProject.toJSON().id,
            'task',
            newTask.toJSON().id,
            'create',
            `Task "${newTask.toJSON().title}" created via AI`,
            context.user.id,
        )

        if (task.subtasks) {
            for (const subtask of task.subtasks) {
                const newSubtask = await Subtask.create({
                    taskId: newTask.toJSON().id,
                    title: subtask.title,
                    description: subtask.description,
                    status: subtask.status,
                    orderWeight: subtask.orderWeight,
                    dueDate: subtask.dueDate,
                })
                await addProjectHistory(
                    newProject.toJSON().id,
                    'subtask',
                    newSubtask.toJSON().id,
                    'create',
                    `Subtask "${newSubtask.toJSON().title}" created via AI`,
                    context.user.id,
                )
            }
        }
    }
    }

    return `Project "${newProject.toJSON().title}" successfully created with ID: ${newProject.toJSON().id}`
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
