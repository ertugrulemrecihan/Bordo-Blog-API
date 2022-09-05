const Payment = require('../models/payment.model');
const BaseService = require('./base.service');
const Iyzipay = require('iyzipay');

const iyzipay = new Iyzipay({
    apiKey: process.env.IYZIPAY_API_KEY,
    secretKey: process.env.IYZIPAY_SECRET_KEY,
    uri: process.env.IYZIPAY_URI,
});

class PaymentService extends BaseService {
    constructor() {
        super(Payment, [
            {
                path: 'user_id',
                select: 'first_name last_name email',
            },
        ]);
    }

    async threedsInitialize(data) {
        // eslint-disable-next-line no-undef
        return new Promise(function (resolve, reject) {
            iyzipay.threedsInitialize.create(data, function (err, result) {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    }

    async threedsComplete(data) {
        // eslint-disable-next-line no-undef
        return new Promise(function (resolve, reject) {
            iyzipay.threedsPayment.create(data, function (err, result) {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    }

    async payWithoutThreeds(data) {
        // eslint-disable-next-line no-undef
        return new Promise(function (resolve, reject) {
            iyzipay.payment.create(data, function (err, result) {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    }
}

module.exports = new PaymentService();
