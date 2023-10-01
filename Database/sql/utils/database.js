const { Sequelize } = require('sequelize')

const sequelize = new Sequelize('eCommerceDemo', 'postgres', '12345', {
    dialect: 'postgres',
    host:'localhost'
})

module.exports = sequelize