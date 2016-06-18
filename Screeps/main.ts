/// <reference path="screeps.d.ts" />

import roleHarvester = require('./role_harvester');

module Main {
    export function loop() {
        for (var name in Game.creeps) {
            var creep = Game.creeps[name];
            roleHarvester.run(creep);
        }
    }
}

export = Main;