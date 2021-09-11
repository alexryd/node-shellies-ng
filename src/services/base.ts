import { Device } from '../devices';
import { RpcParams } from '../rpc';

export abstract class Service {
  /**
   * @param name - The name of this service.
   * @param device - The device that owns this service.
   */
  constructor(readonly name: string, readonly device: Device) {
  }

  /**
   * Shorthand method for making an RPC.
   */
  protected rpc<T>(method: string, params?: RpcParams): PromiseLike<T> {
    return this.device.rpcHandler.request<T>(`${this.name}.${method}`, params);
  }
}
