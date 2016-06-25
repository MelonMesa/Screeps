module Util {
    
    /** Generic creep memory */
    export interface CreepMemory {
        /** Role name. */
        role: string;

        /** Sector name. */
        sector: string;
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
}