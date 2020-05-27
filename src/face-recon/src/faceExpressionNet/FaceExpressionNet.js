import * as tf from '@tensorflow/tfjs-core';

import { toNetInput } from '../dom';
import { FaceFeatureExtractor } from '../faceFeatureExtractor/FaceFeatureExtractor';
import { FaceProcessor } from '../faceProcessor/FaceProcessor';
import { FaceExpressions } from './FaceExpressions';

export class FaceExpressionNet extends FaceProcessor {
  /**
   *
   * @param {FaceFeatureExtractor} faceFeatureExtractor
   */
  constructor(faceFeatureExtractor = new FaceFeatureExtractor()) {
    super('FaceExpressionNet', faceFeatureExtractor)
  }

  /**
   * @public
   * @param input - NetInput | tf.Tensor4D
   * @returns {{gender: Tensor, age: Tensor}} - tf.Tensor2D
   */
  forwardInput(input) {
    return tf.tidy(() => tf.softmax(this.runNet(input)))
  }

  /**
   * @public
   * @async
   * @param input - TNetInput
   * @returns {Promise<{gender: Tensor, age: Tensor}>} - tf.Tensor2D
   */
  async forward(input) {
    return this.forwardInput(await toNetInput(input))
  }

  /**
   * @public
   * @async
   * @param input - TNetInput
   * @returns {Promise<any>}
   */
  async predictExpressions(input) {
    const netInput = await toNetInput(input);
    const out = await this.forwardInput(netInput);
    const probabilitesByBatch = await Promise.all(tf.unstack(out).map(async t => {
      const data = await t.data();
      t.dispose();
      return data
    }));
    out.dispose();

    const predictionsByBatch = probabilitesByBatch
      .map(probabilites => new FaceExpressions(probabilites as Float32Array));

    return netInput.isBatchInput
      ? predictionsByBatch
      : predictionsByBatch[0]
  }

  /**
   *
   * @returns {string}
   */
  getDefaultModelName() {
    return 'face_expression_model'
  }

  /**
   *
   * @returns {number}
   */
  getClassifierChannelsIn() {
    return 256
  }

  /**
   *
   * @returns {number}
   */
  getClassifierChannelsOut() {
    return 7
  }
}
