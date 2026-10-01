// AI.json must mirror ww-config.js (properties, events, actions, icon options). Run: npm test
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import config from '../ww-config.js';
import { ICON_OPTIONS } from '../src/icons/index.js';

const ai = JSON.parse(readFileSync(new URL('../AI.json', import.meta.url), 'utf8'));
const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

assert.equal(ai.metadata.name, pkg.name, 'metadata.name === package name');
assert.deepEqual(ai.properties.map(p => p.name).sort(), Object.keys(config.properties).sort(), 'properties');
assert.deepEqual(ai.events.map(e => e.name).sort(), config.triggerEvents.map(e => e.name).sort(), 'events');
assert.deepEqual(ai.actions.map(a => a.actionName).sort(), config.actions.map(a => a.action).sort(), 'actions');
assert.deepEqual(
    ai.properties.find(p => p.name === 'icon').options,
    ICON_OPTIONS.map(o => o.value),
    'icon options'
);
assert.deepEqual(
    ai.properties.find(p => p.name === 'trigger').options,
    config.properties.trigger.options.options.map(o => o.value),
    'trigger options'
);
console.log('AI.json: mirrors ww-config.js');
