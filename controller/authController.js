
// dùng multer gắn cấu hình multer ở upload.js trong middware rồi gắn vào auth.js để sử dụng cho việc 
// file ảnh thì lưu trong req.file còn text thì có thể dùng được ở req.body
const User = require("../models/User");
const bcrypt= require("bcryptjs")
const jwt =  require("jsonwebtoken");
const upload = require("../middleWare/upload");
const product = require("../models/product")
const cartAndHistory= require('../models/userCartAndHistory')
const fs = require('fs');
const userCartAndHistory = require('../models/userCartAndHistory')
//var ucah= userCartAndHistory.find({})
const session = require("express-session");
const { type } = require("os");



exports.register = (req,res, next)=>{
    var {password, name, email, phone, confirmPassword} = req.body; 
    if(!name){
        res.render('register',{errMess:'tên không được để trống',name,email,phone})
    }
    else  if(!email){
        res.render('register',{errMess:'email không được để trống',name,email,phone})
    }
    else if(email){
        User.find({},(err,doc)=>{
            for(var e =0;e<doc.length;e++){
                if(doc[e].email===email){
                    res.render('register',{errMess:"email đã tồn tại vui lòng chọn email khác",name,phone})
                }
            }
           
        })
    }
    else if(!phone){
        res.render('register',{errMess:'số điện thoại không được để trống',name,email,phone})
    } 
    else if(phone){
        User.find({},(err,doc)=>{
            for(var e =0;e<doc.length;e++){
                if(doc[e].phone===phone){
                    res.render('register',{errMess:"số điện thoại đã tồn tại vui lòng chọn sđt khác",name,email})
                }
            }
           
        })
    }
    else if(!password){
        res.render('register',{errMess:'mật khẩu không được để trống',name,email,phone})
    } 
    else if (password.length<6 ){
        res.render('register',{errMess:"vui long nhap toi thieu 6 kis tu",name,email,phone})
    }
    else if(!confirmPassword){
        res.render('register',{errMess:'vui lòng nhập lại mật khẩu',name,email,phone})
    } 
 
    else if (password!== confirmPassword){
        res.render('register',{errMess:"mật khẩu nhập lại không trùng khớp",name,email,phone})
    }
    else {
 
    }
    bcrypt.hash(password, 10 , (err, hashedPass)=>{
        if(err){
            res.json({
                error:err
            })
        }
        let user = new User({
            name : name,
            email :email,
            phone:phone,
            password:hashedPass
        }) 
    
        user.save()
        .then(user=>
            /*res.json({
                message: "them tk thanh cong"
            })*/
            res.redirect('/login')
        )
        .catch(error =>res.json({
            message:'loi ko them duoc tk'
        }))
    })

}


exports.login=(req,res,next)=>{
    var{email , password}= req.body;
   
    if(!email){
      res.render('login',{errMess:'vui lòng nhập email'})
    }
    else if (!password){
    res.render('login',{errMess:"vui long nhap password",email,password})
    }
    else if (password.length<6 ){
        res.render('login',{errMess:"vui long nhap toi thieu 6 kis tu",email,password})
    }

    User.findOne({email:email})
    .then(user=>{
        if(user){
            bcrypt.compare(password,user.password,(err, result)=>{
                if(err){
                    res.json({
                        error:err
                    })
                }
                if(result){
                    let token = jwt.sign({id: user._id},'secrectValue',{expiresIn:'1h'})
                    res.cookie('jwt', token)
                    res.cookie('user',user.email)
           
                    if(user.email.includes("admin752")){
                        res.redirect("/admin")
                    }
                    else res.redirect('/cart')
                }
                else {
                    
                   /* res.json({
                    message:"password không trùng khớp"*/
                    res.render('login',{errMess:"mật khẩu không trùng khớp",email,password})
                }
            })
        }
        else{
           /* res.json({
                message:'người dùng không tồn tại'
            })*/
            res.render('login',{errMess:"email không tồn tại",email,password})
        }
    })
}

