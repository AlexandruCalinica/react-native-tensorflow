
import { extractFCParamsFactory, extractWeightsFactory } from '../common';

/**
 *
 * @param {Float32Array} weights
 * @param {number} channelsIn
 * @param {number} channelsOut
 * @returns {{paramMappings: [], params: {fc: {bias: Tensor, weights: Tensor}}}}
 */
export function extractParams(weights, channelsIn, channelsOut) {

  const paramMappings = [];

  const {
    extractWeights,
    getRemainingWeights
  } = extractWeightsFactory(weights);

  const extractFCParams = extractFCParamsFactory(extractWeights, paramMappings);

  const fc = extractFCParams(channelsIn, channelsOut, 'fc');

  if (getRemainingWeights().length !== 0) {
    throw new Error(`weights remaing after extract: ${getRemainingWeights().length}`)
  }

  return {
    paramMappings,
    params: { fc }
  }
}
