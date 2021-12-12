import { Device } from '../devices';
import { Service } from './base';

export interface ScheduleRpcCall {
  method: string;
  params?: Record<string, unknown>[];
}

export interface ScheduleJob {
  id?: number;
  enable: boolean;
  timespec: string;
  calls: ScheduleRpcCall[];
}

export interface ScheduleListResponse {
  jobs: ScheduleJob[];
}

export interface ScheduleCreateResponse {
  id: number;
}

/**
 * The Schedule service allows execution of RPC methods at fixes times or intervals.
 */
export class ScheduleService extends Service {
  constructor(device: Device) {
    super('Schedule', device);
  }

  /**
   * Lists all existing scheduled jobs.
   */
  list(): PromiseLike<ScheduleListResponse> {
    return this.rpc<ScheduleListResponse>('List');
  }

  /**
   * Creates a new scheduled job.
   * @param job - The job to add.
   */
  create(job: ScheduleJob): PromiseLike<ScheduleCreateResponse> {
    return this.rpc<ScheduleCreateResponse>(
      'Create',
      { ...job },
    );
  }

  /**
   * Updates an existing scheduled job.
   * @param job - The job to update.
   */
  update(job: Partial<ScheduleJob>): PromiseLike<null> {
    return this.rpc<null>(
      'Update',
      { ...job },
    );
  }

  /**
   * Deletes a scheduled job.
   * @param id - ID of the job to delete.
   */
  delete(id: number): PromiseLike<null> {
    return this.rpc<null>('Delete', {
      id,
    });
  }

  /**
   * Deletes all existing scheduled jobs.
   */
  deleteAll(): PromiseLike<null> {
    return this.rpc<null>('DeleteAll');
  }
}