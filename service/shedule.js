import cron from 'node-cron';

// Log every minute
cron.schedule('* * * * *', () => {
  console.log('⏰ Cron job triggered at', new Date().toLocaleTimeString());
});

// Keep the process alive
setInterval(() => {}, 1000);
