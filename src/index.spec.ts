import { Device } from './devices';
import { RpcHandler } from './rpc';
import shelliesNg from './index';

class TestRpcHandler implements RpcHandler {
  request = jest.fn().mockResolvedValue({ success: true });
  destroy = jest.fn().mockImplementation(() => Promise.resolve());
}

class TestDevice extends Device {
  constructor(id: string) {
    super(id, new TestRpcHandler());
  }
}

describe('ShelliesNg', () => {
  afterEach(() => {
    shelliesNg.removeAllListeners();
    shelliesNg.clear();
  });

  describe('.add()', () => {
    test('adds the given device', () => {
      const device = new TestDevice('abc123');

      shelliesNg.add(device);

      expect(shelliesNg.size).toBe(1);
    });

    test('throws an error when the device has already been added', () => {
      const device1 = new TestDevice('abc123');
      const device2 = new TestDevice('abc123');

      shelliesNg.add(device1);

      expect(() => shelliesNg.add(device2)).toThrow();
    });

    test('emits an `add` event', () => {
      const listener = jest.fn();
      shelliesNg.on('add', listener);

      const device = new TestDevice('abc123');

      shelliesNg.add(device);

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith(device);
    });
  });

  describe('.has()', () => {
    test('returns false for unknown devices', () => {
      expect(shelliesNg.has(new TestDevice('abc123'))).toBe(false);
      expect(shelliesNg.has('abc123')).toBe(false);
    });

    test('returns true for known devices', () => {
      shelliesNg.add(new TestDevice('abc123'));

      expect(shelliesNg.has(new TestDevice('abc123'))).toBe(true);
      expect(shelliesNg.has('abc123')).toBe(true);
    });
  });

  describe('.get()', () => {
    test('returns a device when found', () => {
      const device = new TestDevice('abc123');

      shelliesNg.add(device);

      expect(shelliesNg.get('abc123')).toBe(device);
    });

    test('returns undefined when no device was found', () => {
      expect(shelliesNg.get('abc123')).toBeUndefined();
    });
  });

  describe('.forEach()', () => {
    test('executes the callback for each device', () => {
      const device1 = new TestDevice('abc123');
      const device2 = new TestDevice('abc124');
      const device3 = new TestDevice('abc125');

      shelliesNg.add(device1);
      shelliesNg.add(device2);
      shelliesNg.add(device3);

      const callback = jest.fn();

      shelliesNg.forEach(callback);

      expect(callback).toHaveBeenCalledTimes(3);
      expect(callback).toHaveBeenNthCalledWith(1, device1, 'abc123', shelliesNg);
      expect(callback).toHaveBeenNthCalledWith(2, device2, 'abc124', shelliesNg);
      expect(callback).toHaveBeenNthCalledWith(3, device3, 'abc125', shelliesNg);
    });

    test('sets this to the given object', () => {
      shelliesNg.add(new TestDevice('abc123'));

      const that = {};

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      shelliesNg.forEach(function(this: any) {
        expect(this).toBe(that);
      }, that);
    });
  });

  describe('.entries()', () => {
    test('returns a valid iterator', () => {
      const device1 = new TestDevice('abc123');
      const device2 = new TestDevice('abc124');
      const device3 = new TestDevice('abc125');

      shelliesNg.add(device1);
      shelliesNg.add(device2);
      shelliesNg.add(device3);

      const callback = jest.fn();

      for (const [id, device] of shelliesNg.entries()) {
        callback(id, device);
      }

      expect(callback).toHaveBeenCalledTimes(3);
      expect(callback).toHaveBeenNthCalledWith(1, 'abc123', device1);
      expect(callback).toHaveBeenNthCalledWith(2, 'abc124', device2);
      expect(callback).toHaveBeenNthCalledWith(3, 'abc125', device3);
    });
  });

  describe('.keys()', () => {
    test('returns a valid iterator', () => {
      const device1 = new TestDevice('abc123');
      const device2 = new TestDevice('abc124');
      const device3 = new TestDevice('abc125');

      shelliesNg.add(device1);
      shelliesNg.add(device2);
      shelliesNg.add(device3);

      const callback = jest.fn();

      for (const id of shelliesNg.keys()) {
        callback(id);
      }

      expect(callback).toHaveBeenCalledTimes(3);
      expect(callback).toHaveBeenNthCalledWith(1, 'abc123');
      expect(callback).toHaveBeenNthCalledWith(2, 'abc124');
      expect(callback).toHaveBeenNthCalledWith(3, 'abc125');
    });
  });

  describe('.values()', () => {
    test('returns a valid iterator', () => {
      const device1 = new TestDevice('abc123');
      const device2 = new TestDevice('abc124');
      const device3 = new TestDevice('abc125');

      shelliesNg.add(device1);
      shelliesNg.add(device2);
      shelliesNg.add(device3);

      const callback = jest.fn();

      for (const device of shelliesNg.values()) {
        callback(device);
      }

      expect(callback).toHaveBeenCalledTimes(3);
      expect(callback).toHaveBeenNthCalledWith(1, device1);
      expect(callback).toHaveBeenNthCalledWith(2, device2);
      expect(callback).toHaveBeenNthCalledWith(3, device3);
    });
  });

  describe('.[Symbol.iterator]()', () => {
    test('returns a valid iterator', () => {
      const device1 = new TestDevice('abc123');
      const device2 = new TestDevice('abc124');
      const device3 = new TestDevice('abc125');

      shelliesNg.add(device1);
      shelliesNg.add(device2);
      shelliesNg.add(device3);

      const callback = jest.fn();

      for (const device of shelliesNg) {
        callback(device);
      }

      expect(callback).toHaveBeenCalledTimes(3);
      expect(callback).toHaveBeenNthCalledWith(1, device1);
      expect(callback).toHaveBeenNthCalledWith(2, device2);
      expect(callback).toHaveBeenNthCalledWith(3, device3);
    });
  });

  describe('.delete()', () => {
    test('removes the given device', () => {
      const device1 = new TestDevice('abc123');
      const device2 = new TestDevice('abc124');

      shelliesNg.add(device1);
      shelliesNg.add(device2);

      expect(shelliesNg.delete(device1)).toBe(true);
      expect(shelliesNg.size).toBe(1);
      expect(shelliesNg.has(device1)).toBe(false);

      expect(shelliesNg.delete('abc124')).toBe(true);
      expect(shelliesNg.size).toBe(0);
      expect(shelliesNg.has(device2)).toBe(false);
    });

    test('emits a `remove` event', () => {
      const device = new TestDevice('abc123');

      shelliesNg.add(device);

      const listener = jest.fn();
      shelliesNg.on('remove', listener);

      shelliesNg.delete(device);

      expect(listener).toHaveBeenCalledWith(device);
    });

    test('returns false for unknown devices', () => {
      expect(shelliesNg.delete(new TestDevice('abc123'))).toBe(false);
      expect(shelliesNg.delete('abc123')).toBe(false);
    });

    test('emits no `remove` event for unknown devices', () => {
      const listener = jest.fn();
      shelliesNg.on('remove', listener);

      shelliesNg.delete('abc123');

      expect(listener).not.toHaveBeenCalledTimes(1);
    });
  });

  describe('.clear()', () => {
    test('removes all devices', () => {
      shelliesNg.add(new TestDevice('abc123'));
      shelliesNg.add(new TestDevice('abc124'));
      shelliesNg.add(new TestDevice('abc125'));

      shelliesNg.clear();

      expect(shelliesNg.size).toBe(0);
    });

    test('emits a `remove` event for each device', () => {
      const device1 = new TestDevice('abc123');
      const device2 = new TestDevice('abc124');
      const device3 = new TestDevice('abc125');

      shelliesNg.add(device1);
      shelliesNg.add(device2);
      shelliesNg.add(device3);

      const listener = jest.fn();
      shelliesNg.on('remove', listener);

      shelliesNg.clear();

      expect(listener).toHaveBeenCalledTimes(3);
      expect(listener).toHaveBeenNthCalledWith(1, device1);
      expect(listener).toHaveBeenNthCalledWith(2, device2);
      expect(listener).toHaveBeenNthCalledWith(3, device3);
    });
  });
});
