import equal from 'fast-deep-equal';
import EventEmitter from 'eventemitter3';

import { Device } from '../devices';
import { RpcEvent, RpcParams } from '../rpc';

export type ComponentName = string;

export type CharacteristicName = string;

export type PrimitiveTypes = boolean | number | string;
export type CharacteristicValue = PrimitiveTypes | PrimitiveTypes[] | null | { [key: string]: PrimitiveTypes | PrimitiveTypes[] | null };

/**
 * Interface used when passing around components, since the Component class is
 * generic.
 */
export interface ComponentLike {
  name: string;
  device: Device;

  update(data: Record<string, unknown>);
  handleEvent(event: RpcEvent);
}

/**
 * Prototype decorator used to label properties as characteristics.
 */
export const characteristic = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (target: any, propertyKey: string) => {
    // get or create a set of characteristics
    let characteristics: Set<CharacteristicName> = target['_characteristics'];
    if (!characteristics) {
      target['_characteristics'] = characteristics = new Set<CharacteristicName>();
    }

    // add this characteristic to the set
    characteristics.add(propertyKey);
  };
};

/**
 * Base class for all device components.
 */
export abstract class ComponentBase extends EventEmitter implements ComponentLike {
  /**
   * @param name - The name of this component. Used when making RPCs.
   * @param device - The device that owns this component.
   */
  constructor(readonly name: string, readonly device: Device) {
    super();
  }

  /**
   * A list of all characteristics.
   */
  protected get characteristics(): Set<CharacteristicName> | undefined {
    return this['_characteristics'];
  }

  /**
   * Updates the characteristics of the component.
   * This method will emit `change` events for all characteristics that are
   * updated.
   * @param data - A data object that contains characteristics and their values.
   */
  update(data: Record<string | number | symbol, unknown>) {
    const cs = this.characteristics;
    const changed = new Set<CharacteristicName>();

    if (!cs) {
      // abort if we don't have any characteristics
      return;
    }

    // loop through each of our characteristics
    for (const c of cs) {
      if (!Object.prototype.hasOwnProperty.call(data, c)) {
        // ignore if this characteristic is not in the data set
        continue;
      }

      if (typeof data[c] === 'object' && this[c]) {
        // if this is an object, we need to check for deep equality
        if (equal(data[c], this[c])) {
          // skip if nothing has changed
          continue;
        }

        // copy the attributes of the characteristic
        Object.assign(this[c], data[c]);
      } else {
        if (data[c] === this[c]) {
          // skip if the value is unchanged
          continue;
        }

        // assign the new value to our characteristic
        this[c] = data[c];
      }

      // add it to the list of changed characteristics
      changed.add(c);
    }

    // emit all change events after the characteristics have been updated
    for (const c of changed) {
      this.emit('change', c, this[c]);
      this.emit('change:' + c, this[c]);
    }
  }

  /**
   * Handles events received from the device RPC handler.
   * Subclasses should override this method to handle their specific events.
   * @param event - The event that has occurred.
   */
  handleEvent(event: RpcEvent) {
    if (event.event === 'config_changed') {
      this.emit('configChange', event.cfg_rev as number, event.restart_required as boolean);
    }
  }

  /**
   * Shorthand method for making an RPC.
   */
  protected rpc<T>(method: string, params?: RpcParams): PromiseLike<T> {
    return this.device.rpcHandler.request<T>(`${this.name}.${method}`, params);
  }
}

/**
 * Defines a set of methods common for (almost) all device components.
 */
export abstract class Component<Attributes, Config, ConfigResponse> extends ComponentBase {
  /**
   * Retrieves the status of this component.
   */
  getStatus(): PromiseLike<Attributes> {
    return this.rpc<Attributes>('GetStatus');
  }

  /**
   * Retrieves the configuration of this component.
   */
  getConfig(): PromiseLike<Config> {
    return this.rpc<Config>('GetConfig');
  }

  /**
   * Requests changes in the configuration of this component.
   * @param config - The configuration options to set.
   */
  setConfig(config: Partial<Config>): PromiseLike<ConfigResponse> {
    return this.rpc<ConfigResponse>('SetConfig', {
      config,
    });
  }
}

/**
 * Base class for components with an ID.
 */
export abstract class ComponentWithId<Attributes, Config, ConfigResponse>
  extends Component<Attributes, Config, ConfigResponse> {
  /**
   * @param name - The name of this component. Used when making RPCs.
   * @param device - The device that owns this component.
   * @param id - ID of this component.
   */
  constructor(name: string, device: Device, readonly id: number = 0) {
    super(name, device);
  }

  /**
   * Retrieves the status of this component.
   */
  getStatus(): PromiseLike<Attributes> {
    return this.rpc<Attributes>('GetStatus', {
      id: this.id,
    });
  }

  /**
   * Retrieves the configuration of this component.
   */
  getConfig(): PromiseLike<Config> {
    return this.rpc<Config>('GetConfig', {
      id: this.id,
    });
  }

  /**
   * Requests changes in the configuration of this component.
   * @param config - The configuration options to set.
   */
  setConfig(config: Partial<Config>): PromiseLike<ConfigResponse> {
    return this.rpc<ConfigResponse>('SetConfig', {
      id: this.id,
      config,
    });
  }
}
