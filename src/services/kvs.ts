import { Device } from '../devices';
import { Service } from './base';

export type KvsValue = string | number | boolean | { [x: string]: KvsValue } | Array<KvsValue>;

export interface KvsSetResponse {
  etag: string;
  rev: number;
}

export interface KvsGetResponse {
  etag: string;
  value: KvsValue;
}

export interface KvsGetManyResponse {
  items: {
    [key: string]: {
      etag: string;
      value: KvsValue;
    };
  };
}

export interface KvsListResponse {
  keys: {
    [key: string]: {
      etag: string;
    };
  };
  rev: number;
}

export interface KvsDeleteResponse {
  rev: number;
}

/**
 * The KVS (Key-Value Store) service provides a basic persistent storage of key-value pairs.
 */
export class KvsService extends Service {
  constructor(device: Device) {
    super('KVS', device);
  }

  /**
   * Adds a new key-value pair to the store or updates an existing one.
   * @param key - The key to add or update.
   * @param value - Value for the key.
   * @param etag - Generated hash uniquely identifying the key-value pair.
   */
  set(key: string, value: KvsValue, etag?: string): PromiseLike<KvsSetResponse> {
    return this.rpc<KvsSetResponse>('Set', {
      key,
      value,
      etag,
    });
  }

  /**
   * Returns the value stored and etag for a given key.
   * @param key - The key to lookup.
   */
  get(key: string): PromiseLike<KvsGetResponse> {
    return this.rpc<KvsGetResponse>('Get', {
      key,
    });
  }

  /**
   * Returns the full information stored for items in the store based on an optional key matching parameter.
   * @param match - Pattern against which keys are matched.
   */
  getMany(match?: string): PromiseLike<KvsGetManyResponse> {
    return this.rpc<KvsGetManyResponse>('GetMany', {
      match,
    });
  }

  /**
   * Returns a list of existing keys and etags based on an optional match parameter.
   * @param match - Pattern against which keys are matched.
   */
  list(match?: string): PromiseLike<KvsListResponse> {
    return this.rpc<KvsListResponse>('List', {
      match,
    });
  }

  /**
   * Deletes an existing key from the store.
   * @param key - The key to delete.
   * @param etag - Generated hash uniquely identifying the key-value pair.
   */
  delete(key: string, etag?: string): PromiseLike<KvsDeleteResponse> {
    return this.rpc<KvsDeleteResponse>('Delete', {
      key,
      etag,
    });
  }
}