exports.addProduct=(req,res)=>{
             //let sp = req.body;
             images = req.file;
             console.log(images)
             pathImage= `public/upload/${images.originalname}`
            // console.log(image);
             fs.renameSync(images.path,pathImage)
             var image = pathImage.slice(6)

    // chuyển từ String qua array
    var inputSize = req.body.inputSize.split(/,| /) // tách chuổi để tạo thành mảng riêng từng phần tử 
    var  inputColor= req.body.inputColor.split(/,| /) 
    var inputAmount = req.body.inputAmount.split(/,| /)
   // var inputSize = req.body.inputSize
    console.log(inputSize);
    console.log(inputColor);

    var countColor =0 ;
     var countSize = 0
        for ( var i =0; i<inputColor.length;i++){
            countColor = countColor +1
           // console.log(inputColor[i]);
        }
        for( var j =0; j<inputSize.length;j++){
            countSize= countSize +1
            }
            
           // console.log('count size', countSize);
           // console.log('count color', countColor);

           // uploadImage
      
    var {name,desc,price,type,discount, timeS, timeE} = req.body
    console.log('timeS, timeE',timeS, timeE);
    if(!type){
        res.render('addProduct',{errMess:'vui lòng nhập loại sản phẩm'})
    } else if(!name){
        res.render('addProduct',{errMess:'vui lòng nhập tên sản phẩm'})
    }else if(!price){
        res.render('addProduct',{errMess:'vui lòng nhập giá sản phẩm'})
    }else if(!desc){
        res.render('addProduct',{errMess:'vui lòng nhập mô tả sản phẩm'})
    }
    else{
        if(countColor==1){
            if(countSize==1){
                let addProduct = new product({
                    type:type,
                    name: name,
                    price: price,
                    discount: discount,
                    timestart:timeS,
                    timeend:timeE,
                    checkDiscount:'false',
                    image: image,
                    description: desc,
                    properties:[
                        {color: inputColor[0],classify:[
                            { size:inputSize[0], amount:inputAmount[0]},
                         ]}]
                })
                addProduct.save()
                .then(addProduct=>
                    res.json({
                        message: "them tk thanh cong"
                    })
                )
                .catch(error =>res.json({
                    message:'loi ko them duoc tk'
                }))
            }
            
            else if(countSize==2){
                let addProduct = new product({
                    type:type,
                    name: name,
                    price: price,
                    discount: discount,
                    timestart:timeS,
                    timeend:timeE,
                    checkDiscount:'false',
                    image: image,
                    description: desc,
                    properties:[
                        {color: inputColor[0],classify:[
                            { size:inputSize[0], amount:inputAmount[0]},
                            { size:inputSize[1], amount:inputAmount[1]},
                         ]}]
                })
                addProduct.save()
                .then(addProduct=>
                    res.json({
                        message: "them tk thanh cong"
                    })
                )
                .catch(error =>res.json({
                    message:'loi ko them duoc tk'
                }))
            }
            else if(countSize==3){
                let addProduct = new product({
                    type:type,
                    name: name,
                    price: price,
                    discount: discount,
                    timestart:timeS,
                    timeend:timeE,
                    checkDiscount:'false',
                    image: image,
                    description: desc,
                    properties:[
                        {color: inputColor[0],classify:[
                            { size:inputSize[0], amount:inputAmount[0]},
                            { size:inputSize[1], amount:inputAmount[1]},
                            { size:inputSize[2], amount:inputAmount[2]},
                         ]}]
                })
                addProduct.save()
                .then(addProduct=>
                    res.json({
                        message: "them tk thanh cong"
                    })
                )
                .catch(error =>res.json({
                    message:'loi ko them duoc tk'
                }))
            }
            else if(countSize==4){
                let addProduct = new product({
                    type:type,
                    name: name,
                    price: price,
                    discount: discount,
                    timestart:timeS,
                    timeend:timeE,
                    checkDiscount:'false',
                    image: image,
                    description: desc,
                    properties:[
                        {color: inputColor[0],classify:[
                            { size:inputSize[0], amount:inputAmount[0]},
                            { size:inputSize[1], amount:inputAmount[1]},
                            { size:inputSize[2], amount:inputAmount[2]},
                            { size:inputSize[3], amount:inputAmount[3]},
                         ]}]
                })
                addProduct.save()
                .then(addProduct=>
                    res.json({
                        message: "them tk thanh cong"
                    })
                )
                .catch(error =>res.json({
                    message:'loi ko them duoc tk'
                }))
            }
        }



        if(countColor==2){
            if(countSize==1){
                let addProduct = new product({
                    type:type,
                    name: name,
                    price: price,
                    discount: discount,
                    timestart:timeS,
                    timeend:timeE,
                    checkDiscount:'false',
                    image: image,
                    description: desc,
                    properties:[
                        {color: inputColor[0],classify:[
                            { size:inputSize[0], amount:inputAmount[0]},
                         ]},
                         {color: inputColor[1],classify:[
                            { size:inputSize[0], amount:inputAmount[0]},
                         ]}
                        ]
                })
                addProduct.save()
                .then(addProduct=>
                    res.json({
                        message: "them tk thanh cong"
                    })
                )
                .catch(error =>res.json({
                    message:'loi ko them duoc tk'
                }))
            }
            else if(countSize==2){
                let addProduct = new product({
                    type:type,
                    name: name,
                    price: price,
                    discount: discount,
                    timestart:timeS,
                    timeend:timeE,
                    checkDiscount:'false',
                    image: image,
                    description: desc,
                    properties:[
                        {color: inputColor[0],classify:[
                            { size:inputSize[0], amount:inputAmount[0]},
                            { size:inputSize[1], amount:inputAmount[1]},
                         ]},
                         {color: inputColor[1],classify:[
                            { size:inputSize[0], amount:inputAmount[0]},
                            { size:inputSize[1], amount:inputAmount[1]},
                         ]}
                        ]
                })
                addProduct.save()
                .then(addProduct=>
                    res.json({
                        message: "them tk thanh cong"
                    })
                )
                .catch(error =>res.json({
                    message:'loi ko them duoc tk'
                }))
            }
            else if(countSize==3){
                let addProduct = new product({
                    type:type,
                    name: name,
                    price: price,
                    discount: discount,
                    timestart:timeS,
                    timeend:timeE,
                    checkDiscount:'false',
                    image: image,
                    description: desc,
                    properties:[
                        {color: inputColor[0],classify:[
                            { size:inputSize[0], amount:inputAmount[0]},
                            { size:inputSize[1], amount:inputAmount[1]},
                            { size:inputSize[2], amount:inputAmount[2]},
                         ]},
                         {color: inputColor[1],classify:[
                            { size:inputSize[0], amount:inputAmount[0]},
                            { size:inputSize[1], amount:inputAmount[1]},
                            { size:inputSize[2], amount:inputAmount[2]},
                         ]}
                        ]
                })
                addProduct.save()
                .then(addProduct=>
                    res.json({
                        message: "them tk thanh cong"
                    })
                )
                .catch(error =>res.json({
                    message:'loi ko them duoc tk'
                }))
            }
            else if(countSize==4){
                let addProduct = new product({
                    type:type,
                    name: name,
                    price: price,
                    discount: discount,
                    timestart:timeS,
                    timeend:timeE,
                    checkDiscount:'false',
                    image: image,
                    description: desc,
                    properties:[
                        {color: inputColor[0],
                        classify:[
                            { size:inputSize[0], amount:inputAmount[0]},
                            { size:inputSize[1], amount:inputAmount[1]},
                            { size:inputSize[2], amount:inputAmount[2]},
                            { size:inputSize[3], amount:inputAmount[3]},
                         ]},
                        {color: inputColor[1],
                        classify:[
                            { size:inputSize[0], amount:inputAmount[0]},
                            { size:inputSize[1], amount:inputAmount[1]},
                            { size:inputSize[2], amount:inputAmount[2]},
                            { size:inputSize[3], amount:inputAmount[3]},
                         ]}
                        ]
                })
                addProduct.save()
                .then(addProduct=>
                    res.json({
                        message: "them tk thanh cong"
                    })
                )
                .catch(error =>res.json({
                    message:'loi ko them duoc tk'
                }))
            }
        }
   
        
        if(countColor==3){
            if(countSize==1){
                let addProduct = new product({
                    type:type,
                    name: name,
                    price: price,
                    discount: discount,
                    timestart:timeS,
                    timeend:timeE,
                    checkDiscount:'false',
                    image: image,
                    description: desc,
                    properties:[
                        {color: inputColor[0],classify:[
                            { size:inputSize[0], amount:inputAmount[0]},
                         ]},
                         {color: inputColor[1],classify:[
                            { size:inputSize[0], amount:inputAmount[0]},
                         ]},
                         {color: inputColor[2],classify:[
                            { size:inputSize[0], amount:inputAmount[0]},
                         ]}
                        ]
                })
                addProduct.save()
                .then(addProduct=>
                    res.json({
                        message: "them tk thanh cong"
                    })
                )
                .catch(error =>res.json({
                    message:'loi ko them duoc tk'
                }))
            }
            else if(countSize==2){
                let addProduct = new product({
                    type:type,
                    name: name,
                    price: price,
                    discount: discount,
                    timestart:timeS,
                    timeend:timeE,
                    checkDiscount:'false',
                    image: image,
                    description: desc,
                    properties:[
                        {color: inputColor[0],classify:[
                            { size:inputSize[0], amount:inputAmount[0]},
                            { size:inputSize[1], amount:inputAmount[1]},
                         ]},
                         {color: inputColor[1],classify:[
                            { size:inputSize[0], amount:inputAmount[0]},
                            { size:inputSize[1], amount:inputAmount[1]},
                         ]},
                         {color: inputColor[2],classify:[
                            { size:inputSize[0], amount:inputAmount[0]},
                            { size:inputSize[1], amount:inputAmount[1]},
                         ]}
                        ]
                })
                addProduct.save()
                .then(addProduct=>
                    res.json({
                        message: "them tk thanh cong"
                    })
                )
                .catch(error =>res.json({
                    message:'loi ko them duoc tk'
                }))
            }
            else if(countSize==3){
                let addProduct = new product({
                    type:type,
                    name: name,
                    price: price,
                    discount: discount,
                    timestart:timeS,
                    timeend:timeE,
                    checkDiscount:'false',
                    image: image,
                    description: desc,
                    properties:[
                        {color: inputColor[0],classify:[
                            { size:inputSize[0], amount:inputAmount[0]},
                            { size:inputSize[1], amount:inputAmount[1]},
                            { size:inputSize[2], amount:inputAmount[2]},
                         ]},
                         {color: inputColor[1],classify:[
                            { size:inputSize[0], amount:inputAmount[0]},
                            { size:inputSize[1], amount:inputAmount[1]},
                            { size:inputSize[2], amount:inputAmount[2]},
                         ]},
                         {color: inputColor[2],classify:[
                            { size:inputSize[0], amount:inputAmount[0]},
                            { size:inputSize[1], amount:inputAmount[1]},
                            { size:inputSize[2], amount:inputAmount[2]},
                         ]}
                        ]
                })
                addProduct.save()
                .then(addProduct=>
                    res.json({
                        message: "them tk thanh cong"
                    })
                )
                .catch(error =>res.json({
                    message:'loi ko them duoc tk'
                }))
            }
            else if(countSize==4){
                let addProduct = new product({
                    type:type,
                    name: name,
                    price: price,
                    discount: discount,
                    timestart:timeS,
                    timeend:timeE,
                    checkDiscount:'false',
                    image: image,
                    description: desc,
                    properties:[
                        {color: inputColor[0],
                        classify:[
                            { size:inputSize[0], amount:inputAmount[0]},
                            { size:inputSize[1], amount:inputAmount[1]},
                            { size:inputSize[2], amount:inputAmount[2]},
                            { size:inputSize[3], amount:inputAmount[3]},
                         ]},
                        {color: inputColor[1],
                        classify:[
                            { size:inputSize[0], amount:inputAmount[0]},
                            { size:inputSize[1], amount:inputAmount[1]},
                            { size:inputSize[2], amount:inputAmount[2]},
                            { size:inputSize[3], amount:inputAmount[3]},
                         ]},
                         {color: inputColor[2],
                            classify:[
                                { size:inputSize[0], amount:inputAmount[0]},
                                { size:inputSize[1], amount:inputAmount[1]},
                                { size:inputSize[2], amount:inputAmount[2]},
                                { size:inputSize[3], amount:inputAmount[3]},
                             ]}
                        ]
                })
                addProduct.save()
                .then(addProduct=>
                    res.json({
                        message: "them tk thanh cong"
                    })
                )
                .catch(error =>res.json({
                    message:'loi ko them duoc tk'
                }))
            }
        }



        if(countColor==4){
            if(countSize==1){
                let addProduct = new product({
                    type:type,
                    name: name,
                    price: price,
                    discount: discount,
                    timestart:timeS,
                    timeend:timeE,
                    checkDiscount:'false',
                    image: image,
                    description: desc,
                    properties:[
                        {color: inputColor[0],classify:[
                            { size:inputSize[0], amount:inputAmount[0]},
                         ]},
                         {color: inputColor[1],classify:[
                            { size:inputSize[0], amount:inputAmount[0]},
                         ]},
                         {color: inputColor[2],classify:[
                            { size:inputSize[0], amount:inputAmount[0]},
                         ]},
                         {color: inputColor[3],classify:[
                            { size:inputSize[0], amount:inputAmount[0]},
                         ]}
                        ]
                })
                addProduct.save()
                .then(addProduct=>
                    res.json({
                        message: "them tk thanh cong"
                    })
                )
                .catch(error =>res.json({
                    message:'loi ko them duoc tk'
                }))
            }
            else if(countSize==2){
                let addProduct = new product({
                    type:type,
                    name: name,
                    price: price,
                    discount: discount,
                    timestart:timeS,
                    timeend:timeE,
                    checkDiscount:'false',
                    image: image,
                    description: desc,
                    properties:[
                        {color: inputColor[0],classify:[
                            { size:inputSize[0], amount:inputAmount[0]},
                            { size:inputSize[1], amount:inputAmount[1]},
                         ]},
                         {color: inputColor[1],classify:[
                            { size:inputSize[0], amount:inputAmount[0]},
                            { size:inputSize[1], amount:inputAmount[1]},
                         ]},
                         {color: inputColor[2],classify:[
                            { size:inputSize[0], amount:inputAmount[0]},
                            { size:inputSize[1], amount:inputAmount[1]},
                         ]},
                         {color: inputColor[3],classify:[
                            { size:inputSize[0], amount:inputAmount[0]},
                            { size:inputSize[1], amount:inputAmount[1]},
                         ]}
                        ]
                })
                addProduct.save()
                .then(addProduct=>
                    res.json({
                        message: "them tk thanh cong"
                    })
                )
                .catch(error =>res.json({
                    message:'loi ko them duoc tk'
                }))
            }
            else if(countSize==3){
                let addProduct = new product({
                    type:type,
                    name: name,
                    price: price,
                    discount: discount,
                    timestart:timeS,
                    timeend:timeE,
                    checkDiscount:'false',
                    image: image,
                    description: desc,
                    properties:[
                        {color: inputColor[0],classify:[
                            { size:inputSize[0], amount:inputAmount[0]},
                            { size:inputSize[1], amount:inputAmount[1]},
                            { size:inputSize[2], amount:inputAmount[2]},
                         ]},
                         {color: inputColor[1],classify:[
                            { size:inputSize[0], amount:inputAmount[0]},
                            { size:inputSize[1], amount:inputAmount[1]},
                            { size:inputSize[2], amount:inputAmount[2]},
                         ]},
                         {color: inputColor[2],classify:[
                            { size:inputSize[0], amount:inputAmount[0]},
                            { size:inputSize[1], amount:inputAmount[1]},
                            { size:inputSize[2], amount:inputAmount[2]},
                         ]}
                         ,{color: inputColor[3],classify:[
                            { size:inputSize[0], amount:inputAmount[0]},
                            { size:inputSize[1], amount:inputAmount[1]},
                            { size:inputSize[2], amount:inputAmount[2]},
                         ]}
                        ]
                })
                addProduct.save()
                .then(addProduct=>
                    res.json({
                        message: "them tk thanh cong"
                    })
                )
                .catch(error =>res.json({
                    message:'loi ko them duoc tk'
                }))
            }
            else if(countSize==4){
                let addProduct = new product({
                    type:type,
                    name: name,
                    price: price,
                    discount: discount,
                    timestart:timeS,
                    timeend:timeE,
                    checkDiscount:'false',
                    image: image,
                    description: desc,
                    properties:[
                        {color: inputColor[0],
                        classify:[
                            { size:inputSize[0], amount:inputAmount[0]},
                            { size:inputSize[1], amount:inputAmount[1]},
                            { size:inputSize[2], amount:inputAmount[2]},
                            { size:inputSize[3], amount:inputAmount[3]},
                         ]},
                        {color: inputColor[1],
                        classify:[
                            { size:inputSize[0], amount:inputAmount[0]},
                            { size:inputSize[1], amount:inputAmount[1]},
                            { size:inputSize[2], amount:inputAmount[2]},
                            { size:inputSize[3], amount:inputAmount[3]},
                         ]},
                         {color: inputColor[2],
                            classify:[
                                { size:inputSize[0], amount:inputAmount[0]},
                                { size:inputSize[1], amount:inputAmount[1]},
                                { size:inputSize[2], amount:inputAmount[2]},
                                { size:inputSize[3], amount:inputAmount[3]},
                             ]},
                             {color: inputColor[3],
                                classify:[
                                    { size:inputSize[0], amount:inputAmount[0]},
                                    { size:inputSize[1], amount:inputAmount[1]},
                                    { size:inputSize[2], amount:inputAmount[2]},
                                    { size:inputSize[3], amount:inputAmount[3]},
                                 ]}
                        ]
                })
                addProduct.save()
                .then(addProduct=>
                    res.json({
                        message: "them tk thanh cong"
                    })
                )
                .catch(error =>res.json({
                    message:'loi ko them duoc tk'
                }))
            }
        }




        if(countColor==5){
            if(countSize==1){
                let addProduct = new product({
                    type:type,
                    name: name,
                    price: price,
                    discount: discount,
                    timestart:timeS,
                    timeend:timeE,
                    checkDiscount:'false',
                    image: image,
                    description: desc,
                    properties:[
                        {color: inputColor[0],classify:[
                            { size:inputSize[0], amount:inputAmount[0]},
                         ]},
                         {color: inputColor[1],classify:[
                            { size:inputSize[0], amount:inputAmount[0]},
                         ]},
                         {color: inputColor[2],classify:[
                            { size:inputSize[0], amount:inputAmount[0]},
                         ]},
                         {color: inputColor[3],classify:[
                            { size:inputSize[0], amount:inputAmount[0]},
                         ]},
                    
                         {color: inputColor[4],classify:[
                            { size:inputSize[0], amount:inputAmount[0]},
                         ]}


                        ]
                })
                addProduct.save()
                .then(addProduct=>
                    res.json({
                        message: "them tk thanh cong"
                    })
                )
                .catch(error =>res.json({
                    message:'loi ko them duoc tk'
                }))
            }
            else if(countSize==2){
                let addProduct = new product({
                    type:type,
                    name: name,
                    price: price,
                    discount: discount,
                    timestart:timeS,
                    timeend:timeE,
                    checkDiscount:'false',
                    image: image,
                    description: desc,
                    properties:[
                        {color: inputColor[0],classify:[
                            { size:inputSize[0], amount:inputAmount[0]},
                            { size:inputSize[1], amount:inputAmount[1]},
                         ]},
                         {color: inputColor[1],classify:[
                            { size:inputSize[0], amount:inputAmount[0]},
                            { size:inputSize[1], amount:inputAmount[1]},
                         ]},
                         {color: inputColor[2],classify:[
                            { size:inputSize[0], amount:inputAmount[0]},
                            { size:inputSize[1], amount:inputAmount[1]},
                         ]},
                         {color: inputColor[3],classify:[
                            { size:inputSize[0], amount:inputAmount[0]},
                            { size:inputSize[1], amount:inputAmount[1]},
                         ]},
                         {color: inputColor[4],classify:[
                            { size:inputSize[0], amount:inputAmount[0]},
                            { size:inputSize[1], amount:inputAmount[1]},
                         ]}
                        ]
                })
                addProduct.save()
                .then(addProduct=>
                    res.json({
                        message: "them tk thanh cong"
                    })
                )
                .catch(error =>res.json({
                    message:'loi ko them duoc tk'
                }))
            }
            else if(countSize==3){
                let addProduct = new product({
                    type:type,
                    name: name,
                    price: price,
                    discount: discount,
                    timestart:timeS,
                    timeend:timeE,
                    checkDiscount:'false',
                    image: image,
                    description: desc,
                    properties:[
                        {color: inputColor[0],classify:[
                            { size:inputSize[0], amount:inputAmount[0]},
                            { size:inputSize[1], amount:inputAmount[1]},
                            { size:inputSize[2], amount:inputAmount[2]},
                         ]},
                         {color: inputColor[1],classify:[
                            { size:inputSize[0], amount:inputAmount[0]},
                            { size:inputSize[1], amount:inputAmount[1]},
                            { size:inputSize[2], amount:inputAmount[2]},
                         ]},
                         {color: inputColor[2],classify:[
                            { size:inputSize[0], amount:inputAmount[0]},
                            { size:inputSize[1], amount:inputAmount[1]},
                            { size:inputSize[2], amount:inputAmount[2]},
                         ]}
                         ,{color: inputColor[3],classify:[
                            { size:inputSize[0], amount:inputAmount[0]},
                            { size:inputSize[1], amount:inputAmount[1]},
                            { size:inputSize[2], amount:inputAmount[2]},
                         ]}
                         ,{color: inputColor[4],classify:[
                            { size:inputSize[0], amount:inputAmount[0]},
                            { size:inputSize[1], amount:inputAmount[1]},
                            { size:inputSize[2], amount:inputAmount[2]},
                         ]}
                        ]
                })
                addProduct.save()
                .then(addProduct=>
                    res.json({
                        message: "them tk thanh cong"
                    })
                )
                .catch(error =>res.json({
                    message:'loi ko them duoc tk'
                }))
            }
            else if(countSize==4){
                let addProduct = new product({
                    type:type,
                    name: name,
                    price: price,
                    discount: discount,
                    timestart:timeS,
                    timeend:timeE,
                    checkDiscount:'false',
                    image: image,
                    description: desc,
                    properties:[
                        {color: inputColor[0],
                        classify:[
                            { size:inputSize[0], amount:inputAmount[0]},
                            { size:inputSize[1], amount:inputAmount[1]},
                            { size:inputSize[2], amount:inputAmount[2]},
                            { size:inputSize[3], amount:inputAmount[3]},
                         ]},
                        {color: inputColor[1],
                        classify:[
                            { size:inputSize[0], amount:inputAmount[0]},
                            { size:inputSize[1], amount:inputAmount[1]},
                            { size:inputSize[2], amount:inputAmount[2]},
                            { size:inputSize[3], amount:inputAmount[3]},
                         ]},
                         {color: inputColor[2],
                            classify:[
                                { size:inputSize[0], amount:inputAmount[0]},
                                { size:inputSize[1], amount:inputAmount[1]},
                                { size:inputSize[2], amount:inputAmount[2]},
                                { size:inputSize[3], amount:inputAmount[3]},
                             ]},
                             {color: inputColor[3],
                                classify:[
                                    { size:inputSize[0], amount:inputAmount[0]},
                                    { size:inputSize[1], amount:inputAmount[1]},
                                    { size:inputSize[2], amount:inputAmount[2]},
                                    { size:inputSize[3], amount:inputAmount[3]},
                                 ]},
                            {color: inputColor[4],
                            classify:[
                                { size:inputSize[0], amount:inputAmount[0]},
                                { size:inputSize[1], amount:inputAmount[1]},
                                { size:inputSize[2], amount:inputAmount[2]},
                                { size:inputSize[3], amount:inputAmount[3]},
                            ]}
                        ]
                })
                addProduct.save()
                .then(addProduct=>
                    res.json({
                        message: "them tk thanh cong"
                    })
                )
                .catch(error =>res.json({
                    message:'loi ko them duoc tk'
                }))
            }
        }




        if(countColor==5){
            if(countSize==1){
                let addProduct = new product({
                    type:type,
                    name: name,
                    price: price,
                    discount: discount,
                    timestart:timeS,
                    timeend:timeE,
                    checkDiscount:'false',
                    image: image,
                    description: desc,
                    properties:[
                        {color: inputColor[0],classify:[
                            { size:inputSize[0], amount:inputAmount[0]},
                         ]},
                         {color: inputColor[1],classify:[
                            { size:inputSize[0], amount:inputAmount[0]},
                         ]},
                         {color: inputColor[2],classify:[
                            { size:inputSize[0], amount:inputAmount[0]},
                         ]},
                         {color: inputColor[3],classify:[
                            { size:inputSize[0], amount:inputAmount[0]},
                         ]},
                    
                         {color: inputColor[4],classify:[
                            { size:inputSize[0], amount:inputAmount[0]},
                         ]},
                         {color: inputColor[5],classify:[
                            { size:inputSize[0], amount:inputAmount[0]},
                         ]}


                        ]
                })
                addProduct.save()
                .then(addProduct=>
                    res.json({
                        message: "them tk thanh cong"
                    })
                )
                .catch(error =>res.json({
                    message:'loi ko them duoc tk'
                }))
            }
            else if(countSize==2){
                let addProduct = new product({
                    type:type,
                    name: name,
                    price: price,
                    discount: discount,
                    timestart:timeS,
                    timeend:timeE,
                    checkDiscount:'false',
                    image: image,
                    description: desc,
                    properties:[
                        {color: inputColor[0],classify:[
                            { size:inputSize[0], amount:inputAmount[0]},
                            { size:inputSize[1], amount:inputAmount[1]},
                         ]},
                         {color: inputColor[1],classify:[
                            { size:inputSize[0], amount:inputAmount[0]},
                            { size:inputSize[1], amount:inputAmount[1]},
                         ]},
                         {color: inputColor[2],classify:[
                            { size:inputSize[0], amount:inputAmount[0]},
                            { size:inputSize[1], amount:inputAmount[1]},
                         ]},
                         {color: inputColor[3],classify:[
                            { size:inputSize[0], amount:inputAmount[0]},
                            { size:inputSize[1], amount:inputAmount[1]},
                         ]},
                         {color: inputColor[4],classify:[
                            { size:inputSize[0], amount:inputAmount[0]},
                            { size:inputSize[1], amount:inputAmount[1]},
                         ]},
                         {color: inputColor[5],classify:[
                            { size:inputSize[0], amount:inputAmount[0]},
                            { size:inputSize[1], amount:inputAmount[1]},
                         ]}
                        ]
                })
                addProduct.save()
                .then(addProduct=>
                    res.json({
                        message: "them tk thanh cong"
                    })
                )
                .catch(error =>res.json({
                    message:'loi ko them duoc tk'
                }))
            }
            else if(countSize==3){
                let addProduct = new product({
                    type:type,
                    name: name,
                    price: price,
                    discount: discount,
                    timestart:timeS,
                    timeend:timeE,
                    checkDiscount:'false',
                    image: image,
                    description: desc,
                    properties:[
                        {color: inputColor[0],classify:[
                            { size:inputSize[0], amount:inputAmount[0]},
                            { size:inputSize[1], amount:inputAmount[1]},
                            { size:inputSize[2], amount:inputAmount[2]},
                         ]},
                         {color: inputColor[1],classify:[
                            { size:inputSize[0], amount:inputAmount[0]},
                            { size:inputSize[1], amount:inputAmount[1]},
                            { size:inputSize[2], amount:inputAmount[2]},
                         ]},
                         {color: inputColor[2],classify:[
                            { size:inputSize[0], amount:inputAmount[0]},
                            { size:inputSize[1], amount:inputAmount[1]},
                            { size:inputSize[2], amount:inputAmount[2]},
                         ]}
                         ,{color: inputColor[3],classify:[
                            { size:inputSize[0], amount:inputAmount[0]},
                            { size:inputSize[1], amount:inputAmount[1]},
                            { size:inputSize[2], amount:inputAmount[2]},
                         ]}
                         ,{color: inputColor[4],classify:[
                            { size:inputSize[0], amount:inputAmount[0]},
                            { size:inputSize[1], amount:inputAmount[1]},
                            { size:inputSize[2], amount:inputAmount[2]},
                         ]}
                         ,{color: inputColor[5],classify:[
                            { size:inputSize[0], amount:inputAmount[0]},
                            { size:inputSize[1], amount:inputAmount[1]},
                            { size:inputSize[2], amount:inputAmount[2]},
                         ]}
                        ]
                })
                addProduct.save()
                .then(addProduct=>
                    res.json({
                        message: "them tk thanh cong"
                    })
                )
                .catch(error =>res.json({
                    message:'loi ko them duoc tk'
                }))
            }
            else if(countSize==4){
                let addProduct = new product({
                    type:type,
                    name: name,
                    price: price,
                    discount: discount,
                    timestart:timeS,
                    timeend:timeE,
                    checkDiscount:'false',
                    image: image,
                    description: desc,
                    properties:[
                        {color: inputColor[0],
                        classify:[
                            { size:inputSize[0], amount:inputAmount[0]},
                            { size:inputSize[1], amount:inputAmount[1]},
                            { size:inputSize[2], amount:inputAmount[2]},
                            { size:inputSize[3], amount:inputAmount[3]},
                         ]},
                        {color: inputColor[1],
                        classify:[
                            { size:inputSize[0], amount:inputAmount[0]},
                            { size:inputSize[1], amount:inputAmount[1]},
                            { size:inputSize[2], amount:inputAmount[2]},
                            { size:inputSize[3], amount:inputAmount[3]},
                         ]},
                         {color: inputColor[2],
                            classify:[
                                { size:inputSize[0], amount:inputAmount[0]},
                                { size:inputSize[1], amount:inputAmount[1]},
                                { size:inputSize[2], amount:inputAmount[2]},
                                { size:inputSize[3], amount:inputAmount[3]},
                             ]},
                             {color: inputColor[3],
                                classify:[
                                    { size:inputSize[0], amount:inputAmount[0]},
                                    { size:inputSize[1], amount:inputAmount[1]},
                                    { size:inputSize[2], amount:inputAmount[2]},
                                    { size:inputSize[3], amount:inputAmount[3]},
                                 ]},
                            {color: inputColor[4],
                            classify:[
                                { size:inputSize[0], amount:inputAmount[0]},
                                { size:inputSize[1], amount:inputAmount[1]},
                                { size:inputSize[2], amount:inputAmount[2]},
                                { size:inputSize[3], amount:inputAmount[3]},
                            ]},
                            {color: inputColor[5],
                                classify:[
                                    { size:inputSize[0], amount:inputAmount[0]},
                                    { size:inputSize[1], amount:inputAmount[1]},
                                    { size:inputSize[2], amount:inputAmount[2]},
                                    { size:inputSize[3], amount:inputAmount[3]},
                                ]}
                        ]
                })
                addProduct.save()
                .then(addProduct=>
                    res.json({
                        message: "them tk thanh cong"
                    })
                )
                .catch(error =>res.json({
                    message:'loi ko them duoc tk'
                }))
            }
        }
    }


}

