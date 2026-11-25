/**
 * AFYA Panic Button – reports "panic" (or any value) when called Y times within X seconds.
 * (C) 2019–2026 Marcin Chuć · MIT
 */
'use strict';

function hhmmss(d = new Date()) {
  return [d.getHours(), d.getMinutes(), d.getSeconds()].map((n) => String(n).padStart(2, '0')).join(':');
}

/**
 * One click. Returns the new state and whether panic was reached.
 * state = { count, timestamp } – timestamp is the start of the current series.
 */
function click(state, now, windowMs, needed) {
  const s = state && typeof state === 'object' ? { ...state } : {};
  if (typeof s.count !== 'number') s.count = 0;
  if (typeof s.timestamp !== 'number') s.timestamp = now;

  if (s.timestamp + windowMs > now) {
    s.count += 1;
  } else {
    // too late – a new series starts with this click
    s.count = 1;
    s.timestamp = now;
  }
  if (s.count >= needed) {
    return { state: { count: 0, timestamp: now }, panic: true };
  }
  return { state: s, panic: false };
}

module.exports = function (RED) {
  function AFYAPanicButton(config) {
    RED.nodes.createNode(this, config);
    const node = this;

    // legacy nodes (no scope saved) keep using flow context
    const scope = config.scope === 'global' ? 'global' : 'flow';
    let name = String(config.variableName || '').trim();
    if (!name) name = `AFYA_panic_${node.id}`;
    const { key, store } = RED.util.parseContextStore(name);
    const ctx = () => node.context()[scope];

    const seconds = Math.abs(Number(config.timeToClick)) || 10;
    const needed = Math.max(1, Math.round(Math.abs(Number(config.howManyTimesToClick))) || 5);
    const answerPanic = config.answerPanic === undefined || config.answerPanic === '' ? 'panic' : config.answerPanic;
    const answerDontPanic =
      config.answerDontPanic === undefined || config.answerDontPanic === '' ? 'dont_panic' : config.answerDontPanic;

    node.status({ fill: 'grey', shape: 'ring', text: `${needed}× in ${seconds} s · ${scope}.${key}` });

    node.on('input', (msg, send, done) => {
      const now = Date.now();
      const result = click(ctx().get(key, store), now, seconds * 1000, needed);
      ctx().set(key, result.state, store);

      if (result.panic) {
        node.status({ fill: 'red', shape: 'dot', text: `${answerPanic} · ${needed}/${needed} · ${hhmmss()}` });
        msg.payload = { state: answerPanic, count: needed, timestamp: now };
      } else {
        const left = Math.max(0, (result.state.timestamp + seconds * 1000 - now) / 1000);
        node.status({
          fill: 'green',
          shape: 'ring',
          text: `${answerDontPanic} · ${result.state.count}/${needed} · ${left.toFixed(1)} s left · ${hhmmss()}`,
        });
        msg.payload = { state: answerDontPanic, count: result.state.count, timestamp: result.state.timestamp };
      }
      send(msg);
      done();
    });
  }

  RED.nodes.registerType('afya-panic-button', AFYAPanicButton);
};

module.exports.click = click;
