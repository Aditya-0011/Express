const bcrypt = require('bcryptjs')
const User = require('../models/user')

exports.getLogin = (req, res, next) => {
    let message = req.flash('Error')

    if(message.length > 0){
        message = message[0]
    }
    else{
        message = null
    }

    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage: message
    })
}

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password
    User
        .findOne({ email: email })
        .then(user => {
            if (!user) {
                req.flash('Error', 'Invalid credentials!!!')
                return res.redirect('/login')
            }
            bcrypt
                .compare(password, user.password)
                .then(doMatch => {
                    if (doMatch) {
                        req.session.isLoggedIn = true
                        req.session.user = user
                        return req.session.save(err => {
                            res.redirect('/')
                        })
                    }
                    req.flash('Error', 'Invalid credentials!!!')
                    res.redirect('/login')
                })
                .catch(err => {
                    res.redirect('/login');
                });
        })
        .catch(err => console.log(err))

}

exports.postLogout = (req, res, next) => {
    req.session.destroy(() => {
        res.redirect('/')
    })
}

exports.getSignup = (req, res, next) => {
    let message = req.flash('Error')

    if(message.length > 0){
        message = message[0]
    }
    else{
        message = null
    }

    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        errorMessage: message
    })
}

exports.postSignup = (req, res, next) => {
    const email = req.body.email
    const password = req.body.password
    const confirmPassword = req.body.confirmPassword;
    User.findOne({ email: email })
        .then(userDoc => {
            if (userDoc) {
                req.flash('Error', 'Email already exists!!!')
                return res.redirect('/signup')
            }
            return bcrypt
                .hash(password, 12)
                .then(hashedPassword => {
                    const user = new User({
                        email: email,
                        password: hashedPassword,
                        cart: { items: [] }
                    })
                    return user.save()
                })
                .then(result => {
                    res.redirect('/login')
                })
        })
        .catch(err => {
            console.log(err)
        })
}
