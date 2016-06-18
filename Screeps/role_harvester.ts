/// <reference path="screeps.d.ts" />

module Role.Harvester
{
    /**
     * Runs the harvester role
     * @param creep
     */
    export function run(creep: Creep) {
        if (creep.carry.energy < creep.carryCapacity) {
            const sources = <(Source|Mineral)[]> creep.room.find(FIND_SOURCES);
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

export = Role.Harvester;