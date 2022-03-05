import { Device } from '../devices';
import { Service } from './base';

export interface HttpHeaders {
  [k: string]: string;
}

export interface HttpResponse {
  code: number;
  message: string;
  headers: HttpHeaders;
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
   * Either `body` or `body_b64` must be specified.
   * @param url - The URL to send the request to.
   * @param body - The request body.
   * @param body_b64 - The request body (base64 encoded).
   * @param content_type - The type of content being sent.
   * @param timeout - Timeout, in seconds.
   * @param ssl_ca - The certificate authority to use for HTTPS requests.
   */
  post(url: string, body?: string, body_b64?: string, content_type = 'application/json', timeout?: number,
    ssl_ca?: '*' | 'user_ca.pem' | '' | null): PromiseLike<HttpResponse> {
    return this.rpc<HttpResponse>('POST', {
      url,
      body,
      body_b64,
      content_type,
      timeout,
      ssl_ca,
    });
  }

  /**
   * Sends an HTTP request.
   * Either `body` or `body_b64` must be specified for POST and PUT requests.
   * @param method - The HTTP method to use.
   * @param url - The URL to send the request to.
   * @param body - The request body.
   * @param body_b64 - The request body (base64 encoded).
   * @param headers - User supplied request headers.
   * @param timeout - Timeout, in seconds.
   * @param ssl_ca - The certificate authority to use for HTTPS requests.
   */
  request(method: 'GET' | 'POST' | 'PUT' | 'HEAD' | 'DELETE', url: string, body?: string, body_b64?: string, headers?: HttpHeaders,
    timeout?: number, ssl_ca?: '*' | 'user_ca.pem' | '' | null): PromiseLike<HttpResponse> {
    return this.rpc<HttpResponse>('Request', {
      method,
      url,
      body,
      body_b64,
      headers,
      timeout,
      ssl_ca,
    });
  }
}