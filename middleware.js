const express = require("express");
const { Client } = require('pg');
const cors = require("cors");
const bodyparser = require("body-parser");
const config = require("./config");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyparser.json());

var conString = config.urlConnection;
var client = new Client(conString);
client.connect(function (err) {
  if (err) {
    return console.error('Não foi possível conectar ao banco.', err);
  }
  client.query('SELECT NOW()', function (err, result) {
    if (err) {
      return console.error('Erro ao executar a query.', err);
    }
    console.log(result.rows[0]);
  });
});

function validatePermission(req, rep, next){
  const {permissions} = req.body;

  if(permissions === 'administrador' || permissions === 'cliente')
    return next();
  else
    return rep.status(400).json({error: "Permissão inválida!"});
}

function existingUserById (req, res, next){
  const id = req.params.id;
  try{
    client.query("SELECT * FROM users WHERE id=$1",
    [id],
    function(err, result) {
      if(err){
        return console.error("Erro ao executar a query SELECT", err);
      }
      if(result.rows[0].id == id){
        return next();
      }
      return res.status(400).json({message: "dont exists!"})
    })
  }catch (error) {
    console.log(error);
  }
}

function existingCarById (req, res, next){
  const id = req.params.id;
  try{
    client.query("SELECT * FROM car WHERE id_car=$1",
    [id],
    function(err, result) {
      if(err){
        return console.error("Erro ao executar a query SELECT", err);
      }
      if(result.rows[0].id_car == id){
        return next();
      }
      return res.status(400).json({message: "dont exists!"})
    })
  }catch (error) {
    console.log(error);
  }
}

function existingUser(req, res, next) {
  try {
    var json = {};
    const { email, password } = req.body;
    client.query("SELECT email, password FROM users", function (err, result) {
      if (err) {
        return console.error("Erro ao executar a query SELECT", err);
      }
      result.rows.forEach((value) => {
        console.log(value)
        if (value.email === email && value.password === password) {
          return next();
        }
      })
      return res.status(400).send("teste de falha");
    })
    
  } catch (error) {
    console.log(error);
  }
  
}

module.exports = {
  validatePermission,
  existingCarById,
  existingUserById,
  existingUser
}