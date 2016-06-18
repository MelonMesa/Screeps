var fs = require("fs");

module.exports = function (grunt) {

    var config = JSON.parse(fs.readFileSync("config.json"));

    grunt.loadNpmTasks('grunt-screeps');

    grunt.initConfig({
        screeps: {
            options: {
                email: config.email,
                password: config.password,
                branch: config.branch,
                ptr: false
            },
            dist: {
                src: [config.source]
            }
        }
    });
}