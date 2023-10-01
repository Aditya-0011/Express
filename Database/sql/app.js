const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')

const adminRoutes = require('./routes/admin')
const shopRoutes = require('./routes/shop')
const errorHandler = require('./controllers/error')
const sequelize = require('./utils/database')
const Product = require('./models/product')
const User = require('./models/user')
const Cart = require('./models/cart')
const cartItem = require('./models/cart-item')
const orderItem = require('./models/order-item')
const Order = require('./models/order')

const app = express()

app.set('view engine', 'ejs')
app.set('views', 'views')


app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')))

app.use((req, res, next) => {
    User
        .findByPk(1)
        .then(user => {
            req.user = user
            next()
        })
        .catch(err => console.log(err))
})

app.use('/admin', adminRoutes)
app.use(shopRoutes)

app.use(errorHandler.pageNotFound)

Product.belongsTo(User, {
    constraints: true,
    onDelete: 'CASCADE'
})
User.hasMany(Product)
User.hasOne(Cart)
Cart.belongsTo(User)
Cart.belongsToMany(Product, { through: cartItem })
Product.belongsToMany(Cart, { through: cartItem })
Order.belongsTo(User)
User.hasMany(Order)
Order.belongsToMany(Product, { through: orderItem })

sequelize
    .sync() //.sync({force: true})
    .then(() => {
        return User.findByPk(1)
    })
    .then(user => {
        if(!user){
            return User.create({name: 'Aditya', email: 'test@test.com'})
        }
        return user
    })
    .then((user) => {
        return user.createCart()
    })
    .then(() => {
        app.listen(3000)
    })
    .catch(err => {
        console.log(err)
    })
