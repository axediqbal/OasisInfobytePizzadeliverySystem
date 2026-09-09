const cron = require('node-cron');
const InventoryItem = require('../models/InventoryItem');
const { sendLowStockEmail } = require('../config/mailer');

const runLowStockCheck = async () => {
  try {
    // Find items whose quantity is strictly below their threshold
    const lowItems = await InventoryItem.find({
      $expr: { $lt: ['$quantity', '$threshold'] }
    });

    if (lowItems && lowItems.length > 0) {
      console.log(`[LowStockCron] Found ${lowItems.length} items below threshold.`);
      
      // Filter out items alerted within the last 60 minutes to prevent inbox flooding
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const itemsToAlert = lowItems.filter(item => !item.lastAlertedAt || item.lastAlertedAt < oneHourAgo);

      if (itemsToAlert.length > 0) {
        await sendLowStockEmail(itemsToAlert);

        // Update lastAlertedAt timestamp
        const itemIds = itemsToAlert.map(i => i._id);
        await InventoryItem.updateMany(
          { _id: { $in: itemIds } },
          { lastAlertedAt: new Date() }
        );
      }
    } else {
      console.log('[LowStockCron] All inventory items are above their threshold.');
    }
  } catch (error) {
    console.error('[LowStockCron Error]', error.message);
  }
};

const initLowStockJob = () => {
  // Runs every 15 minutes per TRD §7
  cron.schedule('*/15 * * * *', () => {
    console.log('[LowStockCron] Running scheduled low-stock inventory check...');
    runLowStockCheck();
  });
  console.log('[LowStockCron] Low-stock monitor scheduled (every 15 mins).');
};

module.exports = {
  initLowStockJob,
  runLowStockCheck,
};
