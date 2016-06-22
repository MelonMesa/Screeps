import util = require("./util");

module Role.Harvester {
    /**
     * Details for the "harvester" role.
    **/
    export const role: util.RoleDetails =
        {
            name: "harvester",
            bodies: [ [WORK, CARRY, MOVE] ]
        };

    /**
     * Spawns a harvester creep.
     * @param spawnName
     * @param creepName
    **/
    export function spawn(spawnName: string, creepName?: string): string | number {
        return util.spawnCreep(role, spawnName, creepName);
    }

    @util.profilePrototype("Role.Harvester")
    class Harvester {
        /**
         * Runs the harvester role
         * @param creep
        **/
        @util.creepTicker(role)
        protected static run(creep: Creep) {
            if (creep.carry.energy < creep.carryCapacity) {
                const source = util.QuickFindAny<Source>(creep, FIND_SOURCES, "minesource");
                if (source && creep.harvest(source) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(source);
                }
            }
            else {
                const spawndropsite = util.QuickFindAny<Spawn>(creep, FIND_MY_SPAWNS, "transportspawn");
                if (spawndropsite && creep.transfer(spawndropsite, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(Game.spawns["Spawn1"]);
                }
            }
        }
    }
}

export = Role.Harvester;