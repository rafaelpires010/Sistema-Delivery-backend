import { PrismaClient } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

// Middleware de autorização para verificar o papel do usuário no tenant
export const authorizeRole = (requiredRole: string) => {
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

      // Verifica se o userTenant tem a role necessária
      const hasRole = await prisma.tenantUserRoles.findFirst({
        where: {
          userTenantId: userTenant.id,
          codigo: requiredRole,
        },
      });

      if (!hasRole) {
        return res.status(403).json({ message: "Permissão insuficiente" });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro ao verificar permissões" });
    }
  };
};

export const authorizeUserRole = (requiredRole: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];

      if (!token) {
        return res.status(401).json({ message: "Token não fornecido" });
      }

      const decoded = jwt.verify(
        token,
        process.env.DEFAULT_TOKEN as string
      ) as {
        id: number;
      };

      const hasRole = await prisma.userRole.findFirst({
        where: {
          userId: decoded.id,
          role: {
            codigo: requiredRole,
          },
        },
      });

      if (!hasRole) {
        return res.status(403).json({ message: "Permissão insuficiente" });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro ao verificar permissões" });
    }
  };
};
