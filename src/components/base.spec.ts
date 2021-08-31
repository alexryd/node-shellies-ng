import { characteristic, Component } from './base';

type CompoundCharacteristic = {
  characteristic1: string | null;
  characteristic2: number;
};

class TestComponent extends Component {
  @characteristic()
  readonly characteristic1: number = 0;

  @characteristic()
  readonly characteristic2: boolean = false;

  @characteristic()
  readonly characteristic3: CompoundCharacteristic = {
    characteristic1: null,
    characteristic2: 0,
  };

  getCharacteristics(): Set<string> {
    return this.characteristics;
  }
}

describe('Component', () => {
  let component = new TestComponent();

  beforeEach(() => {
    component = new TestComponent();
  });

  describe('.characteristics', () => {
    test('has the defined characteristics', () => {
      const cs = component.getCharacteristics();

      expect(cs.size).toBe(3);
      expect(cs.has('characteristic1')).toBe(true);
      expect(cs.has('characteristic2')).toBe(true);
      expect(cs.has('characteristic3')).toBe(true);
    });
  });

  describe('.update()', () => {
    test('updates the provided characteristics', () => {
      component.update({
        characteristic1: 2,
        characteristic2: true,
        characteristic3: {
          characteristic1: 'shelly',
          characteristic2: 3,
        },
      });

      expect(component.characteristic1).toBe(2);
      expect(component.characteristic2).toBe(true);
      expect(component.characteristic3).toStrictEqual({
        characteristic1: 'shelly',
        characteristic2: 3,
      });
    });

    test('emits `change` events', () => {
      const listener = jest.fn();
      component.on('change', listener);

      component.update({
        characteristic1: 2,
        characteristic2: true,
        characteristic3: {
          characteristic1: 'shelly',
          characteristic2: 3,
        },
      });

      expect(listener).toHaveBeenCalledTimes(3);
      expect(listener).toHaveBeenNthCalledWith(1, 'characteristic1', 2);
      expect(listener).toHaveBeenNthCalledWith(2, 'characteristic2', true);
    });

    test('ignores omitted characteristics', () => {
      const listener = jest.fn();
      component.on('change', listener);

      component.update({
        characteristic2: true,
      });

      expect(component.characteristic1).toBe(0);

      expect(listener).toHaveBeenCalledTimes(1);
    });

    test('ignores unchanged compound characteristics', () => {
      const listener = jest.fn();
      component.on('change', listener);

      component.update({
        characteristic3: {
          characteristic1: null,
          characteristic2: 0,
        },
      });

      expect(listener).toHaveBeenCalledTimes(0);
    });

    test('ignores unknown attributes', () => {
      const listener = jest.fn();
      component.on('change', listener);

      component.update({
        id: 4,
        characteristic1: 3,
        source: 'shelly',
        characteristic2: true,
      });

      expect(component.characteristic1).toBe(3);
      expect(component.characteristic2).toBe(true);
      expect(listener).toHaveBeenCalledTimes(2);
    });
  });
});
