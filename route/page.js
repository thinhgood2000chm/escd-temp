const express = require("express");
const router = express.Router();
const productModule = require('../models/product')
const authenticate = require("../middleWare/authenticate")
const authController = require("../controller/authController");
const userCartAndHistory = require('../models/userCartAndHistory')
var ucah= userCartAndHistory.find({})
const total = require('../models/total')

var product = productModule.find({})// cái này là cách show data ra ( cách 2 ), cách 1 dùng find({}, (er, doc)=>{ code ...}) với doc là mảng chứa các dữ liệu của bảng

router.get("/register",(req,res)=>{
    res.render('register')
})
router.get("/login",(req,res)=>{
    if(req.cookies.user){
        if(req.cookies.user.includes("admin752")){
            res.redirect('/admin')
        }
        else{
                 res.redirect('/cart')
        }
    }
    else
    res.render("login")
})

// hiển thị dữ liệu ra trang admin, thông báo sản phẩm sắp hết, kiểm tra thời hạn giảm giá
router.get('/admin',authenticate, (req,res)=>{     
    var arr =[]// mảng dùng để lưu thông tin thông báo 
    if(req.cookies.user){
        if(req.cookies.user.includes("admin752")){
             var d= new Date();
                 // dùng mảng để lưu giá trị thông báo sau đó gửi mảng qua ejs
                 productModule.find({},(err, doc)=>{
                        console.log(doc.length);
                         for(var i=0;i<doc.length;i++){
                             //console.log(doc[i].name);
                             //console.log('doc[i].timestart.slice(8,10)',String(doc[i].timestart).slice(0,4)); 
                             //console.log(d.getDate());
                             if(Number(String(doc[i].timestart).slice(8,10))<=Number(d.getDate()) && 
                             Number(String(doc[i].timestart).slice(5,7))<=(Number(d.getMonth())+1) &&
                             Number(String(doc[i].timestart).slice(0,4))===Number(d.getFullYear()) &&
            
                              Number(String(doc[i].timeend).slice(5,7))>=(Number(d.getMonth())+1) &&
                              Number(String(doc[i].timeend).slice(0,4))===Number(d.getFullYear())
                             &&String(doc[i].checkDiscount)==='false' ) {
                                 var IdtimeS = doc[i]._id
                                 console.log("IdtimeS",Number(d.getDate()),Number(d.getMonth())+1,Number(d.getFullYear()));
                        
                                 console.log("IdtimeS",IdtimeS);
                                 productModule.update({_id:IdtimeS},{checkDiscount:"true"})
                                 .then(()=>{
                                     console.log("đã cập nhật giảm giá thành công");
                                     
                                 })
                                 .catch(()=>{
                                     console.log("lỗi");
                                 })
                              }
                             else 
                               if(Number(String(doc[i].timeend).slice(8,10))<=Number(d.getDate()) && 
                               Number(String(doc[i].timeend).slice(5,7))===(Number(d.getMonth())+1)  &&
                               Number(String(doc[i].timeend).slice(0,4))===Number(d.getFullYear()) &&String(doc[i].checkDiscount)==='true'  ) {
                                var IdtimeE = doc[i]._id
                                console.log("IdtimeE",Number(d.getDate()),Number(d.getMonth())+1,Number(d.getFullYear()));
                                productModule.update({_id:IdtimeE},{upsert:true},{checkDiscount:"false"})
                                .then(()=>{
                                    console.log("đã cập nhật giảm giá false thành công");
                                    
                                })
                                .catch(()=>{
                                    console.log("lỗi");
                                })
                               } 
                               else if(Number(String(doc[i].timeend).slice(5,7))<(Number(d.getMonth())+1)  &&
                               Number(String(doc[i].timeend).slice(0,4))===Number(d.getFullYear()) &&String(doc[i].checkDiscount)==='true'  ) {
                                var IdtimeE = doc[i]._id
                                console.log("IdtimeE2",Number(d.getDate()),Number(d.getMonth())+1,Number(d.getFullYear()));
                                console.log("IdtimeE2",IdtimeE);
                                productModule.update({_id:IdtimeE},{checkDiscount:"false"})
                                .then(()=>{
                                    console.log("đã cập nhật giảm giá false thành công");
                                    
                                })
                                .catch(()=>{
                                    console.log("lỗi");
                                })
                               }
                             var namePCheck=doc[i].name
                             var lengthOfproperties=doc[i].properties.length
                             //console.log(lengthOfproperties);
                             for(var j=0;j<lengthOfproperties;j++){
                                 console.log(doc[i].properties[j].color);
                                 var colorCheck= doc[i].properties[j].color
                                 for(var z=0; z<doc[i].properties[j].classify.length;z++){
                                     console.log(doc[i].properties[j].classify[z].amount);
                                     amountCheck=doc[i].properties[j].classify[z].amount;
                                     if(amountCheck<=10){
                                         console.log("sản phẩm "+ namePCheck+" màu "+colorCheck+" chỉ còn lại "+amountCheck+" vui lòng bổ xung thêm" );
                                        let temp ="sản phẩm "+ namePCheck+" màu "+colorCheck+" chỉ còn lại "+amountCheck+" vui lòng bổ xung thêm";
                                        arr.push(temp)
                                        }
                                    }
                                }
                            
                  
                            }
                         // vị trí cuối cùng nếu cho ra ngoài phạm vi này arr sẽ ko có giá trị
                         console.log('arr',arr[0]);
                         res.render('admin',{arr})
                     })

            // })

        }
        else res.redirect('/cart')
    }

    
})
router.get("/product",(req,res)=>{
    if(req.cookies.user){
        if(req.cookies.user.includes("admin752")){
            product.exec((err,data)=>{
                if(err) throw err;
                res.render('product',{product:data})
    
            })
        }
        else res.redirect('/productUser')
        
    }
    else res.redirect('/productUser')
    
})

