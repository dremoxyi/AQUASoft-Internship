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
- PostgreSQL

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