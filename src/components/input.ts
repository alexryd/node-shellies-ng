import { characteristic, Component } from './base';
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
export class Input extends Component {
  /**
   * State of the input (null if stateless).
   */
  @characteristic()
  readonly state: boolean | null = null;

  /**
   * @param id - ID of this Input component.
   */
  constructor(device: Device, readonly id: number = 0) {
    super('Input', device);
  }

  update(data: Partial<InputAttributes>) {
    super.update(data);
  }

  /**
   * Retrieves the status of this component.
   */
  getStatus(): PromiseLike<InputAttributes> {
    return this.rpc<InputAttributes>('GetStatus', {
      id: this.id,
    });
  }

  /**
   * Retrieves the configuration of this component.
   */
  getConfig(): PromiseLike<InputConfig> {
    return this.rpc<InputConfig>('GetConfig', {
      id: this.id,
    });
  }

  /**
   * Requests changes in the configuration of this component.
   * @param config - The configuration options to set.
   */
  setConfig(config: Partial<InputConfig>): PromiseLike<InputConfigResponse> {
    return this.rpc<InputConfigResponse>('SetConfig', {
      id: this.id,
      config,
    });
  }
}
