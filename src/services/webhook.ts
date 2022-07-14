import { Device } from '../devices';
import { Service } from './base';

export interface WebhookEventType {
  attrs?: Array<{
    name: string;
    type: 'boolean' | 'number' | 'string';
    desc: string;
  }>;
}

export interface WebhookSupportedResponse {
  hook_types?: string[];
  types?: { [name: string]: WebhookEventType };
}

export interface Webhook {
  id?: number;
  cid: number;
  enable: boolean;
  event: string;
  name: string | null;
  ssl_ca?: '*' | 'user_ca.pem' | '' | null;
  urls: string[];
  active_between?: string[] | null;
  condition?: string | null;
}

export interface WebhookListResponse {
  hooks: Webhook[];
  rev: number;
}

export interface WebhookCreateResponse {
  id: number;
  rev: number;
}

export interface WebhookUpdateResponse {
  rev: number;
}

export interface WebhookDeleteResponse {
  rev: number;
}

/**
 * The Webhook service allows Shelly devices to send HTTP requests triggered by events.
 */
export class WebhookService extends Service {
  constructor(device: Device) {
    super('Webhook', device);
  }

  /**
   * Lists all supported event types.
   */
  listSupported(): PromiseLike<WebhookSupportedResponse> {
    return this.rpc<WebhookSupportedResponse>('ListSupported');
  }

  /**
   * Lists all existing webhooks.
   */
  list(): PromiseLike<WebhookListResponse> {
    return this.rpc<WebhookListResponse>('List');
  }

  /**
   * Creates a new webhook.
   * @param hook - The webhook to add.
   */
  create(hook: Partial<Webhook>): PromiseLike<WebhookCreateResponse> {
    return this.rpc<WebhookCreateResponse>(
      'Create',
      { ...hook },
    );
  }

  /**
   * Updates an existing webhook.
   * @param hook - The webhook to update.
   */
  update(hook: Partial<Webhook>): PromiseLike<WebhookUpdateResponse> {
    return this.rpc<WebhookUpdateResponse>(
      'Update',
      { ...hook },
    );
  }

  /**
   * Deletes a webhook.
   * @param id - ID of the webhook to delete.
   */
  delete(id: number): PromiseLike<WebhookDeleteResponse> {
    return this.rpc<WebhookDeleteResponse>('Delete', {
      id,
    });
  }

  /**
   * Deletes all existing webhooks.
   */
  deleteAll(): PromiseLike<WebhookDeleteResponse> {
    return this.rpc<WebhookDeleteResponse>('DeleteAll');
  }
}
