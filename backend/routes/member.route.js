import express from "express";
import { addMember, getMembers, removeMember, updateMemberRole } from "../controllers/member.controller.js";
import { auth } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(auth);

router.post('/:projectId/member' , addMember)
router.get('/:projectId/members' , getMembers)
router.put('/:projectId/member/:memberId' , updateMemberRole)
router.delete('/:projectId/member/:memberId' , removeMember)

export default router;