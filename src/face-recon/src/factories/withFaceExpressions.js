import { FaceExpressions } from '../faceExpressionNet/FaceExpressions';

/**
 *
 * @param {any} obj
 */
export function isWithFaceExpressions(obj) {
  return obj['expressions'] instanceof FaceExpressions
}

/**
 *
 * @param {'TSource'} sourceObj
 * @param {'FaceExpressions'} expressions
 * @returns {{} & 'TSource' & {expressions: FaceExpressions}}
 */
export function extendWithFaceExpressions (sourceObj, expressions) {
  const extension = { expressions };
  return Object.assign({}, sourceObj, extension)
}
