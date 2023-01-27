require('dotenv').config()
const runCrawler = require('./crawlers/kamernet/kamernet')

const main = async () => {
  await runCrawler.main()
}

main()
