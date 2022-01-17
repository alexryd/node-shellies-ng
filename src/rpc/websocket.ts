import { JSONRPCClient } from 'json-rpc-2.0';
import WebSocket from 'ws';

import { RpcHandler, RpcParams } from './base';

/**
 * Options for the WebSocket RPC handler.
 */
export interface WebSocketRpcHandlerOptions {
  /**
   * A unique ID used to identify this client when communicating with the Shelly device.
   */
  clientId: string;
}

/**
 * Makes remote procedure calls (RPCs) over WebSockets.
 */
export class WebSocketRpcHandler extends RpcHandler {
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
  protected readonly openHandler = this.handleOpen.bind(this);
  protected readonly closeHandler = this.handleClose.bind(this);
  protected readonly messageHandler = this.handleMessage.bind(this);

  /**
   * @param hostname - The hostname of the Shelly device to connect to.
   * @param opts - Configuration options for this handler.
   */
  constructor(hostname: string, readonly options: WebSocketRpcHandlerOptions) {
    super();

    this.socket = this.createSocket(`ws://${hostname}/rpc`);
    this.client = new JSONRPCClient((req: RpcParams): Promise<void> => this.handleRequest(req));
  }

  /**
   * Whether the websocket is connected.
   */
  get connected(): boolean {
    return this.socket.readyState === WebSocket.OPEN;
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
    s.on('open', this.openHandler);
    s.on('close', this.closeHandler);
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
    s.removeEventListener('open', this.openHandler);
    s.removeEventListener('close', this.closeHandler);
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
   * Handles 'open' events from the socket.
   */
  protected handleOpen() {
    this.emit('connect');
  }

  /**
   * Handles 'close' events from the socket.
   * @param code - A status code.
   * @param reason - A human-readable explanation why the connection was closed.
   */
  protected handleClose(code: number, reason: Buffer) {
    this.emit('disconnect', code, reason.toString());
  }

  /**
   * Handles incoming messages.
   * @param data The message data, as a JSON encoded string.
   */
  protected handleMessage(data: Buffer) {
    // parse the data
    const d = JSON.parse(data.toString());

    if (d.id) {
      // this is a response, let the JSON RPC client handle it
      this.client.receive(d);
    } else if (d.method === 'NotifyStatus') {
      // this is a status update
      this.emit('statusUpdate', d.params);
    } else if (d.method === 'NotifyEvent') {
      // this is an event
      this.emit('event', d.params);
    }
  }
}

/**
 * Factory class used to create `WebSocketRpcHandler` instances.
 */
export class WebSocketRpcHandlerFactory {
  /**
   * Default `WebSocketRpcHandler` options.
   */
  readonly defaultOptions: WebSocketRpcHandlerOptions = {
    clientId: 'node-shellies-ng-' + Math.round(Math.random() * 1000000),
  };

  /**
   * Creates a new `WebSocketRpcHandler`.
   * @param hostname - The hostname of the Shelly device to connect to.
   * @param opts - Configuration options for the handler.
   */
  create(hostname: string, opts?: Partial<WebSocketRpcHandlerOptions>): WebSocketRpcHandler {
    // get all options (with default values)
    const options = { ...this.defaultOptions, ...(opts || {}) };

    return new WebSocketRpcHandler(hostname, options);
  }
}
