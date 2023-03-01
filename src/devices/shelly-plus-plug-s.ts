import { component, Device } from './base';
import {
  BluetoothLowEnergy,
  Cloud,
  Mqtt,
  OutboundWebSocket,
  Script,
  Switch,
  WiFi,
  PlugsUi,
} from '../components';

export class ShellyPlusPlugS extends Device {
  static readonly model: string = 'SNPL-00112EU';
  static readonly modelName: string = 'Shelly Plus Plug S';

  @component
  readonly wifi = new WiFi(this);

  @component
  readonly bluetoothLowEnergy = new BluetoothLowEnergy(this);

  @component
  readonly cloud = new Cloud(this);

  @component
  readonly mqtt = new Mqtt(this);

  @component
  readonly outboundWebSocket = new OutboundWebSocket(this);

  @component
  readonly switch0 = new Switch(this, 0);

  @component
  readonly script = new Script(this);

  @component
  readonly plugsUi = new PlugsUi(this);
}

Device.registerClass(ShellyPlusPlugS);
