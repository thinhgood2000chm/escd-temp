const multer = require('multer');
var upload = 
    multer({dest:'./public/upload', fileFilter:(req,file,callback)=>{// kiểm tra nếu là ảnh thì cho phép upload vs giá tri mimetype là image
    console.log(file);
    if(file.mimetype.startsWith('image/')){
        callback(null, true)   
    }
    else
    callback(null, false)   
},limits: {fileSize:5000000000}})
//}
module.exports= upload
