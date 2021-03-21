//const { timeStamp } = require("console");
const mongoose = require("mongoose");

const Schema = mongoose.Schema

const UserSchema = new Schema({
    name:{
        type:String
    },

    email:{
        type:String
    },
    phone:{
        type: String
    },
    password:{
        type:String
    }

},{timestamps: true})

const User = mongoose.model('User', UserSchema,"User")

module.exports= User;