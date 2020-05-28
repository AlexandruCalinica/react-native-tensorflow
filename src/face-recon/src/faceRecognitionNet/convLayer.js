
import * as tf from '@tensorflow/tfjs-core';

import { scale } from './scaleLayer';

/**
 *
 * @param x -  tf.Tensor4D
 * @param params - ConvLayerParams
 * @param strides - [number, number]
 * @param {boolean} withRelu
 * @param padding - 'valid' | 'same'
 * @returns {any} - tf.Tensor4D
 */
function convLayer(x, params, strides, withRelu, padding = 'same') {
  const { filters, bias } = params.conv;

  let out = tf.conv2d(x, filters, strides, padding);
  out = tf.add(out, bias);
  out = scale(out, params.scale);
  return withRelu ? tf.relu(out) : out
}

/**
 *
 * @param x - tf.Tensor4D
 * @param params - ConvLayerParams
 * @returns {any}
 */
export function conv(x, params) {
  return convLayer(x, params, [1, 1], true)
}

/**
 *
 * @param x - tf.Tensor4D
 * @param params - ConvLayerParams
 * @returns {any}
 */
export function convNoRelu(x, params) {
  return convLayer(x, params, [1, 1], false)
}

/**
 *
 * @param x - tf.Tensor4D
 * @param params - ConvLayerParams
 * @returns {any}
 */
export function convDown(x, params) {
  return convLayer(x, params, [2, 2], true, 'valid')
}
