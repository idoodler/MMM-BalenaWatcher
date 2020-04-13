var NodeHelper = require("node_helper"),
    axios = require('axios');

module.exports = NodeHelper.create({

    // Create the timer object.
    timer: null,

    // Set the default config. Since the timer should not start
    // before the config is set by the frontend, the default can
    // be 1 seconds. The real default is set in MMM-BalenaWatcher.js

    config: {
        interval: 20,
        timeout: 30,
        tohora: {
            host: "localhost",
            port: 8080
        }
    },

    start: function start() {
        console.log("MMM-BalenaWatcher", "Starting BalenaWatcher now");
        setTimeout(this.scheduleRestart.bind(this, "init"), 5 * 1000);
    },

    socketNotificationReceived: function(notification, payload) {

        // Incoming config. Store config and schedule restart.
        if (notification === 'SET_CONFIG') {
            this.config = payload;
            this.scheduleRestart("config");
            console.log("WatchDog started. Maximum timeout: " + this.config.timeout + "s.");
        }

        // Incoming PING. Reschedule restart.
        if (notification === 'PING') {
            this.scheduleRestart("ping");
        }
    },

    // Reschedule restart by clearing old timer, and setting a new timer.
    scheduleRestart: function(reason) {
        console.log("MMM-BalenaWatcher", "Starting restart timer (" + (this.config.timeout) + "s) reason='" + reason + "'");
        clearTimeout(this.timer);
        this.timer = setTimeout(this.restart.bind(this), this.config.timeout * 1000);
    },

    // Quit Node process.
    restart: function() {
        clearTimeout(this.timer);
        this.timer = null;
        var now = new Date(),
            mmHost = global.config.address || "localhost",
            mmPort = global.config.port || 80,
            tohoraHost = this.config.hasOwnProperty("tohora") ? (this.config.tohora.host || mmHost) : mmHost,
            tohoraPort = this.config.hasOwnProperty("tohora") ? (this.config.tohora.port || 8080) : 8080,
            tohoraLocation = "http://" + tohoraHost + ":" + tohoraPort + "/launch/",
            mmLocation = "http://" + mmHost + ":" + mmPort;
            payload = {
                url: encodeURIComponent(mmLocation)
            };
        console.warn(now.toString() + ' - MMM-BalenaWatcher: Heartbeat timeout. Frontend might have crashed. Setting Tohora to "' + mmLocation + '" with "' + tohoraLocation + '"');
        axios.post(tohoraLocation, payload).finally(function() {
            this.scheduleRestart("after set");
        }.bind(this));
    }
});
