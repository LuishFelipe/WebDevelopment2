const dotenv = require('dotenv');

dotenv.config();

const {
  PORT,
  pgConnection
} = process.env;

const strKey = "acessoGeral";

module.exports = {
  port: PORT,
  urlConnection: pgConnection,
  strKey: strKey
}