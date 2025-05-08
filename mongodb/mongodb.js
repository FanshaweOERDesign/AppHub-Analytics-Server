// mongoClient.mjs
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.DB_URI;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

let db;

export async function connect(dbName) {
  if (!db) {
    await client.connect();
    db = client.db(dbName);
    console.log(`Connected to MongoDB: ${dbName}`);
  }
  return db;
}

export async function insertOne(collectionName, doc) {
  const collection = db.collection(collectionName);
  return await collection.insertOne(doc);
}

export async function findOne(collectionName, query) {
  const collection = db.collection(collectionName);
  return await collection.findOne(query);
}

export async function findMany(collectionName, query = {}, options = {}) {
  const collection = db.collection(collectionName);
  return await collection.find(query, options).toArray();
}

export async function updateOne(collectionName, filter, update, options = {}) {
  const collection = db.collection(collectionName);
  return await collection.updateOne(filter, { $set: update }, options);
}

export async function deleteOne(collectionName, filter) {
  const collection = db.collection(collectionName);
  return await collection.deleteOne(filter);
}

export function toObjectId(id) {
  return new ObjectId(id);
}

export async function close() {
  await client.close();
  db = null;
}