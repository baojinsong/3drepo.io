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

import { dispatch, getState, subscribe } from '../../../helpers/migration';
import { selectCurrentUser, CurrentUserActions } from '../../../modules/currentUser';
import { selectRisks, selectRisksMap } from '../../../modules/risks';
import { ModelActions, selectSettings, selectIsPending } from '../../../modules/model';
import { TreeActions } from '../../../modules/tree';
import { ViewpointsActions } from '../../../modules/viewpoints';
import { JobsActions, selectJobs } from '../../../modules/jobs';
import { RisksActions } from '../../../modules/risks';
import { GroupsActions } from '../../../modules/groups';
import { prepareRisk } from '../../../helpers/risks';
import { searchByFilters } from '../../../helpers/searching';
import { VIEWER_EVENTS } from '../../../constants/viewer';

class ModelController implements ng.IController {

	public static $inject: string[] = [
		'$window',
		'$timeout',
		'$scope',
		'$element',
		'$location',
		'$compile',
		'$mdDialog',

		'EventService',
		'TreeService',
		'RevisionsService',
		'AuthService',
		'IssuesService',
		'StateManager',
		'PanelService',
		'ViewerService'
	];

	private issuesCardIndex;
	private pointerEvents;
	private account;
	private model;
	private modelUI;
	private event;
	private branch;
	private revision;
	private settings: any = {};
	private issueId;
	private riskId;
	private treeMap;
	private selectedObjects;
	private initialSelectedObjects;
	private isPending = false;
	private modelSettingsLoaded = false;
	private unsubscribeModelSettingsListener;

	constructor(
		private $window,
		private $timeout,
		private $scope,
		private $element,
		private $location,
		private $compile,
		private $mdDialog,

		private EventService,
		private TreeService,
		private RevisionsService,
		private AuthService,
		private IssuesService,
		private StateManager,
		private PanelService,
		private ViewerService
	) {
	}

	public onModelSettingsChange = (state) => {
		const settings = selectSettings(state);
		const isPending = selectIsPending(state);

		const isPendingChanged = this.isPending !== isPending;
		const settingsChanged = this.settings._id !== settings._id;

		const changes = { isPending } as any;
		if (isPendingChanged && settingsChanged && !isPending && !this.modelSettingsLoaded) {
			changes.settings = settings;
			changes.modelSettingsLoaded = true;
			this.handleModelSettingsChange(settings);
		}

		return changes;
	}

	public $onInit() {
		this.issuesCardIndex = this.PanelService.getCardIndex('issues');
		this.pointerEvents = 'inherit';

		const popStateHandler = (event) => {
			this.StateManager.popStateHandler(event, this.account, this.model);
		};

		const refreshHandler = (event) => {
			return this.StateManager.refreshHandler(event);
		};

		// listen for user clicking the back button
		window.addEventListener('popstate', popStateHandler);
		window.addEventListener('beforeunload', refreshHandler);

		this.$scope.$on('$destroy', () => {
			this.unsubscribeModelSettingsListener();
			this.modelSettingsLoaded = false;
			this.settings = {};
			this.isPending = false;
			window.removeEventListener('beforeunload', refreshHandler);
			window.removeEventListener('popstate', popStateHandler);
			this.ViewerService.off(VIEWER_EVENTS.CLICK_PIN);
			dispatch(TreeActions.stopListenOnSelections());
			dispatch(GroupsActions.resetComponentState());
		});

		this.$timeout(() => {
			// Get the model element
			this.modelUI = angular.element(
				this.$element[0].querySelector('#modelUI')
			);
		});

		const username = selectCurrentUser(getState()).username;
		dispatch(CurrentUserActions.fetchUser(username));
		dispatch(JobsActions.fetchJobs(this.account));
		dispatch(JobsActions.getMyJob(this.account));
		dispatch(TreeActions.startListenOnSelections());
		dispatch(GroupsActions.getFieldNames(this.account, this.model));

		this.ViewerService.on(VIEWER_EVENTS.CLICK_PIN, this.onPinClick);
		this.unsubscribeModelSettingsListener = subscribe(this, this.onModelSettingsChange);

		this.watchers();
	}

