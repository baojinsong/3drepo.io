/**
 *	Copyright (C) 2014 3D Repo Ltd
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

declare var Viewer;

class BottomButtonsController implements ng.IController {

	public static $inject: string[] = [
		'$scope',
		'$interval',
		'$timeout',
		'$element',

		'ViewerService',
		'TreeService',
		'IconsConstant'
	];

	private showButtons: boolean;
	private navigationState: any;
	private selectedViewingOptionIndex: number;
	private bottomButtons: any[];
	private selectedMode: string;
	private showNavigationState: boolean;
	private customIcons: any;
	private isFocusMode: boolean;
	private escapeFocusModeButton: HTMLElement;
	private clipButton: any;

	constructor(
		private $scope: ng.IScope,
		private $interval: ng.IIntervalService,
		private $timeout: ng.ITimeoutService,
		private $element: ng.IRootElementService,

		private ViewerService: any,
		private TreeService: any,
		private IconsConstant: any
	) {

		this.customIcons = this.IconsConstant;

	}

	public $onInit() {

		this.showButtons = true;

		this.navigationState = {

			VALUE : 1,

			MODES : {
				HELICOPTER : {
					mode: Viewer.NAV_MODES.HELICOPTER,
					label: 'Helicopter'
				},
				TURNTABLE : {
					mode: Viewer.NAV_MODES.TURNTABLE,
					label: 'Turntable'
				}
			},
			SPEED : {
				RESET : {
					mode: 'RESET',
					label: 'Reset',
					fn: () => {
						this.ViewerService.helicopterSpeedReset(true);
						this.navigationState.VALUE = 1;
						this.$timeout(); // Force digest
					}
				},
				INCREASE : {
					mode: 'INCREASE',
					label: 'Increase',
					fn: () => {
						if (this.navigationState.VALUE < 99) {
							this.ViewerService.helicopterSpeedUp(++this.navigationState.VALUE);
							this.$timeout();  // Force digest
						}
					}
				},
				DECREASE : {
					mode: 'DECREASE',
					label: 'Decrease',
					fn: () => {
						if (this.navigationState.VALUE > -99) {
							this.ViewerService.helicopterSpeedDown(--this.navigationState.VALUE);
							this.$timeout();  // Force digest
						}
					}
				}
			}

		};

		document.addEventListener('click', (event: any) => {
			// If the click is on the scene somewhere, hide the buttons
			const valid = event && event.target && event.target.classList;
			if (valid && event.target.classList.contains('emscripten')) {
				this.showNavigationState = false;
			}
		}, false);

		this.selectedViewingOptionIndex = 1;

		this.addButtons();

		this.selectedMode = this.navigationState.MODES.TURNTABLE.mode;
		this.setNavigationMode(this.selectedMode);

		this.isFocusMode = false;

		this.escapeFocusModeButton = document.createElement('md-button');
		this.escapeFocusModeButton.className = 'focus-button';
		const icon = document.createElement('md-icon');
		icon.innerHTML = 'clear';
		icon.className = 'angular-material-icons material-icons close-icon';

		this.escapeFocusModeButton.appendChild(icon);
		document.getElementsByTagName('home')[0].appendChild(this.escapeFocusModeButton);

		// Bind a click handler to exit focus mode
		this.escapeFocusModeButton.addEventListener('click', this.focusMode.bind(this));

		this.watchers();
	}

	public watchers() {

		// We have to use interval as watcher seems to
		// break the e2e tests due to Angular timeouts
		this.$interval(() => {
			const newMode = this.ViewerService.getNavMode();
			if (newMode !== this.selectedMode) {
				this.selectedMode = newMode;
			}
			const heliSpeed = this.ViewerService.getHeliSpeed();
			if (this.selectedMode === this.navigationState.MODES.HELICOPTER.mode &&
				heliSpeed && heliSpeed !== this.navigationState.VALUE) {

				this.ViewerService.helicopterSpeedReset(false);
				const diff = heliSpeed - 1;
				this.navigationState.VALUE = heliSpeed;
				const slower = diff > 0;
				for (let i = 0; i < Math.abs(diff); ++i) {
					if (slower) {
						this.ViewerService.helicopterSpeedUp(undefined);
					} else {
						this.ViewerService.helicopterSpeedDown(undefined);
					}
				}
			}

			const lastCount = this.clipButton.numClips;
			this.clipButton.numClips = this.ViewerService.getNumPlanes();
			if (!this.clipButton.numClips && lastCount !== this.clipButton.numClips) {
				this.disableClipEdit();
			}
		}, 1000);

	}

	public addButtons() {
		this.bottomButtons = [];
		this.bottomButtons.push({
			label: 'Extent',
			icon: 'fa fa-home',
			month: (new Date()).getMonth(),
			click: () => { this.extent(); }
		});

		this.bottomButtons.push({
			isViewingOptionButton: true,
			click: () => {
				this.showNavigationState = !this.showNavigationState;
			}
		});

		this.bottomButtons.push({
			label: 'Show All',
			click: () => { this.showAll(); }
		});

		this.bottomButtons.push({
			label: 'Hide',
			click: () => { this.hide(); }
		});

		this.bottomButtons.push({
			label: 'Isolate',
			click: () => { this.isolate(); }
		});

		this.clipButton = {
			label: 'Clip',
			editMode: false,
			numClips: 0,
			click: () => {
				this.clipButtonClicked();
			},
			modes : [
				{
					tooltip: 'Start box clip',
					text: 6,
					click: () => {
						this.startClip(false);
					}
				},
				{
					tooltip: 'Start single clip',
					text: 1,
					click: () => {
						this.startClip(true);
					}
				}
			]
		};
		this.bottomButtons.push(this.clipButton);

		this.bottomButtons.push({
			label: 'Focus',
			click: () => { this.focusMode(); }
		});
	}

	public extent() {
		this.ViewerService.goToExtent();
	}

	public setNavigationMode(mode) {

		if (mode !== undefined) {
			// Set the viewing mode
			this.selectedMode = mode;
			this.ViewerService.setNavMode(this.navigationState.MODES[mode].mode);
			this.showNavigationState = false;
		}

	}

	public showAll() {
		this.TreeService.showAllTreeNodes(true);
	}

	public hide() {
		this.TreeService.hideSelected();
	}

	public isolate() {
		this.TreeService.isolateSelected();
	}

	public focusMode() {

		this.isFocusMode = !this.isFocusMode;
		this.setFocusModeButtonVisibility();

	}

	public getAllElementHolder(): any {
		return document.getElementsByClassName('homeHolder')[0];
	}

	public setFocusModeButtonVisibility() {
		if (this.isFocusMode) {
			this.escapeFocusModeButton.style.display = 'initial';
		} else {
			this.escapeFocusModeButton.style.display = 'none';
		}
		const allElementsHolder = this.getAllElementHolder();
		allElementsHolder.style.visibility = (this.isFocusMode) ? 'hidden' : 'visible';
	}

	private clipButtonClicked() {
		if (this.clipButton.editMode) {
			// We're currently in edit mode, toggle it off
			this.disableClipEdit();
		} else {
			if (this.clipButton.numClips) {
				this.enableClipEdit();
			} else {
				// toggle panel
				this.clipButton.showPanel = !this.clipButton.showPanel;
			}
		}

	}

	private startClip(isSingle) {
		if (isSingle) {
			this.ViewerService.startSingleClip();
		} else {
			this.ViewerService.startBoxClip();
		}
		this.clipButton.showPanel = false;
		this.enableClipEdit();
	}

	private enableClipEdit() {
		this.clipButton.editMode = true;
		this.clipButton.background = '#FF9800'; // FIXME: This should really be a constant with highlight colour
		this.ViewerService.startClipEdit();
	}

	private disableClipEdit() {
		this.clipButton.editMode = false;
		delete this.clipButton.background;
		this.ViewerService.stopClipEdit();
	}

}

export const BottomButtonsComponent: ng.IComponentOptions = {
	bindings: {},
	controller: BottomButtonsController,
	controllerAs: 'vm',
	templateUrl: 'templates/bottom-buttons.html'
};

export const BottomButtonsComponentModule = angular
	.module('3drepo')
	.component('bottomButtons', BottomButtonsComponent);
