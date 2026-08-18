const startTime = Date.now()

import dotenv from 'dotenv'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: resolve(__dirname, '../../../.env'), quiet: true })
const port = process.env.SERVER_PORT;

import cors from 'cors'
import express from 'express';
import cookieParser from 'cookie-parser';
import type { Application } from 'express';
import { Sequelize } from 'sequelize';
import router from './routes/index.ts'
import SequelizeManager from './managers/sequelizeManager.ts';
import UserController from './controllers/UserController.ts';
import UserRepository from './repositories/UserRepository.ts';
import initModels from './models/sequelize/index.ts';
import AuthController from './controllers/AuthController.ts';
import AirportController from './controllers/AirportController.ts';
import AirportRepository from './repositories/AirportRepository.ts';
import HotelController from './controllers/HotelController.ts';
import HotelRepository from './repositories/HotelRepository.ts';
import PriceOfferController from './controllers/PriceOfferController.ts';
import HotelGroupController from './controllers/HotelGroupController.ts';
import HotelGroupRepository from './repositories/HotelGroupRepository.ts';
import PriceOfferRepository from './repositories/PriceOfferRepository.ts';
import ReviewController from './controllers/ReviewController.ts';
import ReviewRepository from './repositories/ReviewRepository.ts';
import SearchController from './controllers/SearchController.ts';
import PermissionRepository from './repositories/PermissionRepository.ts';
import PermissionController from './controllers/PermissionController.ts';

const app: Application = express();
app.use(cookieParser());
app.use(express.urlencoded({extended: true}));
app.use(express.json());
console.debug("\nConnecting to PostgreSQL...")
const sequelize= new Sequelize('dev','dremoxyi','admin', {host: 'localhost', dialect: 'postgres'})
const postgresClient:Sequelize = connectToPostgres()
function connectToPostgres():Sequelize {
    sequelize.authenticate()
    .then(() => {})
    .catch((err) => {
        throw new Error(`Failed to Connect Sequelize\n${err}`);
    })
    return sequelize
}
initModels(postgresClient)
await postgresClient.sync({logging:false, alter:true});
console.debug("Synchronized with PostgreSQL")

const models = postgresClient.models;

const sequelizeManager = new SequelizeManager(postgresClient)
const userRepository = new UserRepository(models)
const airportRepository = new AirportRepository(models)
const hotelRepository = new HotelRepository(models)
const reviewRepository = new ReviewRepository(models)
const hotelgroupRepository = new HotelGroupRepository(models)
const priceofferRepository = new PriceOfferRepository(models)
const permissionRepository = new PermissionRepository(models)
const dependencies = {sequelizeManager, userRepository, airportRepository, hotelRepository, reviewRepository, hotelgroupRepository, priceofferRepository, permissionRepository, models}

const priceofferController = new PriceOfferController(dependencies)
const hotelgroupController = new HotelGroupController(dependencies)
const reviewController = new ReviewController(dependencies)
const hotelController = new HotelController(dependencies)
const airportController = new AirportController(dependencies)
const userController = new UserController(dependencies)
const authController = new AuthController(dependencies)
const searchController = new SearchController(dependencies)
const permissionController = new PermissionController(dependencies)
const controllers = {userController, authController, airportController,hotelController,reviewController,hotelgroupController,priceofferController, searchController, permissionController, models}

//-- CORS --//
app.use(cors({origin: ["http://localhost:5173","http://localhost:4173"], credentials: true }));
//----------//
app.use('/', router(controllers))
app.listen(port, () => {
    const startup_time = Date.now() - startTime;
    console.log(`\n   \x1b[1;34mSERVER\x1b[0m \x1b[34mv0.9.0\x1b[0m  \x1b[90mready in\x1b[0m ${startup_time}ms\n`)
    console.log(`   \x1b[34m➜\x1b[0m  Running on:\x1b[36m http://localhost:${port}\x1b[0m\n`)
})
