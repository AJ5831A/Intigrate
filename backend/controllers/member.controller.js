import { Member } from "../models/member.model.js";
import { User } from "../models/user.model.js";
import { Project } from "../models/project.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const addMember = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const { email, role } = req.body;
    const userId = req.user.userId;

    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    const validRoles = ['BACKEND', 'FRONTEND', 'VIEWER'];
    if (role && !validRoles.includes(role)) {
        return res.status(400).json({ 
            message: "Invalid role. Valid roles: BACKEND, FRONTEND, VIEWER" 
        });
    }

    const isOwner = await Project.isOwner(projectId, userId);
    if (!isOwner) {
        return res.status(403).json({ 
            message: "Only project owner can add members" 
        });
    }

    const userToAdd = await User.findByEmail(email);
    if (!userToAdd) {
        return res.status(404).json({ message: "User not found with this email" });
    }

    const alreadyMember = await Member.isMember(projectId, userToAdd.id);
    if (alreadyMember) {
        return res.status(409).json({ message: "User is already a member" });
    }

    const member = await Member.add(projectId, userToAdd.id, role || 'VIEWER');

    res.status(201).json({ 
        message: "Member added successfully",
        member: {
            ...member,
            user: {
                id: userToAdd.id,
                name: userToAdd.name,
                email: userToAdd.email
            }
        }
    });
});

export const getMembers = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const userId = req.user.userId;

    const isMember = await Member.isMember(projectId, userId);
    if (!isMember) {
        return res.status(403).json({ message: "Access denied" });
    }

    const members = await Member.findByProject(projectId);

    res.json({ 
        count: members.length,
        members 
    });
});

export const updateMemberRole = asyncHandler(async (req, res) => {
    const { projectId, memberId } = req.params;
    const { role } = req.body;
    const userId = req.user.userId;

    const validRoles = ['BACKEND', 'FRONTEND', 'VIEWER'];
    if (!role || !validRoles.includes(role)) {
        return res.status(400).json({ 
            message: "Invalid role. Valid roles: BACKEND, FRONTEND, VIEWER" 
        });
    }

    const isOwner = await Project.isOwner(projectId, userId);
    if (!isOwner) {
        return res.status(403).json({ 
            message: "Only project owner can update member roles" 
        });
    }

    const targetIsOwner = await Project.isOwner(projectId, memberId);
    if (targetIsOwner) {
        return res.status(400).json({ 
            message: "Cannot change owner's role" 
        });
    }

    const member = await Member.updateRole(projectId, memberId, role);

    if (!member) {
        return res.status(404).json({ message: "Member not found" });
    }

    res.json({ 
        message: "Member role updated successfully",
        member 
    });
});

export const removeMember = asyncHandler(async (req, res) => {
    const { projectId, memberId } = req.params;
    const userId = req.user.userId;

    const isOwner = await Project.isOwner(projectId, userId);
    if (!isOwner) {
        return res.status(403).json({ 
            message: "Only project owner can remove members" 
        });
    }

    const targetIsOwner = await Project.isOwner(projectId, memberId);
    if (targetIsOwner) {
        return res.status(400).json({ 
            message: "Cannot remove project owner" 
        });
    }

    const removed = await Member.remove(projectId, memberId);

    if (!removed) {
        return res.status(404).json({ message: "Member not found" });
    }

    res.json({ message: "Member removed successfully" });
});