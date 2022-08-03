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
  static readonly model: string = 'SPSW-002XE16EU';
  static readonly modelName: string = 'Shelly Pro 2';

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
  readonly switch0 = new Switch(this, 0);

  @component
  readonly switch1 = new Switch(this, 1);

  @component
  readonly script = new Script(this);
}

Device.registerClass(ShellyPro2);

export class ShellyPro2Rev1 extends ShellyPro2 {
  static readonly model: string = 'SPSW-102XE16EU';
}

Device.registerClass(ShellyPro2Rev1);

export class ShellyPro2Rev2 extends ShellyPro2Rev1 {
  static readonly model: string = 'SPSW-202XE16EU';
}

Device.registerClass(ShellyPro2Rev2);
