/// <reference path="../screeps.d.ts" />

import util = require("../util");
import BaseSector = require("./BaseSector.ts");

/**
 * Responsible for looking after the sector system.
 */
class SectorController {
    private _sectorMap: {
        [name: string]: {
            sector: BaseSector;
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
    public registerSector<T extends BaseSector>(ctor: { new ():T }, priority: number): T {
        const sector = new ctor();
        this._sectorMap[sector.name] = { priority, sector };
        this._prioritySum += priority;
        return sector;
    }

    /**
     * Gets the instance for the specified sector by name.
     * @param name
     */
    public getSector(name: string): BaseSector {
        return this._sectorMap[name].sector;
    }

    /**
     * Runs an update tick for ALL sectors for ALL rooms
     */
    public tick() {
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

        
    }
}

export = new SectorController();