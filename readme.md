
//npm init to get package.json

// npm i bcrypt cloudinary cookie-parser cors datauri dotenv express jsonwebtoken mongoose mutler node-cron nodemailer razorpay validator

bcrypt ->  ye kis liye hota hai jab hm database mai apne user save krengee to usne jo normal password daala hoga usko hash krke save krna hai , es liye hota hai 

cloudinary -> ye kis liye hota hai ye jo hmara course ke thumbnail hoga jo ki poster ke naam se refer kiya hua hai , so course ka poster , ya fir saari videos , vo saari cloudinary pe upload hongii, otherwise jo user ka avatar hai vo bhi cloudinary pe upload hogaa to vha pe uploading ka kaam aayega ye 

cookie-parser -> request.cookies mai jo hm cookies access kr paye es liye 

cors-> cross origin fetching ke liye 
matlab jab hmara server kisi or address pe hogaa or jo hmara front end hai vo kisi or address pe hogaa 
, alag alag hosting ke baad bhi n api call ho jaye uske liye cors hota hai 

datauri -> 

dotenv -> jo hmari configuration ke liye variables honge env variables uske liye , hmme env varibles ko openly nhi rkh sakte , secretly rkhna hai uske liye hota hai ye 

json web token -> so login ke liye hmme jwt token bnana hai , eski help se bnayenge hm or cookies mai hm token store kr dengee 

multer-> ye ek middleware hai and we will use this to get access of file with the help of request.file ., mtlb jo hm controls bnayenge , jab hm form submit krte hai jo bhi hm vha se file bhjenge,  request.file , uski help se multer ki help se vo file access kr sakte hai , or jo hmme file milegi ye hmme dega blob, so jo data uri hai eski help se hm uska uri lenge basically url 
  
jo request.file ki help se hmme file mili hai vo hmme milegi eski help se or us file ka hm url access kr lenge es lia hai data uri

node-cron  -> ye ke package hai jiski help se, fixed date ya fixed time pe kisi bhi baar baar function call hota rhega jo bhi hm usme denge, for ex mai kr deta hhu , har mahine ke 1 trike pe  1 function call ho vo mai krunga es package ke help se 

node-mailer -> ye basically mail send krne ke liye hai 

razor pay -> payment integration ke liye hota hai , payment accept krne hai to razor pay 

validator -> hmme email verify krne hai uske liye hota hai 



CHANGES IN PACKAGE.JSON
 "type" : "module", //SO YE KRNE SE KYA HOTA HA KI MAI ES6 KE IMPORT USE KR SAKTA HU
 

 rs
  restart server in terminal










  


//status 200 is for successful got
//status 201 is for successfully created
//status code 400 is for bad request


// 409 status code: the request could not be processed because of conflict in the reques