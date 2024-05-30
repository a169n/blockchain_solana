import express from "express";
import {
  getUser,
  getUserFriends,
  addRemoveFriend,
  getAllUsers,
  getSuggestedUsers,
  getUserFriendsCount,
} from "../controllers/users.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

/* READ */
router.get("/all", getAllUsers);
router.get("/:id", getUser);
router.get("/:id/friends", verifyToken, getUserFriends);
router.get("/:id/friends/count", verifyToken, getUserFriendsCount);
router.get("/:id/suggested", verifyToken, getSuggestedUsers);

/* UPDATE */
router.patch("/:id/:friendId", verifyToken, addRemoveFriend);

export default router;
