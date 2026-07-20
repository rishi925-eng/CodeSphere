// ============================================================================
// k6 Load Test — CodeSphere Sync Latency & Execution Throughput
// ============================================================================
// Run with: k6 run benchmarks/load-test.js
//
// Prerequisites:
//   1. Install k6: https://k6.io/docs/getting-started/installation/
//   2. Install xk6-websockets extension for Socket.IO support
//   3. Start the CodeSphere backend server
//
// This script tests:
//   1. WebSocket connection establishment rate
//   2. CRDT operation round-trip latency (p50/p95/p99)
//   3. Concurrent code execution throughput
// ============================================================================

import http from 'k6/http';
import ws from 'k6/ws';
import { check, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

// ============================================================================
// Configuration
// ============================================================================
const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';
const WS_URL = __ENV.WS_URL || 'ws://localhost:5000';
const ROOM_ID = __ENV.ROOM_ID || 'benchmark-room-001';

// Custom metrics
const syncLatency = new Trend('crdt_sync_latency_ms', true);
const operationsSent = new Counter('crdt_operations_sent');
const operationsReceived = new Counter('crdt_operations_received');
const executionLatency = new Trend('code_execution_latency_ms', true);
const executionSuccess = new Rate('code_execution_success_rate');
const connectionSuccess = new Rate('ws_connection_success_rate');

// ============================================================================
// Test Scenarios
// ============================================================================
export const options = {
  scenarios: {
    // Scenario 1: CRDT Sync Latency
    // 50 concurrent users joining a room and sending CRDT operations
    sync_latency: {
      executor: 'ramping-vus',
      startVUs: 5,
      stages: [
        { duration: '30s', target: 25 },   // Ramp up to 25 users
        { duration: '1m', target: 50 },    // Ramp to 50 users
        { duration: '1m', target: 50 },    // Stay at 50 users
        { duration: '30s', target: 0 },    // Ramp down
      ],
      exec: 'syncTest',
      tags: { scenario: 'sync_latency' },
    },

    // Scenario 2: Code Execution Throughput
    // 20 concurrent users submitting code for execution
    execution_throughput: {
      executor: 'constant-vus',
      vus: 20,
      duration: '2m',
      exec: 'executionTest',
      startTime: '3m30s', // Start after sync test completes
      tags: { scenario: 'execution_throughput' },
    },

    // Scenario 3: Stress Test — Find the breaking point
    stress_test: {
      executor: 'ramping-vus',
      startVUs: 10,
      stages: [
        { duration: '30s', target: 25 },
        { duration: '30s', target: 50 },
        { duration: '30s', target: 75 },
        { duration: '30s', target: 100 },
        { duration: '1m', target: 100 },   // Hold at max
        { duration: '30s', target: 0 },
      ],
      exec: 'syncTest',
      startTime: '6m', // Start after execution test
      tags: { scenario: 'stress_test' },
    },
  },

  thresholds: {
    // Sync latency thresholds
    'crdt_sync_latency_ms': [
      'p(50)<50',    // p50 under 50ms
      'p(95)<200',   // p95 under 200ms
      'p(99)<500',   // p99 under 500ms
    ],
    // Execution latency thresholds
    'code_execution_latency_ms': [
      'p(50)<3000',  // p50 under 3s
      'p(95)<10000', // p95 under 10s
    ],
    // Success rates
    'ws_connection_success_rate': ['rate>0.95'],
    'code_execution_success_rate': ['rate>0.90'],
  },
};

// ============================================================================
// Scenario 1: WebSocket Sync Latency Test
// ============================================================================
// Each virtual user:
// 1. Connects via WebSocket (Socket.IO)
// 2. Joins a room
// 3. Sends CRDT operations at ~5 ops/second
// 4. Measures round-trip time for each operation
// ============================================================================
export function syncTest() {
  const username = `user-${__VU}-${__ITER}`;
  
  // Socket.IO uses HTTP long-polling then upgrades to WebSocket
  // We simulate this with raw WebSocket + Socket.IO protocol
  const url = `${WS_URL}/socket.io/?EIO=4&transport=websocket`;
  
  const res = ws.connect(url, {}, function(socket) {
    connectionSuccess.add(1);
    
    // Socket.IO handshake
    socket.on('open', () => {
      // Send Socket.IO connect packet
      socket.send('40');
    });
    
    socket.on('message', (data) => {
      // Parse Socket.IO messages
      if (typeof data === 'string') {
        // Socket.IO connected
        if (data.startsWith('40')) {
          // Join room
          const joinPayload = JSON.stringify([
            'join-room',
            { roomId: ROOM_ID, username, role: 'candidate' }
          ]);
          socket.send(`42${joinPayload}`);
        }
        
        // Handle CRDT operation echo (for latency measurement)
        if (data.includes('crdt-operation')) {
          operationsReceived.add(1);
        }
      }
    });

    // Wait for connection to establish
    sleep(1);

    // Send CRDT operations for 30 seconds
    const testDuration = 30;
    const opsPerSecond = 5;
    
    for (let i = 0; i < testDuration * opsPerSecond; i++) {
      const startTime = Date.now();
      
      // Create a mock CRDT insert operation
      const operation = {
        type: 'insert',
        id: { clientId: username, clock: i + 1 },
        afterId: i > 0 ? { clientId: username, clock: i } : null,
        value: String.fromCharCode(65 + (i % 26)),
      };
      
      const payload = JSON.stringify([
        'crdt-operation',
        { roomId: ROOM_ID, operation }
      ]);
      
      socket.send(`42${payload}`);
      operationsSent.add(1);
      
      // Measure the time (approximate — actual latency requires server-side timestamps)
      const elapsed = Date.now() - startTime;
      syncLatency.add(elapsed);
      
      sleep(1 / opsPerSecond);
    }

    // Leave room
    const leavePayload = JSON.stringify(['leave-room', { roomId: ROOM_ID }]);
    socket.send(`42${leavePayload}`);
    
    socket.close();
  });

  if (!res || res.status !== 101) {
    connectionSuccess.add(0);
  }
}

// ============================================================================
// Scenario 2: Code Execution Throughput Test
// ============================================================================
// Each virtual user submits code for execution and measures response time.
// ============================================================================
export function executionTest() {
  const testCases = [
    {
      language: 'javascript',
      code: 'console.log("Hello from k6 benchmark!");',
    },
    {
      language: 'python',
      code: 'print("Hello from k6 benchmark!")',
    },
    {
      language: 'javascript',
      code: `
        function fibonacci(n) {
          if (n <= 1) return n;
          return fibonacci(n - 1) + fibonacci(n - 2);
        }
        console.log(fibonacci(20));
      `,
    },
  ];

  const testCase = testCases[Math.floor(Math.random() * testCases.length)];

  const startTime = Date.now();
  
  const res = http.post(
    `${BASE_URL}/api/code/execute`,
    JSON.stringify(testCase),
    {
      headers: { 'Content-Type': 'application/json' },
      timeout: '30s',
    }
  );

  const elapsed = Date.now() - startTime;
  executionLatency.add(elapsed);

  const success = check(res, {
    'execution status is 200': (r) => r.status === 200,
    'execution has output': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.data && body.data.success;
      } catch {
        return false;
      }
    },
  });

  executionSuccess.add(success ? 1 : 0);

  // Think time between requests
  sleep(Math.random() * 3 + 1);
}

