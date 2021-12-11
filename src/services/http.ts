import { Device } from '../devices';
import { Service } from './base';

export interface HttpResponse {
  code: number;
  message: string;
  headers: {[k: string]: string};
  body?: string;
  body_b64?: string;
}

/**
 * The HTTP service enables sending HTTP requests from Shelly devices.
 */
export class HttpService extends Service {
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
    ssl_ca?: '*' | 'user_ca.pem' | '' | null): PromiseLike<HttpResponse> {
    return this.rpc<HttpResponse>('GET', {
      url,
      timeout,
      ssl_ca,
    });
  }

  /**
   * Sends an HTTP POST request.
   * @param url - The URL to send the request to.
   * @param body - The request body.
   * @param content_type - The type of content being sent.
   * @param timeout - Timeout, in seconds.
   * @param ssl_ca - The certificate authority to use for HTTPS requests.
   */
  post(url: string, body: string, content_type = 'application/json', timeout?: number,
    ssl_ca?: '*' | 'user_ca.pem' | '' | null): PromiseLike<HttpResponse> {
    return this.rpc<HttpResponse>('POST', {
      url,
      body,
      content_type,
      timeout,
      ssl_ca,
    });
  }
}