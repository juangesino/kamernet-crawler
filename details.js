require('dotenv').config()
const runCrawler = require('./crawlers/kamernet/detailsKamernet')

const main = async () => {
  await runCrawler.main()
}

main()
