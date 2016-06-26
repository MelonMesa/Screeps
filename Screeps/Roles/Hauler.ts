/// <reference path="../Util.ts" />
/// <reference path="Base.ts" />

module Roles {

    /** The type of creep/object the hauler should pick resource up from. */
    export enum HaulerTakeFrom {
        /** The hauler should take energy from a creep. */
        Creep
    }

    /** The type of creep/object the hauler should drop resource off at. */
    export enum HaulerGiveTo {
        /** The hauler should give energy to generic room storage. */
        Storage
    }

    /** How the hauler should behave when picking up resource. */
    export enum HaulerCarryBehaviour {
        /** Wait until the hauler is at capacity before leaving. */
        WaitUntilFull
    }

    /** State that a hauler can be in. */
    enum HaulerState {
        /** Hauler is awaiting work. Default state. */
        Idle,

        /** Hauler is following a path to a resource pickup point. */
        PathingToPickup,

        /** Hauler is at resource pickup point and is collecting resource. */
        Collecting,

        /** Hauler is following a path to a resource drop-off point. */
        PathingToDropoff
    }

    export interface HaulerMemory extends Util.CreepMemory {
        carryType: string; // RESOURCE_*
        takeFrom: HaulerTakeFrom;
        takeFromSector?: string;
        takeFromID?: string;
        giveTo: HaulerGiveTo;
        giveToID?: string;
        carryBehaviour: HaulerCarryBehaviour;

        state?: HaulerState;
    }

    /**
     * How to prioritise energy drop-off structures.
     * Lower values are picked first.
     */
    const dropOffStructOrder: { [structType: string]: number } = {
        [STRUCTURE_SPAWN]: 0,
        [STRUCTURE_EXTENSION]: 1,
        [STRUCTURE_CONTAINER]: 2,
        [STRUCTURE_STORAGE]: 3
    };

    /**
     * A generic resource hauler creep that can be configured via memory options.
    **/
    export class Hauler extends Base {
        constructor() {
            super();

            this._name = "hauler";
            this._bodies = [
                [WORK, CARRY, MOVE]
            ];
        }

        /**
         * Runs role logic for one creep.
         * @param creep
        **/
        public run(creep: Creep): void {

            const mem: HaulerMemory = creep.memory;
            var moveCode: Util.FollowPathStatus;

            // Switch on creep state
            switch (mem.state || HaulerState.Idle) {
                case HaulerState.Idle:

                    const pickupPt = this.findResourcePickup(creep.room, mem);
                    if (pickupPt != null) {
                        mem.path = creep.room.findPath(creep.pos, pickupPt.pos);
                        mem.path.pop(); // don't actually step onto the target tile
                        mem.state = HaulerState.PathingToPickup;
                        mem.pathTarget = { x: pickupPt.pos.x, y: pickupPt.pos.y };
                    }
                    break;

                case HaulerState.PathingToPickup:

                    // See if we're at destination
                    moveCode = Util.followPath(creep, 1);
                    switch (moveCode) {
                        case Util.FollowPathStatus.Ok:
                            break;
                        case Util.FollowPathStatus.Finished:
                            // Start collecting
                            mem.state = HaulerState.Collecting;
                            delete mem.path;
                            delete mem.pathTarget;
                            break;
                        default:
                            mem.state = HaulerState.Idle;
                            delete mem.path;
                            delete mem.pathTarget;
                    }
                    break;

                case HaulerState.Collecting:

                    const carried: number = creep.carry[mem.carryType];

                    // Switch on pickup behaviour
                    switch (mem.carryBehaviour) {
                        case HaulerCarryBehaviour.WaitUntilFull:

                            if (carried < creep.carryCapacity) {
                                // Take
                                this.take(creep, mem);
                            }
                            else {
                                // Drop off
                                const dropoffPt = this.findResourceDropoff(creep.room, mem);
                                if (dropoffPt != null) {
                                    mem.path = creep.room.findPath(creep.pos, dropoffPt.pos);
                                    mem.path.pop(); // don't actually step onto the target tile
                                    mem.state = HaulerState.PathingToDropoff;
                                    mem.pathTarget = { x: dropoffPt.pos.x, y: dropoffPt.pos.y };
                                }
                                break;
                            }
                            break;
                    }
                    break;

                case HaulerState.PathingToDropoff:

                    // See if we're at destination
                    moveCode = Util.followPath(creep, 1);
                    switch (moveCode) {
                        case Util.FollowPathStatus.Ok:
                            break;
                        case Util.FollowPathStatus.Finished:
                            // Drop off resources
                            this.give(creep, mem, mem.pathTarget.x, mem.pathTarget.y);

                            // Do we have more to drop off?
                            const carried: number = creep.carry[mem.carryType];
                            if (carried > 0) {
                                // Drop off again
                                const dropoffPt = this.findResourceDropoff(creep.room, mem);
                                if (dropoffPt != null) {
                                    mem.path = creep.room.findPath(creep.pos, dropoffPt.pos)
                                    mem.pathTarget = { x: dropoffPt.pos.x, y: dropoffPt.pos.y };
                                }
                            }
                            else {
                                // Clean up path
                                delete mem.path;
                                delete mem.pathTarget;

                                // Make us idle
                                mem.state = HaulerState.Idle;
                            }
                        default:
                            mem.state = HaulerState.Idle;
                            delete mem.path;
                            delete mem.pathTarget;
                    }
                    break;
            }
        }

