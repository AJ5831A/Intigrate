import { pool } from "../db/db.js";

export class Member{
    static async add(projectId , userId , role = 'VIEWER'){
        const query = `
            INSERT INTO project_members (project_id, user_id, role)
            VALUES ($1, $2, $3)
            RETURNING id, project_id, user_id, role, created_at
        `;
        const result = await pool.query(query , [projectId , userId , role]);
        return result.rows[0];
    }

    static async findByProject(projectId) {
        const query = `
            SELECT pm.id, pm.role, pm.created_at,
                u.id as user_id, u.name, u.email
            FROM project_members pm
            JOIN users u ON pm.user_id = u.id
            WHERE pm.project_id = $1
            ORDER BY 
                CASE pm.role 
                    WHEN 'OWNER' THEN 1 
                    WHEN 'BACKEND' THEN 2 
                    WHEN 'FRONTEND' THEN 3 
                    ELSE 4 
                END,
                pm.created_at ASC
        `;
        const result = await pool.query(query, [projectId]);
        return result.rows;
    }

    static async getRole(projectId, userId) {
        const query = `
            SELECT role FROM project_members 
            WHERE project_id = $1 AND user_id = $2
        `;
        const result = await pool.query(query, [projectId, userId]);
        return result.rows[0]?.role || null;
    }

    static async updateRole(projectId, userId, newRole) {
        const query = `
            UPDATE project_members
            SET role = $1
            WHERE project_id = $2 AND user_id = $3
            RETURNING id, project_id, user_id, role
        `;
        const result = await pool.query(query, [newRole, projectId, userId]);
        return result.rows[0];
    }

    static async remove(projectId, userId) {
        const query = `
            DELETE FROM project_members
            WHERE project_id = $1 AND user_id = $2
            RETURNING id
        `;
        const result = await pool.query(query, [projectId, userId]);
        return result.rows[0];
    }

    static async isMember(projectId, userId) {
        const query = `
            SELECT 1 FROM project_members 
            WHERE project_id = $1 AND user_id = $2
        `;
        const result = await pool.query(query, [projectId, userId]);
        return result.rows.length > 0;
    }

    static async hasRole(projectId, userId, requiredRole) {
        const roleHierarchy = {
            'OWNER': 4,
            'BACKEND': 3,
            'FRONTEND': 2,
            'VIEWER': 1
        };
        
        const query = `
            SELECT role FROM project_members 
            WHERE project_id = $1 AND user_id = $2
        `;
        const result = await pool.query(query, [projectId, userId]);
        
        if (result.rows.length === 0) return false;
        
        const userRole = result.rows[0].role;
        return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
    }
}