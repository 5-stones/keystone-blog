module.exports = function(grunt){

   require("load-grunt-tasks")(grunt); // npm install --save-dev load-grunt-tasks

   grunt.initConfig({
     babel: {
       options: {
         sourceMap: true,
         presets: ["es2015"]
       },
       dist: {
         files: [{
             "expand": true,
             "cwd": "lib/",
             "src": ["**/*.js"],
             "dest": "dist/",
             "ext": ".js"
         }]
       }
     }
   });

   grunt.registerTask("default", ["babel"]);
};
