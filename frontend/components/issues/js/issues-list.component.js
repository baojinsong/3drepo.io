/**
 *	Copyright (C) 2016 3D Repo Ltd
 *
 *	This program is free software: you can redistribute it and/or modify
 *	it under the issuesList of the GNU Affero General Public License as
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
		.component("issuesList", {
			controller: IssuesListCtrl,
			controllerAs: "vm",
			templateUrl: "templates/issues-list.html",
			bindings: {
				account: "<",
				model: "<",
				allIssues: "<",
				issuesToShow: "<",
				treeMap: "<",
				filterText: "<",
				event: "<",
				onEditIssue: "&",
				onSelectIssue: "&",
				nonListSelect: "<",
				keysDown: "=",
				contentHeight: "&",
				menuOption: "<",
				importBcf: "&",
				selectedIssue: "<",
				userJob: "<",
				issueDisplay: "<",
				availableJobs: "<"
			}
		});

	IssuesListCtrl.$inject = [
		"$scope", "$filter", "$window", "APIService", 
		"IssuesService", "ClientConfigService", 
		"$timeout", "ViewerService"
	];

	function IssuesListCtrl (
		$scope, $filter, $window, APIService, IssuesService, 
		ClientConfigService, $timeout, ViewerService
	) {

		var vm = this;

		// Init
		vm.$onInit = function() {

			vm.toShow = "list";
			vm.focusedIssueIndex = null;
			vm.selectedIssueIndex = null;
			vm.internalSelectedIssue = null;

		};


		// All issues
		$scope.$watch(function(){
			return IssuesService.state.allIssues;
		}, function(){

			if (IssuesService.state.allIssues) {
				if (IssuesService.state.allIssues.length > 0) {

					vm.toShow = "list";
					vm.setupIssuesToShow();
	
				} else {
					vm.toShow = "info";
					vm.info = "There are currently no open issues";
					vm.contentHeight({height: IssuesService.state.heights.infoHeight});
				}
			}

			vm.allIssues = IssuesService.state.allIssues;
			vm.checkShouldShowIssue();

		}, true);

		$scope.$watch("vm.filterText", function() {

			// Filter text
			vm.setupIssuesToShow();

		});

		$scope.$watch("vm.menuOption", function(){

			// Menu option
			if (vm.menuOption && vm.menuOption.value) {

				switch(vm.menuOption.value) {
				
				case "sortByDate":
					//vm.sortOldestFirst = !vm.sortOldestFirst;
					IssuesService.state.issueDisplay.sortOldestFirst = !IssuesService.state.issueDisplay.sortOldestFirst;
					break;
				
				case "showClosed":
					//vm.showClosed = !vm.showClosed;
					IssuesService.state.issueDisplay.showClosed = !IssuesService.state.issueDisplay.showClosed;
					break;

				case "showSubModels":
					//vm.showSubModelIssues = !vm.showSubModelIssues;
					IssuesService.state.issueDisplay.showSubModelIssues = !IssuesService.state.issueDisplay.showSubModelIssues;
					break;
				
				case "print":
					var ids = [];
					IssuesService.state.issueDisplay.issuesToShow.forEach(function(issue){
						ids.push(issue._id);
					});
					var printEndpoint = vm.account + "/" + vm.model + "/issues.html?ids=" + ids.join(",");
					var printUrl = ClientConfigService.apiUrl(ClientConfigService.GET_API, printEndpoint);
					$window.open(printUrl, "_blank");
					break;

				case "exportBCF":
					var bcfEndpoint = vm.account + "/" + vm.model + "/issues.bcfzip";
					var bcfUrl = ClientConfigService.apiUrl(ClientConfigService.GET_API, bcfEndpoint);
					$window.open(bcfUrl, "_blank");
					break;

				case "importBCF":
					var file = document.createElement("input");
					file.setAttribute("type", "file");
					file.setAttribute("accept", ".zip,.bcfzip");
					file.click();

					file.addEventListener("change", function () {
						vm.importBcf({file: file.files[0]});
					});
					break;

				case "filterRole":
					var roleIndex = IssuesService.state.issueDisplay.excludeRoles.indexOf(vm.menuOption.role);
					if(vm.menuOption.selected){
						if(roleIndex !== -1){
							IssuesService.state.issueDisplay.excludeRoles.splice(roleIndex, 1);
						}
					} else {
						if(roleIndex === -1){
							IssuesService.state.issueDisplay.excludeRoles.push(vm.menuOption.role);
						}
					}
					break;

				}

				vm.setupIssuesToShow();

			}

		});

		vm.setupIssuesToShow = function() {

			IssuesService.setupIssuesToShow(vm.model, vm.filterText);

			// Setup what to show
			if (IssuesService.state.issuesToShow.length > 0) {
				vm.toShow = "list";
				var buttonSpace = 70;
				var numOfIssues = IssuesService.state.issuesToShow.length;
				var heights = IssuesService.state.heights.issuesListItemHeight + buttonSpace;
				var issuesHeight = numOfIssues * heights;
				vm.contentHeight({height: issuesHeight });
			} else {
				vm.toShow = "info";
				vm.info = "There are currently no open issues";
				vm.contentHeight({height: IssuesService.state.heights.infoHeight});
			}

			vm.showPins();
		};

		$scope.$watch(function(){
			return IssuesService.state.selectedIssue;
		}, function(){

			// Selected issue
			if (IssuesService.state.selectedIssue && IssuesService.state.issuesToShow) {

				for (var i = 0; i < IssuesService.state.issuesToShow.length; i++) {
					// To clear any previously selected issue
					IssuesService.state.issuesToShow[i].selected = false;
					IssuesService.state.issuesToShow[i].focus = false;

					// Set up the current selected iss
					if (IssuesService.state.selectedIssue && IssuesService.state.issuesToShow[i]._id === IssuesService.state.selectedIssue._id) {
						vm.internalSelectedIssue = IssuesService.state.issuesToShow[i];
						vm.internalSelectedIssue.selected = true;
						vm.internalSelectedIssue.focus = true;
						vm.focusedIssueIndex = i;
						vm.selectedIssueIndex = i;
					}
				}
			}

		}, true);



		$scope.$watch(function(){
			IssuesService.state.displayIssue;
		}, function(){
			vm.checkShouldShowIssue();
		}, true);

		vm.checkShouldShowIssue = function() {
			var issueToDisplay = IssuesService.getDisplayIssue();
			if (issueToDisplay) {
				vm.editIssue(issueToDisplay);
				$timeout(function(){
					IssuesService.showIssue(issueToDisplay);
				}.bind(this), 500);
			}
		};
		
		/**
		 * Select issue
		 * @param event
		 * @param issue
		 */
		vm.select = function (issue) {
			
			if (
				vm.internalSelectedIssue === null || 
				vm.internalSelectedIssue._id === issue._id
			) {
				vm.resetViewerState(issue);
				vm.setViewerState(issue);
			} else {
				vm.setViewerState(issue);
			}
			
			vm.onSelectIssue({issue: vm.internalSelectedIssue});
			
		};

		vm.resetViewerState = function(issue) {

			vm.internalSelectedIssue = issue;
			vm.internalSelectedIssue.selected = false;
			vm.internalSelectedIssue.focus = false;

			IssuesService.deselectPin(vm.internalSelectedIssue);

		};

		vm.setViewerState = function(issue) {

			vm.internalSelectedIssue = issue;
			vm.internalSelectedIssue.selected = true;
			vm.internalSelectedIssue.focus = true;

			IssuesService.showIssue(vm.internalSelectedIssue);
			vm.setSelectedIssueIndex(vm.internalSelectedIssue);

		}; 

		/**
		 * Set focus on issue
		 * @param issue
		 * @param index
		 */
		vm.setFocus = function(issue, index) {
			if (vm.internalSelectedIssue !== null) {
				vm.internalSelectedIssue.focus = false;
			}
			vm.focusedIssueIndex = index;
			issue.focus = true;
		};

		/**
		 * Remove focus from issue
		 * @param issue
		 */
		vm.removeFocus = function (issue) {
			vm.focusedIssueIndex = null;
			issue.focus = false;
		};

		/**
		 * Set up editing of issue
		 */
		vm.editIssue = function (issue) {
			vm.onEditIssue({issue: issue});
		};

		/**
		 * Set the selected issue index
		 * @param selectedIssue
		 */
		vm.setSelectedIssueIndex = function(selectedIssueObj) {

			if (selectedIssueObj !== null) {
				for (var i = 0; i < IssuesService.state.issuesToShow.length; i += 1) {
					if (IssuesService.state.issuesToShow[i]._id === selectedIssueObj._id) {
						vm.selectedIssueIndex = i;
					}
				}
			} else {
				vm.selectedIssueIndex = null;
			}

		};


		/**
		 * Add issue pins to the viewer
		 */
		vm.showPins = function() {

			// TODO: This is still inefficent and unclean
			IssuesService.state.allIssues.forEach(function(issue){
				var show = IssuesService.state.issuesToShow.find(function(shownIssue){
					return issue._id === shownIssue._id;
				});

				// Check that there is a position for the pin
				var pinPosition = issue.position && issue.position.length;

				if (show !== undefined && pinPosition) {

					var pinColor = Pin.pinColours.blue;
					var isSelectedPin = IssuesService.state.selectedIssue && issue._id === IssuesService.state.selectedIssue._id;

					if (isSelectedPin) {
						pinColor = Pin.pinColours.yellow;
					}

					ViewerService.addPin({
						id: issue._id,
						account: vm.account,
						model: vm.model,
						pickedPos: issue.position,
						pickedNorm: issue.norm,
						colours: pinColor,
						viewpoint: issue.viewpoint
					});

				} else {
					// Remove pin
					ViewerService.removePin({ id: issue._id });
				}
			});

		};


	}
}());
