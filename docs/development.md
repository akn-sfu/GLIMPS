# Installations

-  [Docker](https://docs.docker.com/get-docker/)
-  [docker-compose](https://docs.docker.com/compose/install/)
-  [node.js](https://nodejs.org/en/) (version 14 LTS recommended)

# Setup Development Environment

1. In the project root, run `docker-compose up`. This command will start up the postgres database on port `5432` on your computer.
2. In the project root, run `npm install` and then `npm run bootstrap`. This will install and link dependencies.
3. In the project root, run `npm run build`, this will build all our packages in order.
4. In **packages/api** folder run: `npm run migrate` and then `npm run start:dev` to start the API.
5. In **packages/webapp** run `npm run start` to start the webapp at `http://localhost:3000`.
6. Change `https://glimps-dev-glb.cmpt.sfu.ca/api/v4` (packages/api/src/config) to `https://csil-git1.cs.surrey.sfu.ca/api/v4` if you want to target to sfu Gitlab server on your local.

## Packages and Commands Explanations

* `packages/api`: The backend server, which uses the Express and NestJS frameworks.  In `packages/api`, run: 
    1. `npm run build && npm run migrate`: to build the app and then run migrations to keep your database schema up to date
    2. `npm run start:dev`: start the server in development mode.
* `packages/types`: Shared type definitons so the front end and back end know what resources are being transferred: run `npm run build` before running the api or webapp
* `packages/webapp`: The frontend, which is a React application. Run `npm run start` (in `packages/webapp`) to start the front end in development mode.
