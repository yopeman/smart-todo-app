import User from './User.js';
import Project from './Project.js';
import Task from './Task.js';
import ProjectMember from './ProjectMember.js';
import ProjectHistory from './ProjectHistory.js';
import AIInteraction from './AIInteraction.js';

// User <-> Project (Owner)
User.hasMany(Project, { foreignKey: 'owner_id', as: 'ownedProjects' });
Project.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });

// Project <-> Task
Project.hasMany(Task, { foreignKey: 'project_id', as: 'tasks' });
Task.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });

// Task <-> Task (Self-referencing for parent/child)
Task.hasMany(Task, { foreignKey: 'parent_task_id', as: 'subTasks' });
Task.belongsTo(Task, { foreignKey: 'parent_task_id', as: 'parentTask' });

// User <-> Project (Members)
User.belongsToMany(Project, {
    through: ProjectMember,
    foreignKey: 'user_id',
    otherKey: 'project_id',
    as: 'collaboratingProjects',
});
Project.belongsToMany(User, {
    through: ProjectMember,
    foreignKey: 'project_id',
    otherKey: 'user_id',
    as: 'members',
});

// Project <-> ProjectMember (Direct association if needed)
Project.hasMany(ProjectMember, { foreignKey: 'project_id', as: 'projectMemberDetails' });
ProjectMember.belongsTo(Project, { foreignKey: 'project_id' });

// User <-> ProjectMember (Direct association if needed)
User.hasMany(ProjectMember, { foreignKey: 'user_id', as: 'projectMemberships' });
ProjectMember.belongsTo(User, { foreignKey: 'user_id' });

// Project <-> ProjectHistory
Project.hasMany(ProjectHistory, { foreignKey: 'project_id', as: 'history' });
ProjectHistory.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });

// User <-> ProjectHistory (Changed by)
User.hasMany(ProjectHistory, { foreignKey: 'changed_by', as: 'historyActions' });
ProjectHistory.belongsTo(User, { foreignKey: 'changed_by', as: 'editor' });

// User <-> AIInteraction
User.hasMany(AIInteraction, { foreignKey: 'user_id', as: 'aiInteractions' });
AIInteraction.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Project <-> AIInteraction
Project.hasMany(AIInteraction, { foreignKey: 'project_id', as: 'aiInteractions' });
AIInteraction.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });

// AIInteraction <-> AIInteraction (Self-referencing for conversation threading)
AIInteraction.hasMany(AIInteraction, { foreignKey: 'parent_interaction_id', as: 'childInteractions' });
AIInteraction.belongsTo(AIInteraction, { foreignKey: 'parent_interaction_id', as: 'parentInteraction' });

export {
    User,
    Project,
    Task,
    ProjectMember,
    ProjectHistory,
    AIInteraction,
};
