"use strict";
/**
 * Responsible for looking after the sector system.
 */
var SectorController = (function () {
    function SectorController() {
        this._sectorMap = {};
        this._prioritiesNormalised = false;
        this._prioritySum = 0;
    }
    /**
     * Registers a sector of the given class.
     * @param ctor      Sector type
     * @param priority  Sector priority (weighted integer)
     */
    SectorController.prototype.registerSector = function (ctor, priority) {
        var sector = new ctor();
        this._sectorMap[sector.name] = { priority: priority, sector: sector };
        this._prioritySum += priority;
        return sector;
    };
    /**
     * Gets the instance for the specified sector by name.
     * @param name
     */
    SectorController.prototype.getSector = function (name) {
        return this._sectorMap[name].sector;
    };
    /**
     * Runs an update tick for ALL sectors for ALL rooms
     */
    SectorController.prototype.tick = function () {
        // Normalise sector priorities if needed
        if (!this._prioritiesNormalised) {
            for (var key in this._sectorMap) {
                this._sectorMap[key].priority /= this._prioritySum;
            }
            this._prioritiesNormalised = true;
        }
        // Iterate each room
        for (var key in Game.rooms) {
            var room = Game.rooms[key];
            if (room.controller.my) {
                this.tickRoom(room);
            }
        }
    };
    /**
     * Runs an update tick for ALL sectors for ONE room
     * @param room
     */
    SectorController.prototype.tickRoom = function (room) {
        // Cache energy available to the room
        var energy = room.energyAvailable;
        var energyCap = room.energyCapacityAvailable;
        // Allocate resources to sectors
        var sumRequested = 0, sumTied = 0;
        var requests = [];
        for (var key in this._sectorMap) {
            var sector = this._sectorMap[key];
            var mem = sector.sector.getMemory(room);
            sumRequested += mem.requestedResources.energy;
            sumTied += mem.resources.energy;
            requests.push({ sector: sector.sector, priority: sector.priority, amount: mem.requestedResources.energy });
        }
        var energyPool = energy - sumTied;
        var toDistrub = Math.min(energyPool, sumRequested);
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
            requests.sort(function (a, b) { return a.priority - b.priority; });
            var energyLeft = toDistrub;
            for (var i = 0; i < requests.length; i++) {
                if (requests[i].priority <= 0)
                    break;
                var rollingSumPriority = requests.map(function (r) { return r.priority; }).reduce(function (a, b) { return a + b; });
                var request = requests.shift();
                var alloc = Math.floor(Math.min(energyLeft * (request.priority / rollingSumPriority), request.amount));
                if (alloc <= 0)
                    break;
                var mem = request.sector.getMemory(room);
                console.log("Allocated " + alloc + " energy to " + request.sector.name + ", fulfilling " + ((alloc === request.amount) ? "the entire request" : "some of the requested " + request.amount));
                mem.requestedResources.energy -= alloc;
                mem.resources.energy += alloc;
                energyLeft -= alloc;
            }
        }
        // Tick sectors
        for (var key in this._sectorMap) {
            var sector = this._sectorMap[key];
            sector.sector.tick(room);
        }
    };
    return SectorController;
}());
var instance = new SectorController();
module.exports = instance;
//# sourceMappingURL=SectorController.js.map