"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var util = require("./util");
var BaseSector = require("./BaseSector");
var EconomySector = (function (_super) {
    __extends(EconomySector, _super);
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
    };
    EconomySector = __decorate([
        util.profilePrototype("EconomySector")
    ], EconomySector);
    return EconomySector;
}(BaseSector));
module.exports = EconomySector;
//# sourceMappingURL=Sector_Economy.js.map