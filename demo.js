/* eslint-disable no-unused-vars */
require('dotenv').config()
const storage = require('./services/storage')

const createDummy = async () => {
  const property = {
    name: 'Amazing House',
    area: '300'
  }
  storage.addProperty(property)
}

const getDummy = async () => {
  const id = '5d2af8dbaf566453b0305900'
  const response = await storage.getProperty(id)
  console.log('Response:', response)
}

const updateDummy = async () => {
  const id = '5d2af8dbaf566453b0305900'
  const data = {
    externalId: 'manual',
    rooms: 4
  }
  const response = await storage.updateProperty(id, data)
  console.log('Response:', response)
}

const getMetaSingleton = async () => {
  const response = await storage.getMetaSingleton()
  console.log('Response:', response)
}

const updateMetaSingleton = async () => {
  const data = {
    currentPage: 233,
    totalPages: 233,
    lastRunAt: new Date()
  }
  const response = await storage.updateMetaSingleton(data)
  console.log('Response:', response)
}

const createUpdateDummy = async () => {
  const prop = {
    title: 'Tramstraat',
    url:
      'https://kamernet.nl/en/for-rent/room-eindhoven/tramstraat/room-1690835',
    externalId: 'manual',
    latitude: '51.4399310000',
    longitude: '5.4832780000',
    coverImageUrl:
      'https://resources.kamernet.nl/image/3b2eb565-2b88-425f-a9b8-a48142171e9f',
    postalCode: '5611CR',
    city: 'Eindhoven',
    propertyType: 'Room',
    postedAgo: '1d',
    rawAvailability: "10-07-'19 - Indefinite period",
    rentRaw: '€ 300,-  Utilities incl.',
    rent: 400,
    crawlStatus: 'pending',
    source: 'kamernet'
  }
  const response = await storage.createOrUpdate(prop)
  console.log('Response:', response)
}

const getRandomDummy = async () => {
  const response = await storage.getRandomProperties()
  console.log('Response:', response)
}

const getStatsDummy = async () => {
  const stats = await storage.getCollectionStats()
  console.log('Stats:', stats)
}

const start = async () => {
  // await createDummy()
  // await getDummy()
  // await updateDummy()
  // await getMetaSingleton()
  // await updateMetaSingleton()
  // await createUpdateDummy()
  // await getStatsDummy()
  await getRandomDummy()
}

start()
