const User = require("../models/user");
const Journal = require("../models/journal");
const DEMO_DURATION = 30 * 60 * 1000; // 30 minutes

async function cleanUpExpiredDemos() {
  const expiredTime = Date.now() - DEMO_DURATION;

  try {
    //.distinct returns just an array of IDs instead of the full user objects
    const expiredDemoUsersIds = await User.find({
      isDemo: true,
      lastActivity: { $lt: expiredTime },
    }).distinct("_id");

    if (expiredDemoUsersIds.length === 0) {
      console.log("No expired demo sessions to clean up");
      return;
    }

    await Journal.deleteMany({ user: { $in: expiredDemoUsersIds } });

    const result = await User.deleteMany({
      isDemo: true,
      lastActivity: { $lt: expiredTime },
    });
    const unit = result.deletedCount === 1 ? "demo" : "demos";
    console.log(`Cleaned up ${result.deletedCount} ${unit}`);
  } catch (error) {
    console.error(`Demo cleanup failed:`, error);
  }
}

module.exports = { cleanUpExpiredDemos, DEMO_DURATION };
