/// <reference path="../Util.ts" />
/// <reference path="../Sectors/Base.ts" />

module Controllers {
    /**
     * Responsible for looking after the sector system.
     */
    class SectorController {
        private _sectorMap: {
            [name: string]: {
                sector: Sectors.Base;
                priority: number;
            }
        } = {};

        private _prioritiesNormalised: boolean = false;
        private _prioritySum: number = 0;

        constructor() {

        }

        /**
         * Registers a sector of the given class.
         * @param ctor      Sector type
         * @param priority  Sector priority (weighted integer)
         */
        public registerSector<T extends Sectors.Base>(ctor: { new (): T }, priority: number): T {
            const sector = new ctor();
            this._sectorMap[sector.name] = { priority, sector };
            this._prioritySum += priority;
            return sector;
        }

        /**
         * Gets the instance for the specified sector by name.
         * @param name
         */
        public getSector(name: string): Sectors.Base {
            return this._sectorMap[name].sector;
        }

        /**
         * Runs an update tick for ALL sectors for ALL rooms
         */
        public run() {
            // Normalise sector priorities if needed
            if (!this._prioritiesNormalised) {
                for (var key in this._sectorMap) {
                    this._sectorMap[key].priority /= this._prioritySum;
                }
                this._prioritiesNormalised = true;
            }

            // Iterate each room
            for (var key in Game.rooms) {
                const room = Game.rooms[key];
                if (room.controller.my) {
                    this.tickRoom(room);
                }
            }
        }

        /**
         * Runs an update tick for ALL sectors for ONE room
         * @param room
         */
        private tickRoom(room: Room) {
            // Cache energy available to the room
            const energy = room.energyAvailable;
            const energyCap = room.energyCapacityAvailable;

            // Allocate resources to sectors
            var sumRequested = 0, sumTied = 0;
            const requests: { sector: Sectors.Base, priority: number, amount: number }[] = [];
            for (var key in this._sectorMap) {
                const sector = this._sectorMap[key];
                const mem = sector.sector.getMemory(room);
                sumRequested += mem.requestedResources.energy;
                sumTied += mem.resources.energy;
                requests.push({ sector: sector.sector, priority: sector.priority, amount: mem.requestedResources.energy });
            }
            const energyPool = energy - sumTied;
            const toDistrub = Math.min(energyPool, sumRequested);

            // so given toDistrub resources to hand out, we need to allocate them among all requests
            // e.g imagine we have 2 requests for resources:
            // { sector: "economy", priority: 0.75, amount: 200 }
            // { sector: "logistics", priority: 0.25, amount: 500 }
            // imagine we also only have 400 available resource to hand out (total requested is 700, we are missing 300 to fully satisfy all requests)
            // we should hand all ALL resources, and give 3x as much to economy as logistics
            // so hand out WOULD be 300 to economy and 100 to logistics, but economy only wants 200
            // so we hand out the full 200 to economy, and redistribute the 100 to the rest of the requests
            // to resolve this algorithmicly, we're going to sort by priority, allocating higher ones first and adjusting stats as we go
            if (toDistrub > 0) {
                requests.sort((a, b) => b.priority - a.priority);
                var energyLeft = toDistrub;
                for (var i = 0; i < requests.length; i++) {
                    if (requests[i].priority <= 0) break;
                    const rollingSumPriority = requests.map(r => r.priority).reduce((a, b) => a + b);
                    const request = requests.shift();
                    const alloc = Math.round(Math.min(energyLeft * (request.priority / rollingSumPriority), request.amount));
                    if (alloc <= 0) break;
                    const mem = request.sector.getMemory(room);
                    //console.log(`Allocated ${alloc} energy to ${request.sector.name}, fulfilling ${(alloc === request.amount) ? "the entire request" : `some of the requested ${request.amount}`}`);
                    mem.requestedResources.energy -= alloc;
                    mem.resources.energy += alloc;
                    energyLeft -= alloc;
                }
            }

            // Tick sectors
            for (var key in this._sectorMap) {
                const sector = this._sectorMap[key];
                // console.log(`Tick sector '${key}' in room '${room.name}'`);
                sector.sector.tick(room);
            }
        }
    }

    export const sector = new SectorController();
}