import { pool } from "../db/db.js";

export const User = {
    create: async (name , email , passwordHash) =>{
        const result = await pool.query(
            'INSERT INTO users (name , email , password_hash) VALUES ($1 , $2 , $3) RETURNING id , name , email',
            [name , email , passwordHash]
        );
        return result.rows[0];
    },

    findByEmail:async (email) =>{
        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );
        return result.rows[0];
    }
}