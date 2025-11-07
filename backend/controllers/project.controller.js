import { Project } from "../models/project.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createProject = asyncHandler(async (req, res) => {
    const { name } = req.body;
    const userId = req.user.userId;
  
    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }
  
    const project = await Project.create(name, userId);
    return res.status(201).json({ message: "Project created successfully", project });
  });
  
  export const getMyProjects = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const projects = await Project.findByUserId(userId);
    return res.json({ count: projects.length, projects });
  });
  
  export const getProject = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;
  
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
  
    const stats = await Project.getStats(id);
  
    return res.json({
      project: { ...project, stats }
    });
  });
  
  export const updateProject = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, status } = req.body;
    const userId = req.user.userId;
  
    const existing = await Project.findById(id);
    if (!existing) {
      return res.status(404).json({ message: "Project not found" });
    }
  
    const isOwner = await Project.isOwner(id, userId);
    if (!isOwner) {
      return res.status(403).json({ message: "Only project owner can update project" });
    }
  
    const updates = {};
    if (name) updates.name = name.trim();
    if (status) updates.status = status;
  
    const project = await Project.update(id, updates);
    return res.json({ message: "Project updated successfully", project });
  });
  
  export const deleteProject = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;
  
    const existing = await Project.findById(id);
    if (!existing) {
      return res.status(404).json({ message: "Project not found" });
    }
  
    const isOwner = await Project.isOwner(id, userId);
    if (!isOwner) {
      return res.status(403).json({ message: "Only project owner can delete project" });
    }
  
    await Project.delete(id);
    return res.json({ message: "Project deleted successfully" });
  });
  