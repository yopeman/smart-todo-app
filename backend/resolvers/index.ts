import * as userResolver from './users'

const resolvers = {
    Query: {
        // User queries
        user: (_: any, { id }: { id: string }) => userResolver.user(id),
        users: () => userResolver.users(),
        me: (_: any, __: any, context: any) => userResolver.me(context),

        // Project queries
        project: (_: any, { id }: { id: string }) => { },
        projects: (_: any, { status, is_public, owner_id }: { status?: any, is_public?: boolean, owner_id?: string }) => { },
        my_projects: () => { },
        shared_projects: () => { },

        // Task queries
        task: (_: any, { id }: { id: string }) => { },
        tasks: (_: any, { project_id, status, parent_task_id }: { project_id?: string, status?: any, parent_task_id?: string }) => { },

        // Project member queries
        projectMembers: (_: any, { project_id }: { project_id: string }) => { },

        // Project history queries
        projectHistories: (_: any, { project_id, entity_type, change_type }: { project_id: string, entity_type?: any, change_type?: any }) => { },

        // AI interaction queries
        aiInteractions: (_: any, { project_id, action_type }: { project_id?: string, action_type?: any }) => { },
        aiInteraction: (_: any, { id }: { id: string }) => { },
    },

    Mutation: {
        // User mutations
        deleteMe: (_: any, __: any, context: any) => userResolver.deleteMe(context),

        // Project mutations
        createProject: (_: any, { input }: { input: any }) => { },
        updateProject: (_: any, { id, input }: { id: string, input: any }) => { },
        deleteProject: (_: any, { id }: { id: string }) => { },

        // Task mutations
        createTask: (_: any, { input }: { input: any }) => { },
        updateTask: (_: any, { id, input }: { id: string, input: any }) => { },
        deleteTask: (_: any, { id }: { id: string }) => { },
        reorderTasks: (_: any, { task_order }: { task_order: string[] }) => { },

        // Project member mutations
        addProjectMember: (_: any, { input }: { input: any }) => { },
        updateProjectMember: (_: any, { id, input }: { id: string, input: any }) => { },
        removeProjectMember: (_: any, { id }: { id: string }) => { },

        // AI interaction mutations
        createAIInteraction: (_: any, { input }: { input: any }) => { },

        // Status mutations
        updateProjectStatus: (_: any, { id, status }: { id: string, status: any }) => { },
        updateTaskStatus: (_: any, { id, status }: { id: string, status: any }) => { },
    },

    // Type Resolvers
    User: {
        owned_projects: (user: any) => userResolver.owned_projects(user),
        member_projects: (user: any) => userResolver.member_projects(user),
        ai_interactions: (user: any) => userResolver.ai_interactions(user),
        project_histories: (user: any) => userResolver.project_histories(user),
    },

    Project: {
        owner: (project: any) => { },
        tasks: (project: any) => { },
        members: (project: any) => { },
        histories: (project: any) => { },
        ai_interactions: (project: any) => { },
    },

    Task: {
        project: (task: any) => { },
        parent_task: (task: any) => { },
        subtasks: (task: any) => { },
        histories: (task: any) => { },
    },

    ProjectMember: {
        project: (member: any) => { },
        user: (member: any) => { },
    },

    ProjectHistory: {
        project: (history: any) => { },
        changer: (history: any) => { },
    },

    AIInteraction: {
        user: (interaction: any) => { },
        parent_interaction: (interaction: any) => { },
        project: (interaction: any) => { },
        child_interactions: (interaction: any) => { },
    }
}

export default resolvers