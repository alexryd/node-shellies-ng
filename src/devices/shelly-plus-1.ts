import { component, Device } from './base';
import {
  BluetoothLowEnergy,
  Cloud,
  Input,
  Mqtt,
  OutboundWebSocket,
  Script,
  Switch,
  WiFi,
} from '../components';

export class ShellyPlus1 extends Device {
  static readonly model: string = 'SNSW-001X16EU';
  static readonly modelName: string = 'Shelly Plus 1';

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
  readonly input0 = new Input(this, 0);

  @component
  readonly switch0 = new Switch(this, 0);

  @component
  readonly script = new Script(this);
}

Device.registerClass(ShellyPlus1);

export class ShellyPlus1Ul extends ShellyPlus1 {
  static readonly model: string = 'SNSW-001X15UL';
}

Device.registerClass(ShellyPlus1Ul);

export class ShellyPlus1Mini extends ShellyPlus1 {
  static readonly model: string = 'SNSW-001X8EU';
}

Device.registerClass(ShellyPlus1Mini);
