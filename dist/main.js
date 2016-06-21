"use strict";
var util = require("./util");
var profiler = require('./screeps-profiler');
var sectorController = require("./SectorController");
var spawnController = require("./SpawnController");
var EconomySector = require("./Sector_Economy");
sectorController.registerSector(EconomySector, 100);
var activeRoles = ["harvester", "controllerfeeder", "scout", "builder", "transporter", "sourceminer"];
for (var i = 0; i < activeRoles.length; i++) {
    require("./role_" + activeRoles[i]);
}
var debugmode = false;
if (debugmode)
    profiler.enable();
var Main;
(function (Main) {
    /**
     * Main game loop.
    **/
    function loop() {
        if (debugmode)
            profiler.wrap(Logic);
        else
            Logic();
    }
    Main.loop = loop;
    function Logic() {
        // the inconsistency is real
        sectorController.tick();
        spawnController.run();
        for (var i = 0; i < util.controllers.length; i++)
            util.controllers[i]();
        // Iterate all creeps
        for (var name in Game.creeps) {
            // Get creep
            var creep = Game.creeps[name];
            if (!creep.spawning) {
                // Get memory and role
                var mem = creep.memory;
                var roleInfo = util.roles[mem.role];
                // Tick
                if (roleInfo) {
                    roleInfo.ticker(creep);
                }
                else {
                    console.log(creep.name + " Unknown role " + mem.role);
                }
            }
        }
    }
})(Main || (Main = {}));
module.exports = Main;
//# sourceMappingURL=main.js.map