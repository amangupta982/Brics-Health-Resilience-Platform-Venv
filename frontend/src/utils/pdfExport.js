import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import api from '../services/api.js'

// ─────────────────────────────────────────────────────────────────────────────
// Common PDF Header & Footer Styling
// ─────────────────────────────────────────────────────────────────────────────

function drawPdfHeader(doc, title, subtitle) {
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 10

  // Navy banner
  doc.setFillColor(14, 22, 38)
  doc.rect(0, 0, pageWidth, 22, 'F')

  // Cyan accent line
  doc.setFillColor(2, 132, 199)
  doc.rect(0, 21.2, pageWidth, 0.8, 'F')

  // Header Title
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('BRICS HEALTH RESILIENCE PLATFORM', margin, 9)

  // Subtitle
  doc.setTextColor(56, 189, 248)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.text(subtitle || 'INTELLIGENCE & OPERATIONS COMMAND DOSSIER', margin, 14.5)

  // Timestamp & Security
  doc.setTextColor(203, 213, 225)
  doc.setFontSize(6.5)
  const nowStr = new Date().toLocaleString()
  doc.text(`Generated: ${nowStr}`, pageWidth - margin, 9, { align: 'right' })
  doc.text('Classification: OFFICIAL USE ONLY', pageWidth - margin, 14.5, { align: 'right' })

  // Report Section Heading if provided
  if (title) {
    doc.setTextColor(15, 23, 42)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10.5)
    doc.text(title, margin, 27)
    return 30
  }

  return 24
}

function drawPdfFooter(doc, pageNum = 1, totalPages = 1) {
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 10

  doc.setDrawColor(226, 232, 240)
  doc.line(margin, pageHeight - 9, pageWidth - margin, pageHeight - 9)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6)
  doc.setTextColor(148, 163, 184)
  doc.text('CONFIDENTIAL • BRICS Health Resilience Platform • Live Slide Operations Snapshot', margin, pageHeight - 4.5)
  doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - margin, pageHeight - 4.5, { align: 'right' })
}

// ─────────────────────────────────────────────────────────────────────────────
// Route Title & Subtitle Mapping
// ─────────────────────────────────────────────────────────────────────────────

