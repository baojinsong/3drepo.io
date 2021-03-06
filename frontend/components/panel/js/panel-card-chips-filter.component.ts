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

export interface IChip {
	name: string;
	nameType: string;
	value: any;
	type: string;
}

class PanelCardChipsFilterController implements ng.IController {
	public static $inject: string[] = [
		'$mdDateLocale',
		'$mdConstant',
		'$scope',
		'$element'
	];

	public suggestions: IChip[] = [];
	public chips: IChip[] = [];
	public collapsed: boolean = false;

	private selectedItem: any = null;
	private searchText: string = null;
	private chipSeparators: any[];
	private placeHolder: string = 'Search';

	constructor(private $mdDateLocale: any, private $mdConstant: any, private $scope: ng.IScope, private $element: any) {
		this.chipSeparators = [$mdConstant.KEY_CODE.ENTER, $mdConstant.KEY_CODE.COMMA];
		this.watchers();
	}

	public $onInit() {
		this.chips = [];
	}

	public watchers() {
		this.$scope.$watch('vm.showFilter', (newValue) => {
			if (newValue) {
				const filterInput: any = angular.element(this.$element[0].querySelector('#panelCardFilterInput'));
				filterInput.value = '';

				this.collapsed = false;
			}
		});
	}

	private transformChip(chip): IChip {
		// If it is an object, it's already a known chip
		if (angular.isObject(chip)) {
			return chip;
		}

		// Otherwise, create a new one
		return { name: chip, value: chip, nameType: '', type: '' };
	}

	private formatChip(chip) {
		return  chip.nameType.trim() + (chip.nameType.trim() === '' ? '' : ':' ) + chip.name.trim();
	}

	private onPaste(event: ClipboardEvent) {
		const pastedText = event.clipboardData.getData('text');
		event.preventDefault();

		const newchips = pastedText.split(',').map((c) => {
			if (c.includes(':')) {
				const suggestion = this.suggestions.find(this.equalChipLabel.bind(this , c));

				if (suggestion) {
					return suggestion;
				}

				// if its not a suggestion it tries to guess if its a date type
				const name = c.split(':')[1];
				const value: Date = this.$mdDateLocale.parseDate(name);

				if (  !isNaN( value.getTime())) { // If it is a date
					const nameType = c.split(':')[0].trim();
					const type = this.snakeCase(nameType);
					return  {name, nameType, type, value};
				}
				return null;
			}

			return this.transformChip(c);
		}).filter((c) => c); // filters out the undefined

		this.chips = newchips;
	}

	private snakeCase(pascalCase: string): string {
		return pascalCase.replace(/[A-Z]/g, (x) => '_' + x.toLowerCase()).substring(1);
	}

	private equalChipLabel( label: string, chip: IChip): boolean {
		return this.formatChip(chip) === label;
	}

	private querySearch(query: string): IChip[] {
		const results = query ? (this.suggestions || []).filter( this.matchAutocomplete.bind(this, query)) : [];
		return results;
	}

	/**
	 * Filter the suggestion
	 */
	private matchAutocomplete(query: string, suggestion: IChip): boolean {
		const l = angular.lowercase;
		const lowercaseQuery = l(query);
		return (l(suggestion.name).indexOf(lowercaseQuery) === 0) ||
				(l(suggestion.nameType).indexOf(lowercaseQuery) === 0);
	}
}

export const PanelCardChipsFilterComponent: ng.IComponentOptions = {
	bindings: {
		chips: '=',
		suggestions: '=',
		placeHolder: '@',
		showFilter: '='
	},

	controller: PanelCardChipsFilterController,
	controllerAs: 'vm',
	templateUrl: 'templates/panel-card-chips-filter.html'
};

export const PanelCardChipsFilterComponentModule = angular
	.module('3drepo')
	.component('panelCardChipsFilter', PanelCardChipsFilterComponent);
