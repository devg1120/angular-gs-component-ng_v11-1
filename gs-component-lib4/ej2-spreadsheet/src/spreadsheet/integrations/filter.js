/* eslint-disable no-useless-escape */
import { locale, dialog, mouseDown, renderFilterCell, initiateFilterUI } from '../index';
import { reapplyFilter, filterCellKeyDown } from '../index';
import { getFilteredColumn, cMenuBeforeOpen, filterByCellValue, clearFilter, getFilterRange, applySort, getCellPosition } from '../index';
import { filterRangeAlert, filterComplete, beforeFilter, clearAllFilter, getFilteredCollection, sortImport } from '../../workbook/common/event';
import { getRangeIndexes, getCellAddress, updateFilter } from '../../workbook/index';
import { getIndexesFromAddress, getSwapRange, getColumnHeaderText } from '../../workbook/index';
import { getData, getTypeFromFormat, getCell, getCellIndexes, getRangeAddress, getSheet } from '../../workbook/index';
import { getComponent } from '@syncfusion/ej2-base';
import { ExcelFilterBase, beforeFltrcMenuOpen, CheckBoxFilterBase } from '@syncfusion/ej2-grids';
import { beforeCustomFilterOpen, parentsUntil, filterCboxValue } from '@syncfusion/ej2-grids';
import { Button } from '@syncfusion/ej2-buttons';
import { Query, DataManager } from '@syncfusion/ej2-data';
import { beginAction, completeAction, contentLoaded } from '../../spreadsheet/index';
/**
 * `Filter` module is used to handle the filter action in Spreadsheet.
 */
