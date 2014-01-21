# One to log them all

I wanted to make client side logging easy. Easy to use, easy to configure, easy to extend. So I came up with this modular logger. It consists of three parts:

1. A *Logger*, which you call to log messages of different levels.
2. One or more *Reporters* which take care of the log entries. A very simple one just reports the messages to the console.
3. *Adapters* that hook existing logging systems to the logger. For example to collect all messages logged to the Wicket log system

The beautiful part is that you can have several reporters. These can be configured to only handle some levels. You might be interested in all log levels on the console, but only want to submit errors to the backend. You might as well want to reuse an exisiting logging system (for example the Wicket log system) and report messages to that.


## Logger

There are five different log methods for five different log levels:

`Log.error`, `Log.warn`, `Log.info`, `Log.log` and `Log.debug`

These methods don't do anything on their own. They are just there as an interface. In your code you call

    if (index === -1) {
        Log.error("Something went wrong");
    }

and for the moment don't care what that means. You can pass in as many arguments as you wish, maybe an error:

    try {
        doSomething();
    } catch (e) {
        Log.error("doSomething went wrong", e);
    }

You can use the same syntax as on console.log:

    Log.info("1994 was %s years ago.", new Date().getFullYear() - 1994);

Easy to use. Now let's add some meaning to the logging. This is done via a reporter.


## Reporter

A reporter is a function that is called on any of the log methods. It's where the action happens. For example, you could report to the console:

    function ConsoleReporter (level, message) {
        console[level](message);
    }

The reporter function gets two parameters, the first is a string which tells it what log level the call is for. The second parameter is a string created from the arguments of the call to `Log[level]`.

You have to connect the Logger and a reporter, so that the reporter is called everytime one of the logger methods is called. Maybe you are not interested in all method calls, so you just listen to some of them:

    Log.on("error warn info log debug", ConsoleReporter);

With `Log.on()` you connect the logger and the reporter. The first parameter is a space separated list of log levels you are interested in. The second parameter is a reporter function. If you're only interested in errors and warnings, you connect this way:

    Log.on("error warn", ConsoleReporter);

### Report to the backend

Sometimes you want to collect client side errors to the backend. You could use the OnUnloadReporter. This reporter collects all log entries and sends them to the backend on page unload. Since reporting to the backend needs some configuration, you connect the logger and the reporter via the reporter's init method:

    OnUnloadReporter.init({
        "level": "error",
        "url": "/log.php"
    });

The nice thing is, you can set up the ConsoleReporter to report all log entries to the console, and the OnUnloadReporter to only send errors to the backend. Easy to configure.


### Report to some other logging system

Maybe you use some third party code that has its own logging. If you want to reuse it, you can write a reporter for it. For example, if you have a Wicket application, you can reuse Wicket.Log.error et al.

    Log.on("*", WicketLogReporter);

And you're done. The level `*` is a shortcut for "error warn info log debug".


## Adapter

Maybe you use some third party code that has its own logging. If you want to use your Reporter for that logging, you can write an adapter. For example, if you have a Wicket application, you can connect Wicket.Log to the logger:

    Wicket.Log.error = function (message) {
        Log.error(message);
    };

Of course, this is just a dumb implementation. The WicketLogAdapter offers a safe way to connect the Wicket.Log and the logger, that still calls the original Wicket log methods.

*Attention!* Do not use an adapter and its corresponding reporter at the same time. This could lead to unexpected results up to endless loops.


### OnErrorAdapter

Javascript errors that aren't handled in a try..catch block can be handled via window.onerror. These are the errors you are most likely interested in on the backend. The OnErrorAdapter sets itself as a handler for window.onerror. It calls Log.error, passing in every available data it can get (that is file and line number). If you use stacktrace.js (http://stacktracejs.com) it can even print the stacktrace.


## Tools

Several reporters or adapters need to do the same things. For example, all backend reporters need to send data, most likely via Ajax.

