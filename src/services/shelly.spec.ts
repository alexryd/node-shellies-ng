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
      new TestRpcHandler()
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
      const deviceId = 'shellypro4pm-f008d1d8b8b8';
      const password = 'qwerty';
      const hash = crypto.createHash('sha256')
        .update(`admin:${deviceId}:${password}`)
        .digest('hex');

      service.setAuth(deviceId, password);

      expect(device.rpcHandler.request).toHaveBeenCalledWith('Shelly.SetAuth', {
        user: 'admin',
        realm: deviceId,
        ha1: hash,
      });
    });

    test('creates no hash when password is null', () => {
      const deviceId = 'shellypro4pm-f008d1d8b8b8';

      service.setAuth(deviceId, null);

      expect(device.rpcHandler.request).toHaveBeenCalledWith('Shelly.SetAuth', {
        user: 'admin',
        realm: deviceId,
        ha1: null,
      });
    });
  });
});
