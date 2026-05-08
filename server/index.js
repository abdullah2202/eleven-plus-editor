import express from 'express';
import cors from 'cors';
import db from './db.js';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Get all shapes
app.get('/api/shapes', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM shapes ORDER BY created_at DESC');
    const shapes = stmt.all();
    res.json(shapes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch shapes' });
  }
});

// Save a new shape
app.post('/api/shapes', (req, res) => {
  const { name, svg_content } = req.body;
  if (!name || !svg_content) {
    return res.status(400).json({ error: 'Name and svg_content are required' });
  }
  
  try {
    const id = uuidv4();
    const stmt = db.prepare('INSERT INTO shapes (id, name, svg_content) VALUES (?, ?, ?)');
    stmt.run(id, name, svg_content);
    res.status(201).json({ id, name, svg_content });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to save shape' });
  }
});

// Delete a shape
app.delete('/api/shapes/:id', (req, res) => {
  const { id } = req.params;
  try {
    const stmt = db.prepare('DELETE FROM shapes WHERE id = ?');
    const result = stmt.run(id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Shape not found' });
    }
    res.json({ message: 'Shape deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete shape' });
  }
});

app.listen(PORT, () => {
  console.log(`API Server running on http://localhost:${PORT}`);
});
