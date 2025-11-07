import { User } from "../models/user.model.js";
import { hashPassword , comparePassword } from "../utils/bcrypt.js";
import { createToken } from "../utils/jwt.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const register = asyncHandler(async (req , res) => {
    const {name , email , password} = req.body;
    const hashed = await hashPassword(password);
    if(await User.findByEmail(email)){
        return res.status(409).json({message:"Email already exists"});
    }
    const user = await User.create(name , email , hashed);
    res.json({message:"Registered successfully" , user});
})

export const login = asyncHandler(async (req , res) =>{
    const {email , password} = req.body;

    const user = await User.findByEmail(email);
    if(!user){
        return res.status(404).json({message:"User not found"});
    }

    const match = await comparePassword(password , user.password_hash);
    if(!match){
        return res.status(401).json({message:"Invalid credentials"});
    }

    const token = createToken({userId:user.id , email:user.email});

    res.cookie("token" , token);
    res.json({message:"Login successful" , user});
})

export const logout = asyncHandler(async (req , res) => {
    res.clearCookie("token");
    res.json({message:"Logout successful"});
})