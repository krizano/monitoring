# Monitoring app

### Authorization
All request are required to provide `authorization` header with `<access_token>` attached. Token validation failure will result in [`403` - unauthorized] for all routes

---

### Management REST API
`/` - app status / health

| Method  | Path  | Response   |
|---------|-------|------------|
| `GET`   | `/`   | `200` - ok |

<br>

`/endpoint` - Endpoint management

| Method     | Path               | Response |
|------------|--------------------|----------|
| `GET`      | `/`                | `200` - all endpoints |
| `GET`      | `/<endpoint_id>`   | `200` - single endpoint, `404` - failure |
| `POST`     | `/`                | `201` - created, `400` - failure |
| `PUT`      | `/<endpoint_id>`   | `201` - updated, `400`, `404` - failure |
| `DELETE`   | `/<endpoint_id>`   | `204` - deleted, `400`, `404` - failure |

<br>

`/results` - Provide monitoring results for selected endpoint

| Method  | Path                    | Query | Response |
|---------|-------------------------|-------|----------|
| `GET`   | `/<endpoint_id>`        | `<limit>` - number of newest records | `200`, `404` |
| `GET`   | `/<endpoint_id>/last`   | | `200` - last record, `404` |

---

### Endpoint monitoring service
- schedule and run endpoint checks
- persist check results

---

## Get started
Run `npm seed` for database setup prior to launchng the application. Make sure the database server is running. You can spin it up separately using Docker (see *docker-compose.yml*) and run the seed script against it.
- create database, tables
- insert user seed records


### Development
`npm run dev` -- Start application in dev mode (hot-reload). Make sure the database server is up.

`docker-compose up` -- Dockerized dev mode with mysql service, wheee


### Build
`npm run build` -- Required for *production* mode in both *npm* and *docker* setups.

`docker-compose build` -- Required for both *development* and *production* mode in *docker* setup.


### Production
`npm run start`

`docker-compose -f docker-compose.yml -f docker-compose.prod.yml up`


## Settings (.env)
Server

`APP_PORT`

Database (MySQL)

`DB_HOST`

`DB_PORT`

`DB_NAME`

`DB_USERNAME`

`DB_PASSWORD`


## Tests (Jest)
Run `npm run test` to do some checks


## Security
 `npm audit` -- Dependencies check
