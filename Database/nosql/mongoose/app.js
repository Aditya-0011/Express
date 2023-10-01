const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')

const adminRoutes = require('./routes/admin')
const shopRoutes = require('./routes/shop')
const errorHandler = require('./controllers/error')
const mongoose = require('mongoose')
const User = require('./models/user')

const app = express()

app.set('view engine', 'ejs')
app.set('views', 'views')


app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')))

app.use((req, res, next) => {
    User
        .findById('64ba87f702b2f71924fdf9c0')
        .then(user => {
            req.user = user
            next()
        })
        .catch(err => console.log(err))
})

app.use('/admin', adminRoutes)
app.use(shopRoutes)

app.use(errorHandler.pageNotFound)

mongoose
    .connect(
        'mongodb+srv://aditya-0011:UaKTgAjKESgT0pMk@cluster0.gdrorud.mongodb.net/shop'
        )
    .then(result => {
        // const user = new User({
        //     name: 'Aditya',
        //     email: 'aditya@test.com',
        //     cart: {
        //         items: []
        //     }
        // })
        // user.save()
        app.listen(3000);
    })
    .catch(err => console.log(err))