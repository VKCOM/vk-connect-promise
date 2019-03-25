import '@babel/polyfill';

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

if (!window.CustomEvent) {
  (function () {
    function CustomEvent(event, params) {
      params = params || {
        bubbles: false,
        cancelable: false,
        detail: undefined
      };
      var evt = document.createEvent('CustomEvent');
      evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
      return evt;
    }
    CustomEvent.prototype = window.Event.prototype;
    window.CustomEvent = CustomEvent;
  })();
}

/* global window, parent */

/* eslint no-restricted-globals: ["off", "parent"] */

var FUNCTION = 'function';
var UNDEFINED = 'undefined';
var EVENT_PREFIX = 'VKWebApp';
var isClient = typeof window !== UNDEFINED;
var androidBridge = isClient && window.AndroidBridge;
var iosBridge = isClient && window.webkit && window.webkit.messageHandlers;
var isWeb = !androidBridge && !iosBridge;
var eventType = isWeb ? 'message' : 'VKWebAppEvent';
var promises = {};
var desktopEvents = [];
var method_counter = 0;

function getUrlParams(search) {
  var hashes = search.slice(search.indexOf('?') + 1).split('&');
  var params = {};
  hashes.map(function (hash) {
    var _hash$split = hash.split('='),
        key = _hash$split[0],
        val = _hash$split[1];

    params[key] = decodeURIComponent(val);
  });
  return params;
}

window.addEventListener(eventType, function (event) {
  var promise = null;
  var response = {};

  if (isWeb) {
    if (event.data && event.data.data) {
      response = _extends({}, event.data);
      promise = promises[response.data.request_id];

      if (response.type === 'VkWebAppInitResult' && response.data['events_list']) {
        desktopEvents = [].concat(response.data['events_list']);
      }
    }
  } else if (event.detail && event.detail.data) {
    response = _extends({}, event.detail);
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
var index = (function () {
  var urlParams = getUrlParams(window.location.href);

  if (urlParams['vk_events']) {
    desktopEvents = urlParams['vk_events'].split(',').map(function (event) {
      return EVENT_PREFIX + event;
    });
  }

  return {
    /**
     * Sends a message to native client
     *
     *
     * @param {String} handler Message type
     * @param {Object} params Message data
     * @returns {Promise}
     */
    send: function send(handler, params) {
      if (!params) {
        params = {};
      }

      var id = params['request_id'] ? params['request_id'] : "method#" + method_counter++;
      var customRequestId = false;

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
          handler: handler,
          params: params,
          type: 'vk-connect'
        }, '*');
      }

      return new Promise(function (resolve, reject) {
        promises[id] = {
          resolve: resolve,
          reject: reject,
          params: params,
          customRequestId: customRequestId
        };
      });
    },
    supports: function supports(handler) {
      if (androidBridge && typeof androidBridge[handler] === FUNCTION) return true;
      if (iosBridge && iosBridge[handler] && typeof iosBridge[handler].postMessage === FUNCTION) return true;
      if (~desktopEvents.indexOf(handler)) return true;
      return false;
    }
  };
})();

export default index;
