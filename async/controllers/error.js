exports.pageNotFound = (req, res, next) => {
    res.status(404).render('404', {
        pageTitle: 'Page Not Found',
        path: '/404',
        isAuthenticated: req.session.isLoggedIn
    })
}

exports.serverError = (req, res, next) => {
    res.status(500).render('500', {
        pageTitle: 'Error',
        path: '/500',
        isAuthenticated: req.session.isLoggedIn
    })
}