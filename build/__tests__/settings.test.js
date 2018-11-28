/**
 * Copyright (c) 2014-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 */
'use strict';

var _events = _interopRequireDefault(require("events"));

var _project_workspace = _interopRequireDefault(require("../project_workspace"));

var _Settings = _interopRequireDefault(require("../Settings"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('Settings', function () {
  it('sets itself up fom the constructor', function () {
    var workspace = new _project_workspace.default('root_path', 'path_to_jest', 'test', 1000);
    var options = {
      shell: true
    };
    var settings = new _Settings.default(workspace, options);
    expect(settings.workspace).toEqual(workspace);
    expect(settings.settings).toEqual(expect.any(Object));
    expect(settings.spawnOptions).toEqual(options);
  });
  it('[jest 20] reads and parses the config', function () {
    var workspace = new _project_workspace.default('root_path', 'path_to_jest', 'test', 1000);
    var completed = jest.fn();
    var config = {
      cacheDirectory: '/tmp/jest',
      name: '[md5 hash]'
    };
    var json = {
      config: config,
      version: '19.0.0'
    };
    var mockProcess = new _events.default();
    mockProcess.stdout = new _events.default();

    var createProcess = function createProcess() {
      return mockProcess;
    };

    var buffer = makeBuffer(JSON.stringify(json));
    var settings = new _Settings.default(workspace, {
      createProcess: createProcess
    });
    settings.getConfig(completed);
    settings.getConfigProcess.stdout.emit('data', buffer);
    settings.getConfigProcess.emit('close');
    expect(completed).toHaveBeenCalled();
    expect(settings.jestVersionMajor).toBe(19);
    expect(settings.settings).toEqual(config);
  });
  it('[jest 21] reads and parses the config', function () {
    var workspace = new _project_workspace.default('root_path', 'path_to_jest', 'test', 1000);
    var completed = jest.fn();
    var configs = [{
      cacheDirectory: '/tmp/jest',
      name: '[md5 hash]'
    }];
    var json = {
      configs: configs,
      version: '21.0.0'
    };
    var mockProcess = new _events.default();
    mockProcess.stdout = new _events.default();

    var createProcess = function createProcess() {
      return mockProcess;
    };

    var buffer = makeBuffer(JSON.stringify(json));
    var settings = new _Settings.default(workspace, {
      createProcess: createProcess
    });
    settings.getConfig(completed);
    settings.getConfigProcess.stdout.emit('data', buffer);
    settings.getConfigProcess.emit('close');
    expect(completed).toHaveBeenCalled();
    expect(settings.jestVersionMajor).toBe(21);
    expect(settings.settings).toEqual(configs[0]);
  });
  it('[jest 21] reads and parses the configs', function () {
    var workspace = new _project_workspace.default('root_path', 'path_to_jest', 'test', 1000);
    var completed = jest.fn();
    var configs = [{
      cacheDirectory: '/tmp/jest',
      name: '[md5 hash]'
    }];
    var json = {
      configs: configs,
      version: '21.0.0'
    };
    var mockProcess = new _events.default();
    mockProcess.stdout = new _events.default();

    var createProcess = function createProcess() {
      return mockProcess;
    };

    var buffer = makeBuffer(JSON.stringify(json));
    var settings = new _Settings.default(workspace, {
      createProcess: createProcess
    });
    settings.getConfigs(completed);
    settings.getConfigProcess.stdout.emit('data', buffer);
    settings.getConfigProcess.emit('close');
    expect(completed).toHaveBeenCalled();
    expect(settings.jestVersionMajor).toBe(21);
    expect(settings.configs).toEqual(configs);
  });
  it('calls callback even if no data is sent', function () {
    var workspace = new _project_workspace.default('root_path', 'path_to_jest', 'test', 1000);
    var completed = jest.fn();
    var mockProcess = new _events.default();
    mockProcess.stdout = new _events.default();

    var createProcess = function createProcess() {
      return mockProcess;
    };

    var settings = new _Settings.default(workspace, {
      createProcess: createProcess
    });
    settings.getConfig(completed);
    settings.getConfigProcess.emit('close');
    expect(completed).toHaveBeenCalled();
  });
  it('passes command, args, and options to createProcess', function () {
    var localJestMajorVersion = 1000;
    var pathToConfig = 'test';
    var pathToJest = 'path_to_jest';
    var rootPath = 'root_path';
    var workspace = new _project_workspace.default(rootPath, pathToJest, pathToConfig, localJestMajorVersion);
    var createProcess = jest.fn().mockReturnValue({
      on: function on() {},
      stdout: new _events.default()
    });
    var options = {
      createProcess: createProcess,
      shell: true
    };
    var settings = new _Settings.default(workspace, options);
    settings.getConfig(function () {});
    expect(createProcess).toBeCalledWith({
      localJestMajorVersion: localJestMajorVersion,
      pathToConfig: pathToConfig,
      pathToJest: pathToJest,
      rootPath: rootPath
    }, ['--showConfig'], {
      shell: true
    });
  });
  describe('parse config', function () {
    var workspace = new _project_workspace.default('root_path', 'path_to_jest', 'test', 1000);
    var createProcess = jest.fn();
    var json = "{ \n      \"version\": \"23.2.0\",\n      \"configs\": [{\n        \"testRegex\": \"some-regex\"\n      }]\n    }";

    var run_test = function run_test(text) {
      var expected_version = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 23;
      var expected_regex = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'some-regex';

      settings._parseConfig(text);

      var target = settings.configs[0];
      expect(settings.jestVersionMajor).toBe(expected_version);
      expect(target.testRegex).toBe(expected_regex);
    };

    var settings;
    beforeEach(function () {
      settings = new _Settings.default(workspace, {
        createProcess: createProcess
      });
    });
    it('test regex', function () {
      var regex = settings._jsonPattern;
      var text = " > abc {}\n        { abc }\n      ";
      var index = text.search(regex);
      expect(index).not.toBe(-1);
      expect(text.substring(index).trim()).toBe('{ abc }');
      text = "{def: \n        {sub}\n      }";
      index = text.search(regex);
      expect(index).not.toBe(-1);
      expect(text.substring(index).startsWith('{def:')).toBe(true);
    });
    it('can parse correct config', function () {
      run_test(json);
    });
    it('can parse config even with noise', function () {
      var with_noise = "\n      > something\n      > more noise\n      ".concat(json, "\n      ");
      run_test(with_noise);
    });
  });
});

var makeBuffer = function makeBuffer(content) {
  // Buffer.from is not supported in < Node 5.10
  if (typeof Buffer.from === 'function') {
    return Buffer.from(content);
  }

  return new Buffer(content);
};