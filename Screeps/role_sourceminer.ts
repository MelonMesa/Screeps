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
        findSleepTime: number;
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
                const source = Game.getObjectById<Source>(minermemory.source);
                if (source && creep.harvest(source) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(source);
                }
                return;
            }
            else {

                // if we didn't find a source to mine sleep for 100 ticks
                if (minermemory.findSleepTime > 0) {
                    minermemory.findSleepTime--;
                    return;
                }

                for (var i = 0; i < roommemory.sources.length; i++) {
                    const source = roommemory.sources[i];

                    for (var j = 0; j < source.workersMax; j++) {
                        const worker = source.currentWorkers[j];

                        if (!worker || !Game.getObjectById(worker)) {
                            source.currentWorkers[j] = creep.id;
                            minermemory.source = source.name;

                            return;
                        }
                    }
                }

                minermemory.findSleepTime = 100;
            }
        }

    }
}

export = Role.SourceMiner;