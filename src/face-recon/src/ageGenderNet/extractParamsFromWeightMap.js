

import { disposeUnusedWeightTensors, extractWeightEntryFactory } from '../common';

/**
 *
 * @param weightMap - tf.NamedTensorMap
 * @returns {{paramMappings: [], params: {fc: {gender: 'FCParams', age: 'FCParams'}}}}
 */
export function extractParamsFromWeigthMap(weightMap) {

  const paramMappings = [];

  const extractWeightEntry = extractWeightEntryFactory(weightMap, paramMappings);

  /**
   *
   * @param {string} prefix
   * @returns {{bias: boolean, weights: boolean}}
   */
  function extractFcParams(prefix) {
    const weights = extractWeightEntry(`${prefix}/weights`, 2);
    const bias = extractWeightEntry(`${prefix}/bias`, 1);
    return { weights, bias }
  }

  const params = {
    fc: {
      age: extractFcParams('fc/age'),
      gender: extractFcParams('fc/gender')
    }
  };

  disposeUnusedWeightTensors(weightMap, paramMappings);

  return { params, paramMappings }
}
