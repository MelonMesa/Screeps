/// <reference path="../Util.ts" />
/// <reference path="Base.ts" />

module Roles {

    export class Hauler extends Base {
        constructor() {
            super();

            this._name = "hauler";
            this.bodies = [
                [WORK, CARRY, MOVE]
            ];
        }

        /**
         * Runs role logic for one creep.
         * @param creep
        **/
        public run(creep: Creep): void {

            const energyresource = Util.quickFindAny<Resource>(creep, FIND_DROPPED_RESOURCES, "transportsource", {
                filter: { resourceType: RESOURCE_ENERGY }
            });

            if (creep.carry.energy <= 0 && !energyresource) return;

            if (creep.carry.energy < creep.carryCapacity && energyresource) {
                if (creep.pickup(energyresource) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(energyresource);
                }
            }
            else {
                const spawndropsite = Util.quickFindAny<Spawn>(creep, FIND_MY_SPAWNS, "transportspawn");
                if (!spawndropsite) return;

                if (spawndropsite.energy >= spawndropsite.energyCapacity) {
                    // Need lodash.sum for structure.store
                    // ((structure.structureType == STRUCTURE_STORAGE || structure.structuretype == STRUCTURE_CONTAINER) && structure.store < structure.storeCapacity)
                    const dropsite = Util.quickFindAny<Structure>(creep, FIND_MY_STRUCTURES, "transportdropsite", {
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

    register(new Hauler());
}