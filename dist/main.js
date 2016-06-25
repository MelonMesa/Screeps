var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Util;
(function (Util) {
    /**
     * Logs the specified error.
     * @param error
    **/
    function logError(error) {
        console.log(error);
    }
    Util.logError = logError;
    function quickFindAny(creep, type, memoryname, opts) {
        if (!creep.memory[memoryname]) {
            var obj_1 = creep.room.find(type, opts)[0];
            if (obj_1 == null)
                return null;
            creep.memory[memoryname] = obj_1["id"];
            return obj_1;
        }
        else {
            var obj = Game.getObjectById(creep.memory[memoryname]);
            if (obj == null || (!opts || (typeof opts.filter == "function" && !opts.filter(obj)))) {
                creep.memory[memoryname] = null;
                return quickFindAny(creep, type, memoryname, opts);
            }
            return obj;
        }
    }
    Util.quickFindAny = quickFindAny;
})(Util || (Util = {}));
/// <reference path="../Util.ts" />
var Roles;
(function (Roles) {
    /**
     * Encapsulates a specific type and behaviour of creep.
    **/
    var Base = (function () {
        function Base() {
        }
        Object.defineProperty(Base.prototype, "name", {
            /** Gets the name of this role. */
            get: function () {
                return this._name;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Base.prototype, "bodies", {
            /** Gets the bodies of this role. */
            get: function () {
                return this._bodies;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Gets the spawn cost of the specified level of creep for this role.
         * @param level
        **/
        Base.prototype.getCreepSpawnCost = function (level) {
            if (level === void 0) { level = 0; }
            return this._bodies[level]
                .map(function (p) { return BODYPART_COST[p]; })
                .reduce(function (a, b) { return a + b; });
        };
        return Base;
    }());
    Roles.Base = Base;
    var roleMap = {};
    /**
     * Registers a role type.
     * @param role
    **/
    function register(role) {
        roleMap[role.name] = role;
    }
    Roles.register = register;
    /**
     * Gets a role type by name.
     * @param name
    **/
    function get(name) {
        return roleMap[name];
    }
    Roles.get = get;
})(Roles || (Roles = {}));
/// <reference path="../Util.ts" />
var Controllers;
(function (Controllers) {
    var RoomController = (function () {
        function RoomController() {
        }
        RoomController.prototype.run = function () {
            for (var roomname in Game.rooms) {
                var room_1 = Game.rooms[roomname];
                var memory = room_1.memory;
                if (memory.sources == null || memory.noSources) {
                    memory.sources = this.findSources(room_1);
                    memory.noSources = memory.sources == null || memory.sources.length === 0;
                }
            }
        };
        RoomController.prototype.findSources = function (room) {
            var memories = [];
            var sources = room.find(FIND_SOURCES);
            if (!sources)
                return null;
            ;
            for (var i = 0; i < sources.length; i++) {
                var source = sources[i];
                var workSpotCount = 0;
                for (var x = -1; x <= 1; x++) {
                    for (var y = -1; y <= 1; y++) {
                        var newpos = new RoomPosition(source.pos.x + x, source.pos.y + y, source.room.name);
                        if (newpos.lookFor("terrain") != "wall")
                            workSpotCount++;
                    }
                }
                memories.push({ name: source.id, workersMax: workSpotCount, currentWorkers: [] });
            }
            return memories;
        };
        return RoomController;
    }());
    Controllers.room = new RoomController();
})(Controllers || (Controllers = {}));
/// <reference path="../Util.ts" />
var Sectors;
(function (Sectors) {
    /**
     * Base class for any logical sectors. One global instance per sector type.
     * A sector is responsible for a unit of logic within an empire.
     * All creeps must be associated with a sector.
    **/
    var Base = (function () {
        /**
         * Initialises a new instance of the BaseSector class.
         * @param name      Name of the sector.
         */
        function Base(name) {
            this._name = name;
            // Get memory
            var sectors = Memory["sectors"] || (Memory["sectors"] = {});
            this._memory = sectors[name] || (sectors[name] = {});
        }
        Object.defineProperty(Base.prototype, "name", {
            /** Gets the name of this sector. */
            get: function () {
                return this._name;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Gets sector memory for a specified room.
         * If it doesn't exist, it will be created.
         * @param room      Room reference or name.
         */
        Base.prototype.getMemory = function (room) {
            var roomID = (typeof room === "string") ? room : room.name;
            var mem;
            if (mem = this._memory[roomID]) {
                return mem;
            }
            this.onCreated(typeof room === "string" ? Game.rooms[room] : room, mem = this._memory[roomID] = {
                resources: {
                    energy: 0
                },
                requestedResources: {
                    energy: 0
                }
            });
            return mem;
        };
        /**
         * Called when sector memory has just been initialised for a room.
         * @param room
         * @param mem
         */
        Base.prototype.onCreated = function (room, mem) {
        };
        /**
         * Places a request for an amount of energy to be allocated to this sector from the room stockpile.
         * The request will be fulfilled at some point in the future, based on the priority of this sector and the available energy.
         * @param room      The room to request energy from
         * @param amount    The amount of energy to take
         */
        Base.prototype.requestEnergy = function (room, amount) {
            this.getMemory(room).requestedResources.energy += amount;
        };
        /**
         * Releases an amount of energy from the sector to the room stockpile.
         * Can't release more energy than this sector has.
         * @param room      The room to release energy to
         * @param amount    The amount of energy to release
         */
        Base.prototype.releaseEnergy = function (room, amount) {
            this.getMemory(room).resources.energy -= amount;
        };
        /**
         * Gets all creeps belonging to this sector within the specified room.
         * @param room
         */
        Base.prototype.getCreeps = function (room) {
            var arr = [];
            for (var key in Game.creeps) {
                var creep = Game.creeps[key];
                if (creep.memory.sector === this._name && (creep.room === room || creep.room.name === room)) {
                    arr.push(creep);
                }
            }
            return arr;
        };
        return Base;
    }());
    Sectors.Base = Base;
})(Sectors || (Sectors = {}));
/// <reference path="../Util.ts" />
/// <reference path="../Sectors/Base.ts" />
var Controllers;
(function (Controllers) {
    /**
     * Responsible for looking after the sector system.
     */
    var SectorController = (function () {
        function SectorController() {
            this._sectorMap = {};
            this._prioritiesNormalised = false;
            this._prioritySum = 0;
        }
        /**
         * Registers a sector of the given class.
         * @param ctor      Sector type
         * @param priority  Sector priority (weighted integer)
         */
        SectorController.prototype.registerSector = function (ctor, priority) {
            var sector = new ctor();
            this._sectorMap[sector.name] = { priority: priority, sector: sector };
            this._prioritySum += priority;
            return sector;
        };
        /**
         * Gets the instance for the specified sector by name.
         * @param name
         */
        SectorController.prototype.getSector = function (name) {
            return this._sectorMap[name].sector;
        };
        /**
         * Runs an update tick for ALL sectors for ALL rooms
         */
        SectorController.prototype.run = function () {
            // Normalise sector priorities if needed
            if (!this._prioritiesNormalised) {
                for (var key in this._sectorMap) {
                    this._sectorMap[key].priority /= this._prioritySum;
                }
                this._prioritiesNormalised = true;
            }
            // Iterate each room
            for (var key in Game.rooms) {
                var room_2 = Game.rooms[key];
                if (room_2.controller.my) {
                    this.tickRoom(room_2);
                }
            }
        };
        /**
         * Runs an update tick for ALL sectors for ONE room
         * @param room
         */
        SectorController.prototype.tickRoom = function (room) {
            // Cache energy available to the room
            var energy = room.energyAvailable;
            var energyCap = room.energyCapacityAvailable;
            // Allocate resources to sectors
            var sumRequested = 0, sumTied = 0;
            var requests = [];
            for (var key in this._sectorMap) {
                var sector_1 = this._sectorMap[key];
                var mem = sector_1.sector.getMemory(room);
                sumRequested += mem.requestedResources.energy;
                sumTied += mem.resources.energy;
                requests.push({ sector: sector_1.sector, priority: sector_1.priority, amount: mem.requestedResources.energy });
            }
            var energyPool = energy - sumTied;
            var toDistrub = Math.min(energyPool, sumRequested);
            // so given toDistrub resources to hand out, we need to allocate them among all requests
            // e.g imagine we have 2 requests for resources:
            // { sector: "economy", priority: 0.75, amount: 200 }
            // { sector: "logistics", priority: 0.25, amount: 500 }
            // imagine we also only have 400 available resource to hand out (total requested is 700, we are missing 300 to fully satisfy all requests)
            // we should hand all ALL resources, and give 3x as much to economy as logistics
            // so hand out WOULD be 300 to economy and 100 to logistics, but economy only wants 200
            // so we hand out the full 200 to economy, and redistribute the 100 to the rest of the requests
            // to resolve this algorithmicly, we're going to sort by priority, allocating higher ones first and adjusting stats as we go
            if (toDistrub > 0) {
                requests.sort(function (a, b) { return a.priority - b.priority; });
                var energyLeft = toDistrub;
                for (var i = 0; i < requests.length; i++) {
                    if (requests[i].priority <= 0)
                        break;
                    var rollingSumPriority = requests.map(function (r) { return r.priority; }).reduce(function (a, b) { return a + b; });
                    var request = requests.shift();
                    var alloc = Math.floor(Math.min(energyLeft * (request.priority / rollingSumPriority), request.amount));
                    if (alloc <= 0)
                        break;
                    var mem = request.sector.getMemory(room);
                    console.log("Allocated " + alloc + " energy to " + request.sector.name + ", fulfilling " + ((alloc === request.amount) ? "the entire request" : "some of the requested " + request.amount));
                    mem.requestedResources.energy -= alloc;
                    mem.resources.energy += alloc;
                    energyLeft -= alloc;
                }
            }
            // Tick sectors
            for (var key in this._sectorMap) {
                var sector_2 = this._sectorMap[key];
                sector_2.sector.tick(room);
            }
        };
        return SectorController;
    }());
    Controllers.sector = new SectorController();
})(Controllers || (Controllers = {}));
/// <reference path="../Util.ts" />
/// <reference path="Sector.ts" />
/// <reference path="../Sectors/Base.ts" />
/// <reference path="../Roles/Base.ts" />
var Controllers;
(function (Controllers) {
    var SpawnController = (function () {
        function SpawnController() {
        }
        SpawnController.prototype.getMemory = function () {
            return Memory["spawnController"] || (Memory["spawnController"] = {
                buildQueue: [],
                nextRequestID: 1
            });
        };
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
        SpawnController.prototype.requestSpawnCreep = function (sector, room, role, level) {
            if (level === void 0) { level = 0; }
            var mem = this.getMemory();
            mem.buildQueue.push({
                sectorName: sector.name,
                roomName: room.name,
                roleName: role.name,
                level: level,
                requestID: mem.nextRequestID
            });
            return mem.nextRequestID++;
        };
        SpawnController.prototype.run = function () {
            var memory = this.getMemory();
            // Iterate each spawn request
            for (var i = 0; i < memory.buildQueue.length; i++) {
                var request = memory.buildQueue[i];
                var room_3 = Game.rooms[request.roomName];
                if (room_3) {
                    var role = Roles.get(request.roleName);
                    // Check if the sector can afford
                    var sector_3 = Controllers.sector.getSector(request.sectorName);
                    if (sector_3.getMemory(room_3).resources.energy < role.getCreepSpawnCost(request.level))
                        continue;
                    // Find a spawn for it
                    var spawns = room_3.find(FIND_MY_SPAWNS);
                    for (var j = 0; j < spawns.length; j++) {
                        var spawn_1 = spawns[j];
                        if (!spawn_1.spawning) {
                            var body = role.bodies[request.level];
                            var err = spawn_1.canCreateCreep(body);
                            if (err === OK) {
                                var creepMem = {
                                    role: request.roleName,
                                    sector: request.sectorName
                                };
                                err = spawn_1.createCreep(body, undefined, creepMem);
                                if (err !== OK) {
                                    Util.logError("Got error code " + err + " when spawning creep '" + request.roleName + "' for sector '" + request.sectorName + "', even though it passed canCreateCreep check");
                                }
                                memory.buildQueue.splice(i, 1);
                                i--;
                            }
                            else {
                                Util.logError("Got error code " + err + " when checking if it's OK to spawn creep '" + request.roleName + "' for sector '" + request.sectorName + "'");
                            }
                        }
                    }
                }
            }
        };
        return SpawnController;
    }());
    Controllers.spawn = new SpawnController();
})(Controllers || (Controllers = {}));
/// <reference path="../Util.ts" />
/// <reference path="Base.ts" />
var Sectors;
(function (Sectors) {
    var EconomySector = (function (_super) {
        __extends(EconomySector, _super);
        /**
         * The economy sector is responsible for mining energy sources and transporting the energy back to storage.
         * It's job is to maintain the maximum number of "miner" creeps that a room can sustain.
         * It should also create and maintain a "hauler" creep that is paired to each "miner" creep.
        **/
        function EconomySector() {
            _super.call(this, "economy");
        }
        /**
         * Gets sector memory for a specified room.
         * If it doesn't exist, it will be created.
         * @param room      Room reference or name.
         */
        EconomySector.prototype.getMemory = function (room) {
            return _super.prototype.getMemory.call(this, room);
        };
        /**
         * Called when sector memory has just been initialised for a room.
         * @param room
         * @param mem
         */
        EconomySector.prototype.onCreated = function (room, mem) {
        };
        /**
         * Runs a logic update tick for the given room.
         * @param room
         */
        EconomySector.prototype.tick = function (room) {
            // Get all creeps for this room
            var creeps = this.getCreeps(room);
            var miners = creeps.filter(function (c) { return c.memory.role === "miner"; });
            var haulers = creeps.filter(function (c) { return c.memory.role === "hauler"; });
            // Get all sources
            var roomMem = room.memory;
            //roomMem.sources[0].
        };
        return EconomySector;
    }(Sectors.Base));
    Sectors.EconomySector = EconomySector;
})(Sectors || (Sectors = {}));
/// <reference path="Util.ts" />
/// <reference path="Roles/Base.ts" />
/// <reference path="Controllers/Room.ts" />
/// <reference path="Controllers/Sector.ts" />
/// <reference path="Controllers/Spawn.ts" />
/// <reference path="Sectors/Economy.ts" />
var profiler = require('./screeps-profiler');
var debugmode = false;
if (debugmode)
    profiler.enable();
var Main;
(function (Main) {
    /**
     * Main game loop.
    **/
    function loop() {
        if (debugmode)
            profiler.wrap(Logic);
        else
            Logic();
    }
    Main.loop = loop;
    function Logic() {
        // Run controllers
        Controllers.room.run();
        Controllers.spawn.run();
        Controllers.sector.run();
        // Run creeps
        for (var name in Game.creeps) {
            // Get creep
            var creep = Game.creeps[name];
            if (!creep.spawning) {
                // Get memory and role
                var mem = creep.memory;
                var role = Roles.get(mem.role);
                // Tick
                if (role) {
                    role.run(creep);
                }
                else {
                    console.log(creep.name + " Unknown role " + mem.role);
                }
            }
        }
    }
})(Main || (Main = {}));
module.exports = Main;
/// <reference path="../Util.ts" />
/// <reference path="Base.ts" />
var Roles;
(function (Roles) {
    var Builder = (function (_super) {
        __extends(Builder, _super);
        function Builder() {
            _super.call(this);
            this._name = "builder";
            this.bodies = [
                [WORK, CARRY, MOVE]
            ];
        }
        /**
         * Runs role logic for one creep.
         * @param creep
        **/
        Builder.prototype.run = function (creep) {
            if (creep.carry.energy > 0) {
                // find closest construction site
                //Game.getObjectById(
                var memory = creep.memory;
                if (memory.target == null) {
                    var target_1 = Builder.findTarget(creep.pos);
                    if (target_1 == null) {
                        return;
                    }
                    memory.target = target_1.id;
                }
                var target = Game.getObjectById(memory.target);
                var err = creep.build(target);
                switch (err) {
                    case ERR_NOT_IN_RANGE:
                        creep.moveTo(target);
                        break;
                    case ERR_INVALID_TARGET:
                        Util.logError("Builder.run: Got ERR_INVALID_TARGET " + err + " when building! Target is " + target);
                        memory.target = null;
                        break;
                    case OK:
                        break;
                    default:
                        Util.logError("Builder.run: Unhandled error code " + err + " when building!");
                        break;
                }
            }
            else {
                var spawndropsite = Util.quickFindAny(creep, FIND_MY_SPAWNS, "transportspawn", {
                    filter: function (spawn) {
                        return spawn.energy > 250;
                    }
                });
                if (spawndropsite && spawndropsite.transferEnergy(creep, spawndropsite.energy - 250) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(spawndropsite);
                }
            }
        };
        /**
         * Finds a construction site closest to the specified position.
         * @param pos
        **/
        Builder.findTarget = function (pos) {
            return pos.findClosestByPath(FIND_MY_CONSTRUCTION_SITES);
        };
        return Builder;
    }(Roles.Base));
    Roles.Builder = Builder;
    Roles.register(new Builder());
})(Roles || (Roles = {}));
/// <reference path="../Util.ts" />
/// <reference path="Base.ts" />
var Roles;
(function (Roles) {
    var ControllerFeeder = (function (_super) {
        __extends(ControllerFeeder, _super);
        function ControllerFeeder() {
            _super.call(this);
            this._name = "cfeeder";
            this.bodies = [
                [WORK, CARRY, MOVE]
            ];
        }
        /**
         * Runs role logic for one creep.
         * @param creep
        **/
        ControllerFeeder.prototype.run = function (creep) {
            if (creep.carry.energy > 0) {
                var controller = creep.room.controller;
                if (creep.upgradeController(controller) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(controller);
                }
            }
            else {
                var pickupsite = Util.quickFindAny(creep, FIND_MY_STRUCTURES, "feederspawn", {
                    filter: function (structure) {
                        return (structure.structureType == STRUCTURE_EXTENSION && structure.energy > 0);
                    }
                });
                if (pickupsite) {
                    if (pickupsite.structureType == STRUCTURE_EXTENSION) {
                        if (pickupsite.transferEnergy(creep) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(pickupsite);
                        }
                    }
                    else if (pickupsite.structureType == STRUCTURE_CONTAINER || pickupsite.structureType == STRUCTURE_STORAGE) {
                        if (pickupsite.transfer(creep, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(pickupsite);
                        }
                    }
                }
            }
        };
        return ControllerFeeder;
    }(Roles.Base));
    Roles.ControllerFeeder = ControllerFeeder;
    Roles.register(new ControllerFeeder());
})(Roles || (Roles = {}));
/// <reference path="../Util.ts" />
/// <reference path="Base.ts" />
var Roles;
(function (Roles) {
    var Hauler = (function (_super) {
        __extends(Hauler, _super);
        function Hauler() {
            _super.call(this);
            this._name = "hauler";
            this.bodies = [
                [WORK, CARRY, MOVE]
            ];
        }
        /**
         * Runs role logic for one creep.
         * @param creep
        **/
        Hauler.prototype.run = function (creep) {
            var energyresource = Util.quickFindAny(creep, FIND_DROPPED_RESOURCES, "transportsource", {
                filter: { resourceType: RESOURCE_ENERGY }
            });
            if (creep.carry.energy <= 0 && !energyresource)
                return;
            if (creep.carry.energy < creep.carryCapacity && energyresource) {
                if (creep.pickup(energyresource) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(energyresource);
                }
            }
            else {
                var spawndropsite = Util.quickFindAny(creep, FIND_MY_SPAWNS, "transportspawn");
                if (!spawndropsite)
                    return;
                if (spawndropsite.energy >= spawndropsite.energyCapacity) {
                    // Need lodash.sum for structure.store
                    // ((structure.structureType == STRUCTURE_STORAGE || structure.structuretype == STRUCTURE_CONTAINER) && structure.store < structure.storeCapacity)
                    var dropsite = Util.quickFindAny(creep, FIND_MY_STRUCTURES, "transportdropsite", {
                        filter: function (structure) {
                            return (structure.structureType == STRUCTURE_EXTENSION && structure.energy < structure.energyCapacity) ||
                                ((structure.structureType == STRUCTURE_STORAGE || structure.structuretype == STRUCTURE_CONTAINER) && structure.store.energy < structure.storeCapacity);
                        }
                    });
                    if (creep.transfer(dropsite, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(dropsite);
                    }
                }
                else if (creep.transfer(spawndropsite, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(spawndropsite);
                }
            }
        };
        return Hauler;
    }(Roles.Base));
    Roles.Hauler = Hauler;
    Roles.register(new Hauler());
})(Roles || (Roles = {}));
/// <reference path="../Util.ts" />
/// <reference path="Base.ts" />
var Roles;
(function (Roles) {
    var Scout = (function (_super) {
        __extends(Scout, _super);
        function Scout() {
            _super.call(this);
            this._name = "scout";
            this.bodies = [
                [MOVE, MOVE, MOVE]
            ];
        }
        /**
         * Runs role logic for one creep.
         * @param creep
        **/
        Scout.prototype.run = function (creep) {
            if (creep.memory.target) {
                if (!creep.pos.isEqualTo(creep.memory.target)) {
                    creep.moveTo(new RoomPosition(creep.memory.target.x, creep.memory.target.y, creep.memory.target.roomName));
                }
                else {
                }
            }
        };
        /**
         * Finds a construction site closest to the specified position.
         * @param pos
        **/
        Scout.findTarget = function () {
            for (var flagname in Game.flags) {
                if (flagname.match("^scout").length > 0) {
                    return Game.flags[flagname];
                }
            }
            return null;
        };
        return Scout;
    }(Roles.Base));
    Roles.Scout = Scout;
    Roles.register(new Scout());
})(Roles || (Roles = {}));
/// <reference path="../Util.ts" />
/// <reference path="Base.ts" />
var Roles;
(function (Roles) {
    var SourceMiner = (function (_super) {
        __extends(SourceMiner, _super);
        function SourceMiner() {
            _super.call(this);
            this._name = "sourceminer";
            this.bodies = [
                [WORK, CARRY, MOVE]
            ];
        }
        /**
         * Runs role logic for one creep.
         * @param creep
        **/
        SourceMiner.prototype.run = function (creep) {
            var roommemory = creep.room.memory;
            var minermemory = creep.memory;
            if (roommemory.noSources || !roommemory.sources)
                return;
            if (minermemory.source) {
                var source = Game.getObjectById(minermemory.source);
                if (source && creep.harvest(source) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(source);
                }
                return;
            }
            else {
                // if we didn't find a source to mine sleep for 100 ticks
                if (minermemory.findSleepTime > 0) {
                    minermemory.findSleepTime--;
                    return;
                }
                for (var i = 0; i < roommemory.sources.length; i++) {
                    var source = roommemory.sources[i];
                    for (var j = 0; j < source.workersMax; j++) {
                        var worker = source.currentWorkers[j];
                        if (!worker || !Game.getObjectById(worker)) {
                            source.currentWorkers[j] = creep.id;
                            minermemory.source = source.name;
                            return;
                        }
                    }
                }
                minermemory.findSleepTime = 100;
            }
        };
        return SourceMiner;
    }(Roles.Base));
    Roles.SourceMiner = SourceMiner;
    Roles.register(new SourceMiner());
})(Roles || (Roles = {}));
