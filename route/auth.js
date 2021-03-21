const express = require("express");
const router = express.Router();
const authController = require("../controller/authController");
const upload = require("../middleWare/upload");

router.post('/register',authController.register)
router.post('/login', authController.login)
router.post('/addProduct',upload.single('image'),authController.addProduct)
router.post('/delete',authController.deleteProduct)
router.post('/update',upload.single('image'),authController.updateProduct)
router.post('/detail', authController.InsertCart)
router.post('/payment', authController.payment)
router.post('/totalPrice', authController.totalPrice)
router.post('/search',authController.search)
module.exports=router