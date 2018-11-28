/**
 * Copyright (c) 2014-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 */
'use strict';

var _readTestResults = require("../readTestResults");

var _coverageMap;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

jest.mock('wsl-path', function () {
  return {
    wslToWindowsSync: function wslToWindowsSync(path) {
      return 'resolved:' + path;
    }
  };
});
var posixPath1 = '/mnt/c/Users/Path/PageTitle.test.tsx';
var posixPath2 = '/mnt/c/Users/Path2/PageFooter.test.tsx';
var resultFixture = JSON.stringify({
  coverageMap: (_coverageMap = {}, _defineProperty(_coverageMap, posixPath1, {
    path: posixPath1
  }), _defineProperty(_coverageMap, posixPath2, {
    path: posixPath2
  }), _coverageMap),
  testResults: [{
    assertionResults: [],
    name: posixPath1
  }, {
    assertionResults: [],
    name: posixPath2
  }]
});
describe('ResultReader', function () {
  afterEach(function () {
    jest.resetAllMocks();
  });
  it('should just parse the json result for non wsl environments', function () {
    var result = (0, _readTestResults.readTestResults)(resultFixture, {
      useWsl: false
    });
    expect(result.testResults[0].name).toBe(posixPath1);
    expect(Object.keys(result.coverageMap)).toEqual([posixPath1, posixPath2]);
  });
  it('should replace the testResult paths with the resolved paths when wsl is defined', function () {
    var result = (0, _readTestResults.readTestResults)(resultFixture, {
      useWsl: true
    });
    expect(result.testResults[0].name).toBe('resolved:' + posixPath1);
    expect(result.testResults[1].name).toBe('resolved:' + posixPath2);
  });
  it('should replace the coverageMap paths with the resolved paths when wsl is defined', function () {
    var result = (0, _readTestResults.readTestResults)(resultFixture, {
      useWsl: true
    });
    var mapKey1 = Object.keys(result.coverageMap)[0];
    var mapKey2 = Object.keys(result.coverageMap)[1];
    expect(mapKey1).toBe('resolved:' + posixPath1);
    expect(mapKey2).toBe('resolved:' + posixPath2);
    expect(result.coverageMap[mapKey1].path).toBe('resolved:' + posixPath1);
    expect(result.coverageMap[mapKey2].path).toBe('resolved:' + posixPath2);
  });
});