function getRouteMetadata(pathname = window.location.pathname) {
  const path = pathname.replace(/\/$/, '') || '/'

  if (path === '/' || path === '') {
    return {
      title: 'Executive Healthcare Operations & Resilience Overview',
      subtitle: 'STATE HEALTH OPERATIONS CENTRE • EXECUTIVE BRIEFING',
      prefix: 'brics-overview-report'
    }
  } else if (path === '/map') {
    return {
      title: 'Primary Healthcare Centres (PHC) Geospatial GIS Directory',
      subtitle: 'GIS SPATIAL AUDIT & FACILITY NETWORK DOSSIER',
      prefix: 'brics-phc-map-report'
    }
  } else if (path === '/stockout') {
    return {
      title: '7-Day Medicine Stockout Prediction & Risk Dossier',
      subtitle: 'PREDICTIVE CLINICAL INVENTORY RISK AUDIT',
      prefix: 'brics-stockout-report'
    }
  } else if (path === '/demand') {
    return {
      title: 'Pharmaceutical Demand Forecast & Multi-Horizon Projection',
      subtitle: 'AI TIME-SERIES CLINICAL CONSUMPTION PLANNING',
      prefix: 'brics-demand-forecast-report'
    }
  } else if (path === '/emergency') {
    return {
      title: 'Epidemic Outbreak & Supply Shock Simulation Dossier',
      subtitle: 'CRISIS STRESS-TEST & EPIDEMIC PARAMETER SIMULATION',
      prefix: 'brics-emergency-simulation-report'
    }
  } else if (path === '/redistribution') {
    return {
      title: 'Inter-Facility Stock Rebalancing & Redistribution Order',
      subtitle: 'OR-TOOLS LINEAR PROGRAMMING OPTIMIZED LOGISTICS DISPATCH',
      prefix: 'brics-redistribution-report'
    }
  } else if (path === '/resilience') {
    return {
      title: 'District Health Infrastructure Resilience Index',
      subtitle: 'REGIONAL CAPACITY BENCHMARK & VULNERABILITY AUDIT',
      prefix: 'brics-district-resilience-report'
    }
  } else if (path === '/models') {
    return {
      title: 'AI & Machine Learning Model Performance Audit',
      subtitle: 'CHAMPION VS CHALLENGER ML BENCHMARK & GOVERNANCE',
      prefix: 'brics-model-benchmark-report'
    }
  } else if (path === '/federated') {
    return {
      title: 'Sovereign Edge Federated Learning Privacy & Training Audit',
      subtitle: 'FLOWER FEDAVG MULTI-SOVEREIGN ZERO DATA EGRESS PROTOCOL',
      prefix: 'brics-federated-learning-report'
    }
  } else if (path === '/alerts') {
    return {
      title: 'Critical Operational Incidents & Network Anomaly Log',
      subtitle: 'REAL-TIME CLINICAL & LOGISTICAL EARLY WARNING DOSSIER',
      prefix: 'brics-alerts-incident-report'
    }
  }

  return {
    title: 'Operational Healthcare Intelligence Dossier',
    subtitle: 'BRICS HEALTH OPERATIONS & RESILIENCE GRID',
    prefix: 'brics-report'
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Live Slide / Screen DOM Capture (Gives Exact On-Screen Content)
// ─────────────────────────────────────────────────────────────────────────────

export async function captureSlideToPdf({
  element = document.querySelector('main') || document.body,
  title = '',
  subtitle = 'LIVE SCREEN SNAPSHOT & OPERATIONAL REPORT',
  fileNamePrefix = 'brics-slide-report'
} = {}) {
  if (!element) {
    throw new Error('No view element found to capture.')
  }

  // Detect dark vs light mode
  const isDark = document.documentElement.classList.contains('dark') ||
                 document.body.classList.contains('dark') ||
                 Boolean(element.closest('.bg-\\[\\#090e18\\]') || element.querySelector('.bg-\\[\\#0e1626\\]'))

  const backgroundColor = isDark ? '#090e18' : '#f8fafc'

  // High-resolution canvas capture of the visible slide
  const canvas = await html2canvas(element, {
    scale: 2, // 2x crisp retina resolution
    useCORS: true,
    logging: false,
    backgroundColor,
    windowWidth: element.scrollWidth || window.innerWidth,
    ignoreElements: (el) => {
      // Exclude toast alerts
      if (el.getAttribute?.('role') === 'status' || el.classList?.contains('toaster') || el.closest?.('.react-hot-toast')) {
        return true
      }
      // Exclude explicit no-print elements
      if (el.getAttribute?.('data-no-print') === 'true' || el.classList?.contains('no-print')) {
        return true
      }
      return false
    }
  })

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()   // 210mm
  const pageHeight = doc.internal.pageSize.getHeight() // 297mm
  const margin = 10                                    // 10mm margins
  const printWidth = pageWidth - margin * 2           // 190mm

  const headerHeight = 24                              // 24mm header banner
  const footerHeight = 12                              // 12mm footer
  const printableHeight = pageHeight - headerHeight - footerHeight // 261mm

  const canvasWidth = canvas.width
  const canvasHeight = canvas.height

  // Compute how many canvas vertical pixels fit on one page
  const sliceHeightCanvasPx = Math.floor((printableHeight * canvasWidth) / printWidth)
  const totalPages = Math.max(1, Math.ceil(canvasHeight / sliceHeightCanvasPx))

  for (let p = 0; p < totalPages; p++) {
    if (p > 0) {
      doc.addPage()
    }

    // Draw header on each page
    drawPdfHeader(doc, p === 0 ? title : '', subtitle)

    const srcY = p * sliceHeightCanvasPx
    const currentSliceHeightPx = Math.min(canvasHeight - srcY, sliceHeightCanvasPx)

    // Sub-slice canvas to prevent overflow and preserve crisp aspect ratio
    const sliceCanvas = document.createElement('canvas')
    sliceCanvas.width = canvasWidth
    sliceCanvas.height = currentSliceHeightPx

    const ctx = sliceCanvas.getContext('2d')
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height)

    ctx.drawImage(
      canvas,
      0, srcY, canvasWidth, currentSliceHeightPx, // source
      0, 0, canvasWidth, currentSliceHeightPx      // destination
    )

    const sliceData = sliceCanvas.toDataURL('image/jpeg', 0.95)
    const sliceHeightMm = (currentSliceHeightPx * printWidth) / canvasWidth

    const contentStartY = (p === 0 && title) ? 30 : headerHeight + 1
    doc.addImage(sliceData, 'JPEG', margin, contentStartY, printWidth, sliceHeightMm)

    drawPdfFooter(doc, p + 1, totalPages)
  }

  const cleanFileName = `${fileNamePrefix}-${Date.now().toString(36)}.pdf`
  doc.save(cleanFileName)
  return cleanFileName
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Emergency Outbreak Simulation Report
// ─────────────────────────────────────────────────────────────────────────────

export async function generateEmergencyReportPDF({
  result,
  scenarioName = 'Dengue Outbreak',
  scenarioDesc = '',
  patientIncrease = 0,
  supplyDisruption = 0,
} = {}) {
  // If in browser and main view exists, capture the live on-screen simulation slide
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    const mainEl = document.querySelector('main') || document.body
    if (mainEl) {
      try {
        const cleanScenario = (scenarioName || 'crisis').toLowerCase().replace(/\s+/g, '-')
        return await captureSlideToPdf({
          element: mainEl,
          title: `Simulation: ${scenarioName} (+${patientIncrease}% Surge, -${supplyDisruption}% Shock)`,
          subtitle: 'CRISIS STRESS-TEST & EPIDEMIC PARAMETER SIMULATION',
          fileNamePrefix: `brics-simulation-${cleanScenario}`
        })
      } catch (e) {
        console.warn('Canvas slide capture failed, falling back to programmatic PDF generation:', e)
      }
    }
  }

  // Fallback programmatic generation
  if (!result) return

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 14
  const contentWidth = pageWidth - margin * 2

  let y = drawPdfHeader(
    doc,
    'Epidemic Outbreak & Supply Shock Simulation Report',
    'CRISIS RESPONSE & EPIDEMIC STRESS-TESTING DOSSIER'
  )

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(15, 23, 42)
  doc.text('SCENARIO:', margin + 4, y + 6)
  doc.setTextColor(225, 29, 72)
  doc.text(`${scenarioName}`, margin + 30, y + 6)

  y += 20
  drawPdfFooter(doc, 1, 1)

  const cleanScenario = (scenarioName || 'crisis').toLowerCase().replace(/\s+/g, '-')
  const fileName = `brics-simulation-report-${cleanScenario}-${Date.now().toString(36)}.pdf`
  doc.save(fileName)
  return fileName
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Universal Export Dispatcher (Primary: Live Slide Capture with Fallback)
// ─────────────────────────────────────────────────────────────────────────────

export async function exportUniversalReport(pathname = window.location.pathname, context = {}) {
  const meta = getRouteMetadata(pathname)

  // 1. Primary: Capture the exact active screen / slide
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    const mainEl = document.querySelector('main') || document.body
    if (mainEl) {
      try {
        return await captureSlideToPdf({
          element: mainEl,
          title: meta.title,
          subtitle: meta.subtitle,
          fileNamePrefix: meta.prefix
        })
      } catch (err) {
        console.warn('Direct slide capture encountered an issue, generating structured data report:', err)
      }
    }
  }

  // 2. Secondary fallback: programmatic structured report
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  drawPdfHeader(doc, meta.title, meta.subtitle)
  drawPdfFooter(doc, 1, 1)

  const fileName = `${meta.prefix}-${Date.now().toString(36)}.pdf`
  doc.save(fileName)
  return fileName
}
