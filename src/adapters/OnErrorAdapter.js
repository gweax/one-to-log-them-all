/*jslint unparam: true, indent: 4, maxlen: 120 */
/*global window:false, Log:false, printStackTrace:false */

/**
 * @file Catch unhandled errors and publish those to Log.error
 * @author Matthias Reuter
 * @license (c) 2013 Matthias Reuter, licensed under MPL 2.0
 */

/**
 * Catch unhandled errors and publish those to Log.error.
 *
 * If printStackTrace() is available (see  http://stacktracejs.com/) the
 * stacktrace will be included.
 */
window.onerror = (function () {
    "use strict";

    var originalOnError = window.onerror;

    return function (message, file, line) {
        var details = {
            "file": file,
            "line": line,
            "source": "window.onerror"
        };

        // see http://stacktracejs.com/
        if (typeof printStackTrace === "function") {
            details.stacktrace = printStackTrace();
        }

        Log.error(message, details);

        if (typeof originalOnError === "function") {
            try {
                return originalOnError.call(window, message, file, line);
            } catch (ignore) {
                // ignore
            }
        }

        // return true to indicate that this error was properly handled (this
        // way it won't be reported to the error console)
        return true;
    };

}());
