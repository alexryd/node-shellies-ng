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
  static readonly model: string = 'SPSW-004PE16EU';
  static readonly modelName: string = 'Shelly Pro 4 PM';

  @component
  readonly wifi = new WiFi(this);

  @component
  readonly ethernet = new Ethernet(this);

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
  readonly switch0 = new Switch(this, 0);

  @component
  readonly switch1 = new Switch(this, 1);

  @component
  readonly switch2 = new Switch(this, 2);

  @component
  readonly switch3 = new Switch(this, 3);

  @component
  readonly script = new Script(this);

  @component
  readonly ui = new Ui(this);
}

Device.registerClass(ShellyPro4Pm);
