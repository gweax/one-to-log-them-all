/*jslint unparam: true, sloppy: true, indent: 4, maxlen: 120 */
/*global Log:true */

/**
 * @file An easy to use, easy to extend modular logging system
 * @author Matthias Reuter
 * @license (c) 2013 Matthias Reuter, licensed under MPL 2.0
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

Log = (function () {

    var logLevels, listeners, Log;

    logLevels = ["error", "warn", "info", "log", "debug"];
    listeners = {};

    logLevels.forEach(function (level) {
        listeners[level] = [];
    });

    Log = {
        /**
         * Attach a reporter to all log entries of a certain level.
         *
         * @param {string} level A space separated list of log levels.
         * @param {reporter} handler A reporter. On logging, this handler will
         *          be called with two parameters, the level and the log entry
         */
        "on": function (level, handler) {
            var levels;

            if (level === "*") {
                levels = logLevels;
            } else {
                levels = level.split(/\s+/);
            }

            if (typeof handler === "function") {
                levels.forEach(function (level) {
                    if (listeners.hasOwnProperty(level)) {
                        listeners[level].push(handler);
                    }
                });
            }
        },

        "config": {
            "defaultLevel": "*"
        }
    };

    logLevels.forEach(function (level) {
        Log[level] = function (message, detail) {
            var levelListeners, logEntry;

            logEntry = {
                "timestamp": Date.now(),
                "level": level,
                "message": message
            };

            if (detail) {
                logEntry.detail = detail;
            }

            levelListeners = listeners[level];
            levelListeners.forEach(function (listener) {
                try {
                    listener(level, logEntry);
                } catch (ignore) {
                    // ignore
                }
            });
        };
    });

    return Log;

}());

/**
 * A log entry
 *
 * @typedef {Object} LogEntry
 * @property {number} logEntry.timestamp The UTC timestamp when the entry was created
 * @property {string} logEntry.level The log level
 * @property {string} logEntry.message The log message given
 * @property {object} logEntry.detail Any further information passed in

/**
 * A reporter function
 *
 * @callback reporter
 * @param {string} level The current level of the log entry
 * @param {LogEntry} logEntry
 */