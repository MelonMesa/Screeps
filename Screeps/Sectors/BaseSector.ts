/// <reference path="../screeps.d.ts" />

interface SectorMemory {
    /** Amount of resources allocated to this sector. */
    resources: {
        energy: number;
    },

    /** Amount of resources requested by the sector. */
    requestedResources: {
        energy: number;
    }
}

/**
 * Base class for any logical sectors. One global instance per sector type.
 * A sector is responsible for a unit of logic within an empire.
 * All creeps must be associated with a sector.
**/
abstract class BaseSector {

    protected _name: string;
    protected _memory: { [roomID: string]: SectorMemory };

    /** Gets the name of this sector. */
    public get name() {
        return this._name;
    }

    /**
     * Initialises a new instance of the BaseSector class.
     * @param name      Name of the sector.
     */
    constructor(name: string) {
        this._name = name;

        // Get memory
        const sectors = Memory["sectors"] || (Memory["sectors"] = {});
        this._memory = sectors[name] || (sectors[name] = {});
    }

    /**
     * Gets sector memory for a specified room.
     * If it doesn't exist, it will be created.
     * @param room      Room reference or name.
     */
    protected getMemory(room: string | Room): SectorMemory {
        const roomID = (typeof room === "string") ? room : room.name;
        var mem: SectorMemory;
        if (mem = this._memory[roomID]) { return mem; }
        return this._memory[roomID] = {
            resources: {
                energy: 0
            },
            requestedResources: {
                energy: 0
            }
        };
    }

    /**
     * Places a request for an amount of energy to be allocated to this sector from the room stockpile.
     * The request will be fulfilled at some point in the future, based on the priority of this sector and the available energy.
     * @param room      The room to request energy from
     * @param amount    The amount of energy to take
     */
    protected requestEnergy(room: string | Room, amount: number): void {
        this.getMemory(room).requestedResources.energy += amount;
    }

    /**
     * Releases an amount of energy from the sector to the room stockpile.
     * Can't release more energy than this sector has.
     * @param room      The room to release energy to
     * @param amount    The amount of energy to release
     */
    protected releaseEnergy(room: string | Room, amount: number): void {

    }

}

export = BaseSector;