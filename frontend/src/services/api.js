import mockPhcs from './mock_phcs.json'
import mockDistricts from './mock_districts.json'
import mockStats from './mock_stats.json'
import mockResilience from './mock_resilience.json'
import mockModels from './mock_models.json'
import mockAlerts from './mock_alerts.json'
import mockInventory from './mock_inventory.json'

// Demo Mode: Mock delay to simulate network latency
const delay = (ms = 300) => new Promise(res => setTimeout(res, ms));

export const api = {
  getPHCs: () => delay().then(() => mockPhcs.data ?? mockPhcs),
  getDistricts: () => delay().then(() => mockDistricts.data ?? mockDistricts),
  getStatsOverview: () => delay().then(() => mockStats),
  getResilienceScores: () => delay().then(() => mockResilience),
  getModelPerformance: (task) => delay().then(() => mockModels),

  getInventory: (params) => delay().then(() => mockInventory.data ?? mockInventory),
  getAlerts: (params) => delay().then(() => mockAlerts.data ?? mockAlerts),
  checkHealth: () => delay().then(() => ({ status: 'ok', demo_mode: true })),

  predictDemand: (payload) => delay(800).then(() => ({ status: 'success', message: 'Demand predicted successfully (Demo Mode)' })),
  predictStockout: (payload) => delay(800).then(() => ({ status: 'success', message: 'Stockout predicted successfully (Demo Mode)' })),
  simulateEmergency: (payload) => delay(1200).then(() => ({ status: 'success', message: 'Emergency simulation completed (Demo Mode)' })),
  optimizeRedistribution: () => delay(1000).then(() => ({ status: 'success', message: 'Redistribution optimized (Demo Mode)' })),
  getExplanation: (predictionId) => delay().then(() => ({ explanation: 'This is a demo explanation from the mock server.' })),
  trainFederated: (rounds = 5) => delay(2000).then(() => ({ status: 'success', message: `Federated learning completed ${rounds} rounds (Demo Mode)` })),

  invalidateCache: () => {},
}

export default api
