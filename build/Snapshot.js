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

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _traverse = _interopRequireDefault(require("@babel/traverse"));

var _babylon_parser = require("./parsers/babylon_parser");

var _jestSnapshot = require("jest-snapshot");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var describeVariants = Object.assign(Object.create(null), {
  describe: true,
  fdescribe: true,
  xdescribe: true
});
var base = Object.assign(Object.create(null), {
  describe: true,
  it: true,
  test: true
});
var decorators = Object.assign(Object.create(null), {
  only: true,
  skip: true
});
var validParents = Object.assign(Object.create(null), base, describeVariants, Object.assign(Object.create(null), {
  fit: true,
  xit: true,
  xtest: true
}));

var isValidMemberExpression = function isValidMemberExpression(node) {
  return node.object && base[node.object.name] && node.property && decorators[node.property.name];
};

var isDescribe = function isDescribe(node) {
  return describeVariants[node.name] || isValidMemberExpression(node) && node.object.name === 'describe';
};

var isValidParent = function isValidParent(parent) {
  return parent.callee && (validParents[parent.callee.name] || isValidMemberExpression(parent.callee));
};

var getArrayOfParents = function getArrayOfParents(path) {
  var result = [];
  var parent = path.parentPath;

  while (parent) {
    result.unshift(parent.node);
    parent = parent.parentPath;
  }

  return result;
};

var buildName = function buildName(snapshotNode, parents, position) {
  var fullName = parents.map(function (parent) {
    return parent.arguments[0].value;
  }).join(' ');
  return _jestSnapshot.utils.testNameToKey(fullName, position);
};

var Snapshot =
/*#__PURE__*/
function () {
  function Snapshot(parser, customMatchers, projectConfig) {
    _classCallCheck(this, Snapshot);

    this._parser = parser || _babylon_parser.getASTfor;
    this._matchers = ['toMatchSnapshot', 'toThrowErrorMatchingSnapshot'].concat(customMatchers || []);
    this._projectConfig = projectConfig;
  }

  _createClass(Snapshot, [{
    key: "getMetadata",
    value: function getMetadata(filePath) {
      var _this = this;

      var fileNode = this._parser(filePath);

      var state = {
        found: []
      };
      var Visitors = {
        Identifier: function Identifier(path, state, matchers) {
          if (matchers.indexOf(path.node.name) >= 0) {
            state.found.push({
              node: path.node,
              parents: getArrayOfParents(path)
            });
          }
        }
      };
      (0, _traverse.default)(fileNode, {
        enter: function enter(path) {
          var visitor = Visitors[path.node.type];

          if (visitor != null) {
            visitor(path, state, _this._matchers);
          }
        }
      }); // NOTE if no projectConfig is given the default resolver will be used

      var snapshotResolver = (0, _jestSnapshot.buildSnapshotResolver)(this._projectConfig || {});
      var snapshotPath = snapshotResolver.resolveSnapshotPath(filePath);

      var snapshots = _jestSnapshot.utils.getSnapshotData(snapshotPath, 'none').data;

      var lastParent = null;
      var count = 1;
      return state.found.map(function (snapshotNode, index) {
        var parents = snapshotNode.parents.filter(isValidParent);
        var innerAssertion = parents[parents.length - 1];

        if (lastParent !== innerAssertion) {
          lastParent = innerAssertion;
          count = 1;
        }

        var result = {
          content: undefined,
          count: count++,
          exists: false,
          name: '',
          node: snapshotNode.node
        };

        if (!innerAssertion || isDescribe(innerAssertion.callee)) {
          // An expectation inside describe never gets executed.
          return result;
        }

        result.name = buildName(snapshotNode, parents, result.count);

        if (snapshots[result.name]) {
          result.exists = true;
          result.content = snapshots[result.name];
        }

        return result;
      });
    }
  }]);

  return Snapshot;
}();

exports.default = Snapshot;