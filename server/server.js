const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.static(path.join(__dirname, '..', 'client')));

app.get('/search-actors', (req, res) => {
  const name = req.query.name || '';
  const db = new sqlite3.Database(path.join(__dirname, '..', 'imdb.db'));

  const query = `
    SELECT ActorId AS id, Name AS name
    FROM Actor
    WHERE name LIKE ?
    ORDER BY name
    LIMIT 20
  `;

  db.all(query, [`%${name}%`], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });

  db.close();
});

app.get('/filmography/:actorId', (req, res) => {
  const actorId = req.params.actorId;
  const db = new sqlite3.Database(path.join(__dirname, '..', 'imdb.db'));

  const query = `
    SELECT 
      M.Year AS year,
      M.Title AS title,
      GROUP_CONCAT(A2.Name, ', ') AS coactors
    FROM Movie M
    JOIN Casting C1 ON M.MovieId = C1.MovieId
    JOIN Casting C2 ON M.MovieId = C2.MovieId AND C2.ActorId != ?
    JOIN Actor A2 ON C2.ActorId = A2.ActorId
    WHERE C1.ActorId = ?
    GROUP BY M.MovieId
    ORDER BY M.Year
  `;

  db.all(query, [actorId, actorId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });

  db.close();
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
