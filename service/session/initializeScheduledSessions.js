import schedule from "node-schedule";
import sendMultiplePosters from "./sendMultiplePoster.js";
import { waitForClientReady } from "../../config/whatsappClientConfig.js";

export async function scheduleSingleSession(session) {
  await waitForClientReady(); 
  const dateTimeString = `${session.date}T${session.time}`;
  const scheduleTime = new Date(dateTimeString);
  const jobKey = `session-${session.id}`;

  if (isNaN(scheduleTime.getTime())) {
    console.warn(`❌ Invalid date/time for session #${session.id}: ${dateTimeString}`);
    return;
  }

  const now = new Date();
  const twoMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000);

  if (scheduleTime < twoMinutesAgo) {
    console.log(`⚠️ Session #${session.id} is too old. Skipping.`);
    return;
  }

  if (scheduleTime <= now) {
    console.log(`⚡ Session #${session.id} was scheduled recently. Sending immediately.`);
    sendMultiplePosters(session);
    return;
  }

  // Cancel old job if exists
  const existingJob = schedule.scheduledJobs[jobKey];
  if (existingJob) {
    existingJob.cancel();
  }

  schedule.scheduleJob(jobKey, scheduleTime, () => {
    console.log(`⏰ Triggered session #${session.id} at ${new Date().toLocaleString()}`);
    sendMultiplePosters(session);
  });
}
