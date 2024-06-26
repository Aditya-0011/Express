const Product = require('../models/product')

exports.getProducts = (req, res, next) => {
    Product
        .findAll()
        .then((products) => {
            res.render('shop/product-list', {
                products: products,
                pageTitle: 'All Products',
                path: '/products'
            })
        })
        .catch(err => {
            console.log(err)
        })
}
exports.getProduct = (req, res, next) => {
    const productId = req.params.productId

    // Method - 1
    // Product
    //     .findAll({
    //         where: {
    //             id: productId
    //         }
    //     })
    //     .then(product => {
    //         res.render('shop/product-detail', {
    //             product: product[0],
    //             pageTitle: product[0].title,
    //             path: '/products'
    //         })
    //     })

    // Method - 2
    Product
        .findByPk(productId)
        .then(product => {
            res.render('shop/product-detail', {
                product: product,
                pageTitle: product.title,
                path: '/products'
            })
        })
}

exports.getIndex = (req, res, next) => {
    Product
        .findAll()
        .then((products) => {
            res.render('shop/index', {
                products: products,
                pageTitle: 'Shop',
                path: '/'
            })
        })
        .catch(err => {
            console.log(err)
        })
}

exports.getCart = (req, res, next) => {
    req.user
        .getCart()
        .then((cart) => {
            cart
                .getProducts()
                .then(products => {
                    res.render('shop/cart', {
                        path: '/cart',
                        pageTitle: 'Your Cart',
                        products: products
                    })
                })
                .catch(err => {
                    console.log(err)
                })
        })
        .catch(err => {
            console.log(err)
        })
}

exports.postCart = (req, res, next) => {
    const productId = req.body.productId
    let fetchedCart
    let newQuantity = 1
    req.user
        .getCart()
        .then(cart => {
            fetchedCart = cart
            return cart.getProducts({ where: { id: productId } })
        })
        .then(products => {
            let product
            if(products.length > 0){
                product = products[0]
            }
            if(product){
                const oldQuantity = product.cartItem.quantity
                newQuantity = oldQuantity + 1
                return product
            }
            return Product.findByPk(productId)
        })
        .then(product => {
            return fetchedCart.addProduct(product, { through: { quantity: newQuantity } })
        })
        .then(() => {
            res.redirect('/cart')
        })
        .catch(err => {
            console.log(err)
        })
    // res.render('shop/cart', {
    //     path: '/cart',
    //     pageTitle: 'Your Cart'
    // })
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
        .getCart()
        .then(cart => {
            return cart.getProducts({ where: { id: productId } })
        })
        .then(products => {
            const product = products[0]
            return product.cartItem.destroy()
        })
        .then(() => {
            res.redirect('/cart')
        })
        .catch(err => {
            console.log(err)
        })
}

exports.getOrders = (req, res, next) => {
    req.user
        .getOrders({ include: ['products'] })
        .then(orders => {
            res.render('shop/orders', {
                path: '/orders',
                pageTitle: 'Your Orders',
                orders: orders
            })
        })
        .catch(err => {
            console.log(err)
        })
}

exports.postOrder = (req, res, next) => {
    let fetchedCart
    req.user
        .getCart()
        .then(cart => {
            fetchedCart = cart
            return cart.getProducts()
        })
        .then(products => {
            return req.user
                .createOrder()
                .then(order => {
                    order.addProducts(products.map(product => {
                        product.orderItem ={ quantity: product.cartItem.quantity }
                        return product
                    }))
                })
                .catch(err => {
                    console.log(err)
                })
        })
        .then(result => {
            return fetchedCart.setProducts(null)
        })
        .then(result => {
            res.redirect('/orders')
        })
        .catch(err => {
            console.log(err)
        })
}


