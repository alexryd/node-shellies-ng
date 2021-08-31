import equal from 'fast-deep-equal';
import EventEmitter from 'eventemitter3';

export type ComponentName = string;

export type CharacteristicName = string;

export type PrimitiveTypes = boolean | number | string;
export type CharacteristicValue = PrimitiveTypes | PrimitiveTypes[] | null | { [key: string]: PrimitiveTypes | PrimitiveTypes[] | null };

/**
 * Prototype decorator used to label properties as characteristics.
 */
export const characteristic = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (target: any, propertyKey: string) => {
    // get or create a set of characteristics
    let characteristics: Set<CharacteristicName> = target['_characteristics'];
    if (!characteristics) {
      target['_characteristics'] = characteristics = new Set<CharacteristicName>();
    }

    // add this characteristic to the set
    characteristics.add(propertyKey);
  };
};

/**
 * Base class for all device components.
 */
export abstract class Component extends EventEmitter {
  /**
   * A list of all characteristics.
   */
  protected get characteristics(): Set<CharacteristicName> {
    return this['_characteristics'];
  }

  /**
   * Updates the characteristics of the component.
   * This method will emit `change` events for all characteristics that are
   * updated.
   * @param data - A data object that contains characteristics and their values.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  update(data: Record<string, any>) {
    const cs = this.characteristics;
    const changed = new Set<CharacteristicName>();

    // loop through each of our characteristics
    for (const c of cs) {
      if (!Object.prototype.hasOwnProperty.call(data, c)) {
        // ignore if this characteristic is not in the data set
        continue;
      }

      if (typeof data[c] === 'object') {
        // if this is an object, we need to check for deep equality
        if (equal(data[c], this[c])) {
          // skip if nothing has changed
          continue;
        }

        // copy the attributes of the characteristic
        Object.assign(this[c], data[c]);
      } else {
        if (data[c] === this[c]) {
          // skip if the value is unchanged
          continue;
        }

        // assign the new value to our characteristic
        this[c] = data[c];
      }

      // add it to the list of changed characteristics
      changed.add(c);
    }

    // emit all change events after the characteristics have been updated
    for (const c of changed) {
      this.emit('change', c, this[c]);
    }
  }
}
