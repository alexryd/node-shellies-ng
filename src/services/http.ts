import { Device } from '../devices';
import { Service } from './base';

export interface HttpGetResponse {
  code: number;
  message: string;
}

/**
 * The HTTP service enables sending HTTP requests from Shelly devices.
 */
export class Http extends Service {
  constructor(device: Device) {
    super('HTTP', device);
  }

  /**
   * Sends an HTTP GET request.
   * @param url - The URL to send the request to.
   * @param timeout - Timeout, in seconds.
   * @param ssl_ca - The certificate authority to use for HTTPS requests.
   */
  get(url: string, timeout?: number,
    ssl_ca?: '*' | 'user_ca.pem' | '' | null): PromiseLike<HttpGetResponse> {
    return this.rpc<HttpGetResponse>('GET', {
      url,
      timeout,
      ssl_ca,
    });
  }
}