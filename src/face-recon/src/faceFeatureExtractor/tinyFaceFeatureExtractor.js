import * as tf from '@tensorflow/tfjs-core';

import { toNetInput } from '../dom';
import { NeuralNetwork } from '../NeuralNetwork';
import { normalize } from '../ops';
import { denseBlock3 } from './denseBlock';
import { extractParamsFromWeigthMapTiny } from './extractParamsFromWeigthMapTiny';
import { extractParamsTiny } from './extractParamsTiny';

export class TinyFaceFeatureExtractor extends NeuralNetwork {

  constructor() {
    super('TinyFaceFeatureExtractor')
  }

  /**
   * @public
   * @param input - NetInput
   * @returns {*} - tf.Tensor4D
   */
  forwardInput(input) {

    const { params } = this;

    if (!params) {
      throw new Error('TinyFaceFeatureExtractor - load model before inference')
    }

    return tf.tidy(() => {
      const batchTensor = input.toBatchTensor(112, true);
      const meanRgb = [122.782, 117.001, 104.298];
      const normalized = normalize(batchTensor, meanRgb).div(tf.scalar(255));

      let out = denseBlock3(normalized, params.dense0, true);
      out = denseBlock3(out, params.dense1);
      out = denseBlock3(out, params.dense2);
      out = tf.avgPool(out, [14, 14], [2, 2], 'valid');

      return out
    })
  }

  /**
   * @public
   * @async
   * @param input - TNetInput
   * @returns {Promise<*>} - tf.Tensor4D
   */
  async forward(input) {
    return this.forwardInput(await toNetInput(input))
  }

  /**
   * @protected
   * @returns {string}
   */
  getDefaultModelName() {
    return 'face_feature_extractor_tiny_model'
  }

  /**
   * @protected
   * @param weightMap - tf.NamedTensorMap
   * @returns {*}
   */
  extractParamsFromWeigthMap(weightMap) {
    return extractParamsFromWeigthMapTiny(weightMap)
  }

  /**
   * @protected
   * @param {Float32Array} weights
   * @returns {*}
   */
  extractParams(weights) {
    return extractParamsTiny(weights)
  }
}