	public onPinClick = ({ id }) => {
		const currentState = getState();
		const risksMap = selectRisksMap(currentState);

		if (risksMap[id]) {
			const risks = selectRisks(currentState);
			const jobs = selectJobs(currentState);
			const preparedRisks = risks.map((risk) => prepareRisk(risk, jobs));
			const filteredRisks = searchByFilters(preparedRisks, []);

			dispatch(RisksActions.showDetails(risksMap[id], filteredRisks, this.revision));
			this.PanelService.showPanelsByType('risks');
		}
	}

	public watchers() {

		this.$scope.$watchGroup(['vm.account', 'vm.model'], () => {
			if (this.account && this.model) {
				angular.element(() => {
					this.setupModelInfo();
				});
			}
		});

		this.$scope.$watch('vm.issueId', () => {
			if (this.issueId) {
				// timeout to make sure event is sent after issue panel card is setup
				// assume issue card shown by default
				this.$timeout(() => {
					this.IssuesService.state.displayIssue = this.issueId;
				});
			}
		});

		this.$scope.$watch(this.EventService.currentEvent, (event) => {

			this.event = event;

			if (event.type === this.EventService.EVENT.TOGGLE_ISSUE_AREA_DRAWING) {
				this.pointerEvents = event.value.on ? 'none' : 'inherit';
			}

		});

	}

	public handleModelError() {

		const message = 'The model was either not found, failed to load correctly ' +
		'or you are not authorized to view it. ' +
		' You will now be redirected to the teamspace page.';

		this.$mdDialog.show(
			this.$mdDialog.alert()
				.clickOutsideToClose(true)
				.title('Model Error')
				.textContent(message)
				.ariaLabel('Model Error')
				.ok('OK')
		);

		this.$location.path('/dashboard/teamspaces');
	}

	public setupModelInfo() {
		this.RevisionsService.listAll(this.account, this.model);
		this.loadModelSettings();
	}

	public setSelectedObjects(selectedObjects) {
		this.selectedObjects = selectedObjects;
	}

	public setInitialSelectedObjects(data) {
		this.initialSelectedObjects = data.selectedObjects;
		// Set the value to null so that it will be registered again
		this.$timeout(() => {
			this.initialSelectedObjects = null;
		});
	}

	private loadModel = () => {
		return this.ViewerService.loadViewerModel(
			this.account,
			this.model,
			this.branch,
			this.revision
		).then(() => {
			// IMPORTANT: only load model settings after it has started loading the model
			// loadViewerModel can cancel previous model loads which will kill off old unity promises
			this.ViewerService.updateViewerSettings(this.settings);
		});
	}

	private setupViewer(settings) {
		if (this.riskId) {
			// assume issue card shown by default
			this.PanelService.hidePanelsByType('issues');
			this.PanelService.showPanelsByType('risks');
		}

		this.PanelService.hideSubModels(this.issuesCardIndex, !settings.federate);
		return this.TreeService.init(this.account, this.model, this.branch, this.revision, settings)
			.catch((error) => {
				console.error('Error initialising tree: ', error);
			});
	}

	private handleModelSettingsChange = async (settings) => {
		await this.setupViewer(settings);
		if (!this.ViewerService.currentModel.model) {
			if (this.ViewerService.viewer) {
				try {
					await this.ViewerService.initViewer();
					await this.loadModel();
				} catch (error) {
					console.error('Failed to load model: ', error);
				}
			} else {
				console.error('Failed to locate viewer');
			}
		} else {
			await this.loadModel();
		}
	}

	private loadModelSettings() {
		dispatch(ModelActions.fetchSettings(this.account, this.model));
		dispatch(ViewpointsActions.fetchViewpoints(this.account, this.model));
		dispatch(RisksActions.fetchRisks(this.account, this.model, this.revision));
		dispatch(GroupsActions.fetchGroups(this.account, this.model, this.revision));
	}
}

export const ModelComponent: ng.IComponentOptions = {
	bindings: {
		account: '=',
		branch:  '=',
		issueId: '=',
		riskId: '=',
		model: '=',
		revision: '=',
		state: '=',
		isLiteMode: '='
	},
	controller: ModelController,
	controllerAs: 'vm',
	templateUrl: 'templates/model.html'
};

export const ModelComponentModule = angular
	.module('3drepo')
	.component('model', ModelComponent);
