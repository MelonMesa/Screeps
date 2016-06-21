/// <reference path="../screeps.d.ts" />
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
        for (var key in this._sectorMap) {
            sumRequested += this._sectorMap[key].sector.getMemory(room).requestedResources.energy;
        }
        for (var key in this._sectorMap) {
            var sector = this._sectorMap[key];
            var mem = this._sectorMap[key].
            ;
        }
    };
    return SectorController;
}());
module.exports = new SectorController();
//# sourceMappingURL=SectorController.js.map