/*jslint unparam: true, sloppy: true, indent: 4, maxlen: 120 */
/*global IntervalReporter:true, Log:false, window:false */

/**
 * @file A reporter to submit log entries in an interval
 * @author Matthias Reuter
 * @license (c) 2013 Matthias Reuter, licensed under MPL 2.0
 */

IntervalReporter = (function () {

    var queue = [], interval;

    /**
     * Reports log entries to the backend in an interval.
     *
     * usage:
     *   IntervalReporter.init({
     *     "level": "error warn info log debug",
     *     "interval": 10000,
     *     "flushOnUnload": true,
     *     "url": "/log.php"
     *   });
     *
     * @param {string} level
     * @param {Object} data
     */
    function IntervalReporter(level, data) {
        queue.push(data);
    }

    /*
     * Submit the queue
     */
    function flushQueue() {
        window.clearInterval(interval);

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
     * Setup the IntervalReporter.
     *
     * @param {Object} config
     * @param {string} [config.level] The log levels to report.
     * @param {string} [config.url] The backend url for the submission. Can be
     *          omitted, when set to Log.config.submitUrl directly.
     * @param {number} [config.interval=10000] The interval between two submits
     *          in milliseconds.
     * @param {boolean} [config.flushOnUnload=true] If true, log entries
     *          collected between the last submission and page unload will be
     *          submitted.
     */
    IntervalReporter.init = function (config) {
        var level = config.level || Log.config.defaultLevel;

        if (Log.get) {
            queue = Log.get(level);
        }

        if (config.url) {
            Log.config.submitUrl = config.url;
        }

        if (config.flushOnUnload !== false) {
            addOnUnloadHandler();
        }

        interval = window.setInterval(function () {
            if (queue.length > 0) {
                Log.submit(queue, true);
                queue = [];
            }
        }, config.interval || 10000);

        Log.on(level, IntervalReporter);
    };

    return IntervalReporter;

}());
