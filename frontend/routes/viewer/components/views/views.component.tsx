/**
 *  Copyright (C) 2017 3D Repo Ltd
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

import * as React from 'react';
import { isEqual } from 'lodash';

import PhotoCameraIcon from '@material-ui/icons/PhotoCamera';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';
import CancelIcon from '@material-ui/icons/Cancel';
import AddIcon from '@material-ui/icons/Add';

import { renderWhenTrue } from '../../../../helpers/rendering';
import { Viewer } from '../../../../services/viewer/viewer';

import { ViewerPanel } from '../viewerPanel/viewerPanel.component';
import { ViewerPanelFooter, ViewerPanelButton } from '../viewerPanel/viewerPanel.styles';
import { ViewsCountInfo, ViewpointsList, EmptyStateInfo, SearchField, Container } from './views.styles';
import { ViewItem } from './components/viewItem/viewItem.component';
import { IViewpointsComponentState } from '../../../../modules/viewpoints/viewpoints.redux';
import { VIEWER_EVENTS } from '../../../../constants/viewer';

interface IProps {
	isPending: boolean;
	viewpoints: any[];
	newViewpoint: any;
	activeViewpoint: any;
	searchEnabled: boolean;
	searchQuery: string;
	editMode: boolean;
	teamspace: string;
	modelId: string;
	fetchViewpoints: (teamspace, modelId) => void;
	createViewpoint: (teamspace, modelId, view) => void;
	prepareNewViewpoint: (teamspace, modelId, viewName) => void;
	updateViewpoint: (teamspace, modelId, viewId, newName) => void;
	deleteViewpoint: (teamspace, modelId, viewId) => void;
	showViewpoint: (teamspace, modelId, view) => void;
	subscribeOnViewpointChanges: (teamspace, modelId) => void;
	unsubscribeOnViewpointChanges: (teamspace, modelId) => void;
	setState: (componentState: IViewpointsComponentState) => void;
}

export class Views extends React.PureComponent<IProps, any> {
	public state = {
		filteredViewpoints: []
	};

	public containerRef = React.createRef<any>();

	get footerText() {
		const { searchEnabled, viewpoints } = this.props;
		const { filteredViewpoints } = this.state;

		if (searchEnabled) {
			return `${filteredViewpoints.length} views found`;
		}
		return viewpoints.length ? `${viewpoints.length} views displayed` : 'Add new viewpoint';
	}

	public renderSearch = renderWhenTrue(() => (
		<SearchField
			placeholder="Search viewpoint..."
			onChange={this.handleSearchQueryChange}
			autoFocus
			defaultValue={this.props.searchQuery}
			fullWidth
			inputProps={{
				style: {
					padding: 12
				}
			}}
		/>
	));

	public renderNotFound = renderWhenTrue(() => (
		<EmptyStateInfo>No viewpoints matched</EmptyStateInfo>
	));

	public renderNewViewpoint = renderWhenTrue(() => (
		<ViewItem
			viewpoint={this.props.newViewpoint}
			active={true}
			editMode={true}
			onCancelEditMode={this.handleCancelEditMode}
			onSaveEdit={this.handleSave}
			teamspace={this.props.teamspace}
			modelId={this.props.modelId}
			onChangeName={this.handleNewViewpointChange}
		/>
	));

	public renderViewpoints = renderWhenTrue(() => {
		const { editMode, teamspace, modelId, activeViewpoint } = this.props;
		const { filteredViewpoints } = this.state;

		const Viewpoints = filteredViewpoints.map((viewpoint) => {
			const isActive = Boolean(activeViewpoint && activeViewpoint._id === viewpoint._id);
			const viewpointData = isActive && editMode ? activeViewpoint : viewpoint;
			return (
				<ViewItem
					key={viewpoint._id}
					viewpoint={viewpointData}
					onClick={this.handleViewpointItemClick(viewpoint)}
					active={isActive}
					editMode={editMode}
					onCancelEditMode={this.handleCancelEditMode}
					onOpenEditMode={this.handleOpenEditMode}
					onDelete={this.handleDelete(viewpoint._id)}
					teamspace={teamspace}
					modelId={modelId}
					onSaveEdit={this.handleUpdate(viewpoint._id)}
					onChangeName={this.handleActiveViewpointChange}
				/>
			);
		});

		return (
			<ViewpointsList>
				{Viewpoints}
				{this.renderNewViewpoint(this.props.newViewpoint)}
			</ViewpointsList>
		);
	});

	public renderEmptyState = renderWhenTrue(() => (
		<EmptyStateInfo>No viewpoints have been created yet</EmptyStateInfo>
	));

	public componentDidMount() {
		const { viewpoints, fetchViewpoints, subscribeOnViewpointChanges, teamspace, modelId, isPending } = this.props;

		if (!viewpoints.length && !isPending) {
			fetchViewpoints(teamspace, modelId);
		} else {
			this.setFilteredViewpoints();
		}

		subscribeOnViewpointChanges(teamspace, modelId);
		this.toggleViewerEvents();
	}

	public componentDidUpdate(prevProps, prevState) {
		const { viewpoints, searchQuery, newViewpoint, activeViewpoint } = this.props;
		const viewpointsChanged = !isEqual(prevProps.viewpoints, viewpoints);
		const searchQueryChanged = prevProps.searchQuery !== searchQuery;
		if (searchQueryChanged || viewpointsChanged) {
			this.setFilteredViewpoints(() => {
				if (!searchQuery && activeViewpoint) {
					const isSelectedViewpointVisible = prevState.filteredViewpoints.some(({ _id }) => {
						return _id === activeViewpoint;
					});

					if (!isSelectedViewpointVisible) {
						this.resetActiveView();
					}
				}

				if (newViewpoint) {
					const containerRef = this.containerRef.current.containerRef;
					this.resetActiveView();
					this.containerRef.current.containerRef.scrollTo(0, containerRef.scrollHeight + 200);
				}
			});
		}
	}

	public componentWillUnmount() {
		const { teamspace, modelId } = this.props;
		this.props.unsubscribeOnViewpointChanges(teamspace, modelId);
		this.toggleViewerEvents(false);
	}

	public resetActiveView = () => {
		this.props.setState({ activeViewpoint: null, editMode: false });
	}

	public handleActiveViewpointChange = (name) => {
		this.props.setState({ activeViewpoint: { ...this.props.activeViewpoint, name } });
	}

	public handleNewViewpointChange = (name) => {
		this.props.setState({ newViewpoint: { ...this.props.newViewpoint, name }});
	}

	public handleViewpointItemClick = (viewpoint) => () => {
		if (!this.props.editMode) {
			const { teamspace, modelId } = this.props;
			this.props.showViewpoint(teamspace, modelId, viewpoint);
		}
	}

	public toggleViewerEvents = (enabled = true) => {
		const eventHandler = enabled ? 'on' : 'off';
		Viewer[eventHandler](VIEWER_EVENTS.BACKGROUND_SELECTED, this.resetActiveView);
	}

	public handleUpdate = (viewpointId) => (values) => {
		const { teamspace, modelId, updateViewpoint } = this.props;
		updateViewpoint(teamspace, modelId, viewpointId, values.newName);
	}

	public handleSave = ({ newName }) => {
		const { teamspace, modelId, createViewpoint, newViewpoint } = this.props;
		newViewpoint.name = newName;
		createViewpoint(teamspace, modelId, newViewpoint);
	}

	public handleAddViewpoint = () => {
		const { teamspace, modelId, prepareNewViewpoint, viewpoints } = this.props;
		prepareNewViewpoint(teamspace, modelId, `View ${viewpoints.length + 1}`);
	}

	public handleOpenEditMode = () => this.props.setState({ editMode: true });

	public handleCancelEditMode = () => {
		this.props.setState({
			editMode: false,
			newViewpoint: null
		});
	}

	public handleOpenSearchMode = () => this.props.setState({ searchEnabled: true });

	public handleCloseSearchMode = () =>
		this.props.setState({
			searchEnabled: false,
			searchQuery: ''
		})

	public handleDelete = (viewpointId) => (event) => {
		event.stopPropagation();
		const { teamspace, modelId } = this.props;
		this.props.deleteViewpoint(teamspace, modelId, viewpointId);
	}

	public handleSearchQueryChange = (event) => {
		const searchQuery = event.currentTarget.value.toLowerCase();
		this.props.setState({ searchQuery });
	}

	public setFilteredViewpoints = (onSave = () => {}) => {
		const { viewpoints, searchQuery, searchEnabled } = this.props;
		const filteredViewpoints = searchEnabled ? viewpoints.filter(({ name }) => {
			return name.toLowerCase().includes(searchQuery.toLowerCase());
		}) : viewpoints;

		this.setState({ filteredViewpoints }, onSave);
	}

	public getTitleIcon = () => <PhotoCameraIcon />;

	public getSearchButton = () => {
		if (this.props.searchEnabled) {
			return <IconButton onClick={this.handleCloseSearchMode}><CancelIcon /></IconButton>;
		}
		return <IconButton onClick={this.handleOpenSearchMode}><SearchIcon /></IconButton>;
	}

	public renderFooterContent = () => (
		<ViewerPanelFooter alignItems="center">
			<ViewsCountInfo>{this.footerText}</ViewsCountInfo>
			<ViewerPanelButton
				aria-label="Add view"
				onClick={this.handleAddViewpoint}
				disabled={!!this.props.newViewpoint}
				color="secondary"
				variant="fab"
			>
				<AddIcon />
			</ViewerPanelButton>
		</ViewerPanelFooter>
	)

	public render() {
		const { searchEnabled, viewpoints, newViewpoint } = this.props;
		const hasViewpoints = Boolean(viewpoints.length);
		const { filteredViewpoints } = this.state;

		return (
			<ViewerPanel
				title="Views"
				Icon={this.getTitleIcon()}
				renderActions={this.getSearchButton}
				pending={this.props.isPending}
			>
				<Container className="height-catcher" innerRef={this.containerRef}>
					{this.renderEmptyState(!hasViewpoints && !searchEnabled && !newViewpoint)}
					{this.renderSearch(searchEnabled)}
					{this.renderNotFound(searchEnabled && !filteredViewpoints.length)}
					{this.renderViewpoints(hasViewpoints || this.props.newViewpoint)}
				</Container>
				{this.renderFooterContent()}
			</ViewerPanel>
		);
	}
}
