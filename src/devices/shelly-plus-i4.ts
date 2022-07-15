import { component, Device } from './base';
import {
  BluetoothLowEnergy,
  Cloud,
  Input,
  Mqtt,
  OutboundWebSocket,
  Script,
  WiFi,
} from '../components';

export class ShellyPlusI4 extends Device {
  static readonly model = 'SNSN-0024X';
  static readonly modelName = 'Shelly Plus I4';

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

  @component('input:2')
  readonly input2 = new Input(this, 2);

  @component('input:3')
  readonly input3 = new Input(this, 3);

  @component()
  readonly script = new Script(this);
}

Device.registerClass(ShellyPlusI4);
