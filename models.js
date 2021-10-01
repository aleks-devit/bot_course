// В этом файле мы создаем модель для взаимодействия с БД
// Достаем подключение к БД
const sequelize = require('./db')
// Эта штука позволит нам указывать типы полям
const {DataTypes} = require('sequelize')
// Код создания модели,
const User = sequelize.define('User', {
    // Поля
    id: {type: DataTypes.INTEGER, primaryKey: true, unique: true, autoIncrement: true},
    chatId: {type: DataTypes.STRING, unique: true},
    right: {type: DataTypes.INTEGER, defaultValue: 0},
    wrong: {type: DataTypes.INTEGER, defaultValue: 0}
})

module.exports = User