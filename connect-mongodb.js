/**
 * Standalone MongoDB Database Creator & Connection Verification Script
 *
 * HOW IT WORKS:
 * In MongoDB, you do not need to run a "CREATE DATABASE" query like in SQL.
 * When you specify a database name in your MongoDB URL (e.g. mongodb://localhost:27017/hospital_token_db),
 * MongoDB automatically creates the database the moment the first document or collection is created.
 *
 * HOW TO RUN THIS FILE:
 * Option 1: Pass the MongoDB URL directly as an argument:
 *    node connect-mongodb.js "mongodb://localhost:27017/hospital_token_db"
 *    OR
 *    node connect-mongodb.js "mongodb+srv://<username>:<password>@cluster.mongodb.net/hospital_token_db"
 *
 * Option 2: Run with an existing .env file:
 *    node connect-mongodb.js
 */

const mongoose = require('./server/node_modules/mongoose');
const path = require('path');
require('./server/node_modules/dotenv').config({ path: path.join(__dirname, 'server', '.env') });

const testMongoDBConnection = async () => {
  // 1. Get the MongoDB URL from command-line argument, or from environment variable
  const cliArgUrl = process.argv[2];
  const envUrl = process.env.MONGODB_URI;

  let mongoURI = cliArgUrl || envUrl;

  // Validate the URL
  if (!mongoURI || mongoURI === 'null' || mongoURI.trim() === '') {
    console.error('\n=============================================================');
    console.error('❌ ERROR: No MongoDB Connection URL provided.');
    console.error('=============================================================');
    console.error('Please run the script by passing your connection URL as an argument:');
    console.error('\n  Example (Local MongoDB):');
    console.error('    node connect-mongodb.js "mongodb://127.0.0.1:27017/hospital_token_db"');
    console.error('\n  Example (MongoDB Atlas Cloud):');
    console.error('    node connect-mongodb.js "mongodb+srv://<user>:<password>@cluster0.abcde.mongodb.net/hospital_token_db?retryWrites=true&w=majority"');
    console.error('\nAlternatively, set MONGODB_URI in server/.env and run:');
    console.error('    node connect-mongodb.js');
    console.error('=============================================================\n');
    process.exit(1);
  }

  // Trim whitespace or quotes
  mongoURI = mongoURI.trim().replace(/^["']|["']$/g, '');

  console.log('\n=============================================================');
  console.log('🔄 Connecting to MongoDB...');
  // Mask password in log for security
  const maskedURI = mongoURI.replace(/(mongodb(?:\+srv)?:\/\/[^:]+:)([^@]+)(@.+)/, '$1******$3');
  console.log(`📍 Target URL: ${maskedURI}`);
  console.log('=============================================================');

  try {
    // 2. Connect to MongoDB using Mongoose
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 8000 // 8 second timeout
    });

    const db = mongoose.connection.db;
    const dbName = mongoose.connection.name;

    console.log(`\n✅ Connected successfully to MongoDB!`);
    console.log(`📁 Active Database: "${dbName}"`);

    // 3. Automatically create/verify database by inserting and removing a test verification document
    console.log('\n🔄 Creating verification collection and document...');
    const testCollection = db.collection('_connection_verification');
    const result = await testCollection.insertOne({
      test: 'mongodb_connection_verified',
      database: dbName,
      timestamp: new Date()
    });

    console.log(`✅ Document written successfully with ID: ${result.insertedId}`);
    console.log(`🎉 Database "${dbName}" is active and ready on your MongoDB server!`);

    // Clean up verification document
    await testCollection.deleteOne({ _id: result.insertedId });
    // Remove the temporary collection if empty
    try {
      await testCollection.drop();
    } catch (_) {
      // Ignored if collection already dropped
    }

    // 4. List existing collections in the database
    const collections = await db.listCollections().toArray();
    console.log('\n📋 Existing collections in this database:');
    if (collections.length === 0) {
      console.log('   (Database is currently empty and will populate when the app or seed runs)');
    } else {
      collections.forEach((col, idx) => {
        console.log(`   ${idx + 1}. ${col.name}`);
      });
    }

    console.log('\n=============================================================');
    console.log('✨ All checks passed! You can now configure this URL in server/.env:');
    console.log(`   MONGODB_URI=${mongoURI}`);
    console.log('=============================================================\n');
  } catch (error) {
    console.error('\n=============================================================');
    console.error('❌ FAILED TO CONNECT TO MONGODB');
    console.error('=============================================================');
    console.error(`Error Message: ${error.message}`);
    console.error('\nTroubleshooting Tips:');
    console.error('1. If using Local MongoDB:');
    console.error('   - Ensure MongoDB service is running (mongod or via Services app).');
    console.error('   - Use "mongodb://127.0.0.1:27017/hospital_token_db" instead of localhost.');
    console.error('2. If using MongoDB Atlas Cloud:');
    console.error('   - Check your username and password (replace <password> in the string).');
    console.error('   - In Atlas -> Network Access, ensure your IP address or 0.0.0.0/0 is whitelisted.');
    console.error('   - Ensure your database name is appended after the slash (e.g. /hospital_token_db).');
    console.error('=============================================================\n');
    process.exit(1);
  } finally {
    // 5. Cleanly close connection
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB cleanly.\n');
    process.exit(0);
  }
};

testMongoDBConnection();
