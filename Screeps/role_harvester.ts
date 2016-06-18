/// <reference path="screeps.d.ts" />

import util = require("./util");

module Role.Harvester {
    /**
     * Details for the "harvester" role.
    **/
    export const role: util.RoleDetails =
        {
            name: "harvester",
            body: [WORK, CARRY, MOVE]
        };

    /**
     * Spawns a harvester creep.
     * @param spawnName
     * @param creepName
    **/
    export function spawn(spawnName: string, creepName?: string): string | number {
        return util.spawnCreep(role, spawnName, creepName);
    }

    class Harvester {
        /**
         * Runs the harvester role
         * @param creep
        **/
        @util.creepTicker(role)
        private static run(creep: Creep) {
            if (creep.carry.energy < creep.carryCapacity) {
                const sources = <(Source | Mineral)[]>creep.room.find(FIND_SOURCES);
                if (creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(sources[0]);
                }
            }
            else {
                if (creep.transfer(Game.spawns["Spawn1"], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(Game.spawns["Spawn1"]);
                }
            }
        }
    }
}

export = Role.Harvester;