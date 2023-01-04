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

//connect to database
var conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'nodejs_1',
    charset: 'utf8_general_ci',
});
conn.connect((err)=>{
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
    conn.query(sql,(err,results)=>{
        if (err) {
            res.send(err)
        }else{
            res.render('pages/continent/index',{continents:results});
        }
    })
});
app.get('/continent/create', (req, res) => {
    res.render('pages/continent/create');
});
app.post('/continent/create', (req, res) => {
    if (req.body.name) {
        let sql  = `INSERT INTO continents(name,status) VALUES ('${req.body.name}',${req.body.status})`;
        conn.query(sql,(err,results)=>{
            if (err) {
                res.send(err);
            }else{
                res.redirect('/continent');
            }
        })
    }else{
        res.send('no name no query');
    }
});
app.get('/continent/edit/:id', (req, res) => {
    let id = req.params.id;
    let sql = `SELECT * FROM continents WHERE id = ${id}`;
    conn.query(sql,(err,results)=>{
        if (err) {
            res.send(err)
        }else{
            res.render('pages/continent/edit',{continent:results[0]});
        }
    })
});
app.post('/continent/edit/:id', (req, res) => {
    let id = req.params.id;
    if (req.body.name) {
        let sql  = `UPDATE continents SET name = '${req.body.name}', status = ${req.body.status} WHERE id = ${id}`;
        conn.query(sql,(err)=>{
            if (err) {
                res.send(err);
            }else{
                res.redirect('/continent');
            }
        })
    }else{
        res.send('no name no query');
    }
});
app.get('/continent/delete/:id', (req, res) => {
    let id = req.params.id;
    let sql = `DELETE FROM continents WHERE id = ${id}`;
    conn.query(sql,(err)=>{
        if (err) {
            res.send(err)
        }else{
            res.redirect('/continent');
        }
    })
});


app.listen(port, () => {
    console.log(`Listening http://localhost:${port}`);
});