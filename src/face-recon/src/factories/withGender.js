
import { isValidProbablitiy } from '../utils';

const Gender = {
 FEMALE: 'female',
 MALE: 'male'
};

/**
 *
 * @param {any} obj
 */
export function isWithGender(obj) {
  return (obj['gender'] === Gender.MALE || obj['gender'] === Gender.FEMALE)
  && isValidProbablitiy(obj['genderProbability'])
}

/**
 *
 * @param {'TSource'} sourceObj
 * @param {'Gender'} gender
 * @param {number} genderProbability
 * @returns {{} & 'TSource' & {gender: Gender, genderProbability: number}}
 */
export function extendWithGender(sourceObj, gender, genderProbability) {
  const extension = { gender, genderProbability };
  return Object.assign({}, sourceObj, extension)
}
