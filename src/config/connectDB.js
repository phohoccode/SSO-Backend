const { Sequelize } = require('sequelize');
require('dotenv').config()

// Option 3: Passing parameters separately (other dialects)
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USERNAME,
    process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT
})

const connection = async () => {
    try {
        await sequelize.authenticate();
        console.log('Kết nối database thành công!');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

export default connection;