router.get("/productUser",(req,res)=>{
    product.exec((err,data)=>{
        if(err) throw err;
        res.render('productUser',{product:data})
    })
      
  })

router.get("/cart",authenticate,(req,res)=>{
    var dataOfUser= []
  // if(req.cookies.user){
    if(req.cookies.user.includes("admin752")){

        res.redirect('/admin')
       
     }

      else{       
        userCartAndHistory.find({},(err,data)=>{
        for(var i=0; i<data.length;i++){
            console.log(data[i].email);
            console.log(req.cookies.user);
            if(data[i].email===req.cookies.user){
                dataOfUser.push(data[i])
                console.log('dataOfUser',dataOfUser);
                //console.log('data',data);
               // return res.render('cart',{ucah:data, message:""})
            }
        }
        res.render('cart',{ucah:dataOfUser, message:""})

    })
}
  //  }
 
    

})


router.get('/logout',(req,res)=>{
    res.clearCookie("jwt");
    res.clearCookie("user");
    res.redirect('/login')
})
router.get('/delete/:id',authController.deleteProduct)


router.get('/addProduct',(req,res)=>{
    if(req.cookies.user){
        if(req.cookies.user.includes("admin752")){
            res.render('adProduct')
        }
        
    }
    else res.redirect('/productUser')
})
router.get('/update/:id', (req,res)=>{
    if(req.cookies.user){
        if(req.cookies.user.includes("admin752")){
            var id = req.params.id;
            console.log("id: ",id);
            console.log(id);
            productModule.findById(id,(err,result)=>{
                res.render('update',{result})
            })
        }        
        else res.redirect('/productUser')
    }
   
})


router.get("/detail/:id",(req,res)=>{
    const id2 = req.params.id;
    console.log(id2);
    productModule.findById(id2,(err,result)=>{
        res.render('detail',{result})
    })    
})

router.get('/user/history',authenticate, (req,res)=>{
    if(req.cookies.user){
        if(req.cookies.user.includes("admin752")){
            res.redirect('/admin')
        }else{
            var dataHisttoryUser =[]
            userCartAndHistory.find({check: "true"},(err,result)=>{
                for(var i=0; i< result.length;i++){
                    if(result[i].email===req.cookies.user){
                        console.log("trùng khớp");
                        dataHisttoryUser.push(result[i])
                        console.log('dataHisttoryUser',dataHisttoryUser);
                    
                    }
                
                }
                res.render('historyUser',{results:dataHisttoryUser})    
            })
        }
    }
        
        
})
router.get('/acceptpayment',authenticate,(req,res)=>{
    //var total=0
    // đầu tiên khi vừa vào sẽ show all data sau khi bấm chọn tháng năm thì mới chuyển qua data theo từng tháng năm 
    if(req.cookies.user){
        if(req.cookies.user.includes("admin752")){// hiển trị true thì show ra 
            userCartAndHistory.find({acceptAdmin: "true"},(err,order)=>{
                res.render('acceptPayment',{order})
            })
        }
        else res.redirect('/productUser')
    }
})

router.get('/deleteAcceptPayment/:id',authController.deleteAcceptPayment)

router.get('/total',authenticate,(req,res)=>{
    //var total=0
    // đầu tiên khi vừa vào sẽ show all data sau khi bấm chọn tháng năm thì mới chuyển qua data theo từng tháng năm 
    if(req.cookies.user){
        if(req.cookies.user.includes("admin752")){
            total.find({},(err,resultsOfMonth)=>{
                res.render('total',{resultsOfMonth})
            })
        }
        else res.redirect('/productUser')
    }
})

router.get('/payment/:id/:idFromProduct/:color/:size/:amount',authController.payment)

router.get("/deleteItemFCart/:id",authController.deleteItemFCart)


module.exports=router;
