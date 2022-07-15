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
  static readonly model = 'SNSW-001P16EU';
  static readonly modelName = 'Shelly Plus 1 PM';

  @component()
  readonly wifi = new WiFi(this);

  @component('ble')
  readonly bluetoothLowEnergy = new BluetoothLowEnergy(this);

  @component()
  readonly cloud = new Cloud(this);

  @component()
  readonly mqtt = new Mqtt(this);

  @component('ws')
  readonly outboundWebSocket = new OutboundWebSocket(this);

  @component('input:0')
  readonly input0 = new Input(this, 0);

  @component('switch:0')
  readonly switch0 = new Switch(this, 0);

  @component()
  readonly script = new Script(this);
}

Device.registerClass(ShellyPlus1Pm);
