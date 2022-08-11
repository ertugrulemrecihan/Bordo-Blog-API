const express = require('express');
const cors = require('cors');
const config = require('./config');
const loaders = require('./loaders');
const events = require('./api/v1/scripts/events');
const successHandler = require('./api/v1/middlewares/successHandler');
const errorHandler = require('./api/v1/middlewares/errorHandler');
const routes = require('./api/v1/routes');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../doc/static/openapi.json');

config();
loaders();
events();

const app = express();
app.use(express.json());

app.use(cors({
    origin: '*'
}));

app.use('/api/v1/doc', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/api/v1/user', routes.user);
app.use('/api/v1/post', routes.post);
app.use('/api/v1/address', routes.address);
app.use('/api/v1/tag', routes.tag);

// Admin Routes
app.use('/api/v1/admin/role', routes.adminRole);
app.use('/api/v1/admin/tag', routes.adminTag);
app.use('/api/v1/admin/post', routes.adminPost);
app.use('/api/v1/admin/user', routes.adminUser);
app.use('/api/v1/admin/address', routes.adminAddress);
app.use('/api/v1/admin/plan', routes.adminPlan);

app.use(successHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    console.log(`Listening Port On http://localhost:${PORT}`);
}
);