var Filter = /** @class */ (function () {
    /**
     * Constructor for filter module.
     *
     * @param {Spreadsheet} parent - Specifies the Spreadsheet.
     */
    function Filter(parent) {
        this.parent = parent;
        this.filterCollection = new Map();
        this.filterClassList = new Map();
        this.filterRange = new Map();
        this.addEventListener();
    }
    /**
     * To destroy the filter module.
     *
     * @returns {void} - To destroy the filter module.
     */
    Filter.prototype.destroy = function () {
        this.removeEventListener();
        this.filterRange = null;
        this.filterCollection = null;
        this.filterClassList = null;
        this.parent = null;
    };
    Filter.prototype.addEventListener = function () {
        this.parent.on(filterRangeAlert, this.filterRangeAlertHandler, this);
        this.parent.on(initiateFilterUI, this.initiateFilterUIHandler, this);
        this.parent.on(mouseDown, this.filterMouseDownHandler, this);
        this.parent.on(renderFilterCell, this.renderFilterCellHandler, this);
        this.parent.on(clearAllFilter, this.clearAllFilterHandler, this);
        this.parent.on(beforeFltrcMenuOpen, this.beforeFilterMenuOpenHandler, this);
        this.parent.on(beforeCustomFilterOpen, this.beforeCustomFilterOpenHandler, this);
        this.parent.on(reapplyFilter, this.reapplyFilterHandler, this);
        this.parent.on(filterByCellValue, this.filterByCellValueHandler, this);
        this.parent.on(clearFilter, this.clearFilterHandler, this);
        this.parent.on(getFilteredColumn, this.getFilteredColumnHandler, this);
        this.parent.on(cMenuBeforeOpen, this.cMenuBeforeOpenHandler, this);
        this.parent.on(filterCboxValue, this.filterCboxValueHandler, this);
        this.parent.on(getFilterRange, this.getFilterRangeHandler, this);
        this.parent.on(filterCellKeyDown, this.filterCellKeyDownHandler, this);
        this.parent.on(getFilteredCollection, this.getFilteredCollection, this);
        this.parent.on(contentLoaded, this.updateFilter, this);
        this.parent.on(updateFilter, this.updateFilter, this);
    };
    Filter.prototype.removeEventListener = function () {
        if (!this.parent.isDestroyed) {
            this.parent.off(filterRangeAlert, this.filterRangeAlertHandler);
            this.parent.off(initiateFilterUI, this.initiateFilterUIHandler);
            this.parent.off(mouseDown, this.filterMouseDownHandler);
            this.parent.off(renderFilterCell, this.renderFilterCellHandler);
            this.parent.off(clearAllFilter, this.clearAllFilterHandler);
            this.parent.off(beforeFltrcMenuOpen, this.beforeFilterMenuOpenHandler);
            this.parent.off(beforeCustomFilterOpen, this.beforeCustomFilterOpenHandler);
            this.parent.off(reapplyFilter, this.reapplyFilterHandler);
            this.parent.off(filterByCellValue, this.filterByCellValueHandler);
            this.parent.off(clearFilter, this.clearFilterHandler);
            this.parent.off(getFilteredColumn, this.getFilteredColumnHandler);
            this.parent.off(cMenuBeforeOpen, this.cMenuBeforeOpenHandler);
            this.parent.on(filterCboxValue, this.filterCboxValueHandler);
            this.parent.off(getFilterRange, this.getFilterRangeHandler);
            this.parent.off(filterCellKeyDown, this.filterCellKeyDownHandler);
            this.parent.off(getFilteredCollection, this.getFilteredCollection);
            this.parent.off(contentLoaded, this.updateFilter);
            this.parent.off(updateFilter, this.updateFilter);
        }
    };
    /**
     * Gets the module name.
     *
     * @returns {string} - Gets the module name.
     */
    Filter.prototype.getModuleName = function () {
        return 'filter';
    };
    /**
     * Validates the range and returns false when invalid.
     *
     * @param {SheetModel} sheet - Specify the sheet.
     * @param {string} range - Specify the range.
     * @returns {void} - Validates the range and returns false when invalid.
     */
    Filter.prototype.isInValidFilterRange = function (sheet, range) {
        var selectedRange = range ? getSwapRange(getIndexesFromAddress(range)) :
            getSwapRange(getIndexesFromAddress(sheet.selectedRange));
        return selectedRange[0] > sheet.usedRange.rowIndex || selectedRange[1] > sheet.usedRange.colIndex;
    };
    /**
     * Shows the range error alert dialog.
     *
     * @param {any} args - Specifies the args
     * @param {string} args.error - range error string.
     * @returns {void} - Shows the range error alert dialog.
     */
    Filter.prototype.filterRangeAlertHandler = function (args) {
        var _this = this;
        var dialogInst = this.parent.serviceLocator.getService(dialog);
        dialogInst.show({
            content: args.error, isModal: true,
            height: 180, width: 400, showCloseIcon: true,
            beforeOpen: function (args) {
                var dlgArgs = {
                    dialogName: 'FilterRangeDialog',
                    element: args.element, target: args.target, cancel: args.cancel
                };
                _this.parent.trigger('dialogBeforeOpen', dlgArgs);
                if (dlgArgs.cancel) {
                    args.cancel = true;
                }
            }
        });
        this.parent.hideSpinner();
    };
    /**
     * Triggers before filter context menu opened and used to add sorting items.
     *
     * @param {any} args - Specifies the args
     * @param {HTMLElement} args.element - Specify the element
     * @returns {void} - Triggers before filter context menu opened and used to add sorting items.
     */
    Filter.prototype.beforeFilterMenuOpenHandler = function (args) {
        var l10n = this.parent.serviceLocator.getService(locale);
        args.element.classList.add('e-spreadsheet-contextmenu'); // to show sort icons
        var ul = args.element.querySelector('ul');
        this.addMenuItem(ul, l10n.getConstant('SortDescending'), 'e-filter-sortdesc', 'e-sort-desc');
        this.addMenuItem(ul, l10n.getConstant('SortAscending'), 'e-filter-sortasc', 'e-sort-asc');
        args.element.appendChild(ul);
    };
    /**
     * Creates new menu item element
     *
     * @param {Element} ul - Specify the element.
     * @param {string} text - Specify the text.
     * @param {string} className - Specify the className
     * @param {string} iconCss - Specify the iconCss
     * @returns {void} - Creates new menu item element
     */
    Filter.prototype.addMenuItem = function (ul, text, className, iconCss) {
        var li = this.parent.createElement('li', { className: className + ' e-menu-item' });
        li.innerHTML = text;
        li.insertBefore(this.parent.createElement('span', { className: 'e-menu-icon e-icons ' + iconCss }), li.firstChild);
        ul.insertBefore(li, ul.firstChild);
    };
    /**
     * Initiates the filter UI for the selected range.
     *
     * @param {any} args - Specifies the args
     * @param {PredicateModel[]} args.predicates - Specify the predicates.
     * @param {number} args.range - Specify the range.
     * @param {number} args.sIdx - Specify the sIdx
     * @param {boolean} args.isCut - Specify the bool value
     * @returns {void} - Initiates the filter UI for the selected range.
     */
    Filter.prototype.initiateFilterUIHandler = function (args) {
        var _this = this;
        var predicates = args ? args.predicates : null;
        var sheetIdx = args.sIdx;
        if (!sheetIdx && sheetIdx !== 0) {
            sheetIdx = this.parent.activeSheetIndex;
        }
        if (this.filterRange.size > 0 && this.filterRange.has(sheetIdx)) { //disable filter
            this.removeFilter(sheetIdx);
            if (!predicates) {
                return;
            }
        }
        var sheet = getSheet(this.parent, sheetIdx);
        if (this.isInValidFilterRange(sheet, args.range)) {
            var l10n = this.parent.serviceLocator.getService(locale);
            this.filterRangeAlertHandler({ error: l10n.getConstant('FilterOutOfRangeError') });
            return;
        }
        var selectedRange = sheet.selectedRange;
        var rangeIdx = getRangeIndexes(selectedRange);
        if (rangeIdx[0] === rangeIdx[2] && rangeIdx[1] === rangeIdx[3]) {
            rangeIdx[0] = 0;
            rangeIdx[1] = 0;
            rangeIdx[2] = sheet.usedRange.rowIndex;
            rangeIdx[3] = sheet.usedRange.colIndex;
            selectedRange = getRangeAddress(rangeIdx);
        }
        var eventArgs = {
            range: args.range ? args.range : selectedRange,
            filterOptions: { predicates: args.predicates }, cancel: false
        };
        if (!args.isCut) {
            this.parent.notify(beginAction, { action: 'filter', eventArgs: eventArgs });
        }
        this.processRange(sheet, sheetIdx, args ? args.range : null);
        if (predicates) {
            var range = this.filterRange.get(sheetIdx).slice();
            range[0] = range[0] + 1; // to skip first row.
            range[2] = sheet.usedRange.rowIndex; //filter range should be till used range.
            getData(this.parent, sheet.name + "!" + getRangeAddress(range), true, true).then(function (jsonData) {
                _this.filterSuccessHandler(new DataManager(jsonData), {
                    action: 'filtering',
                    filterCollection: predicates, field: predicates[0] ? predicates[0].field : null, sIdx: args.sIdx
                });
                predicates.forEach(function (predicate) {
                    if (_this.filterClassList.get(sheetIdx)[predicate.field] &&
                        _this.filterClassList.get(sheetIdx)[predicate.field].indexOf(' e-filtered') < 0) {
                        _this.filterClassList.get(sheetIdx)[predicate.field] += ' e-filtered';
                    }
                });
                _this.refreshFilterRange(null, false, args.sIdx);
            });
        }
        if (!args.isCut) {
            this.parent.notify(completeAction, { action: 'filter', eventArgs: eventArgs });
        }
    };
    /**
     * Processes the range if no filter applied.
     *
     * @param {SheetModel} sheet - Specify the sheet.
     * @param {number} sheetIdx - Specify the sheet index.
     * @param {number} filterRange - Specify the filterRange
     * @returns {void} - Processes the range if no filter applied.
     */
    Filter.prototype.processRange = function (sheet, sheetIdx, filterRange) {
        var range = getSwapRange(getIndexesFromAddress(filterRange || sheet.selectedRange));
        if (range[0] === range[2] && range[1] === range[3]) { //if selected range is a single cell
            range[0] = 0;
            range[1] = 0;
            range[2] = sheet.usedRange.rowIndex;
            range[3] = sheet.usedRange.colIndex;
        }
        this.filterRange.set(sheetIdx, range);
        this.filterCollection.set(sheetIdx, []);
        this.filterClassList.set(sheetIdx, {});
        this.refreshFilterRange(range, false, sheetIdx);
    };
    /**
     * Removes all the filter related collections for the active sheet.
     *
     * @param {number} sheetIdx - Specify the sheet index.
     * @returns {void} - Removes all the filter related collections for the active sheet.
     */
    Filter.prototype.removeFilter = function (sheetIdx) {
        if (this.filterCollection.get(sheetIdx).length) {
            this.parent.clearFilter();
        }
        var range = this.filterRange.get(sheetIdx).slice();
        this.filterRange.delete(sheetIdx);
        this.filterCollection.delete(sheetIdx);
        this.filterClassList.delete(sheetIdx);
        this.refreshFilterRange(range, true, sheetIdx);
    };
    /**
     * Handles filtering cell value based on context menu.
     *
     * @returns {void} - Handles filtering cell value based on context menu.
     */
    Filter.prototype.filterByCellValueHandler = function () {
        var _this = this;
        var sheetIdx = this.parent.activeSheetIndex;
        var sheet = this.parent.getActiveSheet();
        if (this.isInValidFilterRange(sheet)) {
            var l10n = this.parent.serviceLocator.getService(locale);
            this.filterRangeAlertHandler({ error: l10n.getConstant('FilterOutOfRangeError') });
            return;
        }
        var cell = getCellIndexes(sheet.activeCell);
        if (!this.isFilterRange(sheetIdx, cell[0], cell[1])) {
            this.processRange(sheet, sheetIdx);
        }
        var range = this.filterRange.get(sheetIdx).slice();
        range[0] = range[0] + 1; // to skip first row.
        range[2] = sheet.usedRange.rowIndex; //filter range should be till used range.
        var field = getColumnHeaderText(cell[1] + 1);
        var type = this.getColumnType(sheet, cell[1] + 1, range);
        var predicates = [{
                field: field,
                operator: type === 'date' || type === 'datetime' || type === 'boolean' ? 'equal' : 'contains',
                value: getCell(cell[0], cell[1], sheet).value, matchCase: false, type: type
            }];
        getData(this.parent, sheet.name + "!" + getRangeAddress(range), true, true).then(function (jsonData) {
            _this.filterSuccessHandler(new DataManager(jsonData), { action: 'filtering', filterCollection: predicates, field: field });
        });
    };
    /**
     * Creates filter buttons and renders the filter applied cells.
     *
     * @param { any} args - Specifies the args
     * @param { HTMLElement} args.td - specify the element
     * @param { number} args.rowIndex - specify the rowIndex
     * @param { number} args.colIndex - specify the colIndex
     * @param { number} args.sIdx - specify the sIdx
     * @returns {void} - Creates filter buttons and renders the filter applied cells.
     */
    Filter.prototype.renderFilterCellHandler = function (args) {
        var sheetIdx = args.sIdx;
        if (!sheetIdx && sheetIdx !== 0) {
            sheetIdx = this.parent.activeSheetIndex;
        }
        if (this.filterRange.has(sheetIdx) && this.isFilterCell(sheetIdx, args.rowIndex, args.colIndex)) {
            if (!args.td) {
                return;
            }
            var field = getColumnHeaderText(args.colIndex + 1);
            if (this.filterClassList.has(sheetIdx) && !this.filterClassList.get(sheetIdx)[field]) {
                this.filterClassList.get(sheetIdx)[field] = '';
            }
            if (args.td.querySelector('.e-filter-btn')) {
                var element = args.td.querySelector('.e-filter-iconbtn');
                var filterBtnObj = getComponent(element, 'btn');
                filterBtnObj.iconCss = 'e-icons e-filter-icon' + this.filterClassList.get(sheetIdx)[field];
            }
            else {
                var filterButton = this.parent.createElement('div', { className: 'e-filter-btn' });
                var filterBtnObj = new Button({ iconCss: 'e-icons e-filter-icon' + this.filterClassList.get(sheetIdx)[field], cssClass: 'e-filter-iconbtn' });
                args.td.insertBefore(filterButton, args.td.firstChild);
                filterBtnObj.createElement = this.parent.createElement;
                filterBtnObj.appendTo(filterButton);
            }
        }
        if (this.parent.sortCollection) {
            this.parent.notify(sortImport, { sheetIdx: sheetIdx });
        }
    };
    /**
     * Refreshes the filter header range.
     *
     * @param {number[]} filterRange - Specify the filterRange.
     * @param {boolean} remove - Specify the bool value
     * @param {number} sIdx - Specify the index.
     * @returns {void} - Refreshes the filter header range.
     */
    Filter.prototype.refreshFilterRange = function (filterRange, remove, sIdx) {
        var sheetIdx = sIdx;
        if (!sheetIdx && sheetIdx !== 0) {
            sheetIdx = this.parent.activeSheetIndex;
        }
        var range = filterRange || this.filterRange.get(sheetIdx).slice();
        for (var index = range[1]; index <= range[3]; index++) {
            var cell = this.parent.getCell(range[0], index);
            if (remove) {
                if (cell && cell.hasChildNodes()) {
                    var element = cell.querySelector('.e-filter-btn');
                    if (element) {
                        cell.removeChild(element);
                    }
                }
            }
            else {
                this.renderFilterCellHandler({ td: cell, rowIndex: range[0], colIndex: index, sIdx: sheetIdx });
            }
        }
        if (this.parent.sortCollection) {
            this.parent.notify(sortImport, null);
        }
    };
    /**
     * Checks whether the provided cell is a filter cell.
     *
     * @param {number} sheetIdx - Specify the sheet index.
     * @param {number} rowIndex - Specify the row index
     * @param {number} colIndex - Specify the col index.
     * @returns {boolean} - Checks whether the provided cell is a filter cell.
     */
    Filter.prototype.isFilterCell = function (sheetIdx, rowIndex, colIndex) {
        var range = this.filterRange.get(sheetIdx);
        return (range && range[0] === rowIndex && range[1] <= colIndex && range[3] >= colIndex);
    };
    /**
     * Checks whether the provided cell is in a filter range
     *
     * @param {number} sheetIdx - Specify the sheet index.
     * @param {number} rowIndex - Specify the row index
     * @param {number} colIndex - Specify the col index.
     * @returns {boolean} - Checks whether the provided cell is in a filter range
     */
    Filter.prototype.isFilterRange = function (sheetIdx, rowIndex, colIndex) {
        var range = this.filterRange.get(sheetIdx);
        return (range && range[0] <= rowIndex && range[2] >= rowIndex && range[1] <= colIndex && range[3] >= colIndex);
    };
    /**
     * Gets the filter information from active cell
     *
     * @param {any} args - Specifies the args
     * @param {string} args.field - Specify the field
     * @param {string} args.clearFilterText - Specify the clearFilterText
     * @param {boolean} args.isFiltered - Specify the isFiltered
     * @param {boolean} args.isClearAll - Specify the isClearAll
     * @returns {void} - Triggers before context menu created to enable or disable items.
     */
    Filter.prototype.getFilteredColumnHandler = function (args) {
        var sheetIdx = this.parent.activeSheetIndex;
        var l10n = this.parent.serviceLocator.getService(locale);
        args.clearFilterText = l10n.getConstant('ClearFilter');
        if (this.filterRange.has(sheetIdx)) {
            var filterCollection = this.filterCollection.get(sheetIdx);
            if (args.isClearAll) {
                args.isFiltered = filterCollection && filterCollection.length > 0;
                return;
            }
            var range = this.filterRange.get(sheetIdx).slice();
            var sheet = this.parent.getActiveSheet();
            var cell = getCellIndexes(sheet.activeCell);
            if (this.isFilterRange(sheetIdx, cell[0], cell[1])) {
                args.field = getColumnHeaderText(cell[1] + 1);
                var headerCell = getCell(range[0], cell[1], sheet);
                var cellValue = this.parent.getDisplayText(headerCell);
                args.clearFilterText = l10n.getConstant('ClearFilterFrom') + '\"'
                    + (cellValue ? cellValue.toString() : 'Column ' + args.field) + '\"';
                filterCollection.some(function (value) {
                    args.isFiltered = value.field === args.field;
                    return args.isFiltered;
                });
            }
        }
    };
    /**
     * Triggers before context menu created to enable or disable items.
     *
     * @param {any} e - Specifies the args
     * @param {HTMLElement} e.element - Specify the element
     * @param {MenuItemModel[]} e.items - Specify the items
     * @param {MenuItemModel} e.parentItem - Specify the parentItem
     * @param {string} e.target - Specify the target
     * @returns {void} - Triggers before context menu created to enable or disable items.
     */
    Filter.prototype.cMenuBeforeOpenHandler = function (e) {
        var id = this.parent.element.id + '_cmenu';
        if (e.parentItem && e.parentItem.id === id + '_filter' && e.target === '') {
            var args = { isFiltered: false };
            this.getFilteredColumnHandler(args);
            this.parent.enableContextMenuItems([id + '_clearfilter', id + '_reapplyfilter'], !!args.isFiltered, true);
        }
    };
    /**
     * Closes the filter popup.
     *
     * @returns {void} - Closes the filter popup.
     */
    Filter.prototype.closeDialog = function () {
        var filterPopup = this.parent.element.querySelector('.e-filter-popup');
        if (filterPopup) {
            var excelFilter = getComponent(filterPopup, 'dialog');
            if (excelFilter) {
                excelFilter.hide();
            }
        }
    };
    /**
     * Returns true if the filter popup is opened.
     *
     * @returns {boolean} - Returns true if the filter popup is opened.
     */
    Filter.prototype.isPopupOpened = function () {
        var filterPopup = this.parent.element.querySelector('.e-filter-popup');
        return filterPopup && filterPopup.style.display !== 'none';
    };
    Filter.prototype.filterCellKeyDownHandler = function (args) {
        var sheetIdx = this.parent.activeSheetIndex;
        var sheet = this.parent.getActiveSheet();
        var indexes = getCellIndexes(sheet.activeCell);
        if (this.isFilterCell(sheetIdx, indexes[0], indexes[1])) {
            args.isFilterCell = true;
            var pos = getCellPosition(sheet, indexes);
            var target = this.parent.getCell(indexes[0], indexes[1]);
            if (this.isPopupOpened()) {
                this.closeDialog();
            }
            this.openDialog(target, pos.left, pos.top);
        }
        else {
            args.isFilterCell = false;
        }
    };
    /**
     * Opens the filter popup dialog on filter button click.
     *
     * @param {MouseEvent | TouchEvent} e - Specidy the event
     * @returns {void} - Opens the filter popup dialog on filter button click.
     */
    Filter.prototype.filterMouseDownHandler = function (e) {
        var target = e.target;
        if (target.classList.contains('e-filter-icon')) {
            if (this.isPopupOpened()) {
                this.closeDialog();
                return;
            }
            this.openDialog(target, e.x, e.y);
        }
        else if (this.isPopupOpened()) {
            if (!target.classList.contains('e-searchinput') && !target.classList.contains('e-searchclear')
                && (target.offsetParent && !target.offsetParent.classList.contains('e-filter-popup'))) {
                this.closeDialog();
            }
            else {
                this.selectSortItemHandler(target);
            }
        }
    };
    /**
     * Opens the excel filter dialog based on target.
     *
     * @param {HTMLElement} target - Specify the target
     * @param {number} xPos - Specify the xPos
     * @param {number} yPos - Specify the yPos
     * @returns {void} - Opens the excel filter dialog based on target.
     */
    Filter.prototype.openDialog = function (target, xPos, yPos) {
        var _this = this;
        var cell = parentsUntil(target, 'e-cell');
        var colIndex = parseInt(cell.getAttribute('aria-colindex'), 10);
        var field = getColumnHeaderText(colIndex);
        //Update datasource dynamically
        this.parent.showSpinner();
        var sheetIdx = this.parent.activeSheetIndex;
        var range = this.filterRange.get(sheetIdx).slice();
        var sheet = this.parent.getActiveSheet();
        var filterCell = getCell(range[0], colIndex - 1, sheet);
        var displayName = this.parent.getDisplayText(filterCell);
        range[0] = range[0] + 1; // to skip first row.
        range[2] = sheet.usedRange.rowIndex; //filter range should be till used range.
        getData(this.parent, sheet.name + "!" + getRangeAddress(range), true, true, null, true).then(function (jsonData) {
            //to avoid undefined array data
            var checkBoxData;
            jsonData.some(function (value, index) {
                if (value) {
                    checkBoxData = new DataManager(jsonData.slice(index));
                }
                return !!value;
            });
            var options = {
                type: _this.getColumnType(sheet, colIndex, range), field: field, displayName: displayName || 'Column ' + field,
                dataSource: checkBoxData, height: _this.parent.element.classList.contains('e-bigger') ? 800 : 500, columns: [],
                hideSearchbox: false, filteredColumns: _this.filterCollection.get(sheetIdx), column: { 'field': field, 'filter': {} },
                handler: _this.filterSuccessHandler.bind(_this, new DataManager(jsonData)), target: target,
                position: { X: xPos, Y: yPos }, localeObj: _this.parent.serviceLocator.getService(locale)
            };
            var excelFilter = new ExcelFilterBase(_this.parent, _this.getLocalizedCustomOperators());
            excelFilter.openDialog(options);
            _this.parent.hideSpinner();
        });
    };
    /**
     * Formats cell value for listing it in filter popup.
     *
     * @param {any} args - Specifies the args
     * @param {string | number} args.value - Specify the value
     * @param {object} args.column - Specify the column
     * @param {object} args.data - Specify the data
     * @returns {void} - Formats cell value for listing it in filter popup.
     */
    Filter.prototype.filterCboxValueHandler = function (args) {
        if (args.column && args.data) {
            var fieldKey = 'field';
            var field = args.column[fieldKey];
            var dataKey = 'dataObj';
            var rowKey = '__rowIndex';
            if (args.value) {
                var indexes = getCellIndexes(field + args.data[dataKey][rowKey]);
                var cell = getCell(indexes[0], indexes[1], this.parent.getActiveSheet());
                if (cell && cell.format) {
                    args.value = this.parent.getDisplayText(cell);
                }
            }
        }
    };
    /**
     * Triggers when sorting items are chosen on context menu of filter popup.
     *
     * @param {HTMLElement} target - Specify the element.
     * @returns {void} - Triggers when sorting items are chosen on context menu of filter popup.
     */
    Filter.prototype.selectSortItemHandler = function (target) {
        var sortOrder = target.classList.contains('e-filter-sortasc') ? 'Ascending'
            : target.classList.contains('e-filter-sortdesc') ? 'Descending' : null;
        if (!sortOrder) {
            return;
        }
        var sheet = this.parent.getActiveSheet();
        var sheetIdx = this.parent.activeSheetIndex;
        var range = this.filterRange.get(sheetIdx).slice();
        range[0] = range[0] + 1; // to skip first row.
        range[2] = sheet.usedRange.rowIndex; //filter range should be till used range.
        this.parent.notify(applySort, { sortOptions: { sortDescriptors: { order: sortOrder } }, range: getRangeAddress(range) });
        var cell = getIndexesFromAddress(sheet.activeCell);
        var field = getColumnHeaderText(cell[1] + 1);
        for (var _i = 0, _a = Object.keys(this.filterClassList.get(sheetIdx)); _i < _a.length; _i++) {
            var key = _a[_i];
            var className = this.filterClassList.get(sheetIdx)[key].replace(/\se-sortasc-filter|\se-sortdesc-filter/gi, '');
            if (key === field) {
                className += sortOrder === 'Ascending' ? ' e-sortasc-filter' : ' e-sortdesc-filter';
            }
            this.filterClassList.get(sheetIdx)[key] = className;
        }
        this.refreshFilterRange();
        this.parent.sortCollection = this.parent.sortCollection ? this.parent.sortCollection : [];
        for (var i = 0; i < this.parent.sortCollection.length; i++) {
            if (this.parent.sortCollection[i] && this.parent.sortCollection[i].sheetIndex === sheetIdx) {
                this.parent.sortCollection.splice(i, 1);
            }
        }
        this.parent.sortCollection.push({
            sortRange: getRangeAddress(range), columnIndex: cell[1], order: sortOrder,
            sheetIndex: sheetIdx
        });
        this.closeDialog();
    };
    /**
     * Triggers when OK button or clear filter item is selected
     *
     * @param {DataManager} dataSource - Specify the data source
     * @param {Object} args - Specify the data source
     * @param {string} args.action - Specify the action
     * @param {PredicateModel[]} args.filterCollection - Specify the filter collection.
     * @param {string} args.field - Specify the field.
     * @param {number} args.sIdx - Specify the index.
     * @returns {void} - Triggers when OK button or clear filter item is selected
     */
    Filter.prototype.filterSuccessHandler = function (dataSource, args) {
        var sheetIdx = args.sIdx;
        if (!sheetIdx && sheetIdx !== 0) {
            sheetIdx = this.parent.activeSheetIndex;
        }
        var predicates = this.filterCollection.get(sheetIdx);
        var dataManager = new DataManager(predicates);
        var query = new Query();
        var fields = dataManager.executeLocal(query.where('field', 'equal', args.field));
        for (var index = 0; index < fields.length; index++) {
            var sameIndex = -1;
            for (var filterIndex = 0; filterIndex < predicates.length; filterIndex++) {
                if (predicates[filterIndex].field === fields[index].field) {
                    sameIndex = filterIndex;
                    break;
                }
            }
            if (sameIndex !== -1) {
                predicates.splice(sameIndex, 1);
            }
        }
        if (args.action === 'filtering') {
            predicates = predicates.concat(args.filterCollection);
            if (predicates.length) {
                for (var i = 0; i < predicates.length; i++) {
                    args.field = predicates[i].field;
                    if (predicates.length && this.filterClassList.get(sheetIdx)[args.field].indexOf(' e-filtered') < 0) {
                        this.filterClassList.get(sheetIdx)[args.field] += ' e-filtered';
                    }
                }
            }
        }
        else {
            this.filterClassList.get(sheetIdx)[args.field] = this.filterClassList.get(sheetIdx)[args.field].replace(' e-filtered', '');
        }
        this.filterCollection.set(sheetIdx, predicates);
        var filterOptions = {
            datasource: dataSource,
            predicates: this.getPredicates(sheetIdx)
        };
        this.filterRange.get(sheetIdx)[2] = getSheet(this.parent, sheetIdx).usedRange.rowIndex; //extend the range if filtered
        this.applyFilter(filterOptions, getRangeAddress(this.filterRange.get(sheetIdx)));
    };
    /**
     * Triggers events for filtering and applies filter.
     *
     * @param {FilterOptions} filterOptions - Specify the filteroptions.
     * @param {string} range - Specify the range.
     * @returns {void} - Triggers events for filtering and applies filter.
     */
    Filter.prototype.applyFilter = function (filterOptions, range) {
        var _this = this;
        var args = { range: range, filterOptions: filterOptions, cancel: false };
        this.parent.trigger(beforeFilter, args);
        if (args.cancel) {
            return;
        }
        this.parent.showSpinner();
        this.parent.filter(filterOptions, range).then(function (args) {
            _this.refreshFilterRange();
            _this.parent.notify(getFilteredCollection, null);
            _this.parent.hideSpinner();
            _this.parent.trigger(filterComplete, args);
            return Promise.resolve(args);
        }).catch(function (error) {
            _this.filterRangeAlertHandler({ error: error });
            return Promise.reject(error);
        });
    };
    /**
     * Gets the predicates for the sheet
     *
     * @param {number} sheetIdx - Specify the sheetindex
     * @returns {Predicate[]} - Gets the predicates for the sheet
     */
    Filter.prototype.getPredicates = function (sheetIdx) {
        var predicateList = [];
        var excelPredicate = CheckBoxFilterBase.getPredicate(this.filterCollection.get(sheetIdx));
        for (var _i = 0, _a = Object.keys(excelPredicate); _i < _a.length; _i++) {
            var prop = _a[_i];
            predicateList.push(excelPredicate[prop]);
        }
        return predicateList;
    };
    /**
     * Gets the column type to pass it into the excel filter options.
     *
     * @param {SheetModel} sheet - Specify the sheet.
     * @param {number} colIndex - Specify the colindex
     * @param {number[]} range - Specify the range.
     * @returns {string} - Gets the column type to pass it into the excel filter options.
     */
    Filter.prototype.getColumnType = function (sheet, colIndex, range) {
        var num = 0;
        var str = 0;
        var date = 0;
        var time = 0;
        for (var i = range[0]; i <= sheet.usedRange.rowIndex; i++) {
            var cell = getCell(i, colIndex - 1, sheet);
            if (cell) {
                if (cell.format) {
                    var type = getTypeFromFormat(cell.format).toLowerCase();
                    switch (type) {
                        case 'number':
                        case 'currency':
                        case 'accounting':
                        case 'percentage':
                            num++;
                            break;
                        case 'shortdate':
                        case 'longdate':
                            date++;
                            break;
                        case 'time':
                            num++;
                            break;
                        default:
                            str++;
                            break;
                    }
                }
                else {
                    if (typeof cell.value === 'string') {
                        str++;
                    }
                    else {
                        num++;
                    }
                }
            }
            else {
                str++;
            }
        }
        return (num > str && num > date && num > time) ? 'number' : (str > num && str > date && str > time) ? 'string'
            : (date > num && date > str && date > time) ? 'date' : 'datetime';
    };
    /**
     * Triggers before the custom filter dialog opened.
     *
     * @returns {void} - Triggers before the custom filter dialog opened.
     */
    Filter.prototype.beforeCustomFilterOpenHandler = function () {
        this.closeDialog();
    };
    /**
     * Clears all the filtered columns in the active sheet.
     *
     * @returns {void} - Clears all the filtered columns in the active sheet.
     */
    Filter.prototype.clearAllFilterHandler = function () {
        if (this.filterRange.has(this.parent.activeSheetIndex)) {
            this.filterCollection.set(this.parent.activeSheetIndex, []);
            for (var _i = 0, _a = Object.keys(this.filterClassList.get(this.parent.activeSheetIndex)); _i < _a.length; _i++) {
                var key = _a[_i];
                this.filterClassList.get(this.parent.activeSheetIndex)[key] = '';
            }
            this.refreshFilterRange();
        }
    };
    /**
     * Clear filter from the field.
     *
     * @param {any} args - Specifies the args
     * @param {{ field: string }} args.field - Specify the args
     * @returns {void} - Clear filter from the field.
     */
    Filter.prototype.clearFilterHandler = function (args) {
        this.filterSuccessHandler(null, { action: 'clear-filter', filterCollection: [], field: args.field });
    };
    /**
     * Reapplies the filter.
     *
     * @returns {void} - Reapplies the filter.
     */
    Filter.prototype.reapplyFilterHandler = function () {
        var sheetIdx = this.parent.activeSheetIndex;
        if (this.filterRange.has(sheetIdx)) {
            this.applyFilter({ predicates: this.getPredicates(sheetIdx) }, getRangeAddress(this.filterRange.get(sheetIdx)));
        }
    };
    /**
     * Gets the filter information of the sheet.
     *
     * @param {FilterInfoArgs} args - Specify the args
     * @returns {void} - Gets the filter information of the sheet.
     */
    Filter.prototype.getFilterRangeHandler = function (args) {
        var sheetIdx = args.sheetIdx;
        if (this.filterRange && this.filterRange.has(sheetIdx)) {
            args.hasFilter = true;
            args.filterRange = this.filterRange.get(sheetIdx);
        }
        else {
            args.hasFilter = false;
            args.filterRange = null;
        }
    };
    /**
     * Returns the custom operators for filter items.
     *
     * @returns {Object} - Returns the custom operators for filter items.
     */
    Filter.prototype.getLocalizedCustomOperators = function () {
        var l10n = this.parent.serviceLocator.getService(locale);
        var numOptr = [
            { value: 'equal', text: l10n.getConstant('Equal') },
            { value: 'greaterthan', text: l10n.getConstant('GreaterThan') },
            { value: 'greaterthanorequal', text: l10n.getConstant('GreaterThanOrEqual') },
            { value: 'lessthan', text: l10n.getConstant('LessThan') },
            { value: 'lessthanorequal', text: l10n.getConstant('LessThanOrEqual') },
            { value: 'notequal', text: l10n.getConstant('NotEqual') }
        ];
        var customOperators = {
            stringOperator: [
                { value: 'startswith', text: l10n.getConstant('StartsWith') },
                { value: 'endswith', text: l10n.getConstant('EndsWith') },
                { value: 'contains', text: l10n.getConstant('Contains') },
                { value: 'equal', text: l10n.getConstant('Equal') },
                { value: 'notequal', text: l10n.getConstant('NotEqual') }
            ],
            numberOperator: numOptr,
            dateOperator: numOptr,
            datetimeOperator: numOptr,
            booleanOperator: [
                { value: 'equal', text: l10n.getConstant('Equal') },
                { value: 'notequal', text: l10n.getConstant('NotEqual') }
            ]
        };
        return customOperators;
    };
    /**
     * To get filtered range and predicates collections
     *
     * @returns {void} - To get filtered range and predicates collections
     */
    Filter.prototype.getFilteredCollection = function () {
        var sheetLen = this.parent.sheets.length;
        var col = [];
        var fil;
        for (var i = 0; i < sheetLen; i++) {
            var range = void 0;
            var hasFilter = void 0;
            var args = { sheetIdx: i, filterRange: range, hasFilter: hasFilter };
            this.getFilterRangeHandler(args);
            if (args.hasFilter) {
                var colCollection = [];
                var condition = [];
                var value = [];
                var type = [];
                var predi = [];
                var predicate = this.filterCollection.get(args.sheetIdx);
                for (var i_1 = 0; i_1 < predicate.length; i_1++) {
                    if (predicate[i_1].field && predicate[i_1].operator) {
                        var colIdx = getCellIndexes(predicate[i_1].field + '1')[1];
                        colCollection.push(colIdx);
                        condition.push(predicate[i_1].operator);
                        value.push(predicate[i_1].value);
                        type.push(predicate[i_1].type);
                        predi.push(predicate[i_1].predicate);
                    }
                }
                var address = getRangeAddress(args.filterRange);
                fil = {
                    sheetIndex: args.sheetIdx, filterRange: address, hasFilter: args.hasFilter, column: colCollection,
                    criteria: condition, value: value, dataType: type
                };
                col.push(fil);
            }
        }
        if (fil) {
            this.parent.filterCollection = col;
        }
    };
    Filter.prototype.updateFilter = function (args) {
        if (this.parent.filterCollection && (args.initLoad || args.isOpen)) {
            for (var i = 0; i < this.parent.filterCollection.length; i++) {
                var filterCol = this.parent.filterCollection[i];
                var sIdx = filterCol.sheetIndex;
                if (i === 0) {
                    sIdx = 0;
                }
                var predicates = [];
                if (filterCol.column) {
                    for (var j = 0; j < filterCol.column.length; j++) {
                        var predicateCol = {
                            field: getCellAddress(0, filterCol.column[j]).charAt(0),
                            operator: this.getFilterOperator(filterCol.criteria[j]), value: filterCol.value[j].toString().split('*').join('')
                        };
                        predicates.push(predicateCol);
                    }
                }
                for (var i_2 = 0; i_2 < predicates.length - 1; i_2++) {
                    if (predicates[i_2].field === predicates[i_2 + 1].field) {
                        if (!predicates[i_2].predicate) {
                            predicates[i_2].predicate = 'or';
                        }
                        predicates[i_2 + 1].predicate = 'or';
                    }
                }
                this.parent.notify(initiateFilterUI, { predicates: predicates !== [] ? predicates : null, range: filterCol.filterRange, sIdx: sIdx });
            }
            if (this.parent.sortCollection) {
                this.parent.notify(sortImport, null);
            }
        }
    };
    Filter.prototype.getFilterOperator = function (value) {
        switch (value) {
            case "BeginsWith":
                value = "startswith";
                break;
            case "Less":
                value = "lessthan";
                break;
            case "EndsWith":
                value = "endswith";
                break;
            case "Equal":
                value = "equal";
                break;
            case "Notequal":
                value = "notEqual";
                break;
            case "Greater":
                value = "greaterthan";
                break;
            case "Contains":
                value = "contains";
                break;
            case "LessOrEqual":
                value = "lessthanorequal";
                break;
            case "GreaterOrEqual":
                value = "greaterthanorequal";
                break;
        }
        return value;
    };
    return Filter;
}());
export { Filter };
