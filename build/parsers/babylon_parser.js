"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parse = exports.getASTfor = void 0;

var _fs = require("fs");

var _parser_nodes = require("./parser_nodes");

var _babylon = require("babylon");

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var getASTfor = function getASTfor(file, data) {
  var _getASTfor2 = _getASTfor(file, data),
      _getASTfor3 = _slicedToArray(_getASTfor2, 1),
      bFile = _getASTfor3[0];

  return bFile;
};

exports.getASTfor = getASTfor;

var _getASTfor = function _getASTfor(file, data) {
  var _data = data ? data : (0, _fs.readFileSync)(file).toString();

  var config = {
    plugins: ['*'],
    sourceType: 'module'
  };
  return [(0, _babylon.parse)(_data, config), _data];
};

var parse = function parse(file, data) {
  var parseResult = new _parser_nodes.ParseResult(file);

  var _getASTfor4 = _getASTfor(file, data),
      _getASTfor5 = _slicedToArray(_getASTfor4, 2),
      ast = _getASTfor5[0],
      _data = _getASTfor5[1];

  var updateNode = function updateNode(node, babylonNode) {
    node.start = babylonNode.loc.start;
    node.end = babylonNode.loc.end;
    node.start.column += 1;
    parseResult.addNode(node);

    if (node instanceof _parser_nodes.NamedBlock) {
      updateNameInfo(node, babylonNode);
    }
  };

  var isFunctionCall = function isFunctionCall(node) {
    return node.type === 'ExpressionStatement' && node.expression && node.expression.type === 'CallExpression';
  };

  var isFunctionDeclaration = function isFunctionDeclaration(nodeType) {
    return nodeType === 'ArrowFunctionExpression' || nodeType === 'FunctionExpression';
  };

  var updateNameInfo = function updateNameInfo(nBlock, bNode) {
    var arg = bNode.expression.arguments[0];
    var name = arg.value;

    if (!name && arg.type === 'TemplateLiteral') {
      name = _data.substring(arg.start + 1, arg.end - 1);
    }

    if (name == null) {
      throw new TypeError("failed to update namedBlock from: ".concat(JSON.stringify(bNode)));
    }

    nBlock.name = name;
    nBlock.nameRange = new _parser_nodes.ParsedRange(arg.loc.start.line, arg.loc.start.column + 2, arg.loc.end.line, arg.loc.end.column - 1);
  }; // Pull out the name of a CallExpression (describe/it)
  // handle cases where it's a member expression (.only)


  var getNameForNode = function getNameForNode(node) {
    if (!isFunctionCall(node)) {
      return false;
    }

    var name = node && node.expression && node.expression.callee ? node.expression.callee.name : undefined;

    if (!name && node && node.expression && node.expression.callee && node.expression.callee.object) {
      name = node.expression.callee.object.name;
    }

    return name;
  }; // When given a node in the AST, does this represent
  // the start of an it/test block?


  var isAnIt = function isAnIt(node) {
    var name = getNameForNode(node);
    return name === 'it' || name === 'fit' || name === 'test';
  };

  var isAnDescribe = function isAnDescribe(node) {
    var name = getNameForNode(node);
    return name === 'describe';
  }; // When given a node in the AST, does this represent
  // the start of an expect expression?


  var isAnExpect = function isAnExpect(node) {
    if (!isFunctionCall(node)) {
      return false;
    }

    var name = '';
    var element = node && node.expression ? node.expression.callee : undefined;

    while (!name && element) {
      name = element.name; // Because expect may have accessors tacked on (.to.be) or nothing
      // (expect()) we have to check multiple levels for the name

      element = element.object || element.callee;
    }

    return name === 'expect';
  };

  var addNode = function addNode(type, parent, babylonNode) {
    var child = parent.addChild(type);
    updateNode(child, babylonNode);

    if (child instanceof _parser_nodes.NamedBlock && child.name == null) {
      console.warn("block is missing name: ".concat(JSON.stringify(babylonNode)));
    }

    return child;
  }; // A recursive AST parser


  var searchNodes = function searchNodes(babylonParent, parent) {
    // Look through the node's children
    var child;

    for (var node in babylonParent.body) {
      if (!babylonParent.body.hasOwnProperty(node)) {
        return;
      }

      child = undefined; // Pull out the node

      var element = babylonParent.body[node];

      if (isAnDescribe(element)) {
        child = addNode('describe', parent, element);
      } else if (isAnIt(element)) {
        child = addNode('it', parent, element);
      } else if (isAnExpect(element)) {
        child = addNode('expect', parent, element);
      } else if (element && element.type === 'VariableDeclaration') {
        element.declarations.filter(function (declaration) {
          return declaration.init && isFunctionDeclaration(declaration.init.type);
        }).forEach(function (declaration) {
          return searchNodes(declaration.init.body, parent);
        });
      } else if (element && element.type === 'ExpressionStatement' && element.expression && element.expression.type === 'AssignmentExpression' && element.expression.right && isFunctionDeclaration(element.expression.right.type)) {
        searchNodes(element.expression.right.body, parent);
      } else if (element.type === 'ReturnStatement' && element.argument.arguments) {
        element.argument.arguments.filter(function (argument) {
          return isFunctionDeclaration(argument.type);
        }).forEach(function (argument) {
          return searchNodes(argument.body, parent);
        });
      }

      if (isFunctionCall(element)) {
        element.expression.arguments.filter(function (argument) {
          return isFunctionDeclaration(argument.type);
        }).forEach(function (argument) {
          return searchNodes(argument.body, child || parent);
        });
      }
    }
  };

  var program = ast['program'];
  searchNodes(program, parseResult.root);
  return parseResult;
};

exports.parse = parse;