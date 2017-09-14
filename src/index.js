import querystring from 'querystring'
import _ from 'lodash'
import bot from './bot'
import message from './messages'
import { Scene, addScene} from './scene'
import db from './models/db'
import User from './models/user'
import Levels from './models/levels'
import { pin } from './ipfs'

const chatIdCongress = process.env.CONGRESS || ''

// bot.on('message', msg => {
//   console.log(msg);
// });

const start = (userId, username) => (
  // приверяем пользователь новый или мы его уже знаем
  User.findOne({ where: { userId } })
    .then((user) => {
      if (user === null) {
        User.create({ userId, username })
        Levels.create({ userId })
        return null
      }
      return user
    })
)

const confirm = {
  1: {
    ok: (msg, data) => {
      const userId = msg.from.id
      const username = data.username
      User.findOne({ where: { username } })
        .then((user) => {
          if (user === null) {
            bot.sendMessage(userId, message('user_not_found', { username }), getOptions());
          } else {
            bot.sendMessage(user.userId, message('step_1_ok.1'), getOptions());
            bot.sendMessage(chatIdCongress, message('step_1_ok.2', { username }), getOptions());
            Levels.update(
              { level1Status: 2 },
              { where: { userId: user.userId } }
            );
            Levels.findOne({ where: { userId: user.userId } })
              .then((levels) => {
                if (levels === null) {
                  Promise.reject('Error levels')
                }
                return pin(levels.level1Result)
              })
              .then((result) => {
                console.log('ipfs', result);
              })
              .catch((e) => {
                console.log(e);
              })
          }
        })
    },
    no: (msg, data) => {
      const userId = msg.from.id
      const username = data.username
      User.findOne({ where: { username } })
        .then((user) => {
          if (user === null) {
            bot.sendMessage(userId, message('user_not_found', { username }), getOptions());
          } else {
            bot.sendMessage(user.userId, message('step_1_ok.3'), getOptions());
            bot.sendMessage(chatIdCongress, message('step_1_ok.4', { username }), getOptions());
            Levels.update(
              { level1Status: 4 },
              { where: { userId: user.userId } }
            );
          }
        })
    }
  },
  3: {
    ok: (msg, data) => {
      const userId = msg.from.id
      const username = data.username
      User.findOne({ where: { username } })
        .then((user) => {
          if (user === null) {
            bot.sendMessage(userId, message('user_not_found', { username }), getOptions());
          } else {
            bot.sendMessage(user.userId, message('step_3_ok.1'), getOptions());
            bot.sendMessage(chatIdCongress, message('step_3_ok.2', { username }), getOptions());
            Levels.update(
              { level3Status: 2 },
              { where: { userId: user.userId } }
            );
          }
        })
    },
    no: (msg, data) => {
      const userId = msg.from.id
      const username = data.username
      User.findOne({ where: { username } })
        .then((user) => {
          if (user === null) {
            bot.sendMessage(userId, message('user_not_found', { username }), getOptions());
          } else {
            bot.sendMessage(user.userId, message('step_3_ok.3'), getOptions());
            bot.sendMessage(chatIdCongress, message('step_3_ok.4', { username }), getOptions());
            Levels.update(
              { level3Status: 4 },
              { where: { userId: user.userId } }
            );
          }
        })
    }
  }
}

const getLevelStatus = (level, userId) => (
  Levels.findOne({ where: { userId } })
    .then((levels) => {
      if (levels === null) {
        Promise.reject('Error')
      } else {
        if (level > 1 && levels['level' + (level - 1) + 'Status'] < 2) {
          return 'no_done'
        } else if (levels['level' + level + 'Status'] === 1) {
          return 'pending'
        } else if (levels['level' + level + 'Status'] === 2) {
          return 'done'
        } else if (levels['level' + level + 'Status'] === 4) {
          return 'not_accepted'
        }
        return 'new'
      }
    })
)

const accessLevel = (level, userId) => {
  return getLevelStatus(level, userId)
    .then((result) => {
      let access = false
      switch (result) {
        case 'new':
        case 'not_accepted':
          access = true
          break;
        case 'no_done':
          bot.sendMessage(userId, message('step_no_done'));
          break;
        case 'pending':
          bot.sendMessage(userId, message('step_pending'));
          break;
        case 'done':
          bot.sendMessage(userId, message('step_done'));
          break;
      }
      if (access) {
        return true
      }
      return false
    })
    .catch(() => {
      bot.sendMessage(userId, 'Error');
    })
}

const runHelp = (level, userId) => {
  bot.sendMessage(userId, message('step_' + level + '_help'), { parse_mode: 'HTML' });
}

const getOptionsLevel = (cmd, data = {}) => {
  if (cmd === 'level') {
    return {
      parse_mode: 'HTML',
      reply_markup: JSON.stringify({
        inline_keyboard: [
          [{ text: 'Отправить ответ', callback_data: querystring.stringify(
            {
              cmd,
              btn: 'done',
              ...data
            }
          ) }],
          [{ text: 'Подсказка', callback_data: querystring.stringify(
            {
              cmd,
              btn: 'help',
              ...data
            }
          ) }]
        ],
        parse_mode: 'Markdown'
      })
    }
  }
  if (cmd === 'confirm') {
    return {
      parse_mode: 'HTML',
      reply_markup: JSON.stringify({
        inline_keyboard: [
          [{ text: 'Принять участника', callback_data: querystring.stringify(
            {
              cmd,
              btn: 'ok',
              ...data
            }
          ) }],
          [{ text: 'Отклонить', callback_data: querystring.stringify(
            {
              cmd,
              btn: 'no',
              ...data
            }
          ) }],
        ],
        parse_mode: 'Markdown'
      })
    }
  }
}

