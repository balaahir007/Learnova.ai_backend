// Backend Socket Handler (server.js)
import { Server } from "socket.io";
import http from "http";
import chatController from "./controllers/chatController.js";
import jwt from "jsonwebtoken";
import { AppError } from "./utils/AppError.js";
import User from "./models/userSchema.js";
import cookie from "cookie";
import meetServices from "./service/meet/meetServices.js";

let io = null;

// In-memory per-space participant socket mapping for WebRTC signaling
// Structure: participantsBySpace => Map<spaceId, Map<userId, socketId>>
const participantsBySpace = new Map();

/**
 * Ensure a space participant map exists and return it
 * @param {string} spaceId
 * @returns {Map<string,string>} userId -> socketId map
 */
function getOrCreateSpaceMap(spaceId) {
  if (!participantsBySpace.has(spaceId)) {
    participantsBySpace.set(spaceId, new Map());
  }
  return participantsBySpace.get(spaceId);
}

/**
 * Remove a user from a space participant map
 * @param {string} spaceId
 * @param {string|number} userId
 */
function removeFromSpaceMap(spaceId, userId) {
  const room = participantsBySpace.get(spaceId);
  if (!room) return;
  room.delete(String(userId));
  if (room.size === 0) {
    participantsBySpace.delete(spaceId);
  }
}

const meetEndTimers = new Map();

/**
 * @param {string} spaceId
 * @param {string} meetId
 * @returns {number}
 */
function getMeetPresenceCount(spaceId, meetId) {
  const roomMap = participantsBySpace.get(spaceId);
  if (!roomMap) return 0;
  let count = 0;
  for (const [, sid] of roomMap.entries()) {
    const s = io.sockets.sockets.get(sid);
    if (s?.activeMeetId === meetId) count++;
  }
  return count;
}

/**
 * Schedule auto end of a meet if currently no participants remain.
 * A grace period prevents accidental ends due to brief disconnects/refreshes.
 * @param {string} spaceId
 * @param {string} meetId
 * @param {number} endByUserId - userId to attribute the end action to
 */
function scheduleMeetEndIfEmpty(spaceId, meetId, endByUserId) {
  try {
    if (!spaceId || !meetId) return;
    const present = getMeetPresenceCount(spaceId, meetId);
    if (present > 0) return;
    if (meetEndTimers.has(meetId)) return;

    const GRACE_MS = Number(process.env.MEET_GRACE_MS || 60000); // default 60s
    const timer = setTimeout(async () => {
      try {
        const stillEmpty = getMeetPresenceCount(spaceId, meetId) === 0;
        if (stillEmpty) {
          // Persist end in DB if service supports it, then notify space
          try {
            await meetServices.endMeet({ meetId, userId: endByUserId });
          } catch (e) {
            console.error(
              "❌ Auto endMeet failed (continuing to notify):",
              e?.message || e
            );
          }
          io.to(`space-${spaceId}`).emit("meet-ended", meetId);
          console.log(
            `🔚 Auto-ended meet ${meetId} after grace period (${GRACE_MS}ms)`
          );
        } else {
          console.log(
            `⏳ Auto-end canceled for ${meetId}; participants rejoined`
          );
        }
      } catch (e) {
        console.error("❌ Auto-end timer error:", e);
      } finally {
        meetEndTimers.delete(meetId);
      }
    }, GRACE_MS);

    meetEndTimers.set(meetId, timer);
  } catch (err) {
    console.error("❌ scheduleMeetEndIfEmpty error:", err);
  }
}

/** Cancel pending auto end for a meet (called on join) */
function cancelMeetEndTimer(meetId) {
  const t = meetEndTimers.get(meetId);
  if (t) {
    try {
      clearTimeout(t);
    } catch {}
    meetEndTimers.delete(meetId);
  }
}

