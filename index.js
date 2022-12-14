const express = require("express");
const { Client } = require('pg');
const cors = require("cors");
const bodyparser = require("body-parser");
const config = require("./config");
const jwt = require("jsonwebtoken");
const mid = require("./middleware");

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

// CRUD de usuarios
// -----------------------------------------------------------

app.get("/", (request, response) => {

  client.query("SELECT email, password FROM users", function
    (err, result) {
    console.log(result.rows)
  }
  )
  console.log("Response ok");
  response.send({ Message: "OK" })
});

app.get("/users", (req, res) => {
  try {
    client.query("SELECT * FROM users", function
      (err, result) {
      if (err) {
        return console.error("Erro ao executar a qryde SELECT", err);
      }
      res.send(result.rows);
      console.log("Chamou get usuarios");
    });
  } catch (error) {
    console.log(error);
  }
});

app.post("/users/sign", mid.validatePermission, (req, res) => {
  try {
    console.log("Chamou post", req.body);
    const { name, email, password, permissions } = req.body;
    client.query(
      "INSERT INTO users (name, email, password, permissions) VALUES ($1, $2, $3, $4) RETURNING * ",
      [name, email, password, permissions],
      function (err, result) {
        if (err) {
          return console.error("Erro ao executar a qry de INSERT", err);
        }
        const { id } = result.rows[0];
        res.setHeader("id", `${id}`);
        res.status(201).json(result.rows[0]);
        console.log(result);
      }
    );
  } catch (erro) {
    console.error(erro);
  }
});

app.post("/users/login", (req, res) => {
  try {
    var verify = false;
    var jsonUser = {
      id: "",
      name: "",
      email: "",
      password: "",
      permissions: ""
    }
    const { email, password } = req.body;
console.log(email, password);
    client.query(
      "SELECT id,name,email, password, permissions FROM users WHERE email = $1",[email], function (err, result) {
        if (err) {
          return console.error("Erro ao executar a qry de SELECT", err);
        }
        if (result.rowCount <= 0) {
          res.status(200).send({status: "email errado"});
        } else  {
          let data = result.rows[0];
          console.log(data);
          if ( data.password === password) { //value.email === email &&
            jsonUser.id = data.id;
            jsonUser.name = data.name;
            jsonUser.email = data.email;
            jsonUser.password = data.password;
            jsonUser.permissions = data.permissions;
            res.status(200).send({ status: "Sucesso", token: jwt.sign({ jsonUser }, config.strKey) });
          } 
          else {
            console.log(data);
            res.status(200).send({status:"senha errada"});
          }
        }    
      }
    )


  } catch (erro) {
    console.log(erro);
  }
})

app.put("/users/:id", mid.existingUserById, (req, res) => {
  try {
    console.log("Chamou update", req.body);
    const id = req.params.id;
    const { name, email, password } = req.body;
    client.query(
      "UPDATE users SET name=$1, email=$2, password=$3 WHERE id =$4 ",
      [name, email, password, id],
      function (err, result) {
        if (err) {
          return console.error("Erro ao executar a qry de UPDATE", err);
        } else {
          res.setHeader("id", id);
          res.status(202).json({ id: id });
          console.log(result);
        }
      }
    );
  } catch (erro) {
    console.error(erro);
  }
});

app.delete("/users/:id", (req, res) => {
  try {
    console.log("Chamou delete /:id " + req.params.id);
    const id = req.params.id;
    client.query(
      "DELETE FROM users WHERE id = $1",
      [id],
      function (err, result) {
        if (err) {
          return console.error("Erro ao executar a qry de DELETE", err);
        } else {
          if (result.rowCount == 0) {
            res.status(400).json({ info: "Registro não encontrado." });
          } else {
            console.log(result.rows);
            res.status(200).json({ info: `Registro excluído. Código: ${id}` });
          }
        }
        console.log(result);
      }
    );
  } catch (error) {
    console.log(error);
  }
});

//CRUD de Produtos
//-----------------------------------------------------------------------------

app.get("/product", (req, res) => {
  try {
    client.query("SELECT * FROM car", function
      (err, result) {
      if (err) {
        return console.error("Erro ao executar a qryde SELECT", err);
      }
      res.send(result.rows);
      console.log("Chamou get products");
    });
  } catch (error) {
    console.log(error);
  }
});

app.post("/product", (req, res) => {
  try {
    console.log("Chamou post", req.body);
    const { name, model, year, km_road } = req.body;
    client.query(
      "INSERT INTO car (name, model, year, km_road) VALUES ($1, $2, $3, $4) RETURNING * ",
      [name, model, year, km_road],
      function (err, result) {
        if (err) {
          return console.error("Erro ao executar a qry de INSERT", err);
        }
        const { id } = result.rows[0];
        res.setHeader("id_car", `${id}`);
        res.status(201).json(result.rows[0]);
        console.log(result);
      }
    );
  } catch (erro) {
    console.error(erro);
  }
});

app.put("/product/:id", mid.existingCarById, (req, res) => {
  try {
    console.log("Chamou update", req.body);
    const id = req.params.id;
    const { name, model, year, km_road } = req.body;
    client.query(
      "UPDATE car SET name=$1, model=$2, year=$3, km_road=$4 WHERE id_car =$5 ",
      [name, model, year, km_road, id],
      function (err, result) {
        if (err) {
          return console.error("Erro ao executar a qry de UPDATE", err);
        } else {
          res.setHeader("id_car", id);
          res.status(202).json({ id_car: id });
          console.log(result);
        }
      }
    );
  } catch (erro) {
    console.error(erro);
  }
});

app.delete("/product/:id", (req, res) => {
  try {
    console.log("Chamou delete /:id " + req.params.id);
    const id = req.params.id;
    client.query(
      "DELETE FROM car WHERE id_car = $1",
      [id],
      function (err, result) {
        if (err) {
          return console.error("Erro ao executar a qry de DELETE", err);
        } else {
          if (result.rowCount == 0) {
            res.status(400).json({ info: "Registro não encontrado." });
          } else {
            console.log(result.rows);
            res.status(200).json({ info: `Registro excluído. Código: ${id}` });
          }
        }
        console.log(result);
      }
    );
  } catch (error) {
    console.log(error);
  }
});



app.listen(config.port, () =>
  console.log("Servidor funcionando na porta " + config.port)
);

module.exports = app;