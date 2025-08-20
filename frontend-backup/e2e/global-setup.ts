import { chromium, FullConfig } from '@playwright/test'

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global setup...')
  
  // Launch browser for setup
  const browser = await chromium.launch()
  const page = await browser.newPage()
  
  try {
    // Wait for the development server to be ready
    const baseURL = config.projects[0].use.baseURL || 'http://localhost:3000'
    console.log(`⏳ Waiting for server at ${baseURL}...`)
    
    let retries = 0
    const maxRetries = 30
    
    while (retries < maxRetries) {
      try {
        const response = await page.goto(baseURL, { timeout: 5000 })
        if (response && response.ok()) {
          console.log('✅ Server is ready!')
          break
        }
      } catch (error) {
        retries++
        if (retries === maxRetries) {
          throw new Error(`Server at ${baseURL} is not responding after ${maxRetries} attempts`)
        }
        console.log(`⏳ Attempt ${retries}/${maxRetries} - Server not ready, retrying...`)
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }
    
    // Perform any global setup tasks here
    // For example, you might want to:
    // - Create test data
    // - Set up authentication tokens
    // - Initialize database state
    
    console.log('🎯 Global setup completed successfully!')
    
  } catch (error) {
    console.error('❌ Global setup failed:', error)
    throw error
  } finally {
    await browser.close()
  }
}

export default globalSetup
