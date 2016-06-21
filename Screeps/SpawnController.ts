import util = require("./util");
import BaseSector = require("./BaseSector");
import SectorController = require("./SectorController");

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

interface SpawnControllerMemory {
    buildQueue: { roleName: string, level: number, sectorName: string, roomName: string, requestID: number }[];
    nextRequestID: number;
}

class SpawnController {

    private getMemory(): SpawnControllerMemory {
        return Memory["spawnController"] || (Memory["spawnController"] = {
            buildQueue: [],
            nextRequestID: 1
        });
    }

    /**
     * Requests the specified creep to be spawned.
     * The creep details will be added to the spawn queue.
     * The creep will get spawned when the following requirements are satisfied:
     * - there is a spawner available in the room specified that can spawn the specified role
     * - the sector has enough allocated resources to afford the spawn
     * Returns a unique ID for the request that can be used to cancel it.
     * @param sector
     * @param room
     * @param role
     * @param level
     */
    public requestSpawnCreep(sector: BaseSector, room: Room, role: util.RoleDetails, level: number = 0): number {
        const mem = this.getMemory();
        mem.buildQueue.push({
            sectorName: sector.name,
            roomName: room.name,
            roleName: role.name,
            level: level,
            requestID: mem.nextRequestID
        });
        return mem.nextRequestID++;
    }

    public run() {
        const memory = this.getMemory();

        // Iterate each spawn request
        for (var i = 0; i < memory.buildQueue.length; i++) {
            const request = memory.buildQueue[i];
            const room = Game.rooms[request.roomName];
            if (room) {
                // Check if the sector can afford
                const sector = SectorController.getSector(request.sectorName);
                if (sector.getMemory(room).resources.energy < util.getCreepSpawnCost(util.roles[request.roleName].role, request.level)) continue;

                // Find a spawn for it
                const spawns = room.find<Spawn>(FIND_MY_SPAWNS);
                for (var j = 0; j < spawns.length; j++) {
                    const spawn = spawns[j];
                    if (!spawn.spawning) {
                        const body = util.roles[request.roleName].role.bodies[request.level];
                        var err = spawn.canCreateCreep(body);
                        if (err === OK) {
                            const creepMem: util.CreepMemory = {
                                role: request.roleName,
                                sector: request.sectorName
                            };
                            err = spawn.createCreep(body, undefined, creepMem);
                            if (err !== OK) {
                                util.logError(`Got error code ${err} when spawning creep '${request.roleName}' for sector '${request.sectorName}', even though it passed canCreateCreep check`);
                            }
                            memory.buildQueue.splice(i, 1);
                            i--;
                        } else {
                            util.logError(`Got error code ${err} when checking if it's OK to spawn creep '${request.roleName}' for sector '${request.sectorName}'`);
                        }
                    }
                }
            }
        }
    }
}

const instance = new SpawnController();
export = instance;