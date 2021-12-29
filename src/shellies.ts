import EventEmitter from 'eventemitter3';

import { Device, DeviceId } from './devices';
import { DeviceDiscoverer, DeviceIdentifiers } from './discovery';
import { RpcHandler, WebSocketRpcHandlerFactory } from './rpc';
import { ShellyDeviceInfo } from './services';

/**
 * Defines configuration options for discovered devices.
 */
export interface DeviceOptions {
  /**
   * Whether this device should be excluded.
   */
  exclude: boolean;
  /**
   * The protocol to use when communicating with the device.
   */
  protocol: 'websocket';
}

/**
 * Default options for discovered devices.
 */
const DEFAULT_DEVICE_OPTIONS: Readonly<DeviceOptions> = {
  exclude: false,
  protocol: 'websocket',
};

/**
 * Defines a function that takes a device ID and returns a set of configuration
 * options for that device.
 */
export type DeviceOptionsCallback = (deviceId: DeviceId) => Partial<DeviceOptions> | undefined;

/**
 * Defines configuration options for the `Shellies` class.
 */
export interface ShelliesOptions {
  /**
   * Configuration options for devices.
   */
  deviceOptions: Map<DeviceId, Partial<DeviceOptions>> | DeviceOptionsCallback | null;
}

/**
 * Default `Shellies` options.
 */
const DEFAULT_SHELLIES_OPTIONS: Readonly<ShelliesOptions> = {
  deviceOptions: null,
};

type ShelliesEvents = {
  /**
   * The 'add' event is emitted when a new device has been added.
   */
  add: (device: Device) => void;
  /**
   * The 'remove' event is emitted when a device has been removed.
   */
  remove: (device: Device) => void;
  /**
   * The 'error' event is emitted when an error occurs asynchronously.
   */
  error: (error: Error) => void;
  /**
   * The 'exclude' event is emitted when a discovered device is ignored.
   */
  exclude: (deviceId: DeviceId) => void;
  /**
   * The 'unknown' event is emitted when a device with an unrecognized model designation is discovered.
   */
  unknown: (deviceId: DeviceId) => void;
};

/**
 * This is the main class for the shellies-ng library.
 * This class manages a list of Shelly devices. New devices can be added by registering a device discoverer.
 */
export class Shellies extends EventEmitter<ShelliesEvents> {
  /**
   * Factory used to create new `WebSocketRpcHandler`s.
   */
  readonly websocket = new WebSocketRpcHandlerFactory();

  /**
   * Holds configuration options for this class.
   */
  protected options: ShelliesOptions;

  /**
   * Holds all devices, mapped to their IDs for quick and easy access.
   */
  protected readonly devices: Map<DeviceId, Device> = new Map();

  /**
   * Event handlers bound to `this`.
   */
  protected readonly discoverHandler = this.handleDiscoveredDevice.bind(this);

  /**
   * Holds IDs of devices that been discovered but not yet added.
   */
  protected readonly pendingDevices = new Set<DeviceId>();

  /**
   * @param opts - A set of configuration options.
   */
  constructor(opts?: Partial<ShelliesOptions>) {
    super();

    // store the options, with default values
    this.options = { ...DEFAULT_SHELLIES_OPTIONS, ...(opts || {}) };
  }

  /**
   * The number of devices.
   */
  get size(): number {
    return this.devices.size;
  }

  /**
   * Adds a device. If a device with the same ID has already been added, an
   * error will be thrown.
   * @param device - The device to add.
   */
  protected add(device: Device): this {
    // make sure we don't have a device with the same ID
    if (this.devices.has(device.id)) {
      throw new Error(`Device with ID ${device.id} already added`);
    }

    this.devices.set(device.id, device);

    // emit an `add` event
    this.emit('add', device);

    return this;
  }

  /**
   * Determines whether a device has been added.
   * @param deviceOrId - The device or device ID to test.
   * @returns `true` if the device has been added; `false` otherwise.
   */
  has(deviceOrId: Device | DeviceId): boolean {
    const id: DeviceId = deviceOrId instanceof Device ? deviceOrId.id : deviceOrId;
    return this.devices.has(id);
  }

  /**
   * Returns the device with the given ID, or `undefined` if no such device was
   * found.
   */
  get(deviceId: DeviceId): Device | undefined {
    return this.devices.get(deviceId);
  }

  /**
   * Executes a provided function once for each device.
   * @param callback - Function to execute for each device.
   * @param thisArg - Value to be used as `this` when executing `callback`.
   */
  forEach(callback: (device: Device, id: DeviceId, set: Shellies) => void, thisArg?) {
    this.devices.forEach((device, id) => {
      callback.call(thisArg, device, id, this);
    });
  }

