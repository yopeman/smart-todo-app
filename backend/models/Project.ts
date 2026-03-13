import { DataTypes, Model } from 'sequelize';
import sequelize from '../utils/database.js';

class Project extends Model {
    public id!: string;
    public title!: string;
    public ownerId!: string;
    public description!: string | null;
    public priority!: number;
    public urgentImportantMatrix!: string;
    public successCriteria!: string | null;
    public isPublic!: boolean;
    public startDate!: Date | null;
    public endDate!: Date | null;
    public status!: 'todo' | 'in progress' | 'done';
    public completedAt!: Date | null;
}

Project.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        ownerId: {
            type: DataTypes.UUID,
            allowNull: false,
            field: 'owner_id',
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        priority: {
            type: DataTypes.INTEGER,
            defaultValue: 3,
            validate: {
                min: 1,
                max: 5,
            },
        },
        urgentImportantMatrix: {
            type: DataTypes.ENUM(
                'urgent & important',
                'urgent & not important',
                'not urgent & important',
                'not urgent & not important'
            ),
            allowNull: false,
            field: 'urgent_important_matrix',
        },
        successCriteria: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'success_criteria',
        },
        isPublic: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            field: 'is_public',
        },
        startDate: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'start_date',
        },
        endDate: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'end_date',
        },
        status: {
            type: DataTypes.ENUM('todo', 'in progress', 'done'),
            defaultValue: 'todo',
        },
        completedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'completed_at',
        },
        isDeleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            field: 'is_deleted',
        }
    },
    {
        sequelize,
        modelName: 'Project',
        tableName: 'projects',
        paranoid: true,
        underscored: true,
    }
);

export default Project;
