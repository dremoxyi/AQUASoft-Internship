import dotenv from 'dotenv'
dotenv.config();

import express from 'express';
import type { Application } from 'express';
import { Sequelize } from 'sequelize';

import router from './routes/index.ts';
import initModels from './models/sequelize/index.ts'

import HotelRepository from './repositories/hotelRepo.ts';
import CityRepository from './repositories/cityRepo.ts';
import RegionRepository from './repositories/regionRepo.ts';
import HotelController from './controllers/hotel/index.ts';
import TransactionManager from './manager/TransactionManager.ts';
import ReviewRepository from './repositories/reviewRepo.ts';
import PriceOfferRepository from './repositories/priceofferRepo.ts';
import AirportController from './controllers/airport/index.ts';
import AirportRepository from './repositories/airportRepo.ts';

const app: Application = express();
app.use(express.urlencoded({extended: true}))
app.use(express.json());

if (!process.env.ADMIN_TOKEN) {
  throw new Error(">> ADMIN_TOKEN is missing >> Please create .env with ADMIN_TOKEN")
}
if (!process.env.SERVER_PORT) {
  throw new Error(">> SERVER_PORT is missing >> Please create .env with SERVER_PORT")
}
const port = process.env.SERVER_PORT;
const sequelize = new Sequelize('dev', 'dremoxyi', 'admin', {
  host: 'localhost',
  dialect: 'postgres',
});
// postgresClient is the sequelize binded to the Postgres database. To access another database, it is better to instantiate another one.
const postgresClient = connectToPostgres() // Function are Hoisted so it works
function connectToPostgres():Sequelize {
  sequelize.authenticate()
  .then(() => {
    console.log('[ SEQUELIZE ] > Connection has been established successfully <');
    console.log('\n>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>')
  })
  .catch((err) => {
    console.log('[ SEQUELIZE ] > Unable to connect to the databse:',err);
    process.exit(1);
  })
  return sequelize
  // Avoid Async/Await makes it that the returned sequelize is not a Promise object, but the sequelize Instance directly.
}
initModels(postgresClient);
await postgresClient.sync();
console.log('<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<\n')
const transactionManager = new TransactionManager(postgresClient)
const models = postgresClient.models;

const hotelRepository = new HotelRepository(models);
const cityRepository = new CityRepository(models);
const regionRepository = new RegionRepository(models);
const airportRepository = new AirportRepository(models);
const priceofferRepository = new PriceOfferRepository(models);
const reviewRepository = new ReviewRepository(models);

const dependencies = { hotelRepository, cityRepository, regionRepository,reviewRepository,priceofferRepository,airportRepository,transactionManager}

const hotelController = new HotelController(dependencies);
const airportController = new AirportController(dependencies);

const controllers = { hotelController,airportController };

app.use('/', router(controllers));
app.listen(port, () => {
    console.log(`[  SERVER  ] > Ruuning on : http://localhost:${port} <\n`);
});