/*jslint unparam: true, indent: 4, maxlen: 120 */
/*global Wicket:false, Log:false */

/**
 * @file An adapter to connect the Wicket Log system to Log.
 * @author Matthias Reuter
 * @license (c) 2013 Matthias Reuter, licensed under MPL 2.0
 *
 * Overwrites the methods Wicket.Log.error, Wicket.Log.info and Wicket.Log.log
 * with methods that call Log.error, Log.info and Log.log. Also calls the
 * original Wicket Log methods.
 */

if (typeof Wicket === "object" && Wicket.Log) {

    // Wicket log levels are error, info and log
    ["error", "info", "log"].forEach(function (level) {
        "use strict";

        var original = Wicket.Log[level];

        Wicket.Log[level] = function (message) {
            Log[level](message);

            original.call(Wicket.Log, message);
        };
    });
}
