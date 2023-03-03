import crypto from 'crypto';

import {
  BluetoothLowEnergyAttributes,
  BluetoothLowEnergyConfig,
  CloudAttributes,
  CloudConfig,
  CoverAttributes,
  CoverConfig,
  DevicePowerAttributes,
  DevicePowerConfig,
  EthernetAttributes,
  EthernetConfig,
  HumidityAttributes,
  HumidityConfig,
  InputAttributes,
  InputConfig,
  LightAttributes,
  LightConfig,
  MqttAttributes,
  MqttConfig,
  OutboundWebSocketAttributes,
  OutboundWebSocketConfig,
  PlugsUiAttributes,
  PlugsUiConfig,
  SmokeAttributes,
  SmokeConfig,
  SwitchAttributes,
  SwitchConfig,
  SystemAttributes,
  SystemConfig,
  TemperatureAttributes,
  TemperatureConfig,
  UiAttributes,
  UiConfig,
  WiFiAttributes,
  WiFiConfig,
} from '../components';
import { Device } from '../devices';
import { Service } from './base';

export interface ShellyStatus {
  sys?: SystemAttributes;
  wifi?: WiFiAttributes;
  eth?: EthernetAttributes;
  ble?: BluetoothLowEnergyAttributes;
  cloud?: CloudAttributes;
  mqtt?: MqttAttributes;
  ws?: OutboundWebSocketAttributes;
  'cover:0'?: CoverAttributes;
  'input:0'?: InputAttributes;
  'input:1'?: InputAttributes;
  'input:2'?: InputAttributes;
  'input:3'?: InputAttributes;
  'smoke:0'?: SmokeAttributes;
  'switch:0'?: SwitchAttributes;
  'switch:1'?: SwitchAttributes;
  'switch:2'?: SwitchAttributes;
  'switch:3'?: SwitchAttributes;
  'light:0'?: LightAttributes;
  'devicepower:0'?: DevicePowerAttributes;
  'humidity:0'?: HumidityAttributes;
  'temperature:0'?: TemperatureAttributes;
  ui?: UiAttributes;
  plugs_ui?: PlugsUiAttributes;
  pluguk_ui?: PlugsUiAttributes;
}

export interface ShellyConfig {
  sys?: SystemConfig;
  wifi?: WiFiConfig;
  eth?: EthernetConfig;
  ble?: BluetoothLowEnergyConfig;
  cloud?: CloudConfig;
  mqtt?: MqttConfig;
  ws?: OutboundWebSocketConfig;
  'cover:0'?: CoverConfig;
  'input:0'?: InputConfig;
  'input:1'?: InputConfig;
  'input:2'?: InputConfig;
  'input:3'?: InputConfig;
  'smoke:0'?: SmokeConfig;
  'switch:0'?: SwitchConfig;
  'switch:1'?: SwitchConfig;
  'switch:2'?: SwitchConfig;
  'switch:3'?: SwitchConfig;
  'light:0'?: LightConfig;
  'devicepower:0'?: DevicePowerConfig;
  'humidity:0'?: HumidityConfig;
  'temperature:0'?: TemperatureConfig;
  ui?: UiConfig;
  plugs_ui?: PlugsUiConfig;
  pluguk_ui?: PlugsUiConfig;
}

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
  discoverable: boolean;
  key?: string;
  batch?: string;
  fw_sbits?: string;
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

export interface ShellyPutUserCaResponse {
  len: number;
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
  getStatus(): PromiseLike<ShellyStatus> {
    return this.rpc<ShellyStatus>('GetStatus');
  }

  /**
   * Retrieves the configuration of all the components of the device.
   */
  getConfig(): PromiseLike<ShellyConfig> {
    return this.rpc<ShellyConfig>('GetConfig');
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
  getDeviceInfo(ident?: boolean): PromiseLike<ShellyDeviceInfo> {
    return this.rpc<ShellyDeviceInfo>('GetDeviceInfo', {
      ident,
    });
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
  putUserCa(data: string | null, append: boolean): PromiseLike<ShellyPutUserCaResponse> {
    return this.rpc<ShellyPutUserCaResponse>('PutUserCA', {
      data,
      append,
    });
  }
}
