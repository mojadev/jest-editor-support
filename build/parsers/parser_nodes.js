"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ParseResult = exports.DescribeBlock = exports.ItBlock = exports.NamedBlock = exports.Expect = exports.ParsedNode = exports.ParsedNodeTypes = exports.ParsedRange = void 0;

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Copyright (c) 2014-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 */

/**
 * range and location here are 1-based position.
 */
var ParsedRange = function ParsedRange(startLine, startCol, endLine, endCol) {
  _classCallCheck(this, ParsedRange);

  this.start = {
    column: startCol,
    line: startLine
  };
  this.end = {
    column: endCol,
    line: endLine
  };
}; // export type ParsedNodeType = 'expect' | 'describe' | 'it' | 'ROOT';


exports.ParsedRange = ParsedRange;
var ParsedNodeTypes = {
  describe: 'describe',
  expect: 'expect',
  it: 'it',
  root: 'root'
};
exports.ParsedNodeTypes = ParsedNodeTypes;

var ParsedNode =
/*#__PURE__*/
function () {
  function ParsedNode(type, file) {
    _classCallCheck(this, ParsedNode);

    this.type = type;
    this.file = file;
  }

  _createClass(ParsedNode, [{
    key: "addChild",
    value: function addChild(type) {
      var child;

      switch (type) {
        case ParsedNodeTypes.describe:
          child = new DescribeBlock(this.file);
          break;

        case ParsedNodeTypes.it:
          child = new ItBlock(this.file);
          break;

        case ParsedNodeTypes.expect:
          child = new Expect(this.file);
          break;

        default:
          throw TypeError("unexpected child node type: ".concat(type));
      }

      if (!this.children) {
        this.children = [child];
      } else {
        this.children.push(child);
      }

      return child;
    }
  }, {
    key: "filter",
    value: function filter(f) {
      var filterSelf = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var filtered = [];

      var _filter = function _filter(node, _filterSelf) {
        if (_filterSelf && f(node)) {
          filtered.push(node);
        }

        if (node.children) {
          node.children.forEach(function (c) {
            return _filter(c, true);
          });
        }
      };

      _filter(this, filterSelf);

      return filtered;
    }
  }]);

  return ParsedNode;
}();

exports.ParsedNode = ParsedNode;

var Expect =
/*#__PURE__*/
function (_ParsedNode) {
  _inherits(Expect, _ParsedNode);

  function Expect(file) {
    _classCallCheck(this, Expect);

    return _possibleConstructorReturn(this, _getPrototypeOf(Expect).call(this, ParsedNodeTypes.expect, file));
  }

  return Expect;
}(ParsedNode);

exports.Expect = Expect;

var NamedBlock =
/*#__PURE__*/
function (_ParsedNode2) {
  _inherits(NamedBlock, _ParsedNode2);

  function NamedBlock(type, file, name) {
    var _this;

    _classCallCheck(this, NamedBlock);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(NamedBlock).call(this, type, file));

    if (name) {
      _this.name = name;
    }

    return _this;
  }

  return NamedBlock;
}(ParsedNode);

exports.NamedBlock = NamedBlock;

var ItBlock =
/*#__PURE__*/
function (_NamedBlock) {
  _inherits(ItBlock, _NamedBlock);

  function ItBlock(file, name) {
    _classCallCheck(this, ItBlock);

    return _possibleConstructorReturn(this, _getPrototypeOf(ItBlock).call(this, ParsedNodeTypes.it, file, name));
  }

  return ItBlock;
}(NamedBlock);

exports.ItBlock = ItBlock;

var DescribeBlock =
/*#__PURE__*/
function (_NamedBlock2) {
  _inherits(DescribeBlock, _NamedBlock2);

  function DescribeBlock(file, name) {
    _classCallCheck(this, DescribeBlock);

    return _possibleConstructorReturn(this, _getPrototypeOf(DescribeBlock).call(this, ParsedNodeTypes.describe, file, name));
  }

  return DescribeBlock;
}(NamedBlock); // export type NodeClass = Node | Expect | ItBlock | DescribeBlock;


exports.DescribeBlock = DescribeBlock;

var ParseResult =
/*#__PURE__*/
function () {
  function ParseResult(file) {
    _classCallCheck(this, ParseResult);

    this.file = file;
    this.root = new ParsedNode(ParsedNodeTypes.root, file);
    this.describeBlocks = [];
    this.expects = [];
    this.itBlocks = [];
  }

  _createClass(ParseResult, [{
    key: "addNode",
    value: function addNode(node) {
      var dedup = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      if (node instanceof DescribeBlock) {
        this.describeBlocks.push(node);
      } else if (node instanceof ItBlock) {
        this.itBlocks.push(node);
      } else if (node instanceof Expect) {
        if (dedup && this.expects.some(function (e) {
          return e.start.line === node.start.line && e.start.column === node.start.column;
        })) {
          //found dup, return
          return;
        }

        this.expects.push(node);
      } else {
        throw new TypeError("unexpected node class '".concat(_typeof(node), "': ").concat(JSON.stringify(node)));
      }
    }
  }]);

  return ParseResult;
}();

exports.ParseResult = ParseResult;