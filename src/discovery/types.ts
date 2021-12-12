
export declare interface DeviceDiscoverer {
  emit(event: 'discover', identifier: string): boolean;

  on(event: 'discover', listener: (identifier: string) => void): this;
}

/**
 * Defines a service that can discover Shelly devices on the local network.
 */
export interface DeviceDiscoverer {
  /**
   * Makes this service start searching for new Shelly devices.
   */
  start(): Promise<void>;
  /**
   * Makes this service stop searching for new Shelly devices.
   */
  stop(): Promise<void>;
}
