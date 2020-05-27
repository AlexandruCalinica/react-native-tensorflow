import { FaceDetection } from '../classes/FaceDetection';
import { FaceLandmarks } from '../classes/FaceLandmarks';
import { isWithFaceDetection } from './WithFaceDetection';


/**
 *
 * @param {any} obj
 */
export function isWithFaceLandmarks(obj) {
  return isWithFaceDetection(obj)
    && obj['landmarks'] instanceof FaceLandmarks
    && obj['unshiftedLandmarks'] instanceof FaceLandmarks
    && obj['alignedRect'] instanceof FaceDetection
}

/**
 *
 * @param {'TSource'} sourceObj
 * @param {'TFaceLandmarks'} unshiftedLandmarks
 * @returns {{} & 'TSource' & {alignedRect: FaceDetection, landmarks: boolean, unshiftedLandmarks: 'TFaceLandmarks'}}
 */
export function extendWithFaceLandmarks (sourceObj, unshiftedLandmarks) {

  const { box: shift } = sourceObj.detection;
  const landmarks = unshiftedLandmarks.shiftBy(shift.x, shift.y);

  const rect = landmarks.align();
  const { imageDims } = sourceObj.detection;
  const alignedRect = new FaceDetection(sourceObj.detection.score, rect.rescale(imageDims.reverse()), imageDims);

  const extension = {
    landmarks,
    unshiftedLandmarks,
    alignedRect
  };

  return Object.assign({}, sourceObj, extension)
}
