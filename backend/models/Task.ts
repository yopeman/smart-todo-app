import { DataTypes, Model } from 'sequelize';
import sequelize from '../utils/database.js';

class Task extends Model {
    public id!: string;
    public projectId!: string;
    public parentTaskId!: string | null;
    public title!: string;
    public description!: string | null;
    public status!: 'todo' | 'in progress' | 'done';
    public orderWeight!: number;
    public dueDate!: Date | null;
    public completedAt!: Date | null;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
    public isDeleted!: boolean;
    public readonly deletedAt!: Date | null;
}

Task.init(
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
        parentTaskId: {
            type: DataTypes.UUID,
            allowNull: true,
            field: 'parent_task_id',
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM('todo', 'in progress', 'done'),
            defaultValue: 'todo',
        },
        orderWeight: {
            type: DataTypes.FLOAT,
            defaultValue: 0,
            field: 'order_weight',
        },
        dueDate: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'due_date',
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
        modelName: 'Task',
        tableName: 'tasks',
        paranoid: true,
        underscored: true,
    }
);

export default Task;
