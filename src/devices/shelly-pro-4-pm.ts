import { component, Device } from './base';
import {
  BluetoothLowEnergy,
  Cloud,
  Ethernet,
  Input,
  Mqtt,
  OutboundWebSocket,
  Script,
  Switch,
  Ui,
  WiFi,
} from '../components';

export class ShellyPro4Pm extends Device {
  static readonly model = 'SPSW-004PE16EU';
  static readonly modelName = 'Shelly Pro 4 PM';

  @component()
  readonly wifi = new WiFi(this);

  @component('eth')
  readonly ethernet = new Ethernet(this);

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

  @component('switch:0')
  readonly switch0 = new Switch(this, 0);

  @component('switch:1')
  readonly switch1 = new Switch(this, 1);

  @component('switch:2')
  readonly switch2 = new Switch(this, 2);

  @component('switch:3')
  readonly switch3 = new Switch(this, 3);

  @component()
  readonly script = new Script(this);

  @component()
  readonly ui = new Ui(this);
}

Device.registerClass(ShellyPro4Pm);
