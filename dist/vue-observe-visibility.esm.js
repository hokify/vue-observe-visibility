function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function processOptions(value) {
  var options;

  if (typeof value === 'function') {
    // Simple options (callback-only)
    options = {
      callback: value
    };
  } else {
    // Options object
    options = value;
  }

  return options;
}
function throttle(callback, delay) {
  var timeout;
  var lastState;
  var currentArgs;

  var throttled = function throttled(state) {
    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    currentArgs = args;
    if (timeout && state === lastState) return;
    lastState = state;
    clearTimeout(timeout);
    timeout = setTimeout(function () {
      callback.apply(void 0, [state].concat(currentArgs));
      timeout = 0;
    }, delay);
  };

  throttled._clear = function () {
    clearTimeout(timeout);
  };

  return throttled;
}
function deepEqual(val1, val2) {
  if (val1 === val2) return true;

  if (typeof val1 === 'object') {
    for (var key in val1) {
      if (!deepEqual(val1[key], val2[key])) {
        return false;
      }
    }

    return true;
  }

  return false;
}

var VisibilityState =
/*#__PURE__*/
function () {
  function VisibilityState(el, options, vnode) {
    this.el = el;
    this.observer = null;
    this.frozen = false;
    this.createObserver(options, vnode);
  }

  var _proto = VisibilityState.prototype;

  _proto.createObserver = function createObserver(options, vnode) {
    var _this = this;

    if (this.observer) {
      this.destroyObserver();
    }

    if (this.frozen) return;
    this.options = processOptions(options);
    this.callback = this.options.callback; // Throttle

    if (this.callback && this.options.throttle) {
      this.callback = throttle(this.callback, this.options.throttle);
    }

    this.oldResult = undefined;
    this.observer = new IntersectionObserver(function (entries) {
      var entry = entries[0];

      if (_this.callback) {
        // Use isIntersecting if possible because browsers can report isIntersecting as true, but intersectionRatio as 0, when something very slowly enters the viewport.
        var result = entry.isIntersecting && entry.intersectionRatio >= _this.threshold;
        if (result === _this.oldResult) return;
        _this.oldResult = result;

        _this.callback(result, entry);

        if (result && _this.options.once) {
          _this.frozen = true;

          _this.destroyObserver();
        }
      }
    }, this.options.intersection); // Wait for the element to be in document

    vnode.context.$nextTick(function () {
      if (_this.observer) {
        _this.observer.observe(_this.el);
      }
    });
  };

  _proto.destroyObserver = function destroyObserver() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    } // Cancel throttled call


    if (this.callback && this.callback._clear) {
      this.callback._clear();

      this.callback = null;
    }
  };

  _createClass(VisibilityState, [{
    key: "threshold",
    get: function get() {
      return this.options.intersection && this.options.intersection.threshold || 0;
    }
  }]);

  return VisibilityState;
}();

function bind(el, _ref, vnode) {
  var value = _ref.value;

  if (typeof IntersectionObserver === 'undefined') {
    console.warn('[vue-observe-visibility] IntersectionObserver API is not available in your browser. Please install this polyfill: https://github.com/w3c/IntersectionObserver/tree/master/polyfill');
  } else {
    var state = new VisibilityState(el, value, vnode);
    el._vue_visibilityState = state;
  }
}

function update(el, _ref2, vnode) {
  var value = _ref2.value,
      oldValue = _ref2.oldValue;
  if (deepEqual(value, oldValue)) return;
  var state = el._vue_visibilityState;

  if (state) {
    state.createObserver(value, vnode);
  } else {
    bind(el, {
      value: value
    }, vnode);
  }
}

function unbind(el) {
  var state = el._vue_visibilityState;

  if (state) {
    state.destroyObserver();
    delete el._vue_visibilityState;
  }
}

var ObserveVisibility = {
  bind: bind,
  update: update,
  unbind: unbind
};

function install(Vue) {
  Vue.directive('observe-visibility', ObserveVisibility);
  /* -- Add more components here -- */
}
/* -- Plugin definition & Auto-install -- */

/* You shouldn't have to modify the code below */
// Plugin

var plugin = {
  // eslint-disable-next-line no-undef
  version: "0.5.0",
  install: install
};

var GlobalVue = null;

if (typeof window !== 'undefined') {
  GlobalVue = window.Vue;
} else if (typeof global !== 'undefined') {
  GlobalVue = global.Vue;
}

if (GlobalVue) {
  GlobalVue.use(plugin);
}

export default plugin;
export { ObserveVisibility, install };
