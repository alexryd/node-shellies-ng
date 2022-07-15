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

export class ShellyPro2 extends Device {
  static readonly model = 'SPSW-002XE16EU';
  static readonly modelName = 'Shelly Pro 2';

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

  @component('input:1')
  readonly input1 = new Input(this, 1);

  @component('switch:0')
  readonly switch0 = new Switch(this, 0);

  @component('switch:1')
  readonly switch1 = new Switch(this, 1);

  @component()
  readonly script = new Script(this);
}

Device.registerClass(ShellyPro2);
