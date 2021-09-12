import EventEmitter from 'eventemitter3';

import { ComponentLike, ComponentName } from '../components';
import { HttpService, ScheduleService, ShellyService, WebhookService } from '../services';
import { RpcHandler } from '../rpc';

export type DeviceId = string;

/**
 * Prototype decorator used to label properties as components.
 * @param name - The name of the component. If omitted, the property key will be
 * used as the name.
 */
export const component = (name: ComponentName | null = null) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (target: any, propertyKey: string) => {
    // get or create a map of device components
    let componentMap: Map<ComponentName, string> = target['_componentMap'];
    if (!componentMap) {
      target['_componentMap'] = componentMap = new Map<ComponentName, string>();
    }

    // add this component to the map
    componentMap.set(name || propertyKey, propertyKey);
  };
};

/**
 * Base class for all devices.
 */
export abstract class Device extends EventEmitter {
  /**
   * This device's Shelly service.
   */
  readonly shelly = new ShellyService(this);

  /**
   * This device's Shedule service.
   */
  readonly schedule = new ScheduleService(this);

  /**
   * This device's Webhook service.
   */
  readonly webhook = new WebhookService(this);

  /**
   * This device's HTTP service.
   */
  readonly http = new HttpService(this);

  /**
   * @param id - The ID of this device.
   * @param rpcHandler - Used to make remote procedure calls.
   */
  constructor(readonly id: DeviceId, readonly rpcHandler: RpcHandler) {
    super();

    // make sure we have a map of components, even if we don't have any components
    if (!this['_componentMap']) {
      this['_componentMap'] = new Map<ComponentName, string>();
    }
  }

  /**
   * Maps component names to property keys.
   */
  protected get components(): Map<ComponentName, string> {
    return this['_componentMap'];
  }

  /**
   * Determines whether this device has a component with a given name.
   * @param name - The name of the component.
   */
  hasComponent(name: ComponentName): boolean {
    return this.components.has(name);
  }

  /**
   * Returns the component with the given name.
   * @param name - The name of the component.
   */
  getComponent(name: ComponentName): ComponentLike | undefined {
    const key = this.components.get(name);
    if (key) {
      return this[key];
    }

    return undefined;
  }

  /**
   * Returns a new Iterator object that contains each of the device's
   * components.
   */
  *[Symbol.iterator](): IterableIterator<[ComponentName, ComponentLike]> {
    for (const [name, key] of this.components.entries()) {
      yield [name, this[key]];
    }
  }
}
