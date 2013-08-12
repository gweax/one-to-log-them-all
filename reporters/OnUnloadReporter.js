/*jslint unparam: true, sloppy: true, indent: 4, maxlen: 120 */
/*global OnUnloadReporter:true, Log:false, window:false */

/**
 * @file A reporter to submit log entries on unload
 * @author Matthias Reuter
 * @license (c) 2013 Matthias Reuter, licensed under MPL 2.0
 */

OnUnloadReporter = (function () {

    var queue = [];

    /**
     * Reports log entries to the backend on page unload
     *
     * usage:
     *   OnUnloadReporter.init({
     *     "level": "error warn info log debug",
     *     "url": "/log.php"
     *   });
     *
     * @param {string} level
     * @param {Object} data
     */
    function OnUnloadReporter(level, data) {
        queue.push(data);
    }

    /*
     * Submit the queue
     */
    function flushQueue() {
        if (queue.length > 0) {
            Log.submit(queue, false);
        }
    }

    /*
     * Add listeners on unload to flush the queue.
     *
     * Use "beforeunload" instead of "unload" to guarantee the synchronous
     * request.
     */
    function addOnUnloadHandler() {
        if (window.addEventListener) {
            window.addEventListener("beforeunload", flushQueue, false);
        } else if (window.attachEvent) {
            window.attachEvent("onbeforeunload", flushQueue);
        }
    }

    /**
     * Setup the OnUnloadReporter.
     *
     * @param {Object} config
     * @param {string} [config.level] The log levels to report.
     * @param {string} [config.url] The backend url for the submission. Can be
     *          omitted, when set to Log.config.submitUrl directly.
     */
    OnUnloadReporter.init = function (config) {
        var level = config.level || Log.config.defaultLevel;

        if (config.url) {
            Log.config.submitUrl = config.url;
        }

        if (Log.get) {
            queue = Log.get(level);
        }

        addOnUnloadHandler();

        Log.on(level, OnUnloadReporter);
    };

}());
