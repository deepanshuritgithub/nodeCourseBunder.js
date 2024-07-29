import DataUriParser from "datauri/parser.js";
import path from "path";
                //file receive here 
const getDataUri = (file) => {
    const parser = new DataUriParser();
    
    const extName = path.extname(file.originalname).toString();
    // console.log(extName);

    return parser.format(extName , file.buffer);
}

export default getDataUri;      

