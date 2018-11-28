/**
 * Copyright (c) 2014-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 */
'use strict';

var _Process = require("../Process");

var _child_process = require("child_process");

var wslPath = _interopRequireWildcard(require("wsl-path"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

jest.mock('child_process');
jest.mock('wsl-path');
jest.mock('../readTestResults', function () {
  return {
    readTestResults: function readTestResults(x) {
      return x;
    }
  };
});
describe('createProcess', function () {
  afterEach(function () {
    jest.resetAllMocks();
  });
  it('spawns the process', function () {
    var workspace = {
      pathToJest: ''
    };
    var args = [];
    (0, _Process.createProcess)(workspace, args);
    expect(_child_process.spawn).toBeCalled();
  });
  it('spawns the command from workspace.pathToJest', function () {
    var workspace = {
      pathToJest: 'jest'
    };
    var args = [];
    (0, _Process.createProcess)(workspace, args);
    expect(_child_process.spawn.mock.calls[0][0]).toBe('jest');
    expect(_child_process.spawn.mock.calls[0][1]).toEqual([]);
  });
  it('spawns the first arg from workspace.pathToJest split on " "', function () {
    var workspace = {
      pathToJest: 'npm test --'
    };
    var args = [];
    (0, _Process.createProcess)(workspace, args);
    expect(_child_process.spawn.mock.calls[0][0]).toBe('npm');
    expect(_child_process.spawn.mock.calls[0][1]).toEqual(['test', '--']);
  });
  it('fails to spawn the first quoted arg from workspace.pathToJest', function () {
    var workspace = {
      pathToJest: '"../build scripts/test" --coverageDirectory="../code coverage"'
    };
    var args = [];
    (0, _Process.createProcess)(workspace, args);
    expect(_child_process.spawn.mock.calls[0][0]).not.toBe('"../build scripts/test"');
    expect(_child_process.spawn.mock.calls[0][1]).not.toEqual(['--coverageDirectory="../code coverage"']);
  });
  it('appends args', function () {
    var workspace = {
      pathToJest: 'npm test --'
    };
    var args = ['--option', 'value', '--another'];
    (0, _Process.createProcess)(workspace, args);
    expect(_child_process.spawn.mock.calls[0][1]).toEqual(['test', '--'].concat(args));
  });
  it('sets the --config arg to workspace.pathToConfig', function () {
    var workspace = {
      pathToConfig: 'non-standard.jest.js',
      pathToJest: 'npm test --'
    };
    var args = ['--option', 'value'];
    (0, _Process.createProcess)(workspace, args);
    expect(_child_process.spawn.mock.calls[0][1]).toEqual(['test', '--', '--option', 'value', '--config', 'non-standard.jest.js']);
  });
  it('defines the "CI" environment variable', function () {
    var expected = Object.assign({}, process.env, {
      CI: 'true'
    });
    var workspace = {
      pathToJest: ''
    };
    var args = [];
    (0, _Process.createProcess)(workspace, args);
    expect(_child_process.spawn.mock.calls[0][2].env).toEqual(expected);
  });
  it('sets the current working directory of the child process', function () {
    var workspace = {
      pathToJest: '',
      rootPath: 'root directory'
    };
    var args = [];
    (0, _Process.createProcess)(workspace, args);
    expect(_child_process.spawn.mock.calls[0][2].cwd).toBe(workspace.rootPath);
  });
  it('should not set the "shell" property when "options" are not provided', function () {
    var workspace = {
      pathToJest: ''
    };
    var args = [];
    (0, _Process.createProcess)(workspace, args);
    expect(_child_process.spawn.mock.calls[0][2].shell).not.toBeDefined();
  });
  it('should set the "shell" property when "options" are provided', function () {
    var expected = {};
    var workspace = {
      pathToJest: ''
    };
    var args = [];
    var options = {
      shell: expected
    };
    (0, _Process.createProcess)(workspace, args, options);
    expect(_child_process.spawn.mock.calls[0][2].shell).toBe(expected);
  });
  it('should prepend wsl when useWsl is set in the ProjectWorkspace', function () {
    var workspace = {
      pathToJest: 'npm run jest',
      useWsl: true
    };
    var args = [];
    var options = {
      shell: true
    };
    (0, _Process.createProcess)(workspace, args, options);
    expect(_child_process.spawn.mock.calls[0][0]).toEqual('wsl');
  });
  it('should keep the original command in the spawn arguments when using wsl', function () {
    var expected = ['npm', 'run', 'jest'];
    var workspace = {
      pathToJest: expected.join(' '),
      useWsl: true
    };
    var args = [];
    var options = {
      shell: true
    };
    (0, _Process.createProcess)(workspace, args, options);
    expect(_child_process.spawn.mock.calls[0][1]).toEqual(expected);
  });
  it('should translate file paths in the spawn command into the wsl context', function () {
    var expected = ['npm', 'run', '/mnt/c/Users/Bob/path'];
    wslPath.windowsToWslSync = jest.fn(function () {
      return expected[2];
    });
    var workspace = {
      pathToJest: "npm run C:\\Users\\Bob\\path",
      useWsl: true
    };
    var args = [];
    var options = {
      shell: true
    };
    (0, _Process.createProcess)(workspace, args, options);
    expect(_child_process.spawn.mock.calls[0][1]).toEqual(expected);
  });
});