
                            
export const catchAsyncError =(passedFunction) => (req, res , next)=> { 
    Promise.resolve(passedFunction(req, res, next))
    .catch(next) 
}



// export const catchAsyncError =() =>{ /
    // return ()=>{

    // }

// }//2nd way to do 