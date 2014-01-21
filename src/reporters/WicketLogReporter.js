/*jslint unparam: true, indent: 4, maxlen: 120 */
/*global WicketLogReporter:true, Wicket:false, Log:false */

/**
 * @file A reporter to submit log entries to the Wicket log system
 * @author Matthias Reuter
 * @license (c) 2013 Matthias Reuter, licensed under MPL 2.0
 */

/**
 * Reports log entries to the Wicket log system
 *
 * usage:
 *   Log.on("error warn info log debug", WicketLogReporter);
 * or
 *   WicketLogReporter.init({
 *     "level": "error warn"
 *   });
 *
 * @param {string} level
 * @param {string} message
 */
WicketLogReporter = function (level, message) {
    "use strict";

    if (typeof Wicket === "object" && Wicket.Log) {
        if (!Wicket.Log.hasOwnProperty(level)) {
            level = "info";
        }

        Wicket.Log[level](message);
    }
};

/**
 * Setup the WicketLogReporter
 *
 * @param {Object} config
 * @param {string} [config.level] The log levels to report.
 */
WicketLogReporter.init = function (config) {
    "use strict";

    Log.on(config.level || Log.config.defaultLevel, WicketLogReporter);
};
