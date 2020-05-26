import { env } from '../env';

export function resolveInput(arg) {
  if (!env.isReactNative() && typeof arg === 'string') {
    return document.getElementById(arg)
  }
  return arg
}
