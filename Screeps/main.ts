import util = require("./util");

var profiler = require('./screeps-profiler');

require("./SpawnController");
require("./RoomController");

const activeRoles = ["harvester", "controllerfeeder", "scout", "builder", "transporter", "sourceminer"];
for (var i = 0; i < activeRoles.length; i++) {
    require(`./role_${activeRoles[i]}`);
}

var debugmode = false;

if (debugmode)
    profiler.enable();

module Main {
    /**
     * Main game loop.
    **/
    export function loop() {
        if (debugmode)
            profiler.wrap(Logic);
        else
            Logic();
    }

    function Logic() {
        for (var i = 0; i < util.controllers.length; i++)
            util.controllers[i]();

        // Iterate all creeps
        for (var name in Game.creeps) {
            // Get creep
            const creep = Game.creeps[name];
            if (!creep.spawning) {
                // Get memory and role
                const mem: util.CreepMemory = creep.memory;
                const roleInfo = util.roles[mem.role];

                // Tick
                if (roleInfo) {
                    roleInfo.ticker(creep);
                } else {
                    console.log(`${creep.name} Unknown role ${mem.role}`);
                }
            }
        }
    }
}

export = Main;