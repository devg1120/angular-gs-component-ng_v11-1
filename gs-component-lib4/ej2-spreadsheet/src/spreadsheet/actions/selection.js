import { contentLoaded, mouseDown, virtualContentLoaded, cellNavigate, getUpdateUsingRaf, focusBorder } from '../common/index';
import { showAggregate, refreshImgElem, getRowIdxFromClientY, getColIdxFromClientX, clearChartBorder } from '../common/index';
import { updateSelectedRange, getColumnWidth, mergedRange, activeCellMergedRange } from '../../workbook/index';
import { getRowHeight, isSingleCell, activeCellChanged, checkIsFormula, getSheetIndex } from '../../workbook/index';
import { EventHandler, addClass, removeClass, isNullOrUndefined, Browser, closest, remove, detach } from '@syncfusion/ej2-base';
import { selectionComplete, getMoveEvent, getEndEvent, isTouchStart, isMouseUp } from '../common/index';
import { isTouchEnd, isTouchMove, getClientX, getClientY, mouseUpAfterSelection, selectRange, rowHeightChanged } from '../common/index';
import { colWidthChanged, protectSelection, editOperation, initiateFormulaReference, initiateCur, clearCellRef } from '../common/index';
import { getRangeIndexes, getCellAddress, getRangeAddress, getCellIndexes, getSwapRange } from '../../workbook/common/address';
import { addressHandle, removeDesignChart, isMouseDown, isMouseMove, selectionStatus, setPosition, removeRangeEle } from '../common/index';
import { isCellReference, getSheetNameFromAddress } from '../../workbook/index';
import { getIndexesFromAddress } from '../../workbook/common/address';
/**
 * Represents selection support for Spreadsheet.
 */
