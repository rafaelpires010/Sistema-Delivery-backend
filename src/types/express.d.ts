import { UserTenant } from "@prisma/client";

declare module "express-serve-static-core" {
  interface Request {
    operador?: UserTenant;
  }
}

export {};
