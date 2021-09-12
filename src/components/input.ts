import { characteristic, ComponentWithId } from './base';
import { Device } from '../devices';

export interface InputAttributes {
  id: number;
  state: boolean | null;
}

export interface InputConfig {
  id: number;
  name: string | null;
  type: 'switch' | 'button';
  invert: boolean;
  factory_reset: boolean;
}

export interface InputConfigResponse {
  restart_required: boolean;
}

/**
 * Handles the input of a device.
 */
export class Input extends ComponentWithId<InputAttributes, InputConfig, InputConfigResponse> {
  /**
   * State of the input (null if stateless).
   */
  @characteristic()
  readonly state: boolean | null = null;

  constructor(device: Device, id = 0) {
    super('Input', device, id);
  }
}
