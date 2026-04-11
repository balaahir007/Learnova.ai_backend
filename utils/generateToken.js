import jwt from "jsonwebtoken";

const generateToken = (res, userId) => {
    const payload = { userId }; 
    const token = jwt.sign(payload, process.env.SECRET_KEY, {
        expiresIn: '15d',
    });

    // Determine if we're in production mode
    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("jwt", token, {
        httpOnly: true,
        secure: isProduction,          // Only require HTTPS in production
        sameSite: isProduction ? "none" : "lax",  // "none" requires secure, use "lax" for local
        maxAge: 15 * 24 * 60 * 60 * 1000,
        path: '/'
    });

};

export default generateToken;
