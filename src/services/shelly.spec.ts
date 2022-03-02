import crypto from 'crypto';

import { Device } from '../devices';
import { RpcHandler } from '../rpc';
import { ShellyService } from './shelly';

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

describe('ShellyService', () => {
  let device = new TestDevice();
  let service = new ShellyService(device);

  beforeEach(() => {
    device = new TestDevice();
    service = new ShellyService(device);
  });

  describe('.setAuth()', () => {
    test('creates a valid hash', () => {
      const password = 'qwerty';
      const hash = crypto.createHash('sha256')
        .update(`admin:${device.id}:${password}`)
        .digest('hex');

      service.setAuth(password);

      expect(device.rpcHandler.request).toHaveBeenCalledWith('Shelly.SetAuth', {
        user: 'admin',
        realm: device.id,
        ha1: hash,
      });
    });

    test('creates no hash when password is null', () => {
      service.setAuth(null);

      expect(device.rpcHandler.request).toHaveBeenCalledWith('Shelly.SetAuth', {
        user: 'admin',
        realm: device.id,
        ha1: null,
      });
    });
  });
});
