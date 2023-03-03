import { Device } from './base';
import { ShellyPlusPlugUs } from './shelly-plus-plug-us';

export class ShellyPlusPlugIt extends ShellyPlusPlugUs {
  static readonly model: string = 'SNPL-00110IT';
  static readonly modelName: string = 'Shelly Plus Plug IT';
}

Device.registerClass(ShellyPlusPlugIt);
