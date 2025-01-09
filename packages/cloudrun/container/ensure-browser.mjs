import { createRequire } from "node:module";
var __create = Object.create;
var __getProtoOf = Object.getPrototypeOf;
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __toESM = (mod, isNodeMode, target) => {
  target = mod != null ? __create(__getProtoOf(mod)) : {};
  const to = isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
  for (let key of __getOwnPropNames(mod))
    if (!__hasOwnProp.call(to, key))
      __defProp(to, key, {
        get: () => mod[key],
        enumerable: true
      });
  return to;
};
var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);
var __require = /* @__PURE__ */ createRequire(import.meta.url);

// ../../node_modules/.pnpm/ms@2.1.2/node_modules/ms/index.js
var require_ms = __commonJS((exports, module) => {
  var s = 1000;
  var m = s * 60;
  var h = m * 60;
  var d = h * 24;
  var w = d * 7;
  var y = d * 365.25;
  module.exports = function(val, options) {
    options = options || {};
    var type = typeof val;
    if (type === "string" && val.length > 0) {
      return parse(val);
    } else if (type === "number" && isFinite(val)) {
      return options.long ? fmtLong(val) : fmtShort(val);
    }
    throw new Error("val is not a non-empty string or a valid number. val=" + JSON.stringify(val));
  };
  function parse(str) {
    str = String(str);
    if (str.length > 100) {
      return;
    }
    var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(str);
    if (!match) {
      return;
    }
    var n = parseFloat(match[1]);
    var type = (match[2] || "ms").toLowerCase();
    switch (type) {
      case "years":
      case "year":
      case "yrs":
      case "yr":
      case "y":
        return n * y;
      case "weeks":
      case "week":
      case "w":
        return n * w;
      case "days":
      case "day":
      case "d":
        return n * d;
      case "hours":
      case "hour":
      case "hrs":
      case "hr":
      case "h":
        return n * h;
      case "minutes":
      case "minute":
      case "mins":
      case "min":
      case "m":
        return n * m;
      case "seconds":
      case "second":
      case "secs":
      case "sec":
      case "s":
        return n * s;
      case "milliseconds":
      case "millisecond":
      case "msecs":
      case "msec":
      case "ms":
        return n;
      default:
        return;
    }
  }
  function fmtShort(ms) {
    var msAbs = Math.abs(ms);
    if (msAbs >= d) {
      return Math.round(ms / d) + "d";
    }
    if (msAbs >= h) {
      return Math.round(ms / h) + "h";
    }
    if (msAbs >= m) {
      return Math.round(ms / m) + "m";
    }
    if (msAbs >= s) {
      return Math.round(ms / s) + "s";
    }
    return ms + "ms";
  }
  function fmtLong(ms) {
    var msAbs = Math.abs(ms);
    if (msAbs >= d) {
      return plural(ms, msAbs, d, "day");
    }
    if (msAbs >= h) {
      return plural(ms, msAbs, h, "hour");
    }
    if (msAbs >= m) {
      return plural(ms, msAbs, m, "minute");
    }
    if (msAbs >= s) {
      return plural(ms, msAbs, s, "second");
    }
    return ms + " ms";
  }
  function plural(ms, msAbs, n, name) {
    var isPlural = msAbs >= n * 1.5;
    return Math.round(ms / n) + " " + name + (isPlural ? "s" : "");
  }
});

// ../../node_modules/.pnpm/debug@4.3.4/node_modules/debug/src/common.js
var require_common = __commonJS((exports, module) => {
  function setup(env) {
    createDebug.debug = createDebug;
    createDebug.default = createDebug;
    createDebug.coerce = coerce;
    createDebug.disable = disable;
    createDebug.enable = enable;
    createDebug.enabled = enabled;
    createDebug.humanize = require_ms();
    createDebug.destroy = destroy;
    Object.keys(env).forEach((key) => {
      createDebug[key] = env[key];
    });
    createDebug.names = [];
    createDebug.skips = [];
    createDebug.formatters = {};
    function selectColor(namespace) {
      let hash = 0;
      for (let i = 0;i < namespace.length; i++) {
        hash = (hash << 5) - hash + namespace.charCodeAt(i);
        hash |= 0;
      }
      return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
    }
    createDebug.selectColor = selectColor;
    function createDebug(namespace) {
      let prevTime;
      let enableOverride = null;
      let namespacesCache;
      let enabledCache;
      function debug(...args) {
        if (!debug.enabled) {
          return;
        }
        const self = debug;
        const curr = Number(new Date);
        const ms = curr - (prevTime || curr);
        self.diff = ms;
        self.prev = prevTime;
        self.curr = curr;
        prevTime = curr;
        args[0] = createDebug.coerce(args[0]);
        if (typeof args[0] !== "string") {
          args.unshift("%O");
        }
        let index = 0;
        args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
          if (match === "%%") {
            return "%";
          }
          index++;
          const formatter = createDebug.formatters[format];
          if (typeof formatter === "function") {
            const val = args[index];
            match = formatter.call(self, val);
            args.splice(index, 1);
            index--;
          }
          return match;
        });
        createDebug.formatArgs.call(self, args);
        const logFn = self.log || createDebug.log;
        logFn.apply(self, args);
      }
      debug.namespace = namespace;
      debug.useColors = createDebug.useColors();
      debug.color = createDebug.selectColor(namespace);
      debug.extend = extend;
      debug.destroy = createDebug.destroy;
      Object.defineProperty(debug, "enabled", {
        enumerable: true,
        configurable: false,
        get: () => {
          if (enableOverride !== null) {
            return enableOverride;
          }
          if (namespacesCache !== createDebug.namespaces) {
            namespacesCache = createDebug.namespaces;
            enabledCache = createDebug.enabled(namespace);
          }
          return enabledCache;
        },
        set: (v) => {
          enableOverride = v;
        }
      });
      if (typeof createDebug.init === "function") {
        createDebug.init(debug);
      }
      return debug;
    }
    function extend(namespace, delimiter) {
      const newDebug = createDebug(this.namespace + (typeof delimiter === "undefined" ? ":" : delimiter) + namespace);
      newDebug.log = this.log;
      return newDebug;
    }
    function enable(namespaces) {
      createDebug.save(namespaces);
      createDebug.namespaces = namespaces;
      createDebug.names = [];
      createDebug.skips = [];
      let i;
      const split = (typeof namespaces === "string" ? namespaces : "").split(/[\s,]+/);
      const len = split.length;
      for (i = 0;i < len; i++) {
        if (!split[i]) {
          continue;
        }
        namespaces = split[i].replace(/\*/g, ".*?");
        if (namespaces[0] === "-") {
          createDebug.skips.push(new RegExp("^" + namespaces.slice(1) + "$"));
        } else {
          createDebug.names.push(new RegExp("^" + namespaces + "$"));
        }
      }
    }
    function disable() {
      const namespaces = [
        ...createDebug.names.map(toNamespace),
        ...createDebug.skips.map(toNamespace).map((namespace) => "-" + namespace)
      ].join(",");
      createDebug.enable("");
      return namespaces;
    }
    function enabled(name) {
      if (name[name.length - 1] === "*") {
        return true;
      }
      let i;
      let len;
      for (i = 0, len = createDebug.skips.length;i < len; i++) {
        if (createDebug.skips[i].test(name)) {
          return false;
        }
      }
      for (i = 0, len = createDebug.names.length;i < len; i++) {
        if (createDebug.names[i].test(name)) {
          return true;
        }
      }
      return false;
    }
    function toNamespace(regexp) {
      return regexp.toString().substring(2, regexp.toString().length - 2).replace(/\.\*\?$/, "*");
    }
    function coerce(val) {
      if (val instanceof Error) {
        return val.stack || val.message;
      }
      return val;
    }
    function destroy() {
      console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
    }
    createDebug.enable(createDebug.load());
    return createDebug;
  }
  module.exports = setup;
});

// ../../node_modules/.pnpm/debug@4.3.4/node_modules/debug/src/browser.js
var require_browser = __commonJS((exports, module) => {
  exports.formatArgs = formatArgs;
  exports.save = save;
  exports.load = load;
  exports.useColors = useColors;
  exports.storage = localstorage();
  exports.destroy = (() => {
    let warned = false;
    return () => {
      if (!warned) {
        warned = true;
        console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
      }
    };
  })();
  exports.colors = [
    "#0000CC",
    "#0000FF",
    "#0033CC",
    "#0033FF",
    "#0066CC",
    "#0066FF",
    "#0099CC",
    "#0099FF",
    "#00CC00",
    "#00CC33",
    "#00CC66",
    "#00CC99",
    "#00CCCC",
    "#00CCFF",
    "#3300CC",
    "#3300FF",
    "#3333CC",
    "#3333FF",
    "#3366CC",
    "#3366FF",
    "#3399CC",
    "#3399FF",
    "#33CC00",
    "#33CC33",
    "#33CC66",
    "#33CC99",
    "#33CCCC",
    "#33CCFF",
    "#6600CC",
    "#6600FF",
    "#6633CC",
    "#6633FF",
    "#66CC00",
    "#66CC33",
    "#9900CC",
    "#9900FF",
    "#9933CC",
    "#9933FF",
    "#99CC00",
    "#99CC33",
    "#CC0000",
    "#CC0033",
    "#CC0066",
    "#CC0099",
    "#CC00CC",
    "#CC00FF",
    "#CC3300",
    "#CC3333",
    "#CC3366",
    "#CC3399",
    "#CC33CC",
    "#CC33FF",
    "#CC6600",
    "#CC6633",
    "#CC9900",
    "#CC9933",
    "#CCCC00",
    "#CCCC33",
    "#FF0000",
    "#FF0033",
    "#FF0066",
    "#FF0099",
    "#FF00CC",
    "#FF00FF",
    "#FF3300",
    "#FF3333",
    "#FF3366",
    "#FF3399",
    "#FF33CC",
    "#FF33FF",
    "#FF6600",
    "#FF6633",
    "#FF9900",
    "#FF9933",
    "#FFCC00",
    "#FFCC33"
  ];
  function useColors() {
    if (typeof window !== "undefined" && window.process && (window.process.type === "renderer" || window.process.__nwjs)) {
      return true;
    }
    if (typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
      return false;
    }
    return typeof document !== "undefined" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || typeof window !== "undefined" && window.console && (window.console.firebug || window.console.exception && window.console.table) || typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31 || typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
  }
  function formatArgs(args) {
    args[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + args[0] + (this.useColors ? "%c " : " ") + "+" + module.exports.humanize(this.diff);
    if (!this.useColors) {
      return;
    }
    const c = "color: " + this.color;
    args.splice(1, 0, c, "color: inherit");
    let index = 0;
    let lastC = 0;
    args[0].replace(/%[a-zA-Z%]/g, (match) => {
      if (match === "%%") {
        return;
      }
      index++;
      if (match === "%c") {
        lastC = index;
      }
    });
    args.splice(lastC, 0, c);
  }
  exports.log = console.debug || console.log || (() => {
  });
  function save(namespaces) {
    try {
      if (namespaces) {
        exports.storage.setItem("debug", namespaces);
      } else {
        exports.storage.removeItem("debug");
      }
    } catch (error) {
    }
  }
  function load() {
    let r;
    try {
      r = exports.storage.getItem("debug");
    } catch (error) {
    }
    if (!r && typeof process !== "undefined" && "env" in process) {
      r = process.env.DEBUG;
    }
    return r;
  }
  function localstorage() {
    try {
      return localStorage;
    } catch (error) {
    }
  }
  module.exports = require_common()(exports);
  var { formatters } = module.exports;
  formatters.j = function(v) {
    try {
      return JSON.stringify(v);
    } catch (error) {
      return "[UnexpectedJSONParseError]: " + error.message;
    }
  };
});

// ../../node_modules/.pnpm/has-flag@4.0.0/node_modules/has-flag/index.js
var require_has_flag = __commonJS((exports, module) => {
  module.exports = (flag, argv = process.argv) => {
    const prefix = flag.startsWith("-") ? "" : flag.length === 1 ? "-" : "--";
    const position = argv.indexOf(prefix + flag);
    const terminatorPosition = argv.indexOf("--");
    return position !== -1 && (terminatorPosition === -1 || position < terminatorPosition);
  };
});

// ../../node_modules/.pnpm/supports-color@7.2.0/node_modules/supports-color/index.js
var require_supports_color = __commonJS((exports, module) => {
  var os = __require("os");
  var tty = __require("tty");
  var hasFlag = require_has_flag();
  var { env } = process;
  var forceColor;
  if (hasFlag("no-color") || hasFlag("no-colors") || hasFlag("color=false") || hasFlag("color=never")) {
    forceColor = 0;
  } else if (hasFlag("color") || hasFlag("colors") || hasFlag("color=true") || hasFlag("color=always")) {
    forceColor = 1;
  }
  if ("FORCE_COLOR" in env) {
    if (env.FORCE_COLOR === "true") {
      forceColor = 1;
    } else if (env.FORCE_COLOR === "false") {
      forceColor = 0;
    } else {
      forceColor = env.FORCE_COLOR.length === 0 ? 1 : Math.min(parseInt(env.FORCE_COLOR, 10), 3);
    }
  }
  function translateLevel(level) {
    if (level === 0) {
      return false;
    }
    return {
      level,
      hasBasic: true,
      has256: level >= 2,
      has16m: level >= 3
    };
  }
  function supportsColor(haveStream, streamIsTTY) {
    if (forceColor === 0) {
      return 0;
    }
    if (hasFlag("color=16m") || hasFlag("color=full") || hasFlag("color=truecolor")) {
      return 3;
    }
    if (hasFlag("color=256")) {
      return 2;
    }
    if (haveStream && !streamIsTTY && forceColor === undefined) {
      return 0;
    }
    const min = forceColor || 0;
    if (env.TERM === "dumb") {
      return min;
    }
    if (process.platform === "win32") {
      const osRelease = os.release().split(".");
      if (Number(osRelease[0]) >= 10 && Number(osRelease[2]) >= 10586) {
        return Number(osRelease[2]) >= 14931 ? 3 : 2;
      }
      return 1;
    }
    if ("CI" in env) {
      if (["TRAVIS", "CIRCLECI", "APPVEYOR", "GITLAB_CI", "GITHUB_ACTIONS", "BUILDKITE"].some((sign) => (sign in env)) || env.CI_NAME === "codeship") {
        return 1;
      }
      return min;
    }
    if ("TEAMCITY_VERSION" in env) {
      return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env.TEAMCITY_VERSION) ? 1 : 0;
    }
    if (env.COLORTERM === "truecolor") {
      return 3;
    }
    if ("TERM_PROGRAM" in env) {
      const version = parseInt((env.TERM_PROGRAM_VERSION || "").split(".")[0], 10);
      switch (env.TERM_PROGRAM) {
        case "iTerm.app":
          return version >= 3 ? 3 : 2;
        case "Apple_Terminal":
          return 2;
      }
    }
    if (/-256(color)?$/i.test(env.TERM)) {
      return 2;
    }
    if (/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(env.TERM)) {
      return 1;
    }
    if ("COLORTERM" in env) {
      return 1;
    }
    return min;
  }
  function getSupportLevel(stream) {
    const level = supportsColor(stream, stream && stream.isTTY);
    return translateLevel(level);
  }
  module.exports = {
    supportsColor: getSupportLevel,
    stdout: translateLevel(supportsColor(true, tty.isatty(1))),
    stderr: translateLevel(supportsColor(true, tty.isatty(2)))
  };
});

