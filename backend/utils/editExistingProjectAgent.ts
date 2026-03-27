import { Project, Task, Subtask, ProjectHistory, ProjectMember, AIInteraction, User } from "../models";
import addProjectHistory from "./addProjectHistory";
import { ChatOllama } from '@langchain/ollama';
import { ChatGroq } from "@langchain/groq";
import { createAgent } from 'langchain';
import { tool } from '@langchain/core/tools';
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import * as z from 'zod';


const projectUpdateSchema = z.object({
    id: z.string().describe('The id of the project to update'),
    title: z.string().optional().describe('The title of the project'),
    description: z.string().optional().describe('The description of the project'),
    priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).optional().describe('The priority of the project'),
    urgentImportantMatrix: z.enum(['urgent & important', 'urgent & not important', 'not urgent & important', 'not urgent & not important']).optional().describe('The urgent important matrix of the project'),
    successCriteria: z.array(z.string()).optional().describe('The success criteria of the project'),
    isPublic: z.boolean().optional().describe('The is public of the project'),
    startDate: z.union([z.date(), z.string().transform((str) => new Date(str)), z.number().transform((num) => new Date(num)), z.null()]).optional().describe('The start date of the project (can be date string, Date object, timestamp number, or null)'),
    endDate: z.union([z.date(), z.string().transform((str) => new Date(str)), z.number().transform((num) => new Date(num)), z.null()]).optional().describe('The end date of the project (can be date string, Date object, timestamp number, or null)'),
    status: z.enum(['todo', 'in progress', 'done']).optional().describe('The status of the project'),
    completedAt: z.union([z.date(), z.string().transform((str) => new Date(str)), z.number().transform((num) => new Date(num)), z.null()]).optional().describe('The completed at of the project (can be date string, Date object, timestamp number, or null)'),
    isDeleted: z.boolean().optional().describe('The is deleted of the project'),
    deletedAt: z.union([z.date(), z.string().transform((str) => new Date(str)), z.number().transform((num) => new Date(num)), z.null()]).optional().describe('The deleted at of the project (can be date string, Date object, timestamp number, or null)'),
})

const taskCreateSchema = z.object({
    projectId: z.string().describe('The id of the project to update'),
    title: z.string().describe('The title of the task'),
    description: z.string().optional().describe('The description of the task'),
    status: z.enum(['todo', 'in progress', 'done']).optional().describe('The status of the task'),
    orderWeight: z.number().optional().describe('The order weight of the task'),
    dueDate: z.union([z.date(), z.string().transform((str) => new Date(str)), z.number().transform((num) => new Date(num)), z.null()]).optional().describe('The due date of the task (can be date string, Date object, timestamp number, or null)'),
    completedAt: z.union([z.date(), z.string().transform((str) => new Date(str)), z.number().transform((num) => new Date(num)), z.null()]).optional().describe('The completed at of the task (can be date string, Date object, timestamp number, or null)'),
})

const subtaskCreateSchema = z.object({
    taskId: z.string().describe('The id of the task to update'),
    title: z.string().describe('The title of the subtask'),
    description: z.string().optional().describe('The description of the subtask'),
    status: z.enum(['todo', 'in progress', 'done']).optional().describe('The status of the subtask'),
    orderWeight: z.number().optional().describe('The order weight of the subtask'),
    dueDate: z.union([z.date(), z.string().transform((str) => new Date(str)), z.number().transform((num) => new Date(num)), z.null()]).optional().describe('The due date of the subtask (can be date string, Date object, timestamp number, or null)'),
    completedAt: z.union([z.date(), z.string().transform((str) => new Date(str)), z.number().transform((num) => new Date(num)), z.null()]).optional().describe('The completed at of the subtask (can be date string, Date object, timestamp number, or null)'),
})

const taskUpdateSchema = z.object({
    id: z.string().describe('The id of the task to update'),
    projectId: z.string().describe('The id of the project to update'),
    title: z.string().optional().describe('The title of the task'),
    description: z.string().optional().describe('The description of the task'),
    status: z.enum(['todo', 'in progress', 'done']).optional().describe('The status of the task'),
    orderWeight: z.number().optional().describe('The order weight of the task'),
    dueDate: z.union([z.date(), z.string().transform((str) => new Date(str)), z.number().transform((num) => new Date(num)), z.null()]).optional().describe('The due date of the task (can be date string, Date object, timestamp number, or null)'),
    completedAt: z.union([z.date(), z.string().transform((str) => new Date(str)), z.number().transform((num) => new Date(num)), z.null()]).optional().describe('The completed at of the task (can be date string, Date object, timestamp number, or null)'),
    isDeleted: z.boolean().optional().describe('The is deleted of the task'),
    deletedAt: z.union([z.date(), z.string().transform((str) => new Date(str)), z.number().transform((num) => new Date(num)), z.null()]).optional().describe('The deleted at of the task (can be date string, Date object, timestamp number, or null)'),
})

