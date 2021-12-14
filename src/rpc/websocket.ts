import { JSONRPCClient } from 'json-rpc-2.0';
import WebSocket from 'ws';

import { RpcHandler, RpcParams } from './types';

/**
 * Options for the WebSocket RPC handler.
 */
export interface WebSocketRpcHandlerOptions {
  /**
   * A unique ID used to identify this client when communicating with the Shelly device.
   */
  clientId: string;
}

const DEFAULT_OPTIONS: Readonly<WebSocketRpcHandlerOptions> = {
  clientId: 'node-shellies-ng-' + Math.round(Math.random() * 1000000),
};

/**
 * Makes remote procedure calls (RPCs) over WebSockets.
 */
export class WebSocketRpcHandler implements RpcHandler {
  /**
   * Configuration options for this handler.
   */
  readonly options: WebSocketRpcHandlerOptions;

  /**
   * The underlying websocket.
   */
  protected socket: WebSocket;
  /**
   * Handles parsing of JSON RPC requests and responses.
   */
  protected readonly client: JSONRPCClient;

  /**
   * Event handlers bound to `this`.
   */
  protected readonly messageHandler = this.handleMessage.bind(this);

  /**
   * @param hostname - The hostname of the Shelly device to connect to.
   * @param opts - Configuration options for this handler.
   */
  constructor(hostname: string, opts?: Partial<WebSocketRpcHandlerOptions>) {
    // store all options (with possible default values)
    this.options = { ...DEFAULT_OPTIONS, ...(opts || {}) };

    this.socket = this.createSocket(`ws://${hostname}/rpc`);
    this.client = new JSONRPCClient((req: RpcParams): Promise<void> => this.handleRequest(req));
  }

  request<T>(method: string, params?: RpcParams): PromiseLike<T> {
    return this.client.request(method, params);
  }

  destroy(): PromiseLike<void> {
    // reject all pending requests
    this.client.rejectAllPendingRequests('Connection closed');
    // disconnect the socket
    return this.disconnect();
  }

  /**
   * Creates a new websocket and registers event handlers.
   * @param url - The URL to connect to.
   */
  protected createSocket(url: string): WebSocket {
    const s = new WebSocket(url);
    s.on('message', this.messageHandler);
    return s;
  }

  /**
   * Connects the websocket.
   * Creates a new socket if the current is closed.
   */
  protected async connect() {
    switch (this.socket.readyState) {
      case WebSocket.CLOSED:
      case WebSocket.CLOSING:
        // the current socket is closed, disconnect and create a new one
        await this.disconnect();
        this.socket = this.createSocket(this.socket.url);
        // fall through

      case WebSocket.CONNECTING:
        // wait for the socket to be connected
        await this.awaitConnect();
    }
  }

  /**
   * Returns a Promise that will be fulfilled once the socket is connected.
   */
  protected awaitConnect(): Promise<void> {
    const s = this.socket;

    if (s.readyState === WebSocket.CONNECTED) {
      // we're already connected
      return Promise.resolve();
    } else if (s.readyState !== WebSocket.CONNECTING) {
      // reject if the socket isn't currently connecting
      return Promise.reject(new Error('WebSocket is not connecting'));
    }

    return new Promise((resolve, reject) => {
      // reject if the socket fails to connect
      const closeHandler = (code: number, reason: Buffer) => {
        reject(new Error(`Connection closed (${reason.toString()}`));
      };
      s.once('close', closeHandler);

      // resolve once the socket is connected
      s.once('open', () => {
        s.removeEventListener('close', closeHandler);
        resolve();
      });
    });
  }

  /**
   * Disconnects the socket and unregisters event handlers.
   */
  protected async disconnect() {
    const s = this.socket;

    switch (this.socket.readyState) {
      case WebSocket.OPEN:
      case WebSocket.CONNECTING:
        // close the socket
        s.close();
        // fall through

      case WebSocket.CLOSING:
        // wait for the socket to be closed
        await this.awaitDisconnect();
    }

    // remove event handlers
    s.removeEventListener('message', this.messageHandler);
  }

  /**
   * Returns a Promise that will be fulfilled once the socket is disconnected.
   */
  protected awaitDisconnect(): Promise<void> {
    const s = this.socket;

    if (s.readyState === WebSocket.CLOSED) {
      // we're already disconnected
      return Promise.resolve();
    } else if (s.readyState !== WebSocket.CLOSING) {
      // reject if the socket isn't closing
      return Promise.reject(new Error('WebSocket is not disconnecting'));
    }

    return new Promise((resolve) => {
      // resolve once the socket is disconnected
      s.once('close', resolve);
    });
  }

  /**
   * Handles a request.
   * @param payload - The request payload.
   */
  protected async handleRequest(payload: RpcParams) {
    // make sure we're connected
    await this.connect();
    // then send the request
    await this.sendRequest(payload);
  }

  /**
   * Sends a request over the websocket.
   * @param payload - The request payload.
   */
  protected sendRequest(payload: RpcParams): Promise<void> {
    try {
      // add our client ID to the payload
      const data = { src: this.options.clientId, ...payload };

      return new Promise((resolve, reject) => {
        // send the request
        this.socket.send(JSON.stringify(data), (error?: Error) => {
          if (!error) {
            resolve();
          } else {
            reject(error);
          }
        });
      });
    } catch (e) {
      return Promise.reject(e);
    }
  }

  /**
   * Handles incoming messages.
   * @param data The message data, as a JSON encoded string.
   */
  protected handleMessage(data: Buffer) {
    // parse the data
    const d = JSON.parse(data.toString());
    // let the JSON RPC client handle the response
    this.client.receive(d);
  }
}