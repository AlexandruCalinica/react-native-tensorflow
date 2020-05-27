import * as tf from '@tensorflow/tfjs-core';

import { fullyConnectedLayer } from '../common/fullyConnectedLayer';
import { NetInput } from '../dom';
import { NeuralNetwork } from '../NeuralNetwork';
import { extractParams } from './extractParams';
import { extractParamsFromWeigthMap } from './extractParamsFromWeigthMap';
import { seperateWeightMaps } from './util';

export class FaceProcessor extends NeuralNetwork {
  /**
   *
   * @param {string} _name
   * @param faceFeatureExtractor - IFaceFeatureExtractor<TExtractorParams>
   */
  constructor(_name, faceFeatureExtractor) {
    super(_name);
    this._faceFeatureExtractor = faceFeatureExtractor
  }

  /**
   * @public
   * @returns {*} - IFaceFeatureExtractor<TExtractorParams>
   */
  get faceFeatureExtractor()  {
    return this._faceFeatureExtractor
  }

  getDefaultModelName();
  getClassifierChannelsIn();
  getClassifierChannelsOut();

  /**
   * @public
   * @param input - NetInput | tf.Tensor4D
   * @returns {Tensor} - tf.Tensor2D
   */
  runNet(input) {

    const { params } = this;

    if (!params) {
      throw new Error(`${this._name} - load model before inference`)
    }

    return tf.tidy(() => {
      const bottleneckFeatures = input instanceof NetInput
        ? this.faceFeatureExtractor.forwardInput(input)
        : input
      return fullyConnectedLayer(bottleneckFeatures.as2D(bottleneckFeatures.shape[0], -1), params.fc)
    })
  }

  /**
   * @public
   * @param {boolean} throwOnRedispose
   */
  dispose(throwOnRedispose = true) {
    this.faceFeatureExtractor.dispose(throwOnRedispose);
    super.dispose(throwOnRedispose)
  }

  /**
   * @public
   * @param {Float32Array} weights
   */
  loadClassifierParams(weights) {
    const { params, paramMappings } = this.extractClassifierParams(weights);
    this._params = params;
    this._paramMappings = paramMappings
  }

  /**
   * @public
   * @param {Float32Array} weights
   * @returns {*}
   */
  extractClassifierParams(weights) {
    return extractParams(weights, this.getClassifierChannelsIn(), this.getClassifierChannelsOut())
  }

  /**
   * @protected
   * @param weightMap - tf.NamedTensorMap
   * @returns {*}
   */
  extractParamsFromWeigthMap(weightMap) {

    const { featureExtractorMap, classifierMap } = seperateWeightMaps(weightMap);

    this.faceFeatureExtractor.loadFromWeightMap(featureExtractorMap);

    return extractParamsFromWeigthMap(classifierMap)
  }

  /**
   * @protected
   * @param {Float32Array} weights
   * @returns {*}
   */
  extractParams(weights) {

    const cIn = this.getClassifierChannelsIn();
    const cOut = this.getClassifierChannelsOut();
    const classifierWeightSize = (cOut * cIn ) + cOut;

    const featureExtractorWeights = weights.slice(0, weights.length - classifierWeightSize);
    const classifierWeights = weights.slice(weights.length - classifierWeightSize);

    this.faceFeatureExtractor.extractWeights(featureExtractorWeights);
    return this.extractClassifierParams(classifierWeights)
  }
}
