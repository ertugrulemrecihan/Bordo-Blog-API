const express = require('express');
require('express-async-errors');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const path = require('path');
const fileUploader = require('express-fileupload');
const configs = require('./configs');
const loaders = require('./loaders');
const events = require('./api/v1/scripts/events');
const errorHandler = require('./api/v1/middlewares/error-handler.middleware');
const routes = require('./api/v1/routes');
const swaggerOptions = require('./configs/swagger.config');

const swaggerDocument = require('../docs/static/openapi.json');

configs();
loaders();
events();

const app = express();
app.use(express.json());

app.use(
    cors({
        origin: '*',
    })
);

app.use(fileUploader());
app.use('/public', express.static(path.join(__dirname, '..', 'public')));
app.use(
    '/api/v1/docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, swaggerOptions)
);

app.use('/api/v1/users', routes.user);
app.use('/api/v1/posts', routes.post);
app.use('/api/v1/addresses', routes.address);
app.use('/api/v1/tags', routes.tag);
app.use('/api/v1/plans', routes.plan);

// Admin Routes
app.use('/api/v1/tags/admin', routes.adminTag);
app.use('/api/v1/posts/admin', routes.adminPost);
app.use('/api/v1/users/admin', routes.adminUser);
app.use('/api/v1/plans/admin', routes.adminPlan);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    console.log(`Listening Port On ${process.env.API_URL}:${PORT}`);
});
