import { characteristic, ComponentWithId } from './base';
import { Device } from '../devices';

export interface HumidityAttributes {
  id: number;
  rh: number | null;
  errors?: string[];
}

export interface HumidityConfig {
  id: number;
  name: string | null;
  report_thr: number;
}

/**
 * Handles the monitoring of a device's humidity sensor.
 */
export class Humidity extends ComponentWithId<HumidityAttributes, HumidityConfig> implements HumidityAttributes {
  /**
   * Relative humidity, in percent.
   */
  @characteristic
  readonly rh: number | null = null;

  /**
   * Any error conditions that have occurred.
   */
  @characteristic
  readonly errors: string[] | undefined;

  constructor(device: Device, id = 0) {
    super('Humidity', device, id);
  }
}
