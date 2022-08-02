const express = require("express");
const config = require("./config");
const loaders = require("./loaders");

config();
loaders();

const app = express();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
    console.log(`Listening Port On http://localhost:${PORT}`)
);
