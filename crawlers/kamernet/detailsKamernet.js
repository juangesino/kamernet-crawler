/* eslint-disable no-underscore-dangle */
/* global $, document */
const puppeteer = require('puppeteer')
const storage = require('../../services/storage')

const executablePath =
  process.env.CHROMIUM_EXECUTABLE_PATH ||
  '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary'
const RANDOM_PROPERTIES = 100
const NEW_STATUS = 'done'
const UNAVAILABLE_STATUS = 'unavailable'

const getRoomDetails = async (browser, rawRoom) => {
  console.log('Crawling details for:', rawRoom._id)
  const page = await browser.newPage()
  await page.setViewport({ width: 1366, height: 768 })
  const { url } = rawRoom
  await page.goto(url, { waitUntil: 'networkidle2' })
  const available = await page.evaluate(() => {
    return $('.unavailable-advert, .not-found').length === 0
  })
  console.log('Property Available:', available)
  if (available) {
    const extraDetails = await page.evaluate(() => {
      const pageTitle = $(document).attr('title')
      const pageDescription = $('meta[name=description]').attr('content')
      const userId = $('#ToUserId').val()
      const userDisplayName = $('#ToUserDisplayName').val()
      const userMemberSince = $('#ToUserMemberSince').val()
      const userLastLoggedOn = $('#ToUserLastLoggedOn').val()
      const userPhotoUrl = $('#ToUserPhotoUrl').val()
      const isRoomActive = $('#IsRoomActive').val()
      const descriptionNonTranslatedRaw = $('.room-description').html()
      const descriptionNonTranslated = $('.room-description')
        .text()
        .trim()
      const descriptionTranslatedRaw = $('.room-description-translated').html()
      const descriptionTranslated = $('.room-description-translated')
        .text()
        .trim()
      const living = $(".info-col .left div:contains('Living')")
        .parent()
        .find('div')[1]
        .innerHTML.trim()
      const kitchen = $(".info-col .left div:contains('Kitchen')")
        .parent()
        .find('div')[1]
        .innerHTML.trim()
      const shower = $(".info-col .left div:contains('Shower')")
        .parent()
        .find('div')[1]
        .innerHTML.trim()
      const toilet = $(".info-col .left div:contains('Toilet')")
        .parent()
        .find('div')[1]
        .innerHTML.trim()
      const internet = $(".info-col .left div:contains('Internet')")
        .parent()
        .find('div')[1]
        .innerHTML.trim()
      const energyLabel = $(".info-col .left div:contains('Energy')")
        .parent()
        .find('div')[1]
        .innerHTML.trim()

      let roommates = null
      try {
        roommates = $(".info-col .left div:contains('Roommates')")
          .parent()
          .find('div')[1]
          .innerHTML.trim()
      } catch (error) {
        console.log('Roommates:', error)
      }

      let gender = null
      try {
        gender = $(".info-col .left div:contains('Gender')")
          .parent()
          .find('div')[1]
          .innerHTML.trim()
      } catch (error) {
        console.log('Gender:', error)
      }

      const pets = $(".info-col .left div:contains('Pets')")
        .parent()
        .find('div')[1]
        .innerHTML.trim()
      const smokingInside = $(".info-col .left div:contains('Smoking')")
        .parent()
        .find('div')[1]
        .innerHTML.trim()
      const matchCapacity = $("td:contains('Suitable')")
        .next('td')
        .text()
        .trim()
      const matchGender = $(".match-user-details div:contains('Gender') > span")
        .text()
        .trim()
      const matchGenderBackup = $("td:contains('Gender')")
        .next('td')
        .text()
        .trim()
      const matchAge = $(".match-user-details div:contains('Age') > span")
        .text()
        .trim()
      const matchAgeBackup = $("td:contains('Age')")
        .next('td')
        .text()
        .trim()
      const matchStatus = $(".match-user-details div:contains('Status') > span")
        .text()
        .trim()
      const matchStatusBackup = $("td:contains('Status')")
        .next('td')
        .text()
        .trim()
      const matchLanguages = $("td:contains('Speaks')")
        .next('td')
        .text()
        .trim()
      const depositRaw = $("td:contains('Deposit')")
        .parent()
        .find('td')[1].innerHTML
      const deposit = parseFloat(
        $("td:contains('Deposit')")
          .parent()
          .find('td')[1]
          .innerHTML.replace('€', '')
          .replace(/-(.*)/gi, '')
          .trim()
      )
      let registrationCostRaw = 'NA'
      let registrationCost = null
      const registrationElement = $("td:contains('Registration')")
        .parent()
        .find('td')[1]
      if (registrationElement !== undefined) {
        registrationCostRaw = $("td:contains('Registration')")
          .parent()
          .find('td')[1].innerHTML
        registrationCost = parseFloat(
          $("td:contains('Registration')")
            .parent()
            .find('td')[1]
            .innerHTML.replace('€', '')
            .replace(/-(.*)/gi, '')
            .trim()
        )
      }

      let additionalCostsRaw = 'NA'
      let additionalCosts = null
      let additionalCostsDescription = 'NA'
      const additionalCostsElement = $("td:contains('Additional')")
        .parent()
        .find('td')[1]
      if (additionalCostsElement !== undefined) {
        additionalCostsRaw = $("td:contains('Additional')")
          .parent()
          .find('td')[1].innerHTML
        additionalCosts = parseFloat(
          $("td:contains('Additional')")
            .parent()
            .find('td')[1]
            .innerHTML.replace('€', '')
            .replace(/-(.*)/gi, '')
            .trim()
        )
        additionalCostsDescription = $("td:contains('Extra')")
          .parent()
          .next().innerHTML
      }

      return {
        pageTitle,
        pageDescription,
        userId,
        userDisplayName,
        userMemberSince,
        userLastLoggedOn,
        userPhotoUrl,
        isRoomActive,
        descriptionNonTranslatedRaw,
        descriptionNonTranslated,
        descriptionTranslatedRaw,
        descriptionTranslated,
        living,
        kitchen,
        shower,
        toilet,
        internet,
        energyLabel,
        roommates,
        gender,
        pets,
        smokingInside,
        matchCapacity,
        matchGender,
        matchGenderBackup,
        matchAge,
        matchAgeBackup,
        matchStatus,
        matchStatusBackup,
        matchLanguages,
        depositRaw,
        deposit,
        registrationCostRaw,
        registrationCost,
        additionalCostsRaw,
        additionalCosts,
        additionalCostsDescription
      }
    })
    extraDetails.crawlStatus = NEW_STATUS
    extraDetails.detailsCrawledAt = new Date()
    await page.close()
    return extraDetails
  }
  await page.close()
  return {
    crawlStatus: UNAVAILABLE_STATUS,
    detailsCrawledAt: new Date()
  }
}

const main = async () => {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath,
    args: ['--window-size=1366,768', '--no-sandbox', '--disable-setuid-sandbox']
  })
  const properties = await storage.getRandomProperties(RANDOM_PROPERTIES)
  for (const [, property] of properties.entries()) {
    try {
      const crawledData = await getRoomDetails(browser, property)
      await storage.updateProperty(property._id, crawledData)
    } catch (error) {
      console.error('Error getting room details.')
      console.error(error)
      process.exit(1)
    }
  }

  await browser.close()
}

module.exports = {
  main
}
