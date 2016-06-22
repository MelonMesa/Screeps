import util = require("./util");

var profiler = require('./screeps-profiler');

import sectorController = require("./SectorController");
import spawnController = require("./SpawnController");
import roomController = require("./RoomController");
import squadController = require("./SquadController");

import EconomySector = require("./Sector_Economy");
sectorController.registerSector(EconomySector, 100);

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

        // the consistency is real
        roomController.run();
        sectorController.run();
        spawnController.run();
        squadController.run();

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