import { Request } from "express";
import { User } from "./User";

export type ExtendedRequest = Request & {
  user?: User;
  tenantId?: number;
};
