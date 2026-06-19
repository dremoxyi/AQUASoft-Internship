import express from 'express';
import { Sequelize } from 'sequelize';
const app = express();
const port = 3000;
app.get('/', (req, res) => {
    res.send(`> Setup status: done`);
});
app.listen(port, () => {
    console.log(`> Listen to http://localhost:${port}`);
});
