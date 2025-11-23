import { MongoClient, Db, ObjectId } from 'mongodb'

// Global cached promise to avoid creating multiple clients in Next.js hot reload/dev
let client: MongoClient | null = null
let clientPromise: Promise<MongoClient> | null = null
let seeded = false

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/rcd'

function getClientPromise(): Promise<MongoClient> {
  if (clientPromise) return clientPromise
  client = new MongoClient(uri)
  clientPromise = client.connect().then(async (c) => {
    const db = c.db()
    await ensureIndexes(db)
    if (!seeded) {
      await seedIfEmpty(db)
      seeded = true
    }
    return c
  })
  return clientPromise
}

export async function getDb(): Promise<Db> {
  const c = await getClientPromise()
  return c.db()
}

async function ensureIndexes(db: Db) {
  await db.collection('users').createIndex({ email: 1 }, { unique: true })
  await db.collection('teams').createIndex({ managerId: 1 })
  await db.collection('teams').createIndex({ name: 1 }, { unique: true })
  await db.collection('tournaments').createIndex({ status: 1 })
}

async function seedIfEmpty(db: Db) {
  const usersCol = db.collection('users')
  const teamsCol = db.collection('teams')
  const userCount = await usersCol.countDocuments()
  if (userCount === 0) {
    const now = new Date().toISOString()
    const users = [
      { _id: '1', email: 'owner@example.com', role: 'team_manager', username: 'owner', createdAt: now },
      { _id: '2', email: 'player1@example.com', role: 'player', username: 'player1', createdAt: now },
      { _id: '3', email: 'player2@example.com', role: 'player', username: 'player2', createdAt: now },
      { _id: '4', email: 'admin@example.com', role: 'admin', username: 'admin', createdAt: now }
    ]
    await usersCol.insertMany(users)
  }
  const teamCount = await teamsCol.countDocuments()
  if (teamCount === 0) {
    const now = new Date().toISOString()
    await teamsCol.insertMany([
      { _id: 't1', name: 'RCD Legends', tag: 'RCD', managerId: '1', members: ['1','2','3'], captainIds: [], createdAt: now },
      { _id: 't2', name: 'Shadow Clan', tag: 'SHDW', managerId: '4', members: ['4','3'], captainIds: [], createdAt: now }
    ])
  }
}

export function newTeamId(): string {
  return new ObjectId().toHexString()
}
