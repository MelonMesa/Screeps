/// <reference path="screeps.d.ts" />
"use strict";
var util = require("./util");
var activeRoles = ["harvester", "controllerfeeder", "scout", "builder", "transporter", "sourceminer"];
for (var i = 0; i < activeRoles.length; i++) {
    require("./role_" + activeRoles[i]);
}
var Main;
(function (Main) {
    /**
     * Main game loop.
    **/
    function loop() {
        // Iterate all creeps
        for (var name in Game.creeps) {
            // Get creep
            var creep = Game.creeps[name];
            // Get memory and role
            var mem = creep.memory;
            var roleInfo = util.roles[mem.role];
            // Tick
            if (roleInfo) {
                roleInfo.ticker(creep);
            }
            else {
                console.log("Unknown role " + mem.role);
            }
        }
    }
    Main.loop = loop;
})(Main || (Main = {}));
module.exports = Main;
//# sourceMappingURL=main.js.map