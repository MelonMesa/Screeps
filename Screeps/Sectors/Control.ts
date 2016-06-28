/// <reference path="../Util.ts" />
/// <reference path="Base.ts" />

module Sectors {

    export interface ControlMemory extends SectorMemory {
        /** Request ID for the current spawn, or -1 for no current spawn request */
        curSpawn: number;
    }

    export class Control extends Base {
        /**
         * The control sector is responsible for feeding the room controller with energy.
         * It should maintain a single "feeder" creep that hauls energy to the controller and feeds it.
        **/

        constructor() {
            super("control");
        }

        /**
         * Gets sector memory for a specified room.
         * If it doesn't exist, it will be created.
         * @param room      Room reference or name.
         */
        public getMemory(room: string | Room): ControlMemory {
            return <ControlMemory>super.getMemory(room);
        }

        /**
         * Called when sector memory has just been initialised for a room.
         * @param room
         * @param mem
         */
        protected onCreated(room: Room, mem: ControlMemory): void {
            mem.curSpawn = -1;
        }

        /**
         * Runs a logic update tick for the given room.
         * @param room
         */
        public tick(room: Room): void {
            // Cache creeps
            const creeps = this.getCreeps(room);

            // Run spawn logic
            const mem = this.getMemory(room);
            if (mem.curSpawn >= 0) {
                if (!Controllers.spawn.spawnRequestValid(mem.curSpawn)) {
                    mem.curSpawn = -1;
                }
            } else if (creeps.length === 0) {
                this.log("Spawning feeder");
                const cost = Roles.get("feeder").getCreepSpawnCost();
                this.requestEnergy(room, cost);
                mem.curSpawn = Controllers.spawn.requestSpawnCreep(this, room, Roles.get("feeder"));
            }
        }
    }

}