import { Component } from './base';
import { Device } from '../devices';

export interface HttpGetResponse {
  code: number;
  message: string;
}

/**
 * This component represents the HTTP service.
 */
export class Http extends Component {
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