import crypto from 'crypto';

import { Component } from './base';
import { RpcHandler } from '../rpc';

export interface ShellyDeviceInfo {
  id: string;
  mac: string;
  model: string;
  gen: number;
  fw_id: string;
  ver: string;
  app: string;
  auth_en: boolean;
  auth_domain: string | null;
}

export interface ShellyTimezones {
  timezones: string[];
}

export interface ShellyLocation {
  tz: string | null;
  lat: number | null;
  lon: number | null;
}

export interface ShellyFirmwareUpdate {
  stable?: {
    version: string;
    build_id: string;
  };
  beta?: {
    version: string;
    build_id: string;
  };
}

/**
 * This component represents the common Shelly service that all devices have.
 */
export class Shelly extends Component {
  constructor(rpcHandler: RpcHandler) {
    super('Shelly', rpcHandler);
  }

  /**
   * Retrieves the status of all of the components of the device.
   */
  getStatus(): PromiseLike<Record<string, unknown>> {
    return this.rpc<Record<string, unknown>>('GetStatus');
  }

  /**
   * Retrieves the configuration of all the components of the device.
   */
  getConfig(): PromiseLike<Record<string, unknown>> {
    return this.rpc<Record<string, unknown>>('GetConfig');
  }

  /**
   * Retrieves information about the device.
   */
  getDeviceInfo(): PromiseLike<ShellyDeviceInfo> {
    return this.rpc<ShellyDeviceInfo>('GetDeviceInfo');
  }

  /**
   * Retrieves a list of all timezones.
   */
  listTimezones(): PromiseLike<ShellyTimezones> {
    return this.rpc<ShellyTimezones>('ListTimezones');
  }

  /**
   * Retrieves the location of the device.
   */
  detectLocation(): PromiseLike<ShellyLocation> {
    return this.rpc<ShellyLocation>('DetectLocation');
  }

  /**
   * Checks for a new firmware version.
   */
  checkForUpdate(): PromiseLike<ShellyFirmwareUpdate> {
    return this.rpc<ShellyFirmwareUpdate>('CheckForUpdate');
  }

  /**
   * Requests an update of the device firmware.
   * @param stage - The type of the new version.
   */
  installUpdate(stage: 'stable' | 'beta' = 'stable'): PromiseLike<null> {
    return this.rpc<null>('Update');
  }

  /**
   * Requests a factory reset of the device.
   */
  factoryReset(): PromiseLike<null> {
    return this.rpc<null>('FactoryReset');
  }

  /**
   * Requests that the device's WiFi configuration is reset.
   */
  resetWiFiConfig(): PromiseLike<null> {
    return this.rpc<null>('ResetWiFiConfig');
  }

  /**
   * Requests a reboot of the device.
   * @param delay - A delay until the device reboots, in milliseconds. The
   * minimum delay is 500 ms.
   */
  reboot(delay?: number): PromiseLike<null> {
    return this.rpc<null>('Reboot', {
      delay,
    });
  }

  /**
   * Sets the authentication details (password) for the device.
   * @param deviceId - The ID of the device.
   * @param password - The new password. Set to null to disable.
   */
  setAuth(deviceId: string, password: string | null): PromiseLike<null> {
    const user = 'admin';
    const hash = password === null ? null : crypto.createHash('sha256')
      .update(`${user}:${deviceId}:${password}`)
      .digest('hex');

    return this.rpc<null>('SetAuth', {
      user,
      realm: deviceId,
      ha1: hash,
    });
  }
}
