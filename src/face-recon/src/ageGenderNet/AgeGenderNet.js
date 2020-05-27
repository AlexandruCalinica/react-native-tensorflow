import * as tf from '@tensorflow/tfjs-core';

import { fullyConnectedLayer } from '../common/fullyConnectedLayer';
import { seperateWeightMaps } from '../faceProcessor/util';
import { TinyXception } from '../xception/TinyXception';
import { extractParams } from './extractParams';
import { extractParamsFromWeigthMap } from './extractParamsFromWeigthMap';
import { NeuralNetwork } from '../NeuralNetwork';
import { NetInput, toNetInput } from '../dom';

let Gender = {
  FEMALE: 'female',
  MALE: 'male'
};

/**
 * @extends NeuralNetwork
 */
export class AgeGenderNet extends NeuralNetwork {
  /**
   *
   * @param {TinyXception} faceFeatureExtractor
   */
  constructor(faceFeatureExtractor = new TinyXception(2)) {
    super('AgeGenderNet');
    this._faceFeatureExtractor = faceFeatureExtractor
  }

  /**
   * @public
   * @returns {TinyXception}
   */
  get faceFeatureExtractor() {
    return this._faceFeatureExtractor
  }

  /**
   * @public
   * @param input -  NetInput | tf.Tensor4D
   * @returns {{gender: Tensor<Rank>, age: Tensor1D}}
   */
  runNet(input) {

    const { params } = this;

    if (!params) {
      throw new Error(`${this._name} - load model before inference`)
    }

    return tf.tidy(() => {
      const bottleneckFeatures = input instanceof NetInput
        ? this.faceFeatureExtractor.forwardInput(input)
        : input;

      const pooled = tf.avgPool(bottleneckFeatures, [7, 7], [2, 2], 'valid').as2D(bottleneckFeatures.shape[0], -1);
      const age = fullyConnectedLayer(pooled, params.fc.age).as1D();
      const gender = fullyConnectedLayer(pooled, params.fc.gender);
      return { age, gender }
    })
  }

  /**
   * @public
   * @param input - NetInput | tf.Tensor4D
   * @returns {{gender: Tensor<Rank>, age: Tensor1D}}
   */
  forwardInput(input) {
    return tf.tidy(() => {
      const { age, gender } = this.runNet(input);
      return { age, gender: tf.softmax(gender) }
    })
  }

  /**
   * @public
   * @async
   * @param input - TNetInput
   * @returns {Promise<{gender: Tensor<Rank>, age: Tensor1D}>}
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
  async predictAgeAndGender(input) {
    const netInput = await toNetInput(input);
    const out = await this.forwardInput(netInput);

    const ages = tf.unstack(out.age);
    const genders = tf.unstack(out.gender);
    const ageAndGenderTensors = ages.map((ageTensor, i) => ({
      ageTensor,
      genderTensor: genders[i]
    }));

    const predictionsByBatch = await Promise.all(
      ageAndGenderTensors.map(async ({ ageTensor, genderTensor }) => {
        const age = (await ageTensor.data())[0];
        const probMale = (await genderTensor.data())[0];
        const isMale = probMale > 0.5;
        const gender = isMale ? Gender.MALE : Gender.FEMALE;
        const genderProbability = isMale ? probMale : (1 - probMale);

        ageTensor.dispose();
        genderTensor.dispose();
        return { age, gender, genderProbability }
      })
    );
    out.age.dispose();
    out.gender.dispose();

    return netInput.isBatchInput
      ? predictionsByBatch
      : predictionsByBatch[0]
  }

  /**
   * @protected
   * @returns {string}
   */
  getDefaultModelName() {
    return 'age_gender_model'
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
    return extractParams(weights)
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

    const classifierWeightSize = (512 * 1 + 1) + (512 * 2 + 2);

    const featureExtractorWeights = weights.slice(0, weights.length - classifierWeightSize);
    const classifierWeights = weights.slice(weights.length - classifierWeightSize);

    this.faceFeatureExtractor.extractWeights(featureExtractorWeights);
    return this.extractClassifierParams(classifierWeights)
  }
}
