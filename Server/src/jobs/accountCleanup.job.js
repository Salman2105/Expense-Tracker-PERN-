const cron = require("node-cron");
const {
  processEligibleAccounts,
} = require("../services/account.service");

let isCleanupRunning = false;

const startAccountCleanupJob = () => {
  cron.schedule("0 2 * * *", async () => {
    if (isCleanupRunning) {
      console.log(
        "[ACCOUNT CLEANUP] Previous cleanup is still running. Skipping this run."
      );

      return;
    }

    isCleanupRunning = true;

    console.log("[ACCOUNT CLEANUP] Job started");

    try {
      const summary = await processEligibleAccounts();

      console.log(
        `[ACCOUNT CLEANUP] Job completed | found=${summary.found} | deleted=${summary.deleted} | failed=${summary.failed}`
      );
    } catch (error) {
      console.error(
        "[ACCOUNT CLEANUP] Job failed:",
        error.message
      );
    } finally {
      isCleanupRunning = false;
    }
  });

  console.log("[ACCOUNT CLEANUP] Scheduler started");
};

module.exports = {
  startAccountCleanupJob,
};