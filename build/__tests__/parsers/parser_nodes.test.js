/**
 * Copyright (c) 2014-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 */
'use strict';

var _parser_nodes = require("../../parsers/parser_nodes");

describe('ParsedNode', function () {
  it('can filter children', function () {
    var root = new _parser_nodes.ParsedNode('describe', 'a/b/c');
    var c1 = root.addChild('describe');
    var c2 = root.addChild('it');
    var c1_1 = c1.addChild('it');
    var c1_2 = c1.addChild('describe');
    var c1_2_1 = c1_2.addChild('it');
    var filtered = root.filter(function (n) {
      return n.type === 'it';
    });
    expect(filtered.length).toEqual(3);
    expect(filtered).toEqual(expect.arrayContaining([c2, c1_1, c1_2_1]));
    filtered = root.filter(function (n) {
      return n.type == 'describe';
    });
    expect(filtered.length).toEqual(2);
    expect(filtered).toEqual(expect.arrayContaining([c1, c1_2]));
    filtered = c1.filter(function (n) {
      return n.type == 'it';
    });
    expect(filtered.length).toEqual(2);
    filtered = c1_2.filter(function (n) {
      return n.type == 'it';
    });
    expect(filtered.length).toEqual(1);
    filtered = c1_1.filter(function (n) {
      return n.type == 'it';
    });
    expect(filtered.length).toEqual(0);
    filtered = c1_1.filter(function (n) {
      return n.type == 'it';
    }, true);
    expect(filtered.length).toEqual(1);
  });
});
describe('ParseResult', function () {
  it('can add node by types', function () {
    var d1 = new _parser_nodes.DescribeBlock('a/b/c', 'd1');
    var i1 = new _parser_nodes.ItBlock('a/b/c', 'i1');
    var i2 = new _parser_nodes.ItBlock('a/b/c', 'i2');
    var e1 = i1.addChild('expect');
    var result = new _parser_nodes.ParseResult('a/b/c');
    result.addNode(d1);
    result.addNode(i1);
    result.addNode(i2);
    result.addNode(e1);
    expect(result.describeBlocks.length).toEqual(1);
    expect(result.itBlocks.length).toEqual(2);
    expect(result.expects.length).toEqual(1);
  });
  it('can dedup Expects', function () {
    var d1 = new _parser_nodes.DescribeBlock('a/b/c', 'd1');
    var d2 = new _parser_nodes.DescribeBlock('a/b/c', 'd2');
    var e1 = new _parser_nodes.Expect('a/b/c');
    var e2 = new _parser_nodes.Expect('a/b/c');
    var start = {
      column: 11,
      line: 10
    };
    var allNodes = [d1, d2, e1, e2];
    allNodes.forEach(function (n) {
      return n.start = start;
    }); //without dedup, anything goes

    var result = new _parser_nodes.ParseResult('a/b/c');
    allNodes.forEach(function (n) {
      return result.addNode(n);
    });
    expect(result.describeBlocks.length).toEqual(2);
    expect(result.itBlocks.length).toEqual(0);
    expect(result.expects.length).toEqual(2); // enable dedup, only impact expect blocks

    result = new _parser_nodes.ParseResult('a/b/c');
    allNodes.forEach(function (n) {
      return result.addNode(n, true);
    });
    expect(result.describeBlocks.length).toEqual(2);
    expect(result.itBlocks.length).toEqual(0);
    expect(result.expects.length).toEqual(1);
  });
});