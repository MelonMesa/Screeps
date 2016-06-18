/// <reference path="screeps.d.ts" />

import util = require("./util");

module Main {
    /**
     * Main game loop.
    **/
    export function loop() {
        // Iterate all creeps
        for (var name in Game.creeps) {
            // Get creep
            const creep = Game.creeps[name];

            // Get memory and role
            const mem: util.CreepMemory = creep.memory;
            const roleInfo = util.roles[mem.role];
            
            // Tick
            roleInfo.ticker(creep);
        }
    }
}

export = Main;