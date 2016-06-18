/// <reference path="screeps.d.ts" />
"use strict";
var util = require("./util");
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
            roleInfo.ticker(creep);
        }
    }
    Main.loop = loop;
})(Main || (Main = {}));
module.exports = Main;
//# sourceMappingURL=main.js.map