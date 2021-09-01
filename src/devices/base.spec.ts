import { Component, ComponentName } from '../components';
import { component, Device } from './base';
import { RpcHandler } from '../rpc';

class TestRpcHandler implements RpcHandler {
  request = jest.fn().mockResolvedValue({ success: true });
  destroy = jest.fn().mockImplementation(() => Promise.resolve());
}

class TestComponent extends Component {
  constructor() {
    super('Test', new TestRpcHandler());
  }
}

class TestDevice extends Device {
  @component()
  readonly component1 = new TestComponent();

  @component('shelly')
  readonly component2 = new TestComponent();

  getComponents(): Map<ComponentName, string> {
    return this.components;
  }
}

describe('Device', () => {
  let device = new TestDevice('abc123');

  beforeEach(() => {
    device = new TestDevice('abc123');
  });

  describe('.components', () => {
    test('has the defined components', () => {
      const cs = device.getComponents();

      expect(cs.size).toBe(2);
      expect(cs.has('component1')).toBe(true);
      expect(cs.has('component2')).toBe(false);
      expect(cs.has('shelly')).toBe(true);
    });
  });

  describe('.hasComponent()', () => {
    test('returns false for unknown components', () => {
      expect(device.hasComponent('component2')).toBe(false);
      expect(device.hasComponent('component3')).toBe(false);
    });

    test('returns true for known components', () => {
      expect(device.hasComponent('component1')).toBe(true);
      expect(device.hasComponent('shelly')).toBe(true);
    });
  });

  describe('.getComponent()', () => {
    test('returns a component when found', () => {
      expect(device.getComponent('component1')).toBe(device.component1);
      expect(device.getComponent('shelly')).toBe(device.component2);
    });

    test('returns undefined when no component was found', () => {
      expect(device.getComponent('component2')).toBeUndefined();
    });
  });

  describe('.[Symbol.iterator]()', () => {
    test('returns a valid iterator', () => {
      const callback = jest.fn();

      for (const [name, component] of device) {
        callback(name, component);
      }

      expect(callback).toHaveBeenCalledTimes(2);
      expect(callback).toHaveBeenNthCalledWith(1, 'component1', device.component1);
      expect(callback).toHaveBeenNthCalledWith(2, 'shelly', device.component2);
    });
  });
});
