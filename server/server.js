const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

//Para llamadas AJAX desde el cliente
app.use(cors());
//archivos estáticos desde "client"
app.use(express.static(path.join(__dirname, '..', 'client')));

//Ruta para obtener actores
app.get('/actors', (req, res) => {
  const db = new sqlite3.Database(path.join(__dirname, '..', 'imdb.db'));
  db.all('SELECT id, name FROM actors LIMIT 50', [], (err, rows) => {
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
