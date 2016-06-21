import util = require("./util");

module Role.Scout {
    /**
     * Details for the "harvester" role.
    **/
    export const role: util.RoleDetails =
        {
            name: "Scout",
            bodies: [
                [MOVE, MOVE, MOVE],
                [MOVE, MOVE, MOVE, MOVE, MOVE]
            ]
        };

    /**
     * Spawns a harvester creep.
     * @param spawnName
     * @param creepName
    **/
    export function spawn(spawnName: string, creepName?: string): string | number {
        return util.spawnCreep(role, spawnName, creepName);
    }

    export function scout(creepName: string, x: number, y: number, roomName: string) {
        Game.creeps[creepName].memory["target"] = new RoomPosition(x, y, roomName);
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
}

export = Role.Scout;