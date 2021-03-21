const mongoose = require("mongoose");

const Schema = mongoose.Schema

const UserCartAndHistory= new Schema({
    idFromProduct: String,
    nameUser: String,
    email: String,
    phone:String,
    check: String,
    type:String,
    name: String,
    image: String,
    price: Number,
    color: String,
    size: String,
    amount: Number,
    year:String,
    months: String

},{timestamps: true})
const cartAndHistory = mongoose.model('cartAndHistory',UserCartAndHistory,'cartAndHistory')
module.exports=cartAndHistory