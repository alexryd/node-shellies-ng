import crypto from 'crypto';

import { RpcHandler } from '../rpc';
import { Shelly } from './shelly';

class TestRpcHandler implements RpcHandler {
  request = jest.fn().mockResolvedValue({ success: true });
  destroy = jest.fn().mockImplementation(() => Promise.resolve());
}

describe('Shelly', () => {
  let component = new Shelly(new TestRpcHandler());

  beforeEach(() => {
    component = new Shelly(new TestRpcHandler());
  });

  describe('.setAuth()', () => {
    test('creates a valid hash', () => {
      const deviceId = 'shellypro4pm-f008d1d8b8b8';
      const password = 'qwerty';
      const hash = crypto.createHash('sha256')
        .update(`admin:${deviceId}:${password}`)
        .digest('hex');

      component.setAuth(deviceId, password);

      expect(component.rpcHandler.request).toHaveBeenCalledWith('Shelly.SetAuth', {
        user: 'admin',
        realm: deviceId,
        ha1: hash,
      });
    });

    test('creates no hash when password is null', () => {
      const deviceId = 'shellypro4pm-f008d1d8b8b8';

      component.setAuth(deviceId, null);

      expect(component.rpcHandler.request).toHaveBeenCalledWith('Shelly.SetAuth', {
        user: 'admin',
        realm: deviceId,
        ha1: null,
      });
    });
  });
});
