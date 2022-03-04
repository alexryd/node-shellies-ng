import { ComponentBase } from './base';
import { Device } from '../devices';

export interface ScriptAttributes {
  id: number;
  running: boolean;
}

export interface ScriptConfig {
  name: string;
  enable: boolean;
}

export interface ScriptConfigResponse {
  restart_required: boolean;
}

export interface ScriptList {
  scripts: Array<{
    id: number;
    name: string;
    enable: boolean;
    running: boolean;
  }>;
}

export interface ScriptCreateResponse {
  id: number;
}

export interface ScriptStartStopResponse {
  was_running: boolean;
}

export interface ScriptPutCodeResponse {
  len: number;
}

export interface ScriptGetCodeResponse {
  data: string;
  left: number;
}

export interface ScriptEvalResponse {
  result: string;
}

/**
 * Handles scripts on a device.
 */
export class Script extends ComponentBase {
  constructor(device: Device) {
    super('Script', device);
  }

  /**
   * Retrieves the status of a script.
   * @param id - The script ID.
   */
  getStatus(id: number): PromiseLike<ScriptAttributes> {
    return this.rpc<ScriptAttributes>('GetStatus', {
      id,
    });
  }

  /**
   * Retrieves the configuration of a script.
   * @param id - The script ID.
   */
  getConfig(id: number): PromiseLike<ScriptConfig> {
    return this.rpc<ScriptConfig>('GetConfig', {
      id,
    });
  }

  /**
   * Requests changes in the configuration of a script.
   * @param id - The script ID.
   * @param config - The configuration options to set.
   */
  setConfig(id: number, config: Partial<ScriptConfig>): PromiseLike<ScriptConfigResponse> {
    return this.rpc<ScriptConfigResponse>('SetConfig', {
      id,
      config,
    });
  }

  /**
   * Lists all scripts.
   */
  list(): PromiseLike<ScriptList> {
    return this.rpc<ScriptList>('List');
  }

  /**
   * Creates a new script.
   * @param name - The name of the script.
   */
  create(name: string): PromiseLike<ScriptCreateResponse> {
    return this.rpc<ScriptCreateResponse>('Create', {
      name,
    });
  }

  /**
   * Removes a script.
   * @param id - The script ID.
   */
  delete(id: number): PromiseLike<null> {
    return this.rpc<null>('Delete', {
      id,
    });
  }

  /**
   * Runs a script.
   * @param id - The script ID.
   */
  start(id: number): PromiseLike<ScriptStartStopResponse> {
    return this.rpc<ScriptStartStopResponse>('Start', {
      id,
    });
  }

  /**
   * Stops the execution of a script.
   * @param id - The script ID.
   */
  stop(id: number): PromiseLike<ScriptStartStopResponse> {
    return this.rpc<ScriptStartStopResponse>('Stop', {
      id,
    });
  }

  /**
   * Uploads code to a script.
   * @param id - The script ID.
   * @param code - The code to upload.
   * @param append - Whether the code should be appended to the script or overwrite any existing code.
   */
  putCode(id: number, code: string, append = false): PromiseLike<ScriptPutCodeResponse> {
    return this.rpc<ScriptPutCodeResponse>('PutCode', {
      id,
      code,
      append,
    });
  }

  /**
   * Downloads code from a script.
   * @param id - The script ID.
   * @param offset - The byte offset from the beginning.
   * @param len - The number of bytes to download.
   */
  getCode(id: number, offset = 0, len?: number): PromiseLike<ScriptGetCodeResponse> {
    return this.rpc<ScriptGetCodeResponse>('GetCode', {
      id,
      offset,
      len,
    });
  }

  /**
   * Evaluates or executes code inside of a script.
   * @param id - The script ID.
   * @param code - The code to evaluate.
   */
  eval(id: number, code: string): PromiseLike<ScriptEvalResponse> {
    return this.rpc<ScriptEvalResponse>('Eval', {
      id,
      code,
    });
  }
}
