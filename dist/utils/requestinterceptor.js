"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestinterceptor = void 0;
const requestinterceptor = (req, res, next) => {
    console.log(`=> ${res.statusCode} ${req.method} ${req.originalUrl} ${JSON.stringify(req.body)}`);
    next();
};
exports.requestinterceptor = requestinterceptor;
