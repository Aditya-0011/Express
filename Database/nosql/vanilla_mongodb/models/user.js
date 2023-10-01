const mongodb = require('mongodb')

const getDB = require('../utils/database').getDb

class User{
    constructor(username, email, cart, id){
        this.username = username
        this.email = email
        this.cart = cart
        this._id = id ? new mongodb.ObjectId(id) : null
    }

    save(){
        const db = getDB()
        let dbOp
        if(this._id){
            dbOp = db
                .collection('users')
                .updateOne({ _id: this._id }, { $set: this })
        }
        else{
            dbOp = db
                .collection('users')
                .insertOne(this)
        }
        return dbOp
            .then(result => console.log(result))
            .catch(err => console.log(err))
    }

    static findById(userId){
        const db = getDB()
        return db
            .collection('users')
            .findOne({ _id: new mongodb.ObjectId(userId) }) // if using find(), use next() also
            .then(user => {
                console.log(user)
                return user
            })
            .catch(err => console.log(err))
    }

    addToCart(product){
        const cartProductIndex = this.cart.items.findIndex(cp => {
            return (cp.productId).toString() === (product._id).toString()
        })

        let newQuantity = 1
        const  updatedCartItems = [ ...this.cart.items ]

        if(cartProductIndex >= 0){
            newQuantity = this.cart.items[cartProductIndex].quantity + 1
            updatedCartItems[cartProductIndex].quantity = newQuantity
        }
        else{
            updatedCartItems.push({
                productId: new mongodb.ObjectId(product._id),
                quantity: newQuantity
            })
        }

        const updatedCart = {
            items: updatedCartItems
        }

        const db = getDB()
        return db
            .collection('users')
            .updateOne({ _id: new mongodb.ObjectId(this._id) }, { $set: { cart: updatedCart } })
    }

    getCart(){
        const db = getDB()
        const productIds = this.cart.items.map(i => {
            return i.productId
        })
        return db
            .collection('products')
            .find({ _id: { $in: productIds } })
            .toArray()
            .then(products => {
                return products.map(p => {
                    return {
                        ...p,
                        quantity: this.cart.items.find(i => {
                            return (i.productId).toString() === (p._id).toString()
                        }).quantity
                    }
                })
            })
    }

    deleteCartItem(productId){
        const updatedCartItems = this.cart.items.filter(item => {
            return (item.productId).toString() !== productId.toString()
        })

        const db = getDB()
        return db
            .collection('users')
            .updateOne({ _id: new mongodb.ObjectId(this._id) }, { $set: { cart: { items: updatedCartItems } } })
    }

    addOrder(){
        const db = getDB()
        return this.getCart()
            .then(products => {
                const order = {
                items: products,
                user: {
                    _id: new mongodb.ObjectId(this._id),
                    name: this.username,
                    email: this.email
                }
            }
            return db
                .collection('orders')
                .insertOne(order)
        })
            .then(result => {
            this.cart = { items: [] }
            return db
                .collection('users')
                .updateOne({ _id: new mongodb.ObjectId(this._id) }, { $set: { cart: { items: [] } } })
        })
    }

    getOrder(){
        const db = getDB()
        return db
            .collection('orders')
            .find({ 'user._id': new mongodb.ObjectId(this._id) })
            .toArray()
    }
}


module.exports = User