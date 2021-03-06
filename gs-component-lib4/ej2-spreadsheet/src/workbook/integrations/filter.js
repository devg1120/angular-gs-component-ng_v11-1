import { getData } from '../base/index';
import { DataManager, Query, Deferred, Predicate } from '@syncfusion/ej2-data';
import { getCellIndexes, getIndexesFromAddress, getSwapRange, getRangeAddress } from '../common/index';
import { initiateFilter, clearAllFilter, dataRefresh } from '../common/event';
import { isNullOrUndefined } from '@syncfusion/ej2-base';
/**
 * The `WorkbookFilter` module is used to handle filter action in Spreadsheet.
 */
var WorkbookFilter = /** @class */ (function () {
    /**
     * Constructor for WorkbookFilter module.
     *
     * @param {Workbook} parent - Constructor for WorkbookFilter module.
     */
    function WorkbookFilter(parent) {
        this.parent = parent;
        this.addEventListener();
    }
    /**
     * To destroy the filter module.
     *
     * @returns {void} - To destroy the filter module.
     */
    WorkbookFilter.prototype.destroy = function () {
        this.removeEventListener();
        this.filterRange = null;
        this.parent = null;
    };
    WorkbookFilter.prototype.addEventListener = function () {
        this.parent.on(initiateFilter, this.initiateFilterHandler, this);
        this.parent.on(clearAllFilter, this.clearAllFilterHandler, this);
    };
    WorkbookFilter.prototype.removeEventListener = function () {
        if (!this.parent.isDestroyed) {
            this.parent.off(initiateFilter, this.initiateFilterHandler);
            this.parent.off(clearAllFilter, this.clearAllFilterHandler);
        }
    };
    /**
     * Filters a range of cells in the sheet.
     *
     * @param { {args: BeforeFilterEventArgs, promise: Promise<FilterEventArgs>}} eventArgs - Specify the event args.
     * @param {BeforeFilterEventArgs} eventArgs.args - arguments for filtering..
     * @param {Promise<FilterEventArgs>} eventArgs.promise - Specify the promise.
     * @returns {void} - Filters a range of cells in the sheet.
     */
    WorkbookFilter.prototype.initiateFilterHandler = function (eventArgs) {
        var _this = this;
        var args = eventArgs.args;
        var deferred = new Deferred();
        var sheet = this.parent.getActiveSheet();
        var filterOptions = args.filterOptions || {};
        eventArgs.promise = deferred.promise;
        this.filterRange = args.range;
        if (filterOptions.datasource) {
            this.setFilter(filterOptions.datasource, filterOptions.predicates);
            var filterEventArgs = { range: args.range, filterOptions: filterOptions };
            deferred.resolve(filterEventArgs);
        }
        else {
            var range = getSwapRange(getIndexesFromAddress(args.range));
            if (range[0] > sheet.usedRange.rowIndex || range[1] > sheet.usedRange.colIndex) {
                deferred.reject('Select a cell or range inside the used range and try again.');
                return;
            }
            if (range[0] === range[2] && (range[2] - range[0]) === 0) { //if selected range is a single cell
                range[0] = 0;
                range[1] = 0;
                range[3] = sheet.usedRange.colIndex;
            }
            range[2] = sheet.usedRange.rowIndex; //filter range should be till used range.
            range[0] = range[0] + 1; //ignore first row
            var address_1 = getRangeAddress(range);
            getData(this.parent, sheet.name + "!" + address_1, true, true).then(function (jsonData) {
                var dataManager = new DataManager(jsonData);
                _this.setFilter(dataManager, filterOptions.predicates);
                var filterEventArgs = { range: address_1, filterOptions: filterOptions };
                deferred.resolve(filterEventArgs);
            });
        }
    };
    /**
     * Hides or unhides the rows based on the filter predicates.
     *
     * @param {DataManager} dataManager - Specify the dataManager.
     * @param {Predicate[]} predicates - Specify the predicates.
     * @returns {void} - Hides or unhides the rows based on the filter predicates.
     */
    WorkbookFilter.prototype.setFilter = function (dataManager, predicates) {
        var _this = this;
        if (dataManager && predicates) {
            var jsonData = dataManager.dataSource.json;
            var query = new Query();
            if (predicates.length) {
                query.where(Predicate.and(predicates));
            }
            var result_1 = dataManager.executeLocal(query);
            var rowKey_1 = '__rowIndex';
            jsonData.forEach(function (data) {
                if (!data) {
                    return;
                }
                var rowIdx = parseInt(data[rowKey_1], 10);
                _this.parent.hideRow(rowIdx - 1, undefined, result_1.indexOf(data) < 0);
                if (isNullOrUndefined(_this.parent.filteredRows)) {
                    _this.parent.filteredRows = {};
                    _this.parent.filteredRows.rowIdxColl = [];
                    _this.parent.filteredRows.sheetIdxColl = [];
                }
                var filterRows = _this.parent.filteredRows.rowIdxColl;
                var filterSheet = _this.parent.filteredRows.sheetIdxColl;
                if (result_1.indexOf(data) < 0) {
                    if (filterRows && filterSheet) {
                        for (var i = 0, len = filterSheet.length; i < len; i++) {
                            if (_this.parent.activeSheetIndex === filterSheet[i] && filterRows[i] === rowIdx - 1) {
                                filterRows.splice(i, 1);
                                filterSheet.splice(i, 1);
                            }
                        }
                    }
                    filterRows.push(rowIdx - 1);
                    filterSheet.push(_this.parent.activeSheetIndex);
                }
                else {
                    if (filterRows && filterSheet) {
                        for (var i = 0, length_1 = filterSheet.length; i < length_1; i++) {
                            if (_this.parent.activeSheetIndex === filterSheet[i] && filterRows[i] === rowIdx - 1) {
                                filterRows.splice(i, 1);
                                filterSheet.splice(i, 1);
                            }
                        }
                    }
                }
            });
            var sheet = this.parent.getActiveSheet();
            if (sheet.frozenColumns || sheet.frozenRows) {
                this.parent.notify(dataRefresh, null);
            }
        }
    };
    /**
     * Clears all the filters in the sheet.
     *
     * @returns {void} - Clears all the filters in the sheet.
     */
    WorkbookFilter.prototype.clearAllFilterHandler = function () {
        if (this.filterRange) {
            var range = getCellIndexes(this.filterRange);
            var sheet = this.parent.getActiveSheet();
            this.parent.hideRow(range[0], sheet.usedRange.rowIndex - 1, false);
        }
    };
    /**
     * Gets the module name.
     *
     * @returns {string} - Get the module name.
     */
    WorkbookFilter.prototype.getModuleName = function () {
        return 'workbookFilter';
    };
    return WorkbookFilter;
}());
export { WorkbookFilter };
