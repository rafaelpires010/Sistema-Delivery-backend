"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateDistance = calculateDistance;
const geolib_1 = require("geolib");
function calculateDistance(latitude1, longitude1, latitude2, longitude2) {
    // Calcula a distância em metros
    const distanceInMeters = (0, geolib_1.getDistance)({ latitude: latitude1, longitude: longitude1 }, { latitude: latitude2, longitude: longitude2 });
    // Converte a distância para quilômetros
    const distanceInKilometers = distanceInMeters / 1000;
    return distanceInKilometers;
}
