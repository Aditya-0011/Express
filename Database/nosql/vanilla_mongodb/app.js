const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')

const adminRoutes = require('./routes/admin')
const shopRoutes = require('./routes/shop')
const errorHandler = require('./controllers/error')
const mongoConnect = require('./utils/database').mongoConnect
const User = require('./models/user')

const app = express()

app.set('view engine', 'ejs')
app.set('views', 'views')


app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')))

app.use((req, res, next) => {
    User
        .findById('64b26511dd08dbcd0e6d3002')
        .then(user => {
            req.user = new User(user.username, user.email, user.cart, user._id)
            next()
        })
        .catch(err => console.log(err))
})

app.use('/admin', adminRoutes)
app.use(shopRoutes)

app.use(errorHandler.pageNotFound)

mongoConnect(() => {
    app.listen(3000)
})