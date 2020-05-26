import { isValidNumber } from '../utils';
import { Box } from './Box';

export class LabeledBox extends Box {

  static assertIsValidLabeledBox(box, callee) {
    Box.assertIsValidBox(box, callee);

    if (!isValidNumber(box.label)) {
      throw new Error(`${callee} - expected property label (${box.label}) to be a number`)
    }
  }

  constructor(box, label) {
    super(box);
    this._label = label;
  }

  get label() { return this._label }

}
