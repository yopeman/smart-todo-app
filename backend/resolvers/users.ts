import { Project, User, ProjectMember, AIInteraction, ProjectHistory } from '../models'

export const user = async (id: string) => {
    const user = await User.findOne({ where: { id, isDeleted: false } })
    if (!user) throw new Error('User not found')
    return user
}

export const users = async () => {
    return await User.findAll({ where: { isDeleted: false } })
}

export const me = async (context: any) => {
    if (!context.user) throw new Error('User not found')
    return context.user.get({ plain: true })
}

export const deleteMe = async (context: any) => {
    const user = await User.findByPk(context.user.id)
    if (!user) throw new Error('User not found')

    user.isDeleted = true
    await user.save()
    return true
}

export const owned_projects = async (user: any) => {
    return await Project.findAll({ where: { ownerId: user.id, isDeleted: false } })
}

export const member_projects = async (user: any) => {
    return await ProjectMember.findAll({ where: { userId: user.id, isDeleted: false } })
}

export const ai_interactions = async (user: any) => {
    return await AIInteraction.findAll({ where: { userId: user.id, isDeleted: false } })
}

export const project_histories = async (user: any) => {
    return await ProjectHistory.findAll({ where: { changedBy: user.id, isDeleted: false } })
}