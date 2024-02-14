# This Repository
The `api` is a basic Express application and uses Prisma for data access with a SQLite database.

The `client` is a basic Vite + React application.

You can run both projects together with

```
$> npm run start
```

or individually with

```
$> npm run start:api
$> npm run start:client
```

The API and client will both automatically reload on file changes to help speed up development.

You can also run integration tests with

```
$> npm run start
```

To start a new application:
http://localhost:5173/application

To access an existing application (with id 1):
http://localhost:5173/application?id=1

Endpoints can be accessed via postman at http://localhost:8000

# Know issues & possible improvements

Client - 
1. Although the PUT endpoint allows user to submit partial data for updating the application, the client side does not take adventage of this behavior
2. On the client side, if we supply a url with a non-existint ID, I should ideally display a 404 page.
3. The vehicles sections should ideally be made into its own component.
4. Client should not allow more than 3 vehicles.
5. An empty vehicle row should probably be excluded from the body of POST and PUT endpoints to avoid triggering validation errors.


Server - 
1. I should have 2 separate DTOs instead of just 1, one for DB, one for the API interface.
2. It might be okay to store Vehicles as a json blob if they are not accessed outside of the application context. However, vehicles should exist as object arrays in frontend and API code. And vehicles should exist only as json string when reading from and writing to the DB.

