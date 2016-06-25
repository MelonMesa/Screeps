/// <reference path="../Util.ts" />
/// <reference path="Base.ts" />

/// <reference path="../Roles/Hauler.ts" />

module Sectors {

    export interface EconomySectorMemory extends SectorMemory {
        /** Are we currently spawning a creep? */
        spawning: boolean;
    }

    export class EconomySector extends Base {
        /**
         * The economy sector is responsible for mining energy sources and transporting the energy back to storage.
         * It should maintain the maximum number of "miner" creeps that a room can sustain, based on contained energy sources.
         * It should also create and maintain a "hauler" creep that is paired to each "miner" creep.
        **/

        constructor() {
            super("economy");
        }

        /**
         * Gets sector memory for a specified room.
         * If it doesn't exist, it will be created.
         * @param room      Room reference or name.
         */
        public getMemory(room: string | Room): EconomySectorMemory {
            return <EconomySectorMemory>super.getMemory(room);
        }

        /**
         * Called when sector memory has just been initialised for a room.
         * @param room
         * @param mem
         */
        protected onCreated(room: Room, mem: EconomySectorMemory): void {
            mem.spawning = false;
        }

        /**
         * Runs a logic update tick for the given room.
         * @param room
         */
        public tick(room: Room): void {
            // Run spawn logic
            const mem = this.getMemory(room);
            if (!mem.spawning) {
                this.runSpawnLogic(room);
            }
        }

        private runSpawnLogic(room: Room): void {
            // Get all creeps for this room
            const creeps = this.getCreeps(room);
            const miners = creeps.filter(c => (<Util.CreepMemory>c.memory).role === "sourceminer");
            const haulers = creeps.filter(c => (<Util.CreepMemory>c.memory).role === "hauler");

            // If there are less haulers then miners, we should spawn one and assign it to whichever miner doesn't have one assigned
            if (haulers.length < miners.length) {
                // Find the miner which has no hauler assigned
            }

            // Get all sources
            const roomMem: RoomMemory = room.memory;
            const totalMinerCount = roomMem.sources.map(s => s.workersMax).reduce((a, b) => a + b);
        }
    }

}