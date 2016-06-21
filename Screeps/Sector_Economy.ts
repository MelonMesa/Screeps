import util = require("./util");
import BaseSector = require("./BaseSector");

class EconomySector extends BaseSector {
    constructor() {
        super("economy");
    }

    /**
     * Gets sector memory for a specified room.
     * If it doesn't exist, it will be created.
     * @param room      Room reference or name.
     */
    public getMemory(room: string | Room): EconomySector.EconomySectorMemory {
        return super.getMemory(room);
    }

    /**
     * Called when sector memory has just been initialised for a room.
     * @param room
     * @param mem
     */
    protected onCreated(room: Room, mem: BaseSector.SectorMemory): void {

    }

    /**
     * Runs a logic update tick for the given room.
     * @param room
     */
    public tick(room: Room): void {

    }
}

module EconomySector {
    export interface EconomySectorMemory extends BaseSector.SectorMemory {

    }
}

export = EconomySector;