/// <reference path="../Util.ts" />
/// <reference path="Base.ts" />
/// <reference path="Hauler.ts" />

module Roles {
    export class Feeder extends Base {
        constructor() {
            super();

            this._name = "feeder";
            this._bodies = [
                [WORK, CARRY, MOVE]
            ];
        }

        /**
         * Runs role logic for one creep.
         * @param creep
        **/
        public run(creep: Creep): void {
            // TODO: Port this to the new pathfinding strategy and fix it up
            // Maybe extend the Hauler logic instead?
            if (creep.carry.energy > 0) {
                const controller = creep.room.controller;
                if (creep.upgradeController(controller) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(controller);
                }
            }
            else {
                const pickupsite = Util.quickFindAny<any>(creep, FIND_MY_STRUCTURES, "feederspawn", {
                    filter: (structure) => {
                        if (structure.structureType == STRUCTURE_CONTAINER && structure.energy > 0) {
                            return true;
                        }
                        if (structure.structureType == STRUCTURE_STORAGE && structure.store[RESOURCE_ENERGY] > 0) {
                            return true;
                        }
                        return false;
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

    register(new Feeder());
}