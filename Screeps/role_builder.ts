/// <reference path="screeps.d.ts" />

import util = require("./util");

module Role.Builder {
    /**
     * Details for the "builder" role.
    **/
    export const role: util.RoleDetails =
        {
            name: "builder",
            body: [WORK, CARRY, MOVE]
        };

    /**
     * Spawns a builder creep.
     * @param spawnName
     * @param creepName
    **/
    export function spawn(spawnName: string, creepName?: string): string | number {
        return util.spawnCreep(role, spawnName, creepName);
    }

    interface BuilderMemory extends util.CreepMemory {
        target?: string;
    }

    class Builder {
        /**
         * Runs the builder role
         * @param creep
        **/
        @util.creepTicker(role)
        protected static run(creep: Creep) {
            if (creep.carry.energy > 0) {
                // find closest construction site
                //Game.getObjectById(
                const memory: BuilderMemory = creep.memory;
                if (memory.target == null) {
                    const target = Builder.findTarget(creep.pos);
                    if (target == null) {
                        return;
                    }
                    memory.target = target.id;
                }
                const target = Game.getObjectById<ConstructionSite>(memory.target);
                const err = creep.build(target);
                switch (err) {
                    case ERR_NOT_IN_RANGE:
                        creep.moveTo(target);
                        break;
                    case ERR_INVALID_TARGET:
                        util.logError(`Builder.run: Got ERR_INVALID_TARGET ${err} when building! Target is ${target}`);
                        memory.target = null;
                        break;
                    case OK:
                        break;
                    default:
                        util.logError(`Builder.run: Unhandled error code ${err} when building!`);
                        break;
                }
            }
            else {

                const spawndropsite = util.QuickFindAny<Spawn>(creep, FIND_MY_SPAWNS, "transportspawn");
                if (spawndropsite.transferEnergy(creep) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(spawndropsite);
                }
            }
        }

        /**
         * Finds a construction site closest to the specified position.
         * @param pos
        **/
        private static findTarget(pos: RoomPosition): ConstructionSite {
            return pos.findClosestByPath<ConstructionSite>(FIND_MY_CONSTRUCTION_SITES);
        }
    }
}

export = Role.Builder;