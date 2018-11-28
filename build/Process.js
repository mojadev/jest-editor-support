"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createProcess = void 0;

var _child_process = require("child_process");

var _project_workspace = _interopRequireDefault(require("./project_workspace"));

var _wslPath = require("wsl-path");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

/**
 * Spawns and returns a Jest process with specific args
 *
 * @param {string[]} args
 * @returns {ChildProcess}
 */
var createProcess = function createProcess(workspace, args) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  // A command could look like `npm run test`, which we cannot use as a command
  // as they can only be the first command, so take out the command, and add
  // any other bits into the args
  var runtimeExecutable = workspace.pathToJest;
  var parameters = runtimeExecutable.split(' ');
  var initialArgs = parameters.slice(1);
  var command = parameters[0];
  var runtimeArgs = [].concat(initialArgs, args); // If a path to configuration file was defined, push it to runtimeArgs

  if (workspace.pathToConfig) {
    runtimeArgs.push('--config');
    runtimeArgs.push(workspace.pathToConfig);
  }

  if (workspace.useWsl) {
    // useWsl can be either true for the default ('wsl' or the explicit
    // wsl call to use, e.g. 'ubuntu run')
    var wslCommand = workspace.useWsl === true ? 'wsl' : workspace.useWsl;
    runtimeArgs = [command].concat(_toConsumableArray(runtimeArgs)).map(function (path) {
      return convertWslPath(path, wslCommand);
    });
    command = wslCommand;
  } // To use our own commands in create-react, we need to tell the command that
  // we're in a CI environment, or it will always append --watch


  var env = process.env;
  env['CI'] = 'true';
  var spawnOptions = {
    cwd: workspace.rootPath,
    env: env,
    shell: options.shell
  };

  if (workspace.debug) {
    console.log("spawning process with command=".concat(command, ", args=").concat(runtimeArgs.toString()));
  }

  return (0, _child_process.spawn)(command, runtimeArgs, spawnOptions);
};

exports.createProcess = createProcess;

var convertWslPath = function convertWslPath(maybePath, wslCommand) {
  if (!/^\w:\\/.test(maybePath)) {
    return maybePath;
  } // not every string containing a windows delimiter needs to be a
  // path, but if it starts with C:\ or similar the chances are very high


  try {
    return (0, _wslPath.windowsToWslSync)(maybePath, {
      wslCommand: wslCommand
    });
  } catch (exception) {
    console.log("Tried to translate ".concat(maybePath, " but received exception"), exception);
    return maybePath;
  }
};