const getOptions = () => {
  return { parse_mode: 'HTML' }
}

const scenes = {}

const runApp = () => {

  bot.on('callback_query', function (msg) {
    const userId = msg.from.id
    const data = querystring.parse(msg.data);
    let text = 'ok'

    if (data.cmd === 'level') {
      if (data.btn === 'done') {
        scenes[data.level].run({ ...msg.message, from: msg.from })
        text = 'Ответ'
      } else if (data.btn === 'help') {
        runHelp(data.level, userId)
        text = 'Подсказка'
      }
    } else if (data.cmd === 'confirm') {
      if (data.btn === 'ok') {
        confirm[data.level].ok({ ...msg.message, from: msg.from }, data)
      } else if (data.btn === 'no') {
        confirm[data.level].no({ ...msg.message, from: msg.from }, data)
      }
    }

    bot.answerCallbackQuery({ callback_query_id: msg.id, text });
  });

  bot.onText(/\/start$/, function (msg) {
    const userId = msg.from.id
    start(userId, '@' + msg.chat.username)
      .then((result) => {
        if (result === null) {
          bot.sendMessage(userId, message('step_1'), getOptionsLevel('level', { level: 1 }));
        } else {
          bot.sendMessage(userId, message('start'), getOptions());
        }
      })
  });

  bot.onText(/\/help$/, function (msg) {
    const userId = msg.from.id
    bot.sendMessage(userId, message('help'), getOptions());
  });

  bot.onText(/\/step_1$/, function (msg) {
    const userId = msg.from.id
    const level = 1
    accessLevel(level, userId)
      .then((result) => {
        if (result) {
          bot.sendMessage(userId, message('step_1'), getOptionsLevel('level', { level }));
        }
      })
  });

  const steps_1 = [
    (scene, msg) => {
      const userId = msg.from.id
      return accessLevel(1, userId)
        .then((result) => {
          if (result) {
            scene.bot.sendMessage(userId, message('step_1_done.1'), getOptions());
            return true
          }
          return false
        })
    },
    (scene, msg) => {
      const userId = msg.from.id
      const ipfshash = msg.text
      if (ipfshash.length !== 46 && ipfshash.substring(0, 2) !== 'Qm') {
        scene.bot.sendMessage(userId, message('step_1_done.2'), getOptions());
      } else {
        scene.bot.sendMessage(userId, message('step_1_done.3'), getOptions());
        scene.bot.sendMessage(chatIdCongress, message('step_1_done.4', { username: msg.chat.username, ipfshash }), getOptionsLevel('confirm', { level: 1, username: '@' + msg.chat.username }));

        Levels.update(
          { level1Status: 1, level1Result: ipfshash },
          { where: { userId } }
        );
      }
      return
    }
  ]
  scenes[1] = new Scene(bot, 'step_1_done$', steps_1)
  addScene(scenes[1]);

  bot.onText(/\/step_2$/, function (msg) {
    const userId = msg.from.id
    const level = 2
    accessLevel(level, userId)
      .then((result) => {
        if (result) {
          bot.sendMessage(userId, message('step_2'), getOptionsLevel('level', { level }));
        }
      })
  });

  const steps_2 = [
    (scene, msg) => {
      const userId = msg.from.id
      return accessLevel(2, userId)
        .then((result) => {
          if (result) {
            scene.bot.sendMessage(userId, message('step_2_done.1'), getOptions());
            return true
          }
          return false
        })
    },
    (scene, msg) => {
      const userId = msg.from.id
      const text = msg.text
      if (text.toLowerCase() !== 'все тоже самое, что и собирался делать') {
        scene.bot.sendMessage(userId, message('step_2_done.2'), getOptions());
      } else {
        scene.bot.sendMessage(userId, message('step_2_done.3'), getOptions());

        Levels.update(
          { level2Status: 2, level2Result: text },
          { where: { userId } }
        );
      }
      return
    }
  ]
  scenes[2] = new Scene(bot, 'step_2_done$', steps_2)
  addScene(scenes[2]);

  bot.onText(/\/step_3$/, function (msg) {
    const userId = msg.from.id
    const level = 3
    accessLevel(level, userId)
      .then((result) => {
        if (result) {
          bot.sendMessage(userId, message('step_3'), getOptionsLevel('level', { level }));
        }
      })
  });

  const steps_3 = [
    (scene, msg) => {
      const userId = msg.from.id
      return accessLevel(3, userId)
        .then((result) => {
          if (result) {
            scene.bot.sendMessage(userId, message('step_3_done.1'), getOptions());
            return true
          }
          return false
        })
    },
    (scene, msg) => {
      const userId = msg.from.id
      const text = msg.text
      scene.bot.sendMessage(userId, message('step_3_done.2'), getOptions());
      scene.bot.sendMessage(chatIdCongress, message('step_3_done.3', { username: msg.chat.username, text }), getOptionsLevel('confirm', { level: 3, username: '@' + msg.chat.username }));

      Levels.update(
        { level3Status: 1, level3Result: text },
        { where: { userId } }
      );
      return
    }
  ]
  scenes[3] = new Scene(bot, 'step_3_done$', steps_3)
  addScene(scenes[3]);

  bot.onText(/\/step_1_help$/, function (msg) {
    const userId = msg.from.id
    runHelp(1, userId)
  });

  bot.onText(/\/step_2_help$/, function (msg) {
    const userId = msg.from.id
    runHelp(2, userId)
  });

  bot.onText(/\/step_3_help$/, function (msg) {
    const userId = msg.from.id
    runHelp(3, userId)
  });
}

db.sequelize.sync()
  .then(() => {
    runApp()
  })
  .catch((e) => {
    console.log(e);
  })
