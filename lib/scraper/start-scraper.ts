import { startServer } from './scraper-server'

console.log('Starting DCM Scraper Server...')
console.log('This server manages a Playwright browser for scraping Amazon Logistics DCM data.')
console.log('Press Ctrl+C to stop.\n')

startServer().catch((err) => {
  console.error('Failed to start scraper server:', err)
  process.exit(1)
})
