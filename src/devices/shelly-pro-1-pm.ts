import { component, Device } from './base';
import {
  BluetoothLowEnergy,
  Cloud,
  Input,
  Mqtt,
  Switch,
  WiFi,
} from '../components';

export class ShellyPro1Pm extends Device {
  static readonly model = 'SPSW-001PE16EU';
  static readonly modelName = 'Shelly Pro 1 PM';

  @component()
  readonly wifi = new WiFi(this);

  @component('ble')
  readonly bluetoothLowEnergy = new BluetoothLowEnergy(this);

  @component()
  readonly cloud = new Cloud(this);

  @component()
  readonly mqtt = new Mqtt(this);

  @component('input:0')
  readonly input0 = new Input(this, 0);

  @component('input:1')
  readonly input1 = new Input(this, 1);

  @component('switch:0')
  readonly switch0 = new Switch(this, 0);
}

Device.registerClass(ShellyPro1Pm);
