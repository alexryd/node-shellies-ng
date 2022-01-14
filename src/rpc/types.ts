
export type RpcParams = Record<string, unknown>;

/**
 * Describes a status update notification.
 */
export interface RpcStatusNotification {
  /**
   * A UNIX timestamp.
   */
  ts: number;
  /**
   * One or more components and its updated attributes.
   */
  [ component: string ]: unknown;
}

/**
 * Describes an event notification.
 */
export interface RpcEventNotification {
  /**
   * A UNIX timestamp.
   */
  ts: number;
  /**
   * A list of one or more events that have occurred.
   */
  events: Array<{
    /**
     * The component that this event belongs to.
     */
    component: string;
    /**
     * The instance ID of the component, if applicable.
     */
    id?: number;
    /**
     * The name of the event.
     */
    event: string;
    /**
     * A UNIX timestamp.
     */
    ts: number;
    /**
     * Additional properties.
     */
    [ p: string ]: unknown;
  }>;
}

export declare interface RpcHandler {
  /**
   * The 'connect' event is emitted when a connection has been established.
   */
  on(event: 'connect', listener: () => void, context?: unknown): this;
  /**
   * The 'disconnect' event is emitted when a connection has been closed.
   */
  on(event: 'disconnect', listener: (code: number, reason: string) => void, context?: unknown): this;
  /**
   * The 'statusUpdate' event is emitted when an update notification is received,
   * and contains updates to one or more device components.
   */
  on(event: 'statusUpdate', listener: (update: RpcStatusNotification) => void, context?: unknown): this;
  /**
   * The 'event' event is emitted when an event notification is received.
   */
  on(event: 'event', listener: (events: RpcEventNotification) => void, context?: unknown): this;

  emit(event: 'connect'): boolean;
  emit(event: 'disconnect', code: number, reason: string): boolean;
  emit(event: 'statusUpdate', update: RpcStatusNotification): boolean;
  emit(event: 'event', events: RpcEventNotification): boolean;
}

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
