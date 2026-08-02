import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);

import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI not set in .env');
  process.exit(1);
}

console.log('Testing MongoDB connection with raw driver...');

const client = new MongoClient(uri, {
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 5000,
  tls: true,
  tlsAllowInvalidCertificates: true
});

try {
  console.log('Connecting to MongoDB...');
  await client.connect();
  console.log('✓ MongoDB Connected Successfully!');
  
  const db = client.db();
  const admin = db.admin();
  
  console.log('Server info:', await admin.serverInfo());
  
  await client.close();
  process.exit(0);
} catch (err) {
  console.error('✗ Connection Failed:', err);
  process.exit(1);
}