
import { TinyFaceFeatureExtractor } from '../faceFeatureExtractor/TinyFaceFeatureExtractor';
import { FaceLandmark68NetBase } from './FaceLandmark68NetBase';

export class FaceLandmark68TinyNet extends FaceLandmark68NetBase {
  /**
   *
   * @param {TinyFaceFeatureExtractor} faceFeatureExtractor
   */
  constructor(faceFeatureExtractor = new TinyFaceFeatureExtractor()) {
    super('FaceLandmark68TinyNet', faceFeatureExtractor)
  }

  /**
   * @protected
   * @returns {string}
   */
  getDefaultModelName() {
    return 'face_landmark_68_tiny_model'
  }

  /**
   * @protected
   * @returns {number}
   */
 getClassifierChannelsIn() {
    return 128
  }
}
