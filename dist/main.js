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
    /** Results of followPath */
    (function (FollowPathStatus) {
        /** Creep is moving down path OK. */
        FollowPathStatus[FollowPathStatus["Ok"] = 0] = "Ok";
        /** Creep has no memorised path. */
        FollowPathStatus[FollowPathStatus["NoPath"] = 1] = "NoPath";
        /** Unknown error, perform state reset. */
        FollowPathStatus[FollowPathStatus["Error"] = 2] = "Error";
        /** Reached destination. */
        FollowPathStatus[FollowPathStatus["Finished"] = 3] = "Finished";
    })(Util.FollowPathStatus || (Util.FollowPathStatus = {}));
    var FollowPathStatus = Util.FollowPathStatus;
    /**
     * Instructs the creep to follow it's memorised path.
     * Returns true if destination is reached.
     * @param creep
    **/
    function followPath(creep, range) {
        if (range === void 0) { range = 0; }
        var mem = creep.memory;
        if (!mem.path || !mem.pathTarget) {
            return FollowPathStatus.NoPath;
        }
        if (creep.pos.inRangeTo(new RoomPosition(mem.pathTarget.x, mem.pathTarget.y, creep.room.name), range)) {
            return FollowPathStatus.Finished;
        }
        var err = creep.moveByPath(mem.path);
        switch (err) {
            case OK:
            case ERR_TIRED:
                return FollowPathStatus.Ok;
            default:
                logError("Util.followPath: Unhandled error code " + err);
                return FollowPathStatus.Error;
        }
    }
    Util.followPath = followPath;
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
            var root = Memory["sectors"] || (Memory["sectors"] = {});
            var sectorRoot = root[this._name] || (root[this._name] = {});
            var mem = sectorRoot[roomID];
            if (mem) {
                return mem;
            }
            this.onCreated(typeof room === "string" ? Game.rooms[room] : room, mem = sectorRoot[roomID] = {
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
                if (creep.memory.sector === this._name && (creep.room === room || creep.room.name === room) && creep.my) {
                    arr.push(creep);
                }
            }
            return arr;
        };
        /**
         * Logs a debug message.
         * @param message
         */
        Base.prototype.log = function (message) {
            console.log(this._name + ": " + message);
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
                if (mem.requestedResources.energy > 0) {
                    requests.push({ sector: sector_1.sector, priority: sector_1.priority, amount: mem.requestedResources.energy });
                }
            }
            var energyPool = energy - sumTied;
            var toDistrub = Math.min(energyPool, sumRequested);
            // so given toDistrub resources to hand out, we need to allocate them among all requests
            // { sector: "economy", priority: 0.66, amount: 0 }
            // { sector: "control", priority: 0.33, amount: 200 }
            if (toDistrub > 0) {
                requests.sort(function (a, b) { return b.priority - a.priority; });
                var energyLeft = toDistrub;
                for (var i = 0; i < requests.length; i++) {
                    if (requests[i].priority <= 0)
                        break;
                    var rollingSumPriority = requests.map(function (r) { return r.priority; }).reduce(function (a, b) { return a + b; });
                    var request = requests.shift();
                    var alloc = Math.round(Math.min(energyLeft * (request.priority / rollingSumPriority), request.amount));
                    if (alloc <= 0)
                        break;
                    var mem = request.sector.getMemory(room);
                    //console.log(`Allocated ${alloc} energy to ${request.sector.name}, fulfilling ${(alloc === request.amount) ? "the entire request" : `some of the requested ${request.amount}`}`);
                    mem.requestedResources.energy -= alloc;
                    mem.resources.energy += alloc;
                    energyLeft -= alloc;
                }
            }
            // Tick sectors
            for (var key in this._sectorMap) {
                var sector_2 = this._sectorMap[key];
                // console.log(`Tick sector '${key}' in room '${room.name}'`);
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
        /**
         * Gets if the specified spawn request is still in the spawn queue.
         * @param requestID
         */
        SpawnController.prototype.spawnRequestValid = function (requestID) {
            return this.getMemory().buildQueue.some(function (r) { return r.requestID === requestID; });
        };
        /**
         * Resets the spawn queue.
         */
        SpawnController.prototype.reset = function () {
            this.getMemory().buildQueue.length = 0;
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
                                    sector: request.sectorName,
                                    path: null,
                                    pathTarget: null
                                };
                                err = spawn_1.createCreep(body, undefined, creepMem);
                                if (err !== OK && typeof (err) !== "string") {
                                    Util.logError("Got error code " + err + " when spawning creep '" + request.roleName + "' for sector '" + request.sectorName + "', even though it passed canCreateCreep check");
                                }
                                memory.buildQueue.splice(i, 1);
                                i--;
                                sector_3.getMemory(room_3).resources.energy -= role.getCreepSpawnCost(request.level);
                            }
                            else if (err !== ERR_NOT_ENOUGH_ENERGY) {
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
var Roles;
(function (Roles) {
    /** The type of creep/object the hauler should pick resource up from. */
    (function (HaulerTakeFrom) {
        /** The hauler should take energy from a creep. */
        HaulerTakeFrom[HaulerTakeFrom["Creep"] = 0] = "Creep";
    })(Roles.HaulerTakeFrom || (Roles.HaulerTakeFrom = {}));
    var HaulerTakeFrom = Roles.HaulerTakeFrom;
    /** The type of creep/object the hauler should drop resource off at. */
    (function (HaulerGiveTo) {
        /** The hauler should give energy to generic room storage. */
        HaulerGiveTo[HaulerGiveTo["Storage"] = 0] = "Storage";
    })(Roles.HaulerGiveTo || (Roles.HaulerGiveTo = {}));
    var HaulerGiveTo = Roles.HaulerGiveTo;
    /** How the hauler should behave when picking up resource. */
    (function (HaulerCarryBehaviour) {
        /** Wait until the hauler is at capacity before leaving. */
        HaulerCarryBehaviour[HaulerCarryBehaviour["WaitUntilFull"] = 0] = "WaitUntilFull";
    })(Roles.HaulerCarryBehaviour || (Roles.HaulerCarryBehaviour = {}));
    var HaulerCarryBehaviour = Roles.HaulerCarryBehaviour;
    /** State that a hauler can be in. */
    (function (HaulerState) {
        /** Hauler is awaiting work. Default state. */
        HaulerState[HaulerState["Idle"] = 0] = "Idle";
        /** Hauler is following a path to a resource pickup point. */
        HaulerState[HaulerState["PathingToPickup"] = 1] = "PathingToPickup";
        /** Hauler is at resource pickup point and is collecting resource. */
        HaulerState[HaulerState["Collecting"] = 2] = "Collecting";
        /** Hauler is following a path to a resource drop-off point. */
        HaulerState[HaulerState["PathingToDropoff"] = 3] = "PathingToDropoff";
    })(Roles.HaulerState || (Roles.HaulerState = {}));
    var HaulerState = Roles.HaulerState;
    /**
     * How to prioritise energy drop-off structures.
     * Lower values are picked first.
     */
    var dropOffStructOrder = (_a = {},
        _a[STRUCTURE_SPAWN] = 0,
        _a[STRUCTURE_EXTENSION] = 1,
        _a[STRUCTURE_CONTAINER] = 2,
        _a[STRUCTURE_STORAGE] = 3,
        _a
    );
    /**
     * A generic resource hauler creep that can be configured via memory options.
    **/
    var Hauler = (function (_super) {
        __extends(Hauler, _super);
        function Hauler() {
            _super.call(this);
            this._name = "hauler";
            this._bodies = [
                [WORK, CARRY, MOVE]
            ];
        }
        /**
         * Runs role logic for one creep.
         * @param creep
        **/
        Hauler.prototype.run = function (creep) {
            var mem = creep.memory;
            var moveCode;
            // Switch on creep state
            switch (mem.state || HaulerState.Idle) {
                case HaulerState.Idle:
                    var pickupPt = this.findResourcePickup(creep.room, mem);
                    if (pickupPt != null) {
                        mem.path = creep.room.findPath(creep.pos, pickupPt.pos);
                        mem.path.pop(); // don't actually step onto the target tile
                        mem.state = HaulerState.PathingToPickup;
                        mem.pathTarget = { x: pickupPt.pos.x, y: pickupPt.pos.y };
                    }
                    break;
                case HaulerState.PathingToPickup:
                    // See if we're at destination
                    moveCode = Util.followPath(creep, 1);
                    switch (moveCode) {
                        case Util.FollowPathStatus.Ok:
                            break;
                        case Util.FollowPathStatus.Finished:
                            // Start collecting
                            mem.state = HaulerState.Collecting;
                            delete mem.path;
                            delete mem.pathTarget;
                            break;
                        default:
                            mem.state = HaulerState.Idle;
                            delete mem.path;
                            delete mem.pathTarget;
                    }
                    break;
                case HaulerState.Collecting:
                    var carried = creep.carry[mem.carryType];
                    // Switch on pickup behaviour
                    switch (mem.carryBehaviour) {
                        case HaulerCarryBehaviour.WaitUntilFull:
                            if (carried < creep.carryCapacity) {
                                // Take
                                this.take(creep, mem);
                            }
                            else {
                                // Drop off
                                var dropoffPt = this.findResourceDropoff(creep.room, mem);
                                if (dropoffPt != null) {
                                    mem.path = creep.room.findPath(creep.pos, dropoffPt.pos);
                                    mem.path.pop(); // don't actually step onto the target tile
                                    mem.state = HaulerState.PathingToDropoff;
                                    mem.pathTarget = { x: dropoffPt.pos.x, y: dropoffPt.pos.y };
                                }
                                break;
                            }
                            break;
                    }
                    break;
                case HaulerState.PathingToDropoff:
                    // See if we're at destination
                    moveCode = Util.followPath(creep, 1);
                    switch (moveCode) {
                        case Util.FollowPathStatus.Ok:
                            break;
                        case Util.FollowPathStatus.Finished:
                            // Drop off resources
                            this.give(creep, mem, mem.pathTarget.x, mem.pathTarget.y);
                            // Do we have more to drop off?
                            var carried_1 = creep.carry[mem.carryType];
                            if (carried_1 > 0) {
                                // Drop off again
                                var dropoffPt = this.findResourceDropoff(creep.room, mem);
                                if (dropoffPt != null) {
                                    mem.path = creep.room.findPath(creep.pos, dropoffPt.pos);
                                    mem.pathTarget = { x: dropoffPt.pos.x, y: dropoffPt.pos.y };
                                }
                            }
                            else {
                                // Clean up path
                                delete mem.path;
                                delete mem.pathTarget;
                                // Make us idle
                                mem.state = HaulerState.Idle;
                            }
                        default:
                            mem.state = HaulerState.Idle;
                            delete mem.path;
                            delete mem.pathTarget;
                    }
                    break;
            }
        };
        /**
         * Finds the resource pickup object for the specified hauler.
         * @param creepMem
         */
        Hauler.prototype.findResourcePickup = function (room, creepMem) {
            switch (creepMem.takeFrom) {
                case HaulerTakeFrom.Creep:
                    if (creepMem.takeFromID == null) {
                        return null;
                    }
                    else {
                        return Game.creeps[creepMem.takeFromID];
                    }
                default:
                    return null;
            }
        };
        /**
         * Finds the resource dropoff object for the specified hauler.
         * @param creepMem
         */
        Hauler.prototype.findResourceDropoff = function (room, creepMem) {
            switch (creepMem.giveTo) {
                case HaulerGiveTo.Storage:
                    var possibilities = room.find(FIND_MY_STRUCTURES, {
                        filter: function (structure) {
                            return (structure.structureType == STRUCTURE_EXTENSION && structure.energy < structure.energyCapacity) ||
                                ((structure.structureType == STRUCTURE_STORAGE || structure.structuretype == STRUCTURE_CONTAINER) && structure.store.energy < structure.storeCapacity);
                        }
                    });
                    possibilities.sort(function (a, b) { return dropOffStructOrder[a.structureType] - dropOffStructOrder[b.structureType]; });
                    return possibilities[0];
            }
        };
        /**
         * Makes the specified hauler attempt to take resources.
         * @param creep
         * @param creepMem
         */
        Hauler.prototype.take = function (creep, creepMem) {
            var limit = creepMem.sector ? Controllers.sector.getSector(creepMem.sector).getMemory(creep.room).resources.energy : 0;
            switch (creepMem.takeFrom) {
                case HaulerTakeFrom.Creep:
                    var targetCreep = Game.creeps[creepMem.takeFromID];
                    if (!targetCreep) {
                        Util.logError("Hauler.take: Target creep no longer exists (probably died)");
                        delete creepMem.takeFromID;
                        creepMem.state = HaulerState.Idle;
                        break;
                    }
                    // look for any dropped resource on the ground
                    var droppedRes = creep.room.lookForAt("energy", targetCreep.pos)[0];
                    if (droppedRes != null) {
                        var err = creep.pickup(droppedRes);
                        switch (err) {
                            case OK:
                            case ERR_FULL:
                                break;
                            case ERR_NOT_IN_RANGE:
                                // Can happen under normal circumstances
                                creepMem.state = HaulerState.Idle;
                                break;
                            default:
                                Util.logError("Hauler.take: creep.pickup returned unhandled error code '" + err + "'");
                                break;
                        }
                    }
                    var transferAmount = Math.min(targetCreep.carry[creepMem.carryType], creep.carryCapacity - creep.carry[creepMem.carryType]);
                    if (limit > 0 && transferAmount > limit) {
                        transferAmount = limit;
                    }
                    if (transferAmount > 0) {
                        var err = targetCreep.transfer(creep, creepMem.carryType, transferAmount);
                        switch (err) {
                            case OK:
                            case ERR_NOT_ENOUGH_RESOURCES:
                            case ERR_FULL:
                                break;
                            case ERR_NOT_IN_RANGE:
                                // Can happen under normal circumstances
                                creepMem.state = HaulerState.Idle;
                                break;
                            default:
                                Util.logError("Hauler.take: creep.transfer returned unhandled error code '" + err + "'");
                                creepMem.state = HaulerState.Idle;
                                break;
                        }
                    }
                    break;
            }
        };
        /**
         * Makes the specified hauler attempt to give resources.
         * @param creep
         * @param creepMem
         */
        Hauler.prototype.give = function (creep, creepMem, targetX, targetY) {
            switch (creepMem.giveTo) {
                case HaulerGiveTo.Storage:
                    var targetStruct = creep.room.lookForAt("structure", targetX, targetY)[0];
                    if (targetStruct != null) {
                        var err = creep.transfer(targetStruct, creepMem.carryType);
                        switch (err) {
                            case OK:
                            case ERR_NOT_ENOUGH_RESOURCES:
                            case ERR_FULL:
                                break;
                            default:
                                Util.logError("Hauler.give: creep.transfer returned unhandled error code '" + err + "'");
                                creepMem.state = HaulerState.Idle;
                        }
                    }
                    break;
            }
        };
        return Hauler;
    }(Roles.Base));
    Roles.Hauler = Hauler;
    Roles.register(new Hauler());
    var _a;
})(Roles || (Roles = {}));
/// <reference path="../Util.ts" />
/// <reference path="Base.ts" />
var Roles;
(function (Roles) {
    /** State that a miner can be in. */
    (function (MinerState) {
        /** Miner is awaiting work. Default state. */
        MinerState[MinerState["Idle"] = 0] = "Idle";
        /** Miner is following a path to a mining point. */
        MinerState[MinerState["PathingToMinePoint"] = 1] = "PathingToMinePoint";
        /** Miner is mining. */
        MinerState[MinerState["Mining"] = 2] = "Mining";
    })(Roles.MinerState || (Roles.MinerState = {}));
    var MinerState = Roles.MinerState;
    var Miner = (function (_super) {
        __extends(Miner, _super);
        function Miner() {
            _super.call(this);
            this._name = "miner";
            this._bodies = [
                [WORK, CARRY, MOVE]
            ];
        }
        /**
         * Runs role logic for one creep.
         * @param creep
        **/
        Miner.prototype.run = function (creep) {
            var mem = creep.memory;
            var moveCode;
            var mineTarget = mem.mineTargetID && Game.getObjectById(mem.mineTargetID);
            // Switch on creep state
            switch (mem.state || MinerState.Idle) {
                case MinerState.Idle:
                    if (mineTarget != null) {
                        mem.path = creep.room.findPath(creep.pos, mineTarget.pos);
                        mem.path.pop(); // don't actually step onto the target tile
                        mem.state = MinerState.PathingToMinePoint;
                        mem.pathTarget = { x: mineTarget.pos.x, y: mineTarget.pos.y };
                    }
                    break;
                case MinerState.PathingToMinePoint:
                    // See if we're at destination
                    moveCode = Util.followPath(creep, 1);
                    switch (moveCode) {
                        case Util.FollowPathStatus.Ok:
                            break;
                        case Util.FollowPathStatus.Finished:
                            // Clean up path
                            delete mem.path;
                            delete mem.pathTarget;
                            // Start mining!
                            mem.state = MinerState.Mining;
                            break;
                        default:
                            mem.state = MinerState.Idle;
                            delete mem.path;
                            delete mem.pathTarget;
                            break;
                    }
                    break;
                case MinerState.Mining:
                    if (mineTarget == null) {
                        Util.logError("Miner.run: Mining target is null somehow");
                        mem.state = MinerState.Idle;
                        delete mem.mineTargetID;
                    }
                    else {
                        var err = creep.harvest(mineTarget);
                        switch (err) {
                            case OK:
                            case ERR_NOT_ENOUGH_RESOURCES:
                                break;
                            default:
                                Util.logError("Miner.run: creep.harvest returned unhandled error code '" + err + "'");
                                mem.state = MinerState.Idle;
                                break;
                        }
                    }
                    break;
            }
        };
        return Miner;
    }(Roles.Base));
    Roles.Miner = Miner;
    Roles.register(new Miner());
})(Roles || (Roles = {}));
/// <reference path="../Util.ts" />
/// <reference path="Base.ts" />
/// <reference path="../Roles/Hauler.ts" />
/// <reference path="../Roles/Miner.ts" />
var Sectors;
(function (Sectors) {
    var Economy = (function (_super) {
        __extends(Economy, _super);
        function Economy() {
            _super.call(this, "economy");
        }
        /**
         * Gets sector memory for a specified room.
         * If it doesn't exist, it will be created.
         * @param room      Room reference or name.
         */
        Economy.prototype.getMemory = function (room) {
            return _super.prototype.getMemory.call(this, room);
        };
        /**
         * Called when sector memory has just been initialised for a room.
         * @param room
         * @param mem
         */
        Economy.prototype.onCreated = function (room, mem) {
            mem.curSpawn = -1;
        };
        /**
         * Runs a logic update tick for the given room.
         * @param room
         */
        Economy.prototype.tick = function (room) {
            var _this = this;
            // Cache creeps
            this._creeps = this.getCreeps(room);
            // Run spawn logic
            var mem = this.getMemory(room);
            if (mem.curSpawn >= 0) {
                if (!Controllers.spawn.spawnRequestValid(mem.curSpawn)) {
                    // this.log(`Request ID ${mem.curSpawn} is now invalid`);
                    mem.curSpawn = -1;
                }
            }
            else {
                mem.curSpawn = this.runSpawnLogic(room);
            }
            // Check assignments
            for (var i = 0; i < this._creeps.length; i++) {
                var creep = this._creeps[i];
                var creepMem = creep.memory;
                switch (creepMem.role) {
                    case "miner":
                        var minerMem = creep.memory;
                        if (minerMem.mineTargetID == null) {
                            // Assign to source
                            minerMem.mineType = RESOURCE_ENERGY;
                            minerMem.mineTargetID = this.allocateSource(creep).id;
                        }
                        break;
                    case "hauler":
                        var haulerMem = creep.memory;
                        if (haulerMem.takeFromID == null) {
                            haulerMem.carryType = RESOURCE_ENERGY;
                            haulerMem.carryBehaviour = Roles.HaulerCarryBehaviour.WaitUntilFull;
                            haulerMem.takeFrom = Roles.HaulerTakeFrom.Creep;
                            var haulerTarget = this._creeps.filter(function (c) { return c.memory["role"] === "miner" && !c.spawning && c.memory["state"] === Roles.MinerState.Mining && !_this._creeps.some(function (c2) { return c2.memory["takeFromID"] === c.name; }); })[0];
                            if (haulerTarget) {
                                this.log("Assigning hauler '" + creep.name + "' to miner '" + haulerTarget.name + "'");
                                haulerMem.takeFromID = haulerTarget.name;
                            }
                            haulerMem.giveTo = Roles.HaulerGiveTo.Storage;
                        }
                        break;
                }
            }
        };
        Economy.prototype.runSpawnLogic = function (room) {
            // Get all creeps for this room
            var creeps = this._creeps;
            var miners = creeps.filter(function (c) { return c.memory.role === "miner"; });
            var haulers = creeps.filter(function (c) { return c.memory.role === "hauler"; });
            // If there are less haulers then miners, we should spawn one
            if (haulers.length < miners.length) {
                this.log("Spawning hauler");
                var haulerCost = Roles.get("hauler").getCreepSpawnCost();
                this.requestEnergy(room, haulerCost);
                return Controllers.spawn.requestSpawnCreep(this, room, Roles.get("hauler"));
            }
            // Get all sources
            var roomMem = room.memory;
            var totalMinerCount = roomMem.sources.map(function (s) { return s.workersMax; }).reduce(function (a, b) { return a + b; });
            // If there are less miners than the sources can support, spawn one
            if (miners.length < totalMinerCount) {
                this.log("Spawning miner");
                var minerCost = Roles.get("miner").getCreepSpawnCost();
                this.requestEnergy(room, minerCost);
                return Controllers.spawn.requestSpawnCreep(this, room, Roles.get("miner"));
            }
            return -1;
        };
        Economy.prototype.allocateSource = function (creep) {
            var roomMem = creep.room.memory;
            for (var i = 0; i < roomMem.sources.length; i++) {
                var src = roomMem.sources[i];
                src.currentWorkers = src.currentWorkers.filter(function (cname) { return Game.creeps[cname] != null; }); // clean up dead workers
                if (src.currentWorkers.length < src.workersMax) {
                    src.currentWorkers.push(creep.name);
                    return Game.getObjectById(src.name);
                }
            }
        };
        return Economy;
    }(Sectors.Base));
    Sectors.Economy = Economy;
})(Sectors || (Sectors = {}));
/// <reference path="../Util.ts" />
/// <reference path="Base.ts" />
var Sectors;
(function (Sectors) {
    var Control = (function (_super) {
        __extends(Control, _super);
        /**
         * The control sector is responsible for feeding the room controller with energy.
         * It should maintain a single "feeder" creep that hauls energy to the controller and feeds it.
        **/
        function Control() {
            _super.call(this, "control");
        }
        /**
         * Gets sector memory for a specified room.
         * If it doesn't exist, it will be created.
         * @param room      Room reference or name.
         */
        Control.prototype.getMemory = function (room) {
            return _super.prototype.getMemory.call(this, room);
        };
        /**
         * Called when sector memory has just been initialised for a room.
         * @param room
         * @param mem
         */
        Control.prototype.onCreated = function (room, mem) {
            mem.curSpawn = -1;
        };
        /**
         * Runs a logic update tick for the given room.
         * @param room
         */
        Control.prototype.tick = function (room) {
            // Cache creeps
            var creeps = this.getCreeps(room);
            // Run spawn logic
            var mem = this.getMemory(room);
            if (mem.curSpawn >= 0) {
                if (!Controllers.spawn.spawnRequestValid(mem.curSpawn)) {
                    mem.curSpawn = -1;
                }
            }
            else if (creeps.length === 0) {
                this.log("Spawning feeder");
                var cost = Roles.get("feeder").getCreepSpawnCost();
                this.requestEnergy(room, cost);
                mem.curSpawn = Controllers.spawn.requestSpawnCreep(this, room, Roles.get("feeder"));
            }
        };
        return Control;
    }(Sectors.Base));
    Sectors.Control = Control;
})(Sectors || (Sectors = {}));
/// <reference path="Util.ts" />
/// <reference path="Roles/Base.ts" />
/// <reference path="Controllers/Room.ts" />
/// <reference path="Controllers/Sector.ts" />
/// <reference path="Controllers/Spawn.ts" />
/// <reference path="Sectors/Economy.ts" />
/// <reference path="Sectors/Control.ts" />
var profiler = require('./screeps-profiler');
var debugmode = false;
if (debugmode)
    profiler.enable();
Controllers.sector.registerSector(Sectors.Economy, 100);
Controllers.sector.registerSector(Sectors.Control, 50);
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
                // Any creeps stranded without a sector should be destroyed
                if (mem.sector == null) {
                    console.log(creep.name + ": No assigned sector, suiciding");
                    creep.suicide();
                    continue;
                }
                // Tick
                if (role) {
                    role.run(creep);
                }
                else {
                    console.log(creep.name + ": Unknown role " + mem.role);
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
            this._bodies = [
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
/// <reference path="Hauler.ts" />
var Roles;
(function (Roles) {
    var Feeder = (function (_super) {
        __extends(Feeder, _super);
        function Feeder() {
            _super.call(this);
            this._name = "feeder";
            this._bodies = [
                [WORK, CARRY, MOVE]
            ];
        }
        /**
         * Runs role logic for one creep.
         * @param creep
        **/
        Feeder.prototype.run = function (creep) {
            // TODO: Port this to the new pathfinding strategy and fix it up
            // Maybe extend the Hauler logic instead?
            if (creep.carry.energy > 0) {
                var controller = creep.room.controller;
                if (creep.upgradeController(controller) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(controller);
                }
            }
            else {
                var pickupsite = Util.quickFindAny(creep, FIND_MY_STRUCTURES, "feederspawn", {
                    filter: function (structure) {
                        if (structure.structureType == STRUCTURE_CONTAINER && structure.energy > 0) {
                            return true;
                        }
                        if (structure.structureType == STRUCTURE_STORAGE && structure.store[RESOURCE_ENERGY] > 0) {
                            return true;
                        }
                        return false;
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
        return Feeder;
    }(Roles.Base));
    Roles.Feeder = Feeder;
    Roles.register(new Feeder());
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
            this._bodies = [
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
