import { component, Device, MultiProfileDevice } from './base';
import {
  BluetoothLowEnergy,
  Cloud,
  Cover,
  Input,
  Mqtt,
  OutboundWebSocket,
  Script,
  Switch,
  WiFi,
} from '../components';

export class ShellyPro2Pm extends MultiProfileDevice {
  static readonly model: string = 'SPSW-002PE16EU';
  static readonly modelName: string = 'Shelly Pro 2 PM';

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
  readonly cover0 = new Cover(this, 0);

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

Device.registerClass(ShellyPro2Pm);

export class ShellyPro2PmRev1 extends ShellyPro2Pm {
  static readonly model: string = 'SPSW-102PE16EU';
}

Device.registerClass(ShellyPro2PmRev1);

export class ShellyPro2PmRev2 extends ShellyPro2PmRev1 {
  static readonly model: string = 'SPSW-202PE16EU';
}

Device.registerClass(ShellyPro2PmRev2);
