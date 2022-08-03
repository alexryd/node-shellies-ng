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

export class ShellyPro1 extends Device {
  static readonly model: string = 'SPSW-001XE16EU';
  static readonly modelName: string = 'Shelly Pro 1';

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
  readonly script = new Script(this);
}

Device.registerClass(ShellyPro1);

export class ShellyPro1Rev1 extends ShellyPro1 {
  static readonly model: string = 'SPSW-101XE16EU';
}

Device.registerClass(ShellyPro1Rev1);

export class ShellyPro1Rev2 extends ShellyPro1Rev1 {
  static readonly model: string = 'SPSW-201XE16EU';
}

Device.registerClass(ShellyPro1Rev2);
