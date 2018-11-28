/**
 * Copyright (c) 2014-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 */
'use strict';

var _project_workspace = _interopRequireDefault(require("../project_workspace"));

var _types = require("../types");

var _Runner = _interopRequireDefault(require("../Runner"));

var _Process = require("../Process");

var _os = require("os");

var _child_process = require("child_process");

var _fs = require("fs");

var _events = _interopRequireDefault(require("events"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

jest.mock('../Process');
jest.mock('child_process', function () {
  return {
    spawn: jest.fn()
  };
});
jest.mock('../readTestResults', function () {
  return {
    readTestResults: function readTestResults(x) {
      return JSON.parse(x);
    }
  };
});
jest.mock('os', function () {
  return {
    tmpdir: function tmpdir() {
      return "tmpdir";
    }
  };
});
jest.mock('fs', function () {
  // $FlowFixMe requireActual
  var readFileSync = jest.requireActual('fs').readFileSync; // Replace `readFile` with `readFileSync` so we don't get multiple threads

  return {
    readFile: function readFile(path, type, closure) {
      var data = readFileSync(path);
      closure(null, data);
    },
    readFileSync: readFileSync
  };
});

var path = require('path');

var fixtures = path.resolve(__dirname, '../../fixtures');
describe('Runner', function () {
  describe('constructor', function () {
    it('does not set watchMode', function () {
      var workspace = {};
      var sut = new _Runner.default(workspace);
      expect(sut.watchMode).not.toBeDefined();
    });
    it('does not set watchAll', function () {
      var workspace = {};
      var sut = new _Runner.default(workspace);
      expect(sut.watchAll).not.toBeDefined();
    });
    it('sets the output filepath', function () {
      var workspace = {};
      var sut = new _Runner.default(workspace);
      expect(sut.outputPath).toBe(path.join('tmpdir', 'jest_runner.json'));
    });
    it('sets the default options', function () {
      var workspace = {};
      var sut = new _Runner.default(workspace);
      expect(sut.options).toEqual({});
    });
    it('sets the options', function () {
      var workspace = {};
      var options = {};
      var sut = new _Runner.default(workspace, options);
      expect(sut.options).toBe(options);
    });
  });
  describe('start', function () {
    beforeEach(function () {
      jest.resetAllMocks();

      _Process.createProcess.mockImplementationOnce(function (workspace, args, options) {
        var process = new _events.default();
        process.stdout = new _events.default();
        process.stderr = new _events.default();
        return process;
      });
    });
    it('will not start when started', function () {
      var workspace = {};
      var sut = new _Runner.default(workspace);
      sut.start();
      sut.start();
      expect(_Process.createProcess).toHaveBeenCalledTimes(1);
    });
    it('sets watchMode', function () {
      var expected = true;
      var workspace = {};
      var sut = new _Runner.default(workspace);
      sut.start(expected);
      expect(sut.watchMode).toBe(expected);
    });
    it('sets watchAll', function () {
      var watchMode = true;
      var watchAll = true;
      var workspace = {};
      var sut = new _Runner.default(workspace);
      sut.start(watchMode, watchAll);
      expect(sut.watchMode).toBe(watchMode);
      expect(sut.watchAll).toBe(watchAll);
    });
    it('calls createProcess', function () {
      var workspace = {};
      var sut = new _Runner.default(workspace);
      sut.start(false);
      expect(_Process.createProcess.mock.calls[0][0]).toBe(workspace);
    });
    it('calls createProcess with the --json arg', function () {
      var workspace = {};
      var sut = new _Runner.default(workspace);
      sut.start(false);
      expect(_Process.createProcess.mock.calls[0][1]).toContain('--json');
    });
    it('calls createProcess with the --useStderr arg', function () {
      var workspace = {};
      var sut = new _Runner.default(workspace);
      sut.start(false);
      expect(_Process.createProcess.mock.calls[0][1]).toContain('--useStderr');
    });
    it('calls createProcess with the --jsonOutputFile arg for Jest 17 and below', function () {
      var workspace = {
        localJestMajorVersion: 17
      };
      var sut = new _Runner.default(workspace);
      sut.start(false);
      var args = _Process.createProcess.mock.calls[0][1];
      var index = args.indexOf('--jsonOutputFile');
      expect(index).not.toBe(-1);
      expect(args[index + 1]).toBe(sut.outputPath);
    });
    it('calls createProcess with the --outputFile arg for Jest 18 and above', function () {
      var workspace = {
        localJestMajorVersion: 18
      };
      var sut = new _Runner.default(workspace);
      sut.start(false);
      var args = _Process.createProcess.mock.calls[0][1];
      var index = args.indexOf('--outputFile');
      expect(index).not.toBe(-1);
      expect(args[index + 1]).toBe(sut.outputPath);
    });
    it('calls createProcess with the --watch arg when provided', function () {
      var workspace = {};
      var sut = new _Runner.default(workspace);
      sut.start(true);
      expect(_Process.createProcess.mock.calls[0][1]).toContain('--watch');
    });
    it('calls createProcess with the --coverage arg when provided', function () {
      var expected = '--coverage';
      var workspace = {
        collectCoverage: true
      };
      var options = {};
      var sut = new _Runner.default(workspace, options);
      sut.start(false);
      var args = _Process.createProcess.mock.calls[0][1];
      var index = args.indexOf(expected);
      expect(index).not.toBe(-1);
    });
    it('calls createProcess with the ---no-coverage arg when provided and false', function () {
      var expected = '--no-coverage';
      var workspace = {
        collectCoverage: false
      };
      var options = {};
      var sut = new _Runner.default(workspace, options);
      sut.start(false);
      var args = _Process.createProcess.mock.calls[0][1];
      var index = args.indexOf(expected);
      expect(index).not.toBe(-1);
    });
    it('calls createProcess without the --coverage arg when undefined', function () {
      var expected = '--coverage';
      var workspace = {};
      var options = {};
      var sut = new _Runner.default(workspace, options);
      sut.start(false);
      var args = _Process.createProcess.mock.calls[0][1];
      var index = args.indexOf(expected);
      expect(index).toBe(-1);
    });
    it('calls createProcess with the --testNamePattern arg when provided', function () {
      var expected = 'testNamePattern';
      var workspace = {};
      var options = {
        testNamePattern: expected
      };
      var sut = new _Runner.default(workspace, options);
      sut.start(false);
      var args = _Process.createProcess.mock.calls[0][1];
      var index = args.indexOf('--testNamePattern');
      expect(index).not.toBe(-1);
      expect(args[index + 1]).toBe(expected);
    });
    it('calls createProcess with a test path pattern when provided', function () {
      var expected = 'testPathPattern';
      var workspace = {};
      var options = {
        testFileNamePattern: expected
      };
      var sut = new _Runner.default(workspace, options);
      sut.start(false);
      expect(_Process.createProcess.mock.calls[0][1]).toContain(expected);
    });
    it('calls createProcess with the shell option when provided', function () {
      var workspace = {};
      var options = {
        shell: true
      };
      var sut = new _Runner.default(workspace, options);
      sut.start(false);
      expect(_Process.createProcess.mock.calls[0][2]).toEqual({
        shell: true
      });
    });
    it('calls createProcess with the no color option when provided', function () {
      var expected = '--no-color';
      var workspace = {};
      var options = {
        noColor: true
      };
      var sut = new _Runner.default(workspace, options);
      sut.start(false);
      expect(_Process.createProcess.mock.calls[0][1]).toContain(expected);
    });
  });
  describe('closeProcess', function () {
    var platformPV;
    beforeEach(function () {
      jest.resetAllMocks();
      platformPV = process.platform; // Remove the "process.platform" property descriptor so it can be writable.

      delete process.platform;
    });
    afterEach(function () {
      process.platform = platformPV;
    });
    it('does nothing if the runner has not started', function () {
      var workspace = {};
      var sut = new _Runner.default(workspace);
      sut.closeProcess();
      expect(_child_process.spawn).not.toBeCalled();
    });
    it('spawns taskkill to close the process on Windows', function () {
      var workspace = {};
      var sut = new _Runner.default(workspace);
      process.platform = 'win32';
      sut.debugprocess = {
        pid: 123
      };
      sut.closeProcess();
      expect(_child_process.spawn).toBeCalledWith('taskkill', ['/pid', '123', '/T', '/F']);
    });
    it('calls kill() to close the process on POSIX', function () {
      var workspace = {};
      var sut = new _Runner.default(workspace);
      process.platform = 'posix';
      var kill = jest.fn();
      sut.debugprocess = {
        kill: kill
      };
      sut.closeProcess();
      expect(kill).toBeCalledWith();
    });
    it('clears the debugprocess property', function () {
      var workspace = {};
      var sut = new _Runner.default(workspace);
      sut.debugprocess = {
        kill: function kill() {}
      };
      sut.closeProcess();
      expect(sut.debugprocess).not.toBeDefined();
    });
  });
});
describe('events', function () {
  var runner;
  var fakeProcess;
  beforeEach(function () {
    jest.resetAllMocks();
    fakeProcess = new _events.default();
    fakeProcess.stdout = new _events.default();
    fakeProcess.stderr = new _events.default();

    fakeProcess.kill = function () {};

    _Process.createProcess.mockImplementation(function () {
      return fakeProcess;
    });

    var workspace = new _project_workspace.default('.', 'node_modules/.bin/jest', 'test', 18);
    runner = new _Runner.default(workspace); // Sets it up and registers for notifications

    runner.start();
  });
  it('expects JSON from both stdout and stderr, then it passes the JSON', function () {
    var data = jest.fn();
    runner.on('executableJSON', data);
    runner.outputPath = "".concat(fixtures, "/failing-jsons/failing_jest_json.json");

    var doTest = function doTest(out) {
      data.mockClear(); // Emitting data through stdout should trigger sending JSON

      out.emit('data', 'Test results written to file');
      expect(data).toBeCalled(); // And lets check what we emit

      var dataAtPath = (0, _fs.readFileSync)(runner.outputPath);
      var storedJSON = JSON.parse(dataAtPath.toString());
      expect(data.mock.calls[0][0]).toEqual(storedJSON);
    };

    doTest(fakeProcess.stdout);
    doTest(fakeProcess.stderr);
  });
  it('emits errors when process errors', function () {
    var error = jest.fn();
    runner.on('terminalError', error);
    fakeProcess.emit('error', {});
    expect(error).toBeCalled();
  });
  it('emits debuggerProcessExit when process exits', function () {
    var close = jest.fn();
    runner.on('debuggerProcessExit', close);
    fakeProcess.emit('exit');
    expect(close).toBeCalled();
  });
  it('should start jest process after killing the old process', function () {
    runner.closeProcess();
    runner.start();
    expect(_Process.createProcess).toHaveBeenCalledTimes(2);
  });
  describe('stdout.on("data")', function () {
    it('should emit an "executableJSON" event with the "noTestsFound" meta data property set', function () {
      var listener = jest.fn();
      runner.on('executableJSON', listener);
      runner.outputPath = "".concat(fixtures, "/failing-jsons/failing_jest_json.json");
      runner.doResultsFollowNoTestsFoundMessage = jest.fn().mockReturnValueOnce(true);
      fakeProcess.stdout.emit('data', 'Test results written to file');
      expect(listener.mock.calls[0].length).toBe(2);
      expect(listener.mock.calls[0][1]).toEqual({
        noTestsFound: true
      });
    });
    it('should clear the message type history', function () {
      runner.outputPath = "".concat(fixtures, "/failing-jsons/failing_jest_json.json");
      runner.prevMessageTypes.push(_types.messageTypes.noTests);
      fakeProcess.stdout.emit('data', 'Test results written to file');
      expect(runner.prevMessageTypes.length).toBe(0);
    });
  });
  describe('stderr.on("data")', function () {
    it('should identify the message type', function () {
      runner.findMessageType = jest.fn();
      var expected = {};
      fakeProcess.stderr.emit('data', expected);
      expect(runner.findMessageType).toBeCalledWith(expected);
    });
    it('should add the type to the message type history when known', function () {
      runner.findMessageType = jest.fn().mockReturnValueOnce(_types.messageTypes.noTests);
      fakeProcess.stderr.emit('data', Buffer.from(''));
      expect(runner.prevMessageTypes).toEqual([_types.messageTypes.noTests]);
    });
    it('should clear the message type history when the type is unknown', function () {
      runner.findMessageType = jest.fn().mockReturnValueOnce(_types.messageTypes.unknown);
      fakeProcess.stderr.emit('data', Buffer.from(''));
      expect(runner.prevMessageTypes).toEqual([]);
    });
    it('should emit an "executableStdErr" event with the type', function () {
      var listener = jest.fn();
      var data = Buffer.from('');
      var type = {};
      var meta = {
        type: type
      };
      runner.findMessageType = jest.fn().mockReturnValueOnce(type);
      runner.on('executableStdErr', listener);
      fakeProcess.stderr.emit('data', data, meta);
      expect(listener).toBeCalledWith(data, meta);
    });
    it('should track when "No tests found related to files changed since the last commit" is received', function () {
      var data = Buffer.from('No tests found related to files changed since last commit.\n' + 'Press `a` to run all tests, or run Jest with `--watchAll`.');
      fakeProcess.stderr.emit('data', data);
      expect(runner.prevMessageTypes).toEqual([_types.messageTypes.noTests]);
    });
    it('should track when "No tests found related to files changed since master" is received', function () {
      var data = Buffer.from('No tests found related to files changed since "master".\n' + 'Press `a` to run all tests, or run Jest with `--watchAll`.');
      fakeProcess.stderr.emit('data', data);
      expect(runner.prevMessageTypes).toEqual([_types.messageTypes.noTests]);
    });
    it('should clear the message type history when any other other data is received', function () {
      var data = Buffer.from('');
      fakeProcess.stderr.emit('data', data);
      expect(runner.prevMessageTypes).toEqual([]);
    });
  });
  describe('findMessageType()', function () {
    it('should return "unknown" when the message is not matched', function () {
      var buf = Buffer.from('');
      expect(runner.findMessageType(buf)).toBe(_types.messageTypes.unknown);
    });
    it('should identify "No tests found related to files changed since last commit."', function () {
      var buf = Buffer.from('No tests found related to files changed since last commit.\n' + 'Press `a` to run all tests, or run Jest with `--watchAll`.');
      expect(runner.findMessageType(buf)).toBe(_types.messageTypes.noTests);
    });
    it('should identify "No tests found related to files changed since git ref."', function () {
      var buf = Buffer.from('No tests found related to files changed since "master".\n' + 'Press `a` to run all tests, or run Jest with `--watchAll`.');
      expect(runner.findMessageType(buf)).toBe(_types.messageTypes.noTests);
    });
    it('should identify the "Watch Usage" prompt', function () {
      var buf = Buffer.from('\n\nWatch Usage\n...');
      expect(runner.findMessageType(buf)).toBe(_types.messageTypes.watchUsage);
    });
  });
  describe('doResultsFollowNoTestsFoundMessage()', function () {
    it('should return true when the last message on stderr was "No tests found..."', function () {
      runner.prevMessageTypes.push(_types.messageTypes.noTests);
      expect(runner.doResultsFollowNoTestsFoundMessage()).toBe(true);
    });
    it('should return true when the last two messages on stderr were "No tests found..." and "Watch Usage"', function () {
      runner.prevMessageTypes.push(_types.messageTypes.noTests, _types.messageTypes.watchUsage);
      expect(runner.doResultsFollowNoTestsFoundMessage()).toBe(true);
    });
    it('should return false otherwise', function () {
      runner.prevMessageTypes.length = 0;
      expect(runner.doResultsFollowNoTestsFoundMessage()).toBe(false);
    });
  });
});