'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { createRED } = require('./helper');
const panic = require('../afya-panic-button/afya-panic-button.js');

function setup(config) {
  const RED = createRED();
  panic(RED);
  return { RED, node: RED.create('afya-panic-button', config) };
}

test('click: series within the time window', () => {
  let r = panic.click(undefined, 1000, 10000, 3);
  assert.deepEqual([r.state.count, r.panic], [1, false]);
  r = panic.click(r.state, 2000, 10000, 3);
  assert.deepEqual([r.state.count, r.panic], [2, false]);
  r = panic.click(r.state, 3000, 10000, 3);
  assert.equal(r.panic, true);
  assert.deepEqual(r.state, { count: 0, timestamp: 3000 });

  // too slow → a new series
  r = panic.click({ count: 2, timestamp: 0 }, 20000, 10000, 3);
  assert.deepEqual([r.state.count, r.state.timestamp, r.panic], [1, 20000, false]);
});

test('node: panic after N messages, global variable', async () => {
  const { RED, node } = setup({
    variableName: 'remote', scope: 'global', timeToClick: '10', howManyTimesToClick: '3',
    answerPanic: 'ALARM', answerDontPanic: 'calm',
  });
  await node.receive({ topic: 'btn' });
  await node.receive({});
  assert.deepEqual(node.sent.map((m) => m.payload.state), ['calm', 'calm']);
  assert.equal(node.sent[1].payload.count, 2);
  assert.equal(node.sent[0].topic, 'btn');
  assert.equal(RED.context.global.get('remote').count, 2);

  await node.receive({});
  assert.equal(node.sent[2].payload.state, 'ALARM');
  assert.equal(node.lastStatus().fill, 'red');
  assert.equal(RED.context.global.get('remote').count, 0);
});

test('legacy node without scope uses flow; empty name gets a per-node name', async () => {
  let { RED, node } = setup({ variableName: 'old', timeToClick: 10, howManyTimesToClick: 5, answerPanic: 'panic', answerDontPanic: 'no' });
  await node.receive({});
  assert.equal(RED.context.flow.get('old').count, 1);

  ({ RED, node } = setup({ variableName: '', timeToClick: 10, howManyTimesToClick: 5 }));
  await node.receive({});
  assert.equal(RED.context.flow.get('AFYA_panic_n1').count, 1);
  assert.equal(node.sent[0].payload.state, 'dont_panic');
});
