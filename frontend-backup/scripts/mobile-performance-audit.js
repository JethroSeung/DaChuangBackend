#!/usr/bin/env node

/**
 * Mobile Performance Audit Script
 * 
 * This script runs comprehensive performance audits specifically for mobile devices
 * using Lighthouse and custom metrics collection.
 */

const lighthouse = require('lighthouse')
const chromeLauncher = require('chrome-launcher')
const fs = require('fs').promises
const path = require('path')

// Configuration for mobile audits
const MOBILE_CONFIG = {
  extends: 'lighthouse:default',
  settings: {
    formFactor: 'mobile',
    throttling: {
      rttMs: 150,
      throughputKbps: 1.6 * 1024,
      cpuSlowdownMultiplier: 4,
      requestLatencyMs: 150,
      downloadThroughputKbps: 1.6 * 1024,
      uploadThroughputKbps: 750,
    },
    screenEmulation: {
      mobile: true,
      width: 375,
      height: 667,
      deviceScaleFactor: 2,
      disabled: false,
    },
    emulatedUserAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1',
  },
}

// URLs to audit
const URLS_TO_AUDIT = [
  'http://localhost:3000',
  'http://localhost:3000/dashboard',
  'http://localhost:3000/uavs',
  'http://localhost:3000/map',
  'http://localhost:3000/battery',
]

// Performance thresholds for mobile
const PERFORMANCE_THRESHOLDS = {
  'first-contentful-paint': 2000, // 2 seconds
  'largest-contentful-paint': 3000, // 3 seconds
  'first-input-delay': 100, // 100ms
  'cumulative-layout-shift': 0.1, // 0.1
  'speed-index': 3000, // 3 seconds
  'interactive': 4000, // 4 seconds
  'total-blocking-time': 300, // 300ms
}

async function launchChrome() {
  return await chromeLauncher.launch({
    chromeFlags: [
      '--headless',
      '--disable-gpu',
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--disable-extensions',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
    ],
  })
}

async function runLighthouseAudit(url, chrome) {
  const options = {
    logLevel: 'info',
    output: 'json',
    onlyCategories: ['performance', 'accessibility', 'best-practices'],
    port: chrome.port,
  }

  const runnerResult = await lighthouse(url, options, MOBILE_CONFIG)
  return runnerResult
}

function analyzePerformanceMetrics(lhr) {
  const metrics = lhr.audits
  const results = {
    url: lhr.finalUrl,
    timestamp: new Date().toISOString(),
    scores: {
      performance: lhr.categories.performance.score * 100,
      accessibility: lhr.categories.accessibility.score * 100,
      bestPractices: lhr.categories['best-practices'].score * 100,
    },
    metrics: {},
    issues: [],
    recommendations: [],
  }

  // Extract key metrics
  Object.keys(PERFORMANCE_THRESHOLDS).forEach(metricKey => {
    if (metrics[metricKey]) {
      const metric = metrics[metricKey]
      const value = metric.numericValue || metric.displayValue
      const threshold = PERFORMANCE_THRESHOLDS[metricKey]
      
      results.metrics[metricKey] = {
        value: value,
        threshold: threshold,
        passed: value <= threshold,
        score: metric.score,
      }

      if (value > threshold) {
        results.issues.push({
          metric: metricKey,
          value: value,
          threshold: threshold,
          severity: value > threshold * 1.5 ? 'high' : 'medium',
        })
      }
    }
  })

  // Generate recommendations
  if (results.metrics['first-contentful-paint']?.value > 1500) {
    results.recommendations.push({
      category: 'Loading Performance',
      issue: 'Slow First Contentful Paint',
      suggestion: 'Optimize critical rendering path, reduce server response time, enable compression',
      priority: 'high',
    })
  }

  if (results.metrics['cumulative-layout-shift']?.value > 0.1) {
    results.recommendations.push({
      category: 'Visual Stability',
      issue: 'High Cumulative Layout Shift',
      suggestion: 'Add size attributes to images, reserve space for dynamic content, avoid inserting content above existing content',
      priority: 'high',
    })
  }

  if (results.metrics['total-blocking-time']?.value > 200) {
    results.recommendations.push({
      category: 'Interactivity',
      issue: 'High Total Blocking Time',
      suggestion: 'Reduce JavaScript execution time, split large bundles, remove unused code',
      priority: 'medium',
    })
  }

  // Check for mobile-specific issues
  if (metrics['viewport']) {
    if (!metrics['viewport'].passed) {
      results.issues.push({
        metric: 'viewport',
        issue: 'Missing or incorrect viewport meta tag',
        severity: 'high',
      })
    }
  }

  if (metrics['font-size']) {
    if (!metrics['font-size'].passed) {
      results.issues.push({
        metric: 'font-size',
        issue: 'Text too small for mobile devices',
        severity: 'medium',
      })
    }
  }

  if (metrics['tap-targets']) {
    if (!metrics['tap-targets'].passed) {
      results.issues.push({
        metric: 'tap-targets',
        issue: 'Touch targets too small or too close together',
        severity: 'high',
      })
    }
  }

  return results
}

