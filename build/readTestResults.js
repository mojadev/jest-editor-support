"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.readTestResults = void 0;

var _wslPath = require("wsl-path");

var readTestResults = function readTestResults(data, workspace) {
  var results = JSON.parse(data);

  if (!workspace.useWsl) {
    return results;
  }

  return Object.assign({}, results, {
    coverageMap: translateWslPathCoverateToWindowsPaths(results.coverageMap, workspace),
    testResults: translateWslTestResultsToWindowsPaths(results.testResults, workspace)
  });
};
/**
 * Return a rewritten copy a coverage map created by a jest run in wsl. All POSIX paths
 * are rewritten to Windows paths, so vscode-jest running in windows can map the coverage.
 *
 * @param coverageMap The coverage map to rewrite
 */


exports.readTestResults = readTestResults;

var translateWslPathCoverateToWindowsPaths = function translateWslPathCoverateToWindowsPaths(coverageMap, workspace) {
  if (!coverageMap) {
    return coverageMap;
  }

  var result = {};
  Object.keys(coverageMap).forEach(function (key) {
    var translatedPath = (0, _wslPath.wslToWindowsSync)(key, {
      wslCommand: getWslCommand(workspace)
    });
    var entry = Object.assign({}, coverageMap[key], {
      path: translatedPath
    });
    result[translatedPath] = entry;
  });
  return result;
};
/**
 * Return a rewritten copy a {@see JestFileResults} array created by a jest run in wsl. All POSIX paths
 * are rewritten to Windows paths, so vscode-jest running in windows can map the test
 * status.
 *
 * @param testResults the TestResults to rewrite
 */


var translateWslTestResultsToWindowsPaths = function translateWslTestResultsToWindowsPaths(testResults, workspace) {
  if (!testResults) {
    return testResults;
  }

  return testResults.map(function (result) {
    return Object.assign({}, result, {
      name: (0, _wslPath.wslToWindowsSync)(result.name, {
        wslCommand: getWslCommand(workspace)
      })
    });
  });
};

var getWslCommand = function getWslCommand(workspace) {
  return workspace.wslCommand === true ? 'wsl' : workspace.wslCommand;
};