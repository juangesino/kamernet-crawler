/* global document */
require('dotenv').config()
const puppeteer = require('puppeteer')

const executablePath =
  process.env.CHROMIUM_EXECUTABLE_PATH ||
  '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary'

const main = async () => {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath,
    args: ['--window-size=1366,768', '--no-sandbox', '--disable-setuid-sandbox']
  })
  const page = await browser.newPage()
  await page.setViewport({ width: 1366, height: 768 })
  const url = 'https://cbracco.github.io/html5-test-page/'
  await page.goto(url, { waitUntil: 'networkidle2' })
  const linkCount = await page.evaluate(() => {
    return document.getElementsByTagName('a').length
  })
  console.log('Link Count:', linkCount)
  process.exit(0)
}

main()