export function initSocket(app) {
  const server = http.createServer(app);

  const IS_MOCK = process.env.MOCK_SIGNALING === "true";
  // Use 'true' so Engine.IO reflects the request Origin header when provided (more permissive for Node tests)
  const allowedOrigin = IS_MOCK
    ? true
    : [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://morrowgen.onrender.com",
      ];
  io = new Server(server, {
    cors: {
      origin: [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://morrowgen.onrender.com",
      ],
      credentials: true,
    },
    allowRequest: (req, callback) => {
      const origin = req.headers.origin;
      const allowed = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://morrowgen.onrender.com",
      ];

      if (!origin || allowed.includes(origin)) {
        return callback(null, true);
      }

      console.log("❌ BLOCKED ORIGIN:", origin);
      return callback("Origin not allowed", false);
    },
  });

  // IS_MOCK defined above for server + CORS config
  // Extra visibility into handshake and transport negotiation during tests
  io.engine.on("initial_headers", (headers, req) => {
    try {
      console.log(
        "🔐 Engine.IO initial_headers origin=%s ua=%s",
        req?.headers?.origin,
        req?.headers?.["user-agent"]
      );
    } catch {}
  });
  io.engine.on("connection_error", (err) => {
    try {
      console.error("❌ Engine.IO connection_error:", err?.code, err?.message);
    } catch {}
  });
  io.use((socket, next) => {
    console.log("🔑 Auth middleware invoked");

    const auth = socket.handshake.auth || {};
    console.log("Socket auth data:", auth);

    if (!auth.userId) {
      console.log("⚠ No userId provided. Treating as guest.");
      socket.userId = "guest-" + socket.id;
      socket.username = "Guest";
      socket.email = null;

      socket.user = {
        id: socket.userId,
        username: socket.username,
        email: socket.email,
      };

      return next();
    }

    socket.userId = auth.userId;
    socket.username = auth.username || "Unknown";
    socket.email = auth.email || null;

    socket.user = {
      id: socket.userId,
      username: socket.username,
      email: socket.email,
    };

    console.log(`✅ Authenticated user: ${socket.userId} (${socket.username})`);
    next();
  });

  io.on("connection", (socket) => {
    console.log("Client connected with auth:", socket.handshake.auth);
    console.log(`🔗 User ${socket?.user?.username} connected`);

    socket.on("connect", () => console.log("✅ Connected:", socket.id));
    socket.on("connect_error", (err) =>
      console.error("❌ connect_error:", err)
    );
    socket.on("reconnect_attempt", (attempt) =>
      console.log("🔄 Reconnect attempt:", attempt)
    );

    socket.on("join-space", (spaceId) => {
      try {
        if (!spaceId || typeof spaceId !== "string") {
          socket.emit("error", { message: "Invalid space ID" });
          return;
        }

        // Join the space room
        socket.join(`space-${spaceId}`);

        // Store spaceId in socket for later use
        socket.currentSpaceId = spaceId;

        // Acknowledge to the joining user (used by clients to wait until space join completes)
        socket.emit("joined-space", { spaceId });

        console.log(`👥 User ${socket.user?.username} joined space-${spaceId}`);

        socket.to(`space-${spaceId}`).emit("user-joined", {
          username: socket.user?.username,
          userId: socket.userId,
        });
      } catch (error) {
        console.error("❌ Error joining space:", error);
        socket.emit("error", { message: "Failed to join space" });
      }
    });

    socket.on("leave-space", (spaceId) => {
      try {
        if (!spaceId || typeof spaceId !== "string") {
          socket.emit("error", { message: "Invalid space ID" });
          return;
        }

        socket.leave(`space-${spaceId}`);
        socket.currentSpaceId = null;

        socket.to(`space-${spaceId}`).emit("user-left", {
          username: socket.user?.username,
          userId: socket.userId,
        });
      } catch (error) {
        console.error("❌ Error leaving space:", error);
        socket.emit("error", { message: "Failed to leave space" });
      }
    });

    // Chat handlers
    socket.on("fetchall-chat-msg", async (spaceId) => {
      try {
        if (!spaceId || typeof spaceId !== "string") {
          socket.emit("error", { message: "Invalid space ID provided" });
          return;
        }
        await chatController.fetchAllMsg(spaceId, socket);
      } catch (error) {
        console.error("❌ Error fetching chat messages:", error);
        socket.emit("error", { message: "Failed to fetch messages" });
      }
    });

    socket.on("send-chat-msg", async (data) => {
      try {
        const { message, spaceId } = data;
        if (!message?.trim() || !spaceId) {
          socket.emit("error", { message: "Invalid message or space ID" });
          return;
        }
        if (typeof spaceId !== "string") {
          socket.emit("error", { message: "Invalid space ID format" });
          return;
        }
        await chatController.handleMessage(data, socket);
      } catch (error) {
        console.error("❌ Error handling message:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    socket.on("typing", ({ spaceId }) => {
      if (!spaceId) return;
      io.to(`space-${spaceId}`).emit("user-typing", {
        userInfo: {
          username: socket.user?.username,
          profilePicture: socket.user?.profilePicture,
          email: socket.user?.email,
        },
        userId: socket.user?.id,
      });
    });

    socket.on("stop-typing", ({ spaceId }) => {
      if (!spaceId) return;
      io.to(`space-${spaceId}`).emit("user-stop-typing", {
        username: socket.user?.username,
        userId: socket.user?.id,
      });
    });

    // ===== MEET HANDLERS =====

    // Create Meet Handler
    socket.on("meet-create", async ({ spaceId, name }) => {
      try {
        const username = socket.user?.username;
        const userId = socket.userId;

        console.log(`🎥 Creating meet for space-${spaceId} by ${username}`);

        const newMeet = await meetServices.createMeet({
          spaceId,
          userId,
          username,
          name,
        });

        // ✅ Confirm back to creator
        socket.emit("meet-created", newMeet);

        // ✅ Notify others in the space
        socket.to(`space-${spaceId}`).emit("new-meet", newMeet);

        console.log(`✅ Meet created successfully: ${newMeet.meetId}`);
      } catch (error) {
        console.error("❌ Meet creation failed:", error.message);
        socket.emit("meet-error", { message: error.message });
      }
    });

    // Join Meet Handler
    socket.on("meet-join", async ({ meetId }) => {
      try {
        const userId = socket.userId;
        const username = socket.user?.username;
        const spaceId = socket.currentSpaceId;

        if (!spaceId) {
          throw new Error("User not in any space");
        }

        console.log(
          `👋 User ${username} joining meet ${meetId} in space-${spaceId}`
        );

        const participantData = await meetServices.meetJoined({
          meetId,
          userId,
          username,
        });

        // ✅ Notify ALL (including the one who joined)
        io.to(`space-${spaceId}`).emit("meet-joined", participantData);
      } catch (error) {
        console.error("❌ Meet join failed:", error.message);
        socket.emit("join-error", error.message);
      }
    });

    // Leave Meet Handler
    socket.on("meet-left", async ({ meetId }) => {
      try {
        const userId = socket.userId;
        const spaceId = socket.currentSpaceId; // Get from stored value

        if (!spaceId) {
          throw new Error("User not in any space");
        }

        console.log(`👋 User leaving meet ${meetId} in space-${spaceId}`);

        const removedUserData = await meetServices.meetLeft({
          meetId,
          userId,
        });

        // Notify all users in the space about user leaving
        socket.to(`space-${spaceId}`).emit("meet-left", removedUserData);

        console.log(`✅ User left meet ${meetId}`);
      } catch (error) {
        console.error("❌ Meet leave failed:", error.message);
        socket.emit("meet-error", { message: error.message });
      }
    });

    // Meet End Handler (optional)
    socket.on("meet-ended", async ({ meetId }) => {
      try {
        const spaceId = socket.currentSpaceId;

        if (!spaceId) {
          throw new Error("User not in any space");
        }

        // End the meet (implement this in your meetServices)
        await meetServices.endMeet({ meetId, userId: socket.userId });

        // Notify all users in the space that meet has ended
        io.to(`space-${spaceId}`).emit("meet-ended", meetId);

        console.log(`🔚 Meet ${meetId} ended`);
      } catch (error) {
        console.error("❌ Meet end failed:", error.message);
        socket.emit("meet-error", { message: error.message });
      }
    });

    // ===== WebRTC signaling for multi-participant (space-scoped) =====
    socket.on(
      "join-meet-room",
      ({ meetId, spaceId: payloadSpaceId /*, userId (ignored)*/ }) => {
        try {
          if (!meetId || typeof meetId !== "string") {
            socket.emit("meet-error", { message: "Invalid meet ID" });
            return;
          }

          // Allow optional spaceId in payload to avoid race with join-space, otherwise use socket.currentSpaceId
          let spaceId = payloadSpaceId || socket.currentSpaceId;
          if (!spaceId) {
            socket.emit("meet-error", { message: "User not in any space" });
            return;
          }

          // If payload specified a spaceId and socket is not yet in that room, join it to avoid race with join-space
          if (payloadSpaceId && !socket.rooms.has(`space-${payloadSpaceId}`)) {
            socket.join(`space-${payloadSpaceId}`);
            socket.currentSpaceId = payloadSpaceId;
            // Acknowledge space join for clients potentially awaiting this
            socket.emit("joined-space", { spaceId: payloadSpaceId });
          }

          // Track active meet on socket
          socket.activeMeetId = meetId;

          // Track mapping userId -> socketId within the space for targeted signaling
          const roomMap = getOrCreateSpaceMap(spaceId);
          roomMap.set(String(socket.userId), socket.id);

          // Inform the joining user about currently present participants in the SAME meet
          // Use a distinct event so only the joining user initiates calls -> avoids double-call collisions
          for (const [uid, sid] of roomMap.entries()) {
            if (uid === String(socket.userId)) continue;
            const otherSocket = io.sockets.sockets.get(sid);
            if (otherSocket?.activeMeetId === meetId) {
              socket.emit("participant-present", {
                userId: Number(uid),
                meetId,
              });
            }
          }

          // Broadcast to everyone in the space; clients will filter by meetId
          io.to(`space-${spaceId}`).emit("participant-joined", {
            userId: socket.userId,
            meetId,
          });

          // Cancel any pending auto-end timer because a participant joined
          cancelMeetEndTimer(meetId);

          console.log(
            `🎥 User ${socket.user?.username} joined meet ${meetId} in space-${spaceId}`
          );
        } catch (err) {
          console.error("❌ Error joining meet (space-scoped):", err);
          socket.emit("meet-error", { message: "Failed to join meet" });
        }
      }
    );

    socket.on("leave-meet-room", ({ meetId }) => {
      try {
        const effectiveMeetId = meetId || socket.activeMeetId;
        const spaceId = socket.currentSpaceId;
        if (!effectiveMeetId || !spaceId) return;

        removeFromSpaceMap(spaceId, socket.userId);

        // Notify others in the space; clients will filter by meetId
        io.to(`space-${spaceId}`).emit("participant-left", {
          userId: socket.userId,
          meetId: effectiveMeetId,
        });

        // If this was the last participant, schedule auto end with grace period
        scheduleMeetEndIfEmpty(spaceId, effectiveMeetId, socket.userId);

        socket.activeMeetId = null;
        console.log(
          `👋 User ${socket.user?.username} left meet ${effectiveMeetId} in space-${spaceId}`
        );
      } catch (err) {
        console.error("❌ Error leaving meet (space-scoped):", err);
      }
    });

    // Relay WebRTC signaling messages within a meet
    socket.on("webrtc-offer", ({ toUserId, fromUserId, offer }) => {
      try {
        const meetId = socket.activeMeetId;
        const spaceId = socket.currentSpaceId;
        if (!meetId || !spaceId) return;

        const roomMap = participantsBySpace.get(spaceId);
        if (!roomMap) return;

        const targetSocketId = roomMap.get(String(toUserId));
        if (!targetSocketId) return;

        io.to(targetSocketId).emit("webrtc-offer", {
          fromUserId: socket.userId, // trust server-side identity
          offer,
        });
      } catch (err) {
        console.error("❌ Error relaying offer:", err);
      }
    });

    socket.on("webrtc-answer", ({ toUserId, fromUserId, answer }) => {
      try {
        const meetId = socket.activeMeetId;
        const spaceId = socket.currentSpaceId;
        if (!meetId || !spaceId) return;

        const roomMap = participantsBySpace.get(spaceId);
        if (!roomMap) return;

        const targetSocketId = roomMap.get(String(toUserId));
        if (!targetSocketId) return;

        io.to(targetSocketId).emit("webrtc-answer", {
          fromUserId: socket.userId,
          answer,
        });
      } catch (err) {
        console.error("❌ Error relaying answer:", err);
      }
    });

    socket.on("webrtc-ice-candidate", ({ toUserId, fromUserId, candidate }) => {
      try {
        const meetId = socket.activeMeetId;
        const spaceId = socket.currentSpaceId;
        if (!meetId || !spaceId) return;

        const roomMap = participantsBySpace.get(spaceId);
        if (!roomMap) return;

        const targetSocketId = roomMap.get(String(toUserId));
        if (!targetSocketId) return;

        io.to(targetSocketId).emit("webrtc-ice-candidate", {
          fromUserId: socket.userId,
          candidate,
        });
      } catch (err) {
        console.error("❌ Error relaying ICE candidate:", err);
      }
    });

    // Broadcast participant media state (audio/video enabled) to others in the space (clients filter by meetId)
    socket.on("webrtc-media-state", ({ audioEnabled, videoEnabled }) => {
      try {
        const meetId = socket.activeMeetId;
        const spaceId = socket.currentSpaceId;
        if (!meetId || !spaceId) return;

        console.log("📡 Broadcasting media state:", {
          userId: socket.userId,
          meetId,
          audioEnabled,
          videoEnabled,
        });

        io.to(`space-${spaceId}`).emit("webrtc-media-state", {
          userId: socket.userId,
          meetId,
          audioEnabled:
            typeof audioEnabled === "boolean" ? audioEnabled : undefined,
          videoEnabled:
            typeof videoEnabled === "boolean" ? videoEnabled : undefined,
        });
      } catch (err) {
        console.error("❌ Error broadcasting media state:", err);
      }
    });

    // Broadcast screen share state to others in the space (clients filter by meetId)
    socket.on("webrtc-screen-share", ({ isSharing }) => {
      try {
        const meetId = socket.activeMeetId;
        const spaceId = socket.currentSpaceId;
        if (!meetId || !spaceId) return;

        console.log("🖥️ Broadcasting screen share state:", {
          userId: socket.userId,
          meetId,
          isSharing: !!isSharing,
        });

        io.to(`space-${spaceId}`).emit("webrtc-screen-share", {
          userId: socket.userId,
          meetId,
          isSharing: !!isSharing,
        });
      } catch (err) {
        console.error("❌ Error broadcasting screen share state:", err);
      }
    });

    // Disconnect Handler
    socket.on("disconnect", (reason) => {
      try {
        console.log(`🔌 User ${socket.user?.username} disconnected: ${reason}`);

        // Notify space rooms that user left
        const rooms = Array.from(socket.rooms);
        rooms.forEach((room) => {
          if (room.startsWith("space-")) {
            socket.to(room).emit("user-left", {
              username: socket.user?.username,
              userId: socket.userId,
            });
          }
        });

        // Cleanup meet presence and notify participants (space-scoped)
        if (socket.activeMeetId && socket.currentSpaceId) {
          const meetId = socket.activeMeetId;
          const spaceId = socket.currentSpaceId;
          removeFromSpaceMap(spaceId, socket.userId);
          io.to(`space-${spaceId}`).emit("participant-left", {
            userId: socket.userId,
            meetId,
          });

          // If this was the last participant, schedule auto end with grace period
          scheduleMeetEndIfEmpty(spaceId, meetId, socket.userId);

          socket.activeMeetId = null;
        }
      } catch (error) {
        console.error("❌ Error handling disconnect cleanup:", error);
      }
    });

    socket.on("error", (error) => {
      console.error("❌ Socket error:", error);
    });
  });

  return server;
}

export { io };
