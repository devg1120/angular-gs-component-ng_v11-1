import { getCell, setCell, getData } from '../base/index';
import { DataManager, Query, DataUtil, Deferred } from '@syncfusion/ej2-data';
import { getCellIndexes, getIndexesFromAddress, getColumnHeaderText, getRangeAddress, workbookLocale, isNumber } from '../common/index';
import { getSwapRange } from '../common/index';
import { parseIntValue } from '../common/index';
import { initiateSort } from '../common/event';
import { isNullOrUndefined } from '@syncfusion/ej2-base';
/**
 * The `WorkbookSort` module is used to handle sort action in Spreadsheet.
 */
var WorkbookSort = /** @class */ (function () {
    /**
     * Constructor for WorkbookSort module.
     *
     * @param {Workbook} parent - Specifies the workbook.
     */
    function WorkbookSort(parent) {
        this.parent = parent;
        this.addEventListener();
    }
    /**
     * To destroy the sort module.
     *
     * @returns {void} - To destroy the sort module.
     */
    WorkbookSort.prototype.destroy = function () {
        this.removeEventListener();
        this.parent = null;
    };
    WorkbookSort.prototype.addEventListener = function () {
        this.parent.on(initiateSort, this.initiateSortHandler, this);
    };
    WorkbookSort.prototype.removeEventListener = function () {
        if (!this.parent.isDestroyed) {
            this.parent.off(initiateSort, this.initiateSortHandler);
        }
    };
    /**
     * Sorts range of cells in the sheet.
     *
     * @param {{ args: BeforeSortEventArgs, promise: Promise<SortEventArgs> }} eventArgs - Specify the arguments.
     * @param {BeforeSortEventArgs} eventArgs.args - arguments for sorting.
     * @param {Promise<SortEventArgs>} eventArgs.promise - Specify the promise.
     * @returns {void} - Sorts range of cells in the sheet.
     */
    WorkbookSort.prototype.initiateSortHandler = function (eventArgs) {
        var _this = this;
        var args = eventArgs.args;
        var deferred = new Deferred();
        var sheet = this.parent.getActiveSheet();
        var range = getSwapRange(getIndexesFromAddress(args.range));
        var sortOptions = args.sortOptions || { sortDescriptors: {}, containsHeader: true };
        var isSingleCell = false;
        eventArgs.promise = deferred.promise;
        if (range[0] > sheet.usedRange.rowIndex || range[1] > sheet.usedRange.colIndex) {
            deferred.reject(this.parent.serviceLocator.getService(workbookLocale).getConstant('SortOutOfRangeError'));
            return;
        }
        var containsHeader = sortOptions.containsHeader;
        if (range[0] === range[2]) { //if selected range is a single cell
            range = this.getSortDataRange(range[0], range[1], sheet);
            isSingleCell = true;
            if (isNullOrUndefined(sortOptions.containsHeader)) {
                if (typeof getCell(range[0], range[1], sheet, null, true).value ===
                    typeof getCell(range[0] + 1, range[1], sheet, null, true).value) {
                    containsHeader = this.isSameStyle(getCell(range[0], range[1], sheet, null, true).style, getCell(range[0] + 1, range[1], sheet, null, true).style) ? false : true;
                }
                else {
                    containsHeader = true;
                }
            }
        }
        if ((isNullOrUndefined(args.sortOptions) || isNullOrUndefined(args.sortOptions.containsHeader)) && !isSingleCell) {
            if (!isNullOrUndefined(getCell(range[0], range[1], sheet)) && !isNullOrUndefined(getCell(range[0] + 1, range[1], sheet))) {
                if (typeof getCell(range[0], range[1], sheet).value === typeof getCell(range[0] + 1, range[1], sheet).value) {
                    containsHeader = false;
                }
                else {
                    containsHeader = true;
                }
            }
        }
        var sRIdx = range[0] = containsHeader ? range[0] + 1 : range[0];
        var sCIdx;
        var eCIdx;
        var cell = getCellIndexes(sheet.activeCell);
        var header = getColumnHeaderText(cell[1] + 1);
        var sortDescriptors = sortOptions.sortDescriptors;
        var address = getRangeAddress(range);
        getData(this.parent, sheet.name + "!" + address, true).then(function (jsonData) {
            var dataManager = new DataManager(jsonData);
            var query = new Query();
            if (Array.isArray(sortDescriptors)) { //multi-column sorting.
                if (!sortDescriptors || sortDescriptors.length === 0) {
                    sortDescriptors = [{ field: header }];
                }
                for (var length_1 = sortDescriptors.length, i = length_1 - 1; i > -1; i--) {
                    if (!sortDescriptors[length_1 - 1].field) {
                        sortDescriptors[length_1 - 1].field = header;
                    }
                    if (!sortDescriptors[i].field) {
                        continue;
                    }
                    var comparerFn = sortDescriptors[i].sortComparer
                        || _this.sortComparer.bind(_this, sortDescriptors[i], sortOptions.caseSensitive);
                    query.sortBy(sortDescriptors[i].field, comparerFn);
                }
            }
            else { //single column sorting.
                if (!sortDescriptors) {
                    sortDescriptors = { field: header };
                }
                if (!sortDescriptors.field) {
                    sortDescriptors.field = header;
                }
                var comparerFn = sortDescriptors.sortComparer
                    || _this.sortComparer.bind(_this, sortDescriptors, sortOptions.caseSensitive);
                query.sortBy(sortDescriptors.field, comparerFn);
            }
            dataManager.executeQuery(query).then(function (e) {
                var colName;
                var cell = {};
                var rowKey = '__rowIndex';
                Array.prototype.forEach.call(e.result, function (data, index) {
                    if (!data) {
                        return;
                    }
                    sCIdx = range[1];
                    eCIdx = range[3];
                    sRIdx = parseInt(jsonData[index][rowKey], 10) - 1;
                    for (sCIdx; sCIdx <= eCIdx; sCIdx++) {
                        colName = getColumnHeaderText(sCIdx + 1);
                        cell = data[colName];
                        setCell(sRIdx, sCIdx, sheet, cell);
                    }
                });
                var eventArgs = { range: sheet.name + "!" + address, sortOptions: args.sortOptions };
                deferred.resolve(eventArgs);
            });
        });
    };
    WorkbookSort.prototype.isSameStyle = function (firstCellStyle, secondCellStyle) {
        if (firstCellStyle === void 0) { firstCellStyle = {}; }
        if (secondCellStyle === void 0) { secondCellStyle = {}; }
        var sameStyle = true;
        var keys = Object.keys(firstCellStyle);
        for (var i = 0; i < keys.length; i++) {
            if (firstCellStyle[keys[i]] === secondCellStyle[keys[i]] || this.parent.cellStyle[keys[i]] === firstCellStyle[keys[i]]) {
                sameStyle = true;
            }
            else {
                sameStyle = false;
                break;
            }
        }
        return sameStyle;
    };
    WorkbookSort.prototype.getSortDataRange = function (rowIdx, colIdx, sheet) {
        var topIdx = rowIdx;
        var btmIdx = rowIdx;
        var leftIdx = colIdx;
        var prevleftIdx;
        var rightIdx = colIdx;
        var prevrightIdx;
        var topReached;
        var btmReached;
        var leftReached;
        var rightReached;
        for (var i = 1;; i++) {
            if (!btmReached && getCell(rowIdx + i, colIdx, sheet, null, true).value) {
                btmIdx = rowIdx + i;
            }
            else {
                btmReached = true;
            }
            if (!topReached && getCell(rowIdx - i, colIdx, sheet, null, true).value) {
                topIdx = rowIdx - i;
            }
            else {
                topReached = true;
            }
            if (topReached && btmReached) {
                break;
            }
        }
        for (var j = 1;; j++) {
            prevleftIdx = leftIdx;
            prevrightIdx = rightIdx;
            for (var i = topIdx; i <= btmIdx; i++) {
                if (!leftReached && getCell(i, leftIdx - 1, sheet, null, true).value) {
                    leftIdx = prevleftIdx - 1;
                }
                if (!rightReached && getCell(i, rightIdx + 1, sheet, null, true).value) {
                    rightIdx = prevrightIdx + 1;
                }
                if (i === btmIdx) {
                    if (leftIdx === prevleftIdx) {
                        leftReached = true;
                    }
                    if (rightIdx === prevrightIdx) {
                        rightReached = true;
                    }
                }
                if (rightReached && leftReached) {
                    return [topIdx, leftIdx, btmIdx, rightIdx];
                }
            }
        }
    };
    /**
     * Compares the two cells for sorting.
     *
     * @param {SortDescriptor} sortDescriptor - protocol for sorting.
     * @param {boolean} caseSensitive - value for case sensitive.
     * @param {CellModel} x - first cell
     * @param {CellModel} y - second cell
     * @returns {number} - Compares the two cells for sorting.
     */
    WorkbookSort.prototype.sortComparer = function (sortDescriptor, caseSensitive, x, y) {
        var direction = sortDescriptor.order || '';
        var comparer = DataUtil.fnSort(direction);
        var caseOptions = { sensitivity: caseSensitive ? 'case' : 'base' };
        if (x && y && (typeof x.value === 'string' || typeof y.value === 'string')) {
            if (isNumber(x.value)) { // Imported number values are of string type, need to handle this case in server side
                x.value = parseIntValue(x.value);
            }
            if (isNumber(y.value)) {
                y.value = parseIntValue(y.value);
            }
            var collator = new Intl.Collator(this.parent.locale, caseOptions);
            if (!direction || direction.toLowerCase() === 'ascending') {
                return collator.compare(x.value, y.value);
            }
            else {
                return collator.compare(x.value, y.value) * -1;
            }
        }
        if ((x === null || isNullOrUndefined(x.value)) && (y === null || isNullOrUndefined(y.value))) {
            return -1;
        }
        if (x === null || isNullOrUndefined(x.value)) {
            return 1;
        }
        if (y === null || isNullOrUndefined(y.value)) {
            return -1;
        }
        return comparer(x ? x.value : x, y ? y.value : y);
    };
    /**
     * Gets the module name.
     *
     * @returns {string} - Get the module name.
     */
    WorkbookSort.prototype.getModuleName = function () {
        return 'workbookSort';
    };
    return WorkbookSort;
}());
export { WorkbookSort };
