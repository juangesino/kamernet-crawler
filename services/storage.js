const { MongoClient, ObjectID } = require('mongodb')

const {
  MONGODB_URI,
  MONGODB_NAME,
  COLLECTION_PROPERTIES,
  COLLECTION_META,
  KAMERNET_SINGLETON_NAME
} = process.env

const NO_DETAILS_STATUS = 'pending'

const dbClient = async (uri = MONGODB_URI) => {
  console.log('Connecting to MongoDB..')
  const mongoClient = await MongoClient.connect(uri, {
    useNewUrlParser: true
  }).catch(err => {
    console.error('Error connecting to MongoDB:', err)
    throw new Error('Error connecting to MongoDB')
  })
  console.log('Connection to MongoDB established successfully')
  return mongoClient
}

const getCollectionStats = async (
  collectionName = COLLECTION_PROPERTIES,
  dbName = MONGODB_NAME
) => {
  console.log('Getting collection stats:', collectionName)
  const mongoClient = await dbClient()
  try {
    const db = mongoClient.db(dbName)
    const collection = db.collection(collectionName)
    const res = await collection.stats()
    return res
  } catch (err) {
    console.error('Error getting collection stats:', err)
    throw new Error('Error getting collection stats')
  } finally {
    mongoClient.close()
  }
}

const getMetaSingleton = async (
  singletonName = KAMERNET_SINGLETON_NAME,
  collectionName = COLLECTION_META,
  dbName = MONGODB_NAME
) => {
  console.log('Getting meta singleton')
  const mongoClient = await dbClient()
  try {
    const db = mongoClient.db(dbName)
    const collection = db.collection(collectionName)
    const res = await collection.findOne({
      name: singletonName
    })
    return res
  } catch (err) {
    console.error('Error getting meta singleton:', err)
    throw new Error('Error getting meta singleton')
  } finally {
    mongoClient.close()
  }
}

const updateMetaSingleton = async (
  data,
  singletonName = KAMERNET_SINGLETON_NAME,
  collectionName = COLLECTION_META,
  dbName = MONGODB_NAME
) => {
  console.log('Updating meta singleton')
  console.log('Using data:', data)
  const mongoClient = await dbClient()
  try {
    const db = mongoClient.db(dbName)
    const collection = db.collection(collectionName)
    const res = await collection.findOneAndUpdate(
      {
        name: singletonName
      },
      {
        $set: data
      }
    )
    return res.ok === 1
  } catch (err) {
    console.error('Error updating meta singleton:', err)
    return false
  } finally {
    mongoClient.close()
  }
}

const addProperty = async (
  property,
  collectionName = COLLECTION_PROPERTIES,
  dbName = MONGODB_NAME
) => {
  console.log('Adding propery:', property)
  const mongoClient = await dbClient()
  try {
    const db = mongoClient.db(dbName)
    const collection = db.collection(collectionName)
    const res = await collection.insertOne(property)
    return res
  } catch (err) {
    console.error('Error adding property:', err)
    throw new Error('Error adding property')
  } finally {
    mongoClient.close()
  }
}

const createOrUpdate = async (
  data,
  collectionName = COLLECTION_PROPERTIES,
  dbName = MONGODB_NAME
) => {
  console.log('Upserting property:', data.externalId)
  console.log('Using data:', data)
  const mongoClient = await dbClient()
  try {
    const db = mongoClient.db(dbName)
    const collection = db.collection(collectionName)
    data.lastSeenAt = new Date()
    const res = await collection.updateOne(
      {
        externalId: data.externalId
      },
      {
        $set: data,
        $push: { datesPublished: new Date() },
        $setOnInsert: {
          firstSeenAt: new Date(),
          crawlStatus: NO_DETAILS_STATUS
        }
      },
      { upsert: true }
    )
    return res.result.ok === 1
  } catch (err) {
    console.error('Error updating property:', err)
    return false
  } finally {
    mongoClient.close()
  }
}

const updateProperty = async (
  id,
  data,
  collectionName = COLLECTION_PROPERTIES,
  dbName = MONGODB_NAME
) => {
  console.log('Updating property:', id)
  console.log('Using data:', data)
  const mongoClient = await dbClient()
  try {
    const db = mongoClient.db(dbName)
    const collection = db.collection(collectionName)
    const res = await collection.findOneAndUpdate(
      {
        _id: ObjectID(id)
      },
      {
        $set: data
      }
    )
    return res.ok === 1
  } catch (err) {
    console.error('Error updating property:', err)
    return false
  } finally {
    mongoClient.close()
  }
}

const getProperty = async (
  id,
  collectionName = COLLECTION_PROPERTIES,
  dbName = MONGODB_NAME
) => {
  console.log('Getting property:', id)
  const mongoClient = await dbClient()
  try {
    const db = mongoClient.db(dbName)
    const collection = db.collection(collectionName)
    const res = await collection.findOne({
      _id: ObjectID(id)
    })
    return res
  } catch (err) {
    console.error('Error getting property:', err)
    throw new Error('Error getting property')
  } finally {
    mongoClient.close()
  }
}

const getRandomProperties = async (
  count = 5,
  collectionName = COLLECTION_PROPERTIES,
  dbName = MONGODB_NAME
) => {
  console.log(`Getting ${count} random properties`)
  const mongoClient = await dbClient()
  try {
    const db = mongoClient.db(dbName)
    const collection = db.collection(collectionName)
    const res = await collection.aggregate([
      { $match: { crawlStatus: 'pending' } },
      { $sample: { size: count } }
    ])
    return await res.toArray()
  } catch (err) {
    console.error('Error getting random properties:', err)
    throw new Error('Error getting random properties')
  } finally {
    mongoClient.close()
  }
}

const getPropertiesCount = async (
  status = false,
  collectionName = COLLECTION_PROPERTIES,
  dbName = MONGODB_NAME
) => {
  const mongoClient = await dbClient()
  try {
    const query = status ? { crawlStatus: status } : {}
    const db = mongoClient.db(dbName)
    const collection = db.collection(collectionName)
    const res = await collection.find(query)
    return await res.count()
  } catch (err) {
    console.error('Error getting property:', err)
    throw new Error('Error getting property')
  } finally {
    mongoClient.close()
  }
}

module.exports = {
  getCollectionStats,
  getMetaSingleton,
  updateMetaSingleton,
  addProperty,
  createOrUpdate,
  updateProperty,
  getProperty,
  getRandomProperties,
  getPropertiesCount
}
