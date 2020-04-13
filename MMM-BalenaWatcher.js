Module.register("MMM-BalenaWatcher",{

    // Default module config.
    defaults: {
        interval: 20,
        timeout: 30,
        tohora: {
            host: "localhost",
            port: 8080
        }
    },

    // Override dom generator.
    start: function() {
        this.sendSocketNotification('SET_CONFIG', this.config);
        this.startHeartbeat();
    },

    // Start the interval to send the PING message.
    startHeartbeat: function() {
        setInterval(function() {
            this.sendSocketNotification('PING', this.config);
        }.bind(this), this.config.interval * 1000);
    }

});
