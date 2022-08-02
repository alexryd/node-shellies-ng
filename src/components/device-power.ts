import { characteristic, ComponentWithId } from './base';
import { Device } from '../devices';

export interface DevicePowerBatteryStatus {
  V: number | null;
  percent: number | null;
}

export interface DevicePowerExternalSource {
  present: boolean;
}

export interface DevicePowerAttributes {
  id: number;
  battery: DevicePowerBatteryStatus;
  external?: DevicePowerExternalSource;
  errors?: string[];
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface DevicePowerConfig {}

/**
 * Handles the monitoring of a device's battery charge.
 */
export class DevicePower extends ComponentWithId<DevicePowerAttributes, DevicePowerConfig> implements DevicePowerAttributes {
  /**
   * Information about the battery charge.
   */
  @characteristic
  readonly battery: DevicePowerBatteryStatus = {
      V: null,
      percent: null,
    };

  /**
   * Information about the external power source.
   */
  @characteristic
  readonly external: DevicePowerExternalSource | undefined;

  /**
   * Any error conditions that have occurred.
   */
  @characteristic
  readonly errors: string[] | undefined;

  constructor(device: Device, id = 0) {
    super('DevicePower', device, id);
  }
}