  /**
   * Returns a new Iterator object that contains an array of
   * `[DeviceId, Device]` for each device.
   */
  entries(): IterableIterator<[DeviceId, Device]> {
    return this.devices.entries();
  }

  /**
   * Returns a new Iterator object that contains the device IDs for each device.
   */
  keys(): IterableIterator<DeviceId> {
    return this.devices.keys();
  }

  /**
   * Returns a new Iterator object that contains each device.
   */
  values(): IterableIterator<Device> {
    return this.devices.values();
  }

  /**
   * Returns a new Iterator object that contains each device.
   */
  [Symbol.iterator](): IterableIterator<Device> {
    return this.devices.values();
  }

  /**
   * Removes a device.
   * @param deviceOrId - The device or ID of the device to remove.
   * @returns `true` if a device has been removed; `false` otherwise.
   */
  delete(deviceOrId: Device | DeviceId): boolean {
    const id: DeviceId = deviceOrId instanceof Device ? deviceOrId.id : deviceOrId;
    const device: Device | undefined = this.devices.get(id);

    if (device !== undefined) {
      this.devices.delete(id);

      // emit a `remove` event
      this.emit('remove', device);

      return true;
    }

    return false;
  }

  /**
   * Removes all devices.
   */
  clear() {
    // emit `remove` events for all devices
    for (const [, device] of this.devices) {
      this.emit('remove', device);
    }

    this.devices.clear();
  }

  /**
   * Registers a device discoverer, making discovered devices be added to this library.
   * @param discoverer - The discoverer to register.
   */
  registerDiscoverer(discoverer: DeviceDiscoverer) {
    discoverer.on('discover', this.discoverHandler);
  }

  /**
   * Unregisters a previously registered device discoverer.
   * @param discoverer - The discoverer to unregister.
   */
  unregisterDiscoverer(discoverer: DeviceDiscoverer) {
    discoverer.removeListener('discover', this.discoverHandler);
  }

  /**
   * Retrieves configuration options for the device with the given ID.
   * @param deviceId - Device ID.
   */
  protected getDeviceOptions(deviceId: DeviceId): DeviceOptions {
    // get all options (with defaults)
    let opts: Partial<DeviceOptions> | undefined = undefined;
    const deviceOptions = this.options.deviceOptions;

    if (deviceOptions instanceof Map) {
      opts = deviceOptions.get(deviceId);
    } else if (typeof deviceOptions === 'function') {
      opts = deviceOptions(deviceId);
    }

    return { ...DEFAULT_DEVICE_OPTIONS, ...(opts || {}) };
  }

  /**
   * Creates a device for the given device identifiers.
   * This method will retrieve the model designation for the given device and then
   * instantiate the right `Device` subclass for the model.
   * @param identifiers - A set of device identifiers.
   * @param rpcHandler - Used to make remote procedure calls.
   */
  protected async createDevice(identifiers: DeviceIdentifiers, rpcHandler: RpcHandler): Promise<Device | undefined> {
    // load info about this device
    const info = await rpcHandler.request<ShellyDeviceInfo>('Shelly.GetDeviceInfo');

    // make sure the returned device ID matches
    if (info.id !== identifiers.deviceId) {
      throw new Error(`Unexpected device ID (returned: ${info.id}, expected: ${identifiers.deviceId})`);
    }

    // get the device class for this model
    const cls = Device.getClass(info.model);
    if (cls === undefined) {
      // abort if we don't have a matching device class
      return undefined;
    }

    // create the device
    const device = new cls(info.id, rpcHandler);
    // load its status
    await device.load();

    return device;
  }

  /**
   * Handles 'discover' events from device discoverers.
   */
  protected async handleDiscoveredDevice(identifiers: DeviceIdentifiers) {
    const deviceId = identifiers.deviceId;
    const opts = this.getDeviceOptions(deviceId);

    if (this.devices.has(deviceId) || this.pendingDevices.has(deviceId)) {
      // ignore if this is a known device
      return;
    } else if (opts.exclude) {
      // exclude this device
      this.emit('exclude', deviceId);
      return;
    }

    this.pendingDevices.add(deviceId);

    try {
      let rpcHandler: RpcHandler | null = null;

      // create an RPC handler
      if (opts.protocol === 'websocket' && identifiers.hostname) {
        rpcHandler = this.websocket.create(identifiers.hostname);
      } else {
        // we're missing something
        throw new Error(`Missing required device identifier(s) (device ID: ${deviceId}, protocol: ${opts.protocol})`);
      }

      // create the device
      const device = await this.createDevice(identifiers, rpcHandler);

      this.pendingDevices.delete(deviceId);

      if (device !== undefined) {
        // add the device
        this.add(device);
      } else {
        this.emit('unknown', deviceId);
      }
    } catch (e) {
      this.pendingDevices.delete(deviceId);
      this.emit('error', e as Error);
    }
  }
}
