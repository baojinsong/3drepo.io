/**
 *  Copyright (C) 2015 3D Repo Ltd
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as
 *  published by the Free Software Foundation, either version 3 of the
 *  License, or (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

(function () {
	"use strict";

	angular.module('3drepo')
		.factory('ProjectService', ProjectService);

	ProjectService.$inject = ["$http", "$q", "StateManager", "serverConfig", "Auth"];

	function ProjectService($http, $q, StateManager, serverConfig, Auth) {
		var state = StateManager.state;

		var getRoles = function () {
			var deferred = $q.defer(),
				url = serverConfig.apiUrl(state.account + '/' + state.project + '/roles.json');

			$http.get(url)
				.then(
					function(data) {
						deferred.resolve(data.data);
					},
					function () {
						deferred.resolve([]);
					}
				);

			return deferred.promise;
		};

		var getUserRolesForProject = function () {
			var deferred = $q.defer(),
				url = serverConfig.apiUrl(state.account + "/" + state.project + "/" + Auth.username + "/userRolesForProject.json");

			$http.get(url)
				.then(
					function(response) {
						deferred.resolve(response.data);
					},
					function () {
						deferred.resolve([]);
					}
				);

			return deferred.promise;
		};

		var getUserRoles = function (account, project) {
			var deferred = $q.defer(),
				url = serverConfig.apiUrl(account + "/" + project + "/" + Auth.username + "/userRolesForProject.json");

			$http.get(url)
				.then(
					function(response) {
						deferred.resolve(response.data);
					},
					function () {
						deferred.resolve([]);
					}
				);

			return deferred.promise;
		};

		return {
			getRoles: getRoles,
			getUserRolesForProject: getUserRolesForProject,
			getUserRoles: getUserRoles
		};
	}
}());
