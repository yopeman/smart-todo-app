import { Subtask, Task, Project, ProjectMember } from '../models'
import { Op } from 'sequelize'
import PERMISSIONS from '../utils/projectPermissions'
import addProjectHistory from '../utils/addProjectHistory'

type ProjectAction = 'create' | 'read' | 'update' | 'delete' | 'manage_members'

const mapStatusToEnum = (status: unknown) => {
    if (!status) throw new Error('Invalid task status: empty')
    const normalized = String(status).trim().toLowerCase()
    if (normalized === 'todo') return 'TODO'
    if (normalized === 'in progress' || normalized === 'in_progress') return 'IN_PROGRESS'
    if (normalized === 'done') return 'DONE'

    const asEnum = String(status).trim().toUpperCase()
    if (asEnum === 'TODO' || asEnum === 'IN_PROGRESS' || asEnum === 'DONE') return asEnum
    throw new Error(`Invalid task status: ${String(status)}`)
}

const backMapEnumToStatus = (status: string) => {
    if (status === 'TODO') return 'todo'
    if (status === 'IN_PROGRESS') return 'in progress'
    if (status === 'DONE') return 'done'
    return status
}

const normalizeSubtaskInput = (input: any) => {
    const normalized: any = {
        title: input?.title,
        description: input?.description,
        status: input?.status,
        orderWeight: input?.orderWeight ?? input?.order_weight,
        dueDate: input?.dueDate ?? input?.due_date,
        taskId: input?.taskId ?? input?.task_id,
    }

    for (const key of Object.keys(normalized)) {
        if (normalized[key] === undefined) delete normalized[key]
    }

    return normalized
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

const getTaskOrThrow = async (taskId: string) => {
    const task = await Task.findOne({ where: { id: taskId, isDeleted: false }, raw: true })
    if (!task) throw new Error('Task not found')
    return task
}

export const subtask = async (id: string, context: any) => {
    const found = await Subtask.findOne({ where: { id, isDeleted: false }, raw: true })
    if (!found) throw new Error('Subtask not found')

    const parentTask = await getTaskOrThrow(found.taskId)
    await assertProjectPermission({ projectId: parentTask.projectId, context, action: 'read' })

    return found
}

export const subtasks = async (task_id: string, status: string | undefined, context: any) => {
    const parentTask = await getTaskOrThrow(task_id)
    await assertProjectPermission({ projectId: parentTask.projectId, context, action: 'read' })

    const where: any = { isDeleted: false, taskId: task_id }
    if (status) where.status = status

    return await Subtask.findAll({
        where,
        order: [['orderWeight', 'ASC'], ['createdAt', 'ASC']],
        raw: true,
    })
}

export const createSubtask = async (input: any, context: any) => {
    if (!context.user) throw new Error('Unauthorized')
    const taskId = input?.taskId ?? input?.task_id
    if (!taskId) throw new Error('Task not found')

    const parentTask = await getTaskOrThrow(taskId)
    await assertProjectPermission({ projectId: parentTask.projectId, context, action: 'create' })

    const created = await Subtask.create({
        taskId,
        ...normalizeSubtaskInput(input),
    })
    const row = created.toJSON()
    await addProjectHistory(
        parentTask.projectId,
        'subtask',
        row.id,
        'create',
        `Subtask "${row.title}" created`,
        context.user.id,
    )
    return row
}

export const updateSubtask = async (id: string, input: any, context: any) => {
    if (!context.user) throw new Error('Unauthorized')

    const found = await Subtask.findOne({ where: { id, isDeleted: false } })
    if (!found) throw new Error('Subtask not found')

    const parentTask = await getTaskOrThrow((found.toJSON() as any).taskId)
    await assertProjectPermission({ projectId: parentTask.projectId, context, action: 'update' })

    const prev = found.toJSON()
    const normalized = normalizeSubtaskInput(input)
    await found.update(normalized)
    const updated = found.toJSON()

    const statusChanged = prev.status !== updated.status
    const otherKeys = Object.keys(normalized).filter((k) => k !== 'status')

    if (!statusChanged && otherKeys.length === 0) return updated

    if (statusChanged && !otherKeys.length) {
        await addProjectHistory(
            parentTask.projectId,
            'subtask',
            id,
            'status change',
            `Status changed from ${prev.status} to ${updated.status}`,
            context.user.id,
        )
    } else {
        const parts: string[] = []
        if (statusChanged) parts.push(`status ${prev.status} → ${updated.status}`)
        if (otherKeys.length) parts.push(`fields: ${otherKeys.join(', ')}`)
        await addProjectHistory(
            parentTask.projectId,
            'subtask',
            id,
            'update',
            parts.length ? parts.join('; ') : 'Subtask updated',
            context.user.id,
        )
    }

    return updated
}

export const updateSubtaskStatus = async (id: string, status: unknown, context: any) => {
    if (!context.user) throw new Error('Unauthorized')

    const found = await Subtask.findOne({ where: { id, isDeleted: false } })
    if (!found) throw new Error('Subtask not found')

    const parentTask = await getTaskOrThrow((found.toJSON() as any).taskId)
    await assertProjectPermission({ projectId: parentTask.projectId, context, action: 'update' })

    const prevStatus = found.status
    const nextStatus = mapStatusToEnum(status)
    const completedAt = nextStatus === 'DONE' ? new Date() : null

    await found.update({ status: backMapEnumToStatus(nextStatus), completedAt })
    const updated = found.toJSON()
    if (prevStatus !== updated.status) {
        await addProjectHistory(
            parentTask.projectId,
            'subtask',
            id,
            'status change',
            `Status changed from ${prevStatus} to ${updated.status}`,
            context.user.id,
        )
    }
    return updated
}

export const deleteSubtask = async (id: string, context: any) => {
    if (!context.user) throw new Error('Unauthorized')

    const found = await Subtask.findOne({ where: { id, isDeleted: false } })
    if (!found) throw new Error('Subtask not found')

    const parentTask = await getTaskOrThrow((found.toJSON() as any).taskId)
    await assertProjectPermission({ projectId: parentTask.projectId, context, action: 'delete' })

    await found.update({
        isDeleted: true,
        deletedAt: new Date()
    })
    await addProjectHistory(
        parentTask.projectId,
        'subtask',
        id,
        'delete',
        `Subtask "${found.title}" deleted`,
        context.user.id,
    )
    return true
}

export const reorderSubtasks = async (subtask_order: string[], context: any) => {
    if (!context.user) throw new Error('Unauthorized')
    if (!subtask_order?.length) return []

    const subs = await Subtask.findAll({
        where: { id: { [Op.in]: subtask_order }, isDeleted: false },
        raw: true
    })
    if (subs.length !== subtask_order.length) throw new Error('One or more subtasks not found')

    const taskId = (subs[0] as any).taskId
    if (subs.some((s: any) => s.taskId !== taskId)) throw new Error('All subtasks must belong to the same task')

    const parentTask = await getTaskOrThrow(taskId)
    await assertProjectPermission({ projectId: parentTask.projectId, context, action: 'update' })

    for (let i = 0; i < subtask_order.length; i++) {
        await Subtask.update({ orderWeight: i }, { where: { id: subtask_order[i], isDeleted: false } })
    }

    const updated = await Subtask.findAll({
        where: { id: { [Op.in]: subtask_order }, isDeleted: false },
        order: [['orderWeight', 'ASC'], ['createdAt', 'ASC']],
        raw: true
    })

    await addProjectHistory(
        parentTask.projectId,
        'task',
        taskId,
        'update',
        'Subtask order updated',
        context.user.id,
    )

    return updated
}

export const subtaskType = {
    id: (subtask: any) => subtask.id,
    task_id: (subtask: any) => subtask.taskId,
    title: (subtask: any) => subtask.title,
    description: (subtask: any) => subtask.description,
    status: (subtask: any) => mapStatusToEnum(subtask.status),
    order_weight: (subtask: any) => subtask.orderWeight,
    due_date: (subtask: any) => subtask.dueDate,
    completed_at: (subtask: any) => subtask.completedAt,
    created_at: (subtask: any) => subtask.createdAt,
    updated_at: (subtask: any) => subtask.updatedAt,
    is_deleted: (subtask: any) => subtask.isDeleted,
    deleted_at: (subtask: any) => subtask.deletedAt,

    task: async (subtask: any) => await Task.findByPk(subtask.taskId, { raw: true }),
}

