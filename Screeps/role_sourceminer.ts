/// <reference path="screeps.d.ts" />

import util = require("./util");

module Role.SourceMiner {

    /**
     * Details for the "harvester" role.
    **/
    export const role: util.RoleDetails =
        {
            name: "miner",
            bodies: [ [WORK, MOVE] ]
        };

    /**
     * Spawns a harvester creep.
     * @param spawnName
     * @param creepName
    **/
    export function spawn(spawnName: string, creepName?: string): string | number {
        return util.spawnCreep(role, spawnName, creepName);
    }

    interface MinerMemory {
        source?: string;
    }

    class SourceMiner {

        /**
         * Runs the harvester role
         * @param creep
        **/
        @util.creepTicker(role)
        protected static run(creep: Creep) {
            const roommemory: RoomMemory = creep.room.memory;
            const minermemory: MinerMemory = creep.memory;

            if (roommemory.noSources || !roommemory.sources) return;

            if (minermemory.source) {
                if (creep.ticksToLive <= 1) {
                    for (var i = 0; i < roommemory.sources.length; i++) {
                        var source = roommemory.sources[i];
                        source.currentWorkers--;
                    }
                }
                else {
                    const source = Game.getObjectById<Source>(minermemory.source);
                    if (source && creep.harvest(source) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(source);
                    }
                }
                return;
            }
            else {
                for (var i = 0; i < roommemory.sources.length; i++) {
                    const source = roommemory.sources[i];
                    if (source.currentWorkers < source.workersMax) {
                        source.currentWorkers++;
                        minermemory.source = source.name;
                        return;
                    }
                }
            }
        }
    }
}

export = Role.SourceMiner;