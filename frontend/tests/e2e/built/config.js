"use strict";
exports.__esModule = true;
exports.config = {
    seleniumAddress: 'http://localhost:4444/wd/hub',
    specs: ['login.js'],
    framework: "mocha",
    mochaOpts: {
        reporter: "spec",
        slow: 3000
    },
    capabilities: {
        'browserName': 'chrome',
        args: ["--headless", "--disable-gpu", "--window-size=1920x1080"]
    }
};
