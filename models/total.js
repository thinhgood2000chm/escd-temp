const mongoose = require('mongoose')
const Schema = mongoose.Schema

const totalsSchema= new Schema({
  
    nameUser: String,
    email: String,
    phone:String,
    type:String,
    name: String,
    image: String,
    price: Number,
    color: String, 
    size: String,
    amount: Number,
    year:String,
    months: String

},{timestamps:true})
const total = mongoose.model('total', totalsSchema, 'total')
module.exports= total