function generateReport(allResults) {
  const report = {
    summary: {
      totalUrls: allResults.length,
      averagePerformanceScore: 0,
      averageAccessibilityScore: 0,
      totalIssues: 0,
      criticalIssues: 0,
    },
    results: allResults,
    recommendations: [],
  }

  // Calculate averages
  const totalPerf = allResults.reduce((sum, result) => sum + result.scores.performance, 0)
  const totalA11y = allResults.reduce((sum, result) => sum + result.scores.accessibility, 0)
  
  report.summary.averagePerformanceScore = Math.round(totalPerf / allResults.length)
  report.summary.averageAccessibilityScore = Math.round(totalA11y / allResults.length)

  // Count issues
  allResults.forEach(result => {
    report.summary.totalIssues += result.issues.length
    report.summary.criticalIssues += result.issues.filter(issue => issue.severity === 'high').length
  })

  // Aggregate recommendations
  const recommendationMap = new Map()
  allResults.forEach(result => {
    result.recommendations.forEach(rec => {
      const key = rec.category + rec.issue
      if (!recommendationMap.has(key)) {
        recommendationMap.set(key, { ...rec, count: 1 })
      } else {
        recommendationMap.get(key).count++
      }
    })
  })

  report.recommendations = Array.from(recommendationMap.values())
    .sort((a, b) => b.count - a.count)

  return report
}

async function saveReport(report, filename) {
  const reportsDir = path.join(__dirname, '../reports')
  
  try {
    await fs.mkdir(reportsDir, { recursive: true })
  } catch (error) {
    // Directory might already exist
  }

  const filePath = path.join(reportsDir, filename)
  await fs.writeFile(filePath, JSON.stringify(report, null, 2))
  
  console.log(`Report saved to: ${filePath}`)
}

function printSummary(report) {
  console.log('\n📱 Mobile Performance Audit Summary')
  console.log('=====================================')
  console.log(`URLs Audited: ${report.summary.totalUrls}`)
  console.log(`Average Performance Score: ${report.summary.averagePerformanceScore}/100`)
  console.log(`Average Accessibility Score: ${report.summary.averageAccessibilityScore}/100`)
  console.log(`Total Issues Found: ${report.summary.totalIssues}`)
  console.log(`Critical Issues: ${report.summary.criticalIssues}`)

  console.log('\n🔍 Top Issues by URL:')
  report.results.forEach(result => {
    console.log(`\n${result.url}:`)
    console.log(`  Performance: ${result.scores.performance}/100`)
    console.log(`  Accessibility: ${result.scores.accessibility}/100`)
    
    if (result.issues.length > 0) {
      console.log('  Issues:')
      result.issues.forEach(issue => {
        const emoji = issue.severity === 'high' ? '🔴' : '🟡'
        console.log(`    ${emoji} ${issue.metric}: ${issue.issue || `${issue.value} > ${issue.threshold}`}`)
      })
    }
  })

  if (report.recommendations.length > 0) {
    console.log('\n💡 Top Recommendations:')
    report.recommendations.slice(0, 5).forEach((rec, index) => {
      console.log(`${index + 1}. ${rec.category}: ${rec.issue}`)
      console.log(`   ${rec.suggestion}`)
      console.log(`   Priority: ${rec.priority} | Found on ${rec.count} page(s)`)
    })
  }
}

async function main() {
  console.log('🚀 Starting Mobile Performance Audit...')
  
  let chrome
  try {
    chrome = await launchChrome()
    console.log('Chrome launched successfully')

    const allResults = []

    for (const url of URLS_TO_AUDIT) {
      console.log(`\n🔍 Auditing: ${url}`)
      
      try {
        const result = await runLighthouseAudit(url, chrome)
        const analysis = analyzePerformanceMetrics(result.lhr)
        allResults.push(analysis)
        
        console.log(`✅ Performance: ${analysis.scores.performance}/100`)
        console.log(`✅ Accessibility: ${analysis.scores.accessibility}/100`)
        
        if (analysis.issues.length > 0) {
          console.log(`⚠️  Found ${analysis.issues.length} issues`)
        }
      } catch (error) {
        console.error(`❌ Failed to audit ${url}:`, error.message)
      }
    }

    if (allResults.length > 0) {
      const report = generateReport(allResults)
      
      // Save detailed report
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      await saveReport(report, `mobile-performance-${timestamp}.json`)
      
      // Print summary
      printSummary(report)
      
      // Exit with error code if critical issues found
      if (report.summary.criticalIssues > 0) {
        console.log('\n❌ Critical issues found. Please address them before deployment.')
        process.exit(1)
      } else {
        console.log('\n✅ Mobile performance audit completed successfully!')
      }
    } else {
      console.log('❌ No successful audits completed')
      process.exit(1)
    }

  } catch (error) {
    console.error('❌ Audit failed:', error)
    process.exit(1)
  } finally {
    if (chrome) {
      await chrome.kill()
    }
  }
}

// Run the audit if this script is executed directly
if (require.main === module) {
  main().catch(console.error)
}

module.exports = {
  runLighthouseAudit,
  analyzePerformanceMetrics,
  generateReport,
}
