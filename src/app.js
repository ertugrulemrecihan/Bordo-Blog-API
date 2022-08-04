const express = require("express");
const config = require("./config");
const loaders = require("./loaders");
const events = require("./api/v1/scripts/events");
const successHandler = require("./api/v1/middlewares/successHandler");
const errorHandler = require("./api/v1/middlewares/errorHandler");
const routes = require("./api/v1/routes");

config();
loaders();
events();

const app = express();
app.use(express.json());

app.use("/api/v1/user", routes.user);
app.use("/api/v1/role", routes.role);
app.use("/api/v1/tag", routes.tag);

app.use(successHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
    console.log(`Listening Port On http://localhost:${PORT}`)
);
