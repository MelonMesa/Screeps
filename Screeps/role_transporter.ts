﻿/// <reference path="screeps.d.ts" />

import util = require("./util");
import RoomActor = require("./RoomActor");

module Role.Transporter {
    /**
     * Details for the "harvester" role.
    **/
    export const role: util.RoleDetails =
        {
            name: "transporter",
            body: [CARRY, MOVE]
        };

    /**
     * Spawns a harvester creep.
     * @param spawnName
     * @param creepName
    **/
    export function spawn(spawnName: string, creepName?: string): string | number {
        return util.spawnCreep(role, spawnName, creepName);
    }

    class Transporter extends RoomActor {
        /**
         * Runs the harvester role
         * @param creep
        **/
        @util.creepTicker(role)
        protected static run(creep: Creep) {

            const energyresource = RoomActor.QuickFindAny<Resource>(creep, FIND_DROPPED_RESOURCES, "transportsource", {
                filter: { resourceType: RESOURCE_ENERGY }
            });

            if (creep.carry.energy < creep.carryCapacity && energyresource) {
                if (creep.pickup(energyresource) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(energyresource);
                }
            }
            else {
                const spawndropsite = RoomActor.QuickFindAny<Spawn>(creep, FIND_MY_SPAWNS, "transportspawn");
                if (creep.transfer(spawndropsite, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(Game.spawns["Spawn1"]);
                }
            }
        }
    }
}

export = Role.Transporter;