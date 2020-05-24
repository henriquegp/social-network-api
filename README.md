# Social Network Api - Node.js

Social Network RESTful API using Express and Typescript. 

## Getting Started
First you need to have `Node`, `MySql` and `Redis` installed on your machine. Then, follow the instructions bellow to set up your dev environment.

### Installation

1. Run `npm install` to install all dependencies

2. Configure the environment variables.

3. Run `npm run build` to transpile all typescript files.

4. Run the sequelize migrations to create the database tables.
```bash
  npx sequelize db:migrate
```

5. Run `npm run dev` to start the project.

6. Run `npm run queue` to start the e-mail queue

7. Create folders to save the project images
```bash
  mkdir temp
  cd temp
  mkdir uploads
```

## Features
- TypeScript
- Express
- Socket.io
- Bull.js
- MySQl
- Redis
