const Order = require('../models/order.model');
const BaseService = require('./base.service');

class OrderService extends BaseService {
    constructor() {
        super(Order);
    }
}

module.exports = new OrderService();
