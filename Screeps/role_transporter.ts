﻿/// <reference path="screeps.d.ts" />

import util = require("./util");

module Role.Transporter {
    /**
     * Details for the "harvester" role.
    **/
    export const role: util.RoleDetails =
        {
            name: "transporter",
            bodies: [ [CARRY, CARRY, MOVE] ]
        };

    /**
     * Spawns a harvester creep.
     * @param spawnName
     * @param creepName
    **/
    export function spawn(spawnName: string, creepName?: string): string | number {
        return util.spawnCreep(role, spawnName, creepName);
    }

    class Transporter {
        /**
         * Runs the harvester role
         * @param creep
        **/
        @util.creepTicker(role)
        protected static run(creep: Creep) {

            const energyresource = util.QuickFindAny<Resource>(creep, FIND_DROPPED_RESOURCES, "transportsource", {
                filter: { resourceType: RESOURCE_ENERGY }
            });

            if (creep.carry.energy <= 0 && !energyresource) return;

            if (creep.carry.energy < creep.carryCapacity && energyresource) {
                if (creep.pickup(energyresource) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(energyresource);
                }
            }
            else {
                const spawndropsite = util.QuickFindAny<Spawn>(creep, FIND_MY_SPAWNS, "transportspawn");
                if (!spawndropsite) return;

                if (spawndropsite.energy >= spawndropsite.energyCapacity) {
                    // Need lodash.sum for structure.store
                    // ((structure.structureType == STRUCTURE_STORAGE || structure.structuretype == STRUCTURE_CONTAINER) && structure.store < structure.storeCapacity)
                    const dropsite = util.QuickFindAny<Structure>(creep, FIND_MY_STRUCTURES, "transportdropsite", {
                        filter: (structure) => {
                            return (structure.structureType == STRUCTURE_EXTENSION && structure.energy < structure.energyCapacity) ||
                                ((structure.structureType == STRUCTURE_STORAGE || structure.structuretype == STRUCTURE_CONTAINER) && structure.store.energy < structure.storeCapacity);
                        }
                    });

                    if (creep.transfer(dropsite, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(dropsite);
                    }
                }
                else if (creep.transfer(spawndropsite, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(spawndropsite);
                }
            }
        }
    }
}

export = Role.Transporter;