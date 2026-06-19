import express from 'express';
import type { Application } from 'express';
import { Sequelize } from 'sequelize';

import router from './routes/index.ts';
import exampleServices from './services/exampleServices.ts'

const app: Application = express();
const port = 3000;
const sequelize = new Sequelize('dev', 'dremoxyi', 'admin', {
  host: 'localhost',
  dialect: 'postgres',
});

// Connect/Startup | DEBUG |
app.listen(port, () => {
    console.log(`> [  SERVER  ] Big Brother is watching : http://localhost:${port} <`);
});
try {
  await sequelize.authenticate();
  console.log('> [ DATABASE ] Connection has been established successfully. <');
} catch (error) {
  console.error('/!\\ Unable to connect to the database /!\\:', error);
}
const exampleService = new exampleServices();
app.use('/', router({exampleService}));
// END Connect/Startup | DEBUG |



