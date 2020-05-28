
import { disposeUnusedWeightTensors, extractWeightEntryFactory } from '../common';
import { isTensor2D } from '../utils';

/**
 *
 * @param weightMap - any
 * @param paramMappings - ParamMapping[]
 * @returns {{extractResidualLayerParams: (function(string): {conv2: ConvLayerParams, conv1: ConvLayerParams}), extractConvLayerParams: (function(string): {scale: ScaleLayerParams, conv: {bias: boolean, filters: boolean}})}}
 */
function extractorsFactory(weightMap, paramMappings) {

  const extractWeightEntry = extractWeightEntryFactory(weightMap, paramMappings);

  /**
   *
   * @param {string} prefix
   * @returns {{biases: boolean, weights: boolean}} - ScaleLayerParams
   */
  function extractScaleLayerParams(prefix) {

    const weights = extractWeightEntry(`${prefix}/scale/weights`, 1);
    const biases = extractWeightEntry(`${prefix}/scale/biases`, 1);

    return { weights, biases }
  }

  /**
   *
   * @param {string} prefix
   * @returns {{scale: {biases: boolean, weights: boolean}, conv: {bias: boolean, filters: boolean}}} - ConvLayerParams
   */
  function extractConvLayerParams(prefix) {

    const filters = extractWeightEntry(`${prefix}/conv/filters`, 4);
    const bias = extractWeightEntry(`${prefix}/conv/bias`, 1);
    const scale = extractScaleLayerParams(prefix);

    return { conv: { filters, bias }, scale }
  }

  /**
   *
   * @param {string} prefix
   * @returns {{conv2: {scale: {biases: boolean, weights: boolean}, conv: {bias: boolean, filters: boolean}}, conv1: {scale: {biases: boolean, weights: boolean}, conv: {bias: boolean, filters: boolean}}}} - ResidualLayerParams
   */
  function extractResidualLayerParams(prefix) {
    return {
      conv1: extractConvLayerParams(`${prefix}/conv1`),
      conv2: extractConvLayerParams(`${prefix}/conv2`)
    }
  }

  return {
    extractConvLayerParams,
    extractResidualLayerParams
  }

}

/**
 *
 * @param weightMap - tf.NamedTensorMap
 * @returns {{paramMappings: ParamMapping[], params: {conv256_down: *, conv256_1: *, conv256_2, conv64_2: {conv2: ConvLayerParams, conv1: ConvLayerParams}, conv64_1: {conv2: ConvLayerParams, conv1: ConvLayerParams}, conv256_down_out, conv64_3: {conv2: ConvLayerParams, conv1: ConvLayerParams}, conv32_3: {conv2: ConvLayerParams, conv1: ConvLayerParams}, conv32_2: {conv2: ConvLayerParams, conv1: ConvLayerParams}, conv32_1: {conv2: ConvLayerParams, conv1: ConvLayerParams}, conv128_1: {conv2: ConvLayerParams, conv1: ConvLayerParams}, conv128_2: {conv2: ConvLayerParams, conv1: ConvLayerParams}, conv32_down: {scale: ScaleLayerParams, conv: {bias: boolean, filters: boolean}}, fc, conv64_down: {conv2: ConvLayerParams, conv1: ConvLayerParams}, conv128_down: {conv2: ConvLayerParams, conv1: ConvLayerParams}}}}
 */
export function extractParamsFromWeigthMap(weightMap) {

  const paramMappings = [];

  const {
    extractConvLayerParams,
    extractResidualLayerParams
  } = extractorsFactory(weightMap, paramMappings);

  const conv32_down = extractConvLayerParams('conv32_down');
  const conv32_1 = extractResidualLayerParams('conv32_1');
  const conv32_2 = extractResidualLayerParams('conv32_2');
  const conv32_3 = extractResidualLayerParams('conv32_3');

  const conv64_down = extractResidualLayerParams('conv64_down');
  const conv64_1 = extractResidualLayerParams('conv64_1');
  const conv64_2 = extractResidualLayerParams('conv64_2');
  const conv64_3 = extractResidualLayerParams('conv64_3');

  const conv128_down = extractResidualLayerParams('conv128_down');
  const conv128_1 = extractResidualLayerParams('conv128_1');
  const conv128_2 = extractResidualLayerParams('conv128_2');

  const conv256_down = extractResidualLayerParams('conv256_down');
  const conv256_1 = extractResidualLayerParams('conv256_1');
  const conv256_2 = extractResidualLayerParams('conv256_2');
  const conv256_down_out = extractResidualLayerParams('conv256_down_out');

  const fc = weightMap['fc'];
  paramMappings.push({ originalPath: 'fc', paramPath: 'fc' });

  if (!isTensor2D(fc)) {
    throw new Error(`expected weightMap[fc] to be a Tensor2D, instead have ${fc}`)
  }

  const params = {
    conv32_down,
    conv32_1,
    conv32_2,
    conv32_3,
    conv64_down,
    conv64_1,
    conv64_2,
    conv64_3,
    conv128_down,
    conv128_1,
    conv128_2,
    conv256_down,
    conv256_1,
    conv256_2,
    conv256_down_out,
    fc
  };

  disposeUnusedWeightTensors(weightMap, paramMappings);

  return { params, paramMappings }
}
