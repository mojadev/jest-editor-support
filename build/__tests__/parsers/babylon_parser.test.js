/**
 * Copyright (c) 2014-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 */
'use strict';

var _require = require('../../parsers/babylon_parser'),
    parse = _require.parse;

var _require2 = require('../../../fixtures/parserTests'),
    parserTests = _require2.parserTests;

parserTests(parse);