exports.deleteProduct=(req,res)=>{
    if(!req.params.id)
    res.json({code:1, message:"invalid data"})
    else 
    {
        var id = req.params.id   
        console.log(id);
        product.findByIdAndRemove(id)
        .then(()=>
            /*res.json({
                message: "xóa người dùng thành công"
            })*/
            res.redirect('/product')
        )
        .catch(error =>res.json({
            message:'xóa thất bại'
        }))
    }
}


exports.updateProduct=(req,res)=>{
       //let sp = req.body;

    var img = req.file;
    console.log(img);
    image= `public/upload/${img.originalname}`
    fs.renameSync(img.path, image)
    var pathImage = image.slice(6)

    var inputSize = req.body.inputSize.split(/,| /) // tách chuổi để tạo thành mảng riêng từng phần tử 
    var  inputColor= req.body.inputColor.split(/,| /) 
    var inputAmount = req.body.inputAmount.split(/,| /)
   // var inputSize = req.body.inputSize
    console.log(inputSize);
    console.log(inputColor);

    var countColor =0 ;
    var countSize = 0
    for ( var i =0; i<inputColor.length;i++){
        countColor = countColor +1
         
    }
    for( var j =0; j<inputSize.length;j++){
        countSize= countSize +1
        }
    let {id, name, price, desc,type,discount,timeS,timeE }  = req.body
    
    if(countColor==1){
        if(countSize==1){
            let updateData = {
                type: type,
                name: name,
                price: price,
                discount: discount,
                timestart:timeS,
                timeend:timeE,
                checkDiscount:'false',
                image: pathImage,
                description: desc,
                properties:[
                    {color: inputColor[0],classify:[
                        { size:inputSize[0], amount:inputAmount[0]},
                     ]}]
            }
            product.findByIdAndUpdate(id,{$set: updateData})
            .then(()=>
            {
                res.redirect('/product')
                console.log("cập nhật thành công");
                }
            )
            .catch(error =>res.json({
                message:'lỗi không cập nhật thành công'
            }))
        }

        else if(countSize==2){
            let updateData = {
                type: type,
                name: name,
                price: price,
                discount: discount,
                timestart:timeS,
                timeend:timeE,
                checkDiscount:'false',
                image: pathImage,
                description: desc,
                properties:[
                    {color: inputColor[0],classify:[
                        { size:inputSize[0], amount:inputAmount[0]},
                        { size:inputSize[1], amount:inputAmount[1]},
                     ]}]
            }
            product.findByIdAndUpdate(id,{$set: updateData})
            .then(()=>
            {
                res.redirect('/product')
                console.log("cập nhật thành công");
                }
            )
            .catch(error =>res.json({
                message:'lỗi không cập nhật thành công'
            }))
        }

        else if(countSize==3){
            let updateData = {
                type: type,
                name: name,
                price: price,
                discount: discount,
                timestart:timeS,
                timeend:timeE,
                checkDiscount:'false',
                image: pathImage,
                description: desc,
                properties:[
                    {color: inputColor[0],classify:[
                        { size:inputSize[0], amount:inputAmount[0]},
                        { size:inputSize[1], amount:inputAmount[1]},
                        { size:inputSize[2], amount:inputAmount[2]}
                     ]}]
            }
            product.findByIdAndUpdate(id,{$set: updateData})
            .then(()=>
            {
                res.redirect('/product')
                console.log("cập nhật thành công");
                }
            )
            .catch(error =>res.json({
                message:'lỗi không cập nhật thành công'
            }))
        }

        else if(countSize==4){
            let updateData = {
                type: type,
                name: name,
                price: price,
                discount: discount,
                timestart:timeS,
                timeend:timeE,
                checkDiscount:'false',
                image: pathImage,
                description: desc,
                properties:[
                    {color: inputColor[0],classify:[
                        { size:inputSize[0], amount:inputAmount[0]},
                        { size:inputSize[1], amount:inputAmount[1]},
                        { size:inputSize[2], amount:inputAmount[2]},
                        { size:inputSize[3], amount:inputAmount[3]}
                     ]}]
            }
            product.findByIdAndUpdate(id,{$set: updateData})
            .then(()=>
            {
                res.redirect('/product')
                console.log("cập nhật thành công");
                }
            )
            .catch(error =>res.json({
                message:'lỗi không cập nhật thành công'
            }))
        }         
    }


    if(countColor==2){
        if(countSize==1){
            let updateData = {
                type: type,
                name: name,
                price: price,
                discount: discount,
                timestart:timeS,
                timeend:timeE,
                checkDiscount:'false',
                image: pathImage,
                description: desc,
                properties:[
                    {color: inputColor[0],classify:[
                        { size:inputSize[0], amount:inputAmount[0]},
                     ]},
                     {color: inputColor[1],classify:[
                        { size:inputSize[0], amount:inputAmount[0]},
                     ]}
                    ]
            }
            product.findByIdAndUpdate(id,{$set: updateData})
            .then(()=>
            {
                res.redirect('/product')
                console.log("cập nhật thành công");
                }
            )
            .catch(error =>res.json({
                message:'lỗi không cập nhật thành công'
            }))
        }

        else if(countSize==2){
            let updateData = {
                type: type,
                name: name,
                price: price,
                discount: discount,
                timestart:timeS,
                timeend:timeE,
                checkDiscount:'false',
                image: pathImage,
                description: desc,
                properties:[
                    {color: inputColor[0],classify:[
                        { size:inputSize[0], amount:inputAmount[0]},
                        { size:inputSize[1], amount:inputAmount[1]},
                     ]},
                     {color: inputColor[1],classify:[
                        { size:inputSize[0], amount:inputAmount[0]},
                        { size:inputSize[1], amount:inputAmount[1]},
                     ]}
                    ]
            }
            product.findByIdAndUpdate(id,{$set: updateData})
            .then(()=>
            {
                res.redirect('/product')
                console.log("cập nhật thành công");
                }
            )
            .catch(error =>res.json({
                message:'lỗi không cập nhật thành công'
            }))
        }

        else if(countSize==3){
            let updateData = {
                type: type,
                name: name,
                price: price,
                discount: discount,
                timestart:timeS,
                timeend:timeE,
                checkDiscount:'false',
                image: pathImage,
                description: desc,
                properties:[
                    {color: inputColor[0],classify:[
                        { size:inputSize[0], amount:inputAmount[0]},
                        { size:inputSize[1], amount:inputAmount[1]},
                        { size:inputSize[2], amount:inputAmount[2]}
                     ]},
                     {color: inputColor[1],classify:[
                        { size:inputSize[0], amount:inputAmount[0]},
                        { size:inputSize[1], amount:inputAmount[1]},
                        { size:inputSize[2], amount:inputAmount[2]}
                     ]}
                    ]
            }
            product.findByIdAndUpdate(id,{$set: updateData})
            .then(()=>
            {
                res.redirect('/product')
                console.log("cập nhật thành công");
                }
            )
            .catch(error =>res.json({
                message:'lỗi không cập nhật thành công'
            }))
        }

        else if(countSize==4){
            let updateData = {
                type: type,
                name: name,
                price: price,
                discount: discount,
                timestart:timeS,
                timeend:timeE,
                checkDiscount:'false',
                image: pathImage,
                description: desc,
                properties:[
                    {color: inputColor[0],classify:[
                        { size:inputSize[0], amount:inputAmount[0]},
                        { size:inputSize[1], amount:inputAmount[1]},
                        { size:inputSize[2], amount:inputAmount[2]},
                        { size:inputSize[3], amount:inputAmount[3]}
                     ]},
                     {color: inputColor[1],classify:[
                        { size:inputSize[0], amount:inputAmount[0]},
                        { size:inputSize[1], amount:inputAmount[1]},
                        { size:inputSize[2], amount:inputAmount[2]},
                        { size:inputSize[3], amount:inputAmount[3]}
                     ]}
                    ]
            }
            product.findByIdAndUpdate(id,{$set: updateData})
            .then(()=>{
            res.redirect('/product')
            console.log("cập nhật thành công");
            }
            )
            .catch(error =>res.json({
                message:'lỗi không cập nhật thành công'
            }))
        }         
    }


    if(countColor==3){
        if(countSize==1){
            let updateData = {
                type: type,
                name: name,
                price: price,
                discount: discount,
                timestart:timeS,
                timeend:timeE,
                checkDiscount:'false',
                image: pathImage,
                description: desc,
                properties:[
                    {color: inputColor[0],classify:[
                        { size:inputSize[0], amount:inputAmount[0]},
                     ]},
                     {color: inputColor[1],classify:[
                        { size:inputSize[0], amount:inputAmount[0]},
                     ]},
                     {color: inputColor[2],classify:[
                        { size:inputSize[0], amount:inputAmount[0]},
                     ]}
                    ]
            }
            product.findByIdAndUpdate(id,{$set: updateData})
            .then(()=>
            {
                res.redirect('/product')
                console.log("cập nhật thành công");
                }
            )
            .catch(error =>res.json({
                message:'lỗi không cập nhật thành công'
            }))
        }

        else if(countSize==2){
            let updateData = {
                type: type,
                name: name,
                price: price,
                discount: discount,
                timestart:timeS,
                timeend:timeE,
                checkDiscount:'false',
                image: pathImage,
                description: desc,
                properties:[
                    {color: inputColor[0],classify:[
                        { size:inputSize[0], amount:inputAmount[0]},
                        { size:inputSize[1], amount:inputAmount[1]},
                     ]},
                     {color: inputColor[1],classify:[
                        { size:inputSize[0], amount:inputAmount[0]},
                        { size:inputSize[1], amount:inputAmount[1]},
                     ]},
                     {color: inputColor[2],classify:[
                        { size:inputSize[0], amount:inputAmount[0]},
                        { size:inputSize[1], amount:inputAmount[1]},
                     ]}
                    ]
            }
            product.findByIdAndUpdate(id,{$set: updateData})
            .then(()=>
            {
                res.redirect('/product')
                console.log("cập nhật thành công");
                }
            )
            .catch(error =>res.json({
                message:'lỗi không cập nhật thành công'
            }))
        }

        else if(countSize==3){
            let updateData = {
                type: type,
                name: name,
                price: price,
                discount: discount,
                timestart:timeS,
                timeend:timeE,
                checkDiscount:'false',
                image: pathImage,
                description: desc,
                properties:[
                    {color: inputColor[0],classify:[
                        { size:inputSize[0], amount:inputAmount[0]},
                        { size:inputSize[1], amount:inputAmount[1]},
                        { size:inputSize[2], amount:inputAmount[2]}
                     ]},
                     {color: inputColor[1],classify:[
                        { size:inputSize[0], amount:inputAmount[0]},
                        { size:inputSize[1], amount:inputAmount[1]},
                        { size:inputSize[2], amount:inputAmount[2]}
                     ]},
                     {color: inputColor[2],classify:[
                        { size:inputSize[0], amount:inputAmount[0]},
                        { size:inputSize[1], amount:inputAmount[1]},
                        { size:inputSize[2], amount:inputAmount[2]}
                     ]}
                    ]
            }
            product.findByIdAndUpdate(id,{$set: updateData})
            .then(()=>
            {
                res.redirect('/product')
                console.log("cập nhật thành công");
                }
            )
            .catch(error =>res.json({
                message:'lỗi không cập nhật thành công'
            }))
        }

        else if(countSize==4){
            let updateData = {
                type: type,
                name: name,
                price: price,
                discount: discount,
                timestart:timeS,
                timeend:timeE,
                checkDiscount:'false',
                image: pathImage,
                description: desc,
                properties:[
                    {color: inputColor[0],classify:[
                        { size:inputSize[0], amount:inputAmount[0]},
                        { size:inputSize[1], amount:inputAmount[1]},
                        { size:inputSize[2], amount:inputAmount[2]},
                        { size:inputSize[3], amount:inputAmount[3]}
                     ]},
                     {color: inputColor[1],classify:[
                        { size:inputSize[0], amount:inputAmount[0]},
                        { size:inputSize[1], amount:inputAmount[1]},
                        { size:inputSize[2], amount:inputAmount[2]},
                        { size:inputSize[3], amount:inputAmount[3]}
                     ]},
                     {color: inputColor[2],classify:[
                        { size:inputSize[0], amount:inputAmount[0]},
                        { size:inputSize[1], amount:inputAmount[1]},
                        { size:inputSize[2], amount:inputAmount[2]},
                        { size:inputSize[3], amount:inputAmount[3]}
                     ]}
                    ]
            }
            product.findByIdAndUpdate(id,{$set: updateData})
            .then(()=>
            {
                res.redirect('/product')
                console.log("cập nhật thành công");
                }
            )
            .catch(error =>res.json({
                message:'lỗi không cập nhật thành công'
            }))
        }         
    }

    if(countColor==4){
        if(countSize==1){
            let updateData = {
                type: type,
                name: name,
                price: price,
                discount: discount,
                timestart:timeS,
                timeend:timeE,
                checkDiscount:'false',
                image: pathImage,
                description: desc,
                properties:[
                    {color: inputColor[0],classify:[
                        { size:inputSize[0], amount:inputAmount[0]},
                     ]},
                     {color: inputColor[1],classify:[
                        { size:inputSize[0], amount:inputAmount[0]},
                     ]},
                     {color: inputColor[2],classify:[
                        { size:inputSize[0], amount:inputAmount[0]},
                     ]},
                     {color: inputColor[3],classify:[
                        { size:inputSize[0], amount:inputAmount[0]},
                     ]}
                    ]
            }
            product.findByIdAndUpdate(id,{$set: updateData})
            .then(()=>
            {
                res.redirect('/product')
                console.log("cập nhật thành công");
                }
            )
            .catch(error =>res.json({
                message:'lỗi không cập nhật thành công'
            }))
        }

        else if(countSize==2){
            let updateData = {
                type: type,
                name: name,
                price: price,
                discount: discount,
                timestart:timeS,
                timeend:timeE,
                checkDiscount:'false',
                image: pathImage,
                description: desc,
                properties:[
                    {color: inputColor[0],classify:[
                        { size:inputSize[0], amount:inputAmount[0]},
                        { size:inputSize[1], amount:inputAmount[1]},
                     ]},
                     {color: inputColor[1],classify:[
                        { size:inputSize[0], amount:inputAmount[0]},
                        { size:inputSize[1], amount:inputAmount[1]},
                     ]},
                     {color: inputColor[2],classify:[
                        { size:inputSize[0], amount:inputAmount[0]},
                        { size:inputSize[1], amount:inputAmount[1]},
                     ]},
                     {color: inputColor[3],classify:[
                        { size:inputSize[0], amount:inputAmount[0]},
                        { size:inputSize[1], amount:inputAmount[1]},
                     ]}
                    ]
            }
            product.findByIdAndUpdate(id,{$set: updateData})
            .then(()=>
            {
                res.redirect('/product')
                console.log("cập nhật thành công");
                }
            )
            .catch(error =>res.json({
                message:'lỗi không cập nhật thành công'
            }))
        }

        else if(countSize==3){
            let updateData = {
                type: type,
                name: name,
                price: price,
                discount: discount,
                timestart:timeS,
                timeend:timeE,
                checkDiscount:'false',
                image: pathImage,
                description: desc,
                properties:[
                    {color: inputColor[0],classify:[
                        { size:inputSize[0], amount:inputAmount[0]},
                        { size:inputSize[1], amount:inputAmount[1]},
                        { size:inputSize[2], amount:inputAmount[2]}
                     ]},
                     {color: inputColor[1],classify:[
                        { size:inputSize[0], amount:inputAmount[0]},
                        { size:inputSize[1], amount:inputAmount[1]},
                        { size:inputSize[2], amount:inputAmount[2]}
                     ]},
                     {color: inputColor[2],classify:[
                        { size:inputSize[0], amount:inputAmount[0]},
                        { size:inputSize[1], amount:inputAmount[1]},
                        { size:inputSize[2], amount:inputAmount[2]}
                     ]},
                     {color: inputColor[3],classify:[
                        { size:inputSize[0], amount:inputAmount[0]},
                        { size:inputSize[1], amount:inputAmount[1]},
                        { size:inputSize[2], amount:inputAmount[2]}
                     ]}
                    ]
            }
            product.findByIdAndUpdate(id,{$set: updateData})
            .then(()=>
            {
                res.redirect('/product')
                console.log("cập nhật thành công");
                }
            )
            .catch(error =>res.json({
                message:'lỗi không cập nhật thành công'
            }))
        }

        else if(countSize==4){
            let updateData = {
                type: type,
                name: name,
                price: price,
                discount: discount,
                timestart:timeS,
                timeend:timeE,
                checkDiscount:'false',
                image: pathImage,
                description: desc,
                properties:[
                    {color: inputColor[0],classify:[
                        { size:inputSize[0], amount:inputAmount[0]},
                        { size:inputSize[1], amount:inputAmount[1]},
                        { size:inputSize[2], amount:inputAmount[2]},
                        { size:inputSize[3], amount:inputAmount[3]}
                     ]},
                     {color: inputColor[1],classify:[
                        { size:inputSize[0], amount:inputAmount[0]},
                        { size:inputSize[1], amount:inputAmount[1]},
                        { size:inputSize[2], amount:inputAmount[2]},
                        { size:inputSize[3], amount:inputAmount[3]}
                     ]},
                     {color: inputColor[2],classify:[
                        { size:inputSize[0], amount:inputAmount[0]},
                        { size:inputSize[1], amount:inputAmount[1]},
                        { size:inputSize[2], amount:inputAmount[2]},
                        { size:inputSize[3], amount:inputAmount[3]}
                     ]},
                     {color: inputColor[3],classify:[
                        { size:inputSize[0], amount:inputAmount[0]},
                        { size:inputSize[1], amount:inputAmount[1]},
                        { size:inputSize[2], amount:inputAmount[2]},
                        { size:inputSize[3], amount:inputAmount[3]}
                     ]}
                    ]
            }
            product.findByIdAndUpdate(id,{$set: updateData})
            .then(()=>
            {
                res.redirect('/product')
                console.log("cập nhật thành công");
                }
            )
            .catch(error =>res.json({
                message:'lỗi không cập nhật thành công'
            }))
        }         
    }


    if(countColor==5){
        if(countSize==1){
            let updateData = {
                type: type,
                name: name,
                price: price,
                discount: discount,
                timestart:timeS,
                timeend:timeE,
                checkDiscount:'false',
                image: pathImage,
                description: desc,
                properties:[
                    {color: inputColor[0],classify:[
                        { size:inputSize[0], amount:inputAmount[0]},
                     ]},
                     {color: inputColor[1],classify:[
                        { size:inputSize[0], amount:inputAmount[0]},
                     ]},
                     {color: inputColor[2],classify:[
                        { size:inputSize[0], amount:inputAmount[0]},
                     ]},
                     {color: inputColor[3],classify:[
                        { size:inputSize[0], amount:inputAmount[0]},
                     ]},
                     {color: inputColor[4],classify:[
                        { size:inputSize[0], amount:inputAmount[0]},
                     ]}
                    ]
            }
            product.findByIdAndUpdate(id,{$set: updateData})
            .then(()=>
            {
                res.redirect('/product')
                console.log("cập nhật thành công");
                }
            )
            .catch(error =>res.json({
                message:'lỗi không cập nhật thành công'
            }))
        }

        else if(countSize==2){
            let updateData = {
                type: type,
                name: name,
                price: price,
                discount: discount,
                timestart:timeS,
                timeend:timeE,
                checkDiscount:'false',
                image: pathImage,
                description: desc,
                properties:[
                    {color: inputColor[0],classify:[
                        { size:inputSize[0], amount:inputAmount[0]},
                        { size:inputSize[1], amount:inputAmount[1]},
                     ]},
                     {color: inputColor[1],classify:[
                        { size:inputSize[0], amount:inputAmount[0]},
                        { size:inputSize[1], amount:inputAmount[1]},
                     ]},
                     {color: inputColor[2],classify:[
                        { size:inputSize[0], amount:inputAmount[0]},
                        { size:inputSize[1], amount:inputAmount[1]},
                     ]},
                     {color: inputColor[3],classify:[
                        { size:inputSize[0], amount:inputAmount[0]},
                        { size:inputSize[1], amount:inputAmount[1]},
                     ]},
                     {color: inputColor[4],classify:[
                        { size:inputSize[0], amount:inputAmount[0]},
                        { size:inputSize[1], amount:inputAmount[1]},
                     ]}
                    ]
            }
            product.findByIdAndUpdate(id,{$set: updateData})
            .then(()=>
            {
                res.redirect('/product')
                console.log("cập nhật thành công");
                }
            )
            .catch(error =>res.json({
                message:'lỗi không cập nhật thành công'
            }))
        }

        else if(countSize==3){
            let updateData = {
                type: type,
                name: name,
                price: price,
                discount: discount,
                timestart:timeS,
                timeend:timeE,
                checkDiscount:'false',
                image: pathImage,
                description: desc,
                properties:[
                    {color: inputColor[0],classify:[
                        { size:inputSize[0], amount:inputAmount[0]},
                        { size:inputSize[1], amount:inputAmount[1]},
                        { size:inputSize[2], amount:inputAmount[2]}
                     ]},
                     {color: inputColor[1],classify:[
                        { size:inputSize[0], amount:inputAmount[0]},
                        { size:inputSize[1], amount:inputAmount[1]},
                        { size:inputSize[2], amount:inputAmount[2]}
                     ]},
                     {color: inputColor[2],classify:[
                        { size:inputSize[0], amount:inputAmount[0]},
                        { size:inputSize[1], amount:inputAmount[1]},
                        { size:inputSize[2], amount:inputAmount[2]}
                     ]},
                     {color: inputColor[3],classify:[
                        { size:inputSize[0], amount:inputAmount[0]},
                        { size:inputSize[1], amount:inputAmount[1]},
                        { size:inputSize[2], amount:inputAmount[2]}
                     ]},
                     {color: inputColor[4],classify:[
                        { size:inputSize[0], amount:inputAmount[0]},
                        { size:inputSize[1], amount:inputAmount[1]},
                        { size:inputSize[2], amount:inputAmount[2]}
                     ]}
                    ]
            }
            product.findByIdAndUpdate(id,{$set: updateData})
            .then(()=>
            {
                res.redirect('/product')
                console.log("cập nhật thành công");
                }
            )
            .catch(error =>res.json({
                message:'lỗi không cập nhật thành công'
            }))
        }

        else if(countSize==4){
            let updateData = {
                type: type,
                name: name,
                price: price,
                discount: discount,
                timestart:timeS,
                timeend:timeE,
                checkDiscount:'false',
                image: pathImage,
                description: desc,
                properties:[
                    {color: inputColor[0],classify:[
                        { size:inputSize[0], amount:inputAmount[0]},
                        { size:inputSize[1], amount:inputAmount[1]},
                        { size:inputSize[2], amount:inputAmount[2]},
                        { size:inputSize[3], amount:inputAmount[3]}
                     ]},
                     {color: inputColor[1],classify:[
                        { size:inputSize[0], amount:inputAmount[0]},
                        { size:inputSize[1], amount:inputAmount[1]},
                        { size:inputSize[2], amount:inputAmount[2]},
                        { size:inputSize[3], amount:inputAmount[3]}
                     ]},
                     {color: inputColor[2],classify:[
                        { size:inputSize[0], amount:inputAmount[0]},
                        { size:inputSize[1], amount:inputAmount[1]},
                        { size:inputSize[2], amount:inputAmount[2]},
                        { size:inputSize[3], amount:inputAmount[3]}
                     ]},
                     {color: inputColor[3],classify:[
                        { size:inputSize[0], amount:inputAmount[0]},
                        { size:inputSize[1], amount:inputAmount[1]},
                        { size:inputSize[2], amount:inputAmount[2]},
                        { size:inputSize[3], amount:inputAmount[3]}
                     ]},
                     {color: inputColor[4],classify:[
                        { size:inputSize[0], amount:inputAmount[0]},
                        { size:inputSize[1], amount:inputAmount[1]},
                        { size:inputSize[2], amount:inputAmount[2]},
                        { size:inputSize[3], amount:inputAmount[3]}
                     ]}
                    ]
            }
            product.findByIdAndUpdate(id,{$set: updateData})
            .then(()=>
            {
                res.redirect('/product')
                console.log("cập nhật thành công");
                }
            )
            .catch(error =>res.json({
                message:'lỗi không cập nhật thành công'
            }))
        }         
    }


    if(countColor==6){
        if(countSize==1){
            let updateData = {
                type: type,
                name: name,
                price: price,
                discount: discount,
                timestart:timeS,
                timeend:timeE,
                checkDiscount:'false',
                image: pathImage,
                description: desc,
                properties:[
                    {color: inputColor[0],classify:[
                        { size:inputSize[0], amount:inputAmount[0]},
                     ]},
                     {color: inputColor[1],classify:[
                        { size:inputSize[0], amount:inputAmount[0]},
                     ]},
                     {color: inputColor[2],classify:[
                        { size:inputSize[0], amount:inputAmount[0]},
                     ]},
                     {color: inputColor[3],classify:[
                        { size:inputSize[0], amount:inputAmount[0]},
                     ]},
                     {color: inputColor[4],classify:[
                        { size:inputSize[0], amount:inputAmount[0]},
                     ]},
                     {color: inputColor[5],classify:[
                        { size:inputSize[0], amount:inputAmount[0]},
                     ]}
                    ]
            }
            product.findByIdAndUpdate(id,{$set: updateData})
            .then(()=>
            {
                res.redirect('/product')
                console.log("cập nhật thành công");
                }
            )
            .catch(error =>res.json({
                message:'lỗi không cập nhật thành công'
            }))
        }

        else if(countSize==2){
            let updateData = {
                type: type,
                name: name,
                price: price,
                discount: discount,
                timestart:timeS,
                timeend:timeE,
                checkDiscount:'false',
                image: pathImage,
                description: desc,
                properties:[
                    {color: inputColor[0],classify:[
                        { size:inputSize[0], amount:inputAmount[0]},
                        { size:inputSize[1], amount:inputAmount[1]},
                     ]},
                     {color: inputColor[1],classify:[
                        { size:inputSize[0], amount:inputAmount[0]},
                        { size:inputSize[1], amount:inputAmount[1]},
                     ]},
                     {color: inputColor[2],classify:[
                        { size:inputSize[0], amount:inputAmount[0]},
                        { size:inputSize[1], amount:inputAmount[1]},
                     ]},
                     {color: inputColor[3],classify:[
                        { size:inputSize[0], amount:inputAmount[0]},
                        { size:inputSize[1], amount:inputAmount[1]},
                     ]},
                     {color: inputColor[4],classify:[
                        { size:inputSize[0], amount:inputAmount[0]},
                        { size:inputSize[1], amount:inputAmount[1]},
                     ]},
                     {color: inputColor[5],classify:[
                        { size:inputSize[0], amount:inputAmount[0]},
                        { size:inputSize[1], amount:inputAmount[1]},
                     ]}
                    ]
            }
            product.findByIdAndUpdate(id,{$set: updateData})
            .then(()=>
            {
                res.redirect('/product')
                console.log("cập nhật thành công");
                }
            )
            .catch(error =>res.json({
                message:'lỗi không cập nhật thành công'
            }))
        }

        else if(countSize==3){
            let updateData = {
                type: type,
                name: name,
                price: price,
                discount: discount,
                timestart:timeS,
                timeend:timeE,
                checkDiscount:'false',
                image: pathImage,
                description: desc,
                properties:[
                    {color: inputColor[0],classify:[
                        { size:inputSize[0], amount:inputAmount[0]},
                        { size:inputSize[1], amount:inputAmount[1]},
                        { size:inputSize[2], amount:inputAmount[2]}
                     ]},
                     {color: inputColor[1],classify:[
                        { size:inputSize[0], amount:inputAmount[0]},
                        { size:inputSize[1], amount:inputAmount[1]},
                        { size:inputSize[2], amount:inputAmount[2]}
                     ]},
                     {color: inputColor[2],classify:[
                        { size:inputSize[0], amount:inputAmount[0]},
                        { size:inputSize[1], amount:inputAmount[1]},
                        { size:inputSize[2], amount:inputAmount[2]}
                     ]},
                     {color: inputColor[3],classify:[
                        { size:inputSize[0], amount:inputAmount[0]},
                        { size:inputSize[1], amount:inputAmount[1]},
                        { size:inputSize[2], amount:inputAmount[2]}
                     ]},
                     {color: inputColor[4],classify:[
                        { size:inputSize[0], amount:inputAmount[0]},
                        { size:inputSize[1], amount:inputAmount[1]},
                        { size:inputSize[2], amount:inputAmount[2]}
                     ]},
                     {color: inputColor[5],classify:[
                        { size:inputSize[0], amount:inputAmount[0]},
                        { size:inputSize[1], amount:inputAmount[1]},
                        { size:inputSize[2], amount:inputAmount[2]}
                     ]},
                    ]
            }
            product.findByIdAndUpdate(id,{$set: updateData})
            .then(()=>
            {
                res.redirect('/product')
                console.log("cập nhật thành công");
                }
            )
            .catch(error =>res.json({
                message:'lỗi không cập nhật thành công'
            }))
        }

        else if(countSize==4){
            let updateData = {
                type: type,
                name: name,
                price: price,
                discount: discount,
                timestart:timeS,
                timeend:timeE,
                checkDiscount:'false',
                image: pathImage,
                description: desc,
                properties:[
                    {color: inputColor[0],classify:[
                        { size:inputSize[0], amount:inputAmount[0]},
                        { size:inputSize[1], amount:inputAmount[1]},
                        { size:inputSize[2], amount:inputAmount[2]},
                        { size:inputSize[3], amount:inputAmount[3]}
                     ]},
                     {color: inputColor[1],classify:[
                        { size:inputSize[0], amount:inputAmount[0]},
                        { size:inputSize[1], amount:inputAmount[1]},
                        { size:inputSize[2], amount:inputAmount[2]},
                        { size:inputSize[3], amount:inputAmount[3]}
                     ]},
                     {color: inputColor[2],classify:[
                        { size:inputSize[0], amount:inputAmount[0]},
                        { size:inputSize[1], amount:inputAmount[1]},
                        { size:inputSize[2], amount:inputAmount[2]},
                        { size:inputSize[3], amount:inputAmount[3]}
                     ]},
                     {color: inputColor[3],classify:[
                        { size:inputSize[0], amount:inputAmount[0]},
                        { size:inputSize[1], amount:inputAmount[1]},
                        { size:inputSize[2], amount:inputAmount[2]},
                        { size:inputSize[3], amount:inputAmount[3]}
                     ]},
                     {color: inputColor[4],classify:[
                        { size:inputSize[0], amount:inputAmount[0]},
                        { size:inputSize[1], amount:inputAmount[1]},
                        { size:inputSize[2], amount:inputAmount[2]},
                        { size:inputSize[3], amount:inputAmount[3]}
                     ]},
                     {color: inputColor[5],classify:[
                        { size:inputSize[0], amount:inputAmount[0]},
                        { size:inputSize[1], amount:inputAmount[1]},
                        { size:inputSize[2], amount:inputAmount[2]},
                        { size:inputSize[3], amount:inputAmount[3]}
                     ]}
                    ]
            }
            product.findByIdAndUpdate(id,{$set: updateData})
            .then(()=>
            {
                res.redirect('/product')
                console.log("cập nhật thành công");
                }
            )
            .catch(error =>res.json({
                message:'lỗi không cập nhật thành công'
            }))
        }         
    }
}


