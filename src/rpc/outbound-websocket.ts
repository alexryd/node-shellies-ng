import EventEmitter from 'eventemitter3';
import { JSONRPCClient } from 'json-rpc-2.0';
import { WebSocket, WebSocketServer } from 'ws';

import { DeviceDiscoverer, DeviceIdentifiers } from '../discovery';
import { DeviceId } from '../devices';
import { RpcHandler, RpcParams } from './base';

export interface OutboundWebSocketOptions {
  /**
   * The hostname to bind the server to.
   */
  host?: string;
  /**
   * The port number to listen for incoming connections on.
   */
  port: number;
  /**
   * Accept only incoming connections to this path.
   */
  path?: string;
  /**
   * A unique ID used to identify this client when communicating with the Shelly device.
   */
  clientId: string;
  /**
   * The time, in seconds, to wait for a response before a request is aborted.
   */
  requestTimeout: number;
}

/**
 * Default server options.
 */
const DEFAULT_SERVER_OPTIONS: Readonly<OutboundWebSocketOptions> = {
  port: 8765,
  clientId: 'node-shellies-ng-' + Math.round(Math.random() * 1000000),
  requestTimeout: 10,
};

type OutboundWebSocketServerEvents = {
  /**
   * The 'listening' event is emitted when the server has started listening for incoming connections.
   */
  listening: () => void;
  /**
   * The 'close' event is emitted when the server has been disconnected.
   */
  close: () => void;
  /**
   * The 'connection' event is emitted  for each new incoming connection.
   */
  connection: (socket: WebSocket) => void;
  /**
   * The 'discover' event is emitted when a new device has connected to the server.
   */
  discover: (identifiers: DeviceIdentifiers) => void;
  /**
   * The 'error' event is emitted if an error occurs.
   */
  error: (error: Error) => void;
};

/**
 * Manages a websocket server that accepts incoming connections from Shelly devices (called Outbound WebSocket).
 */
export class OutboundWebSocketServer extends EventEmitter<OutboundWebSocketServerEvents> implements DeviceDiscoverer {
  /**
   * The underlying server instance.
   */
  protected readonly server: WebSocketServer;

  /**
   * Holds all RPC handlers.
   */
  protected readonly rpcHandlers: Map<DeviceId, OutboundWebSocketRpcHandler> = new Map();

  /**
   * Configuration options for this server.
   */
  readonly options: OutboundWebSocketOptions;

  /**
   * Event handlers bound to `this`.
   */
  protected readonly listeningHandler = this.handleListening.bind(this);
  protected readonly closeHandler = this.handleClose.bind(this);
  protected readonly connectionHandler = this.handleConnection.bind(this);
  protected readonly errorHandler = this.handleError.bind(this);

  /**
   * @param options - Configuration options for this server.
   */
  constructor(options?: Partial<OutboundWebSocketOptions>) {
    super();

    // get all options (with default values)
    const opts = this.options = { ...DEFAULT_SERVER_OPTIONS, ...(options || {}) };

    // create the server
    this.server = new WebSocketServer({
      host: opts.host,
      port: opts.port,
      path: opts.path,
    });
    this.server
      .on('listening', this.listeningHandler)
      .on('close', this.closeHandler)
      .on('connection', this.connectionHandler)
      .on('error', this.errorHandler);
  }

  /**
   * Returns an RPC handler for the given device ID.
   * If a handler for the device ID does not already exist, one will be created.
   * @param deviceId - The device ID.
   */
  getRpcHandler(deviceId: DeviceId): OutboundWebSocketRpcHandler {
    // try to find a matching RPC handler
    let rpcHandler = this.rpcHandlers.get(deviceId);

    if (rpcHandler === undefined) {
      // if no RPC handler was found, create one without a websocket
      rpcHandler = new OutboundWebSocketRpcHandler(null, this.options);
      // store it
      this.rpcHandlers.set(deviceId, rpcHandler);
    }

    return rpcHandler;
  }

  /**
   * Stops the server from listening for incoming connections.
   */
  close() {
    this.server.close();
  }

  /**
   * Handles 'listening' events from the server.
   */
  protected handleListening() {
    this.emit('listening');
  }

  /**
   * Handles 'close' events from the server.
   */
  protected handleClose() {
    this.emit('close');
  }

