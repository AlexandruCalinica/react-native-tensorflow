# React-Native-Tensorflow
React-Native starter project for working with Tensorflow.js 

This project was boostraped with [Create-React-Native-App](https://github.com/expo/create-react-native-app) and yarn.

## Features

- [Tensorflow.js for React Native](https://www.npmjs.com/package/@tensorflow/tfjs-react-native)
- Native project ready to be built on any supported device.
- Pre-installed unimodules and auto-linking needed by [@tensorflow/tfjs-react-native](https://www.npmjs.com/package/@tensorflow/tfjs-react-native) to work properly.
- Pre-installed [tensorflow](https://www.npmjs.com/package/@tensorflow/tfjs-react-native) peer dependencies:
  - [@tensorflow/tfjs](https://www.npmjs.com/package/@tensorflow/tfjs)
  - [react-native-fs](https://www.npmjs.com/package/react-native-fs)
  - [@react-native-community/async-storage](https://www.npmjs.com/package/@react-native-community/async-storage)
  - [react-native-windows](https://www.npmjs.com/package/react-native-windows)
- Pre-installed expo dependencies:
  - [expo-gl-cpp](https://github.com/expo/expo/tree/master/packages/expo-gl-cpp)
  - [expo-gl](https://www.npmjs.com/package/expo-gl)
  - [expo-camera](https://www.npmjs.com/package/expo-camera)
  

## Environment Requirements
Follow the [React-Native](https://reactnative.dev/docs/environment-setup) docs to prepare the environment for running React-Native

Optionally you can install [expo cli](https://expo.io/tools#cli).
```sh
npm install expo-cli --global
```

## Set-up
Clone this repository and ```cd``` into the directory.

In the terminal run:
```sh
yarn install
```
or 
```sh
npm install
```
to install the project dependencies.
Then run:
```sh
npx pod-install
```
or
```sh
cd ios
pod install
```
to install cocoa pods.


## Usage

- `yarn ios` -- (`react-native run-ios`) Build the iOS App (requires a MacOS computer).
- `yarn android` -- (`react-native run-android`) Build the Android App.
- `yarn web` -- (`expo start:web`) Run the website in your browser.
