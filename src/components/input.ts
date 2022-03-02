import { characteristic, ComponentWithId } from './base';
import { Device } from '../devices';
import { RpcEvent } from '../rpc';

export interface InputAttributes {
  id: number;
  state: boolean | null;
}

export interface InputConfig {
  id: number;
  name: string | null;
  type: 'switch' | 'button';
  invert: boolean;
  factory_reset?: boolean;
}

export interface InputConfigResponse {
  restart_required: boolean;
}

/**
 * Handles the input of a device.
 */
export class Input extends ComponentWithId<InputAttributes, InputConfig, InputConfigResponse> implements InputAttributes {
  /**
   * State of the input (null if stateless).
   */
  @characteristic()
  readonly state: boolean | null = null;

  constructor(device: Device, id = 0) {
    super('Input', device, id);
  }

  handleEvent(event: RpcEvent) {
    switch (event.event) {
      case 'btn_down':
        this.emit('buttonDown');
        break;

      case 'btn_up':
        this.emit('buttonUp');
        break;

      case 'single_push':
        this.emit('singlePush');
        break;

      case 'double_push':
        this.emit('doublePush');
        break;

      case 'long_push':
        this.emit('longPush');
        break;

      default:
        super.handleEvent(event);
    }
  }
}
