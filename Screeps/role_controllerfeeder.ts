/// <reference path="screeps.d.ts" />

import util = require("./util");
import RoomActor = require("./RoomActor");

module Role.ControllerFeeder {
    /**
     * Details for the "controllerfeeder" role.
    **/
    export const role: util.RoleDetails =
        {
            name: "controllerfeeder",
            body: [WORK, CARRY, MOVE]
        };

    /**
     * Spawns a controller-feeder creep.
     * @param spawnName
     * @param creepName
    **/
    export function spawn(spawnName: string, creepName?: string): string | number {
        return util.spawnCreep(role, spawnName, creepName);
    }

    class ControllerFeeder extends RoomActor {
        /**
         * Runs the controller-feeder role
         * @param creep
        **/
        @util.creepTicker(role)
        protected static run(creep: Creep) {
            if (creep.carry.energy > 0) {
                const controller = creep.room.controller;
                if (creep.upgradeController(controller) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(controller);
                }
            }
            else {
                
                if (Game.spawns["Spawn1"].transferEnergy(creep) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(Game.spawns["Spawn1"]);
                }
            }
        }
    }
}

export = Role.ControllerFeeder;