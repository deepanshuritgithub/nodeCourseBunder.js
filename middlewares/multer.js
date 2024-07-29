import multer from 'multer';

//yha pe ab hm kya krenge storage bnayenge, hm use krenge memory storage ka
const storage = multer.memoryStorage() //so iska fyda ye hai ki jaise hi reference khtm hoga hmara req.file se , vese hi delete kr dega sath hi sath 

//single upload middlware
const singleUpload = multer({ storage }).single('file');//uske baad kya naam hona chiye, so jaise maine file naam rkha hai har jagah ]

export default singleUpload; 

