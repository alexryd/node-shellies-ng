import EventEmitter from 'eventemitter3';

import { ComponentLike, ComponentName } from '../components';
import { HttpService, ScheduleService, ShellyService, WebhookService } from '../services';
import { RpcHandler } from '../rpc';

export type DeviceId = string;

/**
 * Describes a device class and its static properties.
 */
export interface DeviceClass {
  new (id: DeviceId, rpcHandler: RpcHandler): Device;

  /**
   * The model designation of the device.
   */
  model: string;
  /**
   * A human-friendly name of the device model.
   */
  modelName: string;
}

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
   * Holds all registered subclasses.
   */
  private static readonly subclasses = new Map<string, DeviceClass>();

  /**
   * Registers a device class, so that it can later be found based on its device model
   * using the `Device.getClass()` method.
   * @param cls - A subclass of `Device`.
   */
  static registerClass(cls: DeviceClass) {
    const model = cls.model.toUpperCase();
    // make sure it's not already registered
    if (Device.subclasses.has(model)) {
      throw new Error(`A device class for ${model} has already been registered`);
    }

    // add it to the list
    Device.subclasses.set(model, cls);
  }

  /**
   * Returns the device class for the given device model, if one has been registered.
   * @param model - The model designation to lookup.
   */
  static getClass(model: string): DeviceClass | undefined {
    return Device.subclasses.get(model.toUpperCase());
  }

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
   * The model designation of the device.
   */
  get model(): string {
    return (this.constructor as DeviceClass).model;
  }

  /**
   * A human-friendly name of the device model.
   */
  get modelName(): string {
    return (this.constructor as DeviceClass).modelName;
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
