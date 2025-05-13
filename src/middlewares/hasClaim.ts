import { PrismaClient } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export const authorizeClaim = (requiredClaim: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      const { tenantSlug } = req.params;

      if (!token) {
        return res.status(401).json({ message: "Token não fornecido" });
      }

      const decoded = jwt.verify(
        token,
        process.env.DEFAULT_TOKEN as string
      ) as {
        id: number;
      };

      // Primeiro encontra o userTenant
      const userTenant = await prisma.userTenant.findFirst({
        where: {
          userId: decoded.id,
          tenant: {
            slug: tenantSlug,
          },
        },
      });

      if (!userTenant) {
        return res
          .status(403)
          .json({ message: "Usuário não pertence ao tenant" });
      }

      // Verifica se o userTenant tem a claim necessária
      const hasClaim = await prisma.tenantUserClaims.findFirst({
        where: {
          userTenantId: userTenant.id,
          codigo: requiredClaim,
        },
      });

      if (!hasClaim) {
        return res.status(403).json({ message: "Permissão insuficiente" });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro ao verificar permissões" });
    }
  };
};
