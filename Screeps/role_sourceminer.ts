/// <reference path="screeps.d.ts" />

import util = require("./util");
import RoomActor = require("./RoomActor");

module Role.SourceMiner {
    /**
     * Details for the "harvester" role.
    **/
    export const role: util.RoleDetails =
        {
            name: "miner",
            body: [WORK, MOVE]
        };

    /**
     * Spawns a harvester creep.
     * @param spawnName
     * @param creepName
    **/
    export function spawn(spawnName: string, creepName?: string): string | number {
        return util.spawnCreep(role, spawnName, creepName);
    }

    class SourceMiner extends RoomActor {
        /**
         * Runs the harvester role
         * @param creep
        **/
        @util.creepTicker(role)
        protected static run(creep: Creep) {
            super.run(creep);

            const source = RoomActor.QuickFindAny<Source>(creep, FIND_SOURCES, "minesource");
            if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                creep.moveTo(source);
            }
        }
    }
}

export = Role.SourceMiner;