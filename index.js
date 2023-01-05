const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const multer = require('multer');

const app = express();

const port = 3000;

app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, '/public')));

app.use(bodyParser.urlencoded({ extended: true }));
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads');
    },
    filename: (req, file, cb) => {
        let time = Date.now();
        cb(null, time + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

//connect to database
var conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'nodejs_1',
    charset: 'utf8_general_ci',
});
conn.connect((err) => {
    if (err) {
        throw err.stack;
    }
    console.log('Connected as ID: ' + conn.threadId);
});
//routes
app.get('/', (req, res) => {
    res.render('index');
});
app.get('/continent', (req, res) => {
    let sql = "SELECT * FROM continents";
    conn.query(sql, (err, results) => {
        if (err) {
            res.send(err)
        } else {
            res.render('pages/continent/index', { continents: results });
        }
    })
});
app.get('/continent/create', (req, res) => {
    res.render('pages/continent/create');
});
app.post('/continent/create', (req, res) => {
    if (req.body.name) {
        let sql = `INSERT INTO continents(name,status) VALUES ('${req.body.name}',${req.body.status})`;
        conn.query(sql, (err, results) => {
            if (err) {
                res.send(err);
            } else {
                res.redirect('/continent');
            }
        })
    } else {
        res.send('no name no query');
    }
});
app.get('/continent/edit/:id', (req, res) => {
    let id = req.params.id;
    let sql = `SELECT * FROM continents WHERE id = ${id}`;
    conn.query(sql, (err, results) => {
        if (err) {
            res.send(err)
        } else {
            res.render('pages/continent/edit', { continent: results[0] });
        }
    })
});
app.post('/continent/edit/:id', (req, res) => {
    let id = req.params.id;
    if (req.body.name) {
        let sql = `UPDATE continents SET name = '${req.body.name}', status = ${req.body.status} WHERE id = ${id}`;
        conn.query(sql, (err) => {
            if (err) {
                res.send(err);
            } else {
                res.redirect('/continent');
            }
        })
    } else {
        res.send('no name no query');
    }
});
app.get('/continent/delete/:id', (req, res) => {
    let id = req.params.id;
    let sql = `DELETE FROM continents WHERE id = ${id}`;
    conn.query(sql, (err) => {
        if (err) {
            res.send(err);
        } else {
            res.redirect('/continent');
        }
    })
});
app.get('/player', (req, res) => {
    let sql = "SELECT p.*, c.name as continent FROM players p JOIN continents c ON p.continent_id = c.id";
    conn.query(sql, (err, result) => {
        if (err) {
            res.send(err);
        } else {
            res.render('pages/player/index', { players: result });
        }
    })
});
app.get('/player/create', (req, res) => {
    let sql = "SELECT * FROM continents";
    conn.query(sql, (err, result) => {
        if (err) {
            res.send(err);
        } else {
            res.render('pages/player/create', { continents: result });
        }
    })
});
app.post('/player/create', upload.single('avatar'), (req, res) => {
    var name = req.body.name;
    var price = req.body.price;
    var avatar = req.file.filename;
    var status = req.body.status;
    var continent_id = req.body.continent_id;
    let sql = `INSERT INTO players(name,price,avatar,status,continent_id) VALUES ('${name}','${price}','${avatar}','${status}','${continent_id}')`;
    conn.query(sql, (err) => {
        if (err) {
            res.send(err);
        } else {
            res.redirect('/player');
        }
    })
});
app.get('/player/edit/:id', (req, res) => {
    let id = req.params.id;
    let sql = `SELECT * FROM players WHERE id = ${id}`;
    conn.query(sql, (err, result) => {
        if (err) {
            res.send(err);
        } else {
            conn.query("SELECT * from continents", (errr, results) => {
                if (errr) {
                    res.send(errr)
                } else {
                    res.render('pages/player/edit', { continents: results, player: result[0] });
                }
            })
        }
    })
});
app.post('/player/edit/:id', upload.single('avatar'), (req, res) => {
    let id = req.params.id;
    let sql = `SELECT * FROM players WHERE id = ${id}`;
    conn.query(sql, (err, result) => {
        if (err) {
            res.send(err);
        } else {
            var name = req.body.name;
            var price = req.body.price;
            var status = req.body.status;
            var continent_id = req.body.continent_id;
            if (req.file != null) {
                var avatar = req.file.filename;
            } else {
                var avatar = result[0].avatar;
            }
            let sql = `UPDATE players SET name = '${name}', price = '${price}', avatar = '${avatar}', status = '${status}', continent_id = '${continent_id}' WHERE id = ${id}`;
            conn.query(sql, (err) => {
                if (err) {
                    res.send(err);
                } else {
                    res.redirect('/player');
                }
            })
        }
    })
});
app.get('/player/delete/:id', (req, res) => {
    let id = req.params.id;
    let sql = `DELETE FROM players WHERE id = ${id}`;
    conn.query(sql, (err) => {
        if (err) {
            res.send(err);
        } else {
            res.redirect('/player');
        }
    })
});


app.listen(port, () => {
    console.log(`Listening http://localhost:${port}`);
});