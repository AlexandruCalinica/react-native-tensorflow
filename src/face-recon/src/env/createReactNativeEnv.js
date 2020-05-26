import { createFileSystem } from './createFileSystem';

export function createReactNativeEnv() {

  const Canvas = global['Canvas'] || global['HTMLCanvasElement'];
  const Image = global['Image'] || global['HTMLImageElement'];

  const createCanvasElement = function() {
    if (Canvas) {
      return new Canvas()
    }
    throw new Error('createCanvasElement - missing Canvas implementation for react-native environment')
  };

  const createImageElement = function() {
    if (Image) {
      return new Image()
    }
    throw new Error('createImageElement - missing Image implementation for react-native environment')
  };

  const fetch = global['fetch'] || function() {
    throw new Error('fetch - missing fetch implementation for react-native environment')
  };

  const fileSystem = createFileSystem();

  return {
    Canvas: Canvas || class {},
    CanvasRenderingContext2D: global['CanvasRenderingContext2D'] || class {},
    Image: Image || class {},
    ImageData: global['ImageData'] || class {},
    Video: global['HTMLVideoElement'] || class {},
    createCanvasElement,
    createImageElement,
    fetch,
    ...fileSystem
  }
}
