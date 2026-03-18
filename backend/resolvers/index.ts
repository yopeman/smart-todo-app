import * as userResolver from './users'
import * as projectResolver from './projects'
import * as taskResolver from './tasks'
import * as subtaskResolver from './subtasks'
import * as projectMemberResolver from './projectMembers'
import * as aiInteractionResolver from './aiInteractions'

const resolvers = {
    Query: {
        // User queries
        user: (_: any, { id }: { id: string }) => userResolver.user(id),
        users: () => userResolver.users(),
        me: (_: any, __: any, context: any) => userResolver.me(context),

        // Project queries
        project: (_: any, { id }: { id: string }, context: any) => projectResolver.project(id, context),
        projects: (_: any, { status, is_public, owner_id }: { status?: any, is_public?: boolean, owner_id?: string }, context: any) => projectResolver.projects(context, status, is_public, owner_id),
        my_projects: (_: any, __: any, context: any) => projectResolver.my_projects(context),
        shared_projects: (_: any, __: any, context: any) => projectResolver.shared_projects(context),

        // Task queries
        task: (_: any, { id }: { id: string }, context: any) => taskResolver.task(id, context),
        tasks: (_: any, { project_id, status }: { project_id?: string, status?: any }, context: any) =>
            taskResolver.tasks(project_id, status, context),

        // Subtask queries
        subtask: (_: any, { id }: { id: string }, context: any) => subtaskResolver.subtask(id, context),
        subtasks: (_: any, { task_id, status }: { task_id: string, status?: any }, context: any) =>
            subtaskResolver.subtasks(task_id, status, context),

        // Project member queries
        projectMembers: (_: any, { project_id }: { project_id: string }, context: any) =>
            projectMemberResolver.projectMembers(project_id, context),

        // Project history queries
        projectHistories: (_: any, { project_id, entity_type, change_type }: { project_id: string, entity_type?: any, change_type?: any }) => { },

        // AI interaction queries
        aiInteractions: (_: any, { project_id, action_type }: { project_id?: string, action_type?: any }, context: any) =>
            aiInteractionResolver.aiInteractions(project_id, action_type, context),
        aiInteraction: (_: any, { id }: { id: string }, context: any) => aiInteractionResolver.aiInteraction(id, context),
    },

    Mutation: {
        // User mutations
        deleteMe: (_: any, __: any, context: any) => userResolver.deleteMe(context),

        // Project mutations
        createProject: (_: any, { input }: { input: any }, context: any) => projectResolver.createProject(input, context),
        updateProject: (_: any, { id, input }: { id: string, input: any }, context: any) => projectResolver.updateProject(id, input, context),
        deleteProject: (_: any, { id }: { id: string }, context: any) => projectResolver.deleteProject(id, context),

        // Task mutations
        createTask: (_: any, { input }: { input: any }, context: any) => taskResolver.createTask(input, context),
        updateTask: (_: any, { id, input }: { id: string, input: any }, context: any) => taskResolver.updateTask(id, input, context),
        deleteTask: (_: any, { id }: { id: string }, context: any) => taskResolver.deleteTask(id, context),
        reorderTasks: (_: any, { task_order }: { task_order: string[] }, context: any) => taskResolver.reorderTasks(task_order, context),

        // Subtask mutations
        createSubtask: (_: any, { input }: { input: any }, context: any) => subtaskResolver.createSubtask(input, context),
        updateSubtask: (_: any, { id, input }: { id: string, input: any }, context: any) => subtaskResolver.updateSubtask(id, input, context),
        deleteSubtask: (_: any, { id }: { id: string }, context: any) => subtaskResolver.deleteSubtask(id, context),
        reorderSubtasks: (_: any, { subtask_order }: { subtask_order: string[] }, context: any) =>
            subtaskResolver.reorderSubtasks(subtask_order, context),

        // Project member mutations
        addProjectMember: (_: any, { input }: { input: any }, context: any) =>
            projectMemberResolver.addProjectMember(input, context),
        updateProjectMember: (_: any, { id, input }: { id: string, input: any }, context: any) =>
            projectMemberResolver.updateProjectMember(id, input, context),
        removeProjectMember: (_: any, { id }: { id: string }, context: any) =>
            projectMemberResolver.removeProjectMember(id, context),

        // AI interaction mutations
        createAIInteraction: (_: any, { input }: { input: any }, context: any) =>
            aiInteractionResolver.createAIInteraction(input, context),

        // Status mutations
        updateProjectStatus: (_: any, { id, status }: { id: string, status: any }, context: any) =>
            projectResolver.updateProjectStatus(id, status, context),
        updateTaskStatus: (_: any, { id, status }: { id: string, status: any }, context: any) =>
            taskResolver.updateTaskStatus(id, status, context),
        updateSubtaskStatus: (_: any, { id, status }: { id: string, status: any }, context: any) =>
            subtaskResolver.updateSubtaskStatus(id, status, context),
    },

    Subscription: {
        projectUpdated: {
            subscribe: (_: any, { project_id }: { project_id: string }) => { },
        },
        taskUpdated: {
            subscribe: (_: any, { project_id }: { project_id: string }) => { },
        },
        subtaskUpdated: {
            subscribe: (_: any, { task_id }: { task_id: string }) => { },
        },
        projectHistoryAdded: {
            subscribe: (_: any, { project_id }: { project_id: string }) => { },
        },
        aiResponseReceived: {
            subscribe: (_: any, { interaction_id }: { interaction_id: string }) => { },
        },
    },

    // Type Resolvers
    User: userResolver.userType,
    Project: projectResolver.projectType,
    Task: taskResolver.taskType,
    Subtask: subtaskResolver.subtaskType,
    ProjectMember: projectMemberResolver.projectMemberType,
    AIInteraction: aiInteractionResolver.aiInteractionType,

    ProjectHistory: {
        project: (history: any) => { },
        changer: (history: any) => { },
    },
}

export default resolvers