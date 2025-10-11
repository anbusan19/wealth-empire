const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Subscription = require('../models/Subscription');

async function checkUserSubscriptions() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('Connected to MongoDB');

    // Get all users
    const users = await User.find({});
    console.log(`Found ${users.length} users`);

    for (const user of users) {
      const subscription = await Subscription.getActiveForUser(user._id);

      if (!subscription) {
        console.log(`❌ User ${user.email} has no subscription`);

        // Create default subscription
        const defaultSubscription = new Subscription({
          userId: user._id,
          firebaseUid: user.firebaseUid,
          type: 'free',
          startDate: user.createdAt || new Date(),
          isActive: true,
          status: 'active'
        });

        await defaultSubscription.save();
        console.log(`✅ Created default subscription for ${user.email}`);
      } else {
        console.log(`✅ User ${user.email} has ${subscription.type} subscription (used: ${subscription.usage.healthChecksUsed}/${subscription.features.healthChecksPerMonth})`);
      }
    }

    console.log('\nSubscription check completed!');

  } catch (error) {
    console.error('Check failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run check
if (require.main === module) {
  checkUserSubscriptions();
}

module.exports = checkUserSubscriptions;