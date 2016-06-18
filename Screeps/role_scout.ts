/// <reference path="screeps.d.ts" />

import util = require("./util");

module Role.Scout {
    /**
     * Details for the "harvester" role.
    **/
    export const role: util.RoleDetails =
        {
            name: "Scout",
            body: [MOVE, MOVE, MOVE]
        };

    /**
     * Spawns a harvester creep.
     * @param spawnName
     * @param creepName
    **/
    export function spawn(spawnName: string, creepName?: string): string | number {
        return util.spawnCreep(role, spawnName, creepName);
    }

    interface ScoutMemory extends util.CreepMemory {
        target?: string;
    }

    interface CreepMemory  {
        memory: any;
    }

    class Scout {
        /**
         * Runs the harvester role
         * @param creep
        **/
        @util.creepTicker(role)
        protected static run(creep: Creep) {

            const memory: ScoutMemory = creep.memory;
            if (memory.target == null) {
                const target = Scout.findTarget();
                if (target == null) {
                    return;
                }
                memory.target = target.id;
            }

            const target = Game.getObjectById<Flag>(memory.target);
            console.log(target.id);
            if (!creep.pos.isEqualTo(target)) {
                creep.moveTo(target.pos);
            } else {
                creep.memory[`${target.name}_scouted_creeps_memory`] = creep.room.find<CreepMemory>(FIND_CREEPS);
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
}

export = Role.Scout;