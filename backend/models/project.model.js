import { pool } from "../db/db.js";

export class Project {
    static async create(name , ownerId){
        const client = await pool.connect();
        try{
            await client.query('BEGIN');

            const projectQuery = `
                INSERT INTO projects (name, owner_id, status)
                VALUES ($1, $2, 'ACTIVE')
                RETURNING id, name, owner_id, status, current_spec_id, created_at, updated_at
            `;

            const projectResult = await client.query(projectQuery, [name , ownerId]);
            const project = projectResult.rows[0];

            const memberQuery = `
                INSERT INTO project_members (project_id, user_id, role)
                VALUES ($1, $2, 'OWNER')
            `;

            await client.query(memberQuery, [project.id , ownerId]);

            await client.query('COMMIT');
            return project;
        }catch(err){
            await client.query('ROLLBACK');
            throw err;
        }finally{
            client.release();
        }
    }

    static async findById(id){
        const query = `
            SELECT p.*, u.name as owner_name, u.email as owner_email
            FROM projects p
            JOIN users u ON p.owner_id = u.id
            WHERE p.id = $1
        `;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    static async findByUserId(userId) {
        const query = `
            SELECT DISTINCT p.*, 
                   u.name as owner_name,
                   pm.role as user_role
            FROM projects p
            JOIN users u ON p.owner_id = u.id
            JOIN project_members pm ON p.id = pm.project_id
            WHERE pm.user_id = $1
            ORDER BY p.created_at DESC
        `;
        const result = await pool.query(query, [userId]);
        return result.rows;
    }

    static async update(id , updates){
        const {name , status , current_spec_id} = updates;
        const query = `
        UPDATE projects
        SET name = COALESCE($1, name),
            status = COALESCE($2, status),
            current_spec_id = COALESCE($3, current_spec_id),
            updated_at = NOW()
        WHERE id = $4
        RETURNING id, name, owner_id, status, current_spec_id, updated_at
    `;
    const result = await pool.query(query, [name, status, current_spec_id, id]);
    return result.rows[0];
    }

    static async delete(id) {
        const query = `DELETE FROM projects WHERE id = $1 RETURNING id`;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    static async isOwner(projectId, userId) {
        const query = `SELECT 1 FROM projects WHERE id = $1 AND owner_id = $2`;
        const result = await pool.query(query, [projectId, userId]);
        return result.rows.length > 0;
    }

    static async getStats(projectId) {
        const query = `
            SELECT 
                (SELECT COUNT(*) FROM project_members WHERE project_id = $1) as member_count,
                (SELECT COUNT(*) FROM endpoints WHERE project_id = $1) as endpoint_count,
                (SELECT COUNT(*) FROM endpoints WHERE project_id = $1 AND status = 'REAL') as real_endpoint_count,
                (SELECT COUNT(*) FROM api_specs WHERE project_id = $1) as spec_version_count
        `;
        const result = await pool.query(query, [projectId]);
        return result.rows[0];
    }
}