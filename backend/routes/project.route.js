import express from "express"

import { auth } from "../middlewares/auth.middleware.js"
import { createProject, deleteProject, getMyProjects, getProject, updateProject } from "../controllers/project.controller.js";

const router = express.Router();

router.use(auth);

router.post('/create' , createProject)
router.get('/' , getMyProjects)
router.get('/:id' , getProject)
router.put('/:id' , updateProject)
router.delete('/:id' , deleteProject)

export default router;