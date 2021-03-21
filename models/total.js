const mongoose = require('mongoose')
const Schema = mongoose.Schema

const totalSchema= new Schema({
    year:String,
    months:String,
    totalPrice: Number
},{timestamps:true})
const total = mongoose.model('total', totalSchema, 'total')
module.exports= total