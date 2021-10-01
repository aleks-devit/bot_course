// Импортируем зависимость для настройки нашего бота
const TelegramApi = require('node-telegram-bot-api')
// Достаем кнопки из отдельного модуля
const {gameOptions, againOptions} = require('./options.js')
// Импорттируем созданную БД
const sequelize = require('./db')
// Импортируем модель пользователя
const UserModel = require('./models')
// Константа храянщая токен бота
const token = '2042137493:AAHIHxhD8c1dF7u3DjpQTvpESOaleQpRsp0'
// Инициализируем самого бота передавая в класс токен и так же конфигурации
const bot = new TelegramApi(token, {polling: true})
// Для того что бы команды выводились в кнопку быстрого доступа их необходимо
// прописать в вот такой функции принимающию в себя массив этих команд
bot.setMyCommands([
    {command: '/start', description: 'Начально приветствие'},
    {command: '/info', description: 'Получить информацию о пользователе'},
    {command: '/game', description: 'ИГра угадай цифру'}
    ])

const chats = {}
// Пример создания кнопок


const startGame = async (chatId) => {
    await bot.sendMessage(chatId, 'Я сейчас загадаю цифру от 0 до 9, а ты должен ее отгадать!')
    chats[chatId] = Math.floor(Math.random() * 10)
    // Так же функция sendMessage третьим аргументом принимает кнопки которые конечно надо
    // создать заранне и пример создания кнопок я описываю выше
    await bot.sendMessage(chatId, 'Отгадывай', gameOptions)
}

const start = async () => {
    // Код для подключения в БД
    try {
        // Подключаемся к БД
        await sequelize.authenticate()
        // Синхронизируемся
        await sequelize.sync()
        // Сценарий ошибок
    }catch (e) {
        console.log(`Подключение в БД сломалось по причине ${e}`)
    }

    // Вешаем слушаетль на событие сообщения (прослушиваем то что нам пишут)
// callback функция предоставляет нам в качестве аргумента объект с данными
// в виде самого сообщения а так же информации о дате отправки и отправляюшем
    bot.on('message', async msg => {
        // Здесь мы настраиваем боты что бы он мог ответить на входящие сообщение
        // Для этого нам необходимо достать id чата
        const text = msg.text
        const chatId = msg.chat.id
        
        try{

            // Таким образом мы можем настроить команды на которые бот будет отвечать
            // определенным образом. Самое главное не забывать слеш так как команды
            // принято начинать именно с него
            if(text === '/start'){
                // Как только новый пользователь заходит в чат создаем его запись в БД
                await UserModel.create({chatId})
                // Таким макаром можно отправлять стикеры сначала id чата, а после ссылка на стикер (только смотри
                // что бы они были в формате webp)
                await bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/ea5/382/ea53826d-c192-376a-b766-e5abc535f1c9/7.webp')
                // Далее используя функцию ниже мы пердаем в нее id чата
                // что бы бот понимал кому отвечает и сообщение которое он
                // отправляет
                return  bot.sendMessage(chatId, `Добро пожаловать!`)
                // Так же есть подобные функции для отправки картинок аудио и других форматов
                // надо только посомтреть в доке
            }

            if(text === '/info'){
                // Для вывода данных о пользователе находим его в БД и ложим в константу
                const user = await UserModel.findOne({chatId})
                return  bot.sendMessage(chatId, `Тебя зовут ${msg.chat.first_name}, в итоге у тебя правильных ответов ${user.right}, неправильных ${user.wrong}`)
            }

            if (text === '/game'){
                return startGame(chatId)
            }
            // Это сообщение будет отправляться когда ниодна из команд выше не подойдет под запрос
            return bot.sendMessage(chatId, `Я тебя не понимаю поробуй еще раз!`)
        }catch (e) {
            return bot.sendMessage(chatId, 'Произошла какая то ошибочка!)')
        }
    })

    // А это обработчки который перехватывает ответы от кнопок
    bot.on('callback_query', async msg => {
        const data = msg.data
        const chatId = msg.message.chat.id
        if (data === '/again'){
            return  startGame(chatId)
        }
        const user = await UserModel.findOne({chatId})

        if(data == chats[chatId]){
            // Таким опбразом мы меняем запис в бд
            user.right += 1
            await bot.sendMessage(chatId, `Поздравляю ты отгадал цифру ${chats[chatId]}`, againOptions)
        } else {
            // Таким опбразом мы меняем запис в бд
            user.wrong += 1
            await bot.sendMessage(chatId, `К сожалению ты не отгадал, бот загадал цифру ${chats[chatId]}`, againOptions)
        }
        // И после сохраняем изменния
        await user.save()
    })
}

start()