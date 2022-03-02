import crypto from 'crypto';

import { Device } from '../devices';
import { Service } from './base';

export interface ShellyMethods {
  methods: string[];
}

export interface ShellyDeviceInfo {
  id: string;
  mac: string;
  model: string;
  gen: number;
  fw_id: string;
  ver: string;
  app: string;
  profile?: string;
  auth_en: boolean;
  auth_domain: string | null;
}

export interface ShellyProfiles {
  profiles: Array<{
    [name: string]: {
      components: Array<{
        type: string;
        count: number;
      }>;
    };
  }>;
}

export interface ShellySetProfileResponse {
  profile_was: string;
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
 * The common Shelly service that all devices have.
 */
export class ShellyService extends Service {
  constructor(device: Device) {
    super('Shelly', device);
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
   * Lists all available RPC methods.
   */
  listMethods(): PromiseLike<ShellyMethods> {
    return this.rpc<ShellyMethods>('ListMethods');
  }

  /**
   * Retrieves information about the device.
   */
  getDeviceInfo(): PromiseLike<ShellyDeviceInfo> {
    return this.rpc<ShellyDeviceInfo>('GetDeviceInfo');
  }

  /**
   * Retrieves a list of all available profiles and the type/count of functional components exposed for each profile.
   */
  listProfiles(): PromiseLike<ShellyProfiles> {
    return this.rpc<ShellyProfiles>('ListProfiles');
  }

  /**
   * Sets the device profile.
   * @param name - Name of the device profile.
   */
  setProfile(name: string): PromiseLike<ShellySetProfileResponse> {
    return this.rpc<ShellySetProfileResponse>('SetProfile', {
      name,
    });
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
   * Either `stage` or `url` must be specified.
   * @param stage - The type of the new version.
   * @param url - URL of the update.
   */
  update(stage?: 'stable' | 'beta', url?: string): PromiseLike<null> {
    return this.rpc<null>('Update', {
      stage,
      url,
    });
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
   * @param delay_ms - A delay until the device reboots, in milliseconds. The
   * minimum delay is 500 ms.
   */
  reboot(delay_ms?: number): PromiseLike<null> {
    return this.rpc<null>('Reboot', {
      delay_ms,
    });
  }

  /**
   * Sets the authentication details (password) for the device.
   * @param password - The new password. Set to `null` to disable.
   */
  setAuth(password: string | null): PromiseLike<null> {
    const user = 'admin';
    const hash = password === null ? null : crypto.createHash('sha256')
      .update(`${user}:${this.device.id}:${password}`)
      .digest('hex');

    return this.rpc<null>('SetAuth', {
      user,
      realm: this.device.id,
      ha1: hash,
    });
  }

  /**
   * Uploads a custom certificate authority (CA) PEM bundle.
   * @param data - Contents of the PEM file (`null` to remove the existing file).
   * @param append - Whether more data will be appended in a subsequent call.
   */
  putUserCa(data: string | null, append: boolean): PromiseLike<null> {
    return this.rpc<null>('PutUserCA', {
      data,
      append,
    });
  }
}
