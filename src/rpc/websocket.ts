import WebSocket from 'ws';

import { JSONRPCClientWithAuthentication } from './auth';
import { RpcHandler, RpcParams } from './base';

/**
 * Options for the WebSocket RPC handler.
 */
export interface WebSocketRpcHandlerOptions {
  /**
   * A unique ID used to identify this client when communicating with the Shelly device.
   */
  clientId: string;
  /**
   * The time, in seconds, to wait for a response before a request is aborted.
   */
  requestTimeout: number;
  /**
   * The interval, in seconds, at which ping requests should be made to verify that the connection is open.
   * Set to `0` to disable.
   */
  pingInterval: number;
  /**
   * The interval, in seconds, at which a connection attempt should be made after a socket has been closed.
   * If an array is specified, the first value of the array will be used for the first connection attempt, the second
   * value for the second attempt and so on. When the last item in the array has been reached, it will be used for
   * all subsequent connection attempts; unless the value is `0`, in which case no more attempts will be made.
   * Set to `0` or an empty array to disable.
   */
  reconnectInterval: number | number[];
  /**
   * The password to use if the Shelly device requires authentication.
   */
  password?: string;
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
  protected readonly client: JSONRPCClientWithAuthentication;

  /**
   * Timeout used to schedule connection attempts and to send periodic ping requests.
   */
  protected timeout: ReturnType<typeof setTimeout> | null = null;

  /**
   * Indicates which value in the `reconnectInterval` option is currently being used.
   */
  protected reconnectIntervalIndex = 0;

  /**
   * Event handlers bound to `this`.
   */
  protected readonly openHandler = this.handleOpen.bind(this);
  protected readonly closeHandler = this.handleClose.bind(this);
  protected readonly messageHandler = this.handleMessage.bind(this);
  protected readonly pongHandler = this.handlePong.bind(this);
  protected readonly errorHandler = this.handleError.bind(this);

  /**
   * @param hostname - The hostname of the Shelly device to connect to.
   * @param opts - Configuration options for this handler.
   */
  constructor(readonly hostname: string, readonly options: WebSocketRpcHandlerOptions) {
    super('websocket');

    this.socket = this.createSocket(`ws://${hostname}/rpc`);
    this.client = new JSONRPCClientWithAuthentication(
      (req: RpcParams): Promise<void> => this.handleRequest(req),
      options.password,
    );
  }

  get connected(): boolean {
    return this.socket.readyState === WebSocket.OPEN;
  }

  request<T>(method: string, params?: RpcParams): PromiseLike<T> {
    this.emit('request', method, params);

    return this.client
      .timeout(this.options.requestTimeout * 1000)
      .request(method, params);
  }

  destroy(): PromiseLike<void> {
    // clear any timeout
    this.clearTimeout();

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
    return new WebSocket(url)
      .on('open', this.openHandler)
      .on('close', this.closeHandler)
      .on('message', this.messageHandler)
      .on('pong', this.pongHandler)
      .on('error', this.errorHandler);
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
        const msg = reason.length > 0 ? reason.toString() : `code: ${code}`;
        reject(new Error(`Error connecting to device (${msg})`));
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
   * Schedules a connection attempt after a time period specified by the `reconnectInterval` configuration option.
   * @return The time, in milliseconds, that the next connection attempt will be made in; or `null` if none has been scheduled.
   */
  protected scheduleConnect(): number | null {
    const reconnectInterval = this.options.reconnectInterval;
    const intervals: number[] = !Array.isArray(reconnectInterval) ? [reconnectInterval] : reconnectInterval;

    // abort if no interval has been specified
    if (intervals.length === 0) {
      return null;
    }

    // get the current interval
    const interval = intervals[this.reconnectIntervalIndex] * 1000;

    // abort if the interval is a non-positive number
    if (interval <= 0) {
      return null;
    }

    // clear any timeout
    this.clearTimeout();

    // schedule a new connection attempt
    this.timeout = setTimeout(async () => {
      this.timeout = null;

      if (this.reconnectIntervalIndex < intervals.length - 1) {
        this.reconnectIntervalIndex++;
      }

      try {
        await this.connect();
      } catch (e) {
        this.emit('error', e as Error);
      }
    }, interval);

    return interval;
  }

  /**
   * Disconnects the socket and unregisters event handlers.
   */
  protected async disconnect() {
    switch (this.socket.readyState) {
      case WebSocket.OPEN:
      case WebSocket.CONNECTING:
        // close the socket
        this.socket.close(1000, 'User request');
        // fall through

      case WebSocket.CLOSING:
        // wait for the socket to be closed
        await this.awaitDisconnect();
    }
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
   * Sends a ping over the websocket.
   */
  protected sendPing() {
    // abort if pings are disabled or the socket isn't open
    if (this.options.pingInterval <= 0 || this.socket.readyState !== WebSocket.OPEN) {
      return;
    }

    // clear the timeout
    this.clearTimeout();

    // send the ping
    this.socket.ping((error?: Error) => {
      if (error) {
        this.emit('error', error);
      }
    });

    // wait for a pong
    this.timeout = setTimeout(() => {
      // no pong received, terminate the connection
      this.socket.terminate();
    }, this.options.requestTimeout * 1000);
  }

  /**
   * Clears any currently pending timeout.
   */
  protected clearTimeout() {
    if (this.timeout !== null) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
  }

  /**
   * Handles 'open' events from the socket.
   */
  protected handleOpen() {
    // reset the reconnect index
    this.reconnectIntervalIndex = 0;

    this.emit('connect');

    // clear any timeout
    this.clearTimeout();

    // start sending pings
    if (this.options.pingInterval > 0) {
      this.timeout = setTimeout(() => this.sendPing(), this.options.pingInterval * 1000);
    }
  }

  /**
   * Handles 'close' events from the socket.
   * @param code - A status code.
   * @param reason - A human-readable explanation why the connection was closed.
   */
  protected handleClose(code: number, reason: Buffer) {
    // clear any timeout
    this.clearTimeout();

    // remove event handlers
    this.socket
      .off('open', this.openHandler)
      .off('close', this.closeHandler)
      .off('message', this.messageHandler)
      .off('pong', this.pongHandler)
      .off('error', this.errorHandler);

    let reconnectIn: number | null = null;

    // unless this was an intentional disconnect...
    if (code !== 1000) {
      // try to reconnect
      reconnectIn = this.scheduleConnect();
    }

    this.emit('disconnect', code, reason.toString(), reconnectIn);
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
    } else if (d.method === 'NotifyStatus' || d.method === 'NotifyFullStatus') {
      // this is a status update
      this.emit('statusUpdate', d.params);
    } else if (d.method === 'NotifyEvent') {
      // this is an event
      this.emit('event', d.params);
    }
  }

  /**
   * Handles pongs received from the device.
   */
  protected handlePong() {
    // clear the timeout
    this.clearTimeout();

    // schedule a new ping
    if (this.options.pingInterval > 0) {
      this.timeout = setTimeout(() => this.sendPing(), this.options.pingInterval * 1000);
    }
  }

  /**
   * Handles errors from the websocket.
   * @param error - The error.
   */
  protected handleError(error: Error) {
    this.emit('error', error);
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
    requestTimeout: 10,
    pingInterval: 60,
    reconnectInterval: [
      5,
      10,
      30,
      60,
      5 * 60, // 5 minutes
      10 * 60, // 10 minutes
    ],
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
