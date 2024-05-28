import express from "express";
import { login, loginWithWallet, register } from "../controllers/auth.js";

const router = express.Router();

router.post("/login", login);
router.post("/wallet-login", loginWithWallet);

export default router;
