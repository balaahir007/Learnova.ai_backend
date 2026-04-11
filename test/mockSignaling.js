/**
 * Mock WebRTC signaling test (no DB required)
 * - Uses Socket.IO to simulate multiple clients
 * - Verifies join-meet-room, offer/answer/candidate relays, and multi-participant behavior
 *
 * How it works:
 * - Prefer MOCK_SIGNALING=true on backend to bypass auth/DB
 * - If not in mock mode, this test will auto-generate a valid JWT cookie using SECRET_KEY from .env
 * - This script connects 3 mock users (Alice, Bob, Charlie)
 * - They join the same meet room and exchange signaling messages
 * - Assertions verify that relays work correctly
 */

import { io } from 'socket.io-client';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:5000';
const MEET_ID = `mock-meet-${Date.now()}`;
const TEST_TIMEOUT_MS = 20000;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function withTimeout(promise, ms, label = 'operation') {
  let id;
  const timeout = new Promise((_, reject) => {
    id = setTimeout(() => reject(new Error(`[TIMEOUT] ${label} exceeded ${ms}ms`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(id));
}

class MockClient {
  constructor(username, userId) {
    this.username = username;
    this.userId = userId;
    this.socket = null;
    this.activeMeetId = null;

    // Observability
    this.participantsSeen = new Set();
    this.offersReceived = [];
    this.answersReceived = [];
    this.candidatesReceived = [];
  }

  async connect() {
    // Prepare a valid JWT cookie for non-mock mode
    const secret = process.env.SECRET_KEY || 'devsecret';
    let cookieHeader = undefined;
    try {
      const token = jwt.sign({ userId: this.userId }, secret, { expiresIn: '1h' });
      cookieHeader = `jwt=${token}`;
    } catch (e) {
      // If signing fails, proceed without cookie (should be OK in mock mode)
      cookieHeader = undefined;
    }

    console.log(`[${this.username}] attempting connect to ${SERVER_URL} with auth userId=${this.userId}`);
    this.socket = io(SERVER_URL, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      auth: {
        userId: this.userId,
        username: this.username,
        email: `${this.username.toLowerCase()}@example.com`,
      },
      extraHeaders: cookieHeader ? { Cookie: cookieHeader } : undefined,
      timeout: 10000,
    });

    // Extra logging for connection issues
    this.socket.on('connect_error', (err) => {
      console.error(`[${this.username}] connect_error event:`, err?.message || err);
    });
    this.socket.on('reconnect_attempt', (n) => {
      console.log(`[${this.username}] reconnect_attempt #${n}`);
    });

    // Connection event
    await withTimeout(
      new Promise((resolve, reject) => {
        this.socket.once('connect', () => {
          console.log(`[${this.username}] connected:`, this.socket.id);
          resolve();
        });
        this.socket.once('connect_error', (err) => {
          reject(new Error(`[${this.username}] connect_error: ${err.message}`));
        });
      }),
      12000,
      `${this.username} connect`
    );

    // Listener: existing participants notification upon join
    this.socket.on('participant-joined', (data) => {
      console.log(`[${this.username}] participant-joined received:`, data);
      if (data?.userId) {
        this.participantsSeen.add(Number(data.userId));
      }
    });

    // Listener: incoming offer - auto-answer
    this.socket.on('webrtc-offer', (data) => {
      console.log(`[${this.username}] webrtc-offer from ${data.fromUserId}`);
      this.offersReceived.push(data);

      // Auto-answer with mock SDP
      this.socket.emit('webrtc-answer', {
        toUserId: Number(data.fromUserId),
        fromUserId: this.userId, // server will overwrite, but kept here for clarity
        answer: { type: 'answer', sdp: `mock-answer-from-${this.username}` },
      });
    });

    // Listener: incoming answer
    this.socket.on('webrtc-answer', (data) => {
      console.log(`[${this.username}] webrtc-answer from ${data.fromUserId}`);
      this.answersReceived.push(data);
    });

    // Listener: incoming ICE candidate
    this.socket.on('webrtc-ice-candidate', (data) => {
      console.log(`[${this.username}] webrtc-ice-candidate from ${data.fromUserId}`);
      this.candidatesReceived.push(data);
    });

    // Listener: participant-left
    this.socket.on('participant-left', (data) => {
      console.log(`[${this.username}] participant-left:`, data);
      this.participantsSeen.delete(Number(data.userId));
    });

    this.socket.on('error', (err) => {
      console.error(`[${this.username}] socket error:`, err);
    });
  }

  async joinMeet(meetId) {
    this.activeMeetId = meetId;
    this.socket.emit('join-meet-room', { meetId });
    console.log(`[${this.username}] emitted join-meet-room: ${meetId}`);
    // small grace delay for server to register room membership
    await delay(200);
  }

  async leaveMeet() {
    if (this.activeMeetId) {
      this.socket.emit('leave-meet-room', { meetId: this.activeMeetId });
      console.log(`[${this.username}] emitted leave-meet-room: ${this.activeMeetId}`);
      this.activeMeetId = null;
      await delay(100);
    }
  }

  async disconnect() {
    await this.leaveMeet();
    if (this.socket?.connected) {
      this.socket.disconnect();
      await delay(100);
    }
    console.log(`[${this.username}] disconnected`);
  }

  sendOffer(toUserId, sdpTag = 'default') {
    this.socket.emit('webrtc-offer', {
      toUserId: Number(toUserId),
      fromUserId: this.userId, // server will overwrite
      offer: { type: 'offer', sdp: `mock-offer-${sdpTag}-from-${this.username}` },
    });
    console.log(
      `[${this.username}] sent webrtc-offer to ${toUserId} [${sdpTag}]`
    );
  }

  sendCandidate(toUserId, candidateTag = 'default') {
    this.socket.emit('webrtc-ice-candidate', {
      toUserId: Number(toUserId),
      fromUserId: this.userId, // server will overwrite
      candidate: { candidate: `candidate:${candidateTag}-from-${this.username}`, sdpMid: '0', sdpMLineIndex: 0 },
    });
    console.log(
      `[${this.username}] sent webrtc-ice-candidate to ${toUserId} [${candidateTag}]`
    );
  }

  waitForAnswerFrom(userId, timeoutMs = 5000) {
    return withTimeout(
      new Promise((resolve) => {
        const check = () => {
          const found = this.answersReceived.find(
            (a) => Number(a.fromUserId) === Number(userId)
          );
          if (found) {
            resolve(found);
          } else {
            setTimeout(check, 50);
          }
        };
        check();
      }),
      timeoutMs,
      `${this.username} waitForAnswerFrom ${userId}`
    );
  }

  waitForOfferFrom(userId, timeoutMs = 5000) {
    return withTimeout(
      new Promise((resolve) => {
        const check = () => {
          const found = this.offersReceived.find(
            (o) => Number(o.fromUserId) === Number(userId)
          );
          if (found) {
            resolve(found);
          } else {
            setTimeout(check, 50);
          }
        };
        check();
      }),
      timeoutMs,
      `${this.username} waitForOfferFrom ${userId}`
    );
  }

  waitForCandidateFrom(userId, timeoutMs = 5000) {
    return withTimeout(
      new Promise((resolve) => {
        const check = () => {
          const found = this.candidatesReceived.find(
            (c) => Number(c.fromUserId) === Number(userId)
          );
          if (found) {
            resolve(found);
          } else {
            setTimeout(check, 50);
          }
        };
        check();
      }),
      timeoutMs,
      `${this.username} waitForCandidateFrom ${userId}`
    );
  }
}

async function main() {
  console.log(`=== Mock Signaling Test Start @ ${SERVER_URL} ===`);
  console.log(`Meet ID: ${MEET_ID}`);

  const alice = new MockClient('Alice', 101);
  const bob = new MockClient('Bob', 102);
  const charlie = new MockClient('Charlie', 103);

  const abortTimer = setTimeout(() => {
    console.error('Global test timeout exceeded');
    process.exit(2);
  }, TEST_TIMEOUT_MS);

  try {
    // Connect all
    await alice.connect();
    await bob.connect();
    await charlie.connect();

    // Alice joins first
    await alice.joinMeet(MEET_ID);

    // Bob joins - should see Alice via participant-joined
    await bob.joinMeet(MEET_ID);

    await withTimeout(
      new Promise((resolve, reject) => {
        const check = () => {
          if (bob.participantsSeen.has(101)) resolve();
          else setTimeout(check, 50);
        };
        check();
      }),
      4000,
      'Bob sees Alice in participant-joined'
    );
    console.log('[ASSERT] Bob saw Alice as existing participant');

    // Bob sends offer to Alice - Alice should receive and auto-answer - Bob should then receive answer
    bob.sendOffer(101, 'B-to-A');
    await alice.waitForOfferFrom(102, 4000);
    console.log('[ASSERT] Alice received offer from Bob');

    await bob.waitForAnswerFrom(101, 4000);
    console.log('[ASSERT] Bob received answer from Alice');

    // ICE candidate relay B -> A
    bob.sendCandidate(101, 'candidate1');
    await alice.waitForCandidateFrom(102, 4000);
    console.log('[ASSERT] Alice received ICE candidate from Bob');

    // Charlie joins - should see both Alice and Bob
    await charlie.joinMeet(MEET_ID);

    await withTimeout(
      new Promise((resolve, reject) => {
        const check = () => {
          if (charlie.participantsSeen.has(101) && charlie.participantsSeen.has(102)) resolve();
          else setTimeout(check, 50);
        };
        check();
      }),
      5000,
      'Charlie sees Alice and Bob in participant-joined'
    );
    console.log('[ASSERT] Charlie saw both Alice and Bob as existing participants');

    // Charlie sends offers to both Alice and Bob - both should auto-answer
    charlie.sendOffer(101, 'C-to-A');
    charlie.sendOffer(102, 'C-to-B');

    await alice.waitForOfferFrom(103, 5000);
    await bob.waitForOfferFrom(103, 5000);
    console.log('[ASSERT] Alice and Bob received offers from Charlie');

    // Charlie must receive answers from both
    await charlie.waitForAnswerFrom(101, 5000);
    await charlie.waitForAnswerFrom(102, 5000);
    console.log('[ASSERT] Charlie received answers from both Alice and Bob');

    console.log('=== ALL TESTS PASSED ✅ ===');
    clearTimeout(abortTimer);
    process.exit(0);
  } catch (err) {
    console.error('TEST FAILED ❌', err);
    clearTimeout(abortTimer);
    process.exit(1);
  } finally {
    // best-effort cleanup
    await Promise.allSettled([alice.disconnect(), bob.disconnect(), charlie.disconnect()]);
  }
}

main().catch((e) => {
  console.error('Fatal error in test runner:', e);
  process.exit(1);
});