const subtaskUpdateSchema = z.object({
    id: z.string().describe('The id of the subtask to update'),
    taskId: z.string().describe('The id of the task to update'),
    title: z.string().optional().describe('The title of the subtask'),
    description: z.string().optional().describe('The description of the subtask'),
    status: z.enum(['todo', 'in progress', 'done']).optional().describe('The status of the subtask'),
    orderWeight: z.number().optional().describe('The order weight of the subtask'),
    dueDate: z.union([z.date(), z.string().transform((str) => new Date(str)), z.number().transform((num) => new Date(num)), z.null()]).optional().describe('The due date of the subtask (can be date string, Date object, timestamp number, or null)'),
    completedAt: z.union([z.date(), z.string().transform((str) => new Date(str)), z.number().transform((num) => new Date(num)), z.null()]).optional().describe('The completed at of the subtask (can be date string, Date object, timestamp number, or null)'),
    isDeleted: z.boolean().optional().describe('The is deleted of the subtask'),
    deletedAt: z.union([z.date(), z.string().transform((str) => new Date(str)), z.number().transform((num) => new Date(num)), z.null()]).optional().describe('The deleted at of the subtask (can be date string, Date object, timestamp number, or null)'),
})


const projectDetailsTool = async (projectId: string) => {
  const project = await Project.findOne({
    where: { id: projectId, isDeleted: false },
    include: [
      {
        model: Task,
        as: 'tasks',
        include: [
          {
            model: Subtask,
            as: 'subtasks'
          }
        ]
      }
    ],
    raw: true
  });

  return JSON.stringify(project, null, 2)
}

const editProjectTool = async (x: any, context: any) => {
    const input = await projectUpdateSchema.parseAsync(x)

    const project = await Project.findByPk(input.id)
    if (!project) return 'Error: Project not found with the provided "id". Please verify the id is correct.'

    const prev = project.toJSON()
    const updatedProject = await project.update(input)
    const row = updatedProject.toJSON()
    const userId = context.user.id

    if (input.isDeleted === true) {
        await addProjectHistory(input.id, 'project', input.id, 'delete', `Project "${row.title}" deleted via AI`, userId)
    } else if (input.status !== undefined && input.status !== prev.status) {
        const otherKeys = Object.keys(input).filter(
            (k) => k !== 'id' && k !== 'status' && (input as any)[k] !== undefined && (input as any)[k] !== (prev as any)[k],
        )
        const detail =
            otherKeys.length > 0
                ? `Status ${prev.status} → ${row.status}; also: ${otherKeys.join(', ')}`
                : `Status changed from ${prev.status} to ${row.status}`
        await addProjectHistory(
            input.id,
            'project',
            input.id,
            otherKeys.length ? 'update' : 'status change',
            detail,
            userId,
        )
    } else {
        const keys = Object.keys(input).filter(
            (k) => k !== 'id' && (input as any)[k] !== undefined && (input as any)[k] !== (prev as any)[k],
        )
        if (keys.length > 0) {
            await addProjectHistory(
                input.id,
                'project',
                input.id,
                'update',
                `Updated via AI: ${keys.join(', ')}`,
                userId,
            )
        }
    }

    return `Project updated successfully: \n\n${JSON.stringify(row, null, 2)}`
}


const addNewTaskTool = async (x: any, context: any) => {
    const input = await taskCreateSchema.parseAsync(x)

    const project = await Project.findByPk(input.projectId)
    if (!project) return 'Error: Project not found with the provided "projectId".'

    const newTask = await Task.create(input)
    const row = newTask.toJSON()
    await addProjectHistory(
        input.projectId,
        'task',
        row.id,
        'create',
        `Task "${row.title}" created via AI`,
        context.user.id,
    )
    return `Task created successfully: \n\n${JSON.stringify(row, null, 2)}`
}


