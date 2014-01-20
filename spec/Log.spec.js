describe("API", function () {

    it("has a method 'on'", function () {
        expect(typeof Log.on).toBe("function");
    });

    it("'on' expects two parameters", function () {
        expect(Log.on.length).toBe(2);
    });

    it("has a method 'debug'", function () {
        expect(typeof Log.debug).toBe("function");
    });

    it("has a method 'log'", function () {
        expect(typeof Log.log).toBe("function");
    });

    it("has a method 'info'", function () {
        expect(typeof Log.info).toBe("function");
    });

    it("has a method 'warn'", function () {
        expect(typeof Log.warn).toBe("function");
    });

    it("has a method 'error'", function () {
        expect(typeof Log.error).toBe("function");
    });

    it("has a method 'serializer'", function () {
        expect(typeof Log.serializer).toBe("function");
    });

    it("has an object 'config'", function () {
        expect(typeof Log.config).toBe("object");
    });

    it("'config' has a property 'defaultLevel", function () {
        expect(Log.config.hasOwnProperty("defaultLevel")).toBe(true);
    });

    it("'defaultLevel' has an initial value of '*'", function () {
        expect(Log.config.defaultLevel).toBe("*");
    });

});


describe("base use-cases", function () {
    var lastLevel, lastMessage;

    function TestReporter(level, message) {
        lastLevel = level;
        lastMessage = message;
    }

    Log.on("*", TestReporter);

    it("logs a debug message", function () {
        Log.debug("a debug message");
        expect(lastLevel).toBe("debug");
        expect(lastMessage).toBe("a debug message");
    });

    it("logs a log message", function () {
        Log.log("a log message");
        expect(lastLevel).toBe("log");
        expect(lastMessage).toBe("a log message");
    });

    it("logs an info message", function () {
        Log.info("an info message");
        expect(lastLevel).toBe("info");
        expect(lastMessage).toBe("an info message");
    });

    it("logs a warning", function () {
        Log.warn("a warning");
        expect(lastLevel).toBe("warn");
        expect(lastMessage).toBe("a warning");
    });

    it("logs an error", function () {
        Log.error("an error");
        expect(lastLevel).toBe("error");
        expect(lastMessage).toBe("an error");
    });
});


describe("stringify arguments", function () {
    var lastMessage;

    function TestReporter(level, message) {
        lastMessage = message;
    }

    Log.on("*", TestReporter);

    it("concatenates string parameters", function () {
        Log.info("foo", "bar");
        expect(lastMessage).toBe("foo bar");
    });

    it("concatenates primitive parameters", function () {
        Log.info("foo", 2, true, undefined);
        expect(lastMessage).toBe("foo 2 true undefined");
    });

    it("replaces one placeholder", function () {
        Log.info("foo %s", "bar");
        expect(lastMessage).toBe("foo bar");
    });

    it("replaces several placeholders", function () {
        Log.info("foo %s bar %s baz %s", 1, 2, 3);
        expect(lastMessage).toBe("foo 1 bar 2 baz 3");
    });

    it("does not replace supplementary placeholders", function () {
        Log.info("foo %s %s %s", "bar");
        expect(lastMessage).toBe("foo bar %s %s");
    });

    it("stringifies objects", function () {
        var obj = {
            foo: 42,
            bar: "baz"
        };

        Log.info(obj);
        expect(lastMessage).toBe(Log.serializer(obj));
    });

    it("stringifies complex parameters", function () {
        var obj = {
            foo: 42,
            bar: "baz"
            },
            arr = [ 1,2,3 ];

        Log.info("lorem %s", "ipsum %s dolor %s", "sit", obj, arr);
        expect(lastMessage).toBe("lorem ipsum sit dolor " + Log.serializer(obj) + " " + Log.serializer(arr));
    });
});


describe("setting of log level", function () {
    var lastLevel, lastMessage;

    function TestReporter(level, message) {
        lastLevel = level;
        lastMessage = message;
    }

    Log.on("debug", TestReporter);

    it("logs only debug messages when level is set to 'debug'", function () {
        Log.debug("foo");
        Log.info("bar");
        Log.error("baz");

        expect(lastLevel).toBe("debug");
    });

    Log.on("warn", TestReporter);

    it("logs debug messages and warnings when level 'warn' is added", function () {
        Log.debug("foo");
        Log.info("bar");
        expect(lastLevel).toBe("debug");

        Log.warn("baz");
        expect(lastLevel).toBe("warn");

        Log.error("bazinga");
        expect(lastLevel).toBe("warn");
    });
});
