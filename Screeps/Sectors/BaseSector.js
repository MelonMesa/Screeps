/// <reference path="../screeps.d.ts" />
"use strict";
/**
 * Base class for any logical sectors. One global instance per sector type.
 * A sector is responsible for a unit of logic within an empire.
 * All creeps must be associated with a sector.
**/
var BaseSector = (function () {
    /**
     * Initialises a new instance of the BaseSector class.
     * @param name      Name of the sector.
     */
    function BaseSector(name) {
        this._name = name;
        // Get memory
        var sectors = Memory["sectors"] || (Memory["sectors"] = {});
        this._memory = sectors[name] || (sectors[name] = {});
    }
    Object.defineProperty(BaseSector.prototype, "name", {
        /** Gets the name of this sector. */
        get: function () {
            return this._name;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Gets sector memory for a specified room.
     * If it doesn't exist, it will be created.
     * @param room      Room reference or name.
     */
    BaseSector.prototype.getMemory = function (room) {
        var roomID = (typeof room === "string") ? room : room.name;
        var mem;
        if (mem = this._memory[roomID]) {
            return mem;
        }
        return this._memory[roomID] = {
            resources: {
                energy: 0
            },
            requestedResources: {
                energy: 0
            }
        };
    };
    /**
     * Places a request for an amount of energy to be allocated to this sector from the room stockpile.
     * The request will be fulfilled at some point in the future, based on the priority of this sector and the available energy.
     * @param room      The room to request energy from
     * @param amount    The amount of energy to take
     */
    BaseSector.prototype.requestEnergy = function (room, amount) {
        this.getMemory(room).requestedResources.energy += amount;
    };
    /**
     * Releases an amount of energy from the sector to the room stockpile.
     * Can't release more energy than this sector has.
     * @param room      The room to release energy to
     * @param amount    The amount of energy to release
     */
    BaseSector.prototype.releaseEnergy = function (room, amount) {
        this.getMemory(room).resources.energy -= amount;
    };
    /**
     * Gets all creeps belonging to this sector within the specified room.
     * @param room
     */
    BaseSector.prototype.getCreeps = function (room) {
        var arr = [];
        for (var key in Game.creeps) {
            var creep = Game.creeps[key];
            if (creep.memory.sector === this._name && (creep.room === room || creep.room.name === room)) {
                arr.push(creep);
            }
        }
        return arr;
    };
    return BaseSector;
}());
module.exports = BaseSector;
//# sourceMappingURL=BaseSector.js.map