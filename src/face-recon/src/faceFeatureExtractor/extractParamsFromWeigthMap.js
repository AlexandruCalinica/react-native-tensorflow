
import { disposeUnusedWeightTensors } from '../common';
import { loadParamsFactory } from './loadParamsFactory';

/**
 *
 * @param weightMap - tf.NamedTensorMap
 * @returns {{paramMappings: [], params: {dense3: *, dense2: *, dense1: *, dense0: *}}}
 */
export function extractParamsFromWeigthMap(weightMap) {

  const paramMappings = [];

  const {
    extractDenseBlock4Params
  } = loadParamsFactory(weightMap, paramMappings);

  const params = {
    dense0: extractDenseBlock4Params('dense0', true),
    dense1: extractDenseBlock4Params('dense1'),
    dense2: extractDenseBlock4Params('dense2'),
    dense3: extractDenseBlock4Params('dense3')
  };

  disposeUnusedWeightTensors(weightMap, paramMappings);

  return { params, paramMappings }
}
