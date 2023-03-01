import { Component } from './base';
import { Device } from '../devices';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface PlugsUiAttributes {}

export interface PlugsUiConfig {
  leds: {
    mode: 'power' | 'switch' | 'off';
    colors: {
      'switch:0': {
        on: {
          rgb: number[] | null;
          brightness: number;
        };
        off: {
          rgb: number[] | null;
          brightness: number;
        };
      };
      power: {
        brightness: number;
      };
    };
    night_mode: {
      enable: boolean;
      brightness: number;
      active_between: string[];
    };
  };
  controls: {
    'switch:0': {
      in_mode: 'momentary' | 'detached';
    };
  };
}

export class PlugsUi extends Component<PlugsUiAttributes, PlugsUiConfig> implements PlugsUiAttributes {
  constructor (device: Device) {
    super('PLUGS_UI', device);
  }
}