
import * as tf from '@tensorflow/tfjs-core';

export function fullyConnectedLayer(x, params) {

  return tf.tidy(() =>
    tf.add(
      tf.matMul(x, params.weights),
      params.bias
    )
  )
}
