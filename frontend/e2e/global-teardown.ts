import { FullConfig } from '@playwright/test'

async function globalTeardown(_config: FullConfig) {
  console.log('🧹 Starting global teardown...')

  try {
    // Perform any global cleanup tasks here
    // For example, you might want to:
    // - Clean up test data
    // - Reset database state
    // - Clear temporary files
    // - Stop any background services

    console.log('✅ Global teardown completed successfully!')

  } catch (error) {
    console.error('❌ Global teardown failed:', error)
    // Don't throw here as it might mask test failures
  }
}

export default globalTeardown
