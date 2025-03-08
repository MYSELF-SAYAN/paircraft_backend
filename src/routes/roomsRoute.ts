import { Router } from "express";
import { createRoom,getRooms,getRoom,joinRoomRequest,getCodeSnapshot,getRoomRequests,approveJoinRequest,rejectJoinRequest,promoteUser,removeUser,getRoomMembers,sendMessage,getMessage } from "../controllers/roomsController";
import { authenticateUser } from "../middleware/authMiddleware";
import { checkRoomRole } from "../middleware/checkRoomRole";
const router: Router = Router();
// 🌟 Room Management
router.post("/create", authenticateUser, createRoom);         // Create a new room
router.get("/", authenticateUser, getRooms);                 // Get all rooms the user is part of

router.post("/join/:roomId", authenticateUser, joinRoomRequest); // Request to join a room
// router.post("/leave/:roomId", authenticateUser, leaveRoom);  // Leave a room

// // 🔑 Join Requests Management (Admin only)
router.get("/:roomId/requests", authenticateUser,checkRoomRole(["OWNER"]), getRoomRequests);    // Get pending join requests for a room
router.post("/:roomId/requests/:requestId/approve", authenticateUser,checkRoomRole(["OWNER"]), approveJoinRequest); // Approve a join request
router.post("/:roomId/requests/:requestId/reject", authenticateUser,checkRoomRole(["OWNER"]), rejectJoinRequest);   // Reject a join request

// // 🧑‍💻 Room Role Management (Admin only)
router.post("/members/:memberId/promote", authenticateUser,checkRoomRole(["OWNER"]), promoteUser); // Promote a member to EDITOR or ADMIN
// router.post("/:roomId/members/:memberId/demote", authenticateUser, demoteUser);   // Demote a member to VIEWER
router.delete("/members/:memberId", authenticateUser,checkRoomRole(["OWNER"]), removeUser);        // Remove a member from the room

// // 👥 Room Members
router.get("/:roomId/members", authenticateUser,checkRoomRole(["OWNER","EDITOR","VIEWER"]), getRoomMembers); // Get all members of a room

// // 💬 Messaging
router.post("/:roomId/messages", authenticateUser,checkRoomRole(["OWNER","EDITOR","VIEWER"]), sendMessage);  // Send a message to a room
router.get("/:roomId/messages", authenticateUser,checkRoomRole(["OWNER","EDITOR","VIEWER"]), getMessage);   // Get all messages in a room

// // 🔄 Code Collaboration
// router.post("/:roomId/code", authenticateUser, updateCodeSnapshot); // Update code snapshot for a room
router.get("/:roomId/code", authenticateUser, getCodeSnapshot);     // Get the latest code snapshot for a room

router.get("/:roomId", authenticateUser, getRoom);           // Get a single room's details
export default router;