/// <reference path="../Util.ts" />
/// <reference path="Base.ts" />

/// <reference path="../Roles/Hauler.ts" />
/// <reference path="../Roles/Miner.ts" />

module Sectors {

    export interface EconomyMemory extends SectorMemory {
        /** Request ID for the current spawn, or -1 for no current spawn request */
        curSpawn: number;

        someNumber: number;
    }

    export class Economy extends Base {
        /**
         * The economy sector is responsible for mining energy sources and transporting the energy back to storage.
         * It should maintain the maximum number of "miner" creeps that a room can sustain, based on contained energy sources.
         * It should also create and maintain a "hauler" creep that is paired to each "miner" creep.
        **/

        private _creeps: Creep[];

        constructor() {
            super("economy");
        }

        /**
         * Gets sector memory for a specified room.
         * If it doesn't exist, it will be created.
         * @param room      Room reference or name.
         */
        public getMemory(room: string | Room): EconomyMemory {
            return <EconomyMemory>super.getMemory(room);
        }

        /**
         * Called when sector memory has just been initialised for a room.
         * @param room
         * @param mem
         */
        protected onCreated(room: Room, mem: EconomyMemory): void {
            mem.curSpawn = -1;
        }

        /**
         * Runs a logic update tick for the given room.
         * @param room
         */
        public tick(room: Room): void {
            // Cache creeps
            this._creeps = this.getCreeps(room);

            // Run spawn logic
            const mem = this.getMemory(room);
            if (mem.curSpawn >= 0) {
                if (!Controllers.spawn.spawnRequestValid(mem.curSpawn)) {
                    // this.log(`Request ID ${mem.curSpawn} is now invalid`);
                    mem.curSpawn = -1;
                }
            } else {
                mem.curSpawn = this.runSpawnLogic(room);
                // this.log(`Request ID is now ${mem.curSpawn}`);
            }

            // Check assignments
            for (var i = 0; i < this._creeps.length; i++) {
                const creep = this._creeps[i];
                const creepMem: Util.CreepMemory = creep.memory;
                switch (creepMem.role) {
                    case "miner":
                        const minerMem: Roles.MinerMemory = creep.memory;
                        if (minerMem.mineTargetID == null) {
                            // Assign to source
                            minerMem.mineType = RESOURCE_ENERGY;
                            minerMem.mineTargetID = this.allocateSource(creep).id;
                        }
                        break;
                    case "hauler":
                        const haulerMem: Roles.HaulerMemory = creep.memory;
                        if (haulerMem.takeFromID == null) {
                            haulerMem.carryType = RESOURCE_ENERGY;
                            haulerMem.carryBehaviour = Roles.HaulerCarryBehaviour.WaitUntilFull;
                            haulerMem.takeFrom = Roles.HaulerTakeFrom.Creep;
                            const haulerTarget = this._creeps.filter(c => c.memory["role"] === "miner" && !c.spawning && !this._creeps.some(c2 => c2.memory["takeFromID"] === c.name))[0];
                            this.log(`Assigning hauler '${creep.name}' to miner '${haulerTarget && haulerTarget.name}'`);
                            haulerMem.takeFromID = haulerTarget && haulerTarget.name;
                            haulerMem.giveTo = Roles.HaulerGiveTo.Storage;
                        }
                        break;
                }
            }
        }

        private runSpawnLogic(room: Room): number {
            // Get all creeps for this room
            const creeps = this._creeps;
            const miners = creeps.filter(c => (<Util.CreepMemory>c.memory).role === "miner");
            const haulers = creeps.filter(c => (<Util.CreepMemory>c.memory).role === "hauler");

            // If there are less haulers then miners, we should spawn one
            if (haulers.length < miners.length) {
                this.log("Spawning hauler");
                const haulerCost = Roles.get("hauler").getCreepSpawnCost();
                this.requestEnergy(room, haulerCost);
                return Controllers.spawn.requestSpawnCreep(this, room, Roles.get("hauler"));
            }

            // Get all sources
            const roomMem: RoomMemory = room.memory;
            const totalMinerCount = roomMem.sources.map(s => s.workersMax).reduce((a, b) => a + b);

            // If there are less miners than the sources can support, spawn one
            if (miners.length < totalMinerCount) {
                this.log("Spawning miner");
                const minerCost = Roles.get("miner").getCreepSpawnCost();
                this.requestEnergy(room, minerCost);
                return Controllers.spawn.requestSpawnCreep(this, room, Roles.get("miner"));
            }

            return -1;
        }

        private allocateSource(creep: Creep): Source {
            const roomMem: RoomMemory = creep.room.memory;
            for (var i = 0; i < roomMem.sources.length; i++) {
                const src = roomMem.sources[i];
                src.currentWorkers = src.currentWorkers.filter(cname => Game.creeps[cname] != null); // clean up dead workers
                if (src.currentWorkers.length < src.workersMax) {
                    src.currentWorkers.push(creep.name);
                    return Game.getObjectById<Source>(src.name);
                }
            }
        }
    }

}