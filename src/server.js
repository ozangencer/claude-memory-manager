const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3001;
const MEMORY_PATH = '/Users/ozangencer/Documents/Memory/memory.jsonl';

app.use(cors());
app.use(express.json());

// Read memory from JSONL file
app.get('/api/read-memory', async (req, res) => {
  try {
    const fileContent = await fs.readFile(MEMORY_PATH, 'utf-8');
    const lines = fileContent.trim().split('\n').filter(line => line);
    const memories = lines.map(line => JSON.parse(line));
    res.json({ memories });
  } catch (error) {
    console.error('Error reading memory:', error);
    res.status(500).json({ error: 'Failed to read memory' });
  }
});

// Write memory to JSONL file
app.post('/api/write-memory', async (req, res) => {
  try {
    const { memories } = req.body;
    const jsonlContent = memories.map(item => JSON.stringify(item)).join('\n');
    await fs.writeFile(MEMORY_PATH, jsonlContent);
    res.json({ success: true });
  } catch (error) {
    console.error('Error writing memory:', error);
    res.status(500).json({ error: 'Failed to write memory' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});