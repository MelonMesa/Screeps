module Util {
    
    /** Generic creep memory */
    export interface CreepMemory {
        /** Role name. */
        role: string;

        /** Sector name. */
        sector: string;

        /** Current path. */
        path?: PathStep[];
        /** Current path target. */
        pathTarget?: { x: number, y: number };
        /** Number of ticks path has been blocked for. */
        pathBlock?: number;
    }

    /**
     * Logs the specified error.
     * @param error
    **/
    export function logError(error: string | Error): void {
        console.log(error);
    }

    export function quickFindAny<T>(creep: Creep, type: number, memoryname: string, opts?: { filter: any | string; }): T {
        if (!creep.memory[memoryname]) {
            const obj = creep.room.find<T>(type, opts)[0];
            if (obj == null) return null;
            creep.memory[memoryname] = obj["id"];
            return obj;
        }
        else {

            var obj = Game.getObjectById<T>(creep.memory[memoryname]);
            if (obj == null || (!opts || (typeof opts.filter == "function" && !opts.filter(obj)))) {
                creep.memory[memoryname] = null;
                return quickFindAny<T>(creep, type, memoryname, opts);
            }

            return obj;
        }
    }

    /** Results of followPath */
    export enum FollowPathStatus {
        /** Creep is moving down path OK. */
        Ok,
        /** Creep has no memorised path. */
        NoPath,
        /** Unknown error, perform state reset. */
        Error,
        /** Reached destination. */
        Finished
    }

    /**
     * Instructs the creep to follow it's memorised path.
     * Returns true if destination is reached.
     * @param creep
    **/
    export function followPath(creep: Creep, range: number = 0): FollowPathStatus {
        const mem: CreepMemory = creep.memory;
        if (!mem.path || !mem.pathTarget) {
            return FollowPathStatus.NoPath;
        }
        if (creep.pos.inRangeTo(new RoomPosition(mem.pathTarget.x, mem.pathTarget.y, creep.room.name), range)) {
            return FollowPathStatus.Finished;
        }
        const err = creep.moveByPath(mem.path);
        switch (err) {
            case OK:
            case ERR_TIRED:
                return FollowPathStatus.Ok;
            default:
                logError(`Util.followPath: Unhandled error code ${err}`);
                return FollowPathStatus.Error;
        }
    }
}