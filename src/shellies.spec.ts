import { Device } from './devices';
import { RpcHandler } from './rpc';
import { Shellies } from './shellies';

class TestRpcHandler extends RpcHandler {
  constructor() {
    super('test');
  }

  connected = true;
  request = jest.fn().mockResolvedValue({ success: true });
  destroy = jest.fn().mockImplementation(() => Promise.resolve());
}

class TestDevice extends Device {
  constructor(id: string) {
    super(
      {
        id,
        mac: id,
      },
      new TestRpcHandler(),
    );
  }
}

describe('Shellies', () => {
  const shellies = new Shellies();

  afterEach(() => {
    shellies.removeAllListeners();
    shellies.clear();
  });

  describe('.add()', () => {
    test('adds the given device', () => {
      const device = new TestDevice('abc123');

      shellies.add(device);

      expect(shellies.size).toBe(1);
    });

    test('throws an error when the device has already been added', () => {
      const device1 = new TestDevice('abc123');
      const device2 = new TestDevice('abc123');

      shellies.add(device1);

      expect(() => shellies.add(device2)).toThrow();
    });

    test('emits an `add` event', () => {
      const listener = jest.fn();
      shellies.on('add', listener);

      const device = new TestDevice('abc123');

      shellies.add(device);

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith(device);
    });
  });

  describe('.has()', () => {
    test('returns false for unknown devices', () => {
      expect(shellies.has(new TestDevice('abc123'))).toBe(false);
      expect(shellies.has('abc123')).toBe(false);
    });

    test('returns true for known devices', () => {
      shellies.add(new TestDevice('abc123'));

      expect(shellies.has(new TestDevice('abc123'))).toBe(true);
      expect(shellies.has('abc123')).toBe(true);
    });
  });

  describe('.get()', () => {
    test('returns a device when found', () => {
      const device = new TestDevice('abc123');

      shellies.add(device);

      expect(shellies.get('abc123')).toBe(device);
    });

    test('returns undefined when no device was found', () => {
      expect(shellies.get('abc123')).toBeUndefined();
    });
  });

  describe('.forEach()', () => {
    test('executes the callback for each device', () => {
      const device1 = new TestDevice('abc123');
      const device2 = new TestDevice('abc124');
      const device3 = new TestDevice('abc125');

      shellies.add(device1);
      shellies.add(device2);
      shellies.add(device3);

      const callback = jest.fn();

      shellies.forEach(callback);

      expect(callback).toHaveBeenCalledTimes(3);
      expect(callback).toHaveBeenNthCalledWith(1, device1, 'abc123', shellies);
      expect(callback).toHaveBeenNthCalledWith(2, device2, 'abc124', shellies);
      expect(callback).toHaveBeenNthCalledWith(3, device3, 'abc125', shellies);
    });

    test('sets this to the given object', () => {
      shellies.add(new TestDevice('abc123'));

      const that = {};

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      shellies.forEach(function(this: any) {
        expect(this).toBe(that);
      }, that);
    });
  });

  describe('.entries()', () => {
    test('returns a valid iterator', () => {
      const device1 = new TestDevice('abc123');
      const device2 = new TestDevice('abc124');
      const device3 = new TestDevice('abc125');

      shellies.add(device1);
      shellies.add(device2);
      shellies.add(device3);

      const callback = jest.fn();

      for (const [id, device] of shellies.entries()) {
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

      shellies.add(device1);
      shellies.add(device2);
      shellies.add(device3);

      const callback = jest.fn();

      for (const id of shellies.keys()) {
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

      shellies.add(device1);
      shellies.add(device2);
      shellies.add(device3);

      const callback = jest.fn();

      for (const device of shellies.values()) {
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

      shellies.add(device1);
      shellies.add(device2);
      shellies.add(device3);

      const callback = jest.fn();

      for (const device of shellies) {
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

      shellies.add(device1);
      shellies.add(device2);

      expect(shellies.delete(device1)).toBe(true);
      expect(shellies.size).toBe(1);
      expect(shellies.has(device1)).toBe(false);

      expect(shellies.delete('abc124')).toBe(true);
      expect(shellies.size).toBe(0);
      expect(shellies.has(device2)).toBe(false);
    });

    test('emits a `remove` event', () => {
      const device = new TestDevice('abc123');

      shellies.add(device);

      const listener = jest.fn();
      shellies.on('remove', listener);

      shellies.delete(device);

      expect(listener).toHaveBeenCalledWith(device);
    });

    test('returns false for unknown devices', () => {
      expect(shellies.delete(new TestDevice('abc123'))).toBe(false);
      expect(shellies.delete('abc123')).toBe(false);
    });

    test('emits no `remove` event for unknown devices', () => {
      const listener = jest.fn();
      shellies.on('remove', listener);

      shellies.delete('abc123');

      expect(listener).not.toHaveBeenCalledTimes(1);
    });
  });

  describe('.clear()', () => {
    test('removes all devices', () => {
      shellies.add(new TestDevice('abc123'));
      shellies.add(new TestDevice('abc124'));
      shellies.add(new TestDevice('abc125'));

      shellies.clear();

      expect(shellies.size).toBe(0);
    });

    test('emits a `remove` event for each device', () => {
      const device1 = new TestDevice('abc123');
      const device2 = new TestDevice('abc124');
      const device3 = new TestDevice('abc125');

      shellies.add(device1);
      shellies.add(device2);
      shellies.add(device3);

      const listener = jest.fn();
      shellies.on('remove', listener);

      shellies.clear();

      expect(listener).toHaveBeenCalledTimes(3);
      expect(listener).toHaveBeenNthCalledWith(1, device1);
      expect(listener).toHaveBeenNthCalledWith(2, device2);
      expect(listener).toHaveBeenNthCalledWith(3, device3);
    });
  });
});
