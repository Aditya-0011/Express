const User = require('../models/user')

exports.getLogin = (req, res, next) => {
    console.log(req.session.isLoggedIn)
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        isAuthenticated: false
    })
}

exports.postLogin = (req, res, next) => {
    User
        .findById('64ba87f702b2f71924fdf9c0')
        .then(user => {
            req.session.isLoggedIn = true
            req.session.user = user
            req.session.save(() => {
                res.redirect('/')
            })
        })
        .catch(err => console.log(err))

}

exports.postLogout = (req, res, next) => {
    req.session.destroy(() => {
        res.redirect('/')
    })
}
