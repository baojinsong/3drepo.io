/**
 *	Copyright (C) 2018 3D Repo Ltd
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
import { RisksService } from "./risks.service";

class RisksListController implements ng.IController {

	public static $inject: string[] = [
		"$scope",
		"$window",
		"$timeout",
		"$compile",
		"$element",

		"RisksService",
		"ClientConfigService"
	];

	private toShow: string;
	private info: string;
	private focusedRiskIndex: any;
	private selectedRiskIndex: any;
	private internalSelectedRisk: any;
	private onEditRisk: any;
	private contentHeight: any;
	private allRisks: any;
	private menuOption: any;
	private importBcf: any;
	private account: string;
	private model: string;
	private revision: string;
	private filterText: string;
	private bcfInputHandler: any;

	constructor(
		private $scope,
		private $window,
		private $timeout,
		private $compile,
		private $element,

		private risksService: RisksService,
		private clientConfigService: any
	) {}

	public $onInit() {

		this.toShow = "list";
		this.focusedRiskIndex = null;
		this.selectedRiskIndex = null;
		this.internalSelectedRisk = null;
		this.watchers();

	}

	public watchers() {

		this.$scope.$watch(
			() => {
				return this.risksService.state.allRisks;
			},
			() => {

				if (this.risksService.state.allRisks) {
					if (this.risksService.state.allRisks.length > 0) {

						this.toShow = "list";
						this.setupRisksToShow();
						// this.checkShouldShowIssue();

					} else {
						this.toShow = "info";
						this.info = "There are currently no open risks";
						this.contentHeight({height: this.risksService.state.heights.infoHeight});
					}
				}

				this.allRisks = this.risksService.state.allRisks;

			},
			true
		);

		this.$scope.$watch("vm.filterText", () => {

			// Filter text
			this.setupRisksToShow();

		});

		this.$scope.$watch("vm.menuOption", () => {

			// Menu option
			if (this.menuOption && this.menuOption.value) {

				this.handleMenuOptions();

			}

		});

	}

	public handleMenuOptions() {
		const ids = [];
		this.risksService.state.risksToShow.forEach((risk) => {
			ids.push(risk._id);
		});

		switch (this.menuOption.value) {

			case "print":
				const printEndpoint = this.account + "/" + this.model + "/risks.html?ids=" + ids.join(",");
				const printUrl = this.clientConfigService.apiUrl(this.clientConfigService.GET_API, printEndpoint);
				this.$window.open(printUrl, "_blank");
				break;

			case "showPins":
				this.risksService.state.risksCardOptions.showPins =
					!this.risksService.state.risksCardOptions.showPins;
				break;
		}

		this.setupRisksToShow();
	}

	public setupRisksToShow() {

		this.risksService.setupRisksToShow(this.model, this.filterText);

		// Setup what to show
		if (this.risksService.state.risksToShow.length > 0) {
			this.toShow = "list";
			const buttonSpace = 70;
			const numOfRisks = this.risksService.state.risksToShow.length;
			const heights = this.risksService.state.heights.risksListItemHeight + buttonSpace;
			const risksHeight = numOfRisks * heights;
			this.contentHeight({height: risksHeight });
		} else {
			this.toShow = "info";
			this.info = "There are currently no open risks";
			this.contentHeight({height: this.risksService.state.heights.infoHeight});
		}

		this.risksService.showRiskPins(this.account, this.model);
	}

	public selectRisk(risk) {
		this.risksService.setSelectedRisk(risk, false, this.revision);
		angular.element(this.$window).triggerHandler("resize");
	}

	public isSelectedRisk(risk) {
		return this.risksService.isSelectedRisk(risk);
	}

	public editRisk(risk) {
		this.onEditRisk({risk});
	}

}

export const RisksListComponent: ng.IComponentOptions = {
	bindings: {
		account: "<",
		model: "<",
		revision: "<",
		allRisks: "<",
		risksToShow: "<",
		filterText: "<",
		onEditRisk: "&",
		nonListSelect: "<",
		contentHeight: "&",
		menuOption: "<",
		importBcf: "&",
		selectedRisk: "<",
		risksCardOptions: "<"
	},
	controller: RisksListController,
	controllerAs: "vm",
	templateUrl: "templates/risks-list.html"
};

export const RisksListComponentModule = angular
	.module("3drepo")
	.component("risksList", RisksListComponent);