import EventEmitter from 'eventemitter3';

import { Device, DeviceId } from './devices';

declare interface Shellies {
  emit(event: 'add', device: Device): boolean;
  emit(event: 'remove', device: Device): boolean;

  on(event: 'add', listener: (device: Device) => void): this;
  on(event: 'remove', listener: (device: Device) => void): this;
}

class Shellies extends EventEmitter {
  /**
   * Holds all devices, mapped to their IDs for quick and easy access.
   */
  protected devices: Map<DeviceId, Device> = new Map();

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
  add(device: Device): this {
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
}

const shellies = new Shellies();

export default shellies;
