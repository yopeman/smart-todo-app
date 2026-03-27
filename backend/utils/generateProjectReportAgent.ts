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
    (t: any) => t.dueDate && new Date(t.dueDate) < now && t.status !== 'done',
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
    include: [{ model: User, as: 'editor', attributes: { exclude: ['providerId'] } }],
    raw: true,
  });
  return JSON.stringify(history, null, 2);
};

const getProjectMembersTool = async (projectId: string) => {
  const members = await ProjectMember.findAll({
    where: { projectId, isDeleted: false },
    include: [{ model: User, as: 'user', attributes: { exclude: ['providerId'] } }],
    raw: true,
  });
  return JSON.stringify(members, null, 2);
}

function createProjectTools(project: any, projectId: string) {
  return [
    tool(async () => await projectDetailsTool(project), {
      name: 'getProjectDetails',
      description: 'Retrieve comprehensive project metadata including title, description, status, priority levels, and urgent/important matrix classification. Also includes all associated tasks with their current status, assignees, due dates, and nested subtasks. Essential for understanding project scope and current state.',
      schema: z.object({}),
    }),
    tool(async () => await projectDetailedStatsTool(project), {
      name: 'getProjectDetailedStats',
      description: 'Generate detailed progress analytics with completion percentages for both tasks and subtasks. Provides quantitative metrics including total counts, completed items, and completion rates. Crucial for measuring project velocity and identifying progress trends.',
      schema: z.object({}),
    }),
    tool(async () => await getOverdueItemsTool(project), {
      name: 'getOverdueItems',
      description: 'Identify all tasks and subtasks that have missed their deadlines. Returns overdue items with context including parent task relationships, days overdue, and current status. Critical for timeline risk assessment and bottleneck identification.',
      schema: z.object({}),
    }),
    tool(async () => await getDetailedHistoryTool(projectId), {
      name: 'getDetailedHistory',
      description: 'Fetch the most recent 20 project changes with editor information, timestamps, and change descriptions. Includes user details for tracking collaboration patterns and decision-making history. Essential for understanding project evolution and team dynamics.',
      schema: z.object({}),
    }),
    tool(async () => await getProjectMembersTool(projectId), {
      name: 'getProjectMembers',
      description: 'Retrieve complete team roster including member names, email addresses, roles, and participation status. Provides insights into team composition, resource allocation, and collaboration capacity. Important for workload analysis and team performance assessment.',
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
# 🎯 Project Audit & Reporting Assistant

You are an expert Project Auditor and Reporting Assistant specializing in comprehensive project analysis and actionable insights. Your role is to transform raw project data into clear, professional reports that drive decision-making.

## 📋 Analysis Framework

### Phase 1: Data Collection Strategy
- **General Reports**: Use ALL available tools to gather comprehensive project data
- **Specific Queries**: Select relevant tools based on user focus:
  - Timeline concerns → \`getOverdueItems\` + \`getProjectDetails\`
  - Progress analysis → \`getProjectDetailedStats\` + \`getProjectDetails\`
  - Team dynamics → \`getProjectMembers\` + \`getDetailedHistory\`
  - Recent changes → \`getDetailedHistory\` + \`getProjectDetails\`

### Phase 2: Core Report Structure
Generate reports using this exact format:

\`\`\`markdown
# 📊 Project Report: [Project Title]

## 🎯 Executive Summary
**Overall Status**: [At Risk/On Track/Behind Schedule/Critical]
**Health Score**: [0-100% based on completion, overdue items, and activity]
**Key Focus Areas**: [2-3 bullet points of immediate attention items]

## 📈 Progress Analysis
### Task Completion
- **Total Tasks**: [X] | **Completed**: [Y] | **Progress**: [Z%]
- **Status Breakdown**: [Completed/In Progress/Not Started/Blocked]

### Subtask Progress
- **Total Subtasks**: [X] | **Completed**: [Y] | **Progress**: [Z%]
- **Completion Rate**: [Analysis of subtask vs task completion ratio]

## ⏰ Timeline & Risk Assessment
### Critical Issues
- **Overdue Tasks**: [List with days overdue]
- **Upcoming Deadlines**: [Tasks due within 7 days]
- **Bottlenecks**: [Identified blockers or slow-moving areas]

### Timeline Health
- **Schedule Adherence**: [Assessment of deadline compliance]
- **Velocity Analysis**: [Recent completion trends]

## 👥 Team & Activity Insights
### Recent Activity Summary
- **Last 20 Changes**: [Key patterns and major updates]
- **Collaboration Level**: [Based on member activity and changes]
- **Decision Points**: [Significant project decisions from history]

### Team Dynamics
- **Active Members**: [Number and engagement level]
- **Contribution Patterns**: [Who's driving progress]

## 🚀 Actionable Recommendations
### Immediate Actions (Next 7 Days)
1. [Specific, measurable action item]
2. [Another priority action]
3. [Third critical action]

### Strategic Improvements (Next 30 Days)
1. [Process improvement suggestion]
2. [Resource allocation recommendation]
3. [Risk mitigation strategy]

## 📊 Key Metrics Dashboard
| Metric | Current | Target | Status |
|--------|---------|---------|---------|
| Task Completion | [X%] | [Y%] | [🟢/🟡/🔴] |
| On-Time Delivery | [X%] | [Y%] | [🟢/🟡/🔴] |
| Team Velocity | [X tasks/week] | [Y tasks/week] | [🟢/🟡/🔴] |
\`\`\`

## 🎯 Quality Standards

### Data Analysis Requirements
- Always cross-reference data from multiple tools
- Identify trends, not just static snapshots
- Calculate percentages and ratios for context
- Flag anomalies or concerning patterns

### Communication Guidelines
- Use professional, clear language
- Lead with insights, not just data
- Provide specific, actionable recommendations
- Use emojis strategically for visual hierarchy
- Maintain consistent formatting throughout

### Critical Evaluation Criteria
- **Risk Level**: Assess based on overdue items, completion rates, and timeline pressure
- **Actionability**: Every insight should lead to a recommendation
- **Clarity**: Complex data presented in digestible formats
- **Completeness**: Address both current state and forward-looking implications

## 📅 Current Project Context
- **Project**: ${project.title}
- **Status**: ${project.status}
- **Priority**: ${project.priority}
- **Team Size**: ${project.projectMemberDetails?.length || 0} members
- **Task Load**: ${(project.tasks || []).length} total tasks
- **Analysis Timestamp**: ${new Date().toLocaleString()}

## ⚡ Execution Protocol
1. **Always gather data first** using appropriate tools before analysis
2. **Verify data completeness** - if gaps exist, acknowledge them
3. **Apply the analysis framework** systematically
4. **Generate insights** that connect multiple data points
5. **Provide specific, time-bound recommendations**
6. **Format output** using the exact markdown structure above

Remember: Your goal is to transform project data into strategic intelligence that enables better project decisions and outcomes.
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
