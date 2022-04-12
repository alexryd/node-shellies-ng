import EventEmitter from 'eventemitter3';

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

export interface RpcEvent {
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
  events: RpcEvent[];
}

type RpcHandlerEvents = {
  /**
   * The 'connect' event is emitted when a connection has been established.
   */
  connect: () => void;
  /**
   * The 'disconnect' event is emitted when a connection has been closed or an attempt to connect fails.
   */
  disconnect: (code: number, reason: string, reconnectIn: number | null) => void;
  /**
   * The 'request' event is emitted when a new request is about to be sent.
   */
  request: (method: string, params?: RpcParams) => void;
  /**
   * The 'statusUpdate' event is emitted when an update notification is received,
   * and contains updates to one or more device components.
   */
  statusUpdate: (update: RpcStatusNotification) => void;
  /**
   * The 'event' event is emitted when an event notification is received.
   */
  event: (events: RpcEventNotification) => void;
  /**
   * The 'error' event is emitted if an error occurs.
   */
  error: (error: Error) => void;
};

/**
 * Base class for all remote procedure call (RPC) handlers.
 */
export abstract class RpcHandler extends EventEmitter<RpcHandlerEvents> {
  /**
   * @param protocol - The protocol used to send RPCs.
   */
  constructor(readonly protocol: string) {
    super();
  }

  /**
   * Whether this handler is connected to its device.
   */
  abstract get connected(): boolean;

  /**
   * Sends an RPC.
   * @param method - The method to call.
   * @param params - Parameters that the method takes (if any).
   * @returns A promise that will resolve once a response has been received from
   * the device.
   */
  abstract request<T>(method: string, params?: RpcParams): PromiseLike<T>;

  /**
   * Closes the underlying connection, if applicable.
   * @returns A promise that resolves once the connection has been closed.
   */
  abstract destroy(): PromiseLike<void>;
}
