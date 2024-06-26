const { DataTypes} = require('sequelize')

const sequelize = require('../utils/database')

const cartItem = sequelize.define('cartItem', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    quantity: DataTypes.INTEGER
})

module.exports = cartItem