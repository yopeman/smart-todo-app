import { Project, User, ProjectMember, AIInteraction, ProjectHistory } from '../models'

export const user = async (id: string) => {
    const user = await User.findOne({ where: { id, isDeleted: false }, raw: true })
    if (!user) throw new Error('User not found')
    return user
}

export const users = async () => {
    return await User.findAll({ where: { isDeleted: false }, raw: true })
}

export const me = async (context: any) => {
    return context.user
}

export const deleteMe = async (context: any) => {
    const user = await User.findByPk(context.user.id)

    if (!user) throw new Error('User not found')

    await user.update({
        isDeleted: true,
        deletedAt: new Date(),
    })

    return true
}

export const userType = {
    id: (user: User) => user.id,
    email: (user: User) => user.email,
    name: (user: User) => user.name,
    avatar: (user: User) => user.avatar,
    provider: (user: User) => user.provider,
    created_at: (user: User) => user.createdAt,
    updated_at: (user: User) => user.updatedAt,
    is_deleted: (user: User) => user.isDeleted,
    deleted_at: (user: User) => user.deletedAt,
    // Relationships
    owned_projects: async (user: User) => await Project.findAll({ where: { ownerId: user.id, isDeleted: false }, raw: true }),
    member_projects: async (user: User) => await ProjectMember.findAll({ where: { userId: user.id, isDeleted: false }, raw: true }),
    ai_interactions: async (user: User) => await AIInteraction.findAll({ where: { userId: user.id, isDeleted: false }, raw: true }),
    project_histories: async (user: User) => await ProjectHistory.findAll({ where: { changedBy: user.id, isDeleted: false }, raw: true }),
    
}