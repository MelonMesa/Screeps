/// <reference path="../Util.ts" />
/// <reference path="Base.ts" />

module Sectors {

    export interface EconomySectorMemory extends SectorMemory {

    }

    export class EconomySector extends Base {
        /**
         * The economy sector is responsible for mining energy sources and transporting the energy back to storage.
         * It's job is to maintain the maximum number of "miner" creeps that a room can sustain.
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
            return super.getMemory(room);
        }

        /**
         * Called when sector memory has just been initialised for a room.
         * @param room
         * @param mem
         */
        protected onCreated(room: Room, mem: SectorMemory): void {

        }

        /**
         * Runs a logic update tick for the given room.
         * @param room
         */
        public tick(room: Room): void {
            // Get all creeps for this room
            const creeps = this.getCreeps(room);
            const miners = creeps.filter(c => (<Util.CreepMemory>c.memory).role === "miner");
            const haulers = creeps.filter(c => (<Util.CreepMemory>c.memory).role === "hauler");

            // Get all sources
            const roomMem: RoomMemory = room.memory;
            //roomMem.sources[0].
        }
    }

}