const editTaskTool = async (x: any, context: any) => {
    const input = await taskUpdateSchema.parseAsync(x)

    const task = await Task.findByPk(input.id)
    if (!task) return 'Error: Task not found with the provided "id". Please verify the id.'

    const prev = task.toJSON()
    const projectId = task.projectId
    const updatedTask = await task.update(input)
    const row = updatedTask.toJSON()
    const userId = context.user.id

    if (input.isDeleted === true) {
        await addProjectHistory(projectId, 'task', input.id, 'delete', `Task "${row.title}" deleted via AI`, userId)
    } else if (input.status !== undefined && input.status !== prev.status) {
        const otherKeys = Object.keys(input).filter(
            (k) =>
                k !== 'id' &&
                k !== 'projectId' &&
                k !== 'status' &&
                (input as any)[k] !== undefined &&
                (input as any)[k] !== (prev as any)[k],
        )
        await addProjectHistory(
            projectId,
            'task',
            input.id,
            otherKeys.length ? 'update' : 'status change',
            otherKeys.length
                ? `Status ${prev.status} → ${row.status}; also: ${otherKeys.join(', ')}`
                : `Status changed from ${prev.status} to ${row.status}`,
            userId,
        )
    } else {
        const keys = Object.keys(input).filter(
            (k) =>
                k !== 'id' &&
                k !== 'projectId' &&
                (input as any)[k] !== undefined &&
                (input as any)[k] !== (prev as any)[k],
        )
        if (keys.length > 0) {
            await addProjectHistory(
                projectId,
                'task',
                input.id,
                'update',
                `Updated via AI: ${keys.join(', ')}`,
                userId,
            )
        }
    }

    return `Task updated successfully: \n\n${JSON.stringify(row, null, 2)}`
}

const addNewSubtaskTool = async (x: any, context: any) => {
    const input = await subtaskCreateSchema.parseAsync(x)

    const task = await Task.findByPk(input.taskId)
    if (!task) return 'Error: Parent task not found. Cannot add subtask.'

    const newSubtask = await Subtask.create(input)
    const row = newSubtask.toJSON()
    await addProjectHistory(
        task.projectId,
        'subtask',
        row.id,
        'create',
        `Subtask "${row.title}" created via AI`,
        context.user.id,
    )
    return `Subtask created successfully: \n\n${JSON.stringify(row, null, 2)}`
}

const editSubtaskTool = async (x: any, context: any) => {
    const input = await subtaskUpdateSchema.parseAsync(x)

    const subtask = await Subtask.findByPk(input.id)
    if (!subtask) return 'Error: Subtask not found. Please check the id.'

    const parentTask = await Task.findByPk(subtask.taskId)
    if (!parentTask) return 'Error: Parent task not found.'

    const prev = subtask.toJSON()
    const projectId = parentTask.projectId
    const updatedSubtask = await subtask.update(input)
    const row = updatedSubtask.toJSON()
    const userId = context.user.id

    if (input.isDeleted === true) {
        await addProjectHistory(projectId, 'subtask', input.id, 'delete', `Subtask "${row.title}" deleted via AI`, userId)
    } else if (input.status !== undefined && input.status !== prev.status) {
        const otherKeys = Object.keys(input).filter(
            (k) =>
                k !== 'id' &&
                k !== 'taskId' &&
                k !== 'status' &&
                (input as any)[k] !== undefined &&
                (input as any)[k] !== (prev as any)[k],
        )
        await addProjectHistory(
            projectId,
            'subtask',
            input.id,
            otherKeys.length ? 'update' : 'status change',
            otherKeys.length
                ? `Status ${prev.status} → ${row.status}; also: ${otherKeys.join(', ')}`
                : `Status changed from ${prev.status} to ${row.status}`,
            userId,
        )
    } else {
        const keys = Object.keys(input).filter(
            (k) =>
                k !== 'id' &&
                k !== 'taskId' &&
                (input as any)[k] !== undefined &&
                (input as any)[k] !== (prev as any)[k],
        )
        if (keys.length > 0) {
            await addProjectHistory(
                projectId,
                'subtask',
                input.id,
                'update',
                `Updated via AI: ${keys.join(', ')}`,
                userId,
            )
        }
    }

    return `Subtask updated successfully: \n\n${JSON.stringify(row, null, 2)}`
}

const currentTimestamp = () => {
    return `Current timestamp: ${new Date().toLocaleString()}`
}

