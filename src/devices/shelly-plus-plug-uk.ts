import { component, Device } from './base';
import { ShellyPlusPlugS } from './shelly-plus-plug-s';
import { PlugsUi } from '../components';

export class ShellyPlusPlugUk extends ShellyPlusPlugS {
  static readonly model: string = 'SNPL-00112UK';
  static readonly modelName: string = 'Shelly Plus Plug UK';

  @component
  readonly plugsUi = new PlugsUi('PLUGUK_UI', this);
}

Device.registerClass(ShellyPlusPlugUk);
