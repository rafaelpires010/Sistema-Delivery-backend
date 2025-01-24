"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateShippingHandler = calculateShippingHandler;
const shippingService_1 = require("../services/shippingService");
async function calculateShippingHandler(req, res) {
    try {
        const { tenantId, userLatitude, userLongitude } = req.body;
        if (!tenantId || !userLatitude || !userLongitude) {
            return res.status(400).json({ error: "Parâmetros incompletos." });
        }
        const shippingCost = await (0, shippingService_1.calculateShippingCost)(tenantId, userLatitude, userLongitude);
        return res.status(200).json({ shippingCost });
    }
    catch (error) {
        // Verifica se o erro é uma instância de Error
        if (error instanceof Error) {
            console.error("Erro ao calcular o frete:", error.message); // Agora podemos acessar .message
            return res.status(500).json({ error: error.message });
        }
        else {
            // Se não for uma instância de Error, retornamos um erro genérico
            console.error("Erro desconhecido", error);
            return res.status(500).json({ error: "Erro interno do servidor" });
        }
    }
}
