import { FaceRecognitionNet } from './FaceRecognitionNet';

export * from './FaceRecognitionNet';

/**
 *
 * @param {Float32Array} weights
 * @returns {FaceRecognitionNet}
 */
export function createFaceRecognitionNet(weights) {
  const net = new FaceRecognitionNet();
  net.extractWeights(weights);
  return net
}
