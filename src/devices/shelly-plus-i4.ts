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
  static readonly model: string = 'SNSN-0024X';
  static readonly modelName: string = 'Shelly Plus I4';

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
  readonly input1 = new Input(this, 1);

  @component
  readonly input2 = new Input(this, 2);

  @component
  readonly input3 = new Input(this, 3);

  @component
  readonly script = new Script(this);
}

Device.registerClass(ShellyPlusI4);
