// Достаем класс секвалайза для подключения к БД
const {Sequelize} = require('sequelize')
// Инициируем подключение указывая название таблице пользователя, пароль и данные для подключения
module.exports = new Sequelize(
    'telega_bot',
    'root',
    'root',
    {
        host: '82.202.242.12',
        port: '6432',
        dialect: 'postgres'
    }
)