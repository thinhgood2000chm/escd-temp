const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema({
    type:String,
    name :{
        type: String
    },
    price :Number,
    discount: Number,
    timestart:String,
    timeend:String,
    checkDiscount:String,
    image :{
        type: String 
    },
    description :{
        type: String
    },
    properties:[{
        color: String,
        classify:[{
            size: String,
            amount: Number
        }]
        

    }]
    
},{timestamps:true})

const product = mongoose.model("product", productSchema, "product")
module.exports= product;