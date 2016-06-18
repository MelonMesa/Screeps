﻿/// <reference path="screeps.d.ts" />

module Util {

    export type CreepTicker = (creep: Creep) => void;

    export interface RoleDetails {
        /** Name of the role. */
        name: string;

        /** Body part composure of this role. */
        body: string[];

        /** Default starting memory for the creep. */
        memory?: CreepMemory;
    }

    /** Generic creep memory */
    export interface CreepMemory {
        /** Role name. */
        role: string;
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
        console.error(error);
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
        const mem: CreepMemory = { role: role.name };
        if (memory) {
            for (var key in memory) {
                mem[key] = memory[key];
            }
        }
        return spawn.createCreep(role.body, creepName, mem);
    }

    export function creepTicker(role: RoleDetails): MethodDecorator {
        return function (target: Object, propertyKey: string, descriptor: PropertyDescriptor) {
            roles[role.name] = {
                role: role,
                ticker: target[propertyKey]
            };
        };
    }
}

export = Util;