import EventEmitter from 'eventemitter3';

export type DeviceId = string;

export class Device extends EventEmitter {
  constructor(readonly id: DeviceId) {
    super();
  }
}
