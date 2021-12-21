import { Device, DeviceId } from './base';
import { RpcHandler } from '../rpc';
import { ShellyDeviceInfo } from '../services/shelly';

/**
 * Utility used to create devices.
 */
export class DeviceFactory {
  /**
   * Creates a device for the given device ID.
   * This method will retrieve the model designation for the given device and then
   * instantiate the right `Device` subclass for the model.
   * @param deviceId - The device ID.
   * @param rpcHandler - Used to make remote procedure calls.
   */
  static async create(deviceId: DeviceId, rpcHandler: RpcHandler): Promise<Device | undefined> {
    // load info about this device
    const info = await rpcHandler.request<ShellyDeviceInfo>('Shelly.GetDeviceInfo');

    // get the device class for this model
    const cls = Device.getClass(info.model);
    if (cls === undefined) {
      // abort if we don't have a matching device class
      return undefined;
    }

    // create the device
    const device = new cls(deviceId, rpcHandler);

    return device;
  }
}
