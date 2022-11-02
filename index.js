const TelegramApi = require('node-telegram-bot-api')
const {gameOptions, againOptions} = require('./options')
const sequelize = require('./db')
const UserModel = require('./models')

const token = '5780309014:AAETqPsuifjuBx9x9r1rUqeVjNlokMrU7Qs'

const bot = new TelegramApi(token, {polling: true})

const chats = {}

const startGame = async (chatId) => {
    await bot.sendMessage(chatId, 'Сейчас я загадаю цифру, а ты пропробуй угадать :Р')
    const randomNumber = Math.floor(Math.random() * 10)
    chats[chatId] = randomNumber;
    await bot.sendMessage(chatId, `Отгадывай`, gameOptions)
}


const start = async () => {
    
    try {
        await sequelize.authenticate()
        await sequelize.sync()
    } catch (e) {
        console.log('Подключение к БД сломалось', e)
    }
    
    bot.setMyCommands([
        {command: '/start', description: 'Начальное приветствие'},
        {command: '/info', description: 'Получить информацию о пользователе'},
        {command: '/game', description: 'Игра'}
    ])

    bot.on('message', async msg => {
        const text = msg.text;
        const chatId = msg.chat.id;

        try {
            if (text === '/start') {
                await UserModel.create({chatId})
                await bot.sendSticker(chatId, 'https://chpic.su/_data/stickers/c/clothess_inside/clothess_inside_010.webp')
                return bot.sendMessage(chatId, `Приветствую тебя в телеграм боте`)
            }
            if (text === '/info') {
                const user = await UserModel.findOne({chatId})
                return bot.sendMessage(chatId, `Тебя зовут ${msg.from.first_name} ${msg.from.last_name}, в игре у тебя ${user.right} правильных ответов и ${user.wrong} неправильных`)
            }
            if (text === '/game') {
                return startGame(chatId)
            }
            return bot.sendMessage(chatId, 'Я тебя не понимаю, попробуй еще раз!')
        } catch (e) {
            return bot.sendMessage(chatId, 'Произошла невиданная херь, аааадмииин?!')
        }
    })

    bot.on('callback_query', async msg => {
        const data = msg.data;
        const chatId = msg.message.chat.id;
        if (data === '/again') {
            return startGame(chatId)
        }

        const user = await UserModel.findOne({chatId})

        if (data == chats[chatId]) {
            user.right += 1;
            await bot.sendMessage(chatId, `Нууу, ты отгадал. ${chats[chatId]} - это то что я загадал`, againOptions)
        } else {
            user.wrong += 1;
            await bot.sendMessage(chatId, `Ты не угадал, я загадывал ${chats[chatId]}`, againOptions)
        }
        await user.save();

    })

}

start()