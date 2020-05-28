import * as tf from '@tensorflow/tfjs-core';

import { extractWeightsFactory } from '../common';
import { isFloat } from '../utils';

/**
 *
 * @param extractWeights - ExtractWeightsFunction
 * @param paramMappings - ParamMapping[]
 * @returns {{extractResidualLayerParams: (function(number, number, number, string, boolean=): {conv2: ConvLayerParams, conv1: ConvLayerParams}), extractConvLayerParams: (function(number, number, number, string): {scale: ScaleLayerParams, conv: ConvParams})}}
 */
function extractorsFactory(extractWeights, paramMappings) {

  /**
   *
   * @param {number} numFilterValues
   * @param {number} numFilters
   * @param {number} filterSize
   * @returns {Tensor} - <Rank.R4>
   */
  function extractFilterValues(numFilterValues, numFilters, filterSize) {
    const weights = extractWeights(numFilterValues);
    const depth = weights.length / (numFilters * filterSize * filterSize);

    if (isFloat(depth)) {
      throw new Error(`depth has to be an integer: ${depth}, weights.length: ${weights.length}, numFilters: ${numFilters}, filterSize: ${filterSize}`)
    };

    return tf.tidy(
      () => tf.transpose(
        tf.tensor4d(weights, [numFilters, depth, filterSize, filterSize]),
        [2, 3, 1, 0]
      )
    );
  }

  /**
   *
   * @param {number} numFilterValues
   * @param {number} numFilters
   * @param {number} filterSize
   * @param {string} mappedPrefix
   * @returns {{bias: Tensor, filters: Tensor}} - ConvParams
   */
  function extractConvParams(numFilterValues, numFilters, filterSize, mappedPrefix) {

    const filters = extractFilterValues(numFilterValues, numFilters, filterSize);
    const bias = tf.tensor1d(extractWeights(numFilters));

    paramMappings.push(
      { paramPath: `${mappedPrefix}/filters` },
      { paramPath: `${mappedPrefix}/bias` }
    );

    return { filters, bias }
  }

  /**
   *
   * @param {number} numWeights
   * @param {string} mappedPrefix
   * @returns {{biases: Tensor, weights: Tensor}} - ScaleLayerParams
   */
  function extractScaleLayerParams(numWeights, mappedPrefix) {

    const weights = tf.tensor1d(extractWeights(numWeights));
    const biases = tf.tensor1d(extractWeights(numWeights));

    paramMappings.push(
      { paramPath: `${mappedPrefix}/weights` },
      { paramPath: `${mappedPrefix}/biases` }
    );

    return {
      weights,
      biases
    }
  }

  /**
   *
   * @param {number} numFilterValues
   * @param {number} numFilters
   * @param {number} filterSize
   * @param {string} mappedPrefix
   * @returns {{scale: {biases: Tensor, weights: Tensor}, conv: {bias: Tensor, filters: Tensor}}} - ConvLayerParams
   */
  function extractConvLayerParams(numFilterValues, numFilters, filterSize, mappedPrefix) {

    const conv = extractConvParams(numFilterValues, numFilters, filterSize, `${mappedPrefix}/conv`);
    const scale = extractScaleLayerParams(numFilters, `${mappedPrefix}/scale`);

    return { conv, scale }
  }

  /**
   *
   * @param {number} numFilterValues
   * @param {number} numFilters
   * @param {number} filterSize
   * @param {string} mappedPrefix
   * @param {boolean} isDown
   * @returns {{conv2: {scale: {biases: Tensor, weights: Tensor}, conv: {bias: Tensor, filters: Tensor}}, conv1: {scale: {biases: Tensor, weights: Tensor}, conv: {bias: Tensor, filters: Tensor}}}} - ResidualLayerParams
   */
  function extractResidualLayerParams(numFilterValues, numFilters, filterSize, mappedPrefix, isDown = false) {

    const conv1 = extractConvLayerParams((isDown ? 0.5 : 1) * numFilterValues, numFilters, filterSize, `${mappedPrefix}/conv1`);
    const conv2 = extractConvLayerParams(numFilterValues, numFilters, filterSize, `${mappedPrefix}/conv2`);

    return { conv1, conv2 }
  }

  return {
    extractConvLayerParams,
    extractResidualLayerParams
  }

}

/**
 *
 * @param {Float32Array} weights
 * @returns {{paramMappings: ParamMapping[], params: {conv256_down: *, conv256_1: *, conv256_2, conv64_2: {conv2: ConvLayerParams, conv1: ConvLayerParams}, conv64_1: {conv2: ConvLayerParams, conv1: ConvLayerParams}, conv256_down_out, conv64_3: {conv2: ConvLayerParams, conv1: ConvLayerParams}, conv32_3: {conv2: ConvLayerParams, conv1: ConvLayerParams}, conv32_2: {conv2: ConvLayerParams, conv1: ConvLayerParams}, conv32_1: {conv2: ConvLayerParams, conv1: ConvLayerParams}, conv128_1: {conv2: ConvLayerParams, conv1: ConvLayerParams}, conv128_2: {conv2: ConvLayerParams, conv1: ConvLayerParams}, conv32_down: {scale: ScaleLayerParams, conv: ConvParams}, fc, conv64_down: {conv2: ConvLayerParams, conv1: ConvLayerParams}, conv128_down: {conv2: ConvLayerParams, conv1: ConvLayerParams}}}}
 */
export function extractParams(weights) {

  const {
    extractWeights,
    getRemainingWeights
  } = extractWeightsFactory(weights);

  const paramMappings = [];

  const {
    extractConvLayerParams,
    extractResidualLayerParams
  } = extractorsFactory(extractWeights, paramMappings);

  const conv32_down = extractConvLayerParams(4704, 32, 7, 'conv32_down');
  const conv32_1 = extractResidualLayerParams(9216, 32, 3, 'conv32_1');
  const conv32_2 = extractResidualLayerParams(9216, 32, 3, 'conv32_2');
  const conv32_3 = extractResidualLayerParams(9216, 32, 3, 'conv32_3');

  const conv64_down = extractResidualLayerParams(36864, 64, 3, 'conv64_down', true);
  const conv64_1 = extractResidualLayerParams(36864, 64, 3, 'conv64_1');
  const conv64_2 = extractResidualLayerParams(36864, 64, 3, 'conv64_2');
  const conv64_3 = extractResidualLayerParams(36864, 64, 3, 'conv64_3');

  const conv128_down = extractResidualLayerParams(147456, 128, 3, 'conv128_down', true);
  const conv128_1 = extractResidualLayerParams(147456, 128, 3, 'conv128_1');
  const conv128_2 = extractResidualLayerParams(147456, 128, 3, 'conv128_2');

  const conv256_down = extractResidualLayerParams(589824, 256, 3, 'conv256_down', true);
  const conv256_1 = extractResidualLayerParams(589824, 256, 3, 'conv256_1');
  const conv256_2 = extractResidualLayerParams(589824, 256, 3, 'conv256_2');
  const conv256_down_out = extractResidualLayerParams(589824, 256, 3, 'conv256_down_out');

  const fc = tf.tidy(
    () => tf.transpose(tf.tensor2d(extractWeights(256 * 128), [128, 256]), [1, 0])
  );
  paramMappings.push({ paramPath: `fc` });

  if (getRemainingWeights().length !== 0) {
    throw new Error(`weights remaing after extract: ${getRemainingWeights().length}`);
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

  return { params, paramMappings }
}
