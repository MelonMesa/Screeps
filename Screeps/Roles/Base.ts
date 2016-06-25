/// <reference path="../Util.ts" />

module Roles {
    /**
     * Encapsulates a specific type and behaviour of creep.
    **/
    export abstract class Base {
        protected _name: string;
        protected _bodies: string[][];

        /** Gets the name of this role. */
        public get name() {
            return this._name;
        }

        /** Gets the bodies of this role. */
        public get bodies() {
            return this._bodies;
        }

        /**
         * Runs role logic for one creep.
         * @param creep
        **/
        public abstract run(creep: Creep): void;


        /**
         * Gets the spawn cost of the specified level of creep for this role.
         * @param level
        **/
        public getCreepSpawnCost(level: number = 0): number {
            return this._bodies[level]
                .map(p => BODYPART_COST[p])
                .reduce((a, b) => a + b);
        }
    }

    const roleMap: { [name: string]: Base } = {};

    /**
     * Registers a role type.
     * @param role
    **/
    export function register(role: Base): void {
        roleMap[role.name] = role;
    }

    /**
     * Gets a role type by name.
     * @param name
    **/
    export function get(name: string): Base {
        return roleMap[name];
    }
}