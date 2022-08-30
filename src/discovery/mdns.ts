import EventEmitter from 'eventemitter3';
import mDNS from 'multicast-dns';
import os from 'os';

import { DeviceDiscoverer, DeviceIdentifiers } from './base';
import { DeviceId } from '../devices';

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

type MdnsDeviceDiscovererEvents = {
  /**
   * The 'discover' event is emitted when a device is discovered.
   */
  discover: (identifiers: DeviceIdentifiers) => void;
  /**
   * The 'error' event is emitted if an asynchronous error occurs.
   */
  error: (error: Error) => void;
};

/**
 * A service that can discover Shelly devices using mDNS.
 */
export class MdnsDeviceDiscoverer extends EventEmitter<MdnsDeviceDiscovererEvents> implements DeviceDiscoverer {
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

    this.mdns = mDNS({
      interface: this.getNetworkInterface(this.mdnsOptions.interface),
    });

    this.mdns
      .on('response', (response) => this.handleResponse(response))
      .on('error', (error) => this.emit('error', error))
      .on('warning', (error) => this.emit('error', error));

    await this.waitUntilReady();
    await this.sendQuery();
  }

  /**
   * Validates the given network interface name or address.
   * @param iface - An interface name or address.
   * @returns If a valid interface name is given, the address for that interface
   * is returned. If a valid address is given, that same address is returned.
   * @throws Throws an error if the given name or address could not be found.
   */
  protected getNetworkInterface(iface: string | undefined): string | undefined {
    if (!iface) {
      // skip if no interface has been specified
      return undefined;
    }

    // get all available interfaces
    const ifaces = os.networkInterfaces();

    // if an interface name has been given, return its address
    const ifc = ifaces[iface];
    if (ifc && ifc.length > 0) {
      // return the first address
      return ifc[0].address;
    }

    // otherwise, go through each interface and see if there is one with the
    // given address
    for (const i in ifaces) {
      const ifc = ifaces[i];
      if (!ifc) {
        continue;
      }

      for (const ii of ifc) {
        if (ii.address === iface) {
          // address found, so it's valid
          return ii.address;
        }
      }
    }

    // the given value doesn't match any available interface name or address
    throw new Error(`Invalid network interface "${iface}"`);
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
  protected handleResponse(response: mDNS.ResponsePacket) {
    let deviceId: DeviceId | null = null;

    // see if this response contains our requested service
    for (const a of response.answers) {
      if (a.type === 'PTR' && a.name === SERVICE_NAME && a.data) {
        // this is the right service
        // get the device ID
        deviceId = a.data.split('.', 1)[0];
        break;
      }
    }

    // skip this response if it doesn't contain our requested service
    if (!deviceId) {
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
      this.emit('discover', {
        deviceId,
        hostname: ipAddress,
      });
    }
  }
}
