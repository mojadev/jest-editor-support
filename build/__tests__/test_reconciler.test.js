"use strict";

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _test_reconciler = _interopRequireDefault(require("../test_reconciler"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2014-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 */
var fixtures = _path.default.resolve(__dirname, '../../fixtures');

function reconcilerWithFile(parser, file) {
  var exampleJSON = _fs.default.readFileSync("".concat(fixtures, "/failing-jsons/").concat(file));

  var json = JSON.parse(exampleJSON.toString());
  if (!parser) console.error('no parser for ', file);
  return parser.updateFileWithJestStatus(json);
}

describe('Test Reconciler', function () {
  var parser;
  var results;
  var dangerFilePath = '/Users/orta/dev/projects/danger/' + 'danger-js/source/ci_source/_tests/_travis.test.js';
  describe('for a simple project', function () {
    beforeAll(function () {
      parser = new _test_reconciler.default();
      results = reconcilerWithFile(parser, 'failing_jest_json.json');
    });
    it('returns expected result for all test suites', function () {
      expect(results.length).toEqual(5);
    });
    it('passes a passing method', function () {
      var testName = 'does not validate without josh';
      var status = parser.stateForTestAssertion(dangerFilePath, testName);
      expect(status.status).toEqual('KnownSuccess');
      expect(status.line).toBeNull();
    });
    it('fails a failing method in the same file', function () {
      var testName = 'validates when all Travis environment' + ' vars are set and Josh K says so';
      var status = parser.stateForTestAssertion(dangerFilePath, testName);
      expect(status.status).toEqual('KnownFail');
      expect(status.line).toEqual(12);
      var errorMessage = 'Expected value to be falsy, instead received true';
      expect(status.terseMessage).toEqual(errorMessage);
      expect(status.shortMessage).toEqual("Error: expect(received).toBeFalsy()\n\nExpected value to be falsy, instead received\n  true");
    });
    it('skips a skipped method', function () {
      var testName = 'does not pull it out of the env';
      var status = parser.stateForTestAssertion(dangerFilePath, testName);
      expect(status.status).toEqual('KnownSkip');
      expect(status.line).toBeNull();
    });
  });
  describe('in a monorepo project', function () {
    beforeEach(function () {
      parser = new _test_reconciler.default();
      results = reconcilerWithFile(parser, 'monorepo_root_1.json');
    });
    it('did processed all test suits including the suites failed to run', function () {
      expect(results.length).toEqual(8);
      var failed = results.filter(function (r) {
        return r.status === 'KnownFail';
      });
      expect(failed.length).toEqual(4); //2 of them is failed suite, i.e. no assertions

      expect(failed.filter(function (r) {
        return !r.assertions || r.assertions.length === 0;
      }).length).toEqual(2);
    });
    it('did catch the passed tests', function () {
      var succeededSuites = results.filter(function (r) {
        return r.status === 'KnownSuccess';
      });
      expect(succeededSuites.length).toEqual(4);
      var succeededTests = results.map(function (r) {
        return r.assertions || [];
      }) // $FlowFixMe: Flow thinks the type is array from above, not the number passed as initial value
      .reduce(function (sum, assertions) {
        var success = assertions.filter(function (a) {
          return a.status === 'KnownSuccess';
        });
        return sum + success.length;
      }, 0);
      expect(succeededTests).toEqual(46);
    });
    describe('when test updated', function () {
      var targetTests = {
        failedThenRemoved: ['/X/packages/Y-core/src/eth/__tests__/types.test.ts', 'should fail'],
        missingThenFailed: ['/X/packages/Y-app-vault/native/__tests__/index.ios.js', 'testing jest with react-native'],
        missingThenFixed: ['/X/packages/Y-app-vault/native/__tests__/index.ios.js', 'renders correctly'],
        passed: ['/X/packages/Y-keeper/src/redux/middlewares/__tests__/createGateMonitor.test.ts', 'can log/profile doable async actions']
      };

      function verifyTest(key, expectedStatus) {
        var test = parser.stateForTestAssertion(targetTests[key][0], targetTests[key][1]);

        if (!test && !expectedStatus) {
          return;
        }

        if (expectedStatus && test) {
          expect(test.status).toEqual(expectedStatus);
          return;
        }

        expect(key + ': ' + JSON.stringify(test)).toEqual(expectedStatus); // failed!
      }

      it('verify before update occurred', function () {
        verifyTest('missingThenFixed', undefined);
        verifyTest('missingThenFailed', undefined);
        verifyTest('failedThenRemoved', 'KnownFail');
        verifyTest('passed', 'KnownSuccess');
      });
      it('new file can update existing result', function () {
        //in file 2 we fixed 2 failed suites and removed 1 failed test
        //let's check the failed tests are now passed, while the previously
        //passed test should still be accessible
        var results2 = reconcilerWithFile(parser, 'monorepo_root_2.json');
        expect(results2.length).toEqual(4);
        verifyTest('missingThenFixed', 'KnownSuccess');
        verifyTest('missingThenFailed', 'KnownFail');
        verifyTest('failedThenRemoved', undefined);
        verifyTest('passed', 'KnownSuccess');
      });
    });
  });
});
describe('Terse Messages', function () {
  var parser;
  beforeEach(function () {
    parser = new _test_reconciler.default();

    var _ = reconcilerWithFile(parser, 'failing_expects.json');
  });
  it('handles shrinking a snapshot message', function () {
    var file = '/Users/orta/dev/projects/artsy/js/' + 'libs/jest-snapshots-svg/src/_tests/example.test.ts';

    var terseForTest = function terseForTest(name) {
      return parser.stateForTestAssertion(file, name);
    };

    var message = 'Expected value to equal: 2, Received: 1';
    var testName = 'numbers';
    expect(terseForTest(testName)).toHaveProperty('terseMessage', message);
    message = 'Expected value to equal: 2, Received: "1"';
    testName = 'string to numbers: numbers';
    expect(terseForTest(testName)).toHaveProperty('terseMessage', message);
    message = 'Expected value to equal: {"a": 2}, Received: {}';
    testName = 'objects';
    expect(terseForTest(testName)).toHaveProperty('terseMessage', message);
    message = 'Snapshot has changed';
    testName = 'snapshots';
    expect(terseForTest(testName)).toHaveProperty('terseMessage', message);
    message = 'Expected value to be greater than: 3, Received: 2';
    testName = 'greater than';
    expect(terseForTest(testName)).toHaveProperty('terseMessage', message);
    message = 'Expected value to be falsy, instead received 2';
    testName = 'falsy';
    expect(terseForTest(testName)).toHaveProperty('terseMessage', message);
    message = 'Expected value to be truthy, instead received null';
    testName = 'truthy';
    expect(terseForTest(testName)).toHaveProperty('terseMessage', message);
  });
});