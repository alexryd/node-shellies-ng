import { characteristic, Component } from './base';
import { Device } from '../devices';

export interface MqttAttributes {
  connected: boolean;
}

export interface MqttConfig {
  enable: boolean;
  server: string | null;
  client_id: string | null;
  user: string | null;
  pass?: string | null;
  ssl_ca: '*' | 'user_ca.pem' | 'ca.pem' | null;
  topic_prefix: string | null;
  rpc_ntf: boolean;
  status_ntf: boolean;
}

/**
 * Handles configuration and status of the device's outbound MQTT connection.
 */
export class Mqtt extends Component<MqttAttributes, MqttConfig> implements MqttAttributes {
  /**
   * Whether the device is connected to an MQTT server.
   */
  @characteristic
  readonly connected: boolean = false;

  constructor(device: Device) {
    super('MQTT', device);
  }
}
