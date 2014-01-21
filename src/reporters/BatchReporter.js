/*jslint unparam: true, indent: 4, maxlen: 120 */
/*global BatchReporter:true, Log:false, window:false */

/**
 * @file A reporter to submit log entries in a batch
 * @author Matthias Reuter
 * @license (c) 2013 Matthias Reuter, licensed under MPL 2.0
 */

BatchReporter = (function () {
    "use strict";

    var queue = [];

    /**
     * Reports log entries to the backend in a batch.
     *
     * usage:
     *   BatchReporter.init({
     *     "level": "error warn info log debug",
     *     "url": "/log.php",
     *     "size": 10,
     *     "flushOnUnload": true
     *   });
     *
     * @param {string} level
     * @param {string} message
     */
    function BatchReporter(level, message) {
        queue.push({
            timestamp: Date.now(),
            level: level,
            message: message
        });

        if (queue.length >= Log.config.batchSize) {
            Log.submit(queue, true);
            queue = [];
        }
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
     * Setup the BatchReporter.
     *
     * @param {Object} config
     * @param {string} [config.level] The log levels to report.
     * @param {string} [config.url] The backend url for the submission. Can be
     *          omitted, when set to Log.config.submitUrl directly.
     * @param {number} [config.size=10] The batch size. When the number of entries
     *          collected equals or exceeds this number, the batch will be
     *          submitted
     * @param {boolean} [config.flushOnUnload=true] If true, log entries
     *          collected between the last submission and page unload will be
     *          submitted, even if the batch size is not reached.
     */
    BatchReporter.init = function (config) {
        var level = config.level || Log.config.defaultLevel;

        if (config.url) {
            Log.config.submitUrl = config.url;
        }

        Log.config.batchSize = config.size || 10;

        // Collect log entries created before init was called.
        if (Log.get) {
            queue = Log.get(level);

            if (queue.length >= Log.config.batchSize) {
                Log.submit(queue, true);
                queue = [];
            }
        }

        if (config.flushOnUnload !== false) {
            addOnUnloadHandler();
        }

        Log.on(level, BatchReporter);
    };

}());
