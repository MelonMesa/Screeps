/// <reference path="../Util.ts" />

module Sectors {

    export interface SectorMemory {
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
    export abstract class Base {

        protected _name: string;

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
        }

        /**
         * Gets sector memory for a specified room.
         * If it doesn't exist, it will be created.
         * @param room      Room reference or name.
         */
        public getMemory(room: string | Room): SectorMemory {
            const roomID = (typeof room === "string") ? room : room.name;
            const root = Memory["sectors"] || (Memory["sectors"] = {});
            const sectorRoot = root[this._name] || (root[this._name] = {});
            var mem = sectorRoot[roomID];
            if (mem) { return mem; }
            this.onCreated(typeof room === "string" ? Game.rooms[room] : room, mem = sectorRoot[roomID] = {
                resources: {
                    energy: 0
                },
                requestedResources: {
                    energy: 0
                }
            });
            return mem;
        }

        /**
         * Called when sector memory has just been initialised for a room.
         * @param room
         * @param mem
         */
        protected onCreated(room: Room, mem: SectorMemory): void {

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
            this.getMemory(room).resources.energy -= amount;
        }

        /**
         * Gets all creeps belonging to this sector within the specified room.
         * @param room
         */
        protected getCreeps(room: string | Room): Creep[] {
            const arr: Creep[] = [];
            for (var key in Game.creeps) {
                const creep = Game.creeps[key];
                if ((<Util.CreepMemory>creep.memory).sector === this._name && (creep.room === room || creep.room.name === room) && creep.my) {
                    arr.push(creep);
                }
            }
            return arr;
        }

        /**
         * Logs a debug message.
         * @param message
         */
        protected log(message: string): void {
            console.log(`${this._name}: ${message}`);
        }

        /**
         * Runs a logic update tick for the given room.
         * @param room
         */
        public abstract tick(room: Room): void;

    }

}