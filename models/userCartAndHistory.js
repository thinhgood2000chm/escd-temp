const mongoose = require("mongoose");

const Schema = mongoose.Schema

const UserCartAndHistory= new Schema({
    idFromProduct: String,
    nameUser: String,
    email: String,
    phone:String,
    check: String,
    checkAdmin:String,// dùng để hiển thị sản phẩm lên trang total 
    acceptAdmin:String,// dùng để hiển thị hoặc xóa sp sau khi đã bấm chấp nhận
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