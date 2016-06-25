/// <reference path="../Util.ts" />
/// <reference path="Base.ts" />

module Roles {
    interface MinerMemory extends Util.CreepMemory {
        source?: string;
        findSleepTime: number;
    }

    export class SourceMiner extends Base {
        constructor() {
            super();

            this._name = "sourceminer";
            this.bodies = [
                [WORK, CARRY, MOVE]
            ];
        }

        /**
         * Runs role logic for one creep.
         * @param creep
        **/
        public run(creep: Creep): void {
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

    register(new SourceMiner());
}