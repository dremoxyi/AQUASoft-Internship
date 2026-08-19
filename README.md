# ***AQUASoft Internship Dremoxyi's Projects***
Welcome to my internship repository, Here you will find every project i have done as an intern in AQUASoft.

The repository is organized such as every folder is a project.

You can clone this repository with `git clone https://github.com/dremoxyi/AQUASoft-Internship.git`. 

**_Summary_**
- [MiniSprint 001](#minisprint-001)
- [MiniSprint 002](#minisprint-002)
- [MiniSprint 003](#minisprint-003)
- More coming...

## MiniSprint 001
Minisprint 001 is an introductory exercice to TypeScript and React.

The project is divided into 2 parts:
#### React
Which is the Visible UI
#### Typescript
Which handles the logic and also acts as a walkthrough TypeScript
You can find in the `console` a structured walkthrough of TypeScript concepts



### Built with
- TypeScript v6.0.3
- Node.js v26.3.0
- React v19.2.7
- Vite v8.0.16

### What to install
- Node.js v26.3.0+

### How to use
*Reminder: be sure to be located in `./AQUASoft-Intership/Minisprint001/$` before continuing*

Run the command
```console
npm run dev
```
The project should be then running locally on `http://localhost:3000/`.

## MiniSprint 002
MiniSprint 002 is an exercise focused on database design and API development.

The goal is to create a Hotel API using Typescript, Express.js, PostgreSQL and Sequelize.

The architecture is the following: 

Client -> Routes -> Middleware -> Controller -> Services -> Repository -> PostgreSQL

- Routes: Define the endpoints.
- Middleware: Authenticates requests when required.
- Controller: Validates client input and calls the appropriate service function.
- Services: Implements the business logic.
- Repository: Performs Sequelize database operations.
- Models: Defines the Database Models.
- Manager: Handles Sequelize transactions (performs rollbacks when an error occurs).

### Built with
- TypeScript v6.0.3
- Node.js v26.3.0
- Express.js v5.2.1
- Sequelize v6.37.8
- PostgreSQL v18.4

### What to install
- Node.js v26.3.0+
- Docker (with postgres)
- Postman (for test)

### How to use
*Reminder: be sure to be located in `./AQUASoft-Intership/Minisprint002/$` before continuing*

Create a `.env` file based on `.env.example`:
```bash
ADMIN_TOKEN=ichigo-kurosaki-vs-yhwach 
SERVER_PORT=3000
```
Install all dependencies in package.json with the command:
```console
npm install
```
Start the PostgreSQL container:
```console
docker-compose up
```
Then, Initialize the database with:
```console
npm run db:init
```
Finally, Run the command:
```console
npm run dev
```
The database will be available at `localhost:5432`

The server should be running locally on `http://localhost:3000/`.

### API Endpoints
Refer to /src/models/sequelize/index.js for hotel object

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /hotels | Retrieve all hotels |
| GET | /hotels/:name | Retrieve a hotel by name |
| POST | /hotels | Create a hotel |
| PUT | /hotels | Update a hotel |
| DELETE | /hotels/:id | Delete a hotel |

## MiniSprint 003
Continuation of MiniSprint 002
- Added Airports, Reviews, Users, HotelGroup, PriceOffers Tables
- Added Repositories, Services, Controller
- New Scraped Data -> Refactored Init file
- Added new GET route: /airports/:iata_code/closest-hotel-offers, that shows 10 closest hotels price offers from an airport iata code

### Built with
- TypeScript v6.0.3
- Node.js v26.3.0
- Express.js v5.2.1
- Sequelize v6.37.8
- PostgreSQL v18.4

### What to install
- Node.js v26.3.0+
- Docker (with postgres)
- Postman (for test)

### How to use
Only change is initialization of database: 

from 
```console
npm run db:init
``` 

to 
```console
npm run init
```

For the rest refer to Minisprint 002

### API Endpoints
Refer to /src/models/sequelize/index.js for hotel object

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /hotels | Retrieve all hotels |
| GET | /hotels/:name | Retrieve a hotel by name |
| POST | /hotels | Create a hotel |
| PUT | /hotels | Update a hotel |
| DELETE | /hotels/:id | Delete a hotel |
| GET | /airports/:iata_code/closest-hotel-offers | Retrieve closest hotel offers from an Airport |



## MiniSprint 004
Full-Stack Project - Hotel Application

### Built with

**Frontend**
- TypeScript v6.0.2+
- React v19.2.7
- Vite v8.1.1
- React Router v6.14.1
- Leaflet v1.9.4
- React Leaflet v5.0.0
- Zustand v5.0.14

**Backend**
- TypeScript v6.0.2+
- Node.js v26.3.0
- Express.js v5.2.1
- Sequelize v6.37.8
- PostgreSQL v18.4


### What to install
- Python v3.12+
- Node.js v26.3.0+
- Docker (with PostgreSQL)

### How to use

*Reminder: be sure to be located in `./AQUASoft-Intership/Minisprint004/` before continuing.*

Install all dependencies:

```console
npm install
```

Set up the dataset and initialize the database:

```console
npm run db
```

Start the application in preview mode:

```console
npm run preview
```

Or start the application in development mode (uses React Strict Mode):

```console
npm run dev
```

The backend server will be available at `http://localhost:3000/`.

The frontend will be available at `http://localhost:4173/`.


