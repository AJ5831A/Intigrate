import jwt from "jsonwebtoken";

export const createToken = (payload) =>{
    jwt.sign(payload, "Hello" , {expiresIn : "15d"});
}

export const verifyToken = (token) => {
    jwt.verify(token, "Hello")
};