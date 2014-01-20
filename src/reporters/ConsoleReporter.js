/*jslint unparam: true, sloppy: true, indent: 4, maxlen: 120 */
/*global ConsoleReporter:true, Log:false, window:false, console:false */

/**
 * @file A reporter to report log entries to the console.
 * @author Matthias Reuter
 * @license (c) 2013 Matthias Reuter, licensed under MPL 2.0
 */


/**
 * Report log entries to the console, if available
 *
 * usage:
 *   Log.on("error warn info log debug", ConsoleReporter);
 * or
 *   ConsoleReporter.init({
 *     "level": "error warn info log debug"
 *   });
 *
 * @param {string} level
 * @param {string} message
 */
ConsoleReporter = function (level, message) {
    // Do this check on every call. IE does not have console unless it is open.
    // This way logs can be reported when the console was opened after page load
    if (window.console) {
        if (!console[level]) {
            level = "log";
        }

        console[level](message);
    }
};

/**
 * Setup the ConsoleReporter
 *
 * @param {Object} config
 * @param {string} [config.level] The log levels to report.
 */
ConsoleReporter.init = function (config) {
    Log.on(config.level || Log.config.defaultLevel, ConsoleReporter);
};
