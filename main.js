"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createServer = createServer;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _cors = _interopRequireDefault(require("cors"));

var _express = _interopRequireDefault(require("express"));

var _http = require("http");

var _ip = require("ip");

var _websocket = require("websocket");

var _bodyParser = require("body-parser");

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function createServer() {
  var PORT = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 80;
  var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var _config$stream = config.stream,
      stream = _config$stream === void 0 ? null : _config$stream,
      _config$docs = config.docs,
      docs = _config$docs === void 0 ? null : _config$docs,
      _config$name = config.name,
      name = _config$name === void 0 ? "[monster-bet]" : _config$name,
      streams = config.streams;
  var HOST = process.env.HOST || (0, _ip.address)();
  var ROUTE = "".concat(HOST, ":").concat(PORT);
  var app = new _express["default"]();
  var httpServer = (0, _http.createServer)(app);
  app.use((0, _cors["default"])());
  app.use((0, _bodyParser.json)({
    limit: '1024mb'
  }));
  var wsServer = new _websocket.server({
    httpServer: httpServer
  });
  wsServer.on('request', function (request) {
    var resource = request.resource;
    var key = resource.replace('/', '');

    if (streams[key]) {
      var _stream = streams[key];
      var connection = request.accept();

      _stream.subscribe(function (t) {
        connection.send(JSON.stringify(t));
      });
    } else {
      request.reject();
    }
  });

  if (docs) {
    var docsObj = {};

    for (var _i = 0, _Object$entries = Object.entries(docs); _i < _Object$entries.length; _i++) {
      var _Object$entries$_i = (0, _slicedToArray2["default"])(_Object$entries[_i], 2),
          key = _Object$entries$_i[0],
          value = _Object$entries$_i[1];

      var _ref = value || {},
          _ref$protocols = _ref.protocols,
          protocols = _ref$protocols === void 0 ? 'http' : _ref$protocols,
          _ref$example = _ref.example,
          example = _ref$example === void 0 ? null : _ref$example;

      var docsEntry = _objectSpread(_objectSpread({}, value), {}, {
        url: {}
      });

      var _iterator = _createForOfIteratorHelper(protocols.split(",")),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var protocol = _step.value;
          docsEntry.url[protocol] = "".concat(protocol, "://").concat(ROUTE).concat(example || key);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      docsObj[key] = docsEntry;
    }

    app.get("/", function (_req, res) {
      res.json(docsObj);
    });
  }

  httpServer.listen(PORT, console.info("".concat(name, " listening : http://").concat(ROUTE)));
  return {
    ROUTE: ROUTE,
    app: app,
    httpServer: httpServer,
    PORT: PORT,
    HOST: HOST,
    wsServer: wsServer
  };
}
