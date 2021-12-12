import { characteristic, ComponentWithId } from './base';
import { Device } from '../devices';

export interface SwitchEnergyCounterAttributes {
  total: number;
  by_minute: number[];
  minute_ts: number;
}

export interface SwitchTemperatureAttributes {
  tC: number | null;
  tF: number | null;
}

export interface SwitchAttributes {
  id: number;
  source: string;
  output: boolean;
  timer_started_at?: number;
  timer_duration?: number;
  apower?: number;
  voltage?: number;
  current?: number;
  pf?: number;
  aenergy?: SwitchEnergyCounterAttributes;
  temperature: SwitchTemperatureAttributes;
  errors?: string[];
}

export interface SwitchConfig {
  id: number;
  name: string | null;
  in_mode: 'momentary' | 'follow' | 'flip' | 'detached';
  initial_state: 'off' | 'on' | 'restore_last' | 'match_input';
  auto_on: boolean;
  auto_on_delay: number;
  auto_off: boolean;
  auto_off_delay: number;
  power_limit?: number | null;
  voltage_limit?: number;
  current_limit?: number;
}

export interface SwitchConfigResponse {
  restart_required: boolean;
}

export interface SwitchSetResponse {
  was_on: boolean;
}

/**
 * Represents a switch (relay) of a device.
 */
export class Switch extends ComponentWithId<SwitchAttributes, SwitchConfig, SwitchConfigResponse> implements SwitchAttributes {
  /**
   * Source of the last command.
   */
  @characteristic()
  readonly source: string = '';

  /**
   * true if the output channel is currently on, false otherwise.
   */
  @characteristic()
  readonly output: boolean = false;

  /**
   * Start time of the timer (as a UNIX timestamp, in UTC).
   */
  @characteristic()
  readonly timer_started_at: number | undefined;

  /**
   * Duration of the timer, in seconds;
   */
  @characteristic()
  readonly timer_duration: number | undefined;

  /**
   * The current (last measured) instantaneous power delivered to the attached
   * load (if applicable).
   */
  @characteristic()
  readonly apower: number | undefined;

  /**
   * Last measured voltage (in Volts, if applicable).
   */
  @characteristic()
  readonly voltage: number | undefined;

  /**
   * Last measured current (in Amperes, if applicable).
   */
  @characteristic()
  readonly current: number | undefined;

  /**
   * Last measured power factor (if applicable).
   */
  @characteristic()
  readonly pf: number | undefined;

  /**
   * Information about the energy counter (if applicable).
   */
  @characteristic()
  readonly aenergy: SwitchEnergyCounterAttributes | undefined;

  /**
   * Information about the temperature.
   */
  @characteristic()
  readonly temperature: SwitchTemperatureAttributes = {
    tC: null,
    tF: null,
  };

  /**
   * Any error conditions that have occurred.
   */
  @characteristic()
  readonly errors: string[] | undefined;

  constructor(device: Device, id = 0) {
    super('Switch', device, id);
  }

  /**
   * Toggles the switch.
   */
  toggle(): PromiseLike<SwitchSetResponse> {
    return this.rpc<SwitchSetResponse>('Toggle', {
      id: this.id,
    });
  }

  /**
   * Sets the output of the switch.
   * @param on - Whether to switch on or off.
   * @param toggle_after - Flip-back timer, in seconds.
   */
  set(on: boolean, toggle_after?: number): PromiseLike<SwitchSetResponse> {
    return this.rpc<SwitchSetResponse>('Set', {
      id: this.id,
      toggle_after,
    });
  }
}
