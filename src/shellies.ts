import EventEmitter from 'eventemitter3';

import { Device, DeviceId } from './devices';
import { DeviceDiscoverer, DeviceIdentifiers, DeviceOptions } from './discovery';
import { DeviceFactory } from './devices/factory';
import { RpcHandler, WebSocketRpcHandlerFactory } from './rpc';

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
   * The 'unknown' event is emitted when a device with an unrecognized model designation is discovered.
   */
  unknown: (deviceId: DeviceId) => void;
};

export class Shellies extends EventEmitter<ShelliesEvents> {
  /**
   * Factory used to create new `WebSocketRpcHandler`s.
   */
  readonly websocket = new WebSocketRpcHandlerFactory();

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
   * Determines whether the given device has been added.
   * @param device - The device to test.
   * @returns `true` if the device has been added; false otherwise.
   */
  has(device: Device): boolean;
  /**
   * Determines whether a device with the given ID has been added.
   * @param deviceId - The device ID to test.
   * @returns `true` if the device has been added; false otherwise.
   */
  has(deviceId: DeviceId): boolean;
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
   * Removes the given device.
   * @param device - The device to remove.
   * @returns `true` if a device has been removed; `false otherwise`.
   */
  delete(device: Device): boolean;
  /**
   * Removes the device with the given ID.
   * @param deviceId - The ID of the device to remove.
   * @returns `true` if a device has been removed; `false otherwise`.
   */
  delete(deviceId: DeviceId): boolean;
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
   * Handles 'discover' events from device discoverers.
   */
  protected async handleDiscoveredDevice(identifiers: DeviceIdentifiers, opts: DeviceOptions) {
    const deviceId = identifiers.deviceId;

    if (this.devices.has(deviceId) || this.pendingDevices.has(deviceId)) {
      // ignore if this is a known device
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
      const device = await DeviceFactory.create(deviceId, rpcHandler);

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
