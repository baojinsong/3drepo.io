/**
 *  Copyright (C) 2018 3D Repo Ltd
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
import { APIService } from "../../home/js/api.service";
import { AuthService } from "../../home/js/auth.service";
import { ClipService } from "../../clip/js/clip.service";
import { IChip } from "../../panel/js/panel-card-chips-filter.component";
import { PanelService } from "../../panel/js/panel.service";
import { TreeService } from "../../tree/js/tree.service";
import { ViewerService } from "../../viewer/js/viewer.service";

declare const Pin;

export class RisksService {

	public static $inject: string[] = [
		"$q",
		"$sanitize",
		"$timeout",
		"$filter",

		"ClientConfigService",
		"APIService",
		"TreeService",
		"AuthService",
		"ClipService",
		"ViewerService",
		"PanelService"
	];

	public state: any;
	private groupsCache: any;

	constructor(
		private $q,
		private $sanitize,
		private $timeout,
		private $filter,

		private clientConfigService: any,
		private apiService: APIService,
		private treeService: TreeService,
		private authService: AuthService,
		private clipService: ClipService,
		private viewerService: ViewerService,
		private panelService: PanelService
	) {
		this.reset();
	}

	public reset() {
		this.groupsCache = {};
		this.state = {
			heights : {
				infoHeight : 135,
				risksListItemHeight : 141
			},
			selectedRisk: null,
			allRisks: [],
			risksToShow: [],
			risksCardOptions: {
				showSubModelRisks: false,
				showPins: true,
				sortOldestFirst : false
			},
			availableJobs : [],
			allJobs: [],
			modelUserJob: null
		};
		this.removeUnsavedPin();
	}

	public getRisksAndJobs(account: string, model: string, revision: string) {
		return Promise.all([
			this.getUserJobForModel(account, model),
			this.getRisksData(account, model, revision),
			this.getTeamspaceJobs(account, model)
		]);
	}

	public getRisksData(account: string, model: string, revision: string) {
		return this.getRisks(account, model, revision)
			.then((risks) => {
				if (risks) {
					risks.forEach(this.populateRisk.bind(this));
					this.state.allRisks = risks;

					const newJobs: any = {};
					risks.forEach((i) => {
						if (i.creator_role) {
							newJobs[i.creator_role] = true;
						}

						i.assigned_roles.forEach( (r) => newJobs[r] = true);
					});

					const jobs = Object.keys(newJobs).map( (j) => ({_id : j }));
					this.addJobsToAllJobs(jobs);
				} else {
					throw new Error("Error");
				}

			});

	}

	public getTeamspaceJobs(account: string, model: string): Promise<any[]> {
		const url = account + "/jobs";

		return this.apiService.get(url)
			.then((response) => {
				this.state.availableJobs = response.data;
				this.addJobsToAllJobs(response.data);
				return this.state.availableJobs;
			});
	}

	public addJobsToAllJobs(jobs: any[]) {
		const newJobs = jobs.filter((r) => !this.state.allJobs.find( (j) => j._id === r._id ));
		this.state.allJobs = this.state.allJobs.concat(newJobs).sort( (a, b) => a._id > b._id ? 1 : -1);

		const menuChips =  this.state.allJobs.map((role) => ({
			value: role._id,
			label: role._id
		}));

		const assignedMenu = menuChips.concat([{value: null, label: "Unassigned"}]);

		this.panelService.setChipFilterMenuItem("risks", {label: "Created by", value: "creator_role"}, menuChips);
		this.panelService.setChipFilterMenuItem("risks", {label: "Assigned to", value: "assigned_roles"}, assignedMenu);
	}

	public getUserJobForModel(account: string, model: string): Promise<any> {
		const url = account + "/myJob";

		return this.apiService.get(url)
			.then((response) => {
				this.state.modelUserJob = response.data;
				return this.state.modelUserJob;
			});
	}

	public createBlankRisk(creatorRole) {
		return {
			creator_role: creatorRole,
			associated_activity: "",
			category: "",
			likelihood: 0,
			consequence: 0,
			level_of_risk: 0,
			mitigation_status: "",
			assigned_roles: [],
			topic_type: "for_information",
			viewpoint: {}
		};
	}

	// Helper for searching strings
	public stringSearch(superString, subString) {
		if (!superString) {
			return false;
		}

		return (superString.toLowerCase().indexOf(subString.toLowerCase()) !== -1);
	}

	public setupRisksToShow(model: string, chips: IChip[]) {
		this.state.risksToShow = [];

		if (this.state.allRisks.length > 0) {
			const filteredRisks = this.filterRisks(model, this.state.allRisks, chips) ;
			const sortOldest = this.state.risksCardOptions.sortOldestFirst;
			filteredRisks.sort((a, b) => {
				return sortOldest ? a.created - b.created : b.created - a.created;
			});
			this.state.risksToShow = filteredRisks;
		}
	}

	public filterRisks(model: string, risks: any[], chips: IChip[]): any[] {
		let filters = [];
		const criteria = this.getCriteria(chips);

		if (!criteria.mitigation_status) { // If there is no explicit filter for status dont show closed risks
									// thats the general criteria for showing risks.
			filters.push((risk) => risk.mitigation_status !== "accepted");
		}

		filters = filters.concat(this.getOrClause(criteria[""], this.handleRiskFilter));

		filters = filters.concat(this.createFilterByField(criteria, "associated_activity"));

		filters = filters.concat(this.createFilterByField(criteria, "creator_role"));

		filters = filters.concat(this.createFilterByField(criteria, "mitigation_status"));

		filters = filters.concat(this.getOrClause(criteria.assigned_roles, this.filterAssignedRoles));

		filters = filters.concat(this.createFilterByField(criteria, "category"));

		filters = filters.concat(this.createFilterByField(criteria, "likelihood"));

		filters = filters.concat(this.createFilterByField(criteria, "consequence"));

		filters = filters.concat(this.createFilterByField(criteria, "level_of_risk"));

		if (!this.state.risksCardOptions.showSubModelRisks) {
			filters.push((risk) => risk.model === model);
		}

		// if (criteria.date_from) {
			// filters.push((issue) => issue.created >= criteria.date_from[0].getTime());
		// }

		// if (criteria.date_to) {
			//  86399000 is 23:59:59 in milliseconds
			// filters.push((issue) => issue.created <= criteria.date_to[0].getTime() + 86399000 );
		// }

		// It filters the risk list by applying every filter to it.
		const filteredRisks = risks.filter((risk) => filters.every((f) => f(risk)));
		return filteredRisks;
	}

	public createFilterByField(criteria: any, field: string) {
		return this.getOrClause(criteria[field], this.filterByField.bind(this, field));
	}

	public getCriteria(chips: IChip[]): any {
		const initialValue = {};

		return  chips.reduce((object, currVal) => {
			if (!object[currVal.type]) {
				object[currVal.type] = [];
			}

			object[currVal.type].push(currVal.value);
			return object;
		}, initialValue);
	}

	/** filters */

	public getAndClause(tags: any[], comparator) {
		if ((tags || []).length === 0) {
			return[];
		}
		return [(value, index, array) => tags.every( comparator.bind(this, value) )];
	}

	public getOrClause(tags: any[], comparator) {
		if ((tags || []).length === 0) {
			return[];
		}

		return [(value, index, array) => tags.some( comparator.bind(this, value) )];
	}

	public filterByField(field, risk, tag): boolean {
		if (Array.isArray(risk[field])) {
			return risk[field].indexOf(tag) >= 0;
		}

		return risk[field] === tag;
	}

	public filterAssignedRoles(risk, tag): boolean {
		if (!tag) {
			return risk.assigned_roles.length === 0;
		}
		return this.filterByField("assigned_roles", risk, tag);
	}

	public handleRiskFilter(risk: any, filterText: string) {
		// Required custom filter due to the fact that Angular
		// does not allow compound OR filters

		// Exit the function as soon as we found a match.

		// Search the title and desc
		if (this.stringSearch(risk.title, filterText) ||
			this.stringSearch(risk.desc, filterText)) {
			return true;
		}

		// Search the list of assigned risks
		if (risk.hasOwnProperty("assigned_roles")) {
			for (let roleIdx = 0; roleIdx < risk.assigned_roles.length; ++roleIdx) {
				if (this.stringSearch(risk.assigned_roles[roleIdx], filterText)) {
					return true;
				}
			}
		}

		return false;

	}

	public resetSelectedRisk() {
		this.state.selectedRisk = undefined;
	}

	public isSelectedRisk(risk) {
		if (!this.state.selectedRisk || !this.state.selectedRisk._id) {
			return false;
		} else {
			return risk._id === this.state.selectedRisk._id;
		}
	}

	public calculateLevelOfRisk(likelihood: string, consequence: string): number {
		let levelOfRisk = 0;

		if (likelihood && consequence) {
			const likelihoodConsequenceScore: number = parseInt(likelihood, 10) + parseInt(consequence, 10);

			if (6 < likelihoodConsequenceScore) {
				levelOfRisk = 4;
			} else if (5 < likelihoodConsequenceScore) {
				levelOfRisk = 3;
			} else if (2 < likelihoodConsequenceScore) {
				levelOfRisk = 2;
			} else if (1 < likelihoodConsequenceScore) {
				levelOfRisk = 1;
			} else {
				levelOfRisk = 0;
			}
		}

		return levelOfRisk;
	}

	public showRiskPins() {

		// TODO: This is still inefficent and unclean
		this.state.allRisks.forEach((risk) => {
			const show = this.state.risksToShow.find((shownRisk) => {
				return risk._id === shownRisk._id;
			});

			// Check that there is a position for the pin
			const pinPosition = risk.position && risk.position.length;

			if (this.state.risksCardOptions.showPins && show !== undefined && pinPosition) {

				const levelOfRisk = (risk.level_of_risk !== undefined) ? risk.level_of_risk : 4;
				const levelOfRiskColors = {
					4: {
						pinColor: Pin.pinColours.maroon,
						selectedColor: Pin.pinColours.red
					},
					3: {
						pinColor: Pin.pinColours.darkOrange,
						selectedColor: Pin.pinColours.orange
					},
					2: {
						pinColor: Pin.pinColours.lemonChiffon,
						selectedColor: Pin.pinColours.lightYellow
					},
					1: {
						pinColor: Pin.pinColours.limeGreen,
						selectedColor: Pin.pinColours.lightGreen
					},
					0: {
						pinColor: Pin.pinColours.green,
						selectedColor: Pin.pinColours.medSeaGreen
					}
				};

				const isSelectedPin = this.state.selectedRisk &&
									risk._id === this.state.selectedRisk._id;

				const pinColor = (isSelectedPin) ?
					levelOfRiskColors[levelOfRisk].selectedColor :
					levelOfRiskColors[levelOfRisk].pinColor;

				this.viewerService.addPin({
					id: risk._id,
					type: "risk",
					account: risk.account,
					model: risk.model,
					pickedPos: risk.position,
					pickedNorm: risk.norm,
					colours: pinColor,
					viewpoint: risk.viewpoint
				});

			} else {
				// Remove pin
				this.viewerService.removePin({ id: risk._id });
			}
		});

	}

	public setSelectedRisk(risk, isCorrectState, revision) {

		if (this.state.selectedRisk) {
			const different = (this.state.selectedRisk._id !== risk._id);
			if (different) {
				this.deselectPin(this.state.selectedRisk);
			}
		}

		this.state.selectedRisk = risk;

		// If we're saving then we already have pin and
		// highlights in place
		if (!isCorrectState) {
			this.showRiskPins();
			this.showRisk(risk, revision);
		}

	}

	public addRisk(risk) {
		this.populateRisk(risk);
		this.state.allRisks.unshift(risk);
	}

	public updateRisks(risk) {

		this.populateRisk(risk);

		this.state.allRisks.forEach((oldRisk, i) => {
			const matches = oldRisk._id === risk._id;
			if (matches) {

				if (risk.status === "closed") {

					this.state.allRisks[i].justClosed = true;

					this.$timeout(() => {

						this.state.allRisks[i] = risk;

					}, 4000);

				} else {
					this.state.allRisks[i] = risk;
				}

			}
		});
	}

	public deleteSelectedRisk(teamspace: string, model: string) {
		return this.deleteRisks(teamspace, model, [this.state.selectedRisk]);
	}

	public deleteRisks(teamspace: string, model: string, risks: any) {
		if (risks.length > 0) {
			const url = `${teamspace}/${model}/risks/?ids=${risks.map((risk) => risk._id).join(",")}`;
			return this.apiService.delete(url, undefined)
				.then((response) => {
					risks.forEach(this.deleteRiskFromState.bind(this));
					return response;
				});
		} else {
			return Promise.resolve();
		}
	}

	/**
	 * Remove a risk from the data model
	 * @param risk the risk to delete
	 */
	public deleteRiskFromState(risk: any) {
		const riskIndex = this.state.allRisks.indexOf(risk);
		const risksCount = this.state.allRisks.length;

		this.state.allRisks = this.state.allRisks.filter((r) => {
			return risk._id !== r._id;
		});
	}

	public populateRisk(risk) {

		if (risk) {
			risk.statusIcon = this.getStatusIcon(risk);

			if (risk.thumbnail) {
				risk.thumbnailPath = this.getThumbnailPath(risk.thumbnail);
			}

			if (risk.due_date) {
				risk.due_date = new Date(risk.due_date);
			}
			if (risk.assigned_roles[0]) {
				risk.roleColor = this.getJobColor(risk.assigned_roles[0]);
			}

			if (!risk.descriptionThumbnail) {
				if (risk.viewpoint && risk.viewpoint.screenshotSmall && risk.viewpoint.screenshotSmall !== "undefined") {
					risk.descriptionThumbnail = this.apiService.getAPIUrl(risk.viewpoint.screenshotSmall);
				}
			}
		}
	}

	public userJobMatchesCreator(userJob, riskData) {
		return (userJob._id &&
			riskData.creator_role &&
			userJob._id === riskData.creator_role);
	}

	public isViewer(permissions) {
		return permissions && !this.authService.hasPermission(
			this.clientConfigService.permissions.PERM_COMMENT_ISSUE,
			permissions
		);
	}

	public isAssignedJob(riskData, userJob, permissions) {
		return riskData && userJob &&
			(userJob._id &&
				riskData.assigned_roles[0] &&
				userJob._id === riskData.assigned_roles[0]) &&
				!this.isViewer(permissions);
	}

	public isAdmin(permissions) {
		return permissions && this.authService.hasPermission(
			this.clientConfigService.permissions.PERM_MANAGE_MODEL_PERMISSION,
			permissions
		);
	}

	public isJobOwner(riskData, userJob, permissions) {
		return riskData && userJob &&
			(riskData.owner === this.authService.getUsername() ||
			this.userJobMatchesCreator(userJob, riskData)) &&
			!this.isViewer(permissions);
	}

	public canChangeStatusToClosed(riskData, userJob, permissions) {
		return this.isAdmin(permissions) || this.isJobOwner(riskData, userJob, permissions);
	}

	public canUpdateRisk(riskData, userJob, permissions) {
		return this.canChangeStatusToClosed(riskData, userJob, permissions) ||
			this.isAssignedJob(riskData, userJob, permissions);
	}

	public canSubmitUpdateRisk(riskData, userJob, permissions) {
		return this.canUpdateRisk(riskData, userJob, permissions);
	}

	public deselectPin(risk) {
		// Risk with position means pin
		if (risk.position && risk.position.length > 0 && risk._id) {
			this.viewerService.changePinColours({
				id: risk._id,
				colours: Pin.pinColours.blue
			});
		}
	}

	public showRisk(risk, revision) {

		this.showRiskPins();

		// Remove highlight from any multi objects
		this.viewerService.highlightObjects([]);
		this.treeService.clearCurrentlySelected();

		// Reset object visibility
		if (risk.viewpoint && risk.viewpoint.hasOwnProperty("hideIfc")) {
			this.treeService.setHideIfc(risk.viewpoint.hideIfc);
		}

		this.treeService.showAllTreeNodes(false);

		// Show multi objects
		if ((risk.viewpoint && (risk.viewpoint.hasOwnProperty("highlighted_group_id") ||
						risk.viewpoint.hasOwnProperty("hidden_group_id") ||
						risk.viewpoint.hasOwnProperty("shown_group_id") ||
						risk.viewpoint.hasOwnProperty("group_id"))) ||
				risk.hasOwnProperty("group_id")) {

			this.showMultiIds(risk, revision).then(() => {
				this.handleShowRisk(risk);
			});

		} else {
			this.handleShowRisk(risk);
		}

	}

	public handleCameraView(risk) {
		// Set the camera position
		const riskData = {
			position : risk.viewpoint.position,
			view_dir : risk.viewpoint.view_dir,
			look_at : risk.viewpoint.look_at,
			up: risk.viewpoint.up,
			account: risk.account,
			model: risk.model
		};

		this.viewerService.setCamera(riskData);

	}

	public handleShowRisk(risk) {

		if (risk && risk.viewpoint ) {

			if (risk.viewpoint.position && risk.viewpoint.position.length > 0) {
				this.handleCameraView(risk);
			}

			const riskData = {
				clippingPlanes: risk.viewpoint.clippingPlanes,
				fromClipPanel: false,
				account: risk.account,
				model: risk.model
			};

			this.clipService.updateClippingPlane(riskData);

		} else {
			// This risk does not have a viewpoint, go to default viewpoint
			this.viewerService.goToExtent();
		}

		this.treeService.onReady().then(() => {
			this.treeService.updateModelVisibility(this.treeService.allNodes[0]);
		});

	}

	public showMultiIds(risk, revision) {

		const promises = [];

		if (risk.viewpoint && (risk.viewpoint.hasOwnProperty("highlighted_group_id") ||
					risk.viewpoint.hasOwnProperty("hidden_group_id") ||
					risk.viewpoint.hasOwnProperty("shown_group_id"))) {

			if (risk.viewpoint.hidden_group_id) {

				const hiddenGroupId = risk.viewpoint.hidden_group_id;
				let hiddenGroupUrl;
				if (revision) {
					hiddenGroupUrl = `${risk.account}/${risk.model}/groups/revision/${revision}/${hiddenGroupId}`;
				} else {
					hiddenGroupUrl = `${risk.account}/${risk.model}/groups/revision/master/head/${hiddenGroupId}`;
				}

				let hiddenPromise;

				if (this.groupsCache[hiddenGroupUrl]) {
					hiddenPromise = this.handleHidden(this.groupsCache[hiddenGroupUrl]);
				} else {

					hiddenPromise = this.apiService.get(hiddenGroupUrl)
						.then((response) => {
							this.groupsCache[hiddenGroupUrl] = response.data.objects;
							return this.handleHidden(response.data.objects);
						})
						.catch((error) => {
							console.error("There was a problem getting visibility: ", error);
						});

				}

				promises.push(hiddenPromise);

			}

			if (risk.viewpoint.shown_group_id) {

				const shownGroupId = risk.viewpoint.shown_group_id;
				let shownGroupUrl;
				if (revision) {
					shownGroupUrl = risk.account + "/" + risk.model + "/groups/revision/" + revision + "/" + shownGroupId;
				} else {
					shownGroupUrl = risk.account + "/" + risk.model + "/groups/revision/master/head/" + shownGroupId;
				}

				let shownPromise;

				if (this.groupsCache[shownGroupUrl]) {
					shownPromise = this.handleShown(this.groupsCache[shownGroupUrl]);
				} else {

					shownPromise = this.apiService.get(shownGroupUrl)
						.then( (response) => {
							this.groupsCache[shownGroupUrl] = response.data.objects;
							return this.handleShown(response.data.objects);
						})
						.catch((error) => {
							console.error("There was a problem getting visibility: ", error);
						});
				}

				promises.push(shownPromise);
			}

			if (risk.viewpoint.highlighted_group_id) {

				const highlightedGroupId = risk.viewpoint.highlighted_group_id;
				let highlightedGroupUrl;
				if (revision) {
					highlightedGroupUrl = `${risk.account}/${risk.model}/groups/revision/${revision}/${highlightedGroupId}`;
				} else {
					highlightedGroupUrl = `${risk.account}/${risk.model}/groups/revision/master/head/${highlightedGroupId}`;
				}

				let highlightPromise;

				if (this.groupsCache[highlightedGroupUrl]) {
					highlightPromise = this.handleHighlights(this.groupsCache[highlightedGroupUrl]);
				} else {

					highlightPromise = this.apiService.get(highlightedGroupUrl)
						.then((response) => {
							this.groupsCache[highlightedGroupUrl] = response.data.objects;
							return this.handleHighlights(response.data.objects);
						})
						.catch((error) => {
							console.error("There was a problem getting the highlights: ", error);
						});

				}

				promises.push(highlightPromise);
			}

		} else {

			const hasGroup = (risk.viewpoint && risk.viewpoint.hasOwnProperty("group_id"));
			const groupId = hasGroup ? risk.viewpoint.group_id : risk.group_id;
			let groupUrl;
			if (revision) {
				groupUrl = risk.account + "/" + risk.model + "/groups/revision/" + revision + "/" + groupId;
			} else {
				groupUrl = risk.account + "/" + risk.model + "/groups/revision/master/head/" + groupId;
			}

			let handleTreePromise;

			if (this.groupsCache[groupUrl]) {
				handleTreePromise = this.handleTree(this.groupsCache[groupUrl]);
			} else {

				handleTreePromise = this.apiService.get(groupUrl)
					.then((response) => {
						if (response.data.hiddenObjects && response.data.hiddenObjects && !risk.viewpoint.hasOwnProperty("group_id")) {
							response.data.hiddenObjects = null;
						}
						this.groupsCache[groupId] = response;
						return this.handleTree(response);
					})
					.catch((error) => {
						console.error("There was a problem getting the highlights: ", error);
					});

			}

			promises.push(handleTreePromise);

		}

		return Promise.all(promises);

	}

	public handleHighlights(objects) {
		this.treeService.selectedIndex = undefined; // To force a watcher reset (if its the same object)
		this.$timeout(() => {
		this.treeService.selectNodesBySharedIds(objects)
			.then(() => {
				angular.element((window as any)).triggerHandler("resize");
			});
		});
	}

	public handleHidden(objects) {
		this.treeService.hideNodesBySharedIds(objects);
	}

	public handleShown(objects) {
		this.treeService.isolateNodesBySharedIds(objects);
	}

	public handleTree(response) {

		if (response.data.hiddenObjects) {
			this.handleHidden(response.data.hiddenObjects);
		}

		if (response.data.shownObjects) {
			this.handleShown(response.data.shownObjects);
		}

		if (response.data.objects && response.data.objects.length > 0) {
			this.handleHighlights(response.data.objects);
		}

	}

	public getThumbnailPath(thumbnailUrl) {
		return this.apiService.getAPIUrl(thumbnailUrl);
	}

	public getRisk(account, model, riskId) {

		const riskUrl = account + "/" + model + "/risks/" + riskId + ".json";

		return this.apiService.get(riskUrl)
			.then((res) => {
				return res.data;
			});

	}

	public getRisks(account, model, revision) {

		let endpoint;
		if (revision) {
			endpoint = account + "/" + model + "/revision/" + revision + "/risks.json";
		} else {
			endpoint = account + "/" + model + "/risks.json";
		}

		return this.apiService.get(endpoint)
			.then((response) => {
				const risksData = response.data;
				for (let i = 0; i < response.data.length; i ++) {
					this.populateRisk(risksData[i]);
				}
				return response.data;
			});
	}

	public saveRisk(risk) {

		// TODO save risk
		let saveUrl;
		const base = risk.account + "/" + risk.model;
		if (risk.rev_id) {
			saveUrl = base + "/revision/" + risk.rev_id + "/risks.json";
		} else {
			saveUrl = base + "/risks.json";
		}

		const config = {withCredentials: true};

		if (risk.pickedPos !== null) {
			risk.position = risk.pickedPos;
			risk.norm = risk.pickedNorm;
		}

		return this.apiService.post(saveUrl, risk, config);

	}

	/**
	 * Update risk
	 * @param risk
	 * @param riskData
	 * @returns {*}
	 */
	public updateRisk(risk, riskData) {
		return this.doPut(risk, riskData);
	}

	/**
	 * Handle PUT requests
	 * @param risk
	 * @param putData
	 * @returns {*}
	 */
	public doPut(risk, putData) {

		let endpoint = risk.account + "/" + risk.model;

		// TODO put risk
		if (risk.rev_id) {
			endpoint += "/revision/" + risk.rev_id + "/risks/" +  risk._id + ".json";
		} else {
			endpoint += "/risks/" + risk._id + ".json";
		}

		return this.apiService.put(endpoint, putData);

	}

	public getJobColor(id) {
		let roleColor = "#ffffff";
		let found = false;
		if (id && this.state.availableJobs) {
			for (let i = 0; i <  this.state.availableJobs.length; i ++) {
				const job =  this.state.availableJobs[i];
				if (job._id === id && job.color) {
					roleColor = job.color;
					found = true;
					break;
				}
			}
		}
		if (!found) {
			console.debug("Job color not found for", id);
		}
		return roleColor;
	}

	/**
	 * Set the status icon style and colour
	 */
	public getStatusIcon(risk) {

		const statusIcon: any = {};

		switch (risk.level_of_risk) {
			case 0:
				statusIcon.colour = "#dc143c";
				break;
			case 1:
				statusIcon.colour = "#32cd32";
				break;
			case 2:
				statusIcon.colour = "#fffacd";
				break;
			case 3:
				statusIcon.colour = "#ff8c00";
				break;
			case 4:
				statusIcon.colour = "#800000";
				break;
		}

		switch (risk.mitigation_status) {
			case "proposed":
				statusIcon.icon = "panorama_fish_eye";
				break;
			case "approved":
				statusIcon.icon = "lens";
				break;
			case "accepted":
				statusIcon.icon = "adjust";
				break;
			case "":
				statusIcon.icon = "check_circle";
				statusIcon.colour = "#0C2F54";
				break;
		}

		return statusIcon;
	}

	public removeUnsavedPin() {
		this.viewerService.removePin({id: this.viewerService.newPinId });
		this.viewerService.setPin({data: null});
	}

	/**
	 * Returns true if model loaded.
	 */
	public modelLoaded() {
		return this.viewerService.currentModel.model;
	}

}

export const RisksServiceModule = angular
	.module("3drepo")
	.service("RisksService", RisksService);
