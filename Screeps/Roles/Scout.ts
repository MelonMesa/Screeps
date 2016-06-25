/// <reference path="../Util.ts" />
/// <reference path="Base.ts" />

module Roles {
    interface ScoutMemory extends Util.CreepMemory {
        target: string;
    }

    export class Scout extends Base {
        constructor() {
            super();

            this._name = "scout";
            this.bodies = [
                [MOVE, MOVE, MOVE]
            ];
        }

        /**
         * Runs role logic for one creep.
         * @param creep
        **/
        public run(creep: Creep): void {
            if (creep.memory.target) {
                if (!creep.pos.isEqualTo(creep.memory.target)) {
                    creep.moveTo(new RoomPosition(creep.memory.target.x, creep.memory.target.y, creep.memory.target.roomName));
                } else {
                    //creep.memory[`${creep.memory.target.name}_scouted_creeps_memory`] = creep.room.find<CreepMemory>(FIND_CREEPS);
                }
            }
        }


        /**
         * Finds a construction site closest to the specified position.
         * @param pos
        **/
        private static findTarget(): Flag {
            for (var flagname in Game.flags) {
                if (flagname.match("^scout").length > 0) {
                    return Game.flags[flagname];
                }
            }
            return null;
        }
    }

    register(new Scout());
}