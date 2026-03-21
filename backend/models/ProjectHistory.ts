import { DataTypes, Model } from 'sequelize';
import sequelize from '../utils/database.js';

class ProjectHistory extends Model {
    public id!: string;
    public projectId!: string;
    public entityType!: 'project' | 'task' | 'subtask' | 'member';
    public entityId!: string;
    public changeType!: 'create' | 'update' | 'delete' | 'status change';
    public changeSummary!: string;
    public changedBy!: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
    public isDeleted!: boolean;
    public readonly deletedAt!: Date | null;
}

ProjectHistory.init(
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
        entityType: {
            type: DataTypes.ENUM('project', 'task', 'subtask', 'member'),
            allowNull: false,
            field: 'entity_type',
        },
        entityId: {
            type: DataTypes.UUID,
            allowNull: false,
            field: 'entity_id',
        },
        changeType: {
            type: DataTypes.ENUM('create', 'update', 'delete', 'status change'),
            allowNull: false,
            field: 'change_type',
        },
        changeSummary: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'change_summary',
        },
        changedBy: {
            type: DataTypes.UUID,
            allowNull: false,
            field: 'changed_by',
        },
        isDeleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            field: 'is_deleted',
        }
    },
    {
        sequelize,
        modelName: 'ProjectHistory',
        tableName: 'project_histories',
        paranoid: true,
        underscored: true,
    }
);

export default ProjectHistory;
