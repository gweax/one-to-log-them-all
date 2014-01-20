/*jslint unparam: true, sloppy: true, indent: 4, maxlen: 120 */
/*global IntervalReporter:true, Log:false */

/**
 * @file A collector of all log entries for later access.
 * @author Matthias Reuter
 * @license (c) 2013 Matthias Reuter, licensed under MPL 2.0
 */

Log.get = (function () {

    var logEntries = [];

    /*
     * Returns a function to filter entries that are newer than the given
     * timestamp
     *
     * @param {number} timestamp
     * @returns {function}
     */
    function getTimestampFilter(timestamp) {
        return function (entry) {
            return entry.timestamp > timestamp;
        };
    }

    /*
     * Returns a function to filter entries that are of a given level.
     *
     * @param {string[]} An array of levels
     * @returns {function}
     */
    function getLevelsFilter(levels) {
        return function (entry) {
            return levels.indexOf(entry.level) !== -1;
        };
    }

    /**
     * Get all log entries created. Can be filtered for log levels and creation time.
     *
     * @alias Log.get
     * @param {string} [level=*] A space separated list of log levels. Only entries
     *          of these levels will be returned.
     * @param {number} [timestamp=0] A timestamp. Only entries newer than this
     *          timestamp will be returned.
     * @returns {Array} A list of log entries
     */
    function get(level, timestamp) {
        var levels, entries = logEntries;

        if (timestamp) {
            entries = entries.filter(getTimestampFilter(timestamp));
        }

        if (level && level !== "*") {
            levels = level.split(/\s+/);

            entries = entries.filter(getLevelsFilter(levels));
        }

        return entries;
    }

    /*
     * Collects all log entries
     */
    function collect(level, message) {
        logEntries.push({
            timestamp: Date.now(),
            level: level,
            message: message
        });
    }

    Log.on("*", collect);

    return get;

}());
