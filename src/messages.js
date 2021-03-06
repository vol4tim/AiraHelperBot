import format from 'string-template'
import _ from 'lodash'

const messages = {
  'help': 'Вы можете отправить следующие команды:\n\n/step_1 - Задание №1\n/step_1_done - Отправить ответ по заданию №1\n/step_1_help - Подсказка по заданию №1\n\n/step_2 - Задание №2\n/step_2_done - Отправить ответ по заданию №2\n/step_3_help - Подсказка по заданию №2\n\n/step_3 - Задание №3\n/step_3_done - Отправить ответ по заданию №3\n/step_3_help - Подсказка по заданию №3\n\n',
  'start': 'Привет человек!',
  'step_no_done': "Вы еще не прошли предыдущий урок",
  'step_done': "Задание пройдено, двигайтесь дальше.",
  'step_pending': "Ожидается результат.",
  'access_congress': "Доступ закрыт",
  'user_not_found': "Пользователь {username} не найден(",

  'step_1': "Хаяо Миядзаки\n\Хаяо Миядзаки считал, что важнее всего построить студию Ghibli, как место куда приходят реализовывать себя. Airalab организация в сети Интернет и чтобы войти в неё я придумал следующую задачку.\n\n По этой <a href='https://ipfs.io/ipfs/QmPaxqxAKqKhWGNngwuUVFuBEoBB55dhmHDA8AL6coLtve'>ссылке</a> документ под названием “Согласие с правилами работы в организации”. Внутри него оригинальный текст, написанный на входе в студию Миядзаки. Найдите способ понять, что там написано и согласиться с семью пунктами правил. Распечатайте, поставьте подпись, сделайте скан и загрузите в ipfs. Хеш получившегося файла присылайте telegram боту @AiraHelperBot c помощью команды /step_1_done.\n\nP.S.: оригинал поставьте в рамочку или под стекло, красиво выглядит!\n\nПодсказка: /step_1_help",
  'step_1_done.1': "Укажите hash файла, сохраненного в ipfs.",
  'step_1_done.2': "Ваш ответ не корректный.",
  'step_1_done.3': "Ваш ответ принят, в ближайшее время я Вам сообщу результат.",
  'step_1_done.4': "Появился новый кандидат @{username} подписавший соглашение <a href='https://ipfs.io/ipfs/{ipfshash}'>{ipfshash}</a>.",
  'step_1_ok.1': "Ваше первое задание успешно выполнено, теперь вы можете пройти следующее задание /step_2",
  'step_1_ok.2': "{username} предложено пройти следующее задание.",
  'step_1_ok.3': "Ваш ответ не принят, попробуйте пройти задание сново /step_1",
  'step_1_ok.4': "Ответ {username} не принят.",
  'step_1_help': "Пройдя по этой <a href='https://github.com/PavelSheremetev/simple_scripts_ipfs/blob/master/README_RU.md'>ссылке</a> можно прочитать как работать с ipfs",

  'step_2': "А чтобы вы делали, если у вас было 100,000$\n\nЧтобы точно быть уверенным, что хочешь работать в этой организации, то ответ на вопрос в заголовке должен быть - “Все тоже самое, что и собирался делать”.\n\nТ.е. нет смысла пробовать себя в работе некоммерческой организации, если твоя цель исключительно заработать деньги и после заняться чем то еще.\n\nДля решения этого шага: /step_2_done\n\nПодсказка: /step_2_help",
  'step_2_done.1': "Напишите ваш ответ.",
  'step_2_done.2': "Ваш ответ нас не устраивает.",
  'step_2_done.3': "Ваш ответ принят, вы можете пройти следующее задание /step_3",
  'step_2_help': "Ответ должен быть “Все тоже самое, что и собирался делать”",

  'step_3': "У вас должна быть личная цель для работы в Airalab\n\nИтак, испытание Хаяо и 100,000$ пройдено, тогда последний момент. У человека должна быть личная цель в работе, напишите её в данный чат.\n\nДля решения этого шага: /step_3_done\n\nПодсказка: /step_3_help",
  'step_3_done.1': "Напишите ваш ответ.",
  'step_3_done.2': "Ваш ответ принят, в ближайшее время я Вам сообщу результат.",
  'step_3_done.3': "@{username} ответил на задание №3 “{text}”",
  'step_3_ok.1': "Ваш ответ принят, вы можете вступить в нашу команду <a href='https://t.me/joinchat/A6wE1EOFKp7Js3vfI2F-yw'>перейти</a>",
  'step_3_ok.2': "{username} предложено вступить в нашу команду.",
  'step_3_ok.3': "Ваш ответ не принят, попробуйте пройти задание сново /step_3",
  'step_3_ok.4': "Ответ {username} не принят.",
  'step_3_help': "В этом задании можно написать любой произвольный текст)"
}

export default (message, params = {}) => {
  if (_.isEmpty(params)) {
    return messages[message]
  }
  return format(messages[message], params)
}
