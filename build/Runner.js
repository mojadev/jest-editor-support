"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _types = require("./types");

var _child_process = require("child_process");

var _fs = require("fs");

var _readTestResults = require("./readTestResults");

var _os = require("os");

var _path = require("path");

var _events = _interopRequireDefault(require("events"));

var _project_workspace = _interopRequireDefault(require("./project_workspace"));

var _Process = require("./Process");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

// This class represents the running process, and
// passes out events when it understands what data is being
// pass sent out of the process
var Runner =
/*#__PURE__*/
function (_EventEmitter) {
  _inherits(Runner, _EventEmitter);

  function Runner(workspace, options) {
    var _this;

    _classCallCheck(this, Runner);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(Runner).call(this));
    _this._createProcess = options && options.createProcess || _Process.createProcess;
    _this.options = options || {};
    _this.workspace = workspace;
    _this.outputPath = (0, _path.join)((0, _os.tmpdir)(), 'jest_runner.json');
    _this.prevMessageTypes = [];
    return _this;
  }

  _createClass(Runner, [{
    key: "start",
    value: function start() {
      var _this2 = this;

      var watchMode = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
      var watchAll = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      if (this.debugprocess) {
        return;
      }

      this.watchMode = watchMode;
      this.watchAll = watchAll; // Handle the arg change on v18

      var belowEighteen = this.workspace.localJestMajorVersion < 18;
      var outputArg = belowEighteen ? '--jsonOutputFile' : '--outputFile';
      var args = ['--json', '--useStderr', outputArg, this.outputPath];

      if (this.watchMode) {
        args.push(this.watchAll ? '--watchAll' : '--watch');
      }

      if (this.options.testNamePattern) {
        args.push('--testNamePattern', this.options.testNamePattern);
      }

      if (this.options.testFileNamePattern) {
        args.push(this.options.testFileNamePattern);
      }

      if (this.workspace.collectCoverage === true) {
        args.push('--coverage');
      }

      if (this.workspace.collectCoverage === false) {
        args.push('--no-coverage');
      }

      if (this.options.noColor === true) {
        args.push('--no-color');
      }

      var options = {
        shell: this.options.shell
      };
      this.debugprocess = this._createProcess(this.workspace, args, options);
      this.debugprocess.stdout.on('data', function (data) {
        _this2._parseOutput(data, false);
      });
      this.debugprocess.stderr.on('data', function (data) {
        // jest 23 could send test results message to stderr
        // see https://github.com/facebook/jest/pull/4858
        _this2._parseOutput(data, true);
      });
      this.debugprocess.on('exit', function () {
        _this2.emit('debuggerProcessExit');

        _this2.prevMessageTypes.length = 0;
      });
      this.debugprocess.on('error', function (error) {
        _this2.emit('terminalError', 'Process failed: ' + error.message);

        _this2.prevMessageTypes.length = 0;
      });
      this.debugprocess.on('close', function () {
        _this2.emit('debuggerProcessExit');

        _this2.prevMessageTypes.length = 0;
      });
    }
  }, {
    key: "_parseOutput",
    value: function _parseOutput(data, isStdErr) {
      var _this3 = this;

      var msgType = this.findMessageType(data);

      switch (msgType) {
        case _types.messageTypes.testResults:
          (0, _fs.readFile)(this.outputPath, 'utf8', function (err, data) {
            if (err) {
              var message = "JSON report not found at ".concat(_this3.outputPath);

              _this3.emit('terminalError', message);
            } else {
              var noTestsFound = _this3.doResultsFollowNoTestsFoundMessage();

              _this3.emit('executableJSON', (0, _readTestResults.readTestResults)(data, _this3.workspace), {
                noTestsFound: noTestsFound
              });
            }
          });
          this.prevMessageTypes.length = 0;
          break;

        case _types.messageTypes.watchUsage:
        case _types.messageTypes.noTests:
          this.prevMessageTypes.push(msgType);
          this.emit('executableStdErr', data, {
            type: msgType
          });
          break;

        default:
          // no special action needed, just report the output by its source
          if (isStdErr) {
            this.emit('executableStdErr', data, {
              type: msgType
            });
          } else {
            this.emit('executableOutput', data.toString().replace('[2J[H', ''));
          }

          this.prevMessageTypes.length = 0;
          break;
      }

      return msgType;
    }
  }, {
    key: "runJestWithUpdateForSnapshots",
    value: function runJestWithUpdateForSnapshots(completion, args) {
      var defaultArgs = ['--updateSnapshot'];
      var options = {
        shell: this.options.shell
      };

      var updateProcess = this._createProcess(this.workspace, defaultArgs.concat(_toConsumableArray(args ? args : [])), options);

      updateProcess.on('close', function () {
        completion();
      });
    }
  }, {
    key: "closeProcess",
    value: function closeProcess() {
      if (!this.debugprocess) {
        return;
      }

      if (process.platform === 'win32') {
        // Windows doesn't exit the process when it should.
        (0, _child_process.spawn)('taskkill', ['/pid', '' + this.debugprocess.pid, '/T', '/F']);
      } else {
        this.debugprocess.kill();
      }

      delete this.debugprocess;
    }
  }, {
    key: "findMessageType",
    value: function findMessageType(buf) {
      var str = buf.toString('utf8', 0, 58);
      var lastCommitRegex = /No tests found related to files changed since ((last commit)|("[a-z0-9]+"))./;

      if (lastCommitRegex.test(str)) {
        return _types.messageTypes.noTests;
      }

      if (/^\s*Watch Usage\b/.test(str)) {
        return _types.messageTypes.watchUsage;
      }

      if (str.trim().startsWith('Test results written to')) {
        return _types.messageTypes.testResults;
      }

      return _types.messageTypes.unknown;
    }
  }, {
    key: "doResultsFollowNoTestsFoundMessage",
    value: function doResultsFollowNoTestsFoundMessage() {
      if (this.prevMessageTypes.length === 1) {
        return this.prevMessageTypes[0] === _types.messageTypes.noTests;
      }

      if (this.prevMessageTypes.length === 2) {
        return this.prevMessageTypes[0] === _types.messageTypes.noTests && this.prevMessageTypes[1] === _types.messageTypes.watchUsage;
      }

      return false;
    }
  }]);

  return Runner;
}(_events.default);

exports.default = Runner;