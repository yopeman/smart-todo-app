import { Project, ProjectHistory, ProjectMember, Task, Subtask, User } from '../models'
import PERMISSIONS from '../utils/projectPermissions'

type ProjectAction = 'create' | 'read' | 'update' | 'delete' | 'manage_members'

const mapEntityTypeToEnum = (value: unknown) => {
    if (!value) throw new Error('Invalid entity type: empty')
    const normalized = String(value).trim().toLowerCase()
    if (normalized === 'project') return 'PROJECT'
    if (normalized === 'task') return 'TASK'
    if (normalized === 'subtask') return 'SUBTASK'
    if (normalized === 'member') return 'MEMBER'

    const asEnum = String(value).trim().toUpperCase()
    if (asEnum === 'PROJECT' || asEnum === 'TASK' || asEnum === 'SUBTASK' || asEnum === 'MEMBER') return asEnum
    throw new Error(`Invalid entity type: ${String(value)}`)
}

const mapEntityTypeFromEnum = (value: unknown) => {
    if (!value) throw new Error('Invalid entity type: empty')
    const normalized = String(value).trim().toUpperCase()
    if (normalized === 'PROJECT') return 'project'
    if (normalized === 'TASK') return 'task'
    if (normalized === 'SUBTASK') return 'subtask'
    if (normalized === 'MEMBER') return 'member'

    const asDbValue = String(value).trim().toLowerCase()
    if (asDbValue === 'project' || asDbValue === 'task' || asDbValue === 'subtask' || asDbValue === 'member') return asDbValue
    throw new Error(`Invalid entity type: ${String(value)}`)
}

const mapChangeTypeToEnum = (value: unknown) => {
    if (!value) throw new Error('Invalid change type: empty')
    const normalized = String(value).trim().toLowerCase()
    if (normalized === 'create') return 'CREATE'
    if (normalized === 'update') return 'UPDATE'
    if (normalized === 'delete') return 'DELETE'
    if (normalized === 'status change' || normalized === 'status_change') return 'STATUS_CHANGE'
    if (normalized === 'role change' || normalized === 'role_change') return 'ROLE_CHANGE'

    const asEnum = String(value).trim().toUpperCase()
    if (
        asEnum === 'CREATE' ||
        asEnum === 'UPDATE' ||
        asEnum === 'DELETE' ||
        asEnum === 'STATUS_CHANGE' ||
        asEnum === 'ROLE_CHANGE'
    )
        return asEnum
    throw new Error(`Invalid change type: ${String(value)}`)
}

const mapChangeTypeFromEnum = (value: unknown) => {
    if (!value) throw new Error('Invalid change type: empty')
    const normalized = String(value).trim().toUpperCase()
    if (normalized === 'CREATE') return 'create'
    if (normalized === 'UPDATE') return 'update'
    if (normalized === 'DELETE') return 'delete'
    if (normalized === 'STATUS_CHANGE') return 'status change'
    if (normalized === 'ROLE_CHANGE') return 'role change'

    const asDbValue = String(value).trim().toLowerCase()
    if (
        asDbValue === 'create' ||
        asDbValue === 'update' ||
        asDbValue === 'delete' ||
        asDbValue === 'status change' ||
        asDbValue === 'role change'
    )
        return asDbValue
    throw new Error(`Invalid change type: ${String(value)}`)
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
        raw: true
    })

    const role = project.ownerId === userId ? 'owner' : member?.role
    const allowed = role ? PERMISSIONS[role]?.includes(action) : false
    if (!allowed) throw new Error('Project not found or unauthorized')

    return { project, role }
}

export const projectHistories = async (
    project_id: string,
    entity_type: string | undefined,
    change_type: string | undefined,
    context: any
) => {
    await assertProjectPermission({ projectId: project_id, context, action: 'read' })

    const where: any = {
        projectId: project_id,
        isDeleted: false
    }

    if (entity_type) where.entityType = mapEntityTypeFromEnum(entity_type)
    if (change_type) where.changeType = mapChangeTypeFromEnum(change_type)

    return await ProjectHistory.findAll({
        where,
        order: [['createdAt', 'DESC']],
        raw: true
    })
}

export const projectHistoryType = {
    id: (history: any) => history.id,
    project_id: (history: any) => history.projectId,
    entity_type: (history: any) => mapEntityTypeToEnum(history.entityType),
    entity_id: (history: any) => history.entityId,
    change_type: (history: any) => mapChangeTypeToEnum(history.changeType),
    change_summary: (history: any) => history.changeSummary,
    changed_by: (history: any) => history.changedBy,
    created_at: (history: any) => history.createdAt,
    updated_at: (history: any) => history.updatedAt,
    is_deleted: (history: any) => history.isDeleted,
    deleted_at: (history: any) => history.deletedAt,

    project: async (history: any) => {
        if (history.entityType !== 'project') return null
        return await Project.findByPk(history.entityId, { raw: true })
    },
    task: async (history: any) => {
        if (history.entityType !== 'task') return null
        return await Task.findByPk(history.entityId, { raw: true })
    },
    subtask: async (history: any) => {
        if (history.entityType !== 'subtask') return null
        return await Subtask.findByPk(history.entityId, { raw: true })
    },
    member: async (history: any) => {
        if (history.entityType !== 'member') return null
        return await ProjectMember.findByPk(history.entityId, { raw: true })
    },
    changer: async (history: any) => await User.findByPk(history.changedBy, { raw: true }),
    parent_project: async (history: any) => await Project.findByPk(history.projectId, { raw: true }),
}
