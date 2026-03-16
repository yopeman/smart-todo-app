import sequelize from './database.js';
import '../models/index.js';

const syncDB = async () => {
    try {
        console.log('Syncing database...');
        await sequelize.sync({ alter: true });
        console.log('Database synced successfully!');
    } catch (error) {
        console.error('Error syncing database:', error);
        process.exit(1);
    }
};

export default syncDB