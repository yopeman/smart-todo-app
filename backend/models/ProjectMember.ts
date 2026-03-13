import { DataTypes, Model } from 'sequelize';
import sequelize from '../utils/database.js';

class ProjectMember extends Model {
    public id!: string;
    public projectId!: string;
    public userId!: string;
    public role!: 'admin' | 'editor' | 'viewer';
}

ProjectMember.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        projectId: {
            type: DataTypes.UUID,
            allowNull: false,
            field: 'project_id',
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
            field: 'user_id',
        },
        role: {
            type: DataTypes.ENUM('admin', 'editor', 'viewer'),
            defaultValue: 'viewer',
        },
        isDeleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            field: 'is_deleted',
        }
    },
    {
        sequelize,
        modelName: 'ProjectMember',
        tableName: 'project_members',
        paranoid: true,
        underscored: true,
    }
);

export default ProjectMember;
