import { characteristic, Component } from './base';
import { RpcHandler } from '../rpc';

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
  timer_started_at: number;
  timer_duration: number;
  apower: number;
  voltage: number;
  aenergy: SwitchEnergyCounterAttributes;
  temperature: SwitchTemperatureAttributes;
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
  power_limit: number;
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
export class Switch extends Component {
  /**
   * true if the output channel is currently on, false otherwise.
   */
  @characteristic()
  readonly output: boolean = false;

  /**
   * The current (last measured) instantaneous power delivered to the attached
   * load (if applicable).
   */
  @characteristic()
  readonly apower: number = 0;

  /**
   * Current voltage (if applicable).
   */
  @characteristic()
  readonly voltage: number = 0;

  /**
   * Information about the energy counter (if applicable).
   */
  @characteristic()
  readonly aenergy: SwitchEnergyCounterAttributes = {
    total: 0,
    by_minute: [],
    minute_ts: 0,
  };

  /**
   * Information about the temperature.
   */
  @characteristic()
  readonly temperature: SwitchTemperatureAttributes = {
    tC: null,
    tF: null,
  };

  /**
   * @param id - ID of this Switch component.
   */
  constructor(rpcHandler: RpcHandler, readonly id: number = 0) {
    super('Switch', rpcHandler);
  }

  update(data: Partial<SwitchAttributes>) {
    super.update(data);
  }

  /**
   * Retrieves the status of this component.
   */
  getStatus(): PromiseLike<SwitchAttributes> {
    return this.rpc<SwitchAttributes>('GetStatus', {
      id: this.id,
    });
  }

  /**
   * Retrieves the configuration of this component.
   */
  getConfig(): PromiseLike<SwitchConfig> {
    return this.rpc<SwitchConfig>('GetConfig', {
      id: this.id,
    });
  }

  /**
   * Requests changes in the configuration of this component.
   * @param config - The configuration options to set.
   */
  setConfig(config: Partial<SwitchConfig>): PromiseLike<SwitchConfigResponse> {
    return this.rpc<SwitchConfigResponse>('SetConfig', {
      id: this.id,
      config,
    });
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
   * @param toggle - Flip-back timer, in seconds.
   */
  set(on: boolean, toggle?: number): PromiseLike<SwitchSetResponse> {
    return this.rpc<SwitchSetResponse>('Set', {
      id: this.id,
      toggle,
    });
  }
}
