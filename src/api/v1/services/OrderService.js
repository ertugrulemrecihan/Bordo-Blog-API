const Order = require('../models/Order');
const BaseService = require('./BaseService');

class OrderService extends BaseService {
    constructor() {
        super(Order);
    }
}

module.exports = new OrderService();