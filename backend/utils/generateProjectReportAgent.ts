import { Project, Task, Subtask, ProjectHistory, ProjectMember, AIInteraction, User } from "../models";
import { ChatOllama } from '@langchain/ollama';
import { ChatGroq } from '@langchain/groq';
import { tool } from '@langchain/core/tools';
import { createAgent } from 'langchain';
import { HumanMessage, AIMessage } from '@langchain/core/messages';
import * as z from 'zod';

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

const projectDetailedStatsTool = async (project: any) => {
  const tasks = project.tasks || [];
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t: any) => t.status === 'done').length;

  let totalSubtasks = 0;
  let completedSubtasks = 0;

  tasks.forEach((task: any) => {
    const subtasks = task.subtasks || [];
    totalSubtasks += subtasks.length;
    completedSubtasks += subtasks.filter((st: any) => st.status === 'done').length;
  });

  const stats = {
      project: {
        title: project.title,
        status: project.status,
        priority: project.priority,
        matrix: project.urgentImportantMatrix,
      },
      stats: {
        tasks: {
          total: totalTasks,
          completed: completedTasks,
          percent: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
        },
        subtasks: {
          total: totalSubtasks,
          completed: completedSubtasks,
          percent: totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0,
        },
      },
    };

  return JSON.stringify(stats, null, 2);
};

const getOverdueItemsTool = async (project: any) => {
  const now = new Date();
  const overdueTasks = (project.tasks || []).filter(
    (t: Task) => t.dueDate && new Date(t.dueDate) < now && t.status !== 'done',
  );

  const overdueSubtasks: any[] = [];
  (project.tasks || []).forEach((task: any) => {
    (task.subtasks || []).forEach((st: any) => {
      if (st.dueDate && new Date(st.dueDate) < now && st.status !== 'done') {
        overdueSubtasks.push({ taskTitle: task.title, ...st });
      }
    });
  });

  const overdue = { overdueTasks, overdueSubtasks };

  return JSON.stringify(overdue, null, 2);
};

const getDetailedHistoryTool = async (projectId: string) => {
  const history = await ProjectHistory.findAll({
    where: { projectId, isDeleted: false },
    order: [['createdAt', 'DESC']],
    limit: 20,
    include: [{ model: User, as: 'editor', attributes: ['name', 'email'] }],
    raw: true,
  });
  return JSON.stringify(history, null, 2);
};

const getProjectMembersTool = async (projectId: string) => {
  const members = await ProjectMember.findAll({
    where: { projectId, isDeleted: false },
    include: [{ model: User, as: 'user', attributes: ['name', 'email'] }],
    raw: true,
  });
  return JSON.stringify(members, null, 2);
}

function createProjectTools(project: any, projectId: string) {
  return [
    tool(async () => await projectDetailsTool(project), {
      name: 'getProjectDetails',
      description: 'Get project, tasks and subtasks details (title, description, status, etc.).',
      schema: z.object({}),
    }),
    tool(async () => await projectDetailedStatsTool(project), {
      name: 'getProjectDetailedStats',
      description: 'Get project progress statistics (tasks, subtasks, percentages).',
      schema: z.object({}),
    }),
    tool(async () => await getOverdueItemsTool(project), {
      name: 'getOverdueItems',
      description: 'Identify tasks and subtasks that are overdue.',
      schema: z.object({}),
    }),
    tool(async () => await getDetailedHistoryTool(projectId), {
      name: 'getDetailedHistory',
      description: 'Get the last 20 changes made to the project.',
      schema: z.object({}),
    }),
    tool(async () => await getProjectMembersTool(projectId), {
      name: 'getProjectMembers',
      description: 'Get the list of members in the project.',
      schema: z.object({}),
    }),
  ];
}

export const reportProject = async (input: any, context: any): Promise<AIInteraction> => {
  try {
    const project = await Project.findOne({ where: { id: input.project_id, isDeleted: false }, raw: true }) as any;
    const projectId = input.project_id;

    // const llm = new ChatGroq({ model: 'llama-3.3-70b-versatile' });
    const llm = new ChatOllama({ model: 'llama3.2:3b' })

    const systemPrompt = `
You are an expert Project Auditor and Reporting Assistant. Your goal is to analyze the project data and generate a comprehensive, professional report.

### CRITICAL: PRE-FLIGHT CHECK
Before generating the report, evaluate if you have enough information to fulfill the user's specific request.
- If the user asks for a general report, use all tools to gather data.
- If the user asks for specific aspects (e.g., "how is the timeline?"), focus on the relevant tools like "getOverdueItems".
- Ensure the report is formatted in clear Markdown.

### Report Components:
1. **Executive Summary**: High-level status (At Risk, On Track, Behind).
2. **Progress Analysis**: Task and subtask completion status.
3. **Timeline & Bottlenecks**: Highlights any overdue items or slow progress.
4. **Recent Activity**: Major changes from the history.
5. **Recommendations**: Actionable steps for the project owner.

### Current Project Data Overview:
- Title: ${project.title}
- Status: ${project.status}
- Members Count: ${project.projectMemberDetails?.length || 0}
- Total Tasks Count: ${(project.tasks || []).length}

Use the tools to dive deeper before finalizing the report.
Current Time: ${new Date().toLocaleString()}
`.trim();

    const tools = createProjectTools(project, projectId);
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
      actionType: 'report',
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
    console.error('Error in report generator agent:', error);
    throw error;
  }
};

export default reportProject;
