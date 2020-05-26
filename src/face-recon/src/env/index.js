import { createFileSystem } from './createFileSystem';
import { createReactNativeEnv } from './createReactNativeEnv';
import { isReactNative } from "./isReactNative";

let environment;

function getEnv() {
  if (!environment) {
    throw new Error('getEnv - environment is not defined, check isReactNative()')
  }
  return environment
}

function setEnv(env) {
  environment = env
}

function initialize() {
  if (isReactNative()) {
    return setEnv(createReactNativeEnv())
  }
}

function monkeyPatch(env) {
  if (!environment) {
    initialize()
  }

  if (!environment) {
    throw new Error('monkeyPatch - environment is not defined, check isReactNative()')
  }

  const { Canvas = environment.Canvas, Image = environment.Image } = env;
  environment.Canvas = Canvas;
  environment.Image = Image;
  environment.createCanvasElement = env.createCanvasElement || (() => new Canvas());
  environment.createImageElement = env.createImageElement || (() => new Image());

  environment.ImageData = env.ImageData || environment.ImageData;
  environment.Video = env.Video || environment.Video;
  environment.fetch = env.fetch || environment.fetch;
  environment.readFile = env.readFile || environment.readFile;
}

export const env = {
  getEnv,
  setEnv,
  initialize,
  createReactNativeEnv,
  createFileSystem,
  monkeyPatch,
  isReactNative
};

initialize();