exports.InsertCart= (req,res)=>{
    const token= req.cookies.jwt;
    var{id, name, amount, price,color,size,image} = req.body
    if(token){
        jwt.verify(token,'secrectValue', async (err, decode)=>{
                //console.log(decode);
                let user = await User.findById(decode.id)
                var d = new Date()
                let addNewCAH = new cartAndHistory({
                    idFromProduct: id,
                    nameUser: user.name,
                    email: user.email,
                    phone:user.phone,
                    check: "false",
                    name: name ,
                    image: image,
                    price: price,
                    color: color,
                    size: size,
                    amount: amount,
                    year:d.getFullYear(),
                    months:String(Number(d.getMonth())+1),
                })
                addNewCAH.save()
                .then(addNewCAH=>
                    res.redirect('/cart')
                )
                .catch(error =>res.json({
                     message:'loi ko them duoc tk'
                }))
              
            
        })

     
    }else {
        res.redirect('/login')
    }
}

// thieets lập thanh toán, thay đổi giá trị bảng cartandhistory, 
exports.payment= (req,res)=>{
    var id=req.params.id
    var idFromProduct= req.params.idFromProduct
    console.log(idFromProduct);
    var color= req.params.color;
    var size = req.params.size;
    var amount = req.params.amount
    // cập nhật trạng thái từ false sang true ( từ chwua mua -> đã mua )
    cartAndHistory.findOneAndUpdate({_id: id},{check:'true'},{upsert:true},(err,doc)=>{
        if (err) 
            res.send(500, { error: err }); 
        else 
        {console.log("update success");
    }
    })

    product.findOne({_id:idFromProduct},(err,doc)=>{
        if (err) 
        res.send(500, { error: err }); 
        else {
            /*
            lấy số lượng trong properties chạy vòng lặp tìm ra màu tương ứng 
            lấy được vị trí của màu tiếp tục chạy vòng lặp dựa vào số lượng của classify ứng với màu đã tìm 
            cho chạy classsify nếu gặp size trùng thì lấy gái trị số lượng cần thay đổi
            */

            var length=doc.properties.length 
            var dataOfUser=[]
            //console.log(length);
            for (var i =0; i<length;i++){
               // console.log('doc.properties[i].classify',doc.properties[i].classify);
                //console.log("doc.properties[i]._id",doc.properties[i]._id);
                idOfProperties= doc.properties[i]._id;
                if(doc.properties[i].color===color ){
                    //console.log(doc.properties[i].classify[i].size);
                    for(var j=0; j<doc.properties[i].classify.length;j++){
                        if(doc.properties[i].classify[j].size===size ){
                            // console.log(doc.properties[i].classify[j].size);
                            var idOfClassify=doc.properties[i].classify[j]._id;
                            var amountbefore= doc.properties[i].classify[j].amount
                           // console.log("idOfClassify",idOfClassify);
                           // console.log("amountbefore",amountbefore);
                         
                            var amountAfter= Number(amountbefore) - Number(amount)
                           // console.log(amountAfter);

                            //update dữ liệu trong bảng product sau khi mua hàng => số lượng còn trong kho thay đổi 
                            product.updateOne({"_id":idFromProduct},{$set:{"properties.$[o].classify.$[i].amount":amountAfter}},
                            {arrayFilters:[{'o._id':idOfProperties},{'i._id':idOfClassify}]})
                            .then(()=> {
                                console.log("cập nhật thanh cong")
                               var message="thanh thanh toán thành công"
                                cartAndHistory.find({},(err,data)=>{
                                    for(var i=0; i<data.length;i++){
                                        //console.log(data[i].email);
                                        //console.log(req.cookies.user);
                                        if(data[i].email===req.cookies.user){
                                            dataOfUser.push(data[i])
                                            //console.log('dataOfUser',dataOfUser);
                                        }
                                    }
                                    res.render('cart',{ucah:dataOfUser, message})
                                    //res.redirect('/cart')
                                })
                                })
                            .catch(()=>console.log("loi"))
                        }
                    }
                }
            }
        }
    })
}

