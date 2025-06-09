"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateShippingCost = calculateShippingCost;
const client_1 = require("@prisma/client");
const distanceCalc_1 = require("../utils/distanceCalc");
const prisma = new client_1.PrismaClient();
async function calculateShippingCost(tenantId, userLatitude, userLongitude) {
    try {
        // Busca as informações do Tenant
        const tenantInfo = await prisma.tenantInfo.findUnique({
            where: { tenantId },
        });
        if (!tenantInfo) {
            return "Informações do Tenant não encontradas.";
        }
        console.log("Tenant Info:", tenantInfo);
        // Calcula a distância entre o Tenant e o cliente
        const distanceKm = (0, distanceCalc_1.calculateDistance)(tenantInfo.latitude, tenantInfo.longitude, userLatitude, userLongitude);
        console.log("Distância Calculada:", distanceKm);
        // Busca as zonas de entrega do Tenant e aplica o cálculo com base na distância
        const zones = await prisma.zone.findMany({
            where: { tenantId },
            orderBy: { maxDistanceKm: "asc" },
        });
        console.log("Zonas Encontradas:", zones);
        for (const zone of zones) {
            if (distanceKm <= zone.maxDistanceKm) {
                // Verifica se a distância está dentro da cobertura da taxa fixa
                if (distanceKm <= zone.fixedDistanceKm) {
                    return zone.fixedFee;
                }
                // Calcula a taxa fixa + taxa adicional por zona
                const extraDistance = distanceKm - zone.fixedDistanceKm;
                // Se a distância exceder a distância fixa, aplica a taxa adicional por zona inteira
                const additionalFee = extraDistance > 0 ? zone.additionalKmFee : 0;
                // A taxa total será a taxa fixa + a taxa adicional por zona
                const totalFee = zone.fixedFee + additionalFee;
                return totalFee;
            }
        }
        return "Etabelecimento não atende a sua região :(";
    }
    catch (error) {
        console.error("Erro ao calcular o frete:", error);
        throw error; // Rethrow para ser capturado no controller
    }
}