### Log.submit

`Log.submit` is an easy implementation to send data to the backend. Feel free to replace it with your own if it doesn't do it the way you need it. This function takes two parameters, the first is an array of log entries, the second tells if the submission should be asynchronous or not.

`Log.submit` send the data to the URL given at `Log.config.submitUrl`. If there is none, no data will be sent.

`Log.submit` uses `Log.serializer` to convert the array of log entries to a string. As default, this is `JSON.stringify`, but feel free to overwrite this for you own needs.


### Log.get

Maybe you cannot initialize the reporter at the start of the page. Maybe there are calls to `Log.error` before. `Log.get` is an easy way to handle this case. It just collects all log entries. When calling `Log.get`, it will return an array of all entries collected until then. Each entry is an object with three properties: `timestamp`, the timestamp of when the event occured, `level`, the log level and `message`.

You can pass in a string of all log levels you are interested in, just as in calls to `Log.on`:

    Log.get("error warn");

You can also pass in a second parameter, a timestamp, to only get entries newer than that timestamp. *Attention!* Several log entries can have the same timestamp. This could lead to different results for two calls to `Log.get` when in the meantime more log entries were made.

Reporters that need initialization should use `Log.get`, if it's available.


## Examples

### Report everything to the console and errors to the backend on unload

    <script src="Log.js"></script>
    <script src="tools/Log.get.js"></script>
    <script src="tools/Log.submit.js"></script>
    <script src="reporters/ConsoleReporter.js"></script>
    <script src="reporters/OnUnloadReporter.js"></script>
    <script>
    Log.on("*", ConsoleReporter);
    OnUnloadReporter.init({
        "level": "error",
        "url": "/log.php"
    });
    </script>


## Custom log methods

Log comes with five predefined log methods: `debug`, `log`, `info`, `warn` and  `error`. Maybe this is not enough for you, because you want to report only some specific messages to a backend, not all of a given level. For this, you can add a custom log method:

    Log.addLevel("remote");
    BatchReporter.init({
        "level": "remote",
        "url": "/log.php"
    });

    Log.remote("This message will be logged to a backend");

You cannot create a custom log method if its name would overwrite an existing method or property. For example, you cannot create a custom log method `on` or `config`. `Log.addLevel()` returns true, when it succeeded in creating that level, and false if it failed.

Please note, that custom log levels are not included in the shortcut `*` matcher. It's a shortcut for the built-in levels only.


## Write your own

### Reporter

If you want to write your own reporter, you need to implement a function

    function Reporter (level, message) {}

If your reporter needs configuration (besides the level), offer an init function:

    Reporter.init = function (config) {};

The config object should contain at least the level. The init function should connect the reporter to the logger.

*Attention!* Never throw an error in a reporter! In combination with the OnErrorAdapter this could lead to an endless loop. You should not use any of the logging methods (`Log.error` et al.), since this could lead to an endless loop as well.

### Adapter

Writing your own adapter can be tricky. You have to decide weather to replace the original source or to wrap it. You have to carefully prevent any script errors. Everything else is up to you. You don't have to implement any interface, just call any of the logging methods (`Log.error` et al.) You might want to indicate the original source of the log in the details parameter of the logging functions, e.g.

    Log.error("Something went wrong", {
        "source": "Wicket.Log"
    });

### Tool

Maybe you wish to use jQuery to do the ajax request. Feel free to write your own `Log.submit` function. As long as the interface stays the same, the implementation details can be changed.

## Requirements

The code uses some of the Array extras of ECMAScript 5. If you want to use it in older browsers (IE 8 and below), you have to add some shim (see https://github.com/kriskowal/es5-shim).

The `Log.submit` function uses XMLHttpRequest. If you want to use it in older browsers, you have to write your own submit function that either uses ActiveXObject or an existing library like jQuery.

## License

This code is published under the Mozilla Public License 2.0.