exports.deleteItemFCart=(req,res)=>{
    if(!req.params.id)
    res.json({code:1, message:"invalid data"})
    else 
        {
            var id= req.params.id;
            cartAndHistory.findByIdAndRemove(id)
            .then(()=>{
                console.log('xóa thành công');
                res.redirect('/cart');
            })
            .catch(error =>res.json({
                message:'xóa thất bại'
        }))
}
}

// tính tổng tiền theo tứng tháng và hiển thị dữ liệu của từng tháng
exports.totalPrice=(req,res)=>{
    var{ year, month}= req.body

    var totals = 0;
    var resultsOfMonth=[]
    userCartAndHistory.find({check: "true"},(err,results)=>{
        //total.find({year:year},(err,doc)=>{
            if(err){
                res.json({error: err})
            }
            else{
                for(var i =0; i< results.length;i++){
                   // console.log(results[i].year);
                   // console.log(results[i].year);
                    if(results[i].year === year && results[i].months===month){
                            totals =totals+results[i].price
                           // console.log(' ddax vao dau');
                            resultsOfMonth.push(results[i])
                    }
                    
                }
                res.render('total',{resultsOfMonth,totals});
    
            }
       // })
    })
}

exports.search=(req,res)=>{
    var {dataF, dataT, dataNameType} = req.body
    var productSearch=[]
    console.log(dataF, dataT);
    product.find({},(err, results)=>{
        for(var i=0;i<results.length;i++){
            if(dataNameType===results[i].name||dataNameType===results[i].type){
                console.log("tim theo type",results[i]);
                productSearch.push(results[i])
            }
            else if(Number(dataF)<=results[i].price&& results[i].price<=Number(dataT)){
                console.log("tim theo gia",results[i].price);
                productSearch.push(results[i])
            }
        }
        res.render('productUser',{product:productSearch})
    })
}

