import { clearViewer, beginAction, getTextHeightWithBorder } from '../../spreadsheet/index';
import { getExcludedColumnWidth, selectRange } from '../common/index';
import { rowHeightChanged, setRowEleHeight, setMaxHgt, getTextHeight, getMaxHgt, getLines, initialLoad } from '../common/index';
import { getRowHeight, applyCellFormat } from '../../workbook/index';
import { isHiddenRow, getCell, getRangeIndexes, getSheetIndex, clearCFRule } from '../../workbook/index';
import { wrapEvent, getRangeAddress, clear } from '../../workbook/index';
import { removeClass, isNullOrUndefined } from '@syncfusion/ej2-base';
/**
 * CellFormat module allows to format the cell styles.
 */
var CellFormat = /** @class */ (function () {
    function CellFormat(parent) {
        this.checkHeight = false;
        this.parent = parent;
        this.row = parent.createElement('tr', { className: 'e-row' });
        this.parent.on(initialLoad, this.addEventListener, this);
    }
    CellFormat.prototype.applyCellFormat = function (args) {
        var keys = Object.keys(args.style);
        var sheet = this.parent.getActiveSheet();
        if (args.lastCell && getMaxHgt(sheet, args.rowIdx) <= 20 && !keys.length) {
            return;
        }
        var cell = args.cell || this.parent.getCell(args.rowIdx, args.colIdx);
        if (cell) {
            if (args.style.border !== undefined || args.style.borderTop !== undefined || args.style.borderLeft !== undefined) {
                var curStyle_1 = {};
                Object.keys(args.style).forEach(function (key) { curStyle_1[key] = args.style[key]; });
                if (curStyle_1.border !== undefined) {
                    Object.assign(cell.style, { borderRight: args.style.border, borderBottom: args.style.border });
                    this.setLeftBorder(args.style.border, cell, args.rowIdx, args.colIdx, args.row, args.onActionUpdate, args.first);
                    this.setTopBorder(args.style.border, cell, args.rowIdx, args.colIdx, args.pRow, args.pHRow, args.onActionUpdate, args.first, args.lastCell, args.manualUpdate);
                    delete curStyle_1.border;
                }
                if (curStyle_1.borderTop !== undefined) {
                    this.setTopBorder(args.style.borderTop, cell, args.rowIdx, args.colIdx, args.pRow, args.pHRow, args.onActionUpdate, args.first, args.lastCell, args.manualUpdate);
                    delete curStyle_1.borderTop;
                }
                if (curStyle_1.borderLeft !== undefined) {
                    this.setLeftBorder(args.style.borderLeft, cell, args.rowIdx, args.colIdx, args.row, args.onActionUpdate, args.first);
                    delete curStyle_1.borderLeft;
                }
                if (Object.keys(curStyle_1).length) {
                    if (curStyle_1.borderBottom !== undefined) {
                        this.setThickBorderHeight(curStyle_1.borderBottom, args.rowIdx, args.colIdx, cell, args.row, args.hRow, args.onActionUpdate, args.lastCell, args.manualUpdate);
                    }
                    Object.assign(cell.style, curStyle_1);
                }
            }
            else {
                if (args.style.borderBottom !== undefined) {
                    this.setThickBorderHeight(args.style.borderBottom, args.rowIdx, args.colIdx, cell, args.row, args.hRow, args.onActionUpdate, args.lastCell, args.manualUpdate);
                }
                Object.assign(cell.style, args.style);
                var CellElem = getCell(args.rowIdx, args.colIdx, sheet); // Need to remove after adding span support to merge
                if (CellElem && (CellElem.rowSpan || CellElem.colSpan) && cell.offsetHeight > 0) {
                    var height = getTextHeight(this.parent, CellElem.style || this.parent.cellStyle);
                    if (height > cell.offsetHeight) {
                        setRowEleHeight(this.parent, sheet, cell.offsetHeight, args.rowIdx);
                    }
                }
            }
            if (args.isHeightCheckNeeded) {
                if (!sheet.rows[args.rowIdx] || !sheet.rows[args.rowIdx].customHeight) {
                    if (!args.manualUpdate) {
                        var cellModel = getCell(args.rowIdx, args.colIdx, sheet);
                        if (!(cellModel && cellModel.wrap) && this.isHeightCheckNeeded(args.style)) {
                            setMaxHgt(sheet, args.rowIdx, args.colIdx, getTextHeightWithBorder(this.parent, args.rowIdx, args.colIdx, sheet, args.style));
                        }
                        if (args.lastCell) {
                            var height = getMaxHgt(sheet, args.rowIdx);
                            if (height > 20 && height > getRowHeight(sheet, args.rowIdx)) {
                                setRowEleHeight(this.parent, sheet, height, args.rowIdx, args.row, args.hRow, false);
                            }
                        }
                    }
                    else {
                        if (!this.checkHeight) {
                            this.checkHeight = this.isHeightCheckNeeded(args.style, args.onActionUpdate);
                        }
                        if (cell && cell.children[0] && cell.children[0].className === 'e-cf-databar' && args.style.fontSize) {
                            cell.children[0].querySelector('.e-databar-value').style.fontSize = args.style.fontSize;
                        }
                        this.updateRowHeight(args.rowIdx, args.colIdx, args.lastCell, args.onActionUpdate);
                    }
                }
            }
        }
        else {
            this.updateRowHeight(args.rowIdx, args.colIdx, true, args.onActionUpdate);
        }
    };
    CellFormat.prototype.updateRowHeight = function (rowIdx, colIdx, isLastCell, onActionUpdate) {
        if (this.checkHeight) {
            var hgt = 0;
            var maxHgt = void 0;
            var sheet = this.parent.getActiveSheet();
            var cell = getCell(rowIdx, colIdx, sheet, null, true);
            var td = this.parent.getCell(rowIdx, colIdx);
            if (cell && (!cell.rowSpan && !cell.colSpan)) {
                hgt = getTextHeightWithBorder(this.parent, rowIdx, colIdx, sheet, cell.style ||
                    this.parent.cellStyle, cell.wrap ? getLines(this.parent.getDisplayText(cell), getExcludedColumnWidth(sheet, rowIdx, colIdx), cell.style, this.parent.cellStyle) : 1);
                if (!isNullOrUndefined(cell.value)) {
                    var val = cell.value.toString();
                    if (val.indexOf('\n') > -1) {
                        var i = void 0;
                        var splitVal = cell.value.split('\n');
                        var n = 0;
                        var valLength = splitVal.length;
                        for (i = 0; i < valLength; i++) {
                            var lines = getLines(splitVal[i], getExcludedColumnWidth(sheet, rowIdx, colIdx), cell.style, this.parent.cellStyle);
                            if (lines === 0) {
                                lines = 1; // for empty new line
                            }
                            n = n + lines;
                        }
                        hgt =
                            getTextHeightWithBorder(this.parent, rowIdx, colIdx, sheet, cell.style || this.parent.cellStyle, n);
                    }
                }
                if (hgt < 20) {
                    hgt = 20; // default height
                }
                if (td && td.children[0] && td.children[0].className === 'e-cf-databar') {
                    td.children[0].style.height = '100%';
                    td.children[0].firstElementChild.nextElementSibling.style.height = '100%';
                }
                setMaxHgt(sheet, rowIdx, colIdx, hgt);
                if (isLastCell) {
                    this.checkHeight = false;
                    var row = sheet.frozenRows ? this.parent.getRow(rowIdx, null, sheet.frozenColumns) :
                        this.parent.getRow(rowIdx);
                    if (!row) {
                        return;
                    }
                    var prevHeight = getRowHeight(sheet, rowIdx);
                    maxHgt = getMaxHgt(sheet, rowIdx);
                    var heightChanged = onActionUpdate ? maxHgt !== prevHeight : maxHgt > prevHeight;
                    if (heightChanged) {
                        setRowEleHeight(this.parent, sheet, maxHgt, rowIdx, row);
                    }
                }
            }
        }
    };
    CellFormat.prototype.isHeightCheckNeeded = function (style, onActionUpdate) {
        var keys = Object.keys(style);
        return (onActionUpdate ? keys.indexOf('fontSize') > -1 : keys.indexOf('fontSize') > -1
            && Number(style.fontSize.split('pt')[0]) > 12) || keys.indexOf('fontFamily') > -1 || keys.indexOf('borderTop') > -1
            || keys.indexOf('borderBottom') > -1;
    };
    CellFormat.prototype.setLeftBorder = function (border, cell, rowIdx, colIdx, row, actionUpdate, first) {
        if (first && first.includes('Column')) {
            return;
        }
        for (var j = 0; j < cell.rowSpan; j++) {
            var prevCell = this.parent.getCell(rowIdx + j, colIdx - 1, row);
            var i = 1;
            while (prevCell && prevCell.style.display === 'none') {
                prevCell = this.parent.getCell(rowIdx + j, colIdx - 1 - i, row);
                i++;
            }
            if (prevCell) {
                if (actionUpdate && border !== '' && colIdx === this.parent.viewport.leftIndex) {
                    this.parent.getMainContent().scrollLeft -= this.getBorderSize(border);
                }
                prevCell.style.borderRight = (border === 'none') ? prevCell.style.borderRight : border;
            }
            else {
                cell.style.borderLeft = border;
            }
        }
    };
    CellFormat.prototype.setTopBorder = function (border, cell, rowIdx, colIdx, pRow, pHRow, actionUpdate, first, lastCell, manualUpdate) {
        if (first && first.includes('Row')) {
            return;
        }
        for (var j = 0; j < cell.colSpan; j++) {
            var prevCell = this.parent.getCell(rowIdx - 1, colIdx + j, pRow);
            if (prevCell) {
                if (isHiddenRow(this.parent.getActiveSheet(), rowIdx - 1)) {
                    var index = [Number(prevCell.parentElement.getAttribute('aria-rowindex')) - 1, colIdx];
                    if (this.parent.getCellStyleValue(['bottomPriority'], index).bottomPriority) {
                        return;
                    }
                }
                if (actionUpdate && border !== '' && this.parent.getActiveSheet().topLeftCell.includes("" + (rowIdx + 1))) {
                    this.parent.getMainContent().parentElement.scrollTop -= this.getBorderSize(border);
                }
                this.setThickBorderHeight(border, rowIdx - 1, colIdx + j, prevCell, pRow, pHRow, actionUpdate, lastCell, manualUpdate);
                prevCell.style.borderBottom = (border === 'none') ? prevCell.style.borderBottom : border;
            }
            else {
                cell.style.borderTop = border;
            }
        }
    };
    CellFormat.prototype.setThickBorderHeight = function (border, rowIdx, colIdx, cell, row, hRow, actionUpdate, lastCell, manualUpdate) {
        var size = border ? this.getBorderSize(border) : 1;
        var sheet = this.parent.getActiveSheet();
        if (size > 2 && (!sheet.rows[rowIdx] || !sheet.rows[rowIdx].customHeight)) {
            if (manualUpdate) {
                if (!this.checkHeight) {
                    this.checkHeight = true;
                }
                this.updateRowHeight(rowIdx, colIdx, lastCell, actionUpdate);
            }
            else {
                var prevHeight = getRowHeight(sheet, rowIdx);
                var height = Math.ceil(this.parent.calculateHeight(this.parent.getCellStyleValue(['fontFamily', 'fontSize'], [rowIdx, colIdx]), 1, 3));
                if (height > prevHeight) {
                    setRowEleHeight(this.parent, sheet, height, rowIdx, row, hRow, false);
                    this.parent.notify(rowHeightChanged, { rowIdx: rowIdx, threshold: height - 20 });
                }
            }
        }
        if (actionUpdate && (lastCell || !this.checkHeight) && size < 3 && (!sheet.rows[rowIdx] || !sheet.rows[rowIdx].customHeight)) {
            if (!this.checkHeight) {
                this.checkHeight = true;
            }
            this.updateRowHeight(rowIdx, colIdx, lastCell, actionUpdate);
        }
    };
    CellFormat.prototype.getBorderSize = function (border) {
        var size = border.split(' ')[0];
        return size === 'thin' ? 1 : (size === 'medium' ? 2 : (size === 'thick' ? 3 :
            (parseInt(size, 10) ? parseInt(size, 10) : 1)));
    };
    CellFormat.prototype.clearObj = function (args) {
        var options = args.options;
        var range = options.range ? (options.range.indexOf('!') > 0) ? options.range.split('!')[1] : options.range.split('!')[0]
            : this.parent.getActiveSheet().selectedRange;
        var sheetIndex = (options.range && options.range.indexOf('!') > 0) ?
            getSheetIndex(this.parent, options.range.split('!')[0]) : this.parent.activeSheetIndex;
        var rangeIdx = getRangeIndexes(range);
        var sheet = this.parent.sheets[sheetIndex];
        var sRIdx = rangeIdx[0];
        var eRIdx = rangeIdx[2];
        var sCIdx;
        var eCIdx;
        var eventArgs = { range: range, type: options.type, requestType: 'clear', sheetIndex: sheetIndex };
        if (!args.isPublic) {
            this.parent.notify(beginAction, { action: 'beforeClear', eventArgs: eventArgs });
        }
        if (options.type === 'Clear Formats' || options.type === 'Clear All') {
            this.parent.notify(clearCFRule, { range: range, isPublic: false });
            for (sRIdx; sRIdx <= eRIdx; sRIdx++) {
                sCIdx = rangeIdx[1];
                eCIdx = rangeIdx[3];
                for (sCIdx; sCIdx <= eCIdx; sCIdx++) {
                    var cell = getCell(sRIdx, sCIdx, sheet);
                    var cellElem = this.parent.getCell(sRIdx, sCIdx);
                    if (cell) {
                        if (cell.wrap) {
                            this.parent.notify(wrapEvent, { range: [sRIdx, sCIdx, sRIdx, sCIdx], wrap: false, sheet: sheet });
                        }
                        if (cell.hyperlink) {
                            removeClass(cellElem.querySelectorAll('.e-hyperlink'), 'e-hyperlink-style');
                            if (options.type === 'Clear All') {
                                this.parent.removeHyperlink(getRangeAddress([sRIdx, sCIdx, sRIdx, sCIdx]));
                            }
                        }
                    }
                }
            }
        }
        if (options.type === 'Clear Hyperlinks') {
            this.parent.removeHyperlink(range);
            return;
        }
        this.parent.notify(clear, { range: sheet.name + '!' + range, type: options.type });
        this.parent.serviceLocator.getService('cell').refreshRange(getRangeIndexes(range));
        if (!args.isPublic) {
            eventArgs = { range: sheet.name + '!' + range, type: options.type, sheetIndex: sheetIndex };
            this.parent.notify('actionComplete', { eventArgs: eventArgs, action: 'clear' });
        }
        this.parent.notify(selectRange, { address: range });
    };
    CellFormat.prototype.addEventListener = function () {
        this.parent.on(applyCellFormat, this.applyCellFormat, this);
        this.parent.on(clearViewer, this.clearObj, this);
    };
    CellFormat.prototype.removeEventListener = function () {
        if (!this.parent.isDestroyed) {
            this.parent.off(initialLoad, this.addEventListener);
            this.parent.off(applyCellFormat, this.applyCellFormat);
            this.parent.off(clearViewer, this.clearObj);
        }
    };
    /**
     * Destroy cell format module.
     *
     * @returns {void} - Destroy cell format module.
     */
    CellFormat.prototype.destroy = function () {
        this.removeEventListener();
        this.parent = null;
        this.row = null;
        this.checkHeight = null;
    };
    /**
     * Get the cell format module name.
     *
     * @returns {string} - Get the cell format module name.
     */
    CellFormat.prototype.getModuleName = function () {
        return 'cellformat';
    };
    return CellFormat;
}());
export { CellFormat };