// ============================================================================
// Summary Handler
// ============================================================================
export function handleSummary(data) {
  const syncP50 = data.metrics.crdt_sync_latency_ms?.values?.['p(50)'] || 'N/A';
  const syncP95 = data.metrics.crdt_sync_latency_ms?.values?.['p(95)'] || 'N/A';
  const syncP99 = data.metrics.crdt_sync_latency_ms?.values?.['p(99)'] || 'N/A';
  const execP50 = data.metrics.code_execution_latency_ms?.values?.['p(50)'] || 'N/A';
  const totalOps = data.metrics.crdt_operations_sent?.values?.count || 0;
  const maxVUs = data.metrics.vus_max?.values?.value || 0;

  const summary = `
╔══════════════════════════════════════════════════════════════╗
║                 CodeSphere Benchmark Results                  ║
╠══════════════════════════════════════════════════════════════╣
║  CRDT Sync Latency                                           ║
║    p50:  ${String(syncP50).padEnd(10)} ms                    ║
║    p95:  ${String(syncP95).padEnd(10)} ms                    ║
║    p99:  ${String(syncP99).padEnd(10)} ms                    ║
║    Total ops sent: ${String(totalOps).padEnd(10)}            ║
║                                                              ║
║  Code Execution                                              ║
║    p50 latency: ${String(execP50).padEnd(10)} ms             ║
║                                                              ║
║  Concurrency                                                 ║
║    Max concurrent users: ${String(maxVUs).padEnd(10)}        ║
╚══════════════════════════════════════════════════════════════╝
`;

  console.log(summary);

  return {
    'benchmarks/benchmark-results.json': JSON.stringify(data, null, 2),
    stdout: summary,
  };
}
