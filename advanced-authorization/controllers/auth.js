const bcrypt = require('bcryptjs')
const nodemailer = require('nodemailer')
const crypto = require('crypto')

const User = require('../models/user')

const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    auth:{
        user: "aditya.219301222@muj.manipal.edu",
        pass: "NsHmCPjXWOVq0dKT"
    }
})

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
                    return transporter.sendMail({
                        from:"no-reply@node-shop.com",
                        to: req.body.email,
                        subject: "Signup",
                        html:"<h1>Signup Successful</h1>"
                    })
                })
                .catch(err => {
                    console.log(`Send Email error: ${err}`)
                })
        })
        .catch(err => {
            console.log(err)
        })
}

exports.getReset = (req, res, next) => {
    let message = req.flash('Error')

    if(message.length > 0){
        message = message[0]
    }
    else{
        message = null
    }

    res.render('auth/reset', {
        path: '/reset',
        pageTitle: 'Reset',
        errorMessage: message
    })
}

exports.postReset = (req, res, next) =>{
    crypto.randomBytes(32, (err, buffer) => {
        if(err){
            return res.redirect('/reset')
        }
        const token = buffer.toString('hex')
        User
            .findOne({email: req.body.email})
            .then(user => {
                if(!user){
                    req.flash('Error', 'No account found.')
                    return res.redirect('/reset')
                }
                user.resetToken = token
                user.resetTokenExpiration = Date.now() + 3600000
                return user.save()
            })
            .then(result => {

                res.redirect('/')
                return transporter.sendMail({
                    from:"no-reply@node-shop.com",
                    to: req.body.email,
                    subject: "Password reset",
                    html:`
                        <p>You requested password reset</p>
                        <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password</p>
                    `
                })
            })
            .catch(err => console.log(err))
    })
}

exports.getNewPassword = (req, res, next) => {
    const token = req.params.token
    User
        .findOne({resetToken: token, resetTokenExpiration: {$gt: Date.now()}})
        .then(user => {
            let message = req.flash('Error')
            if(message.length > 0){
                message = message[0]
            }
            else{
                message = null
            }

            res.render('auth/new-password', {
                path: '/new-password',
                pageTitle: 'Reset',
                errorMessage: message,
                userId: user._id.toString(),
                passwordToken: token
            })
        })
        .catch(err => console.log(err))
}

exports.postNewPassword = (req, res, next) => {
    const newPassword = req.body.password
    const userId = req.body.userId
    const passwordToken = req.body.passwordToken
    let resetUser

    User
        .findOne({
            resetToken: passwordToken,
            resetTokenExpiration: {$gt: Date.now()}, _id: userId
        })
        .then(user => {
            resetUser = user
            return bcrypt.hash(newPassword, 12)
        })
        .then(hashedPassword => {
            resetUser.password = hashedPassword
            resetUser.resetToken = undefined
            resetUser.resetTokenExpiration = undefined
            return resetUser.save()
        })
        .then(result => {
            res.redirect('/login')
        })
        .catch(err => console.log(err))
}