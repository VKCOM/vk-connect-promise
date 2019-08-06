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

var DESKTOP_EVENTS = ['VKWebAppGetAuthToken', 'VKWebAppCallAPIMethod', 'VKWebAppAddToCommunity', 'VKWebAppGetGeodata', 'VKWebAppGetUserInfo', 'VKWebAppGetPhoneNumber', 'VKWebAppGetClientVersion', 'VKWebAppGetCommunityAuthToken', 'VKWebAppOpenPayForm', 'VKWebAppShare', 'VKWebAppAllowNotifications', 'VKWebAppDenyNotifications', 'VKWebAppShowWallPostBox', 'VKWebAppGetEmail', 'VKWebAppAllowMessagesFromGroup', 'VKWebAppJoinGroup', 'VKWebAppOpenApp', 'VKWebAppSetViewSettings', 'VKWebAppSetLocation', 'VKWebAppScroll', 'VKWebAppResizeWindow'];

var FUNCTION = 'function';
var UNDEFINED = 'undefined';
var isClient = typeof window !== UNDEFINED;
var androidBridge = isClient && window.AndroidBridge;
var iosBridge = isClient && window.webkit && window.webkit.messageHandlers;
var isWeb = !androidBridge && !iosBridge;
var eventType = isWeb ? 'message' : 'VKWebAppEvent';
var promises = {};
var methodCounter = 0;
var frameId = '';
var subscribers = [];
window.addEventListener(eventType, function (event) {
  var promise = null;
  var response = {};

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
      response = _extends({}, event.data);
      promise = promises[response.data.request_id];
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

var subscribeHandler = function subscribeHandler(event) {
  var _subscribers = subscribers.slice();

  var data = {};

  if (isWeb) {
    data.detail = _extends({}, event.data);
  } else if (event.detail && event.detail.data) {
    data.detail = _extends({}, event.detail);
  }

  _subscribers.forEach(function (fn) {
    fn(data);
  });
};

var index = (function () {
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

      var id = params['request_id'] ? params['request_id'] : "method#" + methodCounter++;
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
          frameId: frameId,
          type: 'vk-connect'
        }, '*');
      }

      if (handler !== 'VKWebAppInit') {
        return new Promise(function (resolve, reject) {
          promises[id] = {
            resolve: resolve,
            reject: reject,
            params: params,
            customRequestId: customRequestId
          };
        });
      }
    },
    supports: function supports(handler) {
      if (androidBridge && typeof androidBridge[handler] === FUNCTION) return true;
      if (iosBridge && iosBridge[handler] && typeof iosBridge[handler].postMessage === FUNCTION) return true;
      if (~DESKTOP_EVENTS.indexOf(handler)) return true;
      return false;
    },
    subscribe: function subscribe(fn) {
      subscribers.push(fn);
    }
  };
})();

export default index;
