/* global $ */
const puppeteer = require('puppeteer')
const moment = require('moment')
const storage = require('../../services/storage')

const executablePath =
  process.env.CHROMIUM_EXECUTABLE_PATH ||
  '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary'

const LISTING_URL = `https://kamernet.nl/en/for-rent/rooms-netherlands`
const SOURCE = 'kamernet'

const getTotalPages = async page => {
  const totalPages = await page.evaluate(() => {
    return $('.pagination li')
      .reverse()[1]
      .getAttribute('page')
  })
  return parseInt(totalPages, 10)
}

const getRoomsData = async page => {
  const rooms = []
  const rawRooms = await page.evaluate(() => {
    const elements = $("[id^='roomAdvert'] .rowSearchResultRoom")
    // eslint-disable-next-line no-shadow
    const rooms = []
    $.each(elements, (index, element) => {
      const title = $(element).find('a.tile-title')[0].text
      const url = $(element).find('a.tile-title')[0].href
      const regex = /((?:\/(.*)){2})$/gm
      const externalId = regex.exec(url)[2]
      const latitude = $(element).find('meta[itemprop="latitude"]')[0].content
      const longitude = $(element).find('meta[itemprop="longitude"]')[0].content
      const coverImageUrl = $(element).find('meta[itemprop="image"]')[0].content
      const postalCode = $(element).find('meta[itemprop="postalCode"]')[0]
        .content
      const city = $(element).find('div.tile-city')[0].textContent
      const propertyType = $(element)
        .find('div.tile-room-type')[0]
        .textContent.replace('-', '')
        .trim()
      const postedAgo = $(element)
        .find('div.tile-dateplaced')[0]
        .textContent.trim()
      const rawAvailability = $(element)
        .find('div.tile-availability .left')[0]
        .textContent.trim()
      const rentRaw = $(element)
        .find('div.tile-rent')[0]
        .textContent.trim()
      const rent = parseFloat(
        $(element)
          .find('div.tile-rent')[0]
          .textContent.replace('€', '')
          .replace(/-(.*)/gi, '')
          .trim()
      )
      const rentDetail = $(element)
        .find('div.tile-rent')[0]
        .textContent.replace(/(.*)-/gi, '')
        .trim()
      const areaRaw = $(element)
        .find('div.tile-surface')[0]
        .textContent.trim()
      const areaSqm = parseFloat(
        $(element)
          .find('div.tile-surface')[0]
          .textContent.replace('m2', '')
          .trim()
      )
      const furnish = $(element)
        .find('div.tile-furnished')[0]
        .textContent.trim()
      const room = {
        title,
        url,
        externalId,
        latitude,
        longitude,
        coverImageUrl,
        postalCode,
        city,
        propertyType,
        postedAgo,
        rawAvailability,
        rentRaw,
        rent,
        rentDetail,
        areaRaw,
        areaSqm,
        furnish
      }
      rooms.push(room)
    })
    return rooms
  })
  for (const rawRoom of rawRooms) {
    rawRoom.crawledAt = new Date()
    rawRoom.source = SOURCE
    await storage.createOrUpdate(rawRoom)
  }
  return rooms
}

const getPageRooms = async (browser, pageNumber) => {
  const page = await browser.newPage()
  await page.setViewport({ width: 1366, height: 768 })
  const url = `https://kamernet.nl/en/for-rent/rooms-netherlands?pageno=${pageNumber}`
  await page.goto(url, { waitUntil: 'networkidle2' })
  const rooms = await getRoomsData(page, browser)
  await page.close()
  return rooms
}

const main = async () => {
  const meta = await storage.getMetaSingleton()

  let { currentPage } = meta
  const lastRunAt = moment(meta.lastRunAt)

  if (lastRunAt.isSame(moment(), 'day')) {
    if (meta.currentPage >= meta.totalPages) {
      return
    }
  } else {
    currentPage = 1
    await storage.updateMetaSingleton({
      currentPage
    })
  }

  let properties = []
  const browser = await puppeteer.launch({
    headless: true,
    executablePath,
    args: ['--window-size=1366,768', '--no-sandbox', '--disable-setuid-sandbox']
  })
  const page = await browser.newPage()
  await page.setViewport({ width: 1366, height: 768 })
  const url = LISTING_URL
  await page.goto(url, { waitUntil: 'networkidle2' })
  const totalPages = await getTotalPages(page)
  await storage.updateMetaSingleton({
    lastRunAt: new Date(),
    totalPages
  })
  for (currentPage; currentPage <= totalPages; currentPage += 1) {
    try {
      const rooms = await getPageRooms(browser, currentPage)
      properties = properties.concat(rooms)
      await storage.updateMetaSingleton({
        currentPage
      })
    } catch (error) {
      console.error(`Error crawling page ${currentPage}. Aborting.`)
      console.error(error)
      process.exit(1)
    }
  }
  await browser.close()
}

module.exports = {
  main
}
