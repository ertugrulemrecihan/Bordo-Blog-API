const express = require("express");
const config = require("./config");
const loaders = require("./loaders");
const successHandler = require("./api/v1/middlewares/successHandler");
const errorHandler = require("./api/v1/middlewares/errorHandler");

config();
loaders();

const app = express();
app.use(express.json());

app.use(successHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
    console.log(`Listening Port On http://localhost:${PORT}`)
);
