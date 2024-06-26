const Product = require('../models/product')

exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: "Add Product",
        path: '/admin/add-product',
        editing: false
    })
}

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title
    const imageUrl = req.body.imageUrl
    const price = req.body.price
    const description = req.body.description
    req.user
        .createProduct({//Magic Method
        title: title,
        price: price,
        imageUrl: imageUrl,
        description: description,
    })
    // Product
    //     .create({
    //         title: title,
    //         price: price,
    //         imageUrl: imageUrl,
    //         description: description,
    //     })
        .then(result => {
            res.redirect('/admin/products')
        })
        .catch(err => {
            console.log(err)
        })
}

exports.getProducts = (req, res, next) => {
    req.user
        .getProducts()//Magic Methods
    // Product
    //     .findAll()
        .then((products) => {
            res.render('admin/products', {
                products: products,
                pageTitle: 'Admin Products',
                path: '/admin/products'
            })
        })
        .catch(err => {
            console.log(err)
        })
}

exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit
    if(!editMode){
       return res.redirect('/')
    }
    const productId = req.params.productId
    req.user
        .getProducts({where:{id: productId}})//Magic Method

    // Product
    //     .findByPk(productId)
        .then((products) => {
            const product = products[0]
            if(!product){
                return res.redirect('/')
            }
            res.render('admin/edit-product', {
                pageTitle: "Edit Product",
                path: '/admin/edit-product',
                editing: editMode,
                product: product
            })
        })
        .catch(err => {
            console.log(err)
        })

}

exports.postEditProduct =  (req, res, next) => {
    const productId = req.body.productId

    // Method - 1
    const { title, price, imageUrl, description } = req.body
    Product
        .update(
        { title, price, imageUrl, description },
        {
            where: {
                id: productId
            }
        })
        .then(() => res.redirect('/admin/products'))


    // Method - 2
    // const updatedTitle = req.body.title
    // const updatedImageUrl = req.body.imageUrl
    // const updatedPrice = req.body.price
    // const updatedDescription = req.body.description
    // Product
    //     .findByPk(productId)
    //     .then(product => {
    //         product.title = updatedTitle
    //         product.imageUrl = updatedImageUrl
    //         product.price = updatedPrice
    //         product.description = updatedDescription
    //         return product.save()
    //
    //     })
    //     .then(result => {
    //         res.redirect('/admin/products')
    //     })
    //     .catch(err => {
    //         console.log(err)
    //     })
}

exports.postDeleteProduct =  (req, res, next) => {
    const productId = req.body.productId
     Product
         .destroy({
            where: {
                id: productId
            }
        })
         .then(() => res.redirect('/admin/products'))

}