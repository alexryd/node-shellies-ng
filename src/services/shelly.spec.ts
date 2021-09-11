import crypto from 'crypto';

import { Device } from '../devices';
import { RpcHandler } from '../rpc';
import { Shelly } from './shelly';

class TestRpcHandler implements RpcHandler {
  request = jest.fn().mockResolvedValue({ success: true });
  destroy = jest.fn().mockImplementation(() => Promise.resolve());
}

class TestDevice extends Device {
  constructor() {
    super('abc123', new TestRpcHandler());
  }
}

describe('Shelly', () => {
  let device = new TestDevice();
  let service = new Shelly(device);

  beforeEach(() => {
    device = new TestDevice();
    service = new Shelly(device);
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
