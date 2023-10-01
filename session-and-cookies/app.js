const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const mongoose = require('mongoose')
const session = require('express-session')
const mongoDbStore = require('connect-mongodb-session')(session)

const adminRoutes = require('./routes/admin')
const shopRoutes = require('./routes/shop')
const authRoutes = require('./routes/auth')
const errorHandler = require('./controllers/error')
const User = require('./models/user')

const app = express()
const store = new mongoDbStore({
    uri: 'mongodb+srv://aditya-0011:UaKTgAjKESgT0pMk@cluster0.gdrorud.mongodb.net/shop',
    collection: 'sessions'
})

app.set('view engine', 'ejs')
app.set('views', 'views')


app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')))
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    store: store
}))

app.use((req, res, next) => {
    if(!req.session.user){
        return next()
    }

    User
        .findById(req.session.user._id)
        .then(user => {
            req.user = user
            next()
        })
        .catch(err => console.log(err))
})

app.use('/admin', adminRoutes)
app.use(shopRoutes)
app.use(authRoutes)

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
        console.log('Connected')
        app.listen(3000);
    })
    .catch(err => console.log(err))