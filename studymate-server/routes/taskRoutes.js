const express = require('express');
const mongoose = require('mongoose');
const Task = require('../models/Task');

const router = express.Router();

// Helper to check for valid MongoDB ObjectId
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// 1. GET /api/tasks - Retrieve all tasks
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks', error: error.message });
  }
});

// 2. POST /api/tasks - Create a new task
router.post('/', async (req, res) => {
  try {
    const { title, description, subject, priority, dueDate } = req.body;

    // Validation
    if (!title || !subject || !dueDate) {
      return res.status(400).json({
        message: 'Validation failed: title, subject, and dueDate are required.',
      });
    }

    if (isNaN(new Date(dueDate).getTime())) {
      return res.status(400).json({
        message: 'Validation failed: dueDate must be a valid date.',
      });
    }

    const newTask = new Task({
      title,
      description: description || '',
      subject,
      priority: priority || 'Medium',
      dueDate,
    });

    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (error) {
    res.status(500).json({ message: 'Error creating task', error: error.message });
  }
});

// 3. GET /api/tasks/:id - Get a single task by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({ message: 'Invalid task ID format.' });
    }

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching task', error: error.message });
  }
});

// 4. PUT /api/tasks/:id - Update an existing task
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({ message: 'Invalid task ID format.' });
    }

    // If dueDate is being updated, validate it
    if (req.body.dueDate && isNaN(new Date(req.body.dueDate).getTime())) {
      return res.status(400).json({ message: 'Validation failed: dueDate must be a valid date.' });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Error updating task', error: error.message });
  }
});

// 5. DELETE /api/tasks/:id - Delete a task by ID
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({ message: 'Invalid task ID format.' });
    }

    const deletedTask = await Task.findByIdAndDelete(id);
    if (!deletedTask) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    res.status(200).json({ message: 'Task deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting task', error: error.message });
  }
});

module.exports = router;

