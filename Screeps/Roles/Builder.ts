/// <reference path="../Util.ts" />
/// <reference path="Base.ts" />

module Roles {
    interface BuilderMemory extends Util.CreepMemory {
        target: string;
    }

    export class Builder extends Base {
        constructor() {
            super();

            this._name = "builder";
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
                        Util.logError(`Builder.run: Got ERR_INVALID_TARGET ${err} when building! Target is ${target}`);
                        memory.target = null;
                        break;
                    case OK:
                        break;
                    default:
                        Util.logError(`Builder.run: Unhandled error code ${err} when building!`);
                        break;
                }
            }
            else {

                const spawndropsite = Util.quickFindAny<Spawn>(creep, FIND_MY_SPAWNS, "transportspawn", {
                    filter: (spawn) => {
                        return spawn.energy > 250;
                    }
                });
                if (spawndropsite && spawndropsite.transferEnergy(creep, spawndropsite.energy - 250) == ERR_NOT_IN_RANGE) {
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

    register(new Builder());
}