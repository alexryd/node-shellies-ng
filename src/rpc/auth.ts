import crypto from 'crypto';
import {
  JSONRPCClient,
  JSONRPCRequest,
  JSONRPCResponse,
  SendRequest,
} from 'json-rpc-2.0';

/**
 * Authentication challenge parameters sent by the server when a protected resource is requested.
 */
export interface RpcAuthChallenge {
  auth_type: string;
  nonce: number;
  nc?: number;
  realm: string;
  algorithm: string;
}

/**
 * Authentication response parameters supplied with each authenticated request.
 */
export interface RpcAuthResponse {
  realm: string;
  username: string;
  nonce: number;
  cnonce: number;
  response: string;
  algorithm: 'SHA-256';
}

/**
 * A request with authentication response parameters.
 */
export interface JSONRPCRequestWithAuth extends JSONRPCRequest {
  auth?: RpcAuthResponse;
}

/**
 * Extends JSONRPCClient to seamlessly handle authentication.
 */
export class JSONRPCClientWithAuthentication<ClientParams = void> extends JSONRPCClient<ClientParams> {
  /**
   * Holds the current request ID. This number is incremented for each new request.
   */
  protected requestId = 0;
  /**
   * Authentication response parameters sent with each request if the connection has been authenticated.
   */
  protected auth?: RpcAuthResponse;

  /**
   * @param password - The password to authenticate with.
   */
  constructor(send: SendRequest<ClientParams>, protected password?: string) {
    super(send);
  }

  requestAdvanced(request: JSONRPCRequest, clientParams?: ClientParams): PromiseLike<JSONRPCResponse>;
  requestAdvanced(requests: JSONRPCRequest[], clientParams?: ClientParams): PromiseLike<JSONRPCResponse[]>;
  requestAdvanced(
    requests: JSONRPCRequest | JSONRPCRequest[],
    clientParams?: ClientParams,
  ): PromiseLike<JSONRPCResponse | JSONRPCResponse[]> {
    // call requestWithAuthentication() for each request
    const promises: Promise<JSONRPCResponse>[] = (Array.isArray(requests) ? requests : [requests]).map(
      (r: JSONRPCRequest): Promise<JSONRPCResponse> => this.requestWithAuthentication(r, clientParams),
    );

    return Array.isArray(requests) ? Promise.all(promises) : promises[0];
  }

  /**
   * Handles 401 errors by parsing the authentication challenge, generating an authentication response
   * and supplying that response with each subsequent request.
   */
  protected async requestWithAuthentication(request: JSONRPCRequest, clientParams?: ClientParams): Promise<JSONRPCResponse> {
    // construct a request object with autentication parameters
    const req: JSONRPCRequestWithAuth = { auth: this.auth, ...request };

    // send the request
    const response = await super.requestAdvanced(req, clientParams);

    // handle errors
    if (response.error) {
      // an error code of 401 means this request needs to be authenticated
      if (response.error.code === 401) {
        if (!this.password) {
          // abort authentication if we don't have a password
          return Promise.reject(new Error('Unauthorized'));
        } else if (req.auth) {
          // the request contained an authentication response but still fails with error 401, which means
          // we have the wrong password
          return Promise.reject(new Error('Invalid password'));
        }

        try {
          // extract the authentication challenge parameters
          const authParams = JSON.parse(response.error.message);
          // setup the authentication response based on the challenge
          this.auth = this.createAuthResponse(authParams);
        } catch (e) {
          // something went wrong
          const error = new Error('Failed to setup authentication: ' + (e instanceof Error ? e.message : e));
          if (e instanceof Error) {
            error.stack = e.stack;
          }
        }

        // now try the same request again
        return this.requestWithAuthentication(request, clientParams);
      }

      return Promise.reject(new Error(response.error.message));
    }

    // this request was successful
    return response;
  }

  /**
   * Creates an authentication response based on the given challenge and the configured password.
   * @param params - Authentication challenge params.
   */
  protected createAuthResponse(params: RpcAuthChallenge): RpcAuthResponse {
    if (params.auth_type !== 'digest') {
      throw new Error(`Unsupported authentication type "${params.auth_type}"`);
    }
    if (params.algorithm !== 'SHA-256') {
      throw new Error(`Unsupported hash algorithm "${params.algorithm}"`);
    }
    if (!this.password) {
      throw new Error('No password specified');
    }

    // create a function for generating SHA-256 hashes
    const hash = (...parts: Array<string | number>) => crypto.createHash('sha256').update(parts.join(':')).digest('hex');

    // generate a random number
    const cnonce = Math.round(Math.random() * 1000000);

    // construct the response
    const response = [
      hash('admin', params.realm, this.password),
      params.nonce,
      params.nc || 1,
      cnonce,
      'auth',
      hash('dummy_method', 'dummy_uri'),
    ];

    return {
      realm: params.realm,
      username: 'admin',
      nonce: params.nonce,
      cnonce,
      response: hash(...response),
      algorithm: 'SHA-256',
    };
  }
}
