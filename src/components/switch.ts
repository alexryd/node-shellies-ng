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
}
