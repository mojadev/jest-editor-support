"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.messageTypes = void 0;

/**
 * Copyright (c) 2014-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 */

/**
 *  Did the thing pass, fail or was it not run?
 */
// Definitely skipped

/**
 * The Jest Extension's version of a status for
 * whether the file passed or not
 *
 */

/**
 * The Jest Extension's version of a status for
 * individual assertion fails
 *
 */
var messageTypes = {
  noTests: 1,
  testResults: 3,
  unknown: 0,
  watchUsage: 2
};
exports.messageTypes = messageTypes;