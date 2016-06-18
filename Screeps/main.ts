/// <reference path="screeps.d.ts" />

import util = require("./util");

const activeRoles = ["harvester", "controllerfeeder", "builder", "transporter", "sourceminer"];
for (var i = 0; i < activeRoles.length; i++) {
    require(`./role_${activeRoles[i]}`);
}

import spawnController = require("./SpawnController");

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