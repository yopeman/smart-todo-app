import { DataTypes, Model } from 'sequelize';
import sequelize from '../utils/database.js';

class User extends Model {
    public id!: string;
    public email!: string;
    public name!: string | null;
    public avatar!: string | null;
    public provider!: string | null;
    public providerId!: string | null;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
    public isDeleted!: boolean;
    public readonly deletedAt!: Date | null;
}

User.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            },
        },
        name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        avatar: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        provider: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        providerId: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'provider_id',
        },
        isDeleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            field: 'is_deleted',
        }
    },
    {
        sequelize,
        modelName: 'User',
        tableName: 'users',
        paranoid: true,
        underscored: true,
    }
);

export default User;
