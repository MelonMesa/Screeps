/// <reference path="screeps.d.ts" />

import util = require("./util");

module Role.ControllerFeeder {
    /**
     * Details for the "controllerfeeder" role.
    **/
    export const role: util.RoleDetails =
        {
            name: "controllerfeeder",
            bodies: [ [WORK, CARRY, MOVE] ]
        };

    /**
     * Spawns a controller-feeder creep.
     * @param spawnName
     * @param creepName
    **/
    export function spawn(spawnName: string, creepName?: string): string | number {
        return util.spawnCreep(role, spawnName, creepName);
    }

    class ControllerFeeder {
        /**
         * Runs the controller-feeder role
         * @param creep
        **/
        @util.creepTicker(role)
        protected static run(creep: Creep) {
            if (creep.carry.energy > 0) {
                const controller = creep.room.controller;
                if (creep.upgradeController(controller) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(controller);
                }
            }
            else {
                const pickupsite = util.QuickFindAny<any>(creep, FIND_MY_STRUCTURES, "feederspawn", {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION && structure.energy > 0);
                    }
                });

                if (pickupsite)
                {
                    if (pickupsite.structureType == STRUCTURE_EXTENSION) {
                        if (pickupsite.transferEnergy(creep) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(pickupsite);
                        }
                    }
                    else if (pickupsite.structureType == STRUCTURE_CONTAINER || pickupsite.structureType == STRUCTURE_STORAGE) {
                        if (pickupsite.transfer(creep, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(pickupsite);
                        }
                    }
                }
            }
        }
    }
}

export = Role.ControllerFeeder;