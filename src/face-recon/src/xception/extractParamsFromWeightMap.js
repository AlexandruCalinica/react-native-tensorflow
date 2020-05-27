import * as tf from '@tensorflow/tfjs-core';

import {
  disposeUnusedWeightTensors,
  extractWeightEntryFactory,
  loadSeparableConvParamsFactory,
} from '../common';
import { loadConvParamsFactory } from '../common/loadConvParamsFactory';
import { range } from '../utils';

/**
 *
 * @param {"tf.NamedTensorMap"} weightMap
 * @param {'ParamMapping[]'} paramMappings
 * @returns {{
 *  extractConvParams: (function(...[*]=)),
 *  extractMainBlockParams: (function(string): {separable_conv2, separable_conv1, separable_conv0}),
 *  extractReductionBlockParams: (function(string): {expansion_conv: {bias: *, filters: *}, separable_conv1, separable_conv0}),
 *  extractSeparableConvParams: (function(*): 'SeparableConvParams')}}
 */
function loadParamsFactory(weightMap, paramMappings) {

  const extractWeightEntry = extractWeightEntryFactory(weightMap, paramMappings);

  const extractConvParams = loadConvParamsFactory(extractWeightEntry);
  const extractSeparableConvParams = loadSeparableConvParamsFactory(extractWeightEntry);

  /**
   *
   * @param {string} mappedPrefix
   * @returns {{expansion_conv: {bias: *, filters: *}, separable_conv1, separable_conv0}}
   */
  function extractReductionBlockParams(mappedPrefix) {

    const separable_conv0 = extractSeparableConvParams(`${mappedPrefix}/separable_conv0`);
    const separable_conv1 = extractSeparableConvParams(`${mappedPrefix}/separable_conv1`);
    const expansion_conv = extractConvParams(`${mappedPrefix}/expansion_conv`);

    return { separable_conv0, separable_conv1, expansion_conv }
  }

  /**
   *
   * @param {string} mappedPrefix
   * @returns {{separable_conv2, separable_conv1, separable_conv0}}
   */
  function extractMainBlockParams(mappedPrefix) {

    const separable_conv0 = extractSeparableConvParams(`${mappedPrefix}/separable_conv0`);
    const separable_conv1 = extractSeparableConvParams(`${mappedPrefix}/separable_conv1`);
    const separable_conv2 = extractSeparableConvParams(`${mappedPrefix}/separable_conv2`);

    return { separable_conv0, separable_conv1, separable_conv2 }
  }

  return {
    extractConvParams,
    extractSeparableConvParams,
    extractReductionBlockParams,
    extractMainBlockParams
  }
}

/**
 *
 * @param {'tf.NamedTensorMap'} weightMap
 * @param {number} numMainBlocks
 * @returns {{
 *  paramMappings: 'ParamMapping[]',
 *  params: {
 *    exit_flow: {
 *      reduction_block: {
 *        expansion_conv: {bias: *, filters: *},
 *        separable_conv1,
 *        separable_conv0
 *      },
 *      separable_conv: "SeparableConvParams"
 *    },
 *    middle_flow: {},
 *    entry_flow: {
 *      reduction_block_0: {
 *        expansion_conv: {bias: *, filters: *},
 *        separable_conv1,
 *        separable_conv0
 *      },
 *      reduction_block_1: {
 *        expansion_conv: {bias: *, filters: *},
 *        separable_conv1,
 *        separable_conv0
 *      },
 *      conv_in: *
 *    }
 *  }
 * }}
 */
export function extractParamsFromWeigthMap(weightMap, numMainBlocks) {

  const paramMappings = [];

  const {
    extractConvParams,
    extractSeparableConvParams,
    extractReductionBlockParams,
    extractMainBlockParams
  } = loadParamsFactory(weightMap, paramMappings);

  const entry_flow_conv_in = extractConvParams('entry_flow/conv_in');
  const entry_flow_reduction_block_0 = extractReductionBlockParams('entry_flow/reduction_block_0');
  const entry_flow_reduction_block_1 = extractReductionBlockParams('entry_flow/reduction_block_1');

  const entry_flow = {
    conv_in: entry_flow_conv_in,
    reduction_block_0: entry_flow_reduction_block_0,
    reduction_block_1: entry_flow_reduction_block_1
  };

  const middle_flow = {};
  range(numMainBlocks, 0, 1).forEach((idx) => {
    middle_flow[`main_block_${idx}`] = extractMainBlockParams(`middle_flow/main_block_${idx}`)
  });

  const exit_flow_reduction_block = extractReductionBlockParams('exit_flow/reduction_block');
  const exit_flow_separable_conv = extractSeparableConvParams('exit_flow/separable_conv');

  const exit_flow = {
    reduction_block: exit_flow_reduction_block,
    separable_conv: exit_flow_separable_conv
  };

  disposeUnusedWeightTensors(weightMap, paramMappings);

  return { params: { entry_flow, middle_flow, exit_flow }, paramMappings }
}
