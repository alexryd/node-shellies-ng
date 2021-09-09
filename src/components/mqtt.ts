import { characteristic, Component } from './base';
import { Device } from '../devices';

export interface MqttAttributes {
  connected: boolean;
}

export interface MqttConfig {
  enable: boolean;
  server: string | null;
  user: string | null;
  pass: string | null;
  ssl_ca: '*' | 'user_ca.pem' | 'ca.pem' | null;
}

export interface MqttConfigResponse {
  restart_required: boolean;
}

/**
 * Handles configuration and status of the device's outbound MQTT connection.
 */
export class Mqtt extends Component {
  /**
   * Whether the device is connected to an MQTT server.
   */
  @characteristic()
  readonly connected: boolean = false;

  constructor(device: Device) {
    super('Mqtt', device);
  }

  update(data: Partial<MqttAttributes>) {
    super.update(data);
  }

  /**
   * Retrieves the status of this component.
   */
  getStatus(): PromiseLike<MqttAttributes> {
    return this.rpc<MqttAttributes>('GetStatus');
  }

  /**
   * Retrieves the configuration of this component.
   */
  getConfig(): PromiseLike<MqttConfig> {
    return this.rpc<MqttConfig>('GetConfig');
  }

  /**
   * Requests changes in the configuration of this component.
   * @param config - The configuration options to set.
   */
  setConfig(config: Partial<MqttConfig>): PromiseLike<MqttConfigResponse> {
    return this.rpc<MqttConfigResponse>('SetConfig', {
      config,
    });
  }
}
