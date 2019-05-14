const http = require('http');
const express = require('express');
const app = express();
const client = require('prom-client');
const mongoose = require('mongoose');
const f = require('util').format;

/** ********************************************************************************************* */
/** CONFIGURAÇÃO DAS MÉTRICAS                                                                     */
/** ********************************************************************************************* */
const register = new client.Registry();

const uptime = new client.Gauge({ name: 'uptime', help: 'Uptime' });
const counter = new client.Counter({ name: 'invocation_counter', help: 'Quantidade de requisições' });

register.registerMetric(uptime);
register.registerMetric(counter);

/** ********************************************************************************************* */
/** CONEXÃO COM MONGO DB                                                                          */
/** ********************************************************************************************* */
const { MONGODB_HOST = 'noderest_mongo_1', MONGODB_PORT = '27017', MONGODB_DATABASE = 'noderest' } = process.env;

const user = encodeURIComponent(process.env.MONGO_USER);
const pass = encodeURIComponent(process.env.MONGO_PASSWORD);
const authMechanism = 'DEFAULT';
const url = f('mongodb://%s:%s@%s:%s/%s?authMechanism=%s', user, pass, MONGODB_HOST, MONGODB_PORT, MONGODB_DATABASE, authMechanism);

mongoose.connect(url, { useNewUrlParser: true }, function(err) {
  if (err) console.log('Erro na conexão:', err);
});

const db = mongoose.connection;
const hello = db.collection('hello');

/** ********************************************************************************************* */
/** INCREMENTO DO CONTADOR A CADA REQUISIÇÂO                                                      */
/** ********************************************************************************************* */
app.use((req, res, next) => {
  counter.inc();
  next();
});

/** ********************************************************************************************* */
/** EXPOSIÇÃO DOS ENDPOINTS                                                                       */
/** ********************************************************************************************* */
app.get('/hello', (req, res, next) => {
  const resposta = { message: 'world' };
  res.status(200).send(resposta);
});

app.get('/info', (req, res, next) => {
  hello.findOne({ _id: 1 }, function(err, doc) {
    if (err) {
      console.log(err);
      res.status(500).send('Item não encontrado.');
    } else {
      const resposta = { message: doc.message };
      res.status(200).send(resposta);
    }
  });
});

app.get('/metrics', (req, res, next) => {
  uptime.set(process.uptime());
  res.set('Content-Type', register.contentType);
  res.end(register.metrics());
});

/** ********************************************************************************************* */
/** INICIALIZAÇÃO DO SERVIDOR                                                                     */
/** ********************************************************************************************* */
const server = http.createServer(app);
server.listen(3000);
