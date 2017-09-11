import TelegramBot from 'node-telegram-bot-api'

const TOKEN = process.env.TOKEN_BOT || '';

const bot = new TelegramBot(TOKEN, { polling: true });

export default bot
