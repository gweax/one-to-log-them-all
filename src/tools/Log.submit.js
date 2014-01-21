/*jslint unparam: true, indent: 4, maxlen: 120 */
/*global Log:false, XMLHttpRequest:false */

/**
 * @file A tool to submit log entries to the backend
 * @author Matthias Reuter
 * @license (c) 2013 Matthias Reuter, licensed under MPL 2.0
 */

/**
 * Submit the log entries.
 *
 * usage:
 *   Log.config.submitUrl = "/log.php";
 *   Log.submit(logEntries);
 *
 * @param {Array} data An array of log entries
 * @param {boolean} [async=true] Whether to submit the data asynchronously
 */
Log.submit = function (data, async) {
    "use strict";

    var httpRequest, submitUrl;

    submitUrl = Log.config.submitUrl;

    if (!submitUrl) {
        // we cannot throw an error...
        return false;
    }

    try {
        httpRequest = new XMLHttpRequest();
        httpRequest.open("POST", submitUrl, async !== false);
        httpRequest.send(Log.serializer(data));
    } catch (e) {
        return false;
    }

    return true;
};
