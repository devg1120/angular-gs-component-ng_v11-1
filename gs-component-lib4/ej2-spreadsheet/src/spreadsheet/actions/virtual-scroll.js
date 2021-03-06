import { closest, isNullOrUndefined } from '@syncfusion/ej2-base';
import { spreadsheetDestroyed, beforeContentLoaded, beforeVirtualContentLoaded, virtualContentLoaded } from '../common/index';
import { colWidthChanged, updateTableWidth, focus } from '../common/index';
import { onVerticalScroll, onHorizontalScroll, rowHeightChanged, deInitProperties } from '../common/index';
import { getRowHeight, getRowsHeight, getColumnWidth, getColumnsWidth } from './../../workbook/index';
import { getCellIndexes, getRangeAddress } from '../../workbook/common/index';
import { updateUsedRange, sheetCreated, sheetsDestroyed } from '../../workbook/common/event';
/**
 * VirtualScroll module
 *
 * @hidden
 */
var VirtualScroll = /** @class */ (function () {
    function VirtualScroll(parent) {
        this.scroll = [];
        this.parent = parent;
        this.addEventListener();
    }
    VirtualScroll.prototype.createVirtualElement = function (args) {
        var sheet = this.parent.getActiveSheet();
        var container = this.parent.getMainContent();
        this.content = this.parent.createElement('div', { className: 'e-virtualable' });
        this.content.appendChild(container.querySelector('.e-table'));
        container.appendChild(this.content);
        var vTrack = container.appendChild(this.parent.createElement('div', { className: 'e-virtualtrack' }));
        var height = 0;
        var width;
        if (this.parent.sheets.length > this.scroll.length) {
            this.initScroll();
        }
        var endIndex = this.parent.viewport.bottomIndex;
        if (sheet.rowCount > endIndex + 1 || sheet.usedRange.rowIndex > endIndex) {
            if (!this.parent.scrollSettings.isFinite && sheet.rowCount <= sheet.usedRange.rowIndex) {
                this.parent.setSheetPropertyOnMute(sheet, 'rowCount', sheet.usedRange.rowIndex + 1);
            }
            this.setScrollCount(sheet.rowCount, 'row');
        }
        else {
            if (!this.parent.scrollSettings.isFinite) {
                this.parent.setSheetPropertyOnMute(sheet, 'rowCount', endIndex + 1);
            }
            this.scroll[this.parent.activeSheetIndex].rowCount = sheet.rowCount;
        }
        var startIndex = this.parent.frozenRowCount(sheet);
        var indexes = getCellIndexes(sheet.topLeftCell);
        if (args.top) {
            height = args.top;
            if (sheet.frozenRows) {
                height += getRowsHeight(sheet, indexes[0], startIndex - 1, true);
            }
            startIndex = getCellIndexes(sheet.paneTopLeftCell)[0];
        }
        height += getRowsHeight(sheet, startIndex, this.scroll[this.parent.activeSheetIndex].rowCount - 1, true);
        endIndex = this.parent.viewport.rightIndex;
        var size = 0;
        var frozenCol = this.parent.frozenColCount(sheet);
        if (args.left) {
            size = args.left;
            if (frozenCol) {
                size += getColumnsWidth(sheet, indexes[1], frozenCol - 1, true);
            }
            startIndex = getCellIndexes(sheet.paneTopLeftCell)[1];
        }
        else {
            startIndex = frozenCol;
        }
        if (sheet.colCount > endIndex + 1 || sheet.usedRange.colIndex > endIndex) {
            if (!this.parent.scrollSettings.isFinite && sheet.colCount <= sheet.usedRange.colIndex) {
                this.parent.setSheetPropertyOnMute(sheet, 'colCount', sheet.usedRange.colIndex + 1);
            }
            size += getColumnsWidth(sheet, startIndex, endIndex, true);
            this.setScrollCount(sheet.colCount, 'col');
            width = size + getColumnsWidth(sheet, endIndex + 1, this.scroll[this.parent.activeSheetIndex].colCount - 1, true);
        }
        else {
            if (!this.parent.scrollSettings.isFinite) {
                this.parent.setSheetPropertyOnMute(sheet, 'colCount', endIndex + 1);
            }
            size += getColumnsWidth(sheet, startIndex, sheet.colCount - 1, true);
            this.scroll[this.parent.activeSheetIndex].colCount = sheet.colCount;
            width = size;
        }
        if (isNullOrUndefined(this.parent.viewport.leftIndex)) {
            this.parent.viewport.leftIndex = 0;
        }
        if (isNullOrUndefined(this.parent.viewport.topIndex)) {
            this.parent.viewport.topIndex = 0;
        }
        if (args.left) {
            size = getColumnsWidth(sheet, this.parent.viewport.leftIndex + frozenCol, endIndex, true);
        }
        if (isNullOrUndefined(this.translateX)) {
            this.translateX = 0;
        }
        if (isNullOrUndefined(this.translateY)) {
            this.translateY = 0;
        }
        container = this.parent.getRowHeaderContent();
        this.rowHeader = this.content.cloneNode();
        this.rowHeader.appendChild(container.querySelector('.e-table'));
        container.appendChild(this.rowHeader);
        var rowVTrack = container.appendChild(vTrack.cloneNode());
        this.rowHeader.style.transform = "translate(0px, " + this.translateY + "px)";
        container = this.parent.getColumnHeaderContent();
        this.colHeader = this.content.cloneNode();
        this.colHeader.appendChild(container.querySelector('.e-table'));
        container.appendChild(this.colHeader);
        var colVTrack = container.appendChild(vTrack.cloneNode());
        this.colHeader.style.width = size + "px";
        rowVTrack.style.height = height + "px";
        colVTrack.style.width = width + "px";
        this.colHeader.style.transform = "translate(" + this.translateX + "px, 0px)";
        this.content.style.transform = "translate(" + this.translateX + "px, " + this.translateY + "px)";
        this.content.style.width = size + "px";
        vTrack.style.height = height + "px";
        vTrack.style.width = width + "px";
        if (this.parent.allowScrolling) {
            this.parent.getScrollElement().appendChild(colVTrack.cloneNode(true));
        }
    };
    VirtualScroll.prototype.initScroll = function () {
        var i = 0;
        while (i < this.parent.sheets.length) {
            if (!this.scroll[i]) {
                this.scroll.push({ rowCount: 0, colCount: 0 });
            }
            i++;
        }
    };
    VirtualScroll.prototype.setScrollCount = function (count, layout) {
        var activeSheetIdx = this.parent.activeSheetIndex;
        if (!this.scroll[activeSheetIdx][layout + 'Count']) {
            this.scroll[activeSheetIdx][layout + 'Count'] = count;
        }
    };
    VirtualScroll.prototype.getRowAddress = function (indexes) {
        var sheet = this.parent.getActiveSheet();
        return getRangeAddress([indexes[0], sheet.frozenColumns ? getCellIndexes(sheet.topLeftCell)[1] : this.parent.viewport.leftIndex,
            indexes[1], this.parent.viewport.rightIndex]);
    };
    VirtualScroll.prototype.getColAddress = function (indexes) {
        var sheet = this.parent.getActiveSheet();
        return getRangeAddress([sheet.frozenRows ? getCellIndexes(sheet.topLeftCell)[0] : this.parent.viewport.topIndex, indexes[0],
            this.parent.viewport.bottomIndex, indexes[1]]);
    };
    VirtualScroll.prototype.updateScrollCount = function (idx, layout, threshold) {
        if (threshold === void 0) { threshold = idx; }
        var sheet = this.parent.getActiveSheet();
        var rowCount = idx + this.parent.viewport[layout + 'Count'] + 1 + threshold;
        var usedRangeCount = this.scroll[this.parent.activeSheetIndex][layout + 'Count'];
        if (rowCount < usedRangeCount) {
            if (sheet[layout + 'Count'] === usedRangeCount) {
                return;
            }
            rowCount = usedRangeCount;
        }
        if (!this.parent.scrollSettings.isFinite) {
            this.parent.setSheetPropertyOnMute(sheet, layout + 'Count', rowCount);
        }
    };
    VirtualScroll.prototype.onVerticalScroll = function (args) {
        var idx = args.cur.idx;
        var height = args.cur.size;
        var prevIdx = args.prev.idx;
        var idxDiff = Math.abs(idx - prevIdx);
        var threshold = this.parent.getThreshold('row');
        if (idxDiff > Math.round(threshold / 2)) {
            var startIdx = void 0;
            var lastIdx = void 0;
            var prevTopIdx = void 0;
            var sheet = this.parent.getActiveSheet();
            if (idx <= threshold) {
                if (!args.increase) {
                    if (this.translateY && prevIdx > threshold) {
                        this.translateY = 0;
                        var frozenCol = this.parent.frozenColCount(sheet);
                        var frozenRow = this.parent.frozenRowCount(sheet);
                        this.parent.viewport.topIndex = prevIdx - (threshold - frozenRow);
                        if (!args.preventScroll) {
                            var colIndex = frozenCol ? getCellIndexes(sheet.topLeftCell)[1] : this.parent.viewport.leftIndex;
                            var fIndexes = frozenCol ? [frozenRow, this.parent.viewport.leftIndex + frozenCol] : [];
                            if (idxDiff < this.parent.viewport.rowCount + threshold) {
                                lastIdx = this.parent.viewport.topIndex - 1;
                                startIdx = this.parent.skipHidden(frozenRow, lastIdx)[0];
                                this.parent.viewport.topIndex = this.skipHiddenIdx(startIdx - frozenRow, true);
                                var hiddenCount = this.hiddenCount(startIdx, lastIdx);
                                var skippedHiddenIdx = this.skipHiddenIdx((this.parent.viewport.bottomIndex - ((lastIdx - startIdx + 1) - hiddenCount)), args.increase);
                                this.parent.viewport.bottomIndex -= (((lastIdx - startIdx + 1) - hiddenCount) +
                                    (this.hiddenCount(skippedHiddenIdx, this.parent.viewport.bottomIndex)));
                                this.parent.renderModule.refreshUI({
                                    colIndex: colIndex, rowIndex: startIdx, direction: 'last', refresh: 'RowPart',
                                    skipUpdateOnFirst: true, frozenIndexes: fIndexes
                                }, this.getRowAddress([startIdx, this.skipHiddenIdx(lastIdx, false)]));
                            }
                            else {
                                var prevColIndex = this.parent.viewport.leftIndex;
                                this.parent.renderModule.refreshUI({ rowIndex: 0, colIndex: colIndex, refresh: 'Row', skipUpdateOnFirst: true,
                                    frozenIndexes: fIndexes });
                                if (frozenCol) {
                                    this.parent.viewport.leftIndex = prevColIndex;
                                }
                            }
                            focus(this.parent.element);
                        }
                    }
                    this.updateScrollCount(threshold, 'row');
                }
            }
            if (prevIdx < threshold) {
                idxDiff = Math.abs(idx - threshold);
            }
            if (idx > threshold) {
                prevTopIdx = this.parent.viewport.topIndex;
                this.parent.viewport.topIndex = idx - threshold;
                if (args.increase && prevTopIdx > this.parent.viewport.topIndex) {
                    this.parent.viewport.topIndex = prevTopIdx;
                    return;
                }
                var frozenRow = this.parent.frozenRowCount(sheet);
                this.translateY = height - this.getThresholdHeight(this.parent.viewport.topIndex + frozenRow, threshold);
                if (!args.preventScroll) {
                    var frozenCol = this.parent.frozenColCount(sheet);
                    var colIndex = frozenCol ? getCellIndexes(sheet.topLeftCell)[1] : this.parent.viewport.leftIndex;
                    var frozenIndexes = [];
                    if (sheet.frozenColumns) {
                        frozenIndexes = [frozenRow, this.parent.viewport.leftIndex + frozenCol];
                    }
                    if (idxDiff < this.parent.viewport.rowCount + threshold) {
                        if (args.increase) {
                            startIdx = this.parent.viewport.bottomIndex + 1;
                            lastIdx = this.parent.viewport.bottomIndex + (this.parent.viewport.topIndex - prevTopIdx);
                            lastIdx -= this.hiddenCount(prevTopIdx, this.parent.viewport.topIndex - 1);
                            this.parent.viewport.topIndex = this.skipHiddenIdx(this.parent.viewport.topIndex, args.increase);
                            if (lastIdx <= this.parent.viewport.bottomIndex) {
                                return;
                            }
                            var indexes = this.parent.skipHidden(startIdx, lastIdx);
                            startIdx = indexes[0];
                            lastIdx = this.checkLastIdx(indexes[1], 'row');
                            this.parent.viewport.bottomIndex = lastIdx;
                            this.parent.renderModule.refreshUI({ colIndex: colIndex, rowIndex: startIdx, direction: 'first', refresh: 'RowPart',
                                frozenIndexes: frozenIndexes }, this.getRowAddress([startIdx, lastIdx]));
                        }
                        else {
                            startIdx = this.parent.viewport.topIndex + frozenRow;
                            lastIdx = startIdx + idxDiff - 1;
                            var hiddenCount = this.hiddenCount(startIdx, lastIdx);
                            var skippedHiddenIdx = this.skipHiddenIdx((this.parent.viewport.bottomIndex - ((lastIdx - startIdx) - hiddenCount)), args.increase);
                            this.parent.viewport.bottomIndex -= ((idxDiff - hiddenCount) +
                                (this.hiddenCount(skippedHiddenIdx, this.parent.viewport.bottomIndex)));
                            startIdx = this.parent.skipHidden(startIdx, lastIdx)[0];
                            this.parent.viewport.topIndex = this.skipHiddenIdx(startIdx - frozenRow, true);
                            this.parent.renderModule.refreshUI({ colIndex: colIndex, rowIndex: startIdx, direction: 'last', refresh: 'RowPart',
                                frozenIndexes: frozenIndexes }, this.getRowAddress([startIdx, lastIdx]));
                        }
                    }
                    else {
                        prevTopIdx = this.parent.viewport.leftIndex;
                        this.parent.renderModule.refreshUI({
                            rowIndex: this.parent.viewport.topIndex, colIndex: colIndex, refresh: 'Row',
                            frozenIndexes: frozenIndexes
                        });
                        if (frozenCol) {
                            this.parent.viewport.leftIndex = prevTopIdx;
                        }
                    }
                    this.updateScrollCount(idx, 'row', threshold);
                    this.focusSheet();
                }
            }
            args.prev.idx = idx;
        }
    };
    VirtualScroll.prototype.skipHiddenIdx = function (index, increase, layout, sheet) {
        if (layout === void 0) { layout = 'rows'; }
        if (sheet === void 0) { sheet = this.parent.getActiveSheet(); }
        if ((sheet[layout])[index] && (sheet[layout])[index].hidden) {
            index = increase ? index++ : index--;
            index = this.skipHiddenIdx(index, increase, layout, sheet);
        }
        return index;
    };
    VirtualScroll.prototype.hiddenCount = function (startIdx, endIdx, layout) {
        if (layout === void 0) { layout = 'rows'; }
        var index = 0;
        var sheet = this.parent.getActiveSheet();
        for (var i = startIdx; i <= endIdx; i++) {
            if ((sheet[layout])[i] && (sheet[layout])[i].hidden) {
                index++;
            }
        }
        return index;
    };
    VirtualScroll.prototype.checkLastIdx = function (idx, layout) {
        if (this.parent.scrollSettings.isFinite) {
            var count = this.parent.getActiveSheet()[layout + 'Count'] - 1;
            if (idx > count) {
                idx = count;
            }
        }
        return idx;
    };
    VirtualScroll.prototype.onHorizontalScroll = function (args) {
        var idx = args.cur.idx;
        var width = args.cur.size;
        var prevIdx = args.prev.idx;
        var idxDiff = Math.abs(idx - prevIdx);
        var threshold = this.parent.getThreshold('col');
        if (idxDiff > Math.round(threshold / 2)) {
            var startIdx = void 0;
            var endIdx = void 0;
            var prevLeftIdx = void 0;
            var sheet = this.parent.getActiveSheet();
            if (idx <= threshold) {
                if (!args.increase) {
                    if (this.translateX && prevIdx > threshold) {
                        var frozenCol = this.parent.frozenColCount(sheet);
                        var frozenRow = this.parent.frozenRowCount(sheet);
                        this.translateX = 0;
                        this.parent.viewport.leftIndex = prevIdx - (threshold - frozenCol);
                        if (!args.preventScroll) {
                            var rowIndex = frozenRow ? getCellIndexes(sheet.topLeftCell)[0] : this.parent.viewport.topIndex;
                            var fIndexes = frozenRow ? [this.parent.viewport.topIndex + frozenRow, frozenCol] : [];
                            if (idxDiff < this.parent.viewport.colCount + threshold) {
                                endIdx = this.parent.viewport.leftIndex - 1;
                                startIdx = this.parent.skipHidden(frozenCol, endIdx, 'columns')[0];
                                this.parent.viewport.leftIndex = this.skipHiddenIdx(startIdx - frozenCol, true);
                                var hiddenCount = this.hiddenCount(startIdx, endIdx, 'columns');
                                var skippedHiddenIdx = this.skipHiddenIdx((this.parent.viewport.rightIndex - ((endIdx - startIdx + 1) - hiddenCount)), args.increase, 'columns');
                                this.parent.viewport.rightIndex -= (((endIdx - startIdx + 1) - hiddenCount) +
                                    (this.hiddenCount(skippedHiddenIdx, this.parent.viewport.rightIndex, 'columns')));
                                this.parent.renderModule.refreshUI({ rowIndex: rowIndex, colIndex: startIdx, direction: 'last', refresh: 'ColumnPart',
                                    skipUpdateOnFirst: true, frozenIndexes: fIndexes }, this.getColAddress([startIdx, this.skipHiddenIdx(endIdx, false, 'columns')]));
                            }
                            else {
                                var prevRowIndex = this.parent.viewport.topIndex;
                                this.parent.renderModule.refreshUI({ rowIndex: rowIndex, colIndex: 0, refresh: 'Column', skipUpdateOnFirst: true,
                                    frozenIndexes: fIndexes });
                                if (frozenRow) {
                                    this.parent.viewport.topIndex = prevRowIndex;
                                }
                            }
                            focus(this.parent.element);
                        }
                    }
                    this.updateScrollCount(threshold, 'col');
                }
            }
            if (prevIdx < threshold) {
                idxDiff = Math.abs(idx - threshold);
            }
            if (idx > threshold) {
                prevLeftIdx = this.parent.viewport.leftIndex;
                this.parent.viewport.leftIndex = idx - threshold;
                if (args.increase && prevLeftIdx > this.parent.viewport.leftIndex) {
                    this.parent.viewport.leftIndex = prevLeftIdx;
                    return;
                }
                var frozenCol = this.parent.frozenColCount(sheet);
                this.translateX = width - this.getThresholdWidth(this.parent.viewport.leftIndex + frozenCol, threshold);
                if (!args.preventScroll) {
                    var frozenRow = this.parent.frozenRowCount(sheet);
                    var rowIndex = frozenRow ? getCellIndexes(sheet.topLeftCell)[0] : this.parent.viewport.topIndex;
                    var frozenIndexes = [];
                    if (frozenRow) {
                        frozenIndexes = [frozenRow + this.parent.viewport.topIndex, frozenCol];
                    }
                    if (idxDiff < this.parent.viewport.colCount + threshold) {
                        if (args.increase) {
                            startIdx = this.parent.viewport.rightIndex + 1;
                            endIdx = this.parent.viewport.rightIndex + (this.parent.viewport.leftIndex - prevLeftIdx);
                            endIdx -= this.hiddenCount(prevLeftIdx, this.parent.viewport.leftIndex - 1, 'columns');
                            this.parent.viewport.leftIndex = this.skipHiddenIdx(this.parent.viewport.leftIndex, args.increase, 'columns');
                            if (endIdx <= this.parent.viewport.rightIndex) {
                                return;
                            }
                            var indexes = this.parent.skipHidden(startIdx, endIdx, 'columns');
                            startIdx = indexes[0];
                            endIdx = this.checkLastIdx(indexes[1], 'col');
                            this.parent.viewport.rightIndex = endIdx;
                            this.parent.renderModule.refreshUI({ rowIndex: rowIndex, colIndex: startIdx, direction: 'first', refresh: 'ColumnPart',
                                frozenIndexes: frozenIndexes }, this.getColAddress([startIdx, endIdx]));
                        }
                        else {
                            startIdx = this.parent.viewport.leftIndex + frozenCol;
                            endIdx = startIdx + idxDiff - 1;
                            var hiddenCount = this.hiddenCount(startIdx, endIdx, 'columns');
                            var skippedHiddenIdx = this.skipHiddenIdx((this.parent.viewport.rightIndex - ((endIdx - startIdx) - hiddenCount)), args.increase, 'columns');
                            this.parent.viewport.rightIndex -= ((idxDiff - hiddenCount) +
                                (this.hiddenCount(skippedHiddenIdx, this.parent.viewport.rightIndex, 'columns')));
                            startIdx = this.parent.skipHidden(startIdx, endIdx, 'columns')[0];
                            this.parent.viewport.leftIndex = this.skipHiddenIdx(startIdx - frozenCol, true, 'columns', sheet);
                            this.parent.renderModule.refreshUI({ rowIndex: rowIndex, colIndex: startIdx, direction: 'last', refresh: 'ColumnPart',
                                frozenIndexes: frozenIndexes }, this.getColAddress([startIdx, endIdx]));
                        }
                    }
                    else {
                        prevLeftIdx = this.parent.viewport.topIndex;
                        this.parent.renderModule.refreshUI({
                            rowIndex: rowIndex, colIndex: this.parent.viewport.leftIndex, refresh: 'Column', frozenIndexes: frozenIndexes
                        });
                        if (frozenRow) {
                            this.parent.viewport.topIndex = prevLeftIdx;
                        }
                    }
                    this.updateScrollCount(idx, 'col', threshold);
                    this.focusSheet();
                }
            }
            args.prev.idx = idx;
        }
    };
    VirtualScroll.prototype.focusSheet = function () {
        if (!document.activeElement.classList.contains('e-text-findNext-short') || !closest(document.activeElement, '#' + this.parent.element.id)) {
            focus(this.parent.element);
        }
    };
    VirtualScroll.prototype.getThresholdHeight = function (idx, threshold) {
        var height = 0;
        var sheet = this.parent.getActiveSheet();
        for (var i = idx; i < idx + threshold; i++) {
            height += getRowHeight(sheet, i, true);
        }
        return height;
    };
    VirtualScroll.prototype.getThresholdWidth = function (idx, threshold) {
        var width = 0;
        var sheet = this.parent.getActiveSheet();
        for (var i = idx; i < idx + threshold; i++) {
            width += getColumnWidth(sheet, i, null, true);
        }
        return width;
    };
    VirtualScroll.prototype.translate = function (args) {
        var translateX = this.parent.enableRtl ? -this.translateX : this.translateX;
        if (args.refresh === 'Row' || args.refresh === 'RowPart') {
            this.content.style.transform = "translate(" + translateX + "px, " + this.translateY + "px)";
            this.rowHeader.style.transform = "translate(0px, " + this.translateY + "px)";
        }
        if (args.refresh === 'Column' || args.refresh === 'ColumnPart') {
            this.content.style.transform = "translate(" + translateX + "px, " + this.translateY + "px)";
            this.colHeader.style.transform = "translate(" + translateX + "px, 0px)";
        }
    };
    VirtualScroll.prototype.updateColumnWidth = function (args) {
        if (args.refresh === 'Column') {
            this.content.style.width = '';
            var sheet = this.parent.getActiveSheet();
            var width = getColumnsWidth(sheet, this.parent.viewport.leftIndex + this.parent.frozenColCount(sheet), this.parent.viewport.rightIndex, true);
            this.colHeader.style.width = width + 'px';
            this.content.style.width = width + 'px';
            if (this.parent.allowScrolling) {
                var scroll_1 = this.parent.element.querySelector('.e-scroller .e-virtualtrack');
                var scrollWidth = parseInt(scroll_1.style.width, 10);
                var newWidth = width + this.translateX + this.parent.viewport.beforeFreezeWidth;
                if (newWidth > scrollWidth) {
                    var diff = newWidth - scrollWidth;
                    scroll_1.style.width = scrollWidth + diff + 'px';
                }
                else {
                    var diff = scrollWidth - newWidth;
                    var vTrack = this.parent.getMainContent().getElementsByClassName('e-virtualtrack')[0];
                    if (scrollWidth - diff < parseInt(vTrack.style.width, 10)) {
                        scroll_1.style.width = vTrack.style.width;
                    }
                }
            }
        }
        else {
            var vTrack = this.parent.getMainContent().getElementsByClassName('e-virtualtrack')[0];
            var vTrackHeight = parseInt(vTrack.style.height, 10);
            var height = this.content.getBoundingClientRect().height;
            var newHeight = height + this.translateY + this.parent.viewport.beforeFreezeHeight;
            if (newHeight > vTrackHeight) {
                var diff = newHeight - vTrackHeight;
                vTrack.style.height = vTrackHeight + diff + 'px';
            }
            else {
                var diff = vTrackHeight - newHeight;
                var hVTrack = this.parent.getRowHeaderContent().getElementsByClassName('e-virtualtrack')[0];
                if (vTrackHeight - diff < parseInt(hVTrack.style.height, 10)) {
                    vTrack.style.height = hVTrack.style.height;
                }
            }
        }
    };
    VirtualScroll.prototype.updateUsedRange = function (args) {
        if (!this.scroll.length) {
            return;
        }
        var sheet = this.parent.getActiveSheet();
        if (args.update === 'row') {
            if (args.index !== this.scroll[this.parent.activeSheetIndex].rowCount - 1) {
                var height = this.getVTrackHeight('height');
                var newHeight = height;
                if (args.index >= this.scroll[this.parent.activeSheetIndex].rowCount) {
                    newHeight += getRowsHeight(sheet, this.scroll[this.parent.activeSheetIndex].rowCount, args.index, true);
                }
                else {
                    newHeight -= getRowsHeight(sheet, args.index + 1, this.scroll[this.parent.activeSheetIndex].rowCount - 1, true);
                }
                if (newHeight < height) {
                    return;
                }
                this.scroll[this.parent.activeSheetIndex].rowCount = args.index + 1;
                this.updateVTrack(this.rowHeader, height, 'height');
                if (this.scroll[this.parent.activeSheetIndex].rowCount > sheet.rowCount) {
                    this.parent.setSheetPropertyOnMute(sheet, 'rowCount', this.scroll[this.parent.activeSheetIndex].rowCount);
                }
            }
        }
        else {
            if (args.index > this.scroll[this.parent.activeSheetIndex].colCount) {
                var width = this.getVTrackHeight('width');
                width += getColumnsWidth(sheet, this.scroll[this.parent.activeSheetIndex].colCount, args.index, true);
                this.scroll[this.parent.activeSheetIndex].colCount = args.index + 1;
                this.updateVTrack(this.colHeader, width, 'width');
                if (this.scroll[this.parent.activeSheetIndex].colCount > sheet.colCount) {
                    this.parent.setSheetPropertyOnMute(sheet, 'colCount', this.scroll[this.parent.activeSheetIndex].colCount);
                }
            }
        }
    };
    VirtualScroll.prototype.getVTrackHeight = function (str) {
        var height = this.content.nextElementSibling.style[str];
        if (height.includes('e+')) {
            height = height.split('px')[0];
            var heightArr = height.split('e+');
            return Number(heightArr[0]) * Math.pow(10, Number(heightArr[1]));
        }
        else {
            return parseFloat(height);
        }
    };
    VirtualScroll.prototype.updateVTrackHeight = function (args) {
        var domCount = this.parent.viewport.rowCount + 1 + (this.parent.getThreshold('row') * 2);
        if (args.rowIdx >= domCount && args.rowIdx < this.scroll[this.parent.activeSheetIndex].rowCount) {
            this.updateVTrack(this.rowHeader, this.getVTrackHeight('height') + args.threshold, 'height');
        }
    };
    VirtualScroll.prototype.updateVTrackWidth = function (args) {
        if (args.colIdx >= this.parent.viewport.leftIndex && args.colIdx <= this.parent.viewport.rightIndex) {
            var hdrVTrack = this.parent.getColumnHeaderContent().getElementsByClassName('e-virtualtrack')[0];
            hdrVTrack.style.width = parseFloat(hdrVTrack.style.width) + args.threshold + 'px';
            var cntVTrack = this.parent.getMainContent().getElementsByClassName('e-virtualtrack')[0];
            cntVTrack.style.width = parseFloat(cntVTrack.style.width) + args.threshold + 'px';
            var hdrColumn = this.parent.getColumnHeaderContent().getElementsByClassName('e-virtualable')[0];
            hdrColumn.style.width = parseFloat(hdrColumn.style.width) + args.threshold + 'px';
            var cntColumn = this.parent.getMainContent().getElementsByClassName('e-virtualable')[0];
            cntColumn.style.width = parseFloat(cntColumn.style.width) + args.threshold + 'px';
        }
    };
    VirtualScroll.prototype.updateVTrack = function (header, size, sizeStr) {
        header.nextElementSibling.style[sizeStr] = size + "px";
        this.content.nextElementSibling.style[sizeStr] = size + "px";
    };
    VirtualScroll.prototype.deInitProps = function () {
        this.parent.viewport.leftIndex = null;
        this.parent.viewport.topIndex = null;
        this.parent.viewport.bottomIndex = null;
        this.translateX = null;
        this.translateY = null;
    };
    VirtualScroll.prototype.updateScrollProps = function (args) {
        var _this = this;
        if (args === void 0) { args = { sheetIndex: 0, sheets: this.parent.sheets }; }
        if (this.scroll.length === 0) {
            this.initScroll();
        }
        else {
            args.sheets.forEach(function () { _this.scroll.splice(args.sheetIndex, 0, { rowCount: 0, colCount: 0 }); });
        }
    };
    VirtualScroll.prototype.sliceScrollProps = function (args) {
        if (isNullOrUndefined(args.sheetIndex)) {
            this.scroll.length = 0;
        }
        else {
            this.scroll.splice(args.sheetIndex, 1);
        }
    };
    VirtualScroll.prototype.addEventListener = function () {
        this.parent.on(beforeContentLoaded, this.createVirtualElement, this);
        this.parent.on(beforeVirtualContentLoaded, this.translate, this);
        this.parent.on(virtualContentLoaded, this.updateColumnWidth, this);
        this.parent.on(updateTableWidth, this.updateColumnWidth, this);
        this.parent.on(onVerticalScroll, this.onVerticalScroll, this);
        this.parent.on(onHorizontalScroll, this.onHorizontalScroll, this);
        this.parent.on(updateUsedRange, this.updateUsedRange, this);
        this.parent.on(rowHeightChanged, this.updateVTrackHeight, this);
        this.parent.on(colWidthChanged, this.updateVTrackWidth, this);
        this.parent.on(deInitProperties, this.deInitProps, this);
        this.parent.on(sheetsDestroyed, this.sliceScrollProps, this);
        this.parent.on(sheetCreated, this.updateScrollProps, this);
        this.parent.on(spreadsheetDestroyed, this.destroy, this);
    };
    VirtualScroll.prototype.destroy = function () {
        this.removeEventListener();
        this.rowHeader = null;
        this.colHeader = null;
        this.content = null;
        this.parent = null;
        this.scroll.length = 0;
        this.translateX = null;
        this.translateY = null;
    };
    VirtualScroll.prototype.removeEventListener = function () {
        this.parent.off(beforeContentLoaded, this.createVirtualElement);
        this.parent.off(beforeVirtualContentLoaded, this.translate);
        this.parent.off(virtualContentLoaded, this.updateColumnWidth);
        this.parent.off(updateTableWidth, this.updateColumnWidth);
        this.parent.off(onVerticalScroll, this.onVerticalScroll);
        this.parent.off(onHorizontalScroll, this.onHorizontalScroll);
        this.parent.off(updateUsedRange, this.updateUsedRange);
        this.parent.off(rowHeightChanged, this.updateVTrackHeight);
        this.parent.off(colWidthChanged, this.updateVTrackWidth);
        this.parent.off(sheetsDestroyed, this.sliceScrollProps);
        this.parent.off(sheetCreated, this.updateScrollProps);
        this.parent.off(spreadsheetDestroyed, this.destroy);
    };
    return VirtualScroll;
}());
export { VirtualScroll };
