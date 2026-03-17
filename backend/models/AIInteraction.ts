import { DataTypes, Model } from 'sequelize';
import sequelize from '../utils/database.js';

class AIInteraction extends Model {
    public id!: string;
    public userId!: string;
    public parentInteractionId!: string | null;
    public projectId!: string | null;
    public prompt!: string;
    public response!: string;
    public actionType!: 'create' | 'edit' | 'report';
    public metadata!: any;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
    public isDeleted!: boolean;
    public readonly deletedAt!: Date | null;
}

AIInteraction.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
            field: 'user_id',
        },
        parentInteractionId: {
            type: DataTypes.UUID,
            allowNull: true,
            field: 'parent_interaction_id',
        },
        projectId: {
            type: DataTypes.UUID,
            allowNull: true,
            field: 'project_id',
        },
        prompt: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        response: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        actionType: {
            type: DataTypes.ENUM('create', 'edit', 'report'),
            field: 'action_type',
        },
        metadata: {
            type: DataTypes.JSONB,
            allowNull: true,
        },
        isDeleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            field: 'is_deleted',
        }
    },
    {
        sequelize,
        modelName: 'AIInteraction',
        tableName: 'ai_interactions',
        paranoid: true,
        underscored: true,
    }
);

export default AIInteraction;
