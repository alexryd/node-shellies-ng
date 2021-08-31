
export type RpcParams = Record<string, unknown>;

/**
 * Defines a handler for making remote procedure calls (RPC) to a device.
 */
export interface RpcHandler {
  /**
   * Sends an RPC.
   * @param method - The method to call.
   * @param params - Parameters that the method takes (if any).
   * @returns A promise that will resolve once a response has been received from
   * the device.
   */
  request<T>(method: string, params?: RpcParams): PromiseLike<T>;

  /**
   * Closes the underlying connection, if applicable.
   * @returns A promise that resolves once the connection has been closed.
   */
  destroy(): PromiseLike<void>;
}
