import { component, Device } from './base';
import {
  BluetoothLowEnergy,
  Cloud,
  Input,
  Mqtt,
  Switch,
  System,
  WiFi,
} from '../components';

export class ShellyPlus1Pm extends Device {
  @component('sys')
  readonly system = new System(this);

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

  @component('switch:0')
  readonly switch0 = new Switch(this, 0);
}
