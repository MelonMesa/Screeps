import util = require("./util");
import BaseSector = require("./sectors/BaseSector.ts");

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

    @util.controllerTicker()
    private run() {
        const memory = this.getMemory();

        // Iterate each spawn request
        for (var i = 0; i < memory.buildQueue.length; i++) {
            const request = memory.buildQueue[i];
            
        }
    }

    private findNextRoleToS
}

const instance = new SpawnController();
export = instance;