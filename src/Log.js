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

    /**
     * Converts an array of arguments into a string, just like console.log etc. do.
     *
     * @param {Array} args
     * @returns {string}
     */
    function stringifyArguments(args) {
        var regExp = /%[sino]/;

        return args.reduce(function (prev, curr) {
            var result,
                curr = typeof curr === "object" ? Log.serializer(curr) : curr;

            if (regExp.test(prev)) {
                result = prev.replace(regExp, curr);
            } else {
                result = prev + " " + curr;
            }

            return result;
        }, "").trim();
    }

    /**
     * Creates a log level function on the Log object.
     *
     * @param {string} level - The log level
     */
    function createLogLevelFunction(level) {
        Log[level] = function () {
            var message = stringifyArguments(Array.apply(null, arguments)),
                levelListeners = listeners[level];

            levelListeners.forEach(function (listener) {
                try {
                    listener(level, message);
                } catch (ignore) {
                    // ignore
                }
            });
        };

        listeners[level] = [];
    }

    Log = {
        /**
         * Attach a reporter to all log entries of a certain level.
         *
         * @param {string} level A space separated list of log levels.
         * @param {function} handler A reporter. On logging, this handler will
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

        /**
         * Add a custom log level. Custom log levels will not be matched by the '*' matcher.
         *
         * @param {string} level
         * @return {boolean} Whether the creation of a custom log level succeeded.
         */
        "addLevel": function (level) {
            if (typeof level !== "string" || level === "" || Log.hasOwnProperty(level)) {
                return false;
            }

            createLogLevelFunction(level);

            return true;
        },

        "serializer": JSON.stringify,

        "config": {
            "defaultLevel": "*"
        }
    };

    logLevels.forEach(createLogLevelFunction);

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
