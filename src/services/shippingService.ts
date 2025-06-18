import { PrismaClient } from "@prisma/client";
import { calculateDistance } from "../utils/distanceCalc";

const prisma = new PrismaClient();

export async function calculateShippingCost(
  tenantId: number,
  userLatitude: number,
  userLongitude: number
) {
  try {
    // Busca as informações do Tenant
    const tenantInfo = await prisma.tenantInfo.findUnique({
      where: { tenantId },
    });

    if (!tenantInfo) {
      return { error: "Informações do Tenant não encontradas." };
    }

    console.log("Tenant Info:", tenantInfo);

    // Calcula a distância entre o Tenant e o cliente
    const distanceKm = calculateDistance(
      tenantInfo.latitude,
      tenantInfo.longitude,
      userLatitude,
      userLongitude
    );

    console.log("Distância Calculada:", distanceKm);

    // Busca as zonas de entrega do Tenant e aplica o cálculo com base na distância
    const zones = await prisma.zone.findMany({
      where: { tenantId },
      orderBy: { maxDistanceKm: "asc" },
    });

    console.log("Zonas Encontradas:", zones);

    for (const zone of zones) {
      if (distanceKm <= zone.maxDistanceKm) {
        let totalFee = zone.fixedFee;
        // Verifica se a distância está dentro da cobertura da taxa fixa
        if (distanceKm > zone.fixedDistanceKm) {
          // Calcula a taxa fixa + taxa adicional por zona
          const extraDistance = distanceKm - zone.fixedDistanceKm;
          const additionalFee = Math.ceil(extraDistance) * zone.additionalKmFee;
          totalFee += additionalFee;
        }
        return {
          cost: totalFee,
          deliveryTime: zone.tempoMaxEntre,
        };
      }
    }

    return { error: "Etabelecimento não atende a sua região :(" };
  } catch (error) {
    console.error("Erro ao calcular o frete:", error);
    throw error; // Rethrow para ser capturado no controller
  }
}
