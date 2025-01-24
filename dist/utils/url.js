"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getImageUrl = void 0;
const getImageUrl = (url) => {
    return `${process.env.BASE_URL}/${url}`;
};
exports.getImageUrl = getImageUrl;
