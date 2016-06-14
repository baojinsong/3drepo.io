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
		.directive("accountDir", accountDir);

	function accountDir() {
		return {
			restrict: "EA",
			templateUrl: "account.html",
			scope: {
				state: "=",
				account: "="
			},
			controller: AccountCtrl,
			controllerAs: "vm",
			bindToController: true
		};
	}

	AccountCtrl.$inject = ["$scope", "$location", "AccountService", "Auth"];

	function AccountCtrl($scope, $location, AccountService, Auth) {
		var vm = this,
			promise;

		/*
		 * Init
		 */
		vm.itemToShow = "repos";
		vm.showProject = false;

		/*
		 * Get the account data
		 */
		$scope.$watch("vm.account", function()
		{
			if (vm.account)
			{
				promise = AccountService.getUserInfo(vm.account);
				promise.then(function (response) {
					vm.accounts = response.data.accounts;
					vm.username = vm.account;
					vm.firstName = response.data.firstName;
					vm.lastName = response.data.lastName;
					vm.email = response.data.email;
					/*
					 vm.hasAvatar = response.data.hasAvatar;
					 vm.avatarURL = response.data.avatarURL;
					 */
					goToProject();
				});
			} else {
				vm.username        = null;
				vm.firstName       = null;
				vm.lastName        = null;
				vm.email           = null;
				vm.projectsGrouped = null;
			}
		});

		/*
		 * Watch for change in project
		 */
		$scope.$watch("vm.state.project", function()
		{
			goToProject();
		});

		/**
		 * Go to a project or back to the projects list if the project is unknown
		 */
		function goToProject () {
			var i, length;
			if (angular.isDefined(vm.accounts)) {
				for (i = 0, length = vm.accounts[0].projects.length; i < length; i += 1) {
					if (vm.accounts[0].projects[i].project === vm.state.project) {
						vm.showProject = true;
						break;
					}
				}
				if (!vm.showProject) {
					$location.path("/" + vm.state.account, "_self");
				}
			}
		}

		vm.showItem = function (item) {
			vm.itemToShow = item;
		};

		/**
		 * Event listener for change in local storage login status
		 * 
		 * @param event
		 */
		function loginStatusListener (event) {
			if ((event.key === "tdrLoggedIn") && (event.newValue === "false")) {
				$location.path("/", "_self");
				Auth.logout();
			}
		}
		window.addEventListener("storage", loginStatusListener, false);
		// Set the logged in status to the account name just once
		if (localStorage.getItem("tdrLoggedIn") === "false") {
			localStorage.setItem("tdrLoggedIn", vm.account);
		}
	}
}());
