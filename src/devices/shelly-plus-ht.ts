import { component, Device } from './base';
import {
  BluetoothLowEnergy,
  Cloud,
  DevicePower,
  HtUi,
  Humidity,
  Mqtt,
  OutboundWebSocket,
  Temperature,
  WiFi,
} from '../components';

export class ShellyPlusHt extends Device {
  static readonly model: string = 'SNSN-0013A';
  static readonly modelName: string = 'Shelly Plus H&T';

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
  readonly temperature0 = new Temperature(this, 0);

  @component
  readonly humidity0 = new Humidity(this, 0);

  @component
  readonly devicePower0 = new DevicePower(this, 0);

  @component
  readonly htUi = new HtUi(this);
}

Device.registerClass(ShellyPlusHt);