// ../../node_modules/.pnpm/debug@4.3.4/node_modules/debug/src/node.js
var require_node = __commonJS((exports, module) => {
  var tty = __require("tty");
  var util = __require("util");
  exports.init = init;
  exports.log = log;
  exports.formatArgs = formatArgs;
  exports.save = save;
  exports.load = load;
  exports.useColors = useColors;
  exports.destroy = util.deprecate(() => {
  }, "Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
  exports.colors = [6, 2, 3, 4, 5, 1];
  try {
    const supportsColor = require_supports_color();
    if (supportsColor && (supportsColor.stderr || supportsColor).level >= 2) {
      exports.colors = [
        20,
        21,
        26,
        27,
        32,
        33,
        38,
        39,
        40,
        41,
        42,
        43,
        44,
        45,
        56,
        57,
        62,
        63,
        68,
        69,
        74,
        75,
        76,
        77,
        78,
        79,
        80,
        81,
        92,
        93,
        98,
        99,
        112,
        113,
        128,
        129,
        134,
        135,
        148,
        149,
        160,
        161,
        162,
        163,
        164,
        165,
        166,
        167,
        168,
        169,
        170,
        171,
        172,
        173,
        178,
        179,
        184,
        185,
        196,
        197,
        198,
        199,
        200,
        201,
        202,
        203,
        204,
        205,
        206,
        207,
        208,
        209,
        214,
        215,
        220,
        221
      ];
    }
  } catch (error) {
  }
  exports.inspectOpts = Object.keys(process.env).filter((key) => {
    return /^debug_/i.test(key);
  }).reduce((obj, key) => {
    const prop = key.substring(6).toLowerCase().replace(/_([a-z])/g, (_, k) => {
      return k.toUpperCase();
    });
    let val = process.env[key];
    if (/^(yes|on|true|enabled)$/i.test(val)) {
      val = true;
    } else if (/^(no|off|false|disabled)$/i.test(val)) {
      val = false;
    } else if (val === "null") {
      val = null;
    } else {
      val = Number(val);
    }
    obj[prop] = val;
    return obj;
  }, {});
  function useColors() {
    return "colors" in exports.inspectOpts ? Boolean(exports.inspectOpts.colors) : tty.isatty(process.stderr.fd);
  }
  function formatArgs(args) {
    const { namespace: name, useColors: useColors2 } = this;
    if (useColors2) {
      const c = this.color;
      const colorCode = "\x1B[3" + (c < 8 ? c : "8;5;" + c);
      const prefix = `  ${colorCode};1m${name} \x1B[0m`;
      args[0] = prefix + args[0].split(`
`).join(`
` + prefix);
      args.push(colorCode + "m+" + module.exports.humanize(this.diff) + "\x1B[0m");
    } else {
      args[0] = getDate() + name + " " + args[0];
    }
  }
  function getDate() {
    if (exports.inspectOpts.hideDate) {
      return "";
    }
    return new Date().toISOString() + " ";
  }
  function log(...args) {
    return process.stderr.write(util.format(...args) + `
`);
  }
  function save(namespaces) {
    if (namespaces) {
      process.env.DEBUG = namespaces;
    } else {
      delete process.env.DEBUG;
    }
  }
  function load() {
    return process.env.DEBUG;
  }
  function init(debug) {
    debug.inspectOpts = {};
    const keys = Object.keys(exports.inspectOpts);
    for (let i = 0;i < keys.length; i++) {
      debug.inspectOpts[keys[i]] = exports.inspectOpts[keys[i]];
    }
  }
  module.exports = require_common()(exports);
  var { formatters } = module.exports;
  formatters.o = function(v) {
    this.inspectOpts.colors = this.useColors;
    return util.inspect(v, this.inspectOpts).split(`
`).map((str) => str.trim()).join(" ");
  };
  formatters.O = function(v) {
    this.inspectOpts.colors = this.useColors;
    return util.inspect(v, this.inspectOpts);
  };
});

// ../../node_modules/.pnpm/debug@4.3.4/node_modules/debug/src/index.js
var require_src = __commonJS((exports, module) => {
  if (typeof process === "undefined" || process.type === "renderer" || false || process.__nwjs) {
    module.exports = require_browser();
  } else {
    module.exports = require_node();
  }
});

// ../../node_modules/.pnpm/wrappy@1.0.2/node_modules/wrappy/wrappy.js
var require_wrappy = __commonJS((exports, module) => {
  module.exports = wrappy;
  function wrappy(fn, cb) {
    if (fn && cb)
      return wrappy(fn)(cb);
    if (typeof fn !== "function")
      throw new TypeError("need wrapper function");
    Object.keys(fn).forEach(function(k) {
      wrapper[k] = fn[k];
    });
    return wrapper;
    function wrapper() {
      var args = new Array(arguments.length);
      for (var i = 0;i < args.length; i++) {
        args[i] = arguments[i];
      }
      var ret = fn.apply(this, args);
      var cb2 = args[args.length - 1];
      if (typeof ret === "function" && ret !== cb2) {
        Object.keys(cb2).forEach(function(k) {
          ret[k] = cb2[k];
        });
      }
      return ret;
    }
  }
});

// ../../node_modules/.pnpm/once@1.4.0/node_modules/once/once.js
var require_once = __commonJS((exports, module) => {
  var wrappy = require_wrappy();
  module.exports = wrappy(once);
  module.exports.strict = wrappy(onceStrict);
  once.proto = once(function() {
    Object.defineProperty(Function.prototype, "once", {
      value: function() {
        return once(this);
      },
      configurable: true
    });
    Object.defineProperty(Function.prototype, "onceStrict", {
      value: function() {
        return onceStrict(this);
      },
      configurable: true
    });
  });
  function once(fn) {
    var f = function() {
      if (f.called)
        return f.value;
      f.called = true;
      return f.value = fn.apply(this, arguments);
    };
    f.called = false;
    return f;
  }
  function onceStrict(fn) {
    var f = function() {
      if (f.called)
        throw new Error(f.onceError);
      f.called = true;
      return f.value = fn.apply(this, arguments);
    };
    var name = fn.name || "Function wrapped with `once`";
    f.onceError = name + " shouldn't be called more than once";
    f.called = false;
    return f;
  }
});

// ../../node_modules/.pnpm/end-of-stream@1.4.4/node_modules/end-of-stream/index.js
var require_end_of_stream = __commonJS((exports, module) => {
  var once = require_once();
  var noop = function() {
  };
  var isRequest = function(stream) {
    return stream.setHeader && typeof stream.abort === "function";
  };
  var isChildProcess = function(stream) {
    return stream.stdio && Array.isArray(stream.stdio) && stream.stdio.length === 3;
  };
  var eos = function(stream, opts, callback) {
    if (typeof opts === "function")
      return eos(stream, null, opts);
    if (!opts)
      opts = {};
    callback = once(callback || noop);
    var ws = stream._writableState;
    var rs = stream._readableState;
    var readable = opts.readable || opts.readable !== false && stream.readable;
    var writable = opts.writable || opts.writable !== false && stream.writable;
    var cancelled = false;
    var onlegacyfinish = function() {
      if (!stream.writable)
        onfinish();
    };
    var onfinish = function() {
      writable = false;
      if (!readable)
        callback.call(stream);
    };
    var onend = function() {
      readable = false;
      if (!writable)
        callback.call(stream);
    };
    var onexit = function(exitCode) {
      callback.call(stream, exitCode ? new Error("exited with error code: " + exitCode) : null);
    };
    var onerror = function(err) {
      callback.call(stream, err);
    };
    var onclose = function() {
      process.nextTick(onclosenexttick);
    };
    var onclosenexttick = function() {
      if (cancelled)
        return;
      if (readable && !(rs && (rs.ended && !rs.destroyed)))
        return callback.call(stream, new Error("premature close"));
      if (writable && !(ws && (ws.ended && !ws.destroyed)))
        return callback.call(stream, new Error("premature close"));
    };
    var onrequest = function() {
      stream.req.on("finish", onfinish);
    };
    if (isRequest(stream)) {
      stream.on("complete", onfinish);
      stream.on("abort", onclose);
      if (stream.req)
        onrequest();
      else
        stream.on("request", onrequest);
    } else if (writable && !ws) {
      stream.on("end", onlegacyfinish);
      stream.on("close", onlegacyfinish);
    }
    if (isChildProcess(stream))
      stream.on("exit", onexit);
    stream.on("end", onend);
    stream.on("finish", onfinish);
    if (opts.error !== false)
      stream.on("error", onerror);
    stream.on("close", onclose);
    return function() {
      cancelled = true;
      stream.removeListener("complete", onfinish);
      stream.removeListener("abort", onclose);
      stream.removeListener("request", onrequest);
      if (stream.req)
        stream.req.removeListener("finish", onfinish);
      stream.removeListener("end", onlegacyfinish);
      stream.removeListener("close", onlegacyfinish);
      stream.removeListener("finish", onfinish);
      stream.removeListener("exit", onexit);
      stream.removeListener("end", onend);
      stream.removeListener("error", onerror);
      stream.removeListener("close", onclose);
    };
  };
  module.exports = eos;
});

// ../../node_modules/.pnpm/pump@3.0.0/node_modules/pump/index.js
var require_pump = __commonJS((exports, module) => {
  var once = require_once();
  var eos = require_end_of_stream();
  var fs = __require("fs");
  var noop = function() {
  };
  var ancient = /^v?\.0/.test(process.version);
  var isFn = function(fn) {
    return typeof fn === "function";
  };
  var isFS = function(stream) {
    if (!ancient)
      return false;
    if (!fs)
      return false;
    return (stream instanceof (fs.ReadStream || noop) || stream instanceof (fs.WriteStream || noop)) && isFn(stream.close);
  };
  var isRequest = function(stream) {
    return stream.setHeader && isFn(stream.abort);
  };
  var destroyer = function(stream, reading, writing, callback) {
    callback = once(callback);
    var closed = false;
    stream.on("close", function() {
      closed = true;
    });
    eos(stream, { readable: reading, writable: writing }, function(err) {
      if (err)
        return callback(err);
      closed = true;
      callback();
    });
    var destroyed = false;
    return function(err) {
      if (closed)
        return;
      if (destroyed)
        return;
      destroyed = true;
      if (isFS(stream))
        return stream.close(noop);
      if (isRequest(stream))
        return stream.abort();
      if (isFn(stream.destroy))
        return stream.destroy();
      callback(err || new Error("stream was destroyed"));
    };
  };
  var call = function(fn) {
    fn();
  };
  var pipe = function(from, to) {
    return from.pipe(to);
  };
  var pump = function() {
    var streams = Array.prototype.slice.call(arguments);
    var callback = isFn(streams[streams.length - 1] || noop) && streams.pop() || noop;
    if (Array.isArray(streams[0]))
      streams = streams[0];
    if (streams.length < 2)
      throw new Error("pump requires two streams per minimum");
    var error;
    var destroys = streams.map(function(stream, i) {
      var reading = i < streams.length - 1;
      var writing = i > 0;
      return destroyer(stream, reading, writing, function(err) {
        if (!error)
          error = err;
        if (err)
          destroys.forEach(call);
        if (reading)
          return;
        destroys.forEach(call);
        callback(error);
      });
    });
    return streams.reduce(pipe);
  };
  module.exports = pump;
});

// ../../node_modules/.pnpm/get-stream@5.2.0/node_modules/get-stream/buffer-stream.js
var require_buffer_stream = __commonJS((exports, module) => {
  var { PassThrough: PassThroughStream } = __require("stream");
  module.exports = (options) => {
    options = { ...options };
    const { array } = options;
    let { encoding } = options;
    const isBuffer = encoding === "buffer";
    let objectMode = false;
    if (array) {
      objectMode = !(encoding || isBuffer);
    } else {
      encoding = encoding || "utf8";
    }
    if (isBuffer) {
      encoding = null;
    }
    const stream = new PassThroughStream({ objectMode });
    if (encoding) {
      stream.setEncoding(encoding);
    }
    let length = 0;
    const chunks = [];
    stream.on("data", (chunk) => {
      chunks.push(chunk);
      if (objectMode) {
        length = chunks.length;
      } else {
        length += chunk.length;
      }
    });
    stream.getBufferedValue = () => {
      if (array) {
        return chunks;
      }
      return isBuffer ? Buffer.concat(chunks, length) : chunks.join("");
    };
    stream.getBufferedLength = () => length;
    return stream;
  };
});

// ../../node_modules/.pnpm/get-stream@5.2.0/node_modules/get-stream/index.js
var require_get_stream = __commonJS((exports, module) => {
  var { constants: BufferConstants } = __require("buffer");
  var pump = require_pump();
  var bufferStream = require_buffer_stream();

  class MaxBufferError extends Error {
    constructor() {
      super("maxBuffer exceeded");
      this.name = "MaxBufferError";
    }
  }
  async function getStream(inputStream, options) {
    if (!inputStream) {
      return Promise.reject(new Error("Expected a stream"));
    }
    options = {
      maxBuffer: Infinity,
      ...options
    };
    const { maxBuffer } = options;
    let stream;
    await new Promise((resolve, reject) => {
      const rejectPromise = (error) => {
        if (error && stream.getBufferedLength() <= BufferConstants.MAX_LENGTH) {
          error.bufferedData = stream.getBufferedValue();
        }
        reject(error);
      };
      stream = pump(inputStream, bufferStream(options), (error) => {
        if (error) {
          rejectPromise(error);
          return;
        }
        resolve();
      });
      stream.on("data", () => {
        if (stream.getBufferedLength() > maxBuffer) {
          rejectPromise(new MaxBufferError);
        }
      });
    });
    return stream.getBufferedValue();
  }
  module.exports = getStream;
  module.exports.default = getStream;
  module.exports.buffer = (stream, options) => getStream(stream, { ...options, encoding: "buffer" });
  module.exports.array = (stream, options) => getStream(stream, { ...options, array: true });
  module.exports.MaxBufferError = MaxBufferError;
});

// ../../node_modules/.pnpm/pend@1.2.0/node_modules/pend/index.js
var require_pend = __commonJS((exports, module) => {
  module.exports = Pend;
  function Pend() {
    this.pending = 0;
    this.max = Infinity;
    this.listeners = [];
    this.waiting = [];
    this.error = null;
  }
  Pend.prototype.go = function(fn) {
    if (this.pending < this.max) {
      pendGo(this, fn);
    } else {
      this.waiting.push(fn);
    }
  };
  Pend.prototype.wait = function(cb) {
    if (this.pending === 0) {
      cb(this.error);
    } else {
      this.listeners.push(cb);
    }
  };
  Pend.prototype.hold = function() {
    return pendHold(this);
  };
  function pendHold(self) {
    self.pending += 1;
    var called = false;
    return onCb;
    function onCb(err) {
      if (called)
        throw new Error("callback called twice");
      called = true;
      self.error = self.error || err;
      self.pending -= 1;
      if (self.waiting.length > 0 && self.pending < self.max) {
        pendGo(self, self.waiting.shift());
      } else if (self.pending === 0) {
        var listeners = self.listeners;
        self.listeners = [];
        listeners.forEach(cbListener);
      }
    }
    function cbListener(listener) {
      listener(self.error);
    }
  }
  function pendGo(self, fn) {
    fn(pendHold(self));
  }
});

// ../../node_modules/.pnpm/fd-slicer@1.1.0/node_modules/fd-slicer/index.js
var require_fd_slicer = __commonJS((exports) => {
  var fs = __require("fs");
  var util = __require("util");
  var stream = __require("stream");
  var Readable = stream.Readable;
  var Writable = stream.Writable;
  var PassThrough = stream.PassThrough;
  var Pend = require_pend();
  var EventEmitter = __require("events").EventEmitter;
  exports.createFromBuffer = createFromBuffer;
  exports.createFromFd = createFromFd;
  exports.BufferSlicer = BufferSlicer;
  exports.FdSlicer = FdSlicer;
  util.inherits(FdSlicer, EventEmitter);
  function FdSlicer(fd, options) {
    options = options || {};
    EventEmitter.call(this);
    this.fd = fd;
    this.pend = new Pend;
    this.pend.max = 1;
    this.refCount = 0;
    this.autoClose = !!options.autoClose;
  }
  FdSlicer.prototype.read = function(buffer, offset, length, position, callback) {
    var self = this;
    self.pend.go(function(cb) {
      fs.read(self.fd, buffer, offset, length, position, function(err, bytesRead, buffer2) {
        cb();
        callback(err, bytesRead, buffer2);
      });
    });
  };
  FdSlicer.prototype.write = function(buffer, offset, length, position, callback) {
    var self = this;
    self.pend.go(function(cb) {
      fs.write(self.fd, buffer, offset, length, position, function(err, written, buffer2) {
        cb();
        callback(err, written, buffer2);
      });
    });
  };
  FdSlicer.prototype.createReadStream = function(options) {
    return new ReadStream(this, options);
  };
  FdSlicer.prototype.createWriteStream = function(options) {
    return new WriteStream(this, options);
  };
  FdSlicer.prototype.ref = function() {
    this.refCount += 1;
  };
  FdSlicer.prototype.unref = function() {
    var self = this;
    self.refCount -= 1;
    if (self.refCount > 0)
      return;
    if (self.refCount < 0)
      throw new Error("invalid unref");
    if (self.autoClose) {
      fs.close(self.fd, onCloseDone);
    }
    function onCloseDone(err) {
      if (err) {
        self.emit("error", err);
      } else {
        self.emit("close");
      }
    }
  };
  util.inherits(ReadStream, Readable);
  function ReadStream(context, options) {
    options = options || {};
    Readable.call(this, options);
    this.context = context;
    this.context.ref();
    this.start = options.start || 0;
    this.endOffset = options.end;
    this.pos = this.start;
    this.destroyed = false;
  }
  ReadStream.prototype._read = function(n) {
    var self = this;
    if (self.destroyed)
      return;
    var toRead = Math.min(self._readableState.highWaterMark, n);
    if (self.endOffset != null) {
      toRead = Math.min(toRead, self.endOffset - self.pos);
    }
    if (toRead <= 0) {
      self.destroyed = true;
      self.push(null);
      self.context.unref();
      return;
    }
    self.context.pend.go(function(cb) {
      if (self.destroyed)
        return cb();
      var buffer = new Buffer(toRead);
      fs.read(self.context.fd, buffer, 0, toRead, self.pos, function(err, bytesRead) {
        if (err) {
          self.destroy(err);
        } else if (bytesRead === 0) {
          self.destroyed = true;
          self.push(null);
          self.context.unref();
        } else {
          self.pos += bytesRead;
          self.push(buffer.slice(0, bytesRead));
        }
        cb();
      });
    });
  };
  ReadStream.prototype.destroy = function(err) {
    if (this.destroyed)
      return;
    err = err || new Error("stream destroyed");
    this.destroyed = true;
    this.emit("error", err);
    this.context.unref();
  };
  util.inherits(WriteStream, Writable);
  function WriteStream(context, options) {
    options = options || {};
    Writable.call(this, options);
    this.context = context;
    this.context.ref();
    this.start = options.start || 0;
    this.endOffset = options.end == null ? Infinity : +options.end;
    this.bytesWritten = 0;
    this.pos = this.start;
    this.destroyed = false;
    this.on("finish", this.destroy.bind(this));
  }
  WriteStream.prototype._write = function(buffer, encoding, callback) {
    var self = this;
    if (self.destroyed)
      return;
    if (self.pos + buffer.length > self.endOffset) {
      var err = new Error("maximum file length exceeded");
      err.code = "ETOOBIG";
      self.destroy();
      callback(err);
      return;
    }
    self.context.pend.go(function(cb) {
      if (self.destroyed)
        return cb();
      fs.write(self.context.fd, buffer, 0, buffer.length, self.pos, function(err2, bytes) {
        if (err2) {
          self.destroy();
          cb();
          callback(err2);
        } else {
          self.bytesWritten += bytes;
          self.pos += bytes;
          self.emit("progress");
          cb();
          callback();
        }
      });
    });
  };
  WriteStream.prototype.destroy = function() {
    if (this.destroyed)
      return;
    this.destroyed = true;
    this.context.unref();
  };
  util.inherits(BufferSlicer, EventEmitter);
  function BufferSlicer(buffer, options) {
    EventEmitter.call(this);
    options = options || {};
    this.refCount = 0;
    this.buffer = buffer;
    this.maxChunkSize = options.maxChunkSize || Number.MAX_SAFE_INTEGER;
  }
  BufferSlicer.prototype.read = function(buffer, offset, length, position, callback) {
    var end = position + length;
    var delta = end - this.buffer.length;
    var written = delta > 0 ? delta : length;
    this.buffer.copy(buffer, offset, position, end);
    setImmediate(function() {
      callback(null, written);
    });
  };
  BufferSlicer.prototype.write = function(buffer, offset, length, position, callback) {
    buffer.copy(this.buffer, position, offset, offset + length);
    setImmediate(function() {
      callback(null, length, buffer);
    });
  };
  BufferSlicer.prototype.createReadStream = function(options) {
    options = options || {};
    var readStream = new PassThrough(options);
    readStream.destroyed = false;
    readStream.start = options.start || 0;
    readStream.endOffset = options.end;
    readStream.pos = readStream.endOffset || this.buffer.length;
    var entireSlice = this.buffer.slice(readStream.start, readStream.pos);
    var offset = 0;
    while (true) {
      var nextOffset = offset + this.maxChunkSize;
      if (nextOffset >= entireSlice.length) {
        if (offset < entireSlice.length) {
          readStream.write(entireSlice.slice(offset, entireSlice.length));
        }
        break;
      }
      readStream.write(entireSlice.slice(offset, nextOffset));
      offset = nextOffset;
    }
    readStream.end();
    readStream.destroy = function() {
      readStream.destroyed = true;
    };
    return readStream;
  };
  BufferSlicer.prototype.createWriteStream = function(options) {
    var bufferSlicer = this;
    options = options || {};
    var writeStream = new Writable(options);
    writeStream.start = options.start || 0;
    writeStream.endOffset = options.end == null ? this.buffer.length : +options.end;
    writeStream.bytesWritten = 0;
    writeStream.pos = writeStream.start;
    writeStream.destroyed = false;
    writeStream._write = function(buffer, encoding, callback) {
      if (writeStream.destroyed)
        return;
      var end = writeStream.pos + buffer.length;
      if (end > writeStream.endOffset) {
        var err = new Error("maximum file length exceeded");
        err.code = "ETOOBIG";
        writeStream.destroyed = true;
        callback(err);
        return;
      }
      buffer.copy(bufferSlicer.buffer, writeStream.pos, 0, buffer.length);
      writeStream.bytesWritten += buffer.length;
      writeStream.pos = end;
      writeStream.emit("progress");
      callback();
    };
    writeStream.destroy = function() {
      writeStream.destroyed = true;
    };
    return writeStream;
  };
  BufferSlicer.prototype.ref = function() {
    this.refCount += 1;
  };
  BufferSlicer.prototype.unref = function() {
    this.refCount -= 1;
    if (this.refCount < 0) {
      throw new Error("invalid unref");
    }
  };
  function createFromBuffer(buffer, options) {
    return new BufferSlicer(buffer, options);
  }
  function createFromFd(fd, options) {
    return new FdSlicer(fd, options);
  }
});

// ../../node_modules/.pnpm/buffer-crc32@0.2.13/node_modules/buffer-crc32/index.js
var require_buffer_crc32 = __commonJS((exports, module) => {
  var Buffer2 = __require("buffer").Buffer;
  var CRC_TABLE = [
    0,
    1996959894,
    3993919788,
    2567524794,
    124634137,
    1886057615,
    3915621685,
    2657392035,
    249268274,
    2044508324,
    3772115230,
    2547177864,
    162941995,
    2125561021,
    3887607047,
    2428444049,
    498536548,
    1789927666,
    4089016648,
    2227061214,
    450548861,
    1843258603,
    4107580753,
    2211677639,
    325883990,
    1684777152,
    4251122042,
    2321926636,
    335633487,
    1661365465,
    4195302755,
    2366115317,
    997073096,
    1281953886,
    3579855332,
    2724688242,
    1006888145,
    1258607687,
    3524101629,
    2768942443,
    901097722,
    1119000684,
    3686517206,
    2898065728,
    853044451,
    1172266101,
    3705015759,
    2882616665,
    651767980,
    1373503546,
    3369554304,
    3218104598,
    565507253,
    1454621731,
    3485111705,
    3099436303,
    671266974,
    1594198024,
    3322730930,
    2970347812,
    795835527,
    1483230225,
    3244367275,
    3060149565,
    1994146192,
    31158534,
    2563907772,
    4023717930,
    1907459465,
    112637215,
    2680153253,
    3904427059,
    2013776290,
    251722036,
    2517215374,
    3775830040,
    2137656763,
    141376813,
    2439277719,
    3865271297,
    1802195444,
    476864866,
    2238001368,
    4066508878,
    1812370925,
    453092731,
    2181625025,
    4111451223,
    1706088902,
    314042704,
    2344532202,
    4240017532,
    1658658271,
    366619977,
    2362670323,
    4224994405,
    1303535960,
    984961486,
    2747007092,
    3569037538,
    1256170817,
    1037604311,
    2765210733,
    3554079995,
    1131014506,
    879679996,
    2909243462,
    3663771856,
    1141124467,
    855842277,
    2852801631,
    3708648649,
    1342533948,
    654459306,
    3188396048,
    3373015174,
    1466479909,
    544179635,
    3110523913,
    3462522015,
    1591671054,
    702138776,
    2966460450,
    3352799412,
    1504918807,
    783551873,
    3082640443,
    3233442989,
    3988292384,
    2596254646,
    62317068,
    1957810842,
    3939845945,
    2647816111,
    81470997,
    1943803523,
    3814918930,
    2489596804,
    225274430,
    2053790376,
    3826175755,
    2466906013,
    167816743,
    2097651377,
    4027552580,
    2265490386,
    503444072,
    1762050814,
    4150417245,
    2154129355,
    426522225,
    1852507879,
    4275313526,
    2312317920,
    282753626,
    1742555852,
    4189708143,
    2394877945,
    397917763,
    1622183637,
    3604390888,
    2714866558,
    953729732,
    1340076626,
    3518719985,
    2797360999,
    1068828381,
    1219638859,
    3624741850,
    2936675148,
    906185462,
    1090812512,
    3747672003,
    2825379669,
    829329135,
    1181335161,
    3412177804,
    3160834842,
    628085408,
    1382605366,
    3423369109,
    3138078467,
    570562233,
    1426400815,
    3317316542,
    2998733608,
    733239954,
    1555261956,
    3268935591,
    3050360625,
    752459403,
    1541320221,
    2607071920,
    3965973030,
    1969922972,
    40735498,
    2617837225,
    3943577151,
    1913087877,
    83908371,
    2512341634,
    3803740692,
    2075208622,
    213261112,
    2463272603,
    3855990285,
    2094854071,
    198958881,
    2262029012,
    4057260610,
    1759359992,
    534414190,
    2176718541,
    4139329115,
    1873836001,
    414664567,
    2282248934,
    4279200368,
    1711684554,
    285281116,
    2405801727,
    4167216745,
    1634467795,
    376229701,
    2685067896,
    3608007406,
    1308918612,
    956543938,
    2808555105,
    3495958263,
    1231636301,
    1047427035,
    2932959818,
    3654703836,
    1088359270,
    936918000,
    2847714899,
    3736837829,
    1202900863,
    817233897,
    3183342108,
    3401237130,
    1404277552,
    615818150,
    3134207493,
    3453421203,
    1423857449,
    601450431,
    3009837614,
    3294710456,
    1567103746,
    711928724,
    3020668471,
    3272380065,
    1510334235,
    755167117
  ];
  if (typeof Int32Array !== "undefined") {
    CRC_TABLE = new Int32Array(CRC_TABLE);
  }
  function ensureBuffer(input) {
    if (Buffer2.isBuffer(input)) {
      return input;
    }
    var hasNewBufferAPI = typeof Buffer2.alloc === "function" && typeof Buffer2.from === "function";
    if (typeof input === "number") {
      return hasNewBufferAPI ? Buffer2.alloc(input) : new Buffer2(input);
    } else if (typeof input === "string") {
      return hasNewBufferAPI ? Buffer2.from(input) : new Buffer2(input);
    } else {
      throw new Error("input must be buffer, number, or string, received " + typeof input);
    }
  }
  function bufferizeInt(num) {
    var tmp = ensureBuffer(4);
    tmp.writeInt32BE(num, 0);
    return tmp;
  }
  function _crc32(buf, previous) {
    buf = ensureBuffer(buf);
    if (Buffer2.isBuffer(previous)) {
      previous = previous.readUInt32BE(0);
    }
    var crc = ~~previous ^ -1;
    for (var n = 0;n < buf.length; n++) {
      crc = CRC_TABLE[(crc ^ buf[n]) & 255] ^ crc >>> 8;
    }
    return crc ^ -1;
  }
  function crc32() {
    return bufferizeInt(_crc32.apply(null, arguments));
  }
  crc32.signed = function() {
    return _crc32.apply(null, arguments);
  };
  crc32.unsigned = function() {
    return _crc32.apply(null, arguments) >>> 0;
  };
  module.exports = crc32;
});

// ../../node_modules/.pnpm/yauzl@2.10.0/node_modules/yauzl/index.js
var require_yauzl = __commonJS((exports) => {
  var fs = __require("fs");
  var zlib = __require("zlib");
  var fd_slicer = require_fd_slicer();
  var crc32 = require_buffer_crc32();
  var util = __require("util");
  var EventEmitter = __require("events").EventEmitter;
  var Transform = __require("stream").Transform;
  var PassThrough = __require("stream").PassThrough;
  var Writable = __require("stream").Writable;
  exports.open = open;
  exports.fromFd = fromFd;
  exports.fromBuffer = fromBuffer;
  exports.fromRandomAccessReader = fromRandomAccessReader;
  exports.dosDateTimeToDate = dosDateTimeToDate;
  exports.validateFileName = validateFileName;
  exports.ZipFile = ZipFile;
  exports.Entry = Entry;
  exports.RandomAccessReader = RandomAccessReader;
  function open(path, options, callback) {
    if (typeof options === "function") {
      callback = options;
      options = null;
    }
    if (options == null)
      options = {};
    if (options.autoClose == null)
      options.autoClose = true;
    if (options.lazyEntries == null)
      options.lazyEntries = false;
    if (options.decodeStrings == null)
      options.decodeStrings = true;
    if (options.validateEntrySizes == null)
      options.validateEntrySizes = true;
    if (options.strictFileNames == null)
      options.strictFileNames = false;
    if (callback == null)
      callback = defaultCallback;
    fs.open(path, "r", function(err, fd) {
      if (err)
        return callback(err);
      fromFd(fd, options, function(err2, zipfile) {
        if (err2)
          fs.close(fd, defaultCallback);
        callback(err2, zipfile);
      });
    });
  }
  function fromFd(fd, options, callback) {
    if (typeof options === "function") {
      callback = options;
      options = null;
    }
    if (options == null)
      options = {};
    if (options.autoClose == null)
      options.autoClose = false;
    if (options.lazyEntries == null)
      options.lazyEntries = false;
    if (options.decodeStrings == null)
      options.decodeStrings = true;
    if (options.validateEntrySizes == null)
      options.validateEntrySizes = true;
    if (options.strictFileNames == null)
      options.strictFileNames = false;
    if (callback == null)
      callback = defaultCallback;
    fs.fstat(fd, function(err, stats) {
      if (err)
        return callback(err);
      var reader = fd_slicer.createFromFd(fd, { autoClose: true });
      fromRandomAccessReader(reader, stats.size, options, callback);
    });
  }
  function fromBuffer(buffer, options, callback) {
    if (typeof options === "function") {
      callback = options;
      options = null;
    }
    if (options == null)
      options = {};
    options.autoClose = false;
    if (options.lazyEntries == null)
      options.lazyEntries = false;
    if (options.decodeStrings == null)
      options.decodeStrings = true;
    if (options.validateEntrySizes == null)
      options.validateEntrySizes = true;
    if (options.strictFileNames == null)
      options.strictFileNames = false;
    var reader = fd_slicer.createFromBuffer(buffer, { maxChunkSize: 65536 });
    fromRandomAccessReader(reader, buffer.length, options, callback);
  }
  function fromRandomAccessReader(reader, totalSize, options, callback) {
    if (typeof options === "function") {
      callback = options;
      options = null;
    }
    if (options == null)
      options = {};
    if (options.autoClose == null)
      options.autoClose = true;
    if (options.lazyEntries == null)
      options.lazyEntries = false;
    if (options.decodeStrings == null)
      options.decodeStrings = true;
    var decodeStrings = !!options.decodeStrings;
    if (options.validateEntrySizes == null)
      options.validateEntrySizes = true;
    if (options.strictFileNames == null)
      options.strictFileNames = false;
    if (callback == null)
      callback = defaultCallback;
    if (typeof totalSize !== "number")
      throw new Error("expected totalSize parameter to be a number");
    if (totalSize > Number.MAX_SAFE_INTEGER) {
      throw new Error("zip file too large. only file sizes up to 2^52 are supported due to JavaScript's Number type being an IEEE 754 double.");
    }
    reader.ref();
    var eocdrWithoutCommentSize = 22;
    var maxCommentSize = 65535;
    var bufferSize = Math.min(eocdrWithoutCommentSize + maxCommentSize, totalSize);
    var buffer = newBuffer(bufferSize);
    var bufferReadStart = totalSize - buffer.length;
    readAndAssertNoEof(reader, buffer, 0, bufferSize, bufferReadStart, function(err) {
      if (err)
        return callback(err);
      for (var i = bufferSize - eocdrWithoutCommentSize;i >= 0; i -= 1) {
        if (buffer.readUInt32LE(i) !== 101010256)
          continue;
        var eocdrBuffer = buffer.slice(i);
        var diskNumber = eocdrBuffer.readUInt16LE(4);
        if (diskNumber !== 0) {
          return callback(new Error("multi-disk zip files are not supported: found disk number: " + diskNumber));
        }
        var entryCount = eocdrBuffer.readUInt16LE(10);
        var centralDirectoryOffset = eocdrBuffer.readUInt32LE(16);
        var commentLength = eocdrBuffer.readUInt16LE(20);
        var expectedCommentLength = eocdrBuffer.length - eocdrWithoutCommentSize;
        if (commentLength !== expectedCommentLength) {
          return callback(new Error("invalid comment length. expected: " + expectedCommentLength + ". found: " + commentLength));
        }
        var comment = decodeStrings ? decodeBuffer(eocdrBuffer, 22, eocdrBuffer.length, false) : eocdrBuffer.slice(22);
        if (!(entryCount === 65535 || centralDirectoryOffset === 4294967295)) {
          return callback(null, new ZipFile(reader, centralDirectoryOffset, totalSize, entryCount, comment, options.autoClose, options.lazyEntries, decodeStrings, options.validateEntrySizes, options.strictFileNames));
        }
        var zip64EocdlBuffer = newBuffer(20);
        var zip64EocdlOffset = bufferReadStart + i - zip64EocdlBuffer.length;
        readAndAssertNoEof(reader, zip64EocdlBuffer, 0, zip64EocdlBuffer.length, zip64EocdlOffset, function(err2) {
          if (err2)
            return callback(err2);
          if (zip64EocdlBuffer.readUInt32LE(0) !== 117853008) {
            return callback(new Error("invalid zip64 end of central directory locator signature"));
          }
          var zip64EocdrOffset = readUInt64LE(zip64EocdlBuffer, 8);
          var zip64EocdrBuffer = newBuffer(56);
          readAndAssertNoEof(reader, zip64EocdrBuffer, 0, zip64EocdrBuffer.length, zip64EocdrOffset, function(err3) {
            if (err3)
              return callback(err3);
            if (zip64EocdrBuffer.readUInt32LE(0) !== 101075792) {
              return callback(new Error("invalid zip64 end of central directory record signature"));
            }
            entryCount = readUInt64LE(zip64EocdrBuffer, 32);
            centralDirectoryOffset = readUInt64LE(zip64EocdrBuffer, 48);
            return callback(null, new ZipFile(reader, centralDirectoryOffset, totalSize, entryCount, comment, options.autoClose, options.lazyEntries, decodeStrings, options.validateEntrySizes, options.strictFileNames));
          });
        });
        return;
      }
      callback(new Error("end of central directory record signature not found"));
    });
  }
  util.inherits(ZipFile, EventEmitter);
  function ZipFile(reader, centralDirectoryOffset, fileSize, entryCount, comment, autoClose, lazyEntries, decodeStrings, validateEntrySizes, strictFileNames) {
    var self = this;
    EventEmitter.call(self);
    self.reader = reader;
    self.reader.on("error", function(err) {
      emitError(self, err);
    });
    self.reader.once("close", function() {
      self.emit("close");
    });
    self.readEntryCursor = centralDirectoryOffset;
    self.fileSize = fileSize;
    self.entryCount = entryCount;
    self.comment = comment;
    self.entriesRead = 0;
    self.autoClose = !!autoClose;
    self.lazyEntries = !!lazyEntries;
    self.decodeStrings = !!decodeStrings;
    self.validateEntrySizes = !!validateEntrySizes;
    self.strictFileNames = !!strictFileNames;
    self.isOpen = true;
    self.emittedError = false;
    if (!self.lazyEntries)
      self._readEntry();
  }
  ZipFile.prototype.close = function() {
    if (!this.isOpen)
      return;
    this.isOpen = false;
    this.reader.unref();
  };
  function emitErrorAndAutoClose(self, err) {
    if (self.autoClose)
      self.close();
    emitError(self, err);
  }
  function emitError(self, err) {
    if (self.emittedError)
      return;
    self.emittedError = true;
    self.emit("error", err);
  }
  ZipFile.prototype.readEntry = function() {
    if (!this.lazyEntries)
      throw new Error("readEntry() called without lazyEntries:true");
    this._readEntry();
  };
  ZipFile.prototype._readEntry = function() {
    var self = this;
    if (self.entryCount === self.entriesRead) {
      setImmediate(function() {
        if (self.autoClose)
          self.close();
        if (self.emittedError)
          return;
        self.emit("end");
      });
      return;
    }
    if (self.emittedError)
      return;
    var buffer = newBuffer(46);
    readAndAssertNoEof(self.reader, buffer, 0, buffer.length, self.readEntryCursor, function(err) {
      if (err)
        return emitErrorAndAutoClose(self, err);
      if (self.emittedError)
        return;
      var entry = new Entry;
      var signature = buffer.readUInt32LE(0);
      if (signature !== 33639248)
        return emitErrorAndAutoClose(self, new Error("invalid central directory file header signature: 0x" + signature.toString(16)));
      entry.versionMadeBy = buffer.readUInt16LE(4);
      entry.versionNeededToExtract = buffer.readUInt16LE(6);
      entry.generalPurposeBitFlag = buffer.readUInt16LE(8);
      entry.compressionMethod = buffer.readUInt16LE(10);
      entry.lastModFileTime = buffer.readUInt16LE(12);
      entry.lastModFileDate = buffer.readUInt16LE(14);
      entry.crc32 = buffer.readUInt32LE(16);
      entry.compressedSize = buffer.readUInt32LE(20);
      entry.uncompressedSize = buffer.readUInt32LE(24);
      entry.fileNameLength = buffer.readUInt16LE(28);
      entry.extraFieldLength = buffer.readUInt16LE(30);
      entry.fileCommentLength = buffer.readUInt16LE(32);
      entry.internalFileAttributes = buffer.readUInt16LE(36);
      entry.externalFileAttributes = buffer.readUInt32LE(38);
      entry.relativeOffsetOfLocalHeader = buffer.readUInt32LE(42);
      if (entry.generalPurposeBitFlag & 64)
        return emitErrorAndAutoClose(self, new Error("strong encryption is not supported"));
      self.readEntryCursor += 46;
      buffer = newBuffer(entry.fileNameLength + entry.extraFieldLength + entry.fileCommentLength);
      readAndAssertNoEof(self.reader, buffer, 0, buffer.length, self.readEntryCursor, function(err2) {
        if (err2)
          return emitErrorAndAutoClose(self, err2);
        if (self.emittedError)
          return;
        var isUtf8 = (entry.generalPurposeBitFlag & 2048) !== 0;
        entry.fileName = self.decodeStrings ? decodeBuffer(buffer, 0, entry.fileNameLength, isUtf8) : buffer.slice(0, entry.fileNameLength);
        var fileCommentStart = entry.fileNameLength + entry.extraFieldLength;
        var extraFieldBuffer = buffer.slice(entry.fileNameLength, fileCommentStart);
        entry.extraFields = [];
        var i = 0;
        while (i < extraFieldBuffer.length - 3) {
          var headerId = extraFieldBuffer.readUInt16LE(i + 0);
          var dataSize = extraFieldBuffer.readUInt16LE(i + 2);
          var dataStart = i + 4;
          var dataEnd = dataStart + dataSize;
          if (dataEnd > extraFieldBuffer.length)
            return emitErrorAndAutoClose(self, new Error("extra field length exceeds extra field buffer size"));
          var dataBuffer = newBuffer(dataSize);
          extraFieldBuffer.copy(dataBuffer, 0, dataStart, dataEnd);
          entry.extraFields.push({
            id: headerId,
            data: dataBuffer
          });
          i = dataEnd;
        }
        entry.fileComment = self.decodeStrings ? decodeBuffer(buffer, fileCommentStart, fileCommentStart + entry.fileCommentLength, isUtf8) : buffer.slice(fileCommentStart, fileCommentStart + entry.fileCommentLength);
        entry.comment = entry.fileComment;
        self.readEntryCursor += buffer.length;
        self.entriesRead += 1;
        if (entry.uncompressedSize === 4294967295 || entry.compressedSize === 4294967295 || entry.relativeOffsetOfLocalHeader === 4294967295) {
          var zip64EiefBuffer = null;
          for (var i = 0;i < entry.extraFields.length; i++) {
            var extraField = entry.extraFields[i];
            if (extraField.id === 1) {
              zip64EiefBuffer = extraField.data;
              break;
            }
          }
          if (zip64EiefBuffer == null) {
            return emitErrorAndAutoClose(self, new Error("expected zip64 extended information extra field"));
          }
          var index = 0;
          if (entry.uncompressedSize === 4294967295) {
            if (index + 8 > zip64EiefBuffer.length) {
              return emitErrorAndAutoClose(self, new Error("zip64 extended information extra field does not include uncompressed size"));
            }
            entry.uncompressedSize = readUInt64LE(zip64EiefBuffer, index);
            index += 8;
          }
          if (entry.compressedSize === 4294967295) {
            if (index + 8 > zip64EiefBuffer.length) {
              return emitErrorAndAutoClose(self, new Error("zip64 extended information extra field does not include compressed size"));
            }
            entry.compressedSize = readUInt64LE(zip64EiefBuffer, index);
            index += 8;
          }
          if (entry.relativeOffsetOfLocalHeader === 4294967295) {
            if (index + 8 > zip64EiefBuffer.length) {
              return emitErrorAndAutoClose(self, new Error("zip64 extended information extra field does not include relative header offset"));
            }
            entry.relativeOffsetOfLocalHeader = readUInt64LE(zip64EiefBuffer, index);
            index += 8;
          }
        }
        if (self.decodeStrings) {
          for (var i = 0;i < entry.extraFields.length; i++) {
            var extraField = entry.extraFields[i];
            if (extraField.id === 28789) {
              if (extraField.data.length < 6) {
                continue;
              }
              if (extraField.data.readUInt8(0) !== 1) {
                continue;
              }
              var oldNameCrc32 = extraField.data.readUInt32LE(1);
              if (crc32.unsigned(buffer.slice(0, entry.fileNameLength)) !== oldNameCrc32) {
                continue;
              }
              entry.fileName = decodeBuffer(extraField.data, 5, extraField.data.length, true);
              break;
            }
          }
        }
        if (self.validateEntrySizes && entry.compressionMethod === 0) {
          var expectedCompressedSize = entry.uncompressedSize;
          if (entry.isEncrypted()) {
            expectedCompressedSize += 12;
          }
          if (entry.compressedSize !== expectedCompressedSize) {
            var msg = "compressed/uncompressed size mismatch for stored file: " + entry.compressedSize + " != " + entry.uncompressedSize;
            return emitErrorAndAutoClose(self, new Error(msg));
          }
        }
        if (self.decodeStrings) {
          if (!self.strictFileNames) {
            entry.fileName = entry.fileName.replace(/\\/g, "/");
          }
          var errorMessage = validateFileName(entry.fileName, self.validateFileNameOptions);
          if (errorMessage != null)
            return emitErrorAndAutoClose(self, new Error(errorMessage));
        }
        self.emit("entry", entry);
        if (!self.lazyEntries)
          self._readEntry();
      });
    });
  };
  ZipFile.prototype.openReadStream = function(entry, options, callback) {
    var self = this;
    var relativeStart = 0;
    var relativeEnd = entry.compressedSize;
    if (callback == null) {
      callback = options;
      options = {};
    } else {
      if (options.decrypt != null) {
        if (!entry.isEncrypted()) {
          throw new Error("options.decrypt can only be specified for encrypted entries");
        }
        if (options.decrypt !== false)
          throw new Error("invalid options.decrypt value: " + options.decrypt);
        if (entry.isCompressed()) {
          if (options.decompress !== false)
            throw new Error("entry is encrypted and compressed, and options.decompress !== false");
        }
      }
      if (options.decompress != null) {
        if (!entry.isCompressed()) {
          throw new Error("options.decompress can only be specified for compressed entries");
        }
        if (!(options.decompress === false || options.decompress === true)) {
          throw new Error("invalid options.decompress value: " + options.decompress);
        }
      }
      if (options.start != null || options.end != null) {
        if (entry.isCompressed() && options.decompress !== false) {
          throw new Error("start/end range not allowed for compressed entry without options.decompress === false");
        }
        if (entry.isEncrypted() && options.decrypt !== false) {
          throw new Error("start/end range not allowed for encrypted entry without options.decrypt === false");
        }
      }
      if (options.start != null) {
        relativeStart = options.start;
        if (relativeStart < 0)
          throw new Error("options.start < 0");
        if (relativeStart > entry.compressedSize)
          throw new Error("options.start > entry.compressedSize");
      }
      if (options.end != null) {
        relativeEnd = options.end;
        if (relativeEnd < 0)
          throw new Error("options.end < 0");
        if (relativeEnd > entry.compressedSize)
          throw new Error("options.end > entry.compressedSize");
        if (relativeEnd < relativeStart)
          throw new Error("options.end < options.start");
      }
    }
    if (!self.isOpen)
      return callback(new Error("closed"));
    if (entry.isEncrypted()) {
      if (options.decrypt !== false)
        return callback(new Error("entry is encrypted, and options.decrypt !== false"));
    }
    self.reader.ref();
    var buffer = newBuffer(30);
    readAndAssertNoEof(self.reader, buffer, 0, buffer.length, entry.relativeOffsetOfLocalHeader, function(err) {
      try {
        if (err)
          return callback(err);
        var signature = buffer.readUInt32LE(0);
        if (signature !== 67324752) {
          return callback(new Error("invalid local file header signature: 0x" + signature.toString(16)));
        }
        var fileNameLength = buffer.readUInt16LE(26);
        var extraFieldLength = buffer.readUInt16LE(28);
        var localFileHeaderEnd = entry.relativeOffsetOfLocalHeader + buffer.length + fileNameLength + extraFieldLength;
        var decompress;
        if (entry.compressionMethod === 0) {
          decompress = false;
        } else if (entry.compressionMethod === 8) {
          decompress = options.decompress != null ? options.decompress : true;
        } else {
          return callback(new Error("unsupported compression method: " + entry.compressionMethod));
        }
        var fileDataStart = localFileHeaderEnd;
        var fileDataEnd = fileDataStart + entry.compressedSize;
        if (entry.compressedSize !== 0) {
          if (fileDataEnd > self.fileSize) {
            return callback(new Error("file data overflows file bounds: " + fileDataStart + " + " + entry.compressedSize + " > " + self.fileSize));
          }
        }
        var readStream = self.reader.createReadStream({
          start: fileDataStart + relativeStart,
          end: fileDataStart + relativeEnd
        });
        var endpointStream = readStream;
        if (decompress) {
          var destroyed = false;
          var inflateFilter = zlib.createInflateRaw();
          readStream.on("error", function(err2) {
            setImmediate(function() {
              if (!destroyed)
                inflateFilter.emit("error", err2);
            });
          });
          readStream.pipe(inflateFilter);
          if (self.validateEntrySizes) {
            endpointStream = new AssertByteCountStream(entry.uncompressedSize);
            inflateFilter.on("error", function(err2) {
              setImmediate(function() {
                if (!destroyed)
                  endpointStream.emit("error", err2);
              });
            });
            inflateFilter.pipe(endpointStream);
          } else {
            endpointStream = inflateFilter;
          }
          endpointStream.destroy = function() {
            destroyed = true;
            if (inflateFilter !== endpointStream)
              inflateFilter.unpipe(endpointStream);
            readStream.unpipe(inflateFilter);
            readStream.destroy();
          };
        }
        callback(null, endpointStream);
      } finally {
        self.reader.unref();
      }
    });
  };
  function Entry() {
  }
  Entry.prototype.getLastModDate = function() {
    return dosDateTimeToDate(this.lastModFileDate, this.lastModFileTime);
  };
  Entry.prototype.isEncrypted = function() {
    return (this.generalPurposeBitFlag & 1) !== 0;
  };
  Entry.prototype.isCompressed = function() {
    return this.compressionMethod === 8;
  };
  function dosDateTimeToDate(date, time) {
    var day = date & 31;
    var month = (date >> 5 & 15) - 1;
    var year = (date >> 9 & 127) + 1980;
    var millisecond = 0;
    var second = (time & 31) * 2;
    var minute = time >> 5 & 63;
    var hour = time >> 11 & 31;
    return new Date(year, month, day, hour, minute, second, millisecond);
  }
  function validateFileName(fileName) {
    if (fileName.indexOf("\\") !== -1) {
      return "invalid characters in fileName: " + fileName;
    }
    if (/^[a-zA-Z]:/.test(fileName) || /^\//.test(fileName)) {
      return "absolute path: " + fileName;
    }
    if (fileName.split("/").indexOf("..") !== -1) {
      return "invalid relative path: " + fileName;
    }
    return null;
  }
  function readAndAssertNoEof(reader, buffer, offset, length, position, callback) {
    if (length === 0) {
      return setImmediate(function() {
        callback(null, newBuffer(0));
      });
    }
    reader.read(buffer, offset, length, position, function(err, bytesRead) {
      if (err)
        return callback(err);
      if (bytesRead < length) {
        return callback(new Error("unexpected EOF"));
      }
      callback();
    });
  }
  util.inherits(AssertByteCountStream, Transform);
  function AssertByteCountStream(byteCount) {
    Transform.call(this);
    this.actualByteCount = 0;
    this.expectedByteCount = byteCount;
  }
  AssertByteCountStream.prototype._transform = function(chunk, encoding, cb) {
    this.actualByteCount += chunk.length;
    if (this.actualByteCount > this.expectedByteCount) {
      var msg = "too many bytes in the stream. expected " + this.expectedByteCount + ". got at least " + this.actualByteCount;
      return cb(new Error(msg));
    }
    cb(null, chunk);
  };
  AssertByteCountStream.prototype._flush = function(cb) {
    if (this.actualByteCount < this.expectedByteCount) {
      var msg = "not enough bytes in the stream. expected " + this.expectedByteCount + ". got only " + this.actualByteCount;
      return cb(new Error(msg));
    }
    cb();
  };
  util.inherits(RandomAccessReader, EventEmitter);
  function RandomAccessReader() {
    EventEmitter.call(this);
    this.refCount = 0;
  }
  RandomAccessReader.prototype.ref = function() {
    this.refCount += 1;
  };
  RandomAccessReader.prototype.unref = function() {
    var self = this;
    self.refCount -= 1;
    if (self.refCount > 0)
      return;
    if (self.refCount < 0)
      throw new Error("invalid unref");
    self.close(onCloseDone);
    function onCloseDone(err) {
      if (err)
        return self.emit("error", err);
      self.emit("close");
    }
  };
  RandomAccessReader.prototype.createReadStream = function(options) {
    var start = options.start;
    var end = options.end;
    if (start === end) {
      var emptyStream = new PassThrough;
      setImmediate(function() {
        emptyStream.end();
      });
      return emptyStream;
    }
    var stream = this._readStreamForRange(start, end);
    var destroyed = false;
    var refUnrefFilter = new RefUnrefFilter(this);
    stream.on("error", function(err) {
      setImmediate(function() {
        if (!destroyed)
          refUnrefFilter.emit("error", err);
      });
    });
    refUnrefFilter.destroy = function() {
      stream.unpipe(refUnrefFilter);
      refUnrefFilter.unref();
      stream.destroy();
    };
    var byteCounter = new AssertByteCountStream(end - start);
    refUnrefFilter.on("error", function(err) {
      setImmediate(function() {
        if (!destroyed)
          byteCounter.emit("error", err);
      });
    });
    byteCounter.destroy = function() {
      destroyed = true;
      refUnrefFilter.unpipe(byteCounter);
      refUnrefFilter.destroy();
    };
    return stream.pipe(refUnrefFilter).pipe(byteCounter);
  };
  RandomAccessReader.prototype._readStreamForRange = function(start, end) {
    throw new Error("not implemented");
  };
  RandomAccessReader.prototype.read = function(buffer, offset, length, position, callback) {
    var readStream = this.createReadStream({ start: position, end: position + length });
    var writeStream = new Writable;
    var written = 0;
    writeStream._write = function(chunk, encoding, cb) {
      chunk.copy(buffer, offset + written, 0, chunk.length);
      written += chunk.length;
      cb();
    };
    writeStream.on("finish", callback);
    readStream.on("error", function(error) {
      callback(error);
    });
    readStream.pipe(writeStream);
  };
  RandomAccessReader.prototype.close = function(callback) {
    setImmediate(callback);
  };
  util.inherits(RefUnrefFilter, PassThrough);
  function RefUnrefFilter(context) {
    PassThrough.call(this);
    this.context = context;
    this.context.ref();
    this.unreffedYet = false;
  }
  RefUnrefFilter.prototype._flush = function(cb) {
    this.unref();
    cb();
  };
  RefUnrefFilter.prototype.unref = function(cb) {
    if (this.unreffedYet)
      return;
    this.unreffedYet = true;
    this.context.unref();
  };
  var cp437 = "\x00☺☻♥♦♣♠•◘○◙♂♀♪♫☼►◄↕‼¶§▬↨↑↓→←∟↔▲▼ !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~⌂ÇüéâäàåçêëèïîìÄÅÉæÆôöòûùÿÖÜ¢£¥₧ƒáíóúñÑªº¿⌐¬½¼¡«»░▒▓│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀αßΓπΣσµτΦΘΩδ∞φε∩≡±≥≤⌠⌡÷≈°∙·√ⁿ²■ ";
  function decodeBuffer(buffer, start, end, isUtf8) {
    if (isUtf8) {
      return buffer.toString("utf8", start, end);
    } else {
      var result = "";
      for (var i = start;i < end; i++) {
        result += cp437[buffer[i]];
      }
      return result;
    }
  }
  function readUInt64LE(buffer, offset) {
    var lower32 = buffer.readUInt32LE(offset);
    var upper32 = buffer.readUInt32LE(offset + 4);
    return upper32 * 4294967296 + lower32;
  }
  var newBuffer;
  if (typeof Buffer.allocUnsafe === "function") {
    newBuffer = function(len) {
      return Buffer.allocUnsafe(len);
    };
  } else {
    newBuffer = function(len) {
      return new Buffer(len);
    };
  }
  function defaultCallback(err) {
    if (err)
      throw err;
  }
});

// ../../node_modules/.pnpm/extract-zip@2.0.1/node_modules/extract-zip/index.js
var require_extract_zip = __commonJS((exports, module) => {
  var debug = require_src()("extract-zip");
  var { createWriteStream, promises: fs } = __require("fs");
  var getStream = require_get_stream();
  var path = __require("path");
  var { promisify } = __require("util");
  var stream = __require("stream");
  var yauzl = require_yauzl();
  var openZip = promisify(yauzl.open);
  var pipeline = promisify(stream.pipeline);

  class Extractor {
    constructor(zipPath, opts) {
      this.zipPath = zipPath;
      this.opts = opts;
    }
    async extract() {
      debug("opening", this.zipPath, "with opts", this.opts);
      this.zipfile = await openZip(this.zipPath, { lazyEntries: true });
      this.canceled = false;
      return new Promise((resolve, reject) => {
        this.zipfile.on("error", (err) => {
          this.canceled = true;
          reject(err);
        });
        this.zipfile.readEntry();
        this.zipfile.on("close", () => {
          if (!this.canceled) {
            debug("zip extraction complete");
            resolve();
          }
        });
        this.zipfile.on("entry", async (entry) => {
          if (this.canceled) {
            debug("skipping entry", entry.fileName, { cancelled: this.canceled });
            return;
          }
          debug("zipfile entry", entry.fileName);
          if (entry.fileName.startsWith("__MACOSX/")) {
            this.zipfile.readEntry();
            return;
          }
          const destDir = path.dirname(path.join(this.opts.dir, entry.fileName));
          try {
            await fs.mkdir(destDir, { recursive: true });
            const canonicalDestDir = await fs.realpath(destDir);
            const relativeDestDir = path.relative(this.opts.dir, canonicalDestDir);
            if (relativeDestDir.split(path.sep).includes("..")) {
              throw new Error(`Out of bound path "${canonicalDestDir}" found while processing file ${entry.fileName}`);
            }
            await this.extractEntry(entry);
            debug("finished processing", entry.fileName);
            this.zipfile.readEntry();
          } catch (err) {
            this.canceled = true;
            this.zipfile.close();
            reject(err);
          }
        });
      });
    }
    async extractEntry(entry) {
      if (this.canceled) {
        debug("skipping entry extraction", entry.fileName, { cancelled: this.canceled });
        return;
      }
      if (this.opts.onEntry) {
        this.opts.onEntry(entry, this.zipfile);
      }
      const dest = path.join(this.opts.dir, entry.fileName);
      const mode = entry.externalFileAttributes >> 16 & 65535;
      const IFMT = 61440;
      const IFDIR = 16384;
      const IFLNK = 40960;
      const symlink = (mode & IFMT) === IFLNK;
      let isDir = (mode & IFMT) === IFDIR;
      if (!isDir && entry.fileName.endsWith("/")) {
        isDir = true;
      }
      const madeBy = entry.versionMadeBy >> 8;
      if (!isDir)
        isDir = madeBy === 0 && entry.externalFileAttributes === 16;
      debug("extracting entry", { filename: entry.fileName, isDir, isSymlink: symlink });
      const procMode = this.getExtractedMode(mode, isDir) & 511;
      const destDir = isDir ? dest : path.dirname(dest);
      const mkdirOptions = { recursive: true };
      if (isDir) {
        mkdirOptions.mode = procMode;
      }
      debug("mkdir", { dir: destDir, ...mkdirOptions });
      await fs.mkdir(destDir, mkdirOptions);
      if (isDir)
        return;
      debug("opening read stream", dest);
      const readStream = await promisify(this.zipfile.openReadStream.bind(this.zipfile))(entry);
      if (symlink) {
        const link = await getStream(readStream);
        debug("creating symlink", link, dest);
        await fs.symlink(link, dest);
      } else {
        await pipeline(readStream, createWriteStream(dest, { mode: procMode }));
      }
    }
    getExtractedMode(entryMode, isDir) {
      let mode = entryMode;
      if (mode === 0) {
        if (isDir) {
          if (this.opts.defaultDirMode) {
            mode = parseInt(this.opts.defaultDirMode, 10);
          }
          if (!mode) {
            mode = 493;
          }
        } else {
          if (this.opts.defaultFileMode) {
            mode = parseInt(this.opts.defaultFileMode, 10);
          }
          if (!mode) {
            mode = 420;
          }
        }
      }
      return mode;
    }
  }
  module.exports = async function(zipPath, opts) {
    debug("creating target directory", opts.dir);
    if (!path.isAbsolute(opts.dir)) {
      throw new Error("Target directory is expected to be absolute");
    }
    await fs.mkdir(opts.dir, { recursive: true });
    opts.dir = await fs.realpath(opts.dir);
    return new Extractor(zipPath, opts).extract();
  };
});

// src/ensure-browser.ts
import fs5 from "fs";

// src/browser/BrowserFetcher.ts
var import_extract_zip = __toESM(require_extract_zip(), 1);
import * as fs3 from "node:fs";
import * as os from "node:os";
import * as path3 from "node:path";
import { promisify } from "node:util";

// src/assets/download-file.ts
import { createWriteStream } from "node:fs";

// src/ensure-output-directory.ts
import fs from "node:fs";
import path from "node:path";
var ensureOutputDirectory = (outputLocation) => {
  const dirName = path.dirname(outputLocation);
  if (!fs.existsSync(dirName)) {
    fs.mkdirSync(dirName, {
      recursive: true
    });
  }
};

// src/chalk/is-color-supported.ts
import * as tty from "tty";
var isColorSupported = () => {
  const env = process.env || {};
  const isForceDisabled = "NO_COLOR" in env;
  if (isForceDisabled) {
    return false;
  }
  const isForced = "FORCE_COLOR" in env;
  if (isForced) {
    return true;
  }
  const isWindows = process.platform === "win32";
  const isCompatibleTerminal = tty?.isatty?.(1) && env.TERM && env.TERM !== "dumb";
  const isCI = "CI" in env && (("GITHUB_ACTIONS" in env) || ("GITLAB_CI" in env) || ("CIRCLECI" in env));
  return isWindows || isCompatibleTerminal || isCI;
};

// src/chalk/index.ts
var chalk = (() => {
  const colors = {
    enabled: () => isColorSupported(),
    visible: true,
    styles: {},
    keys: {}
  };
  const ansi = (st) => {
    const open = `\x1B[${st.codes[0]}m`;
    const close = `\x1B[${st.codes[1]}m`;
    const regex = new RegExp(`\\u001b\\[${st.codes[1]}m`, "g");
    st.wrap = (input, newline) => {
      if (input.includes(close))
        input = input.replace(regex, close + open);
      const output = open + input + close;
      return newline ? output.replace(/\r*\n/g, `${close}$&${open}`) : output;
    };
    return st;
  };
  const wrap = (sty, input, newline) => {
    return sty.wrap?.(input, newline);
  };
  const style = (input, stack) => {
    if (input === "" || input === null || input === undefined)
      return "";
    if (colors.enabled() === false)
      return input;
    if (colors.visible === false)
      return "";
    let str = String(input);
    const nl = str.includes(`
`);
    let n = stack.length;
    while (n-- > 0)
      str = wrap(colors.styles[stack[n]], str, nl);
    return str;
  };
  const define = (name, codes, type) => {
    colors.styles[name] = ansi({ name, codes });
    const keys = colors.keys[type] || (colors.keys[type] = []);
    keys.push(name);
    Reflect.defineProperty(colors, name, {
      configurable: true,
      enumerable: true,
      set(value) {
        colors.alias?.(name, value);
      },
      get() {
        const color = (input) => style(input, color.stack);
        Reflect.setPrototypeOf(color, colors);
        color.stack = this.stack ? this.stack.concat(name) : [name];
        return color;
      }
    });
  };
  define("reset", [0, 0], "modifier");
  define("bold", [1, 22], "modifier");
  define("dim", [2, 22], "modifier");
  define("italic", [3, 23], "modifier");
  define("underline", [4, 24], "modifier");
  define("inverse", [7, 27], "modifier");
  define("hidden", [8, 28], "modifier");
  define("strikethrough", [9, 29], "modifier");
  define("black", [30, 39], "color");
  define("red", [31, 39], "color");
  define("green", [32, 39], "color");
  define("yellow", [33, 39], "color");
  define("blue", [34, 39], "color");
  define("magenta", [35, 39], "color");
  define("cyan", [36, 39], "color");
  define("white", [37, 39], "color");
  define("gray", [90, 39], "color");
  define("grey", [90, 39], "color");
  define("bgBlack", [40, 49], "bg");
  define("bgRed", [41, 49], "bg");
  define("bgGreen", [42, 49], "bg");
  define("bgYellow", [43, 49], "bg");
  define("bgBlue", [44, 49], "bg");
  define("bgMagenta", [45, 49], "bg");
  define("bgWhite", [47, 49], "bg");
  define("blackBright", [90, 39], "bright");
  define("redBright", [91, 39], "bright");
  define("greenBright", [92, 39], "bright");
  define("yellowBright", [93, 39], "bright");
  define("blueBright", [94, 39], "bright");
  define("magentaBright", [95, 39], "bright");
  define("whiteBright", [97, 39], "bright");
  define("bgBlackBright", [100, 49], "bgBright");
  define("bgRedBright", [101, 49], "bgBright");
  define("bgGreenBright", [102, 49], "bgBright");
  define("bgYellowBright", [103, 49], "bgBright");
  define("bgBlueBright", [104, 49], "bgBright");
  define("bgMagentaBright", [105, 49], "bgBright");
  define("bgWhiteBright", [107, 49], "bgBright");
  colors.alias = (name, color) => {
    const fn = colors[color];
    if (typeof fn !== "function") {
      throw new TypeError("Expected alias to be the name of an existing color (string) or a function");
    }
    if (!fn.stack) {
      Reflect.defineProperty(fn, "name", { value: name });
      colors.styles[name] = fn;
      fn.stack = [name];
    }
    Reflect.defineProperty(colors, name, {
      configurable: true,
      enumerable: true,
      set(value) {
        colors.alias?.(name, value);
      },
      get() {
        const col = (input) => style(input, col.stack);
        Reflect.setPrototypeOf(col, colors);
        col.stack = this.stack ? this.stack.concat(fn.stack) : fn.stack;
        return col;
      }
    });
  };
  return colors;
})();

// src/log-level.ts
var logLevels = ["verbose", "info", "warn", "error"];
var getNumberForLogLevel = (level) => {
  return logLevels.indexOf(level);
};
var isEqualOrBelowLogLevel = (currentLevel, level) => {
  return getNumberForLogLevel(currentLevel) <= getNumberForLogLevel(level);
};

// src/repro.ts
var reproWriteInstance = null;
var getReproWriter = () => {
  if (!reproWriteInstance) {
    throw new Error("reproWriteInstance is not initialized");
  }
  return reproWriteInstance;
};
var writeInRepro = (level, ...args) => {
  if (isReproEnabled()) {
    getReproWriter().writeLine(level, ...args);
  }
};
var shouldRepro = false;
var isReproEnabled = () => shouldRepro;

// src/truthy.ts
function truthy(value) {
  return Boolean(value);
}

// src/logger.ts
var INDENT_TOKEN = chalk.gray("│");
var verboseTag = (str) => {
  return isColorSupported() ? chalk.bgBlack(` ${str} `) : `[${str}]`;
};
var Log = {
  verbose: (options, ...args) => {
    writeInRepro("verbose", ...args);
    if (isEqualOrBelowLogLevel(options.logLevel, "verbose")) {
      if (args.length === 0) {
        return process.stdout.write(`
`);
      }
      return console.log(...[
        options.indent ? INDENT_TOKEN : null,
        options.tag ? verboseTag(options.tag) : null
      ].filter(truthy).concat(args.map((a) => chalk.gray(a))));
    }
  },
  info: (options, ...args) => {
    writeInRepro("info", ...args);
    if (isEqualOrBelowLogLevel(options.logLevel, "info")) {
      if (args.length === 0) {
        return process.stdout.write(`
`);
      }
      return console.log(...[options.indent ? INDENT_TOKEN : null].filter(truthy).concat(args ?? []));
    }
  },
  warn: (options, ...args) => {
    writeInRepro("warn", ...args);
    if (isEqualOrBelowLogLevel(options.logLevel, "warn")) {
      if (args.length === 0) {
        return process.stdout.write(`
`);
      }
      return console.warn(...[options.indent ? chalk.yellow(INDENT_TOKEN) : null].filter(truthy).concat(args.map((a) => chalk.yellow(a))));
    }
  },
  error: (options, ...args) => {
    writeInRepro("error", ...args);
    if (isEqualOrBelowLogLevel(options.logLevel, "error")) {
      if (args.length === 0) {
        return process.stdout.write(`
`);
      }
      return console.error(...[
        options.indent ? INDENT_TOKEN : null,
        options.tag ? verboseTag(options.tag) : null
      ].filter(truthy).concat(args.map((a) => chalk.red(a))));
    }
  }
};

// src/assets/read-file.ts
import https from "https";
import http from "node:http";

// src/redirect-status-codes.ts
var redirectStatusCodes = [301, 302, 303, 307, 308];

// src/assets/read-file.ts
var getClient = (url) => {
  if (url.startsWith("https://")) {
    return https.get;
  }
  if (url.startsWith("http://")) {
    return http.get;
  }
  throw new Error(`Can only download URLs starting with http:// or https://, got "${url}"`);
};
var readFileWithoutRedirect = (url) => {
  return new Promise((resolve, reject) => {
    const client = getClient(url);
    client(url, typeof Bun === "undefined" ? {
      headers: {
        "user-agent": "Mozilla/5.0 (@remotion/renderer - https://remotion.dev)"
      }
    } : {}, (res) => {
      resolve(res);
    }).on("error", (err) => {
      return reject(err);
    });
  });
};
var readFile = async (url, redirectsSoFar = 0) => {
  if (redirectsSoFar > 10) {
    throw new Error(`Too many redirects while downloading ${url}`);
  }
  const file = await readFileWithoutRedirect(url);
  if (redirectStatusCodes.includes(file.statusCode)) {
    if (!file.headers.location) {
      throw new Error(`Received a status code ${file.statusCode} but no "Location" header while calling ${file.headers.location}`);
    }
    const { origin } = new URL(url);
    const redirectUrl = new URL(file.headers.location, origin).toString();
    return readFile(redirectUrl, redirectsSoFar + 1);
  }
  if (file.statusCode >= 400) {
    const body = await tryToObtainBody(file);
    throw new Error([
      `Received a status code of ${file.statusCode} while downloading file ${url}.`,
      body ? `The response body was:` : null,
      body ? `---` : null,
      body ? body : null,
      body ? `---` : null
    ].filter(truthy).join(`
`));
  }
  return file;
};
var tryToObtainBody = async (file) => {
  const success = new Promise((resolve) => {
    let data = "";
    file.on("data", (chunk) => {
      data += chunk;
    });
    file.on("end", () => {
      resolve(data);
    });
    file.on("error", () => resolve(data));
  });
  let timeout = null;
  const body = await Promise.race([
    success,
    new Promise((resolve) => {
      timeout = setTimeout(() => {
        resolve(null);
      }, 5000);
    })
  ]);
  if (timeout) {
    clearTimeout(timeout);
  }
  return body;
};

// src/assets/download-file.ts
var incorrectContentLengthToken = "Download finished with";
var downloadFileWithoutRetries = ({ onProgress, url, to: toFn }) => {
  return new Promise((resolve, reject) => {
    let rejected = false;
    let resolved = false;
    let timeout;
    const resolveAndFlag = (val) => {
      resolved = true;
      resolve(val);
      if (timeout) {
        clearTimeout(timeout);
      }
    };
    const rejectAndFlag = (err) => {
      if (timeout) {
        clearTimeout(timeout);
      }
      reject(err);
      rejected = true;
    };
    const refreshTimeout = () => {
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(() => {
        if (resolved) {
          return;
        }
        rejectAndFlag(new Error(`Tried to download file ${url}, but the server sent no data for 20 seconds`));
      }, 20000);
    };
    refreshTimeout();
    let finishEventSent = false;
    readFile(url).then((res) => {
      const contentDisposition = res.headers["content-disposition"] ?? null;
      const contentType = res.headers["content-type"] ?? null;
      const to = toFn(contentDisposition, contentType);
      ensureOutputDirectory(to);
      const sizeHeader = res.headers["content-length"];
      const totalSize = typeof sizeHeader === "undefined" ? null : Number(sizeHeader);
      const writeStream = createWriteStream(to);
      let downloaded = 0;
      writeStream.on("close", () => {
        if (rejected) {
          return;
        }
        if (!finishEventSent) {
          onProgress?.({
            downloaded,
            percent: 1,
            totalSize: downloaded
          });
        }
        refreshTimeout();
        return resolveAndFlag({ sizeInBytes: downloaded, to });
      });
      writeStream.on("error", (err) => rejectAndFlag(err));
      res.on("error", (err) => rejectAndFlag(err));
      res.pipe(writeStream).on("error", (err) => rejectAndFlag(err));
      res.on("data", (d) => {
        refreshTimeout();
        downloaded += d.length;
        refreshTimeout();
        const percent = totalSize === null ? null : downloaded / totalSize;
        onProgress?.({
          downloaded,
          percent,
          totalSize
        });
        if (percent === 1) {
          finishEventSent = true;
        }
      });
      res.on("close", () => {
        if (totalSize !== null && downloaded !== totalSize) {
          rejectAndFlag(new Error(`${incorrectContentLengthToken} ${downloaded} bytes, but expected ${totalSize} bytes from 'Content-Length'.`));
        }
        writeStream.close();
      });
    }).catch((err) => {
      rejectAndFlag(err);
    });
  });
};
var downloadFile = async (options, retries = 2, attempt = 1) => {
  try {
    const res = await downloadFileWithoutRetries(options);
    return res;
  } catch (err) {
    const { message } = err;
    if (message === "aborted" || message.includes("ECONNRESET") || message.includes(incorrectContentLengthToken) || message.includes("503") || message.includes("502") || message.includes("504") || message.includes("500")) {
      if (retries === 0) {
        throw err;
      }
      Log.warn({ indent: options.indent, logLevel: options.logLevel }, `Downloading ${options.url} failed (will retry): ${message}`);
      const backoffInSeconds = (attempt + 1) ** 2;
      await new Promise((resolve) => {
        setTimeout(() => resolve(), backoffInSeconds * 1000);
      });
      return downloadFile(options, retries - 1, attempt + 1);
    }
    throw err;
  }
};

// src/compositor/make-file-executable.ts
import { accessSync, chmodSync, constants, statSync } from "node:fs";
var hasPermissions = (p) => {
  if (process.platform !== "linux" && process.platform !== "darwin") {
    try {
      accessSync(p, constants.X_OK);
      return true;
    } catch {
      return false;
    }
  }
  const stats = statSync(p);
  const { mode } = stats;
  const othersHaveExecutePermission = Boolean(mode & 1);
  if (othersHaveExecutePermission) {
    return true;
  }
  if (!process.getuid || !process.getgid) {
    throw new Error("Cannot check permissions on Linux without process.getuid and process.getgid");
  }
  const uid = process.getuid();
  const gid = process.getgid();
  const isOwner = uid === stats.uid;
  const isGroup = gid === stats.gid;
  const ownerHasExecutePermission = Boolean(mode & 64);
  const groupHasExecutePermission = Boolean(mode & 8);
  const canExecute = isOwner && ownerHasExecutePermission || isGroup && groupHasExecutePermission;
  return canExecute;
};
var makeFileExecutableIfItIsNot = (path2) => {
  const hasPermissionsResult = hasPermissions(path2);
  if (!hasPermissionsResult) {
    chmodSync(path2, 493);
  }
};

// src/browser/get-download-destination.ts
import fs2 from "node:fs";
import path2 from "node:path";
var getDownloadsCacheDir = () => {
  const cwd = process.cwd();
  let dir = cwd;
  for (;; ) {
    try {
      if (fs2.statSync(path2.join(dir, "package.json")).isFile()) {
        break;
      }
    } catch (e) {
    }
    const parent = path2.dirname(dir);
    if (dir === parent) {
      dir = undefined;
      break;
    }
    dir = parent;
  }
  if (!dir) {
    return path2.resolve(cwd, ".remotion");
  }
  if (process.versions.pnp === "1") {
    return path2.resolve(dir, ".pnp/.remotion");
  }
  if (process.versions.pnp === "3") {
    return path2.resolve(dir, ".yarn/.remotion");
  }
  return path2.resolve(dir, "node_modules/.remotion");
};

// src/browser/BrowserFetcher.ts
var TESTED_VERSION = "123.0.6312.86";
var PLAYWRIGHT_VERSION = "1105";
function getChromeDownloadUrl({
  platform: platform2,
  version
}) {
  if (platform2 === "linux-arm64") {
    return `https://playwright.azureedge.net/builds/chromium/${version ?? PLAYWRIGHT_VERSION}/chromium-linux-arm64.zip`;
  }
  return `https://storage.googleapis.com/chrome-for-testing-public/${version ?? TESTED_VERSION}/${platform2}/chrome-headless-shell-${platform2}.zip`;
}
var mkdirAsync = fs3.promises.mkdir;
var unlinkAsync = promisify(fs3.unlink.bind(fs3));
function existsAsync(filePath) {
  return new Promise((resolve2) => {
    fs3.access(filePath, (err) => {
      return resolve2(!err);
    });
  });
}
var getPlatform = () => {
  const platform2 = os.platform();
  switch (platform2) {
    case "darwin":
      return os.arch() === "arm64" ? "mac-arm64" : "mac-x64";
    case "linux":
      return os.arch() === "arm64" ? "linux-arm64" : "linux64";
    case "win32":
      return "win64";
    default:
      throw new Error("Unsupported platform: " + platform2);
  }
};
var destination = "chrome-headless-shell";
var getDownloadsFolder = () => {
  return path3.join(getDownloadsCacheDir(), destination);
};
var downloadBrowser = async ({
  logLevel,
  indent,
  onProgress,
  version
}) => {
  const platform2 = getPlatform();
  const downloadURL = getChromeDownloadUrl({ platform: platform2, version });
  const fileName = downloadURL.split("/").pop();
  if (!fileName) {
    throw new Error(`A malformed download URL was found: ${downloadURL}.`);
  }
  const downloadsFolder = getDownloadsFolder();
  const archivePath = path3.join(downloadsFolder, fileName);
  const outputPath = getFolderPath(downloadsFolder, platform2);
  if (await existsAsync(outputPath)) {
    return getRevisionInfo();
  }
  if (!await existsAsync(downloadsFolder)) {
    await mkdirAsync(downloadsFolder, {
      recursive: true
    });
  }
  if (os.platform() !== "darwin" && os.platform() !== "linux" && os.arch() === "arm64") {
    throw new Error([
      "Chrome Headless Shell is not available for Windows for arm64 architecture."
    ].join(`
`));
  }
  try {
    await downloadFile({
      url: downloadURL,
      to: () => archivePath,
      onProgress: (progress) => {
        if (progress.totalSize === null || progress.percent === null) {
          throw new Error("Expected totalSize and percent to be defined");
        }
        onProgress({
          downloadedBytes: progress.downloaded,
          totalSizeInBytes: progress.totalSize,
          percent: progress.percent
        });
      },
      indent,
      logLevel
    });
    await import_extract_zip.default(archivePath, { dir: outputPath });
    const chromePath = path3.join(outputPath, "chrome-linux", "chrome");
    const chromeHeadlessShellPath = path3.join(outputPath, "chrome-linux", "chrome-headless-shell");
    if (fs3.existsSync(chromePath)) {
      fs3.renameSync(chromePath, chromeHeadlessShellPath);
    }
    const chromeLinuxFolder = path3.join(outputPath, "chrome-linux");
    if (fs3.existsSync(chromeLinuxFolder)) {
      fs3.renameSync(chromeLinuxFolder, path3.join(outputPath, "chrome-headless-shell-linux-arm64"));
    }
  } finally {
    if (await existsAsync(archivePath)) {
      await unlinkAsync(archivePath);
    }
  }
  const revisionInfo = getRevisionInfo();
  makeFileExecutableIfItIsNot(revisionInfo.executablePath);
  return revisionInfo;
};
var getFolderPath = (downloadsFolder, platform2) => {
  return path3.resolve(downloadsFolder, platform2);
};
var getExecutablePath = () => {
  const downloadsFolder = getDownloadsFolder();
  const platform2 = getPlatform();
  const folderPath = getFolderPath(downloadsFolder, platform2);
  return path3.join(folderPath, `chrome-headless-shell-${platform2}`, platform2 === "win64" ? "chrome-headless-shell.exe" : "chrome-headless-shell");
};
var getRevisionInfo = () => {
  const executablePath = getExecutablePath();
  const downloadsFolder = getDownloadsFolder();
  const platform2 = getPlatform();
  const folderPath = getFolderPath(downloadsFolder, platform2);
  const url = getChromeDownloadUrl({ platform: platform2, version: null });
  const local = fs3.existsSync(folderPath);
  return {
    executablePath,
    folderPath,
    local,
    url
  };
};

// src/to-megabytes.ts
function toMegabytes(bytes) {
  const mb = bytes / 1024 / 1024;
  return `${Math.round(mb * 10) / 10} Mb`;
}

// src/browser/browser-download-progress-bar.ts
var defaultBrowserDownloadProgress = ({
  indent,
  logLevel,
  api
}) => () => {
  Log.info({ indent, logLevel }, "Downloading Chrome Headless Shell https://www.remotion.dev/docs/miscellaneous/chrome-headless-shell");
  Log.info({ indent, logLevel }, `Customize this behavior by adding a onBrowserDownload function to ${api}.`);
  let lastProgress = 0;
  return {
    onProgress: (progress) => {
      if (progress.downloadedBytes > lastProgress + 1e7 || progress.percent === 1) {
        lastProgress = progress.downloadedBytes;
        Log.info({ indent, logLevel }, `Downloading Chrome Headless Shell - ${toMegabytes(progress.downloadedBytes)}/${toMegabytes(progress.totalSizeInBytes)}`);
      }
    },
    version: null
  };
};

// src/get-local-browser.ts
import fs4 from "fs";
var getSearchPathsForProduct = () => {
  return [];
};
var getLocalBrowser = () => {
  for (const p of getSearchPathsForProduct()) {
    if (fs4.existsSync(p)) {
      return p;
    }
  }
  return null;
};

// src/ensure-browser.ts
var currentEnsureBrowserOperation = Promise.resolve();
var internalEnsureBrowserUncapped = async ({
  indent,
  logLevel,
  browserExecutable,
  onBrowserDownload
}) => {
  const status = getBrowserStatus(browserExecutable);
  if (status.type === "no-browser") {
    const { onProgress, version } = onBrowserDownload();
    await downloadBrowser({ indent, logLevel, onProgress, version });
  }
  const newStatus = getBrowserStatus(browserExecutable);
  return newStatus;
};
var internalEnsureBrowser = (options) => {
  currentEnsureBrowserOperation = currentEnsureBrowserOperation.then(() => internalEnsureBrowserUncapped(options));
  return currentEnsureBrowserOperation;
};
var getBrowserStatus = (browserExecutable) => {
  if (browserExecutable) {
    if (!fs5.existsSync(browserExecutable)) {
      throw new Error(`"browserExecutable" was specified as '${browserExecutable}' but the path doesn't exist. Pass "null" for "browserExecutable" to download a browser automatically.`);
    }
    return { path: browserExecutable, type: "user-defined-path" };
  }
  const localBrowser = getLocalBrowser();
  if (localBrowser !== null) {
    return { path: localBrowser, type: "local-browser" };
  }
  const revision = getRevisionInfo();
  if (revision.local && fs5.existsSync(revision.executablePath)) {
    return { path: revision.executablePath, type: "local-puppeteer-browser" };
  }
  return { type: "no-browser" };
};
var ensureBrowser = (options) => {
  const indent = false;
  const logLevel = options?.logLevel ?? "info";
  return internalEnsureBrowser({
    browserExecutable: options?.browserExecutable ?? null,
    indent,
    logLevel: options?.logLevel ?? "info",
    onBrowserDownload: options?.onBrowserDownload ?? defaultBrowserDownloadProgress({
      api: "ensureBrowser()",
      indent: false,
      logLevel
    })
  });
};
export {
  internalEnsureBrowser,
  ensureBrowser
};
