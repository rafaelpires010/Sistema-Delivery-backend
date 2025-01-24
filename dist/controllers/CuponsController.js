"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCuponsByTenant = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Obter Cupons por Tenant
const getCuponsByTenant = async (req, res) => {
    try {
        const tenantSlug = req.params.tenantSlug;
        // Buscar o tenant pelo slug
        const tenant = await prisma.tenant.findUnique({
            where: { slug: tenantSlug },
            include: {
                cupons: true,
            },
        });
        if (tenant) {
            res.json(tenant.cupons);
        }
        else {
            res.status(404).send("Tenant não encontrado");
        }
    }
    catch (error) {
        console.error("Erro ao obter Cupons:", error);
        res.status(500).send("Erro ao obter Cupons");
    }
    finally {
        await prisma.$disconnect();
    }
};
exports.getCuponsByTenant = getCuponsByTenant;
