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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('setup', function () {
  it('sets itself up fom the constructor', function () {
    var workspace = new _project_workspace.default('root_path', 'path_to_jest', 'path_to_config', 1000);
    expect(workspace.rootPath).toEqual('root_path');
    expect(workspace.pathToJest).toEqual('path_to_jest');
  });
});