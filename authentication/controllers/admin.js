const Product = require('../models/product')

exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: "Add Product",
        path: '/admin/add-product',
        editing: false,
    })
}

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title
    const imageUrl = req.body.imageUrl
    const price = req.body.price
    const description = req.body.description
    const product = new Product({
        title: title,
        price: price,
        imageUrl: imageUrl,
        description: description,
        userId: req.user
        }
    )
    product
        .save()
        .then(result => {
            res.redirect('/admin/products')
        })
        .catch(err => {
            console.log(err)
        })
    }

exports.getProducts = (req, res, next) => {
    Product
        .find()
        .then(products => {
            res.render('admin/products', {
                products: products,
                pageTitle: 'Admin Products',
                path: '/admin/products',
            })
        })
        .catch(err => console.log(err))
}

exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit
    if(!editMode){
       return res.redirect('/')
    }
    const productId = req.params.productId

    Product
        .findById(productId)
        .then(product => {
            if(!product){
                return res.redirect('/')
            }
            res.render('admin/edit-product', {
                pageTitle: "Edit Product",
                path: '/admin/edit-product',
                editing: editMode,
                product: product,
            })
        })
        .catch(err => {
            console.log(err)
        })

}

exports.postEditProduct =  (req, res, next) => {
    const productId = req.body.productId
    const updatedTitle = req.body.title
    const updatedImageUrl = req.body.imageUrl
    const updatedPrice = req.body.price
    const updatedDescription = req.body.description
    Product
        .findById(productId)
        .then(product => {
            product.title = updatedTitle
            product.price = updatedPrice
            product.imageUrl = updatedImageUrl
            product.description = updatedDescription
            return product.save()
        })
        .then(result => {
            res.redirect('/admin/products')
        })
        .catch(err => console.log(err))
}

exports.postDeleteProduct =  (req, res, next) => {
    const productId = req.body.productId
     Product
         .findByIdAndRemove(productId)
         .then(() => res.redirect('/admin/products'))
         .catch(err => console.log(err))
}