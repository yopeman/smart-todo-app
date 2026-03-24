import { Project, ProjectMember, User } from '../models'
import PERMISSIONS from '../utils/projectPermissions'
import addProjectHistory from '../utils/addProjectHistory'
import sendEmail from '../utils/emailService'

type ProjectAction = 'create' | 'read' | 'update' | 'delete' | 'manage_members'
type DbProjectRole = 'admin' | 'editor' | 'viewer'

const mapProjectRoleToDb = (role: unknown): DbProjectRole => {
    if (!role) throw new Error('Invalid project role: empty')
    const normalized = String(role).trim().toLowerCase()
    if (normalized === 'admin') return 'admin'
    if (normalized === 'editor') return 'editor'
    if (normalized === 'viewer') return 'viewer'
    if (normalized === 'owner') throw new Error('Invalid project role: owner')

    const asEnum = String(role).trim().toUpperCase()
    if (asEnum === 'ADMIN') return 'admin'
    if (asEnum === 'EDITOR') return 'editor'
    if (asEnum === 'VIEWER') return 'viewer'

    throw new Error(`Invalid project role: ${String(role)}`)
}

const mapProjectRoleToEnum = (role: unknown) => {
    if (!role) throw new Error('Invalid project role: empty')
    const normalized = String(role).trim().toLowerCase()
    if (normalized === 'admin') return 'ADMIN'
    if (normalized === 'editor') return 'EDITOR'
    if (normalized === 'viewer') return 'VIEWER'

    const asEnum = String(role).trim().toUpperCase()
    if (asEnum === 'ADMIN' || asEnum === 'EDITOR' || asEnum === 'VIEWER') return asEnum

    throw new Error(`Invalid project role: ${String(role)}`)
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

export const projectMembers = async (project_id: string, context: any) => {
    await assertProjectPermission({ projectId: project_id, context, action: 'read' })
    return await ProjectMember.findAll({ where: { projectId: project_id, isDeleted: false }, raw: true })
}

export const addProjectMember = async (input: any, context: any) => {
    if (!context?.user) throw new Error('Unauthorized')

    const projectId = input?.projectId ?? input?.project_id
    const userId = input?.userId ?? input?.user_id
    const role = mapProjectRoleToDb(input?.role)

    if (!projectId) throw new Error('Project not found')
    if (!userId) throw new Error('User not found')

    const { project } = await assertProjectPermission({ projectId, context, action: 'manage_members' })
    if (project.ownerId === userId) throw new Error('Project owner is already a member')

    const user = await User.findOne({ where: { id: userId, isDeleted: false }, raw: true })
    if (!user) throw new Error('User not found')

    const existing = await ProjectMember.findOne({
        where: { projectId, userId },
        paranoid: false,
    })

    if (existing && !existing.isDeleted) throw new Error('User is already a member of this project')

    if (existing && existing.isDeleted) {
        await existing.update({ role, isDeleted: false, deletedAt: null })
        const row = existing.toJSON()
        await addProjectHistory(
            projectId,
            'member',
            row.id,
            'update',
            `Member restored with role ${mapProjectRoleToEnum(role)}`,
            context.user.id,
        )

        // Notify restored member
        if (user.email) {
            try {
                await sendEmail(
                    user.email,
                    `Project Invitation: ${project.title}`,
                    `Hi ${user.name},\n\nYou have been added back to the project "${project.title}" with the role: ${mapProjectRoleToEnum(role)}.`
                )
            } catch (error) {
                console.error('Failed to send member restoration email:', error)
            }
        }

        return row
    }

    const created = await ProjectMember.create({
        projectId,
        userId,
        role,
    })
    const row = created.toJSON()
    await addProjectHistory(
        projectId,
        'member',
        row.id,
        'create',
        `Member added with role ${mapProjectRoleToEnum(role)}`,
        context.user.id,
    )

    // Notify new member
    if (user.email) {
        try {
            await sendEmail(
                user.email,
                `Project Invitation: ${project.title}`,
                `Hi ${user.name},\n\nYou have been added to the project "${project.title}" with the role: ${mapProjectRoleToEnum(role)}.`
            )
        } catch (error) {
            console.error('Failed to send member addition email:', error)
        }
    }

    return row
}

export const updateProjectMember = async (id: string, input: any, context: any) => {
    if (!context?.user) throw new Error('Unauthorized')

    const member = await ProjectMember.findOne({ where: { id, isDeleted: false } })
    if (!member) throw new Error('Project member not found')

    const { project } = await assertProjectPermission({ projectId: member.toJSON().projectId, context, action: 'manage_members' })
    if (project.ownerId === member.userId) throw new Error('Cannot change project owner role')

    const prevRole = member.toJSON().role
    const role = mapProjectRoleToDb(input?.role)
    await member.update({ role })
    const updated = member.toJSON()
    if (prevRole !== role) {
        await addProjectHistory(
            member.toJSON().projectId,
            'member',
            id,
            'role change',
            `Role changed from ${mapProjectRoleToEnum(prevRole)} to ${mapProjectRoleToEnum(role)}`,
            context.user.id,
        )

        // Notify member of role change
        const user = await User.findByPk(member.userId, { raw: true })
        if (user && user.email) {
            try {
                await sendEmail(
                    user.email,
                    `Role Updated for Project: ${project.title}`,
                    `Hi ${user.name},\n\nYour role in the project "${project.title}" has been updated from ${mapProjectRoleToEnum(prevRole)} to ${mapProjectRoleToEnum(role)}.`
                )
            } catch (error) {
                console.error('Failed to send role update email:', error)
            }
        }
    }
    return updated
}

export const removeProjectMember = async (id: string, context: any) => {
    if (!context?.user) throw new Error('Unauthorized')

    const member = await ProjectMember.findOne({ where: { id, isDeleted: false } })
    if (!member) throw new Error('Project member not found')

    const { project } = await assertProjectPermission({ projectId: member.toJSON().projectId, context, action: 'manage_members' })
    if (project.ownerId === member.userId) throw new Error('Cannot remove project owner')

    await member.update({
        isDeleted: true,
        deletedAt: new Date(),
    })

    await addProjectHistory(
        member.toJSON().projectId,
        'member',
        id,
        'delete',
        'Member removed from project',
        context.user.id,
    )

    // Notify removed member
    const user = await User.findByPk(member.userId, { raw: true })
    if (user && user.email) {
        try {
            await sendEmail(
                user.email,
                `Project Removal: ${project.title}`,
                `Hi ${user.name},\n\nYou have been removed from the project "${project.title}".`
            )
        } catch (error) {
            console.error('Failed to send member removal email:', error)
        }
    }

    return true
}

export const projectMemberType = {
    id: (member: any) => member.id,
    project_id: (member: any) => member.projectId,
    user_id: (member: any) => member.userId,
    role: (member: any) => mapProjectRoleToEnum(member.role),
    created_at: (member: any) => member.createdAt,
    updated_at: (member: any) => member.updatedAt,
    is_deleted: (member: any) => member.isDeleted,
    deleted_at: (member: any) => member.deletedAt,

    project: async (member: any) => await Project.findByPk(member.projectId, { raw: true }),
    user: async (member: any) => await User.findByPk(member.userId, { raw: true }),
}