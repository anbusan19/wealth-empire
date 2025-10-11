const mongoose = require('mongoose');
require('dotenv').config();

async function cleanupOldFields() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb+srv://healthcheck_admin:<db_password>@wealthempires.xjkgxez.mongodb.net/?retryWrites=true&w=majority&appName=wealthempires');
    console.log('Connected to MongoDB');

    // Remove old fields from User collection
    const result = await mongoose.connection.db.collection('users').updateMany(
      {},
      {
        $unset: {
          healthCheckResults: "",
          subscription: ""
        }
      }
    );

    console.log(`Updated ${result.modifiedCount} user documents`);
    console.log('Old fields removed successfully!');

  } catch (error) {
    console.error('Cleanup failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run cleanup
if (require.main === module) {
  cleanupOldFields();
}

module.exports = cleanupOldFields;