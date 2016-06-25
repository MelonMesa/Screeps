/// <reference path="../Util.ts" />
/// <reference path="Sector.ts" />

/// <reference path="../Sectors/Base.ts" />
/// <reference path="../Roles/Base.ts" />

module Controllers {

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
        public requestSpawnCreep(sector: Sectors.Base, room: Room, role: Roles.Base, level: number = 0): number {
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
                    const role = Roles.get(request.roleName);

                    // Check if the sector can afford
                    const sector = Controllers.sector.getSector(request.sectorName);
                    if (sector.getMemory(room).resources.energy < role.getCreepSpawnCost(request.level)) continue;

                    // Find a spawn for it
                    const spawns = room.find<Spawn>(FIND_MY_SPAWNS);
                    for (var j = 0; j < spawns.length; j++) {
                        const spawn = spawns[j];
                        if (!spawn.spawning) {
                            const body = role.bodies[request.level];
                            var err = spawn.canCreateCreep(body);
                            if (err === OK) {
                                const creepMem: Util.CreepMemory = {
                                    role: request.roleName,
                                    sector: request.sectorName
                                };
                                err = spawn.createCreep(body, undefined, creepMem);
                                if (err !== OK) {
                                    Util.logError(`Got error code ${err} when spawning creep '${request.roleName}' for sector '${request.sectorName}', even though it passed canCreateCreep check`);
                                }
                                memory.buildQueue.splice(i, 1);
                                i--;
                            } else {
                                Util.logError(`Got error code ${err} when checking if it's OK to spawn creep '${request.roleName}' for sector '${request.sectorName}'`);
                            }
                        }
                    }
                }
            }
        }
    }

    export const spawn = new SpawnController();
}