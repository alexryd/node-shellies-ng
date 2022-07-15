import { characteristic, ComponentWithId } from './base';
import { Device } from '../devices';

export interface LightAttributes {
  id: number;
  source: string;
  output: boolean;
  brightness: number;
  timer_started_at?: number;
  timer_duration?: number;
}

export interface LightConfig {
  id: number;
  name: string | null;
  initial_state: 'off' | 'on' | 'restore_last' | 'match_input';
  auto_on: boolean;
  auto_on_delay: number;
  auto_off: boolean;
  auto_off_delay: number;
  default: {
    brightness: number;
  };
  night_mode: {
    enable: boolean;
    brightness: number;
    active_between?: string[];
  };
}

/**
 * Handles a dimmable light output with additional on/off control.
 */
export class Light extends ComponentWithId<LightAttributes, LightConfig> implements LightAttributes {
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
   * Current brightness level, in percent.
   */
  @characteristic()
  readonly brightness: number = 0;

  /**
   * Start time of the timer (as a UNIX timestamp, in UTC).
   */
  @characteristic()
  readonly timer_started_at: number | undefined;

  /**
   * Duration of the timer, in seconds.
   */
  @characteristic()
  readonly timer_duration: number | undefined;

  constructor(device: Device, id = 0) {
    super('Light', device, id);
  }

  /**
   * Toggles the output state.
   */
  toggle(): PromiseLike<null> {
    return this.rpc<null>('Toggle', {
      id: this.id,
    });
  }

  /**
   * Sets the output and brightness level of the light.
   * At least one of `on` and `brightness` must be specified.
   * @param on - Whether to switch on or off.
   * @param brightness - Brightness level.
   * @param toggle_after - Flip-back timer, in seconds.
   */
  set(on?: boolean, brightness?: number, toggle_after?: number): PromiseLike<null> {
    return this.rpc<null>('Set', {
      id: this.id,
      on,
      brightness,
      toggle_after,
    });
  }
}