  /**
   * Handles new connections.
   * @param socket - The newly opened websocket.
   */
  protected handleConnection(socket: WebSocket) {
    this.emit('connection', socket);

    // create a 'message' handler
    const messageHandler = (data: Buffer) => {
      try {
        // parse the data
        const d = JSON.parse(data.toString());

        // make sure a source (device ID) is specified
        if (typeof d.src === 'string') {
          const deviceId = d.src;
          const rpcHandler = this.rpcHandlers.get(deviceId);

          if (rpcHandler) {
            // if we already have a handler for this device, replace the socket
            rpcHandler.socket = socket;
            // re-emit the message so that the RPC handler sees it
            socket.emit('message', data);
          } else {
            // if this is a new device, create a handler for it and emit a 'discover' event
            this.rpcHandlers.set(
              deviceId,
              new OutboundWebSocketRpcHandler(socket, this.options),
            );

            this.emit('discover', {
              deviceId,
              protocol: 'outboundWebsocket',
            });
          }
        } else {
          throw new Error('Message source missing or invalid: ' + d.src);
        }
      } catch (e) {
        this.emit('error', e instanceof Error ? e : new Error(String(e)));
      }

      // stop listening for events from this socket, the RPC handler takes over from here
      removeListeners();
    };

    // create a 'close' handler
    const closeHandler = (code: number) => {
      // the socket was unexpectedly closed before a message was received
      this.emit('error', new Error(`Incoming connection closed unexpectedly (code: ${code})`));

      removeListeners();
    };

    // create an 'error' handler
    const errorHandler = (error: Error) => {
      this.emit('error', new Error('Error in incoming connection: ' + error.message));

      removeListeners();
    };

    const removeListeners = () => {
      socket
        .off('message', messageHandler)
        .off('close', closeHandler)
        .off('error', errorHandler);
    };

    // add our event handlers
    socket
      .once('message', messageHandler)
      .once('close', closeHandler)
      .once('error', errorHandler);
  }

  /**
   * Handles errors from the server.
   * @param error - The error that occurred.
   */
  protected handleError(error: Error) {
    this.emit('error', error);
  }
}

/**
 * Makes remote procedure calls (RPCs) over Outbound WebSockets.
 */
export class OutboundWebSocketRpcHandler extends RpcHandler {
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
  protected readonly errorHandler = this.handleError.bind(this);

  /**
   * @param socket - The websocket to communicate over.
   * @param options - Configuration options for this handler.
   */
  constructor(socket: WebSocket | null, protected readonly options: OutboundWebSocketOptions) {
    super('outboundWebsocket');

    this._socket = socket;
    this.setupSocket();

    this.client = new JSONRPCClient(
      (req: RpcParams): Promise<void> => this.handleRequest(req),
    );
  }

  private _socket: WebSocket | null;

  /**
   * The underlying websocket.
   */
  get socket(): WebSocket | null {
    return this._socket;
  }

  set socket(socket) {
    if (socket === this._socket) {
      // abort if this is our own socket
      return;
    }

    const oldSocket = this._socket;

    this._socket = socket;
    this.setupSocket();

    // if the old and the new sockets are not in the same state we may have to emit an event
    if (socket === null || oldSocket === null || socket.readyState !== oldSocket.readyState) {
      if (socket !== null && socket.readyState === WebSocket.OPEN) {
        this.emit('connect');
      } else if (oldSocket !== null && oldSocket.readyState === WebSocket.OPEN) {
        this.emit('disconnect', 1000, 'Socket replaced', null);
      }
    }
  }

  get connected(): boolean {
    return this._socket !== null && this._socket.readyState === WebSocket.OPEN;
  }

  request<T>(method: string, params?: RpcParams): PromiseLike<T> {
    this.emit('request', method, params);

    return this.client
      .timeout(this.options.requestTimeout * 1000)
      .request(method, params);
  }

  destroy(): PromiseLike<void> {
    // reject all pending requests
    this.client.rejectAllPendingRequests('Connection closed');

    // disconnect the socket
    return this.disconnect();
  }

  /**
   * Sets up event listeners on the current socket.
   */
  protected setupSocket() {
    if (this._socket === null) {
      // abort if we don't have a socket
      return;
    }

    this._socket
      .on('open', this.openHandler)
      .on('close', this.closeHandler)
      .on('message', this.messageHandler)
      .on('error', this.errorHandler);
  }

  /**
   * Disconnects the socket and unregisters event handlers.
   */
  protected async disconnect() {
    if (this._socket === null) {
      // return immediately if we don't have a socket
      return;
    }

    switch (this._socket.readyState) {
      case WebSocket.OPEN:
      case WebSocket.CONNECTING:
        // close the socket
        this._socket.close(1000, 'User request');
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
    const s = this._socket;

    if (s === null) {
      return Promise.resolve();
    }

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
    if (!this.connected) {
      throw new Error('WebSocket disconnected');
    }

    // then send the request
    await this.sendRequest(payload);
  }

  /**
   * Sends a request over the websocket.
   * @param payload - The request payload.
   */
  protected sendRequest(payload: RpcParams): Promise<void> {
    try {
      // make sure we have a socket
      if (this._socket === null) {
        throw new Error('WebSocket disconnected');
      }

      // add our client ID to the payload
      const data = { src: this.options.clientId, ...payload };

      return new Promise((resolve, reject) => {
        // send the request
        this._socket.send(JSON.stringify(data), (error?: Error) => {
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
    if (this._socket !== null) {
      // remove event handlers
      this._socket
        .off('open', this.openHandler)
        .off('close', this.closeHandler)
        .off('message', this.messageHandler)
        .off('error', this.errorHandler);
    }

    this.emit('disconnect', code, reason.toString(), null);
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
   * Handles errors from the websocket.
   * @param error - The error.
   */
  protected handleError(error: Error) {
    this.emit('error', error);
  }
}
