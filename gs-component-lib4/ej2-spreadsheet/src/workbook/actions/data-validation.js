import { setCell, setRow, getSheet, getColumn } from '../base/index';
import { setValidation, applyCellFormat, isValidation, removeValidation, addHighlight, getCellAddress, validationHighlight } from '../common/index';
import { removeHighlight } from '../common/index';
import { getRangeIndexes } from '../common/index';
import { isNullOrUndefined } from '@syncfusion/ej2-base';
/**
 * The `WorkbookHyperlink` module is used to handle Hyperlink action in Spreadsheet.
 */
var WorkbookDataValidation = /** @class */ (function () {
    /**
     * Constructor for WorkbookSort module.
     *
     * @param {Workbook} parent - Specifies the parent element.
     */
    function WorkbookDataValidation(parent) {
        this.parent = parent;
        this.addEventListener();
    }
    /**
     * To destroy the sort module.
     *
     * @returns {void}
     */
    WorkbookDataValidation.prototype.destroy = function () {
        this.removeEventListener();
        this.parent = null;
    };
    WorkbookDataValidation.prototype.addEventListener = function () {
        this.parent.on(setValidation, this.addValidationHandler, this);
        this.parent.on(removeValidation, this.removeValidationHandler, this);
        this.parent.on(addHighlight, this.addHighlightHandler, this);
        this.parent.on(removeHighlight, this.removeHighlightHandler, this);
    };
    WorkbookDataValidation.prototype.removeEventListener = function () {
        if (!this.parent.isDestroyed) {
            this.parent.off(setValidation, this.addValidationHandler);
            this.parent.off(removeValidation, this.removeValidationHandler);
            this.parent.off(addHighlight, this.addHighlightHandler);
            this.parent.off(removeHighlight, this.removeHighlightHandler);
        }
    };
    WorkbookDataValidation.prototype.addValidationHandler = function (args) {
        this.ValidationHandler(args.rules, args.range, false);
    };
    WorkbookDataValidation.prototype.removeValidationHandler = function (args) {
        this.ValidationHandler(args.rules, args.range, true);
    };
    WorkbookDataValidation.prototype.ValidationHandler = function (rules, range, isRemoveValidation) {
        var cell;
        var onlyRange = range;
        var sheetName = '';
        if (range.indexOf('!') > -1) {
            onlyRange = range.split('!')[1];
            sheetName = range.split('!')[0];
        }
        var sheet = getSheet(this.parent, this.parent.getAddressInfo(sheetName + 'A1:A1').sheetIndex);
        var isfullCol = false;
        var maxRowCount = sheet.rowCount;
        var rangeArr = onlyRange.split(':');
        if (onlyRange.match(/\D/g) && !onlyRange.match(/[0-9]/g)) {
            rangeArr[0] += 1;
            rangeArr[1] += maxRowCount;
            onlyRange = rangeArr[0] + ':' + rangeArr[1];
            isfullCol = true;
        }
        else if (!onlyRange.match(/\D/g) && onlyRange.match(/[0-9]/g)) {
            rangeArr[0] = 'A' + rangeArr[0];
            rangeArr[1] = getCellAddress(0, sheet.colCount - 1).replace(/[0-9]/g, '') + rangeArr[1];
            onlyRange = rangeArr[0] + ':' + rangeArr[1];
        }
        if (!isNullOrUndefined(sheetName)) {
            range = sheetName + onlyRange;
        }
        range = range || sheet.selectedRange;
        var indexes = getRangeIndexes(range);
        if (isfullCol) {
            for (var colIdx = indexes[1]; colIdx <= indexes[3]; colIdx++) {
                var column = getColumn(sheet, colIdx);
                if (isRemoveValidation && column && column.validation) {
                    delete (sheet.columns[colIdx].validation);
                }
                else {
                    if (isNullOrUndefined(column)) {
                        sheet.columns[colIdx] = getColumn(sheet, colIdx);
                    }
                    sheet.columns[colIdx].validation = {
                        operator: rules.operator,
                        type: rules.type,
                        value1: (rules.type === 'List' && rules.value1.length > 256) ?
                            rules.value1.substring(0, 255) : rules.value1,
                        value2: rules.value2,
                        inCellDropDown: rules.inCellDropDown,
                        ignoreBlank: rules.ignoreBlank
                    };
                }
            }
        }
        else {
            for (var rowIdx = indexes[0]; rowIdx <= indexes[2]; rowIdx++) {
                if (!sheet.rows[rowIdx]) {
                    setRow(sheet, rowIdx, {});
                }
                for (var colIdx = indexes[1]; colIdx <= indexes[3]; colIdx++) {
                    if (!sheet.rows[rowIdx].cells || !sheet.rows[rowIdx].cells[colIdx]) {
                        setCell(rowIdx, colIdx, sheet, {});
                    }
                    cell = sheet.rows[rowIdx].cells[colIdx];
                    if (isRemoveValidation) {
                        if (cell.validation) {
                            delete (cell.validation);
                            var style = this.parent.getCellStyleValue(['backgroundColor', 'color'], [rowIdx, colIdx]);
                            this.parent.notify(applyCellFormat, {
                                style: style, rowIdx: rowIdx, colIdx: colIdx
                            });
                        }
                    }
                    else {
                        cell.validation = {
                            type: rules.type,
                            operator: rules.operator,
                            value1: (rules.type === 'List' && rules.value1.length > 256) ?
                                rules.value1.substring(0, 255) : rules.value1,
                            value2: rules.value2,
                            ignoreBlank: rules.ignoreBlank,
                            inCellDropDown: rules.inCellDropDown
                        };
                    }
                }
            }
        }
    };
    WorkbookDataValidation.prototype.addHighlightHandler = function (args) {
        this.InvalidDataHandler(args.range, false, args.td);
    };
    WorkbookDataValidation.prototype.removeHighlightHandler = function (args) {
        this.InvalidDataHandler(args.range, true);
    };
    WorkbookDataValidation.prototype.getRange = function (range) {
        var indexes = getRangeIndexes(range);
        var sheet = this.parent.getActiveSheet();
        var maxColCount = sheet.colCount;
        var maxRowCount = sheet.rowCount;
        if (indexes[2] === maxRowCount - 1 && indexes[0] === 0) {
            range = range.replace(/[0-9]/g, '');
        }
        else if (indexes[3] === maxColCount - 1 && indexes[2] === 0) {
            range = range.replace(/\D/g, '');
        }
        return range;
    };
    WorkbookDataValidation.prototype.InvalidDataHandler = function (range, isRemoveHighlightedData, td) {
        var isCell = false;
        var cell;
        var validation;
        var value;
        var sheet = this.parent.getActiveSheet();
        range = range || sheet.selectedRange;
        var indexes = range ? getRangeIndexes(range) : [];
        range = this.getRange(range);
        var isfullCol = false;
        if (range.match(/\D/g) && !range.match(/[0-9]/g)) {
            isfullCol = true;
        }
        var rowIdx = range ? indexes[0] : 0;
        var lastRowIdx = range ? indexes[2] : sheet.rows.length;
        for (rowIdx; rowIdx <= lastRowIdx; rowIdx++) {
            if (sheet.rows[rowIdx]) {
                var colIdx = range ? indexes[1] : 0;
                var lastColIdx = range ? indexes[3] : sheet.rows[rowIdx].cells.length;
                for (colIdx; colIdx <= lastColIdx; colIdx++) {
                    if (sheet.rows[rowIdx].cells[colIdx]) {
                        var column = getColumn(sheet, colIdx);
                        cell = sheet.rows[rowIdx].cells[colIdx];
                        if (cell && cell.validation) {
                            validation = cell.validation;
                            if (isRemoveHighlightedData) {
                                if (validation.isHighlighted) {
                                    cell.validation.isHighlighted = false;
                                }
                            }
                            else {
                                cell.validation.isHighlighted = true;
                            }
                        }
                        else if (column && column.validation) {
                            validation = column.validation;
                            if (isRemoveHighlightedData && isfullCol) {
                                if (validation.isHighlighted) {
                                    column.validation.isHighlighted = false;
                                }
                            }
                            else if (isfullCol) {
                                column.validation.isHighlighted = true;
                            }
                        }
                        value = cell.value ? cell.value : '';
                        var range_1 = [rowIdx, colIdx];
                        var sheetIdx = this.parent.activeSheetIndex;
                        if (validation && this.parent.allowDataValidation) {
                            this.parent.notify(isValidation, { value: value, range: range_1, sheetIdx: sheetIdx, isCell: isCell });
                            var isValid = this.parent.allowDataValidation;
                            this.parent.allowDataValidation = true;
                            if (!isValid) {
                                this.parent.notify(validationHighlight, {
                                    isRemoveHighlightedData: isRemoveHighlightedData, rowIdx: rowIdx, colIdx: colIdx, td: td
                                });
                            }
                        }
                    }
                }
            }
        }
    };
    /**
     * Gets the module name.
     *
     * @returns {string} string
     */
    WorkbookDataValidation.prototype.getModuleName = function () {
        return 'workbookDataValidation';
    };
    return WorkbookDataValidation;
}());
export { WorkbookDataValidation };