        /**
         * Finds the resource pickup object for the specified hauler.
         * @param creepMem
         */
        private findResourcePickup(room: Room, creepMem: HaulerMemory): RoomObject {
            switch (creepMem.takeFrom) {
                case HaulerTakeFrom.Creep:
                    if (creepMem.takeFromID == null) {
                        return null;
                    }
                    else {
                        return Game.creeps[creepMem.takeFromID];
                    }

                default:
                    return null;
            }
        }

        /**
         * Finds the resource dropoff object for the specified hauler.
         * @param creepMem
         */
        private findResourceDropoff(room: Room, creepMem: HaulerMemory): RoomObject {
            switch (creepMem.giveTo) {
                case HaulerGiveTo.Storage:
                    const possibilities = room.find<Structure>(FIND_MY_STRUCTURES, {
                        filter: (structure) => {
                            return (structure.structureType == STRUCTURE_EXTENSION && structure.energy < structure.energyCapacity) ||
                                ((structure.structureType == STRUCTURE_STORAGE || structure.structuretype == STRUCTURE_CONTAINER) && structure.store.energy < structure.storeCapacity);
                        }
                    });
                    possibilities.sort((a, b) => dropOffStructOrder[a.structureType] - dropOffStructOrder[b.structureType]);
                    return possibilities[0];
            }
        }

        /**
         * Makes the specified hauler attempt to take resources.
         * @param creep
         * @param creepMem
         */
        private take(creep: Creep, creepMem: HaulerMemory): void {
            const limit = creepMem.sector ? Controllers.sector.getSector(creepMem.sector).getMemory(creep.room).resources.energy : 0;

            switch (creepMem.takeFrom) {
                case HaulerTakeFrom.Creep:

                    const targetCreep = Game.creeps[creepMem.takeFromID];
                    if (!targetCreep) {
                        Util.logError(`Hauler.take: Target creep no longer exists (probably died)`);
                        delete creepMem.takeFromID;
                        creepMem.state = HaulerState.Idle;
                        break;
                    }

                    // look for any dropped resource on the ground
                    const droppedRes = creep.room.lookForAt<Energy>("energy", targetCreep.pos)[0];
                    if (droppedRes != null) {
                        const err = creep.pickup(droppedRes);
                        switch (err) {
                            case OK:
                            case ERR_FULL:
                                break;
                            default:
                                Util.logError(`Hauler.take: creep.pickup returned unhandled error code '${err}'`);
                                break;
                        }
                    }

                    var transferAmount = Math.min(targetCreep.carry[creepMem.carryType], creep.carryCapacity - creep.carry[creepMem.carryType]);
                    if (limit > 0 && transferAmount > limit) { transferAmount = limit; }
                    if (transferAmount > 0) {
                        const err = targetCreep.transfer(creep, creepMem.carryType, transferAmount);
                        switch (err) {
                            case OK:
                            case ERR_NOT_ENOUGH_RESOURCES:
                            case ERR_FULL:
                                break;
                            case ERR_NOT_IN_RANGE:
                                // Can happen under normal circumstances
                                creepMem.state = HaulerState.Idle;
                                break;
                            default:
                                Util.logError(`Hauler.take: creep.transfer returned unhandled error code '${err}'`);
                                creepMem.state = HaulerState.Idle;
                                break;
                        }
                    }

                    break;
            }
        }

        /**
         * Makes the specified hauler attempt to give resources.
         * @param creep
         * @param creepMem
         */
        private give(creep: Creep, creepMem: HaulerMemory, targetX: number, targetY: number): void {
            switch (creepMem.giveTo) {
                case HaulerGiveTo.Storage:

                    const targetStruct = creep.room.lookForAt<Structure>("structure", targetX, targetY)[0];
                    if (targetStruct != null) {
                        const err = creep.transfer(targetStruct, creepMem.carryType);
                        switch (err) {
                            case OK:
                            case ERR_NOT_ENOUGH_RESOURCES:
                            case ERR_FULL:
                                break;
                            default:
                                Util.logError(`Hauler.give: creep.transfer returned unhandled error code '${err}'`);
                                creepMem.state = HaulerState.Idle;
                        }
                    }

                    break;
            }
        }
    }

    register(new Hauler());
}