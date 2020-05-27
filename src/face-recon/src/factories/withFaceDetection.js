import { FaceDetection } from '../classes/FaceDetection';

/**
 *
 * @param {any} obj
 */
export function isWithFaceDetection(obj) {
  return obj['detection'] instanceof FaceDetection
}

/**
 *
 * @param {'TSource'} sourceObj
 * @param {'FaceDetection'} detection
 * @returns {{} & 'TSource' & {detection: FaceDetection}}
 */
export function extendWithFaceDetection(sourceObj, detection) {
  const extension = { detection };
  return Object.assign({}, sourceObj, extension)
}
