import { characteristic, ComponentWithId } from './base';
import { Device } from '../devices';

export interface CoverEnergyCounterAttributes {
  total: number;
  by_minute: number[];
  minute_ts: number;
}

export interface CoverTemperatureAttributes {
  tC: number | null;
  tF: number | null;
}

export interface CoverAttributes {
  id: number;
  source: string;
  state: 'open' | 'closed' | 'opening' | 'closing' | 'stopped' | 'calibrating';
  apower: number;
  voltage: number;
  current: number;
  pf: number;
  aenergy: CoverEnergyCounterAttributes;
  current_pos: number | null;
  target_pos: number | null;
  move_timeout?: number;
  move_started_at?: number;
  pos_control: boolean;
  temperature?: CoverTemperatureAttributes;
  errors?: string[];
}

export interface CoverAcMotorConfig {
  idle_power_thr: number;
}

export interface CoverObstructionDetectionConfig {
  enable: boolean;
  direction: 'open' | 'close' | 'both';
  action: 'stop' | 'reverse';
  power_thr: number;
  holdoff: number;
}

export interface CoverSafetySwitchConfig {
  enable: boolean;
  direction: 'open' | 'close' | 'both';
  action: 'stop' | 'reverse' | 'pause';
  allowed_move: 'reverse' | null;
}

export interface CoverConfig {
  id: number;
  name: string | null;
  in_mode?: 'single' | 'dual' | 'detached';
  initial_state: 'open' | 'closed' | 'stopped';
  power_limit: number;
  voltage_limit: number;
  current_limit: number;
  motor?: CoverAcMotorConfig;
  maxtime_open: number;
  maxtime_close: number;
  swap_inputs?: boolean;
  invert_directions: boolean;
  obstruction_detection: CoverObstructionDetectionConfig;
  safety_switch?: CoverSafetySwitchConfig;
}

/**
 * Handles the operation of moorized garage doors, window blinds, roof skylights etc.
 */
export class Cover extends ComponentWithId<CoverAttributes, CoverConfig> implements CoverAttributes {
  /**
   * Source of the last command.
   */
  @characteristic
  readonly source: string = '';

  /**
   * The current state.
   */
  @characteristic
  readonly state: 'open' | 'closed' | 'opening' | 'closing' | 'stopped' | 'calibrating' = 'stopped';

  /**
   * The current (last measured) instantaneous power delivered to the attached
   * load.
   */
  @characteristic
  readonly apower: number = 0;

  /**
   * Last measured voltage (in Volts).
   */
  @characteristic
  readonly voltage: number = 0;

  /**
   * Last measured current (in Amperes).
   */
  @characteristic
  readonly current: number = 0;

  /**
   * Last measured power factor.
   */
  @characteristic
  readonly pf: number = 0;

  /**
   * Information about the energy counter.
   */
  @characteristic
  readonly aenergy: CoverEnergyCounterAttributes = {
      total: 0,
      by_minute: [],
      minute_ts: 0,
    };

  /**
   * The current position in percent, from `0` (fully closed) to `100` (fully open); or `null` if not calibrated.
   */
  @characteristic
  readonly current_pos: number | null = null;

  /**
   * The requested target position in percent, from `0` (fully closed) to `100` (fully open); or `null` if not calibrated
   * or not actively moving.
   */
  @characteristic
  readonly target_pos: number | null = null;

  /**
   * A timeout (in seconds) after which the cover will automatically stop moving; or `undefined` if not actively moving.
   */
  @characteristic
  readonly move_timeout: number | undefined;

  /**
   * The time at which the movement began; or `undefined` if not actively moving.
   */
  @characteristic
  readonly move_started_at: number | undefined;

  /**
   * Whether the cover has been calibrated.
   */
  @characteristic
  readonly pos_control: boolean = false;

  /**
   * Information about the temperature sensor (if applicable).
   */
  @characteristic
  readonly temperature: CoverTemperatureAttributes | undefined;

  /**
   * Any error conditions that have occurred.
   */
  @characteristic
  readonly errors: string[] | undefined;

  constructor(device: Device, id = 0) {
    super('Cover', device, id);
  }

  /**
   * Opens the cover.
   * @param duration - Move in open direction for the specified time (in seconds).
   */
  open(duration?: number): PromiseLike<null> {
    return this.rpc<null>('Open', {
      id: this.id,
      duration,
    });
  }

  /**
   * Closes the cover.
   * @param duration - Move in close direction for the specified time (in seconds).
   */
  close(duration?: number): PromiseLike<null> {
    return this.rpc<null>('Close', {
      id: this.id,
      duration,
    });
  }

  /**
   * Stops any ongoing movement.
   */
  stop(): PromiseLike<null> {
    return this.rpc<null>('Stop', {
      id: this.id,
    });
  }

  /**
   * Moves the cover to the given position.
   * One, but not both, of `pos` and `rel` must be specified.
   * @param pos - An absolute position (in percent).
   * @param rel - A relative position (in percent).
   */
  goToPosition(pos?: number, rel?: number): PromiseLike<null> {
    return this.rpc<null>('GoToPosition', {
      id: this.id,
      pos,
      rel,
    });
  }

  /**
   * Starts the calibration procedure.
   */
  calibrate(): PromiseLike<null> {
    return this.rpc<null>('Calibrate', {
      id: this.id,
    });
  }
}
