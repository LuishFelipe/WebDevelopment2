const express = require("express");
const { Client } = require('pg');
const cors = require("cors");
const bodyparser = require("body-parser");
const config = require("./config");

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

//middleware
function validatePermission(req, res, next) {
  const { permissions } = req.body;

  if (permissions === 'administrador' || permissions === 'cliente')
    return next();
  else
    return res.status(400).json({ error: "Permissão inválida!" });
}

// function existingUser(req, res, next) {
//   const { email, password } = req.body;
//   try {
//     client.query("SELECT email, password FROM users", function (err, result) {
//       if (err) {
//         return console.error("Erro ao executar a query SELECT", err);
//       }
//       const call = result.rows.map((value) => {
//         console.log(value)
//         if (value.email === email && value.password === password) {
//           return true;
//         }
//       })
//       if (call) {
//         return next();
//       }
//     })
//     return res.status(404).json({ Message: "email ou senha inválidos!!" })
//   } catch (error) {
//     console.log(error);
//   }
// }

function existingUserById (req, res, next){
  const id = req.params.id;
  try{
    client.query("SELECT id FROM users WHERE id=$1",
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

app.get("/", (request, response) => {
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

app.post("/users", validatePermission, (req, res) => {
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

app.put("/users/:id", existingUserById, (req, res) => {
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

app.delete("/users/:id",(req, res) => {
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

app.post("/users", validatePermission, (req, res) => {
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

app.put("/users/:id", existingUserById, (req, res) => {
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

app.delete("/users/:id",(req, res) => {
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



app.listen(config.port, () =>
  console.log("Servidor funcionando na porta " + config.port)
);