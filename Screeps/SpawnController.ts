import util = require("./util");

module SpawnController {

    interface SpawnRatio {
        roleName: string;
        ratio: number;
    }

    const spawnRatios: SpawnRatio[] =
        [
            { roleName: "miner", ratio: 1 },
            { roleName: "transporter", ratio: 1 },
            { roleName: "miner", ratio: 4 },
            { roleName: "transporter", ratio: 4 },
            { roleName: "controllerfeeder", ratio: 4 },
            { roleName: "builder", ratio: 1 },
        ];

    const ratioSum = spawnRatios.map(s => s.ratio).reduce((a, b) => a + b);
    spawnRatios.forEach(s => s.ratio /= ratioSum);

    interface SpawnControllerMemory extends Memory {
        buildQueue: string;
    }

    class SpawnController {

        @util.controllerTicker()
        private static run() {
            const memory = <SpawnControllerMemory>Memory;
            const spawns = Game.spawns;
            for (var spawnName in spawns) {
                const spawn = spawns[spawnName];
                if (!spawn.spawning) {
                    //console.log(`I want to find work for ${spawnName}`);
                    if (!memory.buildQueue) {
                        memory.buildQueue = findNextRoleToSpawn();
                    }
                    if (memory.buildQueue) {
                        if (!util.roles[memory.buildQueue]) {
                            util.logError(`SpawnController.doSpawnLogic: Invalid role '${memory.buildQueue}'!`);
                            return;
                        }
                        const roleDetails = util.roles[memory.buildQueue].role;
                        if (spawn.canCreateCreep(roleDetails.bodies[0]) === OK) {
                            util.spawnCreep(roleDetails, spawnName);
                            console.log(`Spawning a ${roleDetails.name} at ${spawnName}`);
                            memory.buildQueue = null;
                        }
                    }
                }
            }
        }
    }

    function findNextRoleToSpawn(): string {
        // tally up how many of each role we have
        const roleCall: { [name: string]: number } = {};
        var totalCount = 0;
        for (var creepName in Game.creeps) {
            const creep = Game.creeps[creepName];
            const memory: util.CreepMemory = creep.memory;
            roleCall[memory.role] = (roleCall[memory.role] || 0) + 1;
            totalCount++;
        }

        // normalise
        for (var roleName in roleCall) {
            roleCall[roleName] /= ratioSum;
            //console.log(`${roleName} = ${roleCall[roleName]}`);
        }

        // find ratios less than target, in order
        for (var i = 0; i < spawnRatios.length; i++) {
            const spawnRatio = spawnRatios[i];
            if ((roleCall[spawnRatio.roleName] || 0) <= spawnRatio.ratio) {
                console.log(`SpawnController.findNextRoleToSpawn: ${spawnRatio.roleName}(${i}) ${roleCall[spawnRatio.roleName]}`);
                return spawnRatio.roleName;
            }
        }

        // uhhh
        //console.log(roleCall);
        return null;
    }

}
export = SpawnController;