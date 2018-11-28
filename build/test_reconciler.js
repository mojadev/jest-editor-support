"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _path = _interopRequireDefault(require("path"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 *  You have a Jest test runner watching for changes, and you have
 *  an extension that wants to know where to show errors after file parsing.
 *
 *  This class represents the state between runs, keeping track of passes/fails
 *  at a file level, generating useful error messages and providing a nice API.
 */
var TestReconciler =
/*#__PURE__*/
function () {
  function TestReconciler() {
    _classCallCheck(this, TestReconciler);

    this.fileStatuses = {};
  } // the processed test results will be returned immediately instead of saved in
  // instance properties. This is 1) to prevent race condition 2) the data is already
  // stored in the this.fileStatuses, no dup is better 3) client will most likely need to process
  // all the results anyway.


  _createClass(TestReconciler, [{
    key: "updateFileWithJestStatus",
    value: function updateFileWithJestStatus(results) {
      var _this = this;

      // Loop through all files inside the report from Jest
      var statusList = [];
      results.testResults.forEach(function (file) {
        // Did the file pass/fail?
        var status = _this.statusToReconcilationState(file.status); // Create our own simpler representation


        var fileStatus = {
          assertions: _this.mapAssertions(file.name, file.assertionResults),
          file: file.name,
          message: file.message,
          status: status
        };
        _this.fileStatuses[file.name] = fileStatus;
        statusList.push(fileStatus);
      });
      return statusList;
    } // A failed test also contains the stack trace for an `expect`
    // we don't get this as structured data, but what we get
    // is useful enough to make it for ourselves

  }, {
    key: "mapAssertions",
    value: function mapAssertions(filename, assertions) {
      var _this2 = this;

      // Is it jest < 17? e.g. Before I added this to the JSON
      if (!assertions) {
        return [];
      } // Change all failing assertions into structured data


      return assertions.map(function (assertion) {
        // Failure messages seems to always be an array of one item
        var message = assertion.failureMessages && assertion.failureMessages[0];
        var short = null;
        var terse = null;
        var line = null;

        if (message) {
          // Just the first line, with little whitespace
          short = message.split('   at', 1)[0].trim(); // this will show inline, so we want to show very little

          terse = _this2.sanitizeShortErrorMessage(short);
          line = _this2.lineOfError(message, filename);
        }

        return {
          line: line,
          message: message || '',
          shortMessage: short,
          status: _this2.statusToReconcilationState(assertion.status),
          terseMessage: terse,
          title: assertion.title
        };
      });
    } // Do everything we can to try make a one-liner from the error report

  }, {
    key: "sanitizeShortErrorMessage",
    value: function sanitizeShortErrorMessage(string) {
      if (string.includes('does not match stored snapshot')) {
        return 'Snapshot has changed';
      }

      if (string.includes('New snapshot was not written')) {
        return 'New snapshot is ready to write';
      }

      return string.split('\n').splice(2).join('').replace(/\s\s+/g, ' ').replace('Received:', ', Received:').split('Difference:')[0];
    } // Pull the line out from the stack trace

  }, {
    key: "lineOfError",
    value: function lineOfError(message, filePath) {
      var filename = _path.default.basename(filePath);

      var restOfTrace = message.split(filename, 2)[1];
      return restOfTrace ? parseInt(restOfTrace.split(':')[1], 10) : null;
    }
  }, {
    key: "statusToReconcilationState",
    value: function statusToReconcilationState(status) {
      switch (status) {
        case 'passed':
          return 'KnownSuccess';

        case 'failed':
          return 'KnownFail';

        case 'pending':
          return 'KnownSkip';

        default:
          return 'Unknown';
      }
    }
  }, {
    key: "stateForTestFile",
    value: function stateForTestFile(file) {
      var results = this.fileStatuses[file];

      if (!results) {
        return 'Unknown';
      }

      return results.status;
    }
  }, {
    key: "assertionsForTestFile",
    value: function assertionsForTestFile(file) {
      var results = this.fileStatuses[file];
      return results ? results.assertions : null;
    }
  }, {
    key: "stateForTestAssertion",
    value: function stateForTestAssertion(file, name) {
      var results = this.fileStatuses[file];

      if (!results || !results.assertions) {
        return null;
      }

      var assertion = results.assertions.find(function (a) {
        return a.title === name;
      });

      if (!assertion) {
        return null;
      }

      return assertion;
    }
  }]);

  return TestReconciler;
}();

exports.default = TestReconciler;