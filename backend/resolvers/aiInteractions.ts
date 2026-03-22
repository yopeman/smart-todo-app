import { AIInteraction, Project, ProjectMember, User } from '../models'
import PERMISSIONS from '../utils/projectPermissions'
import createProject from '../utils/createNewProjectAgent'
import editProject from '../utils/editExistingProjectAgent'
import reportProject from '../utils/generateProjectReportAgent'
import addProjectHistory from '../utils/addProjectHistory'

type ProjectAction = 'create' | 'read' | 'update' | 'delete' | 'manage_members'

const mapActionTypeToEnum = (actionType: unknown) => {
    if (!actionType) throw new Error('Invalid action type: empty')

    const normalized = String(actionType).trim().toLowerCase()
    if (normalized === 'create') return 'CREATE'
    if (normalized === 'edit') return 'EDIT'
    if (normalized === 'report') return 'REPORT'

    const asEnum = String(actionType).trim().toUpperCase()
    if (asEnum === 'CREATE' || asEnum === 'EDIT' || asEnum === 'REPORT') return asEnum

    throw new Error(`Invalid action type: ${String(actionType)}`)
}

const assertProjectPermission = async (params: {
    projectId: string
    context: any
    action: ProjectAction
}) => {
    const { projectId, context, action } = params

    const project = await Project.findOne({ where: { id: projectId, isDeleted: false }, raw: true })
    if (!project) throw new Error('Project not found or unauthorized')

    // Anonymous users can only read public projects.
    if (!context?.user) {
        if (action === 'read' && project.isPublic) return { project, role: 'viewer' as const }
        throw new Error('Unauthorized')
    }

    const userId = context.user.id
    const member = await ProjectMember.findOne({
        where: { projectId, userId, isDeleted: false },
        raw: true,
    })

    const role = project.ownerId === userId ? 'owner' : member?.role
    const allowed = role ? PERMISSIONS[role]?.includes(action) : false
    if (!allowed) throw new Error('Project not found or unauthorized')

    return { project, role }
}

export const aiInteraction = async (id: string, context: any) => {
    const found = await AIInteraction.findOne({ where: { id, isDeleted: false }, raw: true })
    if (!found) throw new Error('AI interaction not found')

    // If interaction belongs to a project, enforce project visibility; otherwise only the owner can read it.
    if (found.projectId) {
        await assertProjectPermission({ projectId: found.projectId, context, action: 'read' })
    } else {
        const userId = context?.user?.id
        if (!userId) throw new Error('Unauthorized')
        if (found.userId !== userId) throw new Error('AI interaction not found or unauthorized')
    }

    return found
}

export const aiInteractions = async (project_id: string | undefined, action_type: string | undefined, context: any) => {
    const where: any = { isDeleted: false }

    if (action_type) {
        // Accept both GraphQL enum (CREATE) and DB value (create), but validate.
        const asEnum = mapActionTypeToEnum(action_type)
        where.actionType = String(asEnum).toLowerCase()
    }

    if (project_id) {
        await assertProjectPermission({ projectId: project_id, context, action: 'read' })
        where.projectId = project_id
    } else {
        // Without a project scope, only return interactions owned by the caller.
        const userId = context?.user?.id
        if (!userId) throw new Error('Unauthorized')
        where.userId = userId
    }

    return await AIInteraction.findAll({
        where,
        order: [['createdAt', 'ASC']],
        raw: true,
    })
}

// Intentionally left unimplemented per request.
export const createAIInteraction = async (input: any, context: any) => {
    if (input.action_type === 'CREATE') {
        return await createProject(input, context)
    }

    else if (input.action_type === 'EDIT') {
        if (!input.project_id) throw new Error('Project ID is required for edit action')
        await assertProjectPermission({ projectId: input.project_id, context, action: 'update' })
        return await editProject(input, context)
    }

    else if (input.action_type === 'REPORT') {
        if (!input.project_id) throw new Error('Project ID is required for report action')
        await assertProjectPermission({ projectId: input.project_id, context, action: 'read' })
        const interaction = await reportProject(input, context)
        await addProjectHistory(
            input.project_id,
            'project',
            input.project_id,
            'update',
            'AI assistant generated a project report',
            context.user.id,
        )
        return interaction
    }

    else throw new Error('Invalid action type')
}

export const aiInteractionType = {
    id: (interaction: any) => interaction.id,
    user_id: (interaction: any) => interaction.userId,
    parent_interaction_id: (interaction: any) => interaction.parentInteractionId,
    project_id: (interaction: any) => interaction.projectId,
    prompt: (interaction: any) => interaction.prompt,
    response: (interaction: any) => interaction.response,
    action_type: (interaction: any) => mapActionTypeToEnum(interaction.actionType),
    metadata: (interaction: any) => interaction.metadata,
    created_at: (interaction: any) => interaction.createdAt,
    updated_at: (interaction: any) => interaction.updatedAt,
    is_deleted: (interaction: any) => interaction.isDeleted,
    deleted_at: (interaction: any) => interaction.deletedAt,

    user: async (interaction: any) => await User.findByPk(interaction.userId, { raw: true }),
    parent_interaction: async (interaction: any) => {
        if (!interaction.parentInteractionId) return null
        return await AIInteraction.findByPk(interaction.parentInteractionId, { raw: true })
    },
    project: async (interaction: any) => {
        if (!interaction.projectId) return null
        return await Project.findByPk(interaction.projectId, { raw: true })
    },
    child_interactions: async (interaction: any) =>
        await AIInteraction.findAll({
            where: { parentInteractionId: interaction.id, isDeleted: false },
            order: [['createdAt', 'ASC']],
            raw: true,
        }),
}