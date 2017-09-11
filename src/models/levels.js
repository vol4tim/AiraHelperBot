import db from './db'

const Levels = db.sequelize.define('levels', {
  userId: {
    type: db.Sequelize.STRING,
    unique: true
  },
  level1Status: {
    type: db.Sequelize.INTEGER,
    defaultValue: 0
  },
  level2Status: {
    type: db.Sequelize.INTEGER,
    defaultValue: 0
  },
  level3Status: {
    type: db.Sequelize.INTEGER,
    defaultValue: 0
  },
  level1Result: {
    type: db.Sequelize.STRING
  },
  level2Result: {
    type: db.Sequelize.STRING
  },
  level3Result: {
    type: db.Sequelize.STRING
  }
});

export default Levels
