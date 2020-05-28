
import * as tf from '@tensorflow/tfjs-core';

/**
 *
 * @param x - tf.Tensor4D
 * @param params - ScaleLayerParams
 * @returns {Tensor} - <Rank.R4>
 */
export function scale(x, params) {
  return tf.add(tf.mul(x, params.weights), params.biases)
}
