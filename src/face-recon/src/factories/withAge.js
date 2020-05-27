/**
 *
 * @param {any} obj
 */
export function isWithAge(obj) {
  return typeof obj['age'] === 'number'
}

/**
 *
 * @param {'TSource'} sourceObj
 * @param {number} age
 * @returns {{} & 'TSource' & {age: number}}
 */
export function extendWithAge(sourceObj, age) {
  const extension = { age };
  return Object.assign({}, sourceObj, extension)
}
