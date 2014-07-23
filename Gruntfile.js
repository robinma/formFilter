/**
 * @author jerry
 */
module.exports = function(grunt) {

	grunt.initConfig({
		pkg : grunt.file.readJSON("package.json"),
		
		uglify:{
			options : {
				paths : ['.'],
				include : 'relative'
			},
			src:{
				files:[{
					expand:true,
					cwd:'src/',
					src:['**.*'],
					filter:'isFile',
					dest:'dest/',
					ext:'.js'
				}]
			}
			
		}
		
	});
	
	grunt.loadNpmTasks('grunt-contrib-uglify');
	
	grunt.registerTask('build-src', ['uglify:src']);
}