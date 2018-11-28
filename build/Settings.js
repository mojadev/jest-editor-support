"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _child_process = require("child_process");

var _events = _interopRequireDefault(require("events"));

var _jestConfig = require("jest-config");

var _project_workspace = _interopRequireDefault(require("./project_workspace"));

var _Process = require("./Process");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var Settings =
/*#__PURE__*/
function (_EventEmitter) {
  _inherits(Settings, _EventEmitter);

  function Settings(workspace, options) {
    var _this;

    _classCallCheck(this, Settings);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(Settings).call(this));
    _this.workspace = workspace;
    _this._createProcess = options && options.createProcess || _Process.createProcess;
    _this.spawnOptions = {
      shell: options && options.shell
    };
    var testMatch = _jestConfig.defaults.testMatch,
        testRegex = _jestConfig.defaults.testRegex;
    _this.settings = {
      testMatch: testMatch,
      testRegex: testRegex
    };
    _this.configs = [_this.settings];
    _this._jsonPattern = new RegExp(/^[\s]*\{/gm);
    return _this;
  }

  _createClass(Settings, [{
    key: "_parseConfig",
    value: function _parseConfig(text) {
      var settings = null;

      try {
        settings = JSON.parse(text);
      } catch (err) {
        // skip the non-json content, if any
        var idx = text.search(this._jsonPattern);

        if (idx > 0) {
          if (this.workspace.debug) {
            console.log("skip config output noise: ".concat(text.substring(0, idx)));
          }

          this._parseConfig(text.substring(idx));

          return;
        }

        console.warn("failed to parse config: \n".concat(text, "\nerror: ").concat(err));
        throw err;
      }

      this.jestVersionMajor = parseInt(settings.version.split('.').shift(), 10);
      this.configs = this.jestVersionMajor >= 21 ? settings.configs : [settings.config];

      if (this.workspace.debug) {
        console.log("found config jestVersionMajor=".concat(this.jestVersionMajor));
      }
    }
  }, {
    key: "getConfigs",
    value: function getConfigs(completed) {
      var _this2 = this;

      this.getConfigProcess = this._createProcess(this.workspace, ['--showConfig'], this.spawnOptions);
      this.getConfigProcess.stdout.on('data', function (data) {
        _this2._parseConfig(data.toString());
      }); // They could have an older build of Jest which
      // would error with `--showConfig`

      this.getConfigProcess.on('close', function () {
        completed();
      });
    }
  }, {
    key: "getConfig",
    value: function getConfig(completed) {
      var _this3 = this;

      var index = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      this.getConfigs(function () {
        _this3.settings = _this3.configs[index];
        completed();
      });
    }
  }]);

  return Settings;
}(_events.default);

exports.default = Settings;