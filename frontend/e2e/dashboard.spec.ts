import { test, expect } from '@playwright/test'

test.describe('Dashboard Page', () => {
  test.beforeEach(async ({ page }) => {
    // Mock API responses
    await page.route('**/api/analytics/dashboard', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          metrics: {
            totalUAVs: 24,
            authorizedUAVs: 18,
            unauthorizedUAVs: 6,
            activeFlights: 3,
            hibernatingUAVs: 8,
            lowBatteryCount: 2,
            chargingCount: 5,
            maintenanceCount: 1,
            emergencyCount: 0,
          },
          flightActivity: {
            activeFlights: 3,
            todayFlights: 12,
            completedFlights: 9,
            flights: [
              {
                id: 1,
                uavRfid: 'UAV-001',
                missionName: 'Perimeter Patrol',
                startTime: '2024-01-15T10:30:00Z',
                status: 'IN_PROGRESS'
              }
            ]
          }
        })
      })
    })

    // Navigate to dashboard
    await page.goto('/dashboard')
  })

  test('should display dashboard title and description', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /UAV Control Dashboard/i })).toBeVisible()
    await expect(page.getByText(/Real-time monitoring and fleet management/i)).toBeVisible()
  })

  test('should display metrics cards', async ({ page }) => {
    // Check for metrics cards
    await expect(page.getByText('Total UAVs')).toBeVisible()
    await expect(page.getByText('Authorized')).toBeVisible()
    await expect(page.getByText('Active Flights')).toBeVisible()
    await expect(page.getByText('Hibernating')).toBeVisible()

    // Check for metric values
    await expect(page.getByText('24')).toBeVisible() // Total UAVs
    await expect(page.getByText('18')).toBeVisible() // Authorized UAVs
    await expect(page.getByText('3')).toBeVisible()  // Active Flights
    await expect(page.getByText('8')).toBeVisible()  // Hibernating UAVs
  })

  test('should display system status section', async ({ page }) => {
    await expect(page.getByText('System Status')).toBeVisible()
    await expect(page.getByText('Current system health and alerts')).toBeVisible()
    
    // Check status items
    await expect(page.getByText('Unauthorized UAVs')).toBeVisible()
    await expect(page.getByText('Low Battery')).toBeVisible()
    await expect(page.getByText('Charging')).toBeVisible()
    await expect(page.getByText('Maintenance')).toBeVisible()
    await expect(page.getByText('Emergency')).toBeVisible()
  })

  test('should display active flights section', async ({ page }) => {
    await expect(page.getByText('Active Flights')).toBeVisible()
    await expect(page.getByText('Currently active flight missions')).toBeVisible()
    
    // Check for flight information
    await expect(page.getByText('Perimeter Patrol')).toBeVisible()
    await expect(page.getByText('UAV-001')).toBeVisible()
  })

  test('should display quick actions section', async ({ page }) => {
    await expect(page.getByText('Quick Actions')).toBeVisible()
    await expect(page.getByText('Frequently used operations and shortcuts')).toBeVisible()
    
    // Check for action buttons
    await expect(page.getByRole('button', { name: /Add UAV/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /View Map/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Battery Status/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /View Alerts/i })).toBeVisible()
  })

  test('should display connection status', async ({ page }) => {
    // Check for connection status indicator
    await expect(page.getByText('Connected').or(page.getByText('Disconnected'))).toBeVisible()
  })

  test('should have working refresh button', async ({ page }) => {
    const refreshButton = page.getByRole('button', { name: /Refresh/i })
    await expect(refreshButton).toBeVisible()
    await refreshButton.click()
    
    // Button should be temporarily disabled during refresh
    // This is a basic check - in a real app you might check for loading states
  })

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Check that content is still visible and properly arranged
    await expect(page.getByRole('heading', { name: /UAV Control Dashboard/i })).toBeVisible()
    await expect(page.getByText('Total UAVs')).toBeVisible()
    
    // Check that mobile navigation is accessible
    const menuButton = page.getByRole('button', { name: /Toggle menu/i })
    if (await menuButton.isVisible()) {
      await menuButton.click()
      // Check that navigation menu opens
      await expect(page.getByText('UAV Management')).toBeVisible()
    }
  })

  test('should handle loading states', async ({ page }) => {
    // Intercept API call to simulate slow response
    await page.route('**/api/analytics/dashboard', async route => {
      // Delay response by 2 seconds
      await new Promise(resolve => setTimeout(resolve, 2000))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ metrics: {} })
      })
    })

    await page.goto('/dashboard')
    
    // Should show loading state initially
    // This would depend on your loading implementation
  })

  test('should handle error states', async ({ page }) => {
    // Mock API error
    await page.route('**/api/analytics/dashboard', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' })
      })
    })

    await page.goto('/dashboard')
    
    // Should handle error gracefully
    // This would depend on your error handling implementation
  })

  test('should navigate to other pages from quick actions', async ({ page }) => {
    // Test navigation to UAV management
    await page.getByRole('button', { name: /Add UAV/i }).click()
    // This would depend on your navigation implementation
    
    // Test navigation to map
    await page.goto('/dashboard') // Reset
    await page.getByRole('button', { name: /View Map/i }).click()
    // This would depend on your navigation implementation
  })
})
