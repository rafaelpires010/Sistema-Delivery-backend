import { Router } from "express";
import {
  createAddress,
  deleteAddress,
  editAddress,
  getAddressById,
  getAddressByUser,
} from "../controllers/addressController";
import { verifyJWT } from "../middlewares/jwt";

const router = Router();

router.get("/:tenantSlug/addresses", verifyJWT, getAddressByUser);

router.get("/:tenantSlug/address/:id", verifyJWT, getAddressById);

router.post("/:tenantSlug/newaddress", verifyJWT, createAddress);

router.put("/:tenantSlug/address/:id", verifyJWT, editAddress);

router.delete("/:tenantSlug/address/:id", verifyJWT, deleteAddress);

export default router;
