/// <reference path="../Util.ts" />
/// <reference path="Base.ts" />

module Roles {
    export class ControllerFeeder extends Base {
        constructor() {
            super();

            this._name = "cfeeder";
            this.bodies = [
                [WORK, CARRY, MOVE]
            ];
        }

        /**
         * Runs role logic for one creep.
         * @param creep
        **/
        public run(creep: Creep): void {
            if (creep.carry.energy > 0) {
                const controller = creep.room.controller;
                if (creep.upgradeController(controller) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(controller);
                }
            }
            else {
                const pickupsite = Util.quickFindAny<any>(creep, FIND_MY_STRUCTURES, "feederspawn", {
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

    register(new ControllerFeeder());
}