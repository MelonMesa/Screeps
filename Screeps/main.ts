/// <reference path="screeps.d.ts" />

import util = require("./util");
import spawnController = require("./SpawnController");

const activeRoles = ["harvester", "controllerfeeder", "scout", "builder", "transporter", "sourceminer"];
for (var i = 0; i < activeRoles.length; i++) {
    require(`./role_${activeRoles[i]}`);
}


module Main {
    /**
     * Main game loop.
    **/
    export function loop() {
        // Spawn control
        spawnController.doSpawnLogic();

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
                    console.log(`Unknown role ${mem.role}`);
                }
            }
        }
    }
}

export = Main;