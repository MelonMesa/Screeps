var profiler = require('./screeps-profiler');

module Util {

    export type CreepTicker = (creep: Creep) => void;
    export type methodProfile = () => void;;

    export interface RoleDetails {
        /** Name of the role. */
        name: string;

        /** Body part composure of this role. */
        bodies: string[][];

        /** Default starting memory for the creep. */
        memory?: CreepMemory;
    }


    /** Generic creep memory */
    export interface CreepMemory {
        /** Role name. */
        role: string;

        /** Sector name. */
        sector: string;
    }

    /**
     *  All registered roles.
    **/
    export const roles: { [name: string]: { role: RoleDetails, ticker: CreepTicker } } = {};

    /**
     * Logs the specified error.
     * @param error
    **/
    export function logError(error: string | Error): void {
        console.log(error);
    }

    /**
     * Spawns a creep with the specified role.
     * @param role          The role to spawn
     * @param spawnName     The name of the spawn to spawn at
     * @param creepName     The name of the creep to use
    **/
    export function spawnCreep(role: RoleDetails, spawnName: string, creepName?: string, memory?: CreepMemory): string|number {
        const spawn = Game.spawns[spawnName];
        if (spawn == null) { logError("spawnCreep: Invalid spawn name"); return null; }
        const mem: CreepMemory = { role: role.name, sector: null };
        if (memory) {
            for (var key in memory) {
                mem[key] = memory[key];
            }
        }
        return spawn.createCreep(role.bodies[0], creepName, mem);
    }

    /**
     * Gets the spawn cost of the specified role/level.
     * @param role
     * @param level
     */
    export function getCreepSpawnCost(role: RoleDetails, level: number = 0): number {
        return role.bodies[level]
            .map(p => BODYPART_COST[p])
            .reduce((a, b) => a + b);
    }


    export function creepTicker(role: RoleDetails): MethodDecorator {
        return function (target: Object, propertyKey: string, descriptor: PropertyDescriptor) {
            roles[role.name] = {
                role: role,
                ticker: target[propertyKey]
            };
        };
    }

    export function profilePrototype(name: string): ClassDecorator {
        return function (target: Function) {
            profiler.registerPrototype(name, target.prototype);
        };
    }

    export function QuickFindAny<T>(creep: Creep, type: number, memoryname: string, opts?: { filter: any | string; }): T {
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
                return QuickFindAny<T>(creep, type, memoryname, opts);
            }

            return obj;
        }
    }
}

export = Util;