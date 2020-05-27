import { FaceFeatureExtractor } from '../faceFeatureExtractor/FaceFeatureExtractor';
import { FaceLandmark68NetBase } from './FaceLandmark68NetBase';

export class FaceLandmark68Net extends FaceLandmark68NetBase {
  /**
   *
   * @param {FaceFeatureExtractor} faceFeatureExtractor
   */
  constructor(faceFeatureExtractor = new FaceFeatureExtractor()) {
    super('FaceLandmark68Net', faceFeatureExtractor)
  }

  /**
   * @protected
   * @returns {string}
   */
  getDefaultModelName() {
    return 'face_landmark_68_model'
  }

  /**
   * @protected
   * @returns {number}
   */
  getClassifierChannelsIn() {
    return 256
  }
}
