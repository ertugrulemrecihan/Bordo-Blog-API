const express = require('express');
const cors = require('cors');
const config = require('./config');
const loaders = require('./loaders');
const events = require('./api/v1/scripts/events');
const successHandler = require('./api/v1/middlewares/successHandler');
const errorHandler = require('./api/v1/middlewares/errorHandler');
const routes = require('./api/v1/routes');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../docs/static/openapi.json');
const path = require('path');
const fileUploader = require('express-fileupload');

config();
loaders();
events();

const app = express();
app.use(express.json());

app.use(
    cors({
        origin: '*',
    })
);

app.use('/public', express.static(path.join(__dirname, '../public')));
app.use(fileUploader());
app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/api/v1/users', routes.user);
app.use('/api/v1/posts', routes.post);
app.use('/api/v1/addresses', routes.address);
app.use('/api/v1/tags', routes.tag);
app.use('/api/v1/plans', routes.plan);

// Admin Routes
app.use('/api/v1/admin/roles', routes.adminRole);
app.use('/api/v1/admin/tags', routes.adminTag);
app.use('/api/v1/admin/posts', routes.adminPost);
app.use('/api/v1/admin/users', routes.adminUser);
app.use('/api/v1/admin/addresses', routes.adminAddress);
app.use('/api/v1/admin/plans', routes.adminPlan);

app.use(successHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    console.log(`Listening Port On ${process.env.API_URL}:${PORT}`);
});
