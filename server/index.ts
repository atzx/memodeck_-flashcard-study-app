import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { Deck } from '../types';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const decksDirectory = path.join(__dirname, '..', 'decks');

// Ensure decks directory exists
fs.mkdir(decksDirectory, { recursive: true });

app.get('/api/decks', async (req, res) => {
  try {
    const files = await fs.readdir(decksDirectory);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    const decks: Deck[] = [];
    for (const file of jsonFiles) {
      const filePath = path.join(decksDirectory, file);
      const content = await fs.readFile(filePath, 'utf-8');
      decks.push(JSON.parse(content));
    }
    res.json(decks);
  } catch (error) {
    console.error('Error reading decks:', error);
    res.status(500).send('Error reading decks');
  }
});

app.post('/api/decks', async (req, res) => {
  try {
    const newDeck: Deck = req.body;
    const filePath = path.join(decksDirectory, `${newDeck.title.replace(/\s/g, '_')}.json`);
    await fs.writeFile(filePath, JSON.stringify(newDeck, null, 2));
    res.status(201).json(newDeck);
  } catch (error) {
    console.error('Error creating deck:', error);
    res.status(500).send('Error creating deck');
  }
});

app.put('/api/decks/:id', async (req, res) => {
  try {
    const updatedDeck: Deck = req.body;
    const filePath = path.join(decksDirectory, `${updatedDeck.title.replace(/\s/g, '_')}.json`);
    await fs.writeFile(filePath, JSON.stringify(updatedDeck, null, 2));
    res.json(updatedDeck);
  } catch (error) {
    console.error('Error updating deck:', error);
    res.status(500).send('Error updating deck');
  }
});

app.delete('/api/decks/:id', async (req, res) => {
    try {
        const deckId = req.params.id;
        const files = await fs.readdir(decksDirectory);
        const jsonFiles = files.filter(file => file.endsWith('.json'));
        let fileToDelete: string | null = null;

        for (const file of jsonFiles) {
            const filePath = path.join(decksDirectory, file);
            const content = await fs.readFile(filePath, 'utf-8');
            const deck: Deck = JSON.parse(content);
            if (deck.id === deckId) {
                fileToDelete = file;
                break;
            }
        }

        if (fileToDelete) {
            await fs.unlink(path.join(decksDirectory, fileToDelete));
            res.status(204).send();
        } else {
            res.status(404).send('Deck not found');
        }
    } catch (error) {
        console.error('Error deleting deck:', error);
        res.status(500).send('Error deleting deck');
    }
});


app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
