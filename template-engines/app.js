const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
// const expressHbs = require('express-handlebars') for Handlebars

const adminData = require('./routes/admin')
const shopRoutes = require('./routes/shop')

const app = express()

app.set('view engine', 'ejs')
app.set('views', 'views')

// for Handlebars
// app.engine('hbs', expressHbs.engine({
//     extname: 'hbs',
//     layoutsDir:'views/layouts' ,
//     defaultLayout: 'main-layout'
// }));
// app.set('view engine', 'hbs')
// app.set('views', 'views')

// app.set('view engine', 'pug')  For Pug
// app.set('views', 'views') For Pug

app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')))

app.use('/admin', adminData.routes)
app.use(shopRoutes)

app.use('/', (req, res, next) => {
    // res.status(404).sendFile(path.join(__dirname, 'views', '404.html'))
    // res.status(404).render('404', { pageTitle: 'Page Not Found' }) for Pug
    res.status(404).render('404', { pageTitle: 'Page Not Found' })
})

app.listen(3000)