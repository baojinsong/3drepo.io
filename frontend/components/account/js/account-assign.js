/**
 *	Copyright (C) 2016 3D Repo Ltd
 *
 *	This program is free software: you can redistribute it and/or modify
 *	it under the terms of the GNU Affero General Public License as
 *	published by the Free Software Foundation, either version 3 of the
 *	License, or (at your option) any later version.
 *
 *	This program is distributed in the hope that it will be useful,
 *	but WITHOUT ANY WARRANTY; without even the implied warranty of
 *	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *	GNU Affero General Public License for more details.
 *
 *	You should have received a copy of the GNU Affero General Public License
 *	along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

(function () {
	"use strict";

	angular.module("3drepo")
		.component("accountAssign", {
			restrict: "EA",
			templateUrl: "account-assign.html",
			bindings: {
				account: "="
			},
			controller: accountAssignCtrl,
			controllerAs: "vm"
		});
	

	accountAssignCtrl.$inject = ["$scope", "$window", "$http", "$q", "$mdDialog", "$location", "UtilsService", "serverConfig"];

	function accountAssignCtrl($scope, $window, $http,  $q, $mdDialog, $location, UtilsService, serverConfig) {
		var vm = this;

		// TODO: All of this probably needs simplifying and definitely needs abstracting
		// to a service. I am not sure if the assign user logic is actually right

		/*
		 * Init
		 */	
		vm.$onInit = function() {
			vm.loadingTeamspaces = true;
			vm.modelReady = false;
			vm.teamspaces = [];
			vm.projects = {};
			vm.models = {};
			vm.selectedRole = {};

			vm.check = $location.search();
			vm.isFromUrl = vm.check.account && vm.check.project && vm.check.model;
			if (vm.isFromUrl) {
				vm.selectedIndex = 2;
			}
			vm.getTeamspaces();

			vm.teamspacePermissions = {

				teamspace_admin : "Admin",
				// assign_licence	: "Assign Licence",
				// revoke_licence	: "Revoke Licence",
				create_project	: "Create Project",
				// create_job	: "Create Job",
				// delete_job	: "Delete Job",
				// assign_job : "Assign Job"

			};

			vm.projectPermissions = {

				create_model : "Create Model",
				create_federation : "Create Federation",
				admin_project : "Admin Project",
				edit_project :  "Edit Project",
				delete_project : "Delete Federation"

			};

			vm.modelRoles = ["unassigned"];
			
		};

		vm.resetState = function() {
			vm.fromURL = {};
			$location.search("account", null);
			$location.search("project", null);
			$location.search("model", null);
		};

		vm.getStateFromParams = function() {
			
			if (vm.check) {
				vm.fromURL = {};
				vm.fromURL.projectSelected = vm.check.project;
				vm.fromURL.modelSelected = vm.check.model;

				// Trigger the first watcher (teamspace)
				vm.teamspaceSelected = vm.check.account;
			}

		};


		// TEAMSPACES

		vm.teamspaceAdmin = vm.teamspaceAdmin;

		vm.teamspacesToAssign = function() {
			return vm.selectedTeamspace.teamspacePermissions && 
					vm.selectedTeamspace.teamspacePermissions.length === 0;
		};

		vm.teamspaceAdminDisabled = function(user, permission) {
			return (permission !== vm.teamspaceAdmin && vm.userHasPermissions(user, vm.teamspaceAdmin)) || 
					vm.selectedTeamspace.account == user.user;
		};

		vm.teamspaceAdminChecked = function(user, permission) {
			return vm.userHasPermissions(user, vm.teamspaceAdmin) || 
					vm.userHasPermissions(user, permission);
		};

		vm.adminstrableTeamspaces = function(teamspaces) {
			var permission = vm.teamspaceAdmin;
			return teamspaces.filter(function(teamspace){
				return teamspace.permissions.indexOf(permission) !== -1;
			});
		};

		vm.adminstrableProjectTeamspaces = function(teamspaces) {
			var permission = "admin_project";
			return teamspaces.filter(function(teamspace){
				var hasAdminstrableProject = false;
				teamspace.projects.forEach(function(project){
					if (project.permissions.indexOf(permission) !== -1) {
						hasAdminstrableProject = true;
					}
				});	
				return hasAdminstrableProject;
			});
		};

		vm.getTeamspaces = function() {
			
			var url = serverConfig.apiUrl(serverConfig.GET_API, vm.account + ".json" );
			$http.get(url)
				.then(function(response) {

					vm.teamspaces = response.data.accounts;
					vm.getStateFromParams();
					vm.loadingTeamspaces = false;
					
				})
				.catch(function (error) {
					var title = "Issue Getting Teamspaces";
					vm.showError(title, error);
				});
		};

		vm.postTeamspacePermissionChange = function(user, permission, addOrRemove) {

			if (user) {
				// Add or remove a permission
				if (addOrRemove === "add") {
					user.permissions.push(permission); 
				} else {
					var index = user.permissions.indexOf(permission);
					if (index > -1) {
						user.permissions.splice(index, 1);
					}
				}

				// Update the permissions user for the selected teamspace
				var endpoint = vm.selectedTeamspace.account + "/permissions/";
				var url = serverConfig.apiUrl(serverConfig.POST_API, endpoint);
				var permissionData = {
					user : user.user,
					permissions: user.permissions
				};

				$http.post(url, permissionData)
					.catch(function(error){
						var title = "Issue Updating Teamspace Permissions";
						vm.showError(title, error);
					});

			} else {
				console.error("User data is corrupt: ", user, permission, addOrRemove);
			}
			
		};

		vm.teamspaceStateChange = function(user, permission) {
			var addOrRemove = vm.userHasPermissions(user, permission) === true ? "remove" : "add";
			vm.postTeamspacePermissionChange(user, permission, addOrRemove);
		};

		vm.userHasPermissions = function(user, permission) {

			var hasPermissions = false;
			vm.selectedTeamspace.teamspacePermissions.forEach(function(permissionUser) {
				if (permissionUser.user === user.user) {
					hasPermissions = user.permissions.indexOf(permission) !== -1;
				} 
			});
			
			return hasPermissions;
		};

		vm.appendTeamspacePermissions = function(teamspace) {

			var url = serverConfig.apiUrl(serverConfig.GET_API, teamspace.account + "/permissions" );
			return $http.get(url)
				.then(function(response) {
					var permissionsUsers = response.data;
					teamspace.teamspacePermissions = permissionsUsers;
				})
				.catch(function(error){
					if (error.status !== 401) {
						var title = "Issue Populating Teamspace Users";
						vm.showError(title, error);
						console.error(error);
					}
				});
			
		};

		$scope.$watch("vm.teamspaceSelected", function(){

			// Teamspace has changed so we must reset all 
			// associate model and project data 
			vm.clearModelState();
			vm.clearProjectState();
		
			if (vm.teamspaces.length) {

				// Find the matching teamspace to the one selected
				vm.selectedTeamspace = vm.teamspaces.find(function(teamspace){
					return teamspace.account === vm.teamspaceSelected;
				});

				if (vm.selectedTeamspace) {
					vm.handleTeamspaceSelected()
						.then(function(permissions){
							vm.selectedTeamspace.teamspacePermissions = permissions;
						})
						.catch(function(error){
							console.error(error);
						});
				}

			}
		
		});

		vm.setPermissionTemplates = function(teamspace){

			var permission = teamspace.account + "/permission-templates";
			var permissionUrl = serverConfig.apiUrl(serverConfig.GET_API, permission);
			
			return $http.get(permissionUrl)
				.then(function(response) {
					vm.modelRoles = ["unassigned"];

					response.data.forEach(function(template){
						vm.modelRoles.push(template._id);
					});
				})
				.catch(function(error){
					// We can ignore unathorised permission template attempts
					// TODO: Can't we just avoid sending the request
					if (error.status !== 401) {
						var title = "Issue Getting Permission Templates";
						vm.showError(title, error);
					}
				});

		};

		vm.handleTeamspaceSelected = function() {
			
			vm.setProjects();

			// The property is set async so it won't be there immediately
			return $q(function(resolve, reject) {
				vm.appendTeamspacePermissions(vm.selectedTeamspace)
					.then(function(){
						vm.setPermissionTemplates(vm.selectedTeamspace)
							.then(function() {
								if (vm.fromURL.projectSelected) {
									vm.projectSelected = vm.fromURL.projectSelected;
									delete vm.fromURL.projectSelected;
								}
								resolve(vm.selectedTeamspace.teamspacePermissions);
							});
					})
					.catch(function(error){
						var title = "Issue Populating Teamspace Permissions";
						vm.showError(title, error);
						reject(error);
					});

			});		

		};

		// PROJECTS

		vm.projectsToAssign = function() {
			return vm.selectedProject.userPermissions && 
					vm.selectedProject.userPermissions.length === 0;
		};

		vm.adminChecked = function(user, permission) {
			return vm.userHasProjectPermissions(user, permission) ||
					vm.userHasProjectPermissions(user, "admin_project");
		};

		vm.adminDisabled = function(user, permission) {
			return permission !== "admin_project" && vm.userHasProjectPermissions(user, "admin_project");
		}

		vm.setProjects = function() {

			vm.projects = {};
			vm.selectedTeamspace.projects.forEach(function(project){
				vm.projects[project.name] = project;
			});

		};

		vm.clearProjectState = function() {
			vm.projectSelected = undefined;
			vm.selectedProject = undefined;
		};

		$scope.$watch("vm.projectSelected", function(){
			// Find the matching project to the one selected

			if (vm.projectSelected) {
				vm.selectedProject = vm.projects[vm.projectSelected];

				var endpoint = vm.selectedTeamspace.account + "/projects/" + vm.projectSelected;
				var url = serverConfig.apiUrl(serverConfig.GET_API, endpoint);
				
				// We can use the current users object as its matches the required 
				// data structure the API expects
				$http.get(url)
					.then(function(response){
						
						vm.selectedProject.userPermissions = response.data.permissions;

						// Reset the models
						vm.clearModelState();

						if (vm.teamspaceSelected && vm.projectSelected) {

							if (vm.selectedProject && vm.selectedProject.models) {

								vm.models = vm.selectedProject.models;

								if (vm.fromURL.modelSelected && vm.fromURL.modelSelected) {
									vm.modelSelected = vm.fromURL.modelSelected;
									delete vm.fromURL.modelSelected;
								}

								
							}
							
						} 

					})
					.catch(function(error) {
						console.error(error);
						var title = "Issue Getting Project Permissions";
						vm.showError(title, error);
					});
		
			}
			
		});

		vm.projectStateChange = function(user, permission) {
			var hasPermission = vm.userHasProjectPermissions(user, permission);
			var addOrRemove = hasPermission === true ? "remove" : "add";
			vm.postProjectPermissionChange(user, permission, addOrRemove);
		};

		vm.userHasProjectPermissions = function(user, permission) {
			
			var hasPermission = false;

			if (vm.selectedProject && vm.selectedProject.userPermissions) {
				// Loop through all the project users and see if they have 
				// permissions. If so we can set the tick box to checked
				
				vm.selectedProject.userPermissions.forEach(function(permissionUser){
					if (permissionUser.user === user.user) {
						var userPermissions = permissionUser.permissions;
						if (userPermissions) {
							hasPermission = userPermissions.indexOf(permission) !== -1;
						}
					}
				});
			}
			
			return hasPermission;
		};

		vm.postProjectPermissionChange = function(user, permission, addOrRemove) {

			//Add or remove a permission
			if (addOrRemove === "add" || addOrRemove === "remove") {

				var targetUser = vm.selectedProject.userPermissions.find(function(projectUser){
					return projectUser.user === user.user;
				});

				if (addOrRemove === "add") {

					if (targetUser) {
						// If the user is already in the list we can add the persmission
						if (targetUser.permissions.indexOf(permission) === -1) {
							targetUser.permissions.push(permission);
						}
					} else {
						// Else we create a new object and add it in
						vm.selectedProject.userPermissions.push({
							user : user.user,
							permissions: [permission]
						});
					}
					
				} else if (addOrRemove === "remove") {

					// If we are removing the permission
					if (targetUser) {
						
						// If the user is already in the list we can add the persmission
						var index = targetUser.permissions.indexOf(permission);
						if (index !== -1) {
							targetUser.permissions.splice(index, 1);
						}
					} 
					
				} 

				//Update the permissions user for the selected teamspace
				var endpoint = vm.selectedTeamspace.account + "/projects/" + vm.selectedProject.name;
				var url = serverConfig.apiUrl(serverConfig.POST_API, endpoint);
				$http.put(url, {
					permissions: vm.selectedProject.userPermissions
				}).catch(function(error){
					var title = "Issue Updating Project Permissions";
					vm.showError(title, error);
				});

			}

		};

		// MODELS

		vm.modelUsersToAssign = function() {
			return vm.modelRoles && Object.keys(vm.modelRoles).length === 0;
		};

		vm.modelUserValid = function(user) {
			return vm.selectedTeamspace.account == user || vm.account == user;
		};

		vm.modelDataReady = function() {
			return (!vm.isFromUrl && !vm.loadingTeamspaces && !vm.projectsLoading) ||
					(vm.isFromUrl && vm.modelReady);
		};

		vm.modelsLoaded = function() {
			return vm.models && Object.keys(vm.models).length > 0;
		};

		vm.clearModelState = function() {
			vm.resetSelectedModel();
			vm.modelReady = false;
			vm.modelSelected = undefined;
		};

		vm.resetSelectedModel = function() {
			vm.selectedModel = undefined;
			vm.selectedRole = {};
		};

		$scope.$watch("vm.modelSelected", function(){
			// Find the matching project to the one selected

			vm.resetSelectedModel();
			
			if (vm.teamspaceSelected && vm.projectSelected && vm.modelSelected) {

				vm.selectedModel = vm.models.find(function(model){
					return model.model ===  vm.modelSelected;
				});

				console.log(vm.selectedModel);
				
				
				// console.log(vm.selectedTeamspace.teamspacePermissions);

				// // Setup users
				// vm.selectedTeamspace.teamspacePermissions.forEach(function(permissionUser){
				// 	if (permissionUser.user && vm.selectedRole[permissionUser.user] === undefined) {
				// 		vm.selectedRole[permissionUser.user] = "unassigned";
				// 	}
				// });

				return $q(function(resolve, reject) {

					var endpoint = vm.selectedTeamspace.account + "/" + vm.modelSelected +  "/" + "permissions";
					var url = serverConfig.apiUrl(serverConfig.POST_API, endpoint);

					$http.get(url)
						.then(function(response){
							console.log(response)
							var users = response.data;
							users.forEach(function(user){
								vm.selectedRole[user.user] = user.permission || "unassigned";
							});
							vm.modelReady = true;
							console.log(vm.modelReady, vm.selectedModel);
							resolve();
						})
						.catch(function(error){
							var title = "Issue Retrieving Model Permissions";
							vm.showError(title, error);

							reject(error);
						});	
					
				});		

				//}
				
				
			}
			

		});

		vm.modelStateChange = function(user, role) {

			vm.selectedRole[user.user] = role;
			var permissionsToSend = [];

			for (var roleUser in vm.selectedRole) {
				if (roleUser) {
					var permission = vm.selectedRole[roleUser];
					var notUnassigned = permission !== "unassigned";

					if (notUnassigned) {

						permissionsToSend.push({
							user : roleUser,
							permission : permission
						});

					}
				}
			}

			// Update the permissions user for the selected teamspace
			var endpoint = vm.selectedTeamspace.account + "/" + vm.modelSelected + "/permissions";
			var url = serverConfig.apiUrl(serverConfig.POST_API, endpoint);
			$http.post(url, permissionsToSend)
				.catch(function(error) {
					var title = "Model Permission Assignment Error";
					vm.showError(title, error);
				});

		};

		vm.showError = function(title, error) {
			// Error for developer
			console.error("Error", error);

			// Error for user
			var conf = "Something went wrong: " + 
			"<br><br> <code>Error - " + error.data.message + " (Status Code: " + error.status + ")" + 
			"</code> <br><br> <md-container>";
			$mdDialog.show(
				$mdDialog.alert()
					.clickOutsideToClose(true)
					.title(title)
					.htmlContent(conf)
					.ariaLabel(title)
					.ok("OK")
			);
		};


	}
}());
