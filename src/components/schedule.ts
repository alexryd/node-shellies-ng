import { Component } from './base';
import { Device } from '../devices';

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

export interface ScheduleResponse {
  id: number;
}

/**
 * This component represents the Schedule service which allows execution of RPC methods at fixes times or intervals.
 */
export class Schedule extends Component {
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
  create(job: ScheduleJob): PromiseLike<ScheduleResponse> {
    return this.rpc<ScheduleResponse>(
      'Create',
      { ...job },
    );
  }

  /**
   * Updates an existing scheduled job.
   * @param job - The job to update.
   */
  updateJob(job: Partial<ScheduleJob>): PromiseLike<ScheduleResponse> {
    return this.rpc<ScheduleResponse>(
      'Update',
      { ...job },
    );
  }

  /**
   * Deletes a scheduled job.
   * @param id - ID of the job to delete.
   */
  delete(id: number): PromiseLike<ScheduleResponse> {
    return this.rpc<ScheduleResponse>('Delete', {
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