import path from 'path'
import Sequelize from 'sequelize'

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '/../../.../database.sqlite'),
  logging: false
});

const db = {}
db.Sequelize = Sequelize
db.sequelize = sequelize
db.model = {}
// db.model['user'] = sequelize.import(path.join(__dirname, 'user'));

export default db
