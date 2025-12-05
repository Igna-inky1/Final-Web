const express = require('express');
const session = require('express-session');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const DB_PATH = path.join(__dirname, 'cafechino.db');

const db = new sqlite3.Database(DB_PATH);
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    rol TEXT
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS productos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT,
    precio REAL
  )`);
  db.get("SELECT COUNT(*) as c FROM usuarios", (err,row) => {
    if(!err && row && row.c === 0){
      db.run("INSERT INTO usuarios (username,password,rol) VALUES (?,?,?)", ['admin','admin123','admin']);
      db.run("INSERT INTO usuarios (username,password,rol) VALUES (?,?,?)", ['cliente','cliente123','cliente']);
    }
  });
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret: 'cafechino_secret',
  resave: false,
  saveUninitialized: false
}));
app.use(express.static(path.join(__dirname,'public')));

app.post('/login', (req,res) => {
  const { username, password } = req.body;
  db.get("SELECT * FROM usuarios WHERE username = ?", [username], (err, user) => {
    if(err) return res.redirect('/login.html?error=server');
    if(!user || user.password !== password) return res.redirect('/login.html?error=invalid');
    req.session.user = { id: user.id, username: user.username, rol: user.rol };
    if(user.rol === 'admin') return res.redirect('/admin.html');
    return res.redirect('/cliente.html');
  });
});

app.get('/logout', (req,res) => {
  req.session.destroy(()=> res.redirect('/login.html'));
});

function requireAuth(req,res,next){
  if(req.session && req.session.user) return next();
  res.redirect('/login.html');
}
function requireAdmin(req,res,next){
  if(req.session && req.session.user && req.session.user.rol === 'admin') return next();
  res.status(403).send('Forbidden');
}

app.post('/productos/add', requireAuth, requireAdmin, (req,res) => {
  const { nombre, precio } = req.body;
  db.run("INSERT INTO productos (nombre, precio) VALUES (?,?)", [nombre, precio || 0], (err) => {
    if(err) return res.send('Error');
    res.redirect('/admin.html');
  });
});

app.post('/productos/edit', requireAuth, requireAdmin, (req,res) => {
  const { id, nombre, precio } = req.body;
  db.run("UPDATE productos SET nombre = ?, precio = ? WHERE id = ?", [nombre, precio || 0, id], (err) => {
    if(err) return res.send('Error');
    res.redirect('/admin.html');
  });
});

app.get('/productos/delete/:id', requireAuth, requireAdmin, (req,res) => {
  const id = req.params.id;
  db.run("DELETE FROM productos WHERE id = ?", [id], (err) => {
    res.redirect('/admin.html');
  });
});

app.get('/api/productos', (req,res) => {
  db.all("SELECT * FROM productos", [], (err, rows) => {
    if(err) return res.json([]);
    res.json(rows);
  });
});

app.get('/admin-data', requireAuth, requireAdmin, (req,res) => {
  db.all("SELECT * FROM productos", [], (err, rows) => {
    res.json(rows || []);
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log('Server running on http://localhost:'+PORT));
