const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
  try {
    console.log('🔄 Testing MongoDB connection...');
    console.log('📍 MongoDB URL:', process.env.MONGODB_URL ? 'Configured' : 'Not configured');
    
    await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Successfully connected to MongoDB Atlas!');
    console.log('📊 Database:', mongoose.connection.db.databaseName);
    
    // Test creating a simple document
    const testCollection = mongoose.connection.db.collection('connection_test');
    const testDoc = await testCollection.insertOne({
      test: true,
      timestamp: new Date(),
      message: 'Connection test successful'
    });
    
    console.log('✅ Test document created with ID:', testDoc.insertedId);
    
    // Clean up test document
    await testCollection.deleteOne({ _id: testDoc.insertedId });
    console.log('🧹 Test document cleaned up');
    
    await mongoose.connection.close();
    console.log('🔌 Connection closed successfully');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:');
    console.error('Error:', error.message);
    
    if (error.message.includes('authentication failed')) {
      console.log('💡 Check your username and password in the connection string');
    } else if (error.message.includes('network')) {
      console.log('💡 Check your network connection and MongoDB Atlas IP whitelist');
    }
    
    process.exit(1);
  }
}

testConnection();