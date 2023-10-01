const Product = require('../models/product')
const Order = require('../models/order')

exports.getProducts = (req, res, next) => {
    Product
        .find()
        .then((products) => {
            res.render('shop/product-list', {
                products: products,
                pageTitle: 'All Products',
                path: '/products',
                isAuthenticated: req.session.isLoggedIn
            })
        })
        .catch(err => {
            console.log(err)
        })
}
exports.getProduct = (req, res, next) => {
    const productId = req.params.productId
    Product
        .findById(productId)
        .then(product => {
            res.render('shop/product-detail', {
                product: product,
                pageTitle: product.title,
                path: '/products',
                isAuthenticated: req.session.isLoggedIn
            })
        })
}

exports.getIndex = (req, res, next) => {
    Product
        .find()
        .then((products) => {
            res.render('shop/index', {
                products: products,
                pageTitle: 'Shop',
                path: '/',
                isAuthenticated: req.session.isLoggedIn
            })
        })
        .catch(err => {
            console.log(err)
        })
}

exports.getCart = (req, res, next) => {
    req.user
        .populate('cart.items.productId')
        .then(user => {
            const products = user.cart.items
            res.render('shop/cart', {
                path: '/cart',
                pageTitle: 'Your Cart',
                products: products,
                isAuthenticated: req.session.isLoggedIn
            })
        })
        .catch(err => {
            console.log(err)
        })
}

exports.postCart = (req, res, next) => {
    const productId = req.body.productId
    Product
        .findById(productId)
        .then(product => req.user.addToCart(product))
        .then(result => res.redirect('/cart'))
}

// exports.getCheckout = (req, res, next) => {
//     res.render('shop/checkout', {
//         path: '/checkout',
//         pageTitle: 'Checkout'
//     })
// }

exports.postCartDeleteItem = (req, res, next) => {
    const productId = req.body.productId
    req.user
        .deleteCartItem(productId)
        .then(() => {
            res.redirect('/cart')
        })
        .catch(err => {
            console.log(err)
        })
}

exports.getOrders = (req, res, next) => {
    Order.find({ 'user.userId': req.user._id })
        .then(orders => {
            res.render('shop/orders', {
                path: '/orders',
                pageTitle: 'Your Orders',
                orders: orders,
                isAuthenticated: req.session.isLoggedIn
            })
        })
        .catch(err => {
            console.log(err)
        })
}

exports.postOrder = (req, res, next) => {
    req.user
        .populate('cart.items.productId')
        .then(user => {
            const products = user.cart.items.map(i => {
                return {
                    quantity: i.quantity,
                    product: { ...i.productId._doc }
                }
            })
            const order = new Order({
                user: {
                    name: req.user.name,
                    userId: req.user
                },
                products: products
            })
            return order.save()
        })
        .then(result => {
            return req.user.clearCart()
        })
        .then(() => {
            res.redirect('/orders')
        })
        .catch(err => {
            console.log(err)
        })
}


