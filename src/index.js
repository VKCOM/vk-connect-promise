/* global window, parent */
/* eslint no-restricted-globals: ["off", "parent"] */
import './custom-event-polyfill';
import DESKTOP_EVENTS from './desktop-events';

const FUNCTION = 'function';
const UNDEFINED = 'undefined';
const isClient = typeof window !== UNDEFINED;
const isIOSNativeClient =
    isClient &&
    window.webkit &&
    window.webkit.messageHandlers !== undefined &&
    window.webkit.messageHandlers.VKWebAppClose !== undefined;

const androidBridge = isClient && window.AndroidBridge;
const iosBridge = isIOSNativeClient && window.webkit.messageHandlers;
const isWeb = !androidBridge && !iosBridge;
const eventType = isWeb ? 'message' : 'VKWebAppEvent';
const promises = {};
let methodCounter = 0;
let frameId = '';
const subscribers = [];

window.addEventListener(eventType, (event) => {
  let promise = null;
  let response = {};

  if (isWeb) {
    if (event.data.type && event.data.type === 'VKWebAppSettings') {
      frameId = event.data.frameId;
      return;
    }
    if (event.data.hasOwnProperty('frameId')) {
      delete event.data.frameId;
    }
    if (event.data.hasOwnProperty('connectVersion')) {
      delete event.data.connectVersion;
    }
  }

  if (subscribers.length > 0) {
    subscribeHandler(event);
  }

  if (isWeb) {
    if (event.data && event.data.data) {
      response = { ...event.data };
      promise = promises[response.data.request_id];
    }
  } else if (event.detail && event.detail.data) {
    response = { ...event.detail };
    promise = promises[response.data.request_id];
  }

  if (response.data && response.data.request_id) {
    promise = promises[response.data.request_id];
    if (promise) {
      if (promise.customRequestId) {
        delete response.data['request_id'];
      }
      if (response.data['error_type']) {
        return promise.reject(response);
      } else {
        return promise.resolve(response);
      }
    }
  }
});

const subscribeHandler = (event) => {
  const _subscribers = subscribers.slice();
  const data = {};
  if (isWeb) {
    data.detail = { ...event.data };
  } else if (event.detail && event.detail.data) {
    data.detail = { ...event.detail };
  }
  _subscribers.forEach((fn) => {
    fn(data);
  });
};

export default (() => {
  return {
    /**
     * Sends a message to native client
     *
     *
     * @param {String} handler Message type
     * @param {Object} params Message data
     * @returns {Promise}
     */
    send: (handler, params) => {
      if (!params) {
        params = {};
      }
      const id = params['request_id'] ? params['request_id'] : `method#${methodCounter++}`;
      let customRequestId = false;
      if (!params.hasOwnProperty('request_id')) {
        customRequestId = true;
        params['request_id'] = id;
      }

      if (androidBridge && typeof androidBridge[handler] === FUNCTION) {
        androidBridge[handler](JSON.stringify(params));
      }
      if (iosBridge && iosBridge[handler] && typeof iosBridge[handler].postMessage === FUNCTION) {
        iosBridge[handler].postMessage(params);
      }

      if (isWeb) {
        parent.postMessage({
          handler,
          params,
          frameId,
          type: 'vk-connect',
        }, '*');
      }

      if (handler !== 'VKWebAppInit') {
        return new Promise((resolve, reject) => {
          promises[id] = {
            resolve,
            reject,
            params,
            customRequestId,
          };
        });
      }
    },
    supports: (handler) => {
      if (androidBridge && typeof androidBridge[handler] === FUNCTION) return true;

      if (iosBridge && iosBridge[handler] && typeof iosBridge[handler].postMessage === FUNCTION) return true;

      if (~DESKTOP_EVENTS.indexOf(handler)) return true;

      return false;
    },
    subscribe: (fn) => {
      subscribers.push(fn);
    },
  };
})();