function createProjectTools(project: any, projectId: string, context: any) {
  return [
    tool(async () => await projectDetailsTool(projectId), {
      name: 'getProjectDetails',
      description: 'Retrieve comprehensive project metadata including title, description, status, priority levels, and urgent/important matrix classification. Also includes all associated tasks with their current status, assignees, due dates, and nested subtasks. Essential for understanding project scope and current state.',
      schema: z.object({}),
    }),
    tool(async (x) => await editProjectTool(x, context), {
      name: 'editProject',
      description: 'Update project details like title, description, priority, status, and other project-level properties. Use this for making changes to the main project configuration.',
      schema: projectUpdateSchema,
    }),
    tool(async (x) => await addNewTaskTool(x, context), {
      name: 'addNewTask',
      description: 'Add a new task to the project. Requires projectId, title, and optional details like description, status, due date, and order weight.',
      schema: taskCreateSchema,
    }),
    tool(async (x) => await editTaskTool(x, context), {
      name: 'editTask',
      description: 'Edit an existing task in the project. Update task properties like title, description, status, due date, or mark as deleted.',
      schema: taskUpdateSchema,
    }),
    tool(async (x) => await addNewSubtaskTool(x, context), {
      name: 'addNewSubtask',
      description: 'Add a new subtask to an existing task. Requires taskId, title, and optional details like description, status, and due date.',
      schema: subtaskCreateSchema,
    }),
    tool(async (x) => await editSubtaskTool(x, context), {
      name: 'editSubtask',
      description: 'Edit an existing subtask. Update subtask properties like title, description, status, due date, or mark as deleted.',
      schema: subtaskUpdateSchema,
    }),
    tool(currentTimestamp, {
      name: 'currentTimestamp',
      description: 'Get the current date and time for reference when setting deadlines or tracking time-based status.',
      schema: z.object({}),
    }),
  ];
}


const editProject: (input: any, context: any) => Promise<AIInteraction> = async (input: any, context: any) => {
    try {
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
            ],
            raw: true
        }) as any
        if (!project) throw new Error('Project not found')

        const llm = new ChatGroq({ model: 'llama-3.3-70b-versatile' });
        // const llm = new ChatOllama({ model: 'llama3.2:3b' })

        const systemPrompt = `
# 🔧 Project Editing & Management Assistant

You are an expert Project Management Assistant specializing in precise, safe project modifications. Your role is to help users edit their existing projects with accuracy and proper validation.

## 📋 Editing Framework

### Phase 1: Pre-Flight Validation
- **Specificity Check**: Verify user requests are specific enough to act upon safely
  - ✅ Good: "Change status of 'Research' task to 'in progress'"
  - ❌ Bad: "change the task" (ambiguous)
- **ID Verification**: Always cross-reference IDs from the current project data
- **Impact Assessment**: Consider how changes affect dependent tasks/subtasks

### Phase 2: Data Collection Strategy
- **Always start with \`getProjectDetails\`** to understand current state
- **Use specific tools** based on user intent:
  - Project-level changes → \`editProject\`
  - Task modifications → \`editTask\` or \`addNewTask\`
  - Subtask operations → \`editSubtask\` or \`addNewSubtask\`
  - Time references → \`currentTimestamp\`

### Phase 3: Execution Protocol
1. **Gather current data** using \`getProjectDetails\`
2. **Validate request specificity** - ask for clarification if needed
3. **Execute changes** using appropriate tools
4. **Confirm results** with user

## 🎯 Interaction Guidelines

### Communication Standards
- Be concise and professional
- Confirm actions before execution when risks are involved
- Provide clear feedback on what was changed
- Use current timestamp for deadline calculations

### Safety Protocols
- Never assume which task/subtask user means - ask for clarification
- Verify all IDs exist before attempting operations
- Consider cascading effects (e.g., deleting a task affects subtasks)
- Maintain data integrity with proper validation

### Error Handling
- If an operation fails, explain why clearly
- Suggest alternative approaches when possible
- Guide users toward specific, actionable requests

## 📊 Current Project Context
- **Project**: ${project.title}
- **Status**: ${project.status}
- **Priority**: ${project.priority}
- **Total Tasks**: ${(project.tasks || []).length}
- **Current Time**: ${new Date().toLocaleString()}
- **Your Role**: Assist with precise, validated project modifications

## ⚡ Execution Protocol
1. **Always call \`getProjectDetails\` first** to understand current state
2. **Verify request specificity** - ask for clarification if ambiguous
3. **Use appropriate tools** for the specific modification needed
4. **Provide clear confirmation** of changes made
5. **Handle errors gracefully** with helpful guidance

Remember: Your goal is to help users modify their projects safely and efficiently with proper validation and clear communication.
`.trim();

        const tools = createProjectTools(project, input.project_id, context);
        const agent = createAgent({ model: llm, tools: tools, systemPrompt: systemPrompt });

        let chatHistory: (HumanMessage | AIMessage)[] = [];
        if (input.parent_interaction_id) {
            const histories = await AIInteraction.findAll({
                where: {
                    userId: context.user.id,
                    projectId: input.project_id,
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
            projectId: input.project_id,
            userId: context.user.id,
            parentInteractionId: input.parent_interaction_id,
            actionType: 'edit',
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
        console.error('Error in edit project agent:', error);
        throw error;
    }
}

export default editProject
