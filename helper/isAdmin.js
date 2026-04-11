import User from "../models/userSchema.js"
import { AppError } from "../utils/AppError.js"

const isAdmin = async(userId)=>{    
    if(!userId) {
        throw new AppError("User id is required", 404, "USER_ID_REQUIRED");
    }
    const user = await User.findByPk(userId)
    return user?.role == 'admin';
}
export default isAdmin