import * as db from "../models";
import { Op } from 'sequelize';
import sequelize from '../utils/database.js';

async function getSystemAnalytics() {
    try {
        const [
            totalUsers,
            totalProjects,
            totalTasks,
            totalSubtasks,
            totalAIInteractions,
            projectStatusCounts,
            taskStatusCounts,
            projectPriorityCounts,
            projectsByMatrix,
            recentActivity,
            completionRates
        ] = await Promise.all([
            db.User.count(),
            db.Project.count({ where: { isDeleted: false } }),
            db.Task.count({ where: { isDeleted: false } }),
            db.Subtask.count({ where: { isDeleted: false } }),
            db.AIInteraction.count(),
            db.Project.findAll({
                attributes: [
                    'status',
                    [sequelize.fn('COUNT', sequelize.col('id')), 'count']
                ],
                where: { isDeleted: false },
                group: ['status'],
                raw: true
            }),
            db.Task.findAll({
                attributes: [
                    'status',
                    [sequelize.fn('COUNT', sequelize.col('id')), 'count']
                ],
                where: { isDeleted: false },
                group: ['status'],
                raw: true
            }),
            db.Project.findAll({
                attributes: [
                    'priority',
                    [sequelize.fn('COUNT', sequelize.col('id')), 'count']
                ],
                where: { isDeleted: false },
                group: ['priority'],
                raw: true
            }),
            db.Project.findAll({
                attributes: [
                    'urgentImportantMatrix',
                    [sequelize.fn('COUNT', sequelize.col('id')), 'count']
                ],
                where: { 
                    isDeleted: false,
                    urgentImportantMatrix: { [Op.not]: null }
                },
                group: ['urgentImportantMatrix'],
                raw: true
            }),
            db.ProjectHistory.findAll({
                limit: 10,
                order: [['createdAt', 'DESC']],
                include: [
                    { model: db.Project, as: 'project', attributes: ['title'] },
                    { model: db.User, as: 'editor', attributes: ['email'] }
                ],
                attributes: ['changeType', 'changeSummary', 'createdAt']
            }),
            Promise.all([
                db.Project.count({ where: { status: 'done', isDeleted: false } }),
                db.Task.count({ where: { status: 'done', isDeleted: false } })
            ])
        ]);

        const projectCompletionRate = totalProjects > 0 ? (completionRates[0] / totalProjects) * 100 : 0;
        const taskCompletionRate = totalTasks > 0 ? (completionRates[1] / totalTasks) * 100 : 0;        

        return {
            overview: {
                totalUsers,
                totalProjects,
                totalTasks,
                totalSubtasks,
                totalAIInteractions,
                projectCompletionRate: Math.round(projectCompletionRate * 100) / 100,
                taskCompletionRate: Math.round(taskCompletionRate * 100) / 100
            },
            projects: {
                statusBreakdown: projectStatusCounts.reduce((acc, item: any) => {
                    acc[item.status] = parseInt(item.count);
                    return acc;
                }, {} as Record<string, number>),
                priorityBreakdown: projectPriorityCounts.reduce((acc, item: any) => {
                    acc[item.priority] = parseInt(item.count);
                    return acc;
                }, {} as Record<string, number>),
                urgentImportantMatrix: projectsByMatrix.reduce((acc, item: any) => {
                    acc[item.urgentImportantMatrix] = parseInt(item.count);
                    return acc;
                }, {} as Record<string, number>)
            },
            tasks: {
                statusBreakdown: taskStatusCounts.reduce((acc, item: any) => {
                    acc[item.status] = parseInt(item.count);
                    return acc;
                }, {} as Record<string, number>)
            },
            recentActivity: recentActivity.map(activity => {
                const raw = activity.toJSON();
                return {
                    changeType: raw.changeType,
                    changeSummary: raw.changeSummary,
                    projectTitle: raw.project?.title,
                    changedBy: raw.editor?.email,
                    timestamp: raw.createdAt
                }
            }),
            metrics: {
                avgTasksPerProject: totalProjects > 0 ? Math.round((totalTasks / totalProjects) * 100) / 100 : 0,
                avgSubtasksPerTask: totalTasks > 0 ? Math.round((totalSubtasks / totalTasks) * 100) / 100 : 0,
                aiInteractionsPerUser: totalUsers > 0 ? Math.round((totalAIInteractions / totalUsers) * 100) / 100 : 0
            }
        };
    } catch (error) {
        console.error('Error fetching system analytics:', error);
        throw new Error('Failed to retrieve system analytics');
    }
}

export default getSystemAnalytics;

