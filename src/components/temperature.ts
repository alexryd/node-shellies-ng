import { characteristic, ComponentWithId } from './base';
import { Device } from '../devices';

export interface TemperatureAttributes {
  id: number;
  tC: number | null;
  tF: number | null;
  errors?: string[];
}

export interface TemperatureConfig {
  id: number;
  name: string | null;
  report_thr_C: number;
}

/**
 * Handles the monitoring of a device's temperature sensor.
 */
export class Temperature extends ComponentWithId<TemperatureAttributes, TemperatureConfig> implements TemperatureAttributes {
  /**
   * Current temperature, in Celsius.
   */
  @characteristic
  readonly tC: number | null = null;

  /**
   * Current temperature, in Fahrenheit.
   */
  @characteristic
  readonly tF: number | null = null;

  /**
   * Any error conditions that have occurred.
   */
  @characteristic
  readonly errors: string[] | undefined;

  constructor(device: Device, id = 0) {
    super('Temperature', device, id);
  }
}
