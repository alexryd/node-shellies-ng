import { characteristic, Component } from './base';
import { Device } from '../devices';
import { RpcHandler } from '../rpc';

type CompoundCharacteristic = {
  characteristic1: string | null;
  characteristic2: number;
};

interface Response {
  success: boolean;
}

class TestRpcHandler extends RpcHandler {
  constructor() {
    super('test');
  }

  connected = true;
  request = jest.fn().mockResolvedValue({ success: true });
  destroy = jest.fn().mockImplementation(() => Promise.resolve());
}

class TestDevice extends Device {
  constructor() {
    super(
      {
        id: 'abc123',
        mac: 'abc123',
      },
      new TestRpcHandler(),
    );
  }
}

interface TestAttributes {
  characteristic1: number;
  characteristic2: boolean;
  characteristic3: CompoundCharacteristic;
}

class TestComponent extends Component<TestAttributes, null, null> {
  @characteristic()
  readonly characteristic1: number = 0;

  @characteristic()
  readonly characteristic2: boolean = false;

  @characteristic()
  readonly characteristic3: CompoundCharacteristic = {
      characteristic1: null,
      characteristic2: 0,
    };

  constructor(device: Device) {
    super('Test', device);
  }

  getCharacteristics(): Set<string> | undefined {
    return this.characteristics;
  }

  makeRequest(id: number): PromiseLike<Response> {
    return this.rpc<Response>('Request', { id });
  }
}

describe('Component', () => {
  let device = new TestDevice();
  let component = new TestComponent(device);

  beforeEach(() => {
    device = new TestDevice();
    component = new TestComponent(device);
  });

  describe('.characteristics', () => {
    test('has the defined characteristics', () => {
      const cs = component.getCharacteristics();

      expect(cs!.size).toBe(3);
      expect(cs!.has('characteristic1')).toBe(true);
      expect(cs!.has('characteristic2')).toBe(true);
      expect(cs!.has('characteristic3')).toBe(true);
    });
  });

  describe('.update()', () => {
    test('updates the provided characteristics', () => {
      component.update({
        characteristic1: 2,
        characteristic2: true,
        characteristic3: {
          characteristic1: 'shelly',
          characteristic2: 3,
        },
      });

      expect(component.characteristic1).toBe(2);
      expect(component.characteristic2).toBe(true);
      expect(component.characteristic3).toStrictEqual({
        characteristic1: 'shelly',
        characteristic2: 3,
      });
    });

    test('emits `change` events', () => {
      const listener = jest.fn();
      component.on('change', listener);

      component.update({
        characteristic1: 2,
        characteristic2: true,
        characteristic3: {
          characteristic1: 'shelly',
          characteristic2: 3,
        },
      });

      expect(listener).toHaveBeenCalledTimes(3);
      expect(listener).toHaveBeenNthCalledWith(1, 'characteristic1', 2);
      expect(listener).toHaveBeenNthCalledWith(2, 'characteristic2', true);
    });

    test('ignores omitted characteristics', () => {
      const listener = jest.fn();
      component.on('change', listener);

      component.update({
        characteristic2: true,
      });

      expect(component.characteristic1).toBe(0);

      expect(listener).toHaveBeenCalledTimes(1);
    });

    test('ignores unchanged compound characteristics', () => {
      const listener = jest.fn();
      component.on('change', listener);

      component.update({
        characteristic3: {
          characteristic1: null,
          characteristic2: 0,
        },
      });

      expect(listener).toHaveBeenCalledTimes(0);
    });

    test('ignores unknown attributes', () => {
      const listener = jest.fn();
      component.on('change', listener);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      component.update(<any>{
        id: 4,
        characteristic1: 3,
        source: 'shelly',
        characteristic2: true,
      });

      expect(component.characteristic1).toBe(3);
      expect(component.characteristic2).toBe(true);
      expect(listener).toHaveBeenCalledTimes(2);
    });
  });

  describe('.rpc()', () => {
    test('makes a request', () => {
      expect(component.makeRequest(1)).resolves.toStrictEqual({ success: true });

      expect(device.rpcHandler.request).toHaveBeenCalledWith('Test.Request', { id: 1 });
    });
  });
});
