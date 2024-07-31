export const sendToken = (res, user, message , statusCode = 200) => {

    const token = user.getJWTToken()//YE METHOD HAI user ka token generate krne ke liye esko call kr dengee, which is used to generate a jwt token. 
    // /suppose token mil gya hai, token ko hm set kr denge token ke naam se cookies mai

    const options ={                            
        expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), 

        httpOnly: true,//This flag ensures that the cookie is only accessible via the HTTP protocol, which means it cannot be accessed or modified by client-side JavaScript. This helps protect against certain types of cross-site scripting (XSS) attacks.
        // or
        // The cookie can only be used by the web server, not by any scripts running on your browser. This keeps it safe from some types of hacking.

        secure: true,//this flag ensures that the cookie is only sent to the server over secure HTTPS connections. This helps prevent the cookie from being intercepted by attackers during transmission (man-in-the-middle attacks).
        // or
        //The cookie is only sent over secure, encrypted connections (HTTPS), which keeps it safe from being stolen during transmission.

        sameSite: "none",//This flag controls whether the cookie is sent with cross-site requests. Setting sameSite to true helps prevent cross-site request forgery (CSRF) attacks by ensuring that the cookie is only sent with requests originating from the same site.
        // or 
        //The cookie is only sent when you're navigating within the same website, not when you're clicking on links from other websites. This helps prevent certain attacks that trick your browser into doing things you didn't intend. 
    }

    res
    .status(statusCode)
    .cookie("token", token, options)
    .json({

        success: true,
        message,
        user,
    }); 
}