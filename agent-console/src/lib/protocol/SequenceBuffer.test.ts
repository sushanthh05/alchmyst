import { SequenceBuffer } from './SequenceBuffer';
import { ServerMessage } from './types';

// Helper to create a fake event for testing
function createEvent(seq: number): ServerMessage {
  // We mock a simple TOKEN event. Only seq matters for ordering.
  return { type: 'TOKEN', seq, text: 'test' } as any;
}

function runTests() {
  console.log('Running SequenceBuffer Tests...');
  let passed = 0;
  let total = 0;

  function assertEqual(name: string, actual: number[], expected: number[]) {
    total++;
    const match = actual.length === expected.length && actual.every((v, i) => v === expected[i]);
    if (match) {
      console.log(`✅ [${name}] Passed`);
      passed++;
    } else {
      console.error(`❌ [${name}] Failed. Expected [${expected}], got [${actual}]`);
    }
  }

  // --- Test 1: 1, 2, 3 (In order) ---
  let buffer = new SequenceBuffer();
  let res1 = [
    ...buffer.push(createEvent(1)),
    ...buffer.push(createEvent(2)),
    ...buffer.push(createEvent(3)),
  ].map(e => e.seq);
  assertEqual('Test 1 (1, 2, 3)', res1, [1, 2, 3]);

  // --- Test 2: 3, 1, 2 (Out of order) ---
  buffer = new SequenceBuffer();
  let res2: ServerMessage[] = [];
  res2.push(...buffer.push(createEvent(3))); // buffers 3
  res2.push(...buffer.push(createEvent(1))); // returns 1
  res2.push(...buffer.push(createEvent(2))); // returns 2, 3
  assertEqual('Test 2 (3, 1, 2)', res2.map(e => e.seq), [1, 2, 3]);

  // --- Test 3: 1, 2, 2, 3 (Duplicates) ---
  buffer = new SequenceBuffer();
  let res3: ServerMessage[] = [];
  res3.push(...buffer.push(createEvent(1))); // returns 1
  res3.push(...buffer.push(createEvent(2))); // returns 2
  res3.push(...buffer.push(createEvent(2))); // returns nothing (duplicate)
  res3.push(...buffer.push(createEvent(3))); // returns 3
  assertEqual('Test 3 (1, 2, 2, 3)', res3.map(e => e.seq), [1, 2, 3]);

  // --- Test 4: 1, 3 then 2 (Gap filling) ---
  buffer = new SequenceBuffer();
  let step1 = buffer.push(createEvent(1)).map(e => e.seq);
  let step2 = buffer.push(createEvent(3)).map(e => e.seq);
  let step3 = buffer.push(createEvent(2)).map(e => e.seq);
  assertEqual('Test 4.1 (Push 1)', step1, [1]);
  assertEqual('Test 4.2 (Push 3)', step2, []);
  assertEqual('Test 4.3 (Push 2)', step3, [2, 3]);

  console.log(`\nResults: ${passed}/${total} tests passed.\n`);
  
  if (passed !== total) {
    process.exit(1);
  }
}

// Auto-run if executed directly
if (require.main === module) {
  runTests();
}
