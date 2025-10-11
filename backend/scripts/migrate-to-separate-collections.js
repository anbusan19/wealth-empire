const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../models/User');
const HealthCheck = require('../models/HealthCheck');
const Subscription = require('../models/Subscription');

async function migrateData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all users with existing data
    const users = await User.find({
      $or: [
        { healthCheckResults: { $exists: true, $ne: [] } },
        { subscription: { $exists: true } }
      ]
    });

    console.log(`Found ${users.length} users to migrate`);

    for (const user of users) {
      console.log(`Migrating user: ${user.email}`);

      // Migrate health check results
      if (user.healthCheckResults && user.healthCheckResults.length > 0) {
        for (const healthCheck of user.healthCheckResults) {
          const newHealthCheck = new HealthCheck({
            userId: user._id,
            firebaseUid: user.firebaseUid,
            assessmentDate: healthCheck.assessmentDate,
            answers: healthCheck.answers,
            followUpAnswers: healthCheck.followUpAnswers || new Map(),
            score: healthCheck.score,
            recommendations: healthCheck.recommendations || [],
            strengths: healthCheck.strengths || [],
            redFlags: healthCheck.redFlags || [],
            risks: healthCheck.risks || []
          });

          await newHealthCheck.save();
          console.log(`  - Migrated health check from ${healthCheck.assessmentDate}`);
        }
      }

      // Migrate subscription data
      if (user.subscription) {
        const newSubscription = new Subscription({
          userId: user._id,
          firebaseUid: user.firebaseUid,
          type: user.subscription.type || 'free',
          startDate: user.subscription.startDate || user.createdAt,
          endDate: user.subscription.endDate,
          isActive: user.subscription.isActive !== false,
          status: user.subscription.isActive !== false ? 'active' : 'expired',
          features: {
            healthChecksPerMonth: user.subscription.type === 'free' ? 1 : 999,
            detailedReports: user.subscription.type !== 'free',
            prioritySupport: user.subscription.type === 'enterprise',
            customRecommendations: user.subscription.type !== 'free',
            apiAccess: user.subscription.type === 'enterprise'
          }
        });

        await newSubscription.save();
        console.log(`  - Migrated ${user.subscription.type} subscription`);
      } else {
        // Create default free subscription for users without one
        const defaultSubscription = new Subscription({
          userId: user._id,
          firebaseUid: user.firebaseUid,
          type: 'free',
          startDate: user.createdAt,
          isActive: true,
          status: 'active'
        });

        await defaultSubscription.save();
        console.log(`  - Created default free subscription`);
      }
    }

    console.log('\nMigration completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Update your API routes to use the new models');
    console.log('2. Test the application thoroughly');
    console.log('3. Once confirmed working, you can remove the old fields from User model');
    console.log('4. Run: db.users.updateMany({}, {$unset: {healthCheckResults: "", subscription: ""}})');

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run migration
if (require.main === module) {
  migrateData();
}

module.exports = migrateData;