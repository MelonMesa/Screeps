/// <reference path="Util.ts" />

/// <reference path="Roles/Base.ts" />

/// <reference path="Controllers/Room.ts" />
/// <reference path="Controllers/Sector.ts" />
/// <reference path="Controllers/Spawn.ts" />

/// <reference path="Sectors/Economy.ts" />

const profiler = require('./screeps-profiler');

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
        // Run controllers
        Controllers.room.run();
        Controllers.spawn.run();
        Controllers.sector.run();

        // Run creeps
        for (var name in Game.creeps) {
            // Get creep
            const creep = Game.creeps[name];
            if (!creep.spawning) {
                // Get memory and role
                const mem: Util.CreepMemory = creep.memory;
                const role = Roles.get(mem.role);

                // Tick
                if (role) {
                    role.run(creep);
                } else {
                    console.log(`${creep.name} Unknown role ${mem.role}`);
                }
            }
        }
    }
}

module.exports = Main;