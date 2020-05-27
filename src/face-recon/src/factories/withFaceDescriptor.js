/**
 *
 * @param {'TSource'} sourceObj
 * @param {Float32Array} descriptor
 * @returns {{} & 'TSource' & {descriptor: Float32Array}}
 */
export function extendWithFaceDescriptor(sourceObj, descriptor) {
  const extension = { descriptor };
  return Object.assign({}, sourceObj, extension)
}
