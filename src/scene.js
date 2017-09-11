import Promise from 'bluebird'
import _ from 'lodash'

class Scene {
  constructor(bot, command, steps) {
    this.bot = bot
    this.command = command
    this.history = {}
    if (_.isArray(steps)) {
      this.stepsName = [];
      for (var i = 0; i < steps.length; i++) {
        this.stepsName.push(i)
      }
      this.steps = steps
    } else {
      this.stepsName = _.keys(steps)
      this.steps = _.values(steps)
    }
  }

  run(msg) {
    const userId = msg.from.id
    this.history[userId] = {}
    this.step(msg)
  }

  step(msg) {
    const userId = msg.from.id
    if (_.has(this.history, userId)) {
      const currentStep = _.keys(this.history[userId]).length
      const result = this.steps[currentStep](this, msg, this.history[userId])
      if (_.isObject(result) && _.isFunction(result.then)) {
        result
          .then((r) => {
            if (r === false) {
              this.stop(userId, currentStep, true)
            } else {
              this.history[userId][this.stepsName[currentStep]] = r
              this.stop(userId, currentStep)
            }
          })
          .catch(() => {
            this.stop(userId, currentStep, true)
          })
      } else if (result === false) {
        this.stop(userId, currentStep, true)
      } else {
        this.history[userId][this.stepsName[currentStep]] = result
        this.stop(userId, currentStep)
      }
    }
  }

  stop(userId, currentStep, isForce = false) {
    if (isForce || !_.has(this.steps, (currentStep + 1))) {
      this.history = _.omit(this.history, userId);
    }
  }
}

const addScene = (scene) => {
  const command = new RegExp('/' + scene.command);
  scene.bot.onText(command, (msg) => {
    scene.run(msg)
  });
  scene.bot.on('text', (msg) => {
    scene.step(msg)
  })
}

export {
  addScene,
  Scene
}
