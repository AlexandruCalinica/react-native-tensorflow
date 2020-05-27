
import { extractConvParamsFactory, extractSeparableConvParamsFactory } from '../common';

/**
 *
 * @param extractWeights - ExtractWeightsFunction
 * @param paramMappings - ParamMapping[]
 * @returns {{
 *  extractDenseBlock3Params: (function(number, number, string, boolean=): {conv2, conv1, conv0: {bias: Tensor, filters: Tensor}}),
 *  extractDenseBlock4Params: (function(number, number, string, boolean=): {conv3, conv2: 'DenseBlock3Params.conv2', conv1: 'DenseBlock3Params.conv1', conv0: 'DenseBlock3Params.conv0'})
 * }}
 */
export function extractorsFactory(extractWeights, paramMappings) {

  const extractConvParams = extractConvParamsFactory(extractWeights, paramMappings);
  const extractSeparableConvParams = extractSeparableConvParamsFactory(extractWeights, paramMappings);

  /**
   *
   * @param {number} channelsIn
   * @param {number} channelsOut
   * @param {string} mappedPrefix
   * @param {boolean} isFirstLayer
   * @returns {{conv2, conv1, conv0: {bias: Tensor, filters: Tensor}}} - DenseBlock3Params
   */
  function extractDenseBlock3Params(channelsIn, channelsOut, mappedPrefix, isFirstLayer = false) {

    const conv0 = isFirstLayer
      ? extractConvParams(channelsIn, channelsOut, 3, `${mappedPrefix}/conv0`)
      : extractSeparableConvParams(channelsIn, channelsOut, `${mappedPrefix}/conv0`);
    const conv1 = extractSeparableConvParams(channelsOut, channelsOut, `${mappedPrefix}/conv1`);
    const conv2 = extractSeparableConvParams(channelsOut, channelsOut, `${mappedPrefix}/conv2`);

    return { conv0, conv1, conv2 }
  }

  /**
   *
   * @param {number} channelsIn
   * @param {number} channelsOut
   * @param {string} mappedPrefix
   * @param {boolean} isFirstLayer
   * @returns {{conv3, conv2: *, conv1: *, conv0: {bias: Tensor, filters: Tensor}}} - DenseBlock4Params
   */
  function extractDenseBlock4Params(channelsIn, channelsOut, mappedPrefix, isFirstLayer = false)  {

    const { conv0, conv1, conv2 } = extractDenseBlock3Params(channelsIn, channelsOut, mappedPrefix, isFirstLayer);
    const conv3 = extractSeparableConvParams(channelsOut, channelsOut, `${mappedPrefix}/conv3`);

    return { conv0, conv1, conv2, conv3 };
  }

  return {
    extractDenseBlock3Params,
    extractDenseBlock4Params
  }

}
