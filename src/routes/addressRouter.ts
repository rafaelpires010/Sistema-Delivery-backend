import { Router } from "express";
import {
  createAddress,
  deleteAddress,
  editAddress,
  getAddressById,
  getAddressByUser,
} from "../controllers/addressController";

const router = Router();

router.get("/:tenantSlug/addresses", getAddressByUser);

router.get("/:tenantSlug/address/:id", getAddressById);

router.post("/:tenantSlug/newaddress", createAddress);

router.put("/:tenantSlug/address/:id", editAddress);

router.delete("/:tenantSlug/address/:id", deleteAddress);

export default router;
