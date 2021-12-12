import EventEmitter from 'eventemitter3';
import mDNS from 'multicast-dns';

import { DeviceDiscoverer } from './types';

/**
 * Defines options that are passed along to the multicast-dns library.
 */
export interface MdnsOptions {
  /**
   * The network interface to use. If none is specified, all available
   * interfaces will be used.
   */
  interface?: string;
}

/**
 * Default multicast-dns options.
 */
const DEFAULT_MDNS_OPTIONS: Readonly<MdnsOptions> = {
  interface: undefined,
};

/**
 * The service name that Shelly devices use to advertise themselves.
 */
const SERVICE_NAME = '_shelly._tcp.local';

/**
 * A service that can discover Shelly devices using mDNS.
 */
export class MdnsDeviceDiscoverer extends EventEmitter implements DeviceDiscoverer {
  /**
   * A reference to the multicast-dns library.
   */
  protected mdns: mDNS.MulticastDNS | null = null;

  /**
   * Options for the multicast-dns library.
   */
  protected mdnsOptions: MdnsOptions;

  /**
   * @param mdnsOptions - Options for the multicast-dns library.
   */
  constructor(mdnsOptions?: MdnsOptions) {
    super();

    // store the multicast-dns options, with default values
    this.mdnsOptions = { ...DEFAULT_MDNS_OPTIONS, ...(mdnsOptions || {}) };
  }

  /**
   * Makes this service start listening for new Shelly devices.
   */
  async start() {
    if (this.mdns !== null) {
      return;
    }

    this.mdns = mDNS(this.mdnsOptions);

    this.mdns.on('response', response => this.handleResponse(response));

    await this.waitUntilReady();
    await this.sendQuery();
  }

  /**
   * Returns a promise that will resolve once the mDNS socket is ready.
   */
  protected waitUntilReady(): Promise<void> {
    return new Promise((resolve) => {
      this.mdns!.once('ready', resolve);
    });
  }

  /**
   * Queries for Shelly devices.
   */
  protected sendQuery(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.mdns!.query(SERVICE_NAME, 'PTR', (error: Error | null) => {
        if (error !== null) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Makes this service stop searching for new Shelly devices.
   */
  async stop() {
    if (this.mdns === null) {
      return;
    }

    await this.destroy();

    this.mdns = null;
  }

  /**
   * Destroys the mDNS instance, closing the socket.
   */
  protected destroy(): Promise<void> {
    return new Promise((resolve) => {
      this.mdns!.destroy(resolve);
    });
  }

  /**
   * Handles mDNS response packets by parsing them and emitting `discover`
   * events.
   * @param response - The response packets.
   */
  handleResponse(response: mDNS.ResponsePacket) {
    let answerFound = false;

    // see if this response contains our requested service
    for (const a of response.answers) {
      if (a.type === 'PTR' && a.name === SERVICE_NAME) {
        // this is the right service
        answerFound = true;
        break;
      }
    }

    // skip this response if it doesn't contain our requested service
    if (!answerFound) {
      return;
    }

    let ipAddress: string | null = null;

    // find the device IP address among the answers
    for (const a of response.answers) {
      if (a.type === 'A') {
        ipAddress = a.data;
      }
    }

    if (ipAddress) {
      // emit a `discover` event
      this.emit('discover', ipAddress);
    }
  }
}
