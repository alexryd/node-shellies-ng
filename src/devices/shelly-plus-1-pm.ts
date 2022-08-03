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

export class ShellyPlus1Pm extends Device {
  static readonly model: string = 'SNSW-001P16EU';
  static readonly modelName: string = 'Shelly Plus 1 PM';

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

Device.registerClass(ShellyPlus1Pm);

export class ShellyPlus1PmUl extends ShellyPlus1Pm {
  static readonly model: string = 'SNSW-001P15UL';
}

Device.registerClass(ShellyPlus1PmUl);
