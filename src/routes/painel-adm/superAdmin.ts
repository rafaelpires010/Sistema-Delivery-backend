import { Router } from "express";
import {
  createTenantLayout,
  getTenantById,
  getAllTenantByUser,
  createTenantFunc,
  createTenantInfoEnder,
  toggleTenantStatus,
} from "../../controllers/tenantController";
import upload from "../../middlewares/upload";
import {
  createUser,
  getUsersByTenantId,
  toggleUserStatus,
} from "../../controllers/userController";
import { verifyJWT } from "../../middlewares/jwt";
import * as authTenant from "../../controllers/authTenant";
import {
  editValorFaturamento,
  getValorFaturamento,
  getFautramentoTotal,
  getMonthlyGrowth,
} from "../../controllers/faturamentoController";

const router = Router();

router.post(
  "/create-tenant",
  upload.single("img"),
  verifyJWT,
  createTenantLayout
);
router.get("/tenants", verifyJWT, getAllTenantByUser);
router.get("/tenant/:tenantId", verifyJWT, getTenantById);
router.get("/users/:tenantId", verifyJWT, getUsersByTenantId);
router.post(
  "/create-tenant-infoEnder/:tenantId",
  verifyJWT,
  createTenantInfoEnder
);
router.post("/create-tenant-func/:tenantId", verifyJWT, createTenantFunc);
router.post("/create-user", verifyJWT, createUser);
router.put("/toggle-user-status/:userId", verifyJWT, toggleUserStatus);
router.put("/toggle-tenant-status/:tenantId", verifyJWT, toggleTenantStatus);
router.post("/signin", authTenant.signinSuperAdmin);
router.get("/faturamento/:userId", getValorFaturamento);
router.put("/faturamento/:userId", editValorFaturamento);
router.get("/faturamento-total/:userId", getFautramentoTotal);
router.get("/faturamento-growth/:userId", getMonthlyGrowth);

export default router;
