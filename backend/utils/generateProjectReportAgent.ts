import { Project, Task, Subtask, ProjectHistory, ProjectMember, AIInteraction, User } from "../models";
import { ChatOllama } from '@langchain/ollama'
import { createDeepAgent } from 'deepagents'
import * as z from 'zod'
import { HumanMessage, AIMessage } from "@langchain/core/messages";

const projectDetailedStatsTool = async (project: any) => {
    const tasks = project.tasks || [];
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t: any) => t.status === 'done').length;

    let totalSubtasks = 0;
    let completedSubtasks = 0;

    tasks.forEach((task: any) => {
        const subtasks = (task as any).subtasks || [];
        totalSubtasks += subtasks.length;
        completedSubtasks += subtasks.filter((st: any) => st.status === 'done').length;
    });

    return JSON.stringify({
        project: {
            title: project.title,
            status: project.status,
            priority: project.priority,
            matrix: project.urgentImportantMatrix
        },
        stats: {
            tasks: { total: totalTasks, completed: completedTasks, percent: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0 },
            subtasks: { total: totalSubtasks, completed: completedSubtasks, percent: totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0 }
        }
    }, null, 2);
}

const getOverdueItemsTool = async (project: any) => {
    const now = new Date();
    const overdueTasks = (project.tasks || []).filter((t: any) => t.dueDate && new Date(t.dueDate) < now && t.status !== 'done');

    const overdueSubtasks: any[] = [];
    (project.tasks || []).forEach((task: any) => {
        const subtasks = (task as any).subtasks || [];
        subtasks.forEach((st: any) => {
            if (st.dueDate && new Date(st.dueDate) < now && st.status !== 'done') {
                overdueSubtasks.push({ taskTitle: task.title, ...st.toJSON() });
            }
        });
    });

    return JSON.stringify({ overdueTasks, overdueSubtasks }, null, 2);
}

const getDetailedHistoryTool = async (project: any) => {
    const history = await ProjectHistory.findAll({
        where: { projectId: project.id, isDeleted: false },
        order: [['createdAt', 'DESC']],
        limit: 20,
        include: [{ model: User, as: 'editor', attributes: ['username', 'email'] }]
    });
    return JSON.stringify(history, null, 2);
}

const tools = (project: any) => [
    {
        name: 'getProjectDetailedStats',
        description: 'Get project progress statistics (tasks, subtasks, percentages).',
        func: () => projectDetailedStatsTool(project)
    },
    {
        name: 'getOverdueItems',
        description: 'Identify tasks and subtasks that are overdue.',
        func: () => getOverdueItemsTool(project)
    },
    {
        name: 'getDetailedHistory',
        description: 'Get the last 20 changes made to the project.',
        func: () => getDetailedHistoryTool(project)
    }
];

const reportProject: (input: any, context: any) => Promise<AIInteraction> = async (input: any, context: any) => {
    const llm = new ChatOllama({ model: 'qwen2.5:0.5b' })

    const project = await Project.findOne({
        where: { id: input.project_id, isDeleted: false },
        include: [
            {
                model: Task,
                as: 'tasks',
                include: [{ model: Subtask, as: 'subtasks' }]
            },
            {
                model: ProjectMember,
                as: 'projectMemberDetails',
                include: [{ model: User, as: 'user' }]
            }
        ]
    });

    if (!project) throw new Error('Project not found');

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
- Members Count: ${(project as any).projectMemberDetails?.length || 0}
- Total Tasks Count: ${((project as any).tasks || []).length}

Use the tools to dive deeper before finalizing the report.
Current Time: ${new Date().toLocaleString()}
`.trim();

    const agent = createDeepAgent({ model: llm, tools: tools(project), systemPrompt: systemPrompt });

    // Fetch history for context
    const whereClose: any = { userId: context.user.id, projectId: input.project_id, isDeleted: false };
    if (input.parent_interaction_id) whereClose.parentInteractionId = input.parent_interaction_id;

    const histories = await AIInteraction.findAll({
        where: whereClose,
        order: [['createdAt', 'DESC']],
        limit: 5,
    });

    const chatHistory = histories.reverse().flatMap(h => [
        new HumanMessage(h.prompt),
        new AIMessage(h.response)
    ]);

    const agentResponse = await agent.invoke({
        input: input.prompt,
        chat_history: chatHistory
    });

    return await AIInteraction.create({
        ...input,
        userId: context.user.id,
        actionType: 'report',
        response: typeof agentResponse === 'string' ? agentResponse : JSON.stringify(agentResponse),
        metadata: typeof agentResponse === 'object' ? agentResponse : { content: agentResponse }
    });
}

export default reportProject