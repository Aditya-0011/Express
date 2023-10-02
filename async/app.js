const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const mongoose = require('mongoose')
const session = require('express-session')
const mongoDbStore = require('connect-mongodb-session')(session)
const csrf = require('csurf')
const flash = require('connect-flash')
const multer = require('multer')

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
const csrfProtection = csrf()

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images')
    },
    filename:(req, file, cb) => {
        cb(null, new Date().getTime() + "-" + file.originalname)
    }
})

const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg' ||
        file.mimetype === 'images/jfif'
    ) {
      cb(null, true)
    }
    else {
        cb(null, false)
    }
}

app.set('view engine', 'ejs')
app.set('views', 'views')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('image'))
app.use(express.static(path.join(__dirname, 'public')))
app.use('/images', express.static(path.join(__dirname, 'images')))
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    store: store
}))
app.use(csrfProtection)
app.use(flash())

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn
    res.locals.csrfToken = req.csrfToken()
    next()
})

app.use((req, res, next) => {
    if(!req.session.user){
        return next()
    }

    User
        .findById(req.session.user._id)
        .then(user => {
            if (!user) {
              return next()
            }
            req.user = user
            next()
        })
        .catch(err => {
            next(new Error(err))
        })
})


app.use('/admin', adminRoutes)
app.use(shopRoutes)
app.use(authRoutes)

app.get("/500", errorHandler.serverError)

app.use(errorHandler.pageNotFound)

app.use((error, req, res, next) => {
    res.status(500).render('500', {
        pageTitle: 'Error',
        path: '/500',
        isAuthenticated: req.session.isLoggedIn
    })
})

mongoose
    .connect(
        'mongodb+srv://aditya-0011:UaKTgAjKESgT0pMk@cluster0.gdrorud.mongodb.net/shop'
    )
    .then(result => {
        console.log('Connected')
        app.listen(3000);
    })
    .catch(err => console.log(err))