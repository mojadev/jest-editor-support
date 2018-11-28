/**
 * Copyright (c) 2014-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 */
'use strict';

var _path = _interopRequireDefault(require("path"));

var _Snapshot = _interopRequireDefault(require("../Snapshot"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var snapshotHelper = new _Snapshot.default();

var snapshotFixturePath = _path.default.resolve(__dirname, 'fixtures/snapshots');

test('nodescribe.example', function () {
  var filePath = _path.default.join(snapshotFixturePath, 'nodescribe.example');

  var results = snapshotHelper.getMetadata(filePath);
  var allAssertion = ['fit', 'it', 'it.only', 'it.skip', 'test', 'test.only', 'test.skip', 'xit', 'xtest'];
  var expectations = Object.create(null);
  allAssertion.forEach(function (assertion) {
    expectations[assertion + ' 1'] = {
      assertion: assertion,
      checked: false,
      number: 1
    };
    expectations[assertion + ' 2'] = {
      assertion: assertion,
      checked: false,
      number: 2
    };
  });
  results.forEach(function (result) {
    var check = expectations[result.name];
    check.checked = result.content === "".concat(check.assertion, " ").concat(check.number);
  });
  expect(Object.keys(expectations).map(function (key) {
    return expectations[key];
  }).filter(function (expectation) {
    return !expectation.checked;
  }).length).toBe(0);
});
test('describe.example', function () {
  var filePath = _path.default.join(snapshotFixturePath, 'describe.example');

  var results = snapshotHelper.getMetadata(filePath);
  var allDescribe = ['describe', 'describe.only', 'describe.skip', 'fdescribe', 'xdescribe'];
  var allAssertion = ['fit', 'it', 'it.only', 'it.skip', 'test', 'test.only', 'test.skip', 'xit', 'xtest'];
  var expectations = Object.create(null);
  allDescribe.forEach(function (describe) {
    allAssertion.forEach(function (assertion) {
      expectations[describe.toUpperCase() + ' ' + assertion + ' 1'] = {
        assertion: assertion,
        checked: false,
        describe: describe,
        number: 1
      };
      expectations[describe.toUpperCase() + ' ' + assertion + ' 2'] = {
        assertion: assertion,
        checked: false,
        describe: describe,
        number: 2
      };
    });
  });
  results.forEach(function (result) {
    var check = expectations[result.name];
    check.checked = result.content === "".concat(check.number, " ").concat(check.assertion, " ").concat(check.describe);
  });
  expect(Object.keys(expectations).map(function (key) {
    return expectations[key];
  }).filter(function (expectation) {
    return !expectation.checked;
  }).length).toBe(0);
});
test('nested.example', function () {
  var filePath = _path.default.join(snapshotFixturePath, 'nested.example');

  var results = snapshotHelper.getMetadata(filePath);
  expect(results[0].content).toBe('first nested');
  expect(results[1].content).toBe('second nested');
  expect(results[0].name).toBe('outer describe outer it inner describe inner it 1');
  expect(results[1].name).toBe('outer describe outer it inner describe inner it 2');
  expect(results[0].node.loc.start).toEqual({
    column: 21,
    line: 5
  });
  expect(results[0].node.loc.end).toEqual({
    column: 36,
    line: 5
  });
  expect(results[1].node.loc.start).toEqual({
    column: 21,
    line: 6
  });
  expect(results[1].node.loc.end).toEqual({
    column: 36,
    line: 6
  });
});