var Selection = /** @class */ (function () {
    /**
     * Constructor for the Spreadsheet selection module.
     *
     * @param {Spreadsheet} parent - Constructor for the Spreadsheet selection module.
     * @private
     */
    function Selection(parent) {
        this.uniqueOBracket = String.fromCharCode(129);
        this.uniqueCBracket = String.fromCharCode(130);
        this.uniqueCSeparator = String.fromCharCode(131);
        this.uniqueCOperator = String.fromCharCode(132);
        this.uniquePOperator = String.fromCharCode(133);
        this.uniqueSOperator = String.fromCharCode(134);
        this.uniqueMOperator = String.fromCharCode(135);
        this.uniqueDOperator = String.fromCharCode(136);
        this.uniqueModOperator = String.fromCharCode(137);
        this.uniqueConcateOperator = String.fromCharCode(138);
        this.uniqueEqualOperator = String.fromCharCode(139);
        this.uniqueExpOperator = String.fromCharCode(140);
        this.uniqueGTOperator = String.fromCharCode(141);
        this.uniqueLTOperator = String.fromCharCode(142);
        this.invalidOperators = ['%'];
        this.formulaRange = [];
        this.tableRangesFormula = {};
        this.parent = parent;
        this.addEventListener();
        this.mouseMoveEvt = this.mouseMoveHandler.bind(this);
    }
    Selection.prototype.addEventListener = function () {
        this.parent.on(contentLoaded, this.init, this);
        this.parent.on(mouseDown, this.mouseDownHandler, this);
        this.parent.on(virtualContentLoaded, this.virtualContentLoadedHandler, this);
        this.parent.on(cellNavigate, this.cellNavigateHandler, this);
        this.parent.on(selectRange, this.selectRange, this);
        this.parent.on(rowHeightChanged, this.rowHeightChanged, this);
        this.parent.on(colWidthChanged, this.colWidthChanged, this);
        this.parent.on(protectSelection, this.protectHandler, this);
        this.parent.on(initiateFormulaReference, this.initiateFormulaSelection, this);
        this.parent.on(clearCellRef, this.clearBorder, this);
        this.parent.on(getRowIdxFromClientY, this.getRowIdxFromClientY, this);
        this.parent.on(getColIdxFromClientX, this.getColIdxFromClientX, this);
        this.parent.on(focusBorder, this.chartBorderHandler, this);
        this.parent.on(selectionStatus, this.isTouchSelectionStarted, this);
    };
    Selection.prototype.removeEventListener = function () {
        if (!this.parent.isDestroyed) {
            this.parent.off(contentLoaded, this.init);
            this.parent.off(mouseDown, this.mouseDownHandler);
            this.parent.off(virtualContentLoaded, this.virtualContentLoadedHandler);
            this.parent.off(cellNavigate, this.cellNavigateHandler);
            this.parent.off(selectRange, this.selectRange);
            this.parent.off(rowHeightChanged, this.rowHeightChanged);
            this.parent.off(colWidthChanged, this.colWidthChanged);
            this.parent.off(protectSelection, this.protectHandler);
            this.parent.off(initiateFormulaReference, this.initiateFormulaSelection);
            this.parent.off(clearCellRef, this.clearBorder);
            this.parent.off(getRowIdxFromClientY, this.getRowIdxFromClientY);
            this.parent.off(getColIdxFromClientX, this.getColIdxFromClientX);
            this.parent.off(focusBorder, this.chartBorderHandler);
            this.parent.off(selectionStatus, this.isTouchSelectionStarted);
        }
    };
    Selection.prototype.isTouchSelectionStarted = function (args) {
        args.touchSelectionStarted = this.touchSelectionStarted;
    };
    Selection.prototype.rowHeightChanged = function (args) {
        var _this = this;
        getUpdateUsingRaf(function () {
            var ele = _this.getActiveCell();
            var sheet = _this.parent.getActiveSheet();
            if (ele) {
                var cellIndex = getCellIndexes(sheet.activeCell);
                if (sheet.frozenRows || sheet.frozenColumns) {
                    var e = { range: [cellIndex[0], cellIndex[1], cellIndex[0], cellIndex[1]] };
                    _this.parent.notify(activeCellMergedRange, e);
                    setPosition(_this.parent, ele, e.range, 'e-active-cell');
                }
                else {
                    if (cellIndex[0] === args.rowIdx) {
                        ele.style.height = parseFloat(ele.style.height) + args.threshold + "px";
                    }
                    else if (cellIndex[0] > args.rowIdx) {
                        ele.style.top = parseFloat(ele.style.top) + args.threshold + "px";
                    }
                }
            }
            ele = _this.getSelectionElement();
            if (ele) {
                var selectedRange = getRangeIndexes(sheet.selectedRange);
                var sRange = getSwapRange(selectedRange);
                var mergeArgs = { range: sRange, isActiveCell: false, skipChecking: true };
                _this.parent.notify(mergedRange, mergeArgs);
                if (mergeArgs.isActiveCell || (sRange[0] === sRange[2] && sRange[1] === sRange[3])) {
                    return;
                }
                if (sheet.frozenRows || sheet.frozenColumns) {
                    setPosition(_this.parent, ele, selectedRange);
                    return;
                }
                var rowStart = sRange[0];
                var rowEnd = sRange[2];
                if (rowStart <= args.rowIdx && rowEnd >= args.rowIdx && ele) {
                    ele.style.height = parseFloat(ele.style.height) + args.threshold + "px";
                }
                else if (rowStart > args.rowIdx && ele) {
                    ele.style.top = parseFloat(ele.style.top) + args.threshold + "px";
                }
            }
        });
    };
    Selection.prototype.colWidthChanged = function (args) {
        var _this = this;
        getUpdateUsingRaf(function () {
            var sheet = _this.parent.getActiveSheet();
            var ele = _this.getActiveCell();
            if (ele) {
                var cellIndex = getCellIndexes(_this.parent.getActiveSheet().activeCell);
                if (sheet.frozenRows || sheet.frozenColumns) {
                    var mergeArgs = { range: [cellIndex[0], cellIndex[1], cellIndex[0], cellIndex[1]] };
                    _this.parent.notify(activeCellMergedRange, mergeArgs);
                    setPosition(_this.parent, ele, mergeArgs.range, 'e-active-cell');
                }
                else {
                    if (cellIndex[1] === args.colIdx) {
                        ele.style.width = parseFloat(ele.style.width) + args.threshold + "px";
                    }
                    else if (cellIndex[1] > args.colIdx) {
                        ele.style.left = parseFloat(ele.style.left) + args.threshold + "px";
                    }
                }
            }
            ele = _this.getSelectionElement();
            var selectedRange = getRangeIndexes(_this.parent.getActiveSheet().selectedRange);
            var sRange = getSwapRange(selectedRange);
            var e = { range: sRange, isActiveCell: false, skipChecking: true };
            _this.parent.notify(mergedRange, e);
            if (e.isActiveCell || (sRange[0] === sRange[2] && sRange[1] === sRange[3])) {
                return;
            }
            if (sheet.frozenRows || sheet.frozenColumns) {
                setPosition(_this.parent, ele, selectedRange);
                return;
            }
            var colStart = sRange[1];
            var colEnd = sRange[3];
            if (colStart <= args.colIdx && colEnd >= args.colIdx && ele) {
                ele.style.width = parseFloat(ele.style.width) + args.threshold + "px";
            }
            else if (colStart > args.colIdx && ele) {
                ele.style.left = parseFloat(ele.style.left) + args.threshold + "px";
            }
        });
    };
    Selection.prototype.selectRange = function (args) {
        args.address = this.parent.selectionSettings.mode === 'Single' ? getRangeAddress(getCellIndexes(args.address)) : args.address;
        this.selectMultiRange(args.address, null, null, args.skipChecking);
    };
    Selection.prototype.init = function () {
        this.createSelectionElement();
        var sheet = this.parent.getActiveSheet();
        var sRange = getSwapRange(getRangeIndexes(sheet.selectedRange));
        var actRange = getCellIndexes(sheet.activeCell);
        var inRange = sRange[0] <= actRange[0] && sRange[2] >= actRange[0] && sRange[1] <= actRange[1]
            && sRange[3] >= actRange[1];
        this.selectMultiRange(sheet.selectedRange, true, inRange);
    };
    Selection.prototype.selectMultiRange = function (address, isInit, inRange, skipChecking) {
        var _this = this;
        var sheetIdx = this.parent.activeSheetIndex;
        if (address.indexOf('!') > -1) {
            sheetIdx = getSheetIndex(this.parent, getSheetNameFromAddress(address));
            address = address.split('!')[1];
        }
        if (this.parent.activeSheetIndex === sheetIdx) {
            address.split(' ').forEach(function (rng, idx) {
                _this.selectRangeByIdx(getRangeIndexes(rng), { type: 'mousedown', ctrlKey: idx === 0 ? false : true }, null, inRange, isInit, skipChecking);
            });
        }
        else {
            updateSelectedRange(this.parent, address, this.parent.sheets[sheetIdx]);
        }
    };
    Selection.prototype.createSelectionElement = function () {
        var content = this.parent.getMainContent();
        var ele = this.parent.createElement('div', { className: 'e-selection' });
        content.appendChild(ele);
        ele = this.parent.createElement('div', { className: 'e-active-cell' });
        content.appendChild(ele);
    };
    Selection.prototype.mouseDownHandler = function (e) {
        if (closest(e.target, '.e-scrollbar') || e.target.classList.contains('e-main-panel') ||
            e.target.classList.contains('e-sheet')) {
            return;
        }
        var eventArgs = { action: 'getCurrentEditValue', editedValue: '' };
        this.parent.notify(editOperation, eventArgs);
        var isFormulaEdit = (eventArgs.editedValue && eventArgs.editedValue.toString().indexOf('=') === 0) ||
            checkIsFormula(eventArgs.editedValue);
        if (!this.parent.isEdit || isFormulaEdit) {
            var overlayElem = document.getElementById(this.parent.element.id + '_overlay');
            if (typeof (e.target.className) === 'string') {
                if (e.target.className.indexOf('e-ss-overlay') > -1) {
                    return;
                }
            }
            else if (overlayElem) {
                overlayElem.classList.remove('e-ss-overlay-active');
            }
            if (closest(e.target, '.e-datavisualization-chart')) {
                return;
            }
            if (this.parent.getActiveSheet().isProtected && !this.parent.getActiveSheet().protectSettings.selectCells) {
                return;
            }
            if (!closest(e.target, '.e-findtool-dlg')) {
                if (this.getSheetElement().contains(e.target) && !e.target.classList.contains('e-colresize')
                    && !e.target.classList.contains('e-rowresize')) {
                    var sheet = this.parent.getActiveSheet();
                    var mode = this.parent.selectionSettings.mode;
                    var rowIdx = this.getRowIdxFromClientY({ clientY: getClientY(e), target: e.target });
                    var colIdx = this.getColIdxFromClientX({ clientX: getClientX(e), target: e.target });
                    var activeIdx = getCellIndexes(sheet.activeCell);
                    var isRowSelected = void 0;
                    var isColSelected = void 0;
                    if (sheet.showHeaders) {
                        var trgt = e.target;
                        if (sheet.frozenColumns || sheet.frozenRows) {
                            var headerEle = this.parent.getSelectAllContent().querySelector('thead');
                            if (headerEle) {
                                isColSelected = (this.parent.getColumnHeaderContent().contains(trgt) || headerEle.contains(trgt)) &&
                                    trgt.classList.contains('e-header-cell');
                            }
                            else {
                                isColSelected = this.parent.getColumnHeaderContent().contains(trgt) &&
                                    trgt.classList.contains('e-header-cell');
                            }
                            headerEle = this.parent.getSelectAllContent().querySelector('tbody');
                            if (headerEle) {
                                isRowSelected = (this.parent.getRowHeaderContent().contains(trgt) || headerEle.contains(trgt)) &&
                                    trgt.classList.contains('e-header-cell');
                            }
                            else {
                                isRowSelected = this.parent.getRowHeaderContent().contains(trgt) &&
                                    trgt.classList.contains('e-header-cell');
                            }
                        }
                        else {
                            isRowSelected = this.parent.getRowHeaderContent().contains(e.target);
                            isColSelected = this.parent.getColumnHeaderContent().contains(e.target);
                        }
                    }
                    if (e.which === 3 && this.isSelected(rowIdx, colIdx)) {
                        return;
                    }
                    if (mode === 'Multiple' && (!isTouchEnd(e) && (!isTouchStart(e) ||
                        (isTouchStart(e) && activeIdx[0] === rowIdx && activeIdx[1] === colIdx)) || isColSelected || isRowSelected)) {
                        document.addEventListener(getMoveEvent().split(' ')[0], this.mouseMoveEvt);
                        if (!Browser.isPointer) {
                            document.addEventListener(getMoveEvent().split(' ')[1], this.mouseMoveEvt, { passive: false });
                        }
                        this.touchSelectionStarted = true;
                    }
                    else {
                        this.touchSelectionStarted = false;
                    }
                    if (!isTouchEnd(e)) {
                        EventHandler.add(document, getEndEvent(), this.mouseUpHandler, this);
                    }
                    if (isTouchStart(e) && !(isColSelected || isRowSelected)) {
                        this.touchEvt = e;
                        return;
                    }
                    var topLeftIdx = getRangeIndexes(sheet.topLeftCell);
                    if (isRowSelected) {
                        this.isRowSelected = true;
                        if (!e.shiftKey || mode === 'Single') {
                            this.startCell = [rowIdx, 0];
                        }
                        this.selectRangeByIdx([this.startCell[0], sheet.frozenColumns ? topLeftIdx[1] : 0, rowIdx, sheet.colCount - 1], e);
                    }
                    else if (isColSelected) {
                        this.isColSelected = true;
                        if (!e.shiftKey || mode === 'Single') {
                            this.startCell = [0, colIdx];
                        }
                        this.selectRangeByIdx([sheet.frozenRows ? topLeftIdx[0] : 0, this.startCell[1], sheet.rowCount - 1, colIdx], e);
                    }
                    else if (closest(e.target, '.e-select-all-cell')) {
                        this.startCell = [sheet.frozenRows ? topLeftIdx[0] : 0, sheet.frozenColumns ? topLeftIdx[1] : 0];
                        this.selectRangeByIdx([].concat(this.startCell, [sheet.rowCount - 1, sheet.colCount - 1]), e);
                    }
                    else if (!e.target.classList.contains('e-sheet-content')) {
                        if (!e.shiftKey || mode === 'Single') {
                            this.startCell = [rowIdx, colIdx];
                        }
                        this.selectRangeByIdx([].concat(this.startCell ? this.startCell : getCellIndexes(sheet.activeCell), [rowIdx, colIdx]), e);
                    }
                    if (this.parent.isMobileView()) {
                        this.parent.element.classList.add('e-mobile-focused');
                        this.parent.renderModule.setSheetPanelSize();
                    }
                }
            }
        }
        if (isFormulaEdit && (e.target.classList.contains('e-cell') ||
            e.target.classList.contains('e-header-cell')) && this.parent.isEdit) {
            var range = this.parent.getActiveSheet().selectedRange;
            range = isSingleCell(getIndexesFromAddress(range)) ? range.split(':')[0] : range;
            this.parent.notify(addressHandle, { range: range, isSelect: false });
        }
    };
    Selection.prototype.mouseMoveHandler = function (e) {
        var _this = this;
        var sheet = this.parent.getActiveSheet();
        if (isTouchMove(e)) {
            e.preventDefault();
        }
        var eventArgs = { action: 'getCurrentEditValue', editedValue: '' };
        this.parent.notify(editOperation, eventArgs);
        var isFormulaEdit = checkIsFormula(eventArgs.editedValue) ||
            (eventArgs.editedValue && eventArgs.editedValue.toString().indexOf('=') === 0);
        var verticalContent = this.parent.getMainContent().parentElement;
        var horizontalContent = this.parent.element.getElementsByClassName('e-scroller')[0];
        var clientRect = verticalContent.getBoundingClientRect();
        var frozenCol = this.parent.frozenColCount(sheet);
        var left = clientRect.left + this.parent.sheetModule.getRowHeaderWidth(sheet);
        var top = clientRect.top;
        var right = clientRect.right;
        var bottom = clientRect.bottom;
        var clientX = getClientX(e);
        var clientY = getClientY(e);
        // remove math.min or handle top and left auto scroll
        var colIdx = this.isRowSelected ? sheet.colCount - 1 :
            this.getColIdxFromClientX({ clientX: Math.min(clientX, right), target: e.target });
        var rowIdx = this.isColSelected ? sheet.rowCount - 1 :
            this.getRowIdxFromClientY({ clientY: Math.min(clientY, bottom), target: e.target });
        var prevIndex = getRangeIndexes(sheet.selectedRange);
        var mergeArgs = { range: [rowIdx, colIdx, rowIdx, colIdx] };
        this.parent.notify(activeCellMergedRange, mergeArgs);
        if (mergeArgs.range[2] === prevIndex[2] && mergeArgs.range[3] === prevIndex[3]) {
            return;
        }
        var frozenRow = this.parent.frozenRowCount(sheet);
        var isScrollDown = clientY > bottom && rowIdx < sheet.rowCount;
        var isScrollUp = clientY < top && rowIdx >= 0 && !this.isColSelected && !!verticalContent.scrollTop;
        var isScrollRight = clientX > right && colIdx < sheet.colCount;
        var isScrollLeft = clientX < left && colIdx >= 0 && !this.isRowSelected && !!horizontalContent.scrollLeft;
        this.clearInterval();
        var scrollUpRowIdx;
        var scrollUpColIdx;
        if (!isFormulaEdit && !this.isColSelected && !this.isRowSelected) {
            prevIndex = getCellIndexes(sheet.activeCell);
        }
        if (isScrollDown || isScrollUp || isScrollRight || isScrollLeft) {
            if (isScrollUp || isScrollLeft) {
                scrollUpRowIdx = rowIdx;
                scrollUpColIdx = colIdx;
            }
            this.scrollInterval = setInterval(function () {
                if ((isScrollDown || isScrollUp) && !_this.isColSelected) {
                    rowIdx = _this.getRowIdxFromClientY({ clientY: isScrollDown ? bottom : top });
                    if (rowIdx >= sheet.rowCount) { // clear interval when scroll up
                        _this.clearInterval();
                        return;
                    }
                    verticalContent.scrollTop += (isScrollDown ? 1 : -1) * getRowHeight(sheet, rowIdx);
                }
                if ((isScrollRight || isScrollLeft) && !_this.isRowSelected) {
                    colIdx = _this.getColIdxFromClientX({ clientX: isScrollRight ? right : left });
                    if (colIdx >= sheet.colCount) { // clear interval when scroll left
                        _this.clearInterval();
                        return;
                    }
                    horizontalContent.scrollLeft += (isScrollRight ? 1 : -1) * getColumnWidth(sheet, colIdx);
                }
                if ((isScrollUp && !verticalContent.scrollTop) || (isScrollLeft && !horizontalContent.scrollLeft)) {
                    _this.selectRangeByIdx([].concat(prevIndex[0], prevIndex[1], [scrollUpRowIdx, scrollUpColIdx]), e);
                    _this.clearInterval();
                    return;
                }
                _this.selectRangeByIdx([].concat(prevIndex[0], prevIndex[1], [rowIdx, colIdx]), e);
            }, 100);
        }
        else {
            var indexes = [].concat(prevIndex[0], prevIndex[1], [rowIdx, colIdx]);
            if (frozenRow && indexes[0] < frozenRow && indexes[2] >= frozenRow && verticalContent.scrollTop) {
                verticalContent.scrollTop = 0;
                indexes[2] = frozenRow;
            }
            if (frozenCol && indexes[1] < frozenCol && indexes[3] >= frozenCol && horizontalContent.scrollLeft) {
                horizontalContent.scrollLeft = 0;
                indexes[3] = frozenCol;
            }
            this.selectRangeByIdx(indexes, e);
        }
        if (isFormulaEdit && this.parent.isEdit) {
            var range = this.parent.getActiveSheet().selectedRange;
            this.parent.notify(addressHandle, { range: range, isSelect: false });
        }
    };
    Selection.prototype.mouseUpHandler = function (e) {
        var rowIdx = this.getRowIdxFromClientY({ clientY: getClientY(e), target: e.target });
        var colIdx = this.getColIdxFromClientX({ clientX: getClientX(e), target: e.target });
        this.clearInterval();
        if (isTouchEnd(e) && !(this.isColSelected || this.isRowSelected) &&
            (this.getRowIdxFromClientY({ clientY: getClientY(this.touchEvt), target: e.target }) === rowIdx &&
                this.getColIdxFromClientX({ clientX: getClientX(this.touchEvt), target: e.target }) === colIdx)) {
            this.mouseDownHandler(e);
        }
        this.parent.trigger('select', { range: this.parent.getActiveSheet().selectedRange });
        document.removeEventListener(getMoveEvent().split(' ')[0], this.mouseMoveEvt);
        if (!Browser.isPointer) {
            document.removeEventListener(getMoveEvent().split(' ')[1], this.mouseMoveEvt);
        }
        EventHandler.remove(document, getEndEvent(), this.mouseUpHandler);
        this.parent.notify(mouseUpAfterSelection, e);
        var eventArgs = { action: 'getCurrentEditValue', editedValue: '' };
        this.parent.notify(editOperation, eventArgs);
        var isFormulaEdit = checkIsFormula(eventArgs.editedValue) ||
            (eventArgs.editedValue && eventArgs.editedValue.toString().indexOf('=') === 0);
        if (isFormulaEdit && this.parent.isEdit && !e.target.classList.contains('e-spreadsheet-edit')) {
            this.parent.notify(initiateCur, {});
        }
    };
    Selection.prototype.isSelected = function (rowIdx, colIdx) {
        var indexes = getSwapRange(getRangeIndexes(this.parent.getActiveSheet().selectedRange));
        return indexes[0] <= rowIdx && rowIdx <= indexes[2] && indexes[1] <= colIdx && colIdx <= indexes[3];
    };
    Selection.prototype.virtualContentLoadedHandler = function (args) {
        var _this = this;
        var sheet = this.parent.getActiveSheet();
        var indexes = getRangeIndexes(sheet.selectedRange);
        var isColSelected;
        var isRowSelected;
        sheet.selectedRange.split(' ').forEach(function (rng, idx) {
            indexes = getRangeIndexes(rng);
            isRowSelected = (indexes[1] === 0 && indexes[3] === args.prevRowColCnt.colCount - 1);
            isColSelected = (indexes[0] === 0 && indexes[2] === args.prevRowColCnt.rowCount - 1);
            if (isColSelected && isRowSelected) {
                _this.selectRangeByIdx([0, 0, sheet.rowCount - 1, sheet.colCount - 1], null, true, null, null, null, idx);
            }
            else if (isColSelected) {
                _this.selectRangeByIdx([0, indexes[1], sheet.rowCount - 1, indexes[3]], null, true, null, null, null, idx);
            }
            else if (isRowSelected) {
                _this.selectRangeByIdx([indexes[0], 0, indexes[2], sheet.colCount - 1], null, true, null, null, null, idx);
            }
            else {
                indexes = getRangeIndexes(rng);
                _this.highlightHdr(indexes, idx === 0 ? false : true, indexes[0] >= _this.parent.viewport.topIndex || indexes[2] >= _this.parent.viewport.topIndex, indexes[1] >= _this.parent.viewport.leftIndex || indexes[3] >= _this.parent.viewport.leftIndex);
            }
        });
    };
    Selection.prototype.clearInterval = function () {
        clearInterval(this.scrollInterval);
        this.scrollInterval = null;
    };
    Selection.prototype.getScrollLeft = function () {
        return this.parent.scrollModule ? this.parent.scrollModule.prevScroll.scrollLeft : 0;
    };
    Selection.prototype.cellNavigateHandler = function (args) {
        var sheet = this.parent.getActiveSheet();
        if (sheet.isProtected && !sheet.protectSettings.selectCells) {
            return;
        }
        this.selectRangeByIdx(args.range.concat(args.range));
    };
    Selection.prototype.getColIdxFromClientX = function (e) {
        var width = 0;
        var sheet = this.parent.getActiveSheet();
        var left = 0;
        if (e.isImage) {
            left = e.clientX;
        }
        else {
            var cliRect = document.getElementById(this.parent.element.id + '_sheet').getBoundingClientRect();
            if (this.parent.enableRtl) {
                left = (cliRect.right - this.parent.sheetModule.getRowHeaderWidth(sheet, true) - 1) - e.clientX;
            }
            else {
                left = e.clientX - (cliRect.left + this.parent.sheetModule.getRowHeaderWidth(sheet, true) + 1);
            }
            left += this.parent.viewport.beforeFreezeWidth;
            if (!e.target || (e.target && !closest(e.target, '.e-row-header') && !closest(e.target, '.e-selectall-container'))) {
                left += this.getScrollLeft();
            }
        }
        for (var i = 0;; i++) {
            width += getColumnWidth(sheet, i, null, true);
            if (left < width || (this.parent.scrollSettings.isFinite && i === sheet.colCount - 1)) {
                if (!e.isImage) {
                    e.size = left;
                }
                e.clientX = i;
                return i;
            }
        }
    };
    Selection.prototype.getRowIdxFromClientY = function (args) {
        var height = 0;
        var sheet = this.parent.getActiveSheet();
        var top = 0;
        if (args.isImage) {
            top = args.clientY;
        }
        else {
            var sheetEle = document.getElementById(this.parent.element.id + '_sheet');
            top = args.clientY + this.parent.viewport.beforeFreezeHeight -
                (sheetEle.getBoundingClientRect().top + (sheet.showHeaders ? 31 : 0));
            if (!args.target || (args.target && !closest(args.target, '.e-header-panel'))) {
                top += this.parent.getMainContent().parentElement.scrollTop;
            }
        }
        for (var i = 0;; i++) {
            height += getRowHeight(sheet, i, true);
            if (top < height || (this.parent.scrollSettings.isFinite && i === sheet.rowCount - 1)) {
                if (!args.isImage) {
                    args.size = top;
                }
                args.clientY = i;
                return i;
            }
        }
    };
    Selection.prototype.initFormulaReferenceIndicator = function (range) {
        if (this.parent.isEdit) {
            var forRefIndicator = this.parent.createElement('div', { className: 'e-formularef-indicator' });
            forRefIndicator.appendChild(this.parent.createElement('div', { className: 'e-top' }));
            forRefIndicator.appendChild(this.parent.createElement('div', { className: 'e-bottom' }));
            forRefIndicator.appendChild(this.parent.createElement('div', { className: 'e-left' }));
            forRefIndicator.appendChild(this.parent.createElement('div', { className: 'e-right' }));
            this.parent.getMainContent().appendChild(forRefIndicator);
            setPosition(this.parent, forRefIndicator, range, 'e-formularef-indicator');
        }
    };
    Selection.prototype.selectRangeByIdx = function (range, e, isScrollRefresh, isActCellChanged, isInit, skipChecking, selectedRowColIdx) {
        var eventArgs = { action: 'getCurrentEditValue', editedValue: '' };
        this.parent.notify(editOperation, eventArgs);
        var isFormulaEdit = checkIsFormula(eventArgs.editedValue) ||
            (eventArgs.editedValue && eventArgs.editedValue.toString().indexOf('=') === 0);
        var isMultiRange = e && e.ctrlKey && isMouseDown(e);
        var ele = this.getSelectionElement(e, selectedRowColIdx);
        var sheet = this.parent.getActiveSheet();
        var formulaRefIndicator = this.parent.element.querySelector('.e-formularef-indicator');
        var mergeArgs = { range: [].slice.call(range), isActiveCell: false, skipChecking: skipChecking };
        var isMergeRange;
        var overlayEle = document.querySelector('.e-datavisualization-chart.e-ss-overlay-active');
        if (!this.isColSelected && !this.isRowSelected) {
            this.parent.notify(mergedRange, mergeArgs);
        }
        if (range !== mergeArgs.range) {
            isMergeRange = true;
        }
        range = mergeArgs.range;
        var args = { range: getRangeAddress(range), cancel: false };
        this.parent.trigger('beforeSelect', args);
        if (args.cancel) {
            return;
        }
        if (isFormulaEdit && formulaRefIndicator) {
            formulaRefIndicator.parentElement.removeChild(formulaRefIndicator);
        }
        if ((isSingleCell(range) || mergeArgs.isActiveCell) && !isMultiRange) {
            if (ele) {
                if (!ele.classList.contains('e-multi-range')) {
                    ele.classList.add('e-hide');
                }
                if (sheet.frozenRows || sheet.frozenColumns) {
                    removeRangeEle(this.parent.getSelectAllContent(), null, false);
                    removeRangeEle(this.parent.getColumnHeaderContent(), null, false);
                    removeRangeEle(this.parent.getRowHeaderContent(), null, false);
                }
            }
            if (!sheet.frozenColumns && !sheet.frozenRows && ele) {
                setPosition(this.parent, ele, range);
            }
            if (isFormulaEdit && e && e.target && !e.target.classList.contains('e-spreadsheet-edit')
                && this.parent.isEdit) {
                this.parent.notify(addressHandle, { range: getRangeAddress(range).split(':')[0], isSelect: true });
                this.initFormulaReferenceIndicator(range);
            }
        }
        else {
            if (isFormulaEdit && this.parent.isEdit) {
                if (e && e.target && !e.target.classList.contains('e-spreadsheet-edit') && this.parent.isEdit) {
                    this.parent.notify(addressHandle, { range: getRangeAddress(range), isSelect: true });
                    this.initFormulaReferenceIndicator(range);
                }
            }
            else {
                if (ele) {
                    ele.classList.remove('e-hide');
                }
                var offset = (this.isColSelected && this.isRowSelected) ? undefined
                    : this.getOffset(range[2], range[3]);
                if (isMergeRange && offset) { // Need to handle half hidden merge cell in better way
                    offset.left = { idx: 0, size: 0 };
                }
                setPosition(this.parent, ele, range);
            }
        }
        var eArgs = { action: 'getCurrentEditSheetIdx', sheetIndex: null };
        this.parent.notify(editOperation, eArgs);
        var selRange = getRangeAddress(range);
        if (e && e.ctrlKey && (isMouseMove(e) || isMouseUp(e))) {
            selRange = sheet.selectedRange.slice(0, sheet.selectedRange.lastIndexOf(' ')) + ' ' + selRange;
        }
        else if (selectedRowColIdx > -1) {
            var selRanges = sheet.selectedRange.split(' ');
            selRanges[selectedRowColIdx] = selRange;
            selRange = selRanges.join(' ');
        }
        if (!isFormulaEdit) {
            updateSelectedRange(this.parent, selRange, sheet, isMultiRange);
        }
        else if (!isInit) {
            updateSelectedRange(this.parent, selRange, sheet, isMultiRange);
        }
        this.UpdateRowColSelected(range);
        this.highlightHdr(range, e && e.ctrlKey);
        if (!isScrollRefresh && !(e && (e.type === 'mousemove' || isTouchMove(e)))) {
            if (!isFormulaEdit) {
                this.updateActiveCell(isActCellChanged ? getRangeIndexes(sheet.activeCell) : range, isInit);
            }
            else if (eArgs.sheetIndex === this.parent.getActiveSheet().id - 1 && isInit) {
                isActCellChanged = true;
                this.updateActiveCell(isActCellChanged ? getRangeIndexes(sheet.activeCell) : range, isInit);
            }
            else if (!this.parent.isEdit) {
                this.updateActiveCell(isActCellChanged ? getRangeIndexes(sheet.activeCell) : range, isInit);
            }
        }
        if (isNullOrUndefined(e)) {
            e = { type: 'mousedown' };
        }
        if (!isFormulaEdit) {
            this.parent.notify(selectionComplete, e);
        }
        else if (!isInit) {
            this.parent.notify(selectionComplete, e);
        }
        this.parent.notify(showAggregate, {});
        this.parent.notify(refreshImgElem, {});
        if (overlayEle) {
            this.parent.notify(removeDesignChart, {});
        }
        this.parent.notify(clearChartBorder, {});
    };
    Selection.prototype.UpdateRowColSelected = function (indexes) {
        var sheet = this.parent.getActiveSheet();
        this.isRowSelected = (indexes[1] === 0 && indexes[3] === sheet.colCount - 1);
        this.isColSelected = (indexes[0] === 0 && indexes[2] === sheet.rowCount - 1);
    };
    Selection.prototype.updateActiveCell = function (range, isInit) {
        var sheet = this.parent.getActiveSheet();
        var topLeftIdx = getRangeIndexes(sheet.topLeftCell);
        var rowIdx;
        var colIdx;
        var isMergeRange;
        if (this.isColSelected) {
            rowIdx = topLeftIdx[0];
            colIdx = range[1];
            if (this.isRowSelected) {
                colIdx = topLeftIdx[1];
            }
        }
        else {
            rowIdx = range[0];
            colIdx = range[1];
            if (this.isRowSelected) {
                colIdx = topLeftIdx[1];
            }
        }
        var mergeArgs = { range: [rowIdx, colIdx].concat([rowIdx, colIdx]) };
        this.parent.notify(activeCellMergedRange, mergeArgs);
        if (range !== mergeArgs.range) {
            isMergeRange = true;
        }
        range = mergeArgs.range;
        if (sheet.activeCell !== getCellAddress(range[0], range[1]) || isInit) {
            this.parent.setSheetPropertyOnMute(sheet, 'activeCell', getCellAddress(range[0], range[1]));
            if (this.getActiveCell()) {
                var offset = this.getOffset(range[2], range[3]);
                if (isMergeRange) {
                    offset.left = { idx: 0, size: 0 };
                }
                setPosition(this.parent, this.getActiveCell(), range, 'e-active-cell');
            }
            this.parent.notify(activeCellChanged, null);
        }
        else {
            setPosition(this.parent, this.getActiveCell(), range, 'e-active-cell');
        }
    };
    Selection.prototype.getOffset = function (rowIdx, colIdx) {
        var offset = { left: { idx: 0, size: 0 }, top: { idx: 0, size: 0 } };
        if (this.parent.scrollModule) {
            if (colIdx >= this.parent.scrollModule.offset.left.idx) {
                offset.left = this.parent.scrollModule.offset.left;
            }
            if (rowIdx >= this.parent.scrollModule.offset.top.idx) {
                offset.top = this.parent.scrollModule.offset.top;
            }
        }
        return offset;
    };
    Selection.prototype.getSelectionElement = function (e, selectedRowColIdx) {
        if (e && e.ctrlKey) {
            if (isMouseUp(e) || isMouseMove(e)) {
                return this.parent.getMainContent().querySelector('.e-selection:last-child');
            }
            else {
                var selElem = this.parent.element.getElementsByClassName('e-selection')[0];
                selElem.classList.remove('e-hide');
                var ele = selElem.cloneNode();
                ele.classList.add('e-multi-range');
                return this.parent.getMainContent().appendChild(ele);
            }
        }
        else if (selectedRowColIdx > -1) {
            return this.parent.getMainContent().getElementsByClassName('e-selection')[selectedRowColIdx];
        }
        else {
            var elems = [].slice.call(this.parent.element.getElementsByClassName('e-multi-range'));
            elems.forEach(function (ele) {
                remove(ele);
            });
            return this.parent.getMainContent().getElementsByClassName('e-selection')[0];
        }
    };
    Selection.prototype.getActiveCell = function () {
        return this.parent.getMainContent().getElementsByClassName('e-active-cell')[0];
    };
    Selection.prototype.getSheetElement = function () {
        return document.getElementById(this.parent.element.id + '_sheet');
    };
    Selection.prototype.highlightHdr = function (range, isMultiRange, isRowRefresh, isColRefresh) {
        if (isRowRefresh === void 0) { isRowRefresh = true; }
        if (isColRefresh === void 0) { isColRefresh = true; }
        if (this.parent.getActiveSheet().showHeaders) {
            var sheet = this.parent.getActiveSheet();
            var rowHdr = [];
            var colHdr = [];
            var swapRange = getSwapRange(range);
            swapRange = this.getHdrIndexes(swapRange);
            var selectAll = this.parent.element.getElementsByClassName('e-select-all-cell')[0];
            if (!isMultiRange) {
                removeClass(this.getSheetElement().querySelectorAll('.e-highlight'), 'e-highlight');
                removeClass(this.getSheetElement().querySelectorAll('.e-prev-highlight'), 'e-prev-highlight');
            }
            if (selectAll) {
                removeClass([selectAll], ['e-prev-highlight-right', 'e-prev-highlight-bottom']);
            }
            if (isRowRefresh) {
                var frozenRow = this.parent.frozenRowCount(sheet);
                var selectAll_1;
                var td = void 0;
                var selectAllHdr = this.parent.getSelectAllContent().querySelector('tbody');
                if (selectAllHdr) {
                    selectAll_1 = [].slice.call(selectAllHdr.querySelectorAll('.e-header-cell'));
                }
                var header = [].slice.call(this.parent.getRowHeaderContent().querySelectorAll('.e-header-cell'));
                var topIndex = getCellIndexes(sheet.topLeftCell)[0];
                for (var i = swapRange[0]; i < swapRange[2] + 1; i++) {
                    if (i < frozenRow) {
                        td = selectAll_1[i - topIndex];
                    }
                    else {
                        td = header[i - frozenRow];
                    }
                    if (td) {
                        rowHdr.push(td);
                    }
                }
            }
            if (isColRefresh) {
                var frozenCol = this.parent.frozenColCount(sheet);
                var selectAll_2;
                var td = void 0;
                var selectAllHdr = this.parent.getSelectAllContent().querySelector('thead');
                if (selectAllHdr) {
                    selectAll_2 = [].slice.call(selectAllHdr.querySelectorAll('.e-header-cell'));
                }
                var header = [].slice.call(this.parent.getColumnHeaderContent().querySelectorAll('th'));
                var leftIndex = getCellIndexes(sheet.topLeftCell)[1];
                for (var i = swapRange[1]; i < swapRange[3] + 1; i++) {
                    if (i < frozenCol) {
                        td = selectAll_2[i - leftIndex];
                    }
                    else {
                        td = header[i - frozenCol];
                    }
                    if (td) {
                        colHdr.push(td);
                    }
                }
            }
            if (sheet.isProtected && !sheet.protectSettings.selectCells) {
                removeClass([].concat(rowHdr, colHdr), 'e-highlight');
            }
            else {
                addClass([].concat(rowHdr, colHdr), 'e-highlight');
            }
            if (rowHdr.length && rowHdr[0].parentElement.previousElementSibling) {
                rowHdr[0].parentElement.previousElementSibling.classList.add('e-prev-highlight');
            }
            if (colHdr.length && colHdr[0].previousElementSibling) {
                colHdr[0].previousElementSibling.classList.add('e-prev-highlight');
            }
            if (this.isRowSelected && this.isColSelected) {
                if (sheet.isProtected && !sheet.protectSettings.selectCells) {
                    document.getElementById(this.parent.element.id + "_select_all").classList.remove('e-highlight');
                }
                else {
                    document.getElementById(this.parent.element.id + "_select_all").classList.add('e-highlight');
                }
            }
            if (selectAll) {
                if (swapRange[0] === 0) {
                    selectAll.classList.add('e-prev-highlight-bottom');
                }
                if (swapRange[1] === 0) {
                    selectAll.classList.add('e-prev-highlight-right');
                }
            }
        }
    };
    Selection.prototype.protectHandler = function () {
        var range = getRangeIndexes(this.parent.getActiveSheet().selectedRange);
        var swapRange = getSwapRange(range);
        var actRange = getCellIndexes(this.parent.getActiveSheet().activeCell);
        var inRange = swapRange[0] <= actRange[0] && swapRange[2] >= actRange[0] && swapRange[1] <= actRange[1]
            && swapRange[3] >= actRange[1];
        this.selectRangeByIdx(range, null, null, inRange);
    };
    Selection.prototype.getHdrIndexes = function (range) {
        if (this.parent.scrollSettings.enableVirtualization) {
            var indexes = [];
            var hiddenRowCount = this.parent.hiddenCount(this.parent.viewport.topIndex, range[0]);
            var hiddenColCount = this.parent.hiddenCount(this.parent.viewport.leftIndex, range[1], 'columns');
            indexes[0] = this.isColSelected ? range[0] : (range[0] - this.parent.viewport.topIndex) < 0
                ? 0 : ((range[0] - hiddenRowCount) - this.parent.viewport.topIndex);
            indexes[1] = this.isRowSelected ? range[1] : (range[1] - this.parent.viewport.leftIndex) < 0
                ? 0 : ((range[1] - hiddenColCount) - this.parent.viewport.leftIndex);
            indexes[2] = this.isColSelected ? this.parent.viewport.rowCount + this.parent.getThreshold('row') * 2 : range[2] -
                this.parent.hiddenCount(range[0], range[2]) - hiddenRowCount - this.parent.viewport.topIndex;
            indexes[3] = this.isRowSelected ? this.parent.viewport.colCount + this.parent.getThreshold('col') * 2 :
                range[3] - this.parent.hiddenCount(range[1], range[3], 'columns') - hiddenColCount - this.parent.viewport.leftIndex;
            return indexes;
        }
        return range;
    };
    Selection.prototype.initiateFormulaSelection = function (args) {
        this.processFormulaEditRange(args.range, args.formulaSheetIdx);
    };
    Selection.prototype.processFormulaEditRange = function (val, formulaStartSheetIdx) {
        var str;
        var formulaSheetIdx = formulaStartSheetIdx;
        var i = 0;
        var parsedVal = this.parseFormula(val);
        var len = parsedVal.length;
        var ctrlKeyCount = 0;
        var formulaBorder = [['e-vborderright', 'e-vborderbottom'], ['e-pborderright', 'e-pborderbottom'],
            ['e-cborderright', 'e-cborderbottom'], ['e-gborderright', 'e-gborderbottom'], ['e-oborderright', 'e-oborderbottom'],
            ['e-bborderright', 'e-bborderbottom']];
        this.clearBorder();
        var actSheetIdx = this.parent.getActiveSheet().id - 1;
        while (i < len) {
            str = parsedVal[i];
            if (this.invalidOperators.indexOf(str) > -1) {
                break;
            }
            if (isCellReference(str.toUpperCase())) {
                str = str.replace(/\$/g, '');
                if (i > 0) {
                    if (parsedVal[i - 1].indexOf('!') === parsedVal[i - 1].length - 1) {
                        var splitStr = parsedVal[i - 1].split('!');
                        formulaSheetIdx = getSheetIndex(this.parent, splitStr[0].substring(1, splitStr[0].length - 1));
                    }
                }
                if (parsedVal[i + 1] === ':') {
                    i++;
                    if (parsedVal[i + 1] && isCellReference(parsedVal[i + 1].toUpperCase())) {
                        str = str + ':' + parsedVal[i + 1];
                        i++;
                    }
                }
                if (actSheetIdx === formulaSheetIdx) {
                    this.updateFormulaEditRange(str, ctrlKeyCount, formulaBorder);
                }
                formulaSheetIdx = formulaStartSheetIdx;
                ctrlKeyCount++;
            }
            i++;
        }
    };
    Selection.prototype.updateFormulaEditRange = function (str, i, formulaBorder) {
        var indices = getRangeIndexes(str);
        this.formulaRange[i] = str;
        this.dStartCell = { rowIndex: indices[0], colIndex: indices[1] };
        this.dEndCell = { rowIndex: indices[2], colIndex: indices[3] };
        this.focusBorder(this.dStartCell, this.dEndCell, formulaBorder[i % 6]);
    };
    Selection.prototype.chartBorderHandler = function (args) {
        this.focusBorder(args.startcell, args.endcell, args.classes, true);
    };
    Selection.prototype.focusBorder = function (startcell, endcell, classes, isChart) {
        isChart = isNullOrUndefined(isChart) ? false : isChart;
        var range = getSwapRange([startcell.rowIndex, startcell.colIndex, endcell.rowIndex, endcell.colIndex]);
        var sheet = this.parent.getActiveSheet();
        if (sheet.frozenRows || sheet.frozenColumns) {
            var rangeReference = this.parent.createElement('div', {
                className: isChart ? 'e-range-indicator e-chart-range' : 'e-range-indicator e-formuala-range'
            });
            rangeReference.appendChild(this.parent.createElement('div', { className: 'e-top' }));
            rangeReference.appendChild(this.parent.createElement('div', { className: 'e-bottom' }));
            rangeReference.appendChild(this.parent.createElement('div', { className: 'e-left' }));
            rangeReference.appendChild(this.parent.createElement('div', { className: 'e-right' }));
            setPosition(this.parent, rangeReference, range, 'e-range-indicator');
            return;
        }
        var minr = range[0];
        var minc = range[1];
        var maxr = range[2];
        var maxc = range[3];
        if (minr) {
            (this.getEleFromRange([minr - 1, minc, minr - 1, maxc])).forEach(function (td) {
                if (td) {
                    td.classList.add(classes[1]);
                    if (!isChart) {
                        td.classList.add('e-formularef-selection');
                    }
                }
            }); // top
        }
        (this.getEleFromRange([minr, maxc, maxr, maxc])).forEach(function (td) {
            if (td) {
                td.classList.add(classes[0]);
                if (!isChart) {
                    td.classList.add('e-formularef-selection');
                }
            }
        }); // right
        this.getEleFromRange([maxr, minc, maxr, maxc]).forEach(function (td) {
            if (td) {
                td.classList.add(classes[1]);
                if (!isChart) {
                    td.classList.add('e-formularef-selection');
                }
            }
        }); // bottom
        if (minc) {
            (this.getEleFromRange([minr, minc - 1, maxr, minc - 1])).forEach(function (td) {
                if (td) {
                    td.classList.add(classes[0]);
                    if (!isChart) {
                        td.classList.add('e-formularef-selection');
                    }
                }
            }); // left
        }
    };
    Selection.prototype.getEleFromRange = function (range) {
        var startRIndex = range[0];
        var startCIndex = range[1];
        var endRIndex = range[2];
        var endCIndex = range[3];
        var i;
        var rowIdx;
        var temp;
        var tempCells = [];
        var rowCells;
        var cells = [];
        if (startRIndex > endRIndex) {
            temp = startRIndex;
            startRIndex = endRIndex;
            endRIndex = temp;
        }
        if (startCIndex > endCIndex) {
            temp = startCIndex;
            startCIndex = endCIndex;
            endCIndex = temp;
        }
        if (this.parent.scrollSettings.enableVirtualization) {
            for (i = startRIndex; i <= endRIndex; i++) {
                rowIdx = i;
                if (rowIdx > -1) {
                    var row = this.parent.getRow(rowIdx, null);
                    if (row) {
                        rowCells = row.getElementsByClassName('e-cell');
                        tempCells = (endCIndex === startCIndex) ?
                            [rowCells[endCIndex]] : this.getRowCells(rowCells, startCIndex, endCIndex + 1);
                        this.merge(cells, tempCells);
                    }
                }
            }
        }
        return cells;
    };
    Selection.prototype.getRowCells = function (rowCells, startCIndex, endCIndex) {
        var tdCol = [];
        for (startCIndex; startCIndex < endCIndex; startCIndex++) {
            if (rowCells[startCIndex]) {
                tdCol.push(rowCells[startCIndex]);
            }
        }
        return tdCol;
    };
    Selection.prototype.merge = function (first, second) {
        if (!first || !second) {
            return;
        }
        Array.prototype.push.apply(first, second);
    };
    Selection.prototype.clearBorder = function () {
        var sheet = this.parent.getActiveSheet();
        if (sheet.frozenColumns || sheet.frozenRows) {
            var formualIndicator = [].slice.call(this.parent.element.getElementsByClassName('e-formuala-range'));
            formualIndicator.forEach(function (indicator) { detach(indicator); });
            return;
        }
        var borderEleColl = this.parent.element.getElementsByClassName('e-formularef-selection');
        for (var idx = 0; idx < borderEleColl.length; idx++) {
            var td = borderEleColl[idx];
            var classArr = ['e-vborderright', 'e-vborderbottom', 'e-pborderright', 'e-pborderbottom',
                'e-cborderright', 'e-cborderbottom', 'e-gborderright', 'e-gborderbottom', 'e-oborderright',
                'e-oborderbottom', 'e-bborderright', 'e-bborderbottom'];
            for (var idx_1 = 0; idx_1 < classArr.length; idx_1++) {
                td.classList.remove(classArr[idx_1]);
            }
        }
        // for (let idx: number = 0; idx < borderEleColl.length; idx++) {
        //     const td: HTMLElement = borderEleColl[idx] as HTMLElement;
        // }
    };
    Selection.prototype.parseFormula = function (formulaStr) {
        var tempStr;
        var str;
        var i = 0;
        var arr = [];
        formulaStr = this.markSpecialChar(formulaStr.replace('=', ''));
        var formula = formulaStr.split(/\(|\)|=|\^|>|<|,|:|\+|-|\*|\/|%|&/g);
        var len = formula.length;
        while (i < len) {
            tempStr = formula[i];
            if (!tempStr) {
                i++;
                continue;
            }
            if (tempStr.length === 1) {
                arr.push(this.isUniqueChar(tempStr) ? this.getUniqueCharVal(tempStr) : tempStr);
            }
            else {
                str = tempStr[0];
                if (tempStr.indexOf('!') > 0) {
                    if (this.isUniqueChar(str)) {
                        arr.push(this.getUniqueCharVal(str));
                        tempStr = tempStr.substr(1);
                    }
                    var strVal = tempStr.indexOf('!') + 1;
                    arr.push(tempStr.substr(0, strVal));
                    arr.push(tempStr.substr(strVal));
                }
                else if (this.isUniqueChar(str)) {
                    arr.push(this.getUniqueCharVal(str));
                    arr.push(tempStr.substr(1));
                }
                else {
                    arr.push(tempStr);
                }
            }
            i++;
        }
        return arr;
    };
    Selection.prototype.isUniqueChar = function (str) {
        var code = str.charCodeAt(str.charAt[0]);
        return code >= 129 && code <= 142;
    };
    Selection.prototype.getUniqueCharVal = function (tempStr) {
        switch (tempStr) {
            case this.uniqueOBracket:
                return '(';
            case this.uniqueCBracket:
                return ')';
            case this.uniqueCOperator:
                return ':';
            case this.uniqueSOperator:
                return '-';
            case this.uniquePOperator:
                return '+';
            case this.uniqueMOperator:
                return '*';
            case this.uniqueDOperator:
                return '/';
            case this.uniqueModOperator:
                return '%';
            case this.uniqueCSeparator:
                return ',';
            case this.uniqueConcateOperator:
                return '&';
            case this.uniqueEqualOperator:
                return '=';
            case this.uniqueExpOperator:
                return '^';
            case this.uniqueLTOperator:
                return '<';
            case this.uniqueGTOperator:
                return '>';
        }
        return '';
    };
    Selection.prototype.markSpecialChar = function (formulaVal) {
        formulaVal = formulaVal.replace(/\(/g, '(' + this.uniqueOBracket).replace(/\)/g, ')' + this.uniqueCBracket);
        formulaVal = formulaVal.replace(/,/g, ',' + this.uniqueCSeparator).replace(/:/g, ':' + this.uniqueCOperator);
        formulaVal = formulaVal.replace(/\+/g, '+' + this.uniquePOperator).replace(/-/g, '-' + this.uniqueSOperator);
        formulaVal = formulaVal.replace(/\*/g, '*' + this.uniqueMOperator).replace(/\//g, '/' + this.uniqueDOperator);
        formulaVal = formulaVal.replace(/&/g, '&' + this.uniqueConcateOperator);
        formulaVal = formulaVal.replace(/=/g, '=' + this.uniqueEqualOperator);
        formulaVal = formulaVal.replace(/\^/g, '^' + this.uniqueExpOperator);
        formulaVal = formulaVal.replace(/>/g, '>' + this.uniqueGTOperator).replace(/</g, '<' + this.uniqueLTOperator);
        return formulaVal.replace(/%/g, '%' + this.uniqueModOperator);
    };
    /**
     * For internal use only - Get the module name.
     *
     * @private
     * @returns {string} - Get the module name.
     */
    Selection.prototype.getModuleName = function () {
        return 'selection';
    };
    Selection.prototype.destroy = function () {
        this.removeEventListener();
        this.parent = null;
    };
    return Selection;
}());
export { Selection };
