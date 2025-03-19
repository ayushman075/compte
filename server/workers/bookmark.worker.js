import { Worker } from "bullmq";
import { sendMail } from "../services/mail.js";
import { redis } from "../db/redis.config.js";

const bookmarkReminderWorker = new Worker('bookmarkReminderQueue', async job => {
  const { email, contestTitle, contestUrl, startTime } = job.data;
  
  console.log(`Sending contest reminder to User: ${email}`);

  const subject = `Reminder: ${contestTitle} starts soon!`;
  const html = `
      <h3>Upcoming Contest Reminder</h3>
      <p>The contest <strong>${contestTitle}</strong> is starting at <strong>${startTime}</strong>.</p>
      <p>Click <a href="${contestUrl}" target="_blank">here</a> to join.</p>
      <p>Best of luck!</p>
  `;

  const requestOption = {
    to: email,
    subject,
    text: `Reminder: ${contestTitle} is starting at ${startTime}. Join here: ${contestUrl}`,
    html
  };

  await sendMail(requestOption);
}, {
  connection: redis
});


bookmarkReminderWorker.on('completed', job => {
  console.log(`Reminder sent for Job ${job.id}`);
});


bookmarkReminderWorker.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed: ${err.message}`);
});

export { bookmarkReminderWorker };
