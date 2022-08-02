import equal from 'fast-deep-equal';
import EventEmitter from 'eventemitter3';

import { Device } from '../devices';
import { RpcEvent, RpcParams } from '../rpc';

export type PrimitiveTypes = boolean | number | string;
export type CharacteristicValue = PrimitiveTypes | PrimitiveTypes[] | null | { [key: string]: PrimitiveTypes | PrimitiveTypes[] | null };

/**
 * Interface used when passing around components, since the Component class is
 * generic.
 */
export interface ComponentLike {
  name: string;
  key: string;
  device: Device;

  update(data: Record<string, unknown>);
  handleEvent(event: RpcEvent);
}

/**
 * Property decorator used to label properties as characteristics.
 * @param target - The prototype of the component class that the property belongs to.
 * @param propertyName - The name of the property.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const characteristic = (target: any, propertyName: string) => {
  // make sure the given prototype has an array of properties
  if (!Object.prototype.hasOwnProperty.call(target, '_characteristicProps')) {
    target._characteristicProps = new Array<string>();
  }

  // get the array of properties
  const props: string[] = target._characteristicProps;

  // add this property to the array
  props.push(propertyName);
};

/**
 * Base class for all device components.
 */
export abstract class ComponentBase extends EventEmitter implements ComponentLike {
  /**
   * The key used to identify the component in status updates etc.
   */
  readonly key: string;

  /**
   * @param name - The name of this component. Used when making RPCs.
   * @param device - The device that owns this component.
   * @param key - The key used to identify the component in status updates etc. If `null`, the component name
   * in lower case letters will be used.
   */
  constructor(readonly name: string, readonly device: Device, key: string | null = null) {
    super();

    this.key = key !== null ? key : name.toLowerCase();
  }

  private _characteristics: Set<string> | null = null;

  /**
   * A list of all characteristics.
   */
  protected get characteristics(): Set<string> {
    if (this._characteristics === null) {
      // construct an array of properties stored by the @characteristic property decorator
      const props = new Array<string>();
      let proto = Object.getPrototypeOf(this);

      // traverse the prototype chain and collect all properties
      while (proto !== null) {
        if (Object.prototype.hasOwnProperty.call(proto, '_characteristicProps')) {
          props.push(...proto._characteristicProps);
        }

        proto = Object.getPrototypeOf(proto);
      }

      // store the list
      this._characteristics = new Set(props);
    }

    return this._characteristics;
  }

  /**
   * Updates the characteristics of the component.
   * This method will emit `change` events for all characteristics that are
   * updated.
   * @param data - A data object that contains characteristics and their values.
   */
  update(data: Record<string | number | symbol, unknown>) {
    const cs = this.characteristics;
    const changed = new Set<string>();

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
 * Defines the default response from a component's SetConfig RPC method.
 */
export interface DefaultConfigResponse {
  restart_required: boolean;
}

/**
 * Defines a set of methods common for (almost) all device components.
 */
export abstract class Component<Attributes, Config, ConfigResponse = DefaultConfigResponse> extends ComponentBase {
  /**
   * The confoguration options for this component.
   * Use the `getConfig()` method to load these options.
   * This property is automatically populated by the `Device.loadConfig()` method.
   */
  config?: Config;

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
export abstract class ComponentWithId<Attributes, Config, ConfigResponse = DefaultConfigResponse>
  extends Component<Attributes, Config, ConfigResponse> {
  /**
   * @param name - The name of this component. Used when making RPCs.
   * @param device - The device that owns this component.
   * @param id - ID of this component.
   * @param key - The key used to identify the component in status updates etc. If `null`, the component name
   * in lower case letters will be used. The component ID will be appended to this key.
   */
  constructor(name: string, device: Device, readonly id: number = 0, key: string | null = null) {
    super(
      name,
      device,
      (key !== null ? key : name.toLowerCase()) + ':' + id,
    );
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
