import { initialLoad, ribbon, formulaBar, beforeVirtualContentLoaded, setAriaOptions, skipHiddenIdx } from '../common/index';
import { SheetRender, RowRenderer, CellRenderer } from './index';
import { remove } from '@syncfusion/ej2-base';
import { getSheetName, getRowsHeight, getColumnsWidth, getData } from '../../workbook/base/index';
import { dataRefresh, getCellAddress, getCellIndexes, workbookFormulaOperation } from '../../workbook/common/index';
import { sheetTabs, onContentScroll, deInitProperties, beforeDataBound, isReact } from '../common/index';
import { spreadsheetDestroyed, isFormulaBarEdit, editOperation, renderReactTemplates } from '../common/index';
import { getSiblingsHeight } from '../common/index';
/**
 * Render module is used to render the spreadsheet
 *
 * @hidden
 */
var Render = /** @class */ (function () {
    function Render(parent) {
        this.parent = parent;
        this.addEventListener();
    }
    Render.prototype.render = function (isRefreshing) {
        this.parent.activeSheetIndex = this.parent.skipHiddenSheets(this.parent.activeSheetIndex);
        if (!this.parent.isMobileView()) {
            this.parent.notify(ribbon, null);
            this.parent.notify(formulaBar, null);
        }
        var sheetPanel = this.parent.createElement('div', {
            id: this.parent.element.id + '_sheet_panel', className: 'e-sheet-panel'
        });
        if (this.parent.enableRtl) {
            sheetPanel.classList.add('e-rtl');
        }
        this.parent.element.appendChild(sheetPanel);
        if (this.parent.showSheetTabs) {
            this.parent.notify(sheetTabs, null);
        }
        else { // for formula calculation
            var sheetName = getSheetName(this.parent, 0);
            var arg = { action: 'addSheet', sheetName: 'Sheet1', index: 1, visibleName: sheetName };
            this.parent.notify(workbookFormulaOperation, arg);
            this.parent.notify(workbookFormulaOperation, { action: 'initiateDefinedNames' });
        }
        if (this.parent.isMobileView()) {
            this.parent.notify(formulaBar, null);
            this.parent.notify(ribbon, null);
        }
        if (this.parent.password.length > 0 || this.parent.isProtected) {
            this.parent.isProtected = true;
            if (this.parent.showSheetTabs) {
                this.parent.element.querySelector('.e-add-sheet-tab').setAttribute('disabled', 'true');
                this.parent.element.querySelector('.e-add-sheet-tab').classList.add('e-disabled');
            }
        }
        this.setSheetPanelSize();
        this.renderSheet(sheetPanel);
        this.checkTopLeftCell(true, isRefreshing);
    };
    Render.prototype.checkTopLeftCell = function (initLoad, isRefreshing) {
        var sheet = this.parent.getActiveSheet();
        this.parent.showSpinner();
        var isTopLeftCell = sheet.topLeftCell === 'A1';
        var indexes = getCellIndexes(sheet.topLeftCell);
        var isFreezeScrolled;
        if (sheet.topLeftCell !== sheet.paneTopLeftCell && (sheet.frozenRows || sheet.frozenColumns)) {
            var paneIndexes = getCellIndexes(sheet.paneTopLeftCell);
            isFreezeScrolled = this.parent.scrollSettings.enableVirtualization;
            isTopLeftCell = sheet.frozenRows && sheet.frozenColumns ? indexes[0] + sheet.frozenRows === paneIndexes[0] &&
                indexes[1] + sheet.frozenColumns === paneIndexes[1] : (sheet.frozenRows ? indexes[0] + sheet.frozenRows === paneIndexes[0]
                && indexes[1] === 0 : indexes[1] + sheet.frozenColumns === paneIndexes[1] && indexes[0] === 0);
            if (indexes[0] && paneIndexes[0] > indexes[0]) {
                this.parent.viewport.beforeFreezeHeight = getRowsHeight(sheet, 0, indexes[0] - 1, true);
            }
            else {
                this.parent.viewport.beforeFreezeHeight = 0;
            }
            if (indexes[1] && paneIndexes[1] > indexes[1]) {
                this.parent.viewport.beforeFreezeWidth = getColumnsWidth(sheet, 0, indexes[1] - 1, true);
            }
            else {
                this.parent.viewport.beforeFreezeWidth = 0;
            }
        }
        else {
            this.parent.viewport.beforeFreezeHeight = this.parent.viewport.beforeFreezeWidth = 0;
        }
        if (!this.parent.scrollSettings.enableVirtualization || isTopLeftCell) {
            this.refreshUI({ rowIndex: indexes[0], colIndex: indexes[1], refresh: 'All' }, null, initLoad, isRefreshing);
            if (isFreezeScrolled) {
                this.parent.viewport.topIndex = skipHiddenIdx(sheet, 0, true);
                this.parent.viewport.leftIndex = skipHiddenIdx(sheet, 0, true, 'columns');
            }
        }
        else {
            var pIndexes = sheet.paneTopLeftCell === sheet.topLeftCell ? indexes : getCellIndexes(sheet.paneTopLeftCell);
            var frozenRow = this.parent.frozenRowCount(sheet);
            var frozenCol = this.parent.frozenColCount(sheet);
            var eventArgs = { preventScroll: true };
            eventArgs.scrollTop = pIndexes[0] > frozenRow ? getRowsHeight(sheet, frozenRow ? frozenRow : 0, pIndexes[0] - 1) : 0;
            eventArgs.scrollLeft = pIndexes[1] > frozenCol ? getColumnsWidth(sheet, frozenCol ? frozenCol : 0, pIndexes[1] - 1) : 0;
            this.parent.notify(onContentScroll, eventArgs);
            var threshold = this.parent.getThreshold('row');
            var rowIndex = sheet.frozenRows ? indexes[0] : (indexes[0] > threshold ?
                skipHiddenIdx(sheet, indexes[0] - threshold, true) : 0);
            var frozenIndexes = [];
            if (sheet.frozenRows) {
                frozenIndexes.push(pIndexes[0] - threshold > frozenRow ? (pIndexes[0] - threshold) : frozenRow);
            }
            threshold = this.parent.getThreshold('col');
            var colIndex = sheet.frozenColumns ? indexes[1] :
                (indexes[1] > threshold ? skipHiddenIdx(sheet, indexes[1] - threshold, true, 'columns') : 0);
            if (sheet.frozenColumns) {
                if (!frozenIndexes.length) {
                    frozenIndexes.push(frozenRow);
                }
                frozenIndexes.push(pIndexes[1] - threshold > frozenCol ? pIndexes[1] - threshold : frozenCol);
            }
            else if (frozenIndexes.length) {
                frozenIndexes.push(frozenCol);
            }
            this.refreshUI({ rowIndex: rowIndex, colIndex: colIndex, refresh: 'All', top: eventArgs.scrollTop, left: eventArgs.scrollLeft,
                frozenIndexes: frozenIndexes }, null, initLoad, isRefreshing);
            if (isFreezeScrolled) {
                if (frozenIndexes[0] >= frozenRow) {
                    this.parent.viewport.topIndex = skipHiddenIdx(sheet, frozenIndexes[0] - frozenRow, true);
                }
                if (frozenIndexes[1] >= frozenCol) {
                    this.parent.viewport.leftIndex = skipHiddenIdx(sheet, frozenIndexes[1] - frozenCol, true, 'columns');
                }
            }
        }
    };
    Render.prototype.renderSheet = function (panel) {
        if (panel === void 0) { panel = document.getElementById(this.parent.element.id + '_sheet_panel'); }
        panel.appendChild(this.parent.createElement('div', { className: 'e-sheet', id: this.parent.element.id + '_sheet', styles: 'background-color: #fff' }));
        this.parent.serviceLocator.getService('sheet').renderPanel();
    };
    /**
     * @hidden
     * @param {RefreshArgs} args - Specifies the RefreshArgs.
     * @param {string} address - Specifies the address.
     * @param {boolean} initLoad - Specifies the initLoad.
     * @returns {void}
     */
    // tslint:disable-next-line:max-func-body-length
    Render.prototype.refreshUI = function (args, address, initLoad, isRefreshing) {
        var _this = this;
        if (args.refresh !== 'All') {
            this.parent.showSpinner();
        }
        var sheetModule = this.parent.serviceLocator.getService('sheet');
        var sheet = this.parent.getActiveSheet();
        var sheetName = getSheetName(this.parent);
        var prevRowColCnt = { rowCount: sheet.rowCount, colCount: sheet.colCount };
        args.frozenIndexes = args.frozenIndexes ? args.frozenIndexes : [];
        if (!address) {
            if (this.parent.scrollSettings.enableVirtualization) {
                var lastRow = args.rowIndex + this.parent.viewport.rowCount + (this.parent.getThreshold('row') * 2);
                var lastCol = args.colIndex + this.parent.viewport.colCount + (this.parent.getThreshold('col') * 2);
                var frozenRow = this.parent.frozenRowCount(sheet);
                var frozenCol = this.parent.frozenColCount(sheet);
                if (args.frozenIndexes.length) {
                    lastRow += (args.frozenIndexes[0] - frozenRow);
                    lastCol += (args.frozenIndexes[1] - frozenCol);
                }
                lastRow += sheet.frozenRows;
                lastCol += sheet.frozenColumns;
                var count = sheet.rowCount - 1;
                if (this.parent.scrollSettings.isFinite && lastRow > count) {
                    lastRow = count;
                }
                count = sheet.colCount - 1;
                if (this.parent.scrollSettings.isFinite && lastCol > count) {
                    lastCol = count;
                }
                var indexes = this.parent.skipHidden(args.rowIndex, lastRow);
                if (args.rowIndex !== indexes[0]) {
                    var topLeftCell_1 = getCellIndexes(sheet.topLeftCell);
                    if (topLeftCell_1[0] === args.rowIndex) {
                        this.parent.updateTopLeftCell(indexes[0], topLeftCell_1[1], 'row');
                    }
                    args.rowIndex = indexes[0];
                }
                var startRow = args.rowIndex;
                lastRow = indexes[1];
                var topLeftCell = getCellIndexes(sheet.topLeftCell);
                indexes = this.parent.skipHidden(args.colIndex, lastCol, 'columns');
                if (args.colIndex !== indexes[0]) {
                    if (topLeftCell[1] === args.colIndex) {
                        this.parent.updateTopLeftCell(topLeftCell[0], indexes[0], 'col');
                    }
                    args.colIndex = indexes[0];
                }
                var startCol = args.colIndex;
                lastCol = indexes[1];
                if (args.refresh === 'Row') {
                    startRow += frozenRow;
                    if (frozenRow) {
                        lastRow += topLeftCell[0];
                    }
                }
                if (args.refresh === 'Column') {
                    startCol += frozenCol;
                    if (frozenCol) {
                        lastCol += topLeftCell[1];
                    }
                }
                this.parent.viewport.topIndex = args.rowIndex;
                this.parent.viewport.bottomIndex = lastRow;
                this.parent.viewport.leftIndex = args.colIndex;
                this.parent.viewport.rightIndex = lastCol;
                address = getCellAddress(startRow, startCol) + ":" + getCellAddress(lastRow, lastCol);
            }
            else {
                this.parent.viewport.bottomIndex = sheet.rowCount - 1;
                this.parent.viewport.rightIndex = sheet.colCount - 1;
                address = getCellAddress(sheet.frozenRows ? getCellIndexes(sheet.topLeftCell)[0] : 0, sheet.frozenColumns ?
                    getCellIndexes(sheet.topLeftCell)[1] : 0) + ":" + getCellAddress(this.parent.viewport.bottomIndex, this.parent.viewport.rightIndex);
            }
        }
        if (args.refresh === 'All') {
            this.parent.trigger(beforeDataBound, {});
        }
        setAriaOptions(this.parent.getMainContent(), { busy: true });
        var sheetsLen = this.parent.sheets.length;
        getData(this.parent, sheetName + "!" + address, null, null, args.frozenIndexes).then(function (values) {
            if (sheetsLen < _this.parent.sheets.length) {
                return;
            }
            var sheetIdx = _this.parent.sheets.indexOf(sheet);
            if (sheetIdx === -1 || sheetIdx !== _this.parent.activeSheetIndex) {
                if (sheetIdx > -1) {
                    _this.checkTopLeftCell();
                }
                return;
            }
            var indexes = [args.rowIndex, args.colIndex].concat(getCellIndexes(address.split(':')[1]));
            var isEdit;
            var arg;
            switch (args.refresh) {
                case 'All':
                    sheetModule.renderTable({ cells: values, indexes: indexes, top: args.top, left: args.left, initLoad: initLoad, isRefreshing: isRefreshing });
                    break;
                case 'Row':
                    sheetModule.refreshRowContent({ cells: values, indexes: indexes, skipUpdateOnFirst: args.skipUpdateOnFirst, prevRowColCnt: prevRowColCnt });
                    isEdit = false;
                    arg = { isEdit: isEdit };
                    _this.parent.notify(isFormulaBarEdit, arg);
                    if (arg.isEdit) {
                        _this.parent.notify(editOperation, { action: 'startEdit', refreshCurPos: false });
                    }
                    break;
                case 'Column':
                    sheetModule.refreshColumnContent({
                        cells: values, indexes: indexes, skipUpdateOnFirst: args.skipUpdateOnFirst,
                        prevRowColCnt: prevRowColCnt
                    });
                    break;
                case 'RowPart':
                    sheetModule.updateRowContent({
                        cells: values, indexes: indexes, direction: args.direction, skipUpdateOnFirst: args.skipUpdateOnFirst,
                        prevRowColCnt: prevRowColCnt
                    });
                    break;
                case 'ColumnPart':
                    sheetModule.updateColContent({
                        cells: values, indexes: indexes, direction: args.direction, skipUpdateOnFirst: args.skipUpdateOnFirst,
                        prevRowColCnt: prevRowColCnt
                    });
                    break;
            }
            if (_this.parent[isReact]) {
                _this.parent[renderReactTemplates]();
            }
        });
        this.parent.notify(beforeVirtualContentLoaded, { refresh: args.refresh });
    };
    Render.prototype.removeSheet = function () {
        remove(document.getElementById(this.parent.element.id + '_sheet'));
    };
    /**
     * Refresh the active sheet.
     *
     * @returns {void}
     */
    Render.prototype.refreshSheet = function (isOpen) {
        this.removeSheet();
        this.renderSheet();
        this.parent.notify(deInitProperties, {});
        this.checkTopLeftCell(false, isOpen);
    };
    /**
     * Used to set sheet panel size.
     *
     * @returns {void}
     */
    Render.prototype.setSheetPanelSize = function () {
        var panel = document.getElementById(this.parent.element.id + '_sheet_panel');
        var offset = this.parent.element.getBoundingClientRect();
        var height;
        if (this.parent.height === 'auto') {
            panel.style.height = '260px';
            height = 230;
        }
        else {
            height = offset.height - getSiblingsHeight(panel);
            panel.style.height = height + "px";
            height -= 32;
        }
        this.parent.viewport.height = height;
        this.parent.viewport.width = offset.width - 32;
        this.parent.viewport.rowCount = this.roundValue(height, 20);
        this.parent.viewport.colCount = this.roundValue(offset.width, 64);
    };
    Render.prototype.roundValue = function (size, threshold) {
        var value = size / threshold;
        var roundedValue = Math.round(value);
        return Math.abs(value - roundedValue) < 0.5 ? roundedValue : roundedValue - 1;
    };
    /**
     * Registing the renderer related services.
     *
     * @returns {void}
     */
    Render.prototype.instantiateRenderer = function () {
        this.parent.serviceLocator.register('cell', new CellRenderer(this.parent));
        this.parent.serviceLocator.register('row', new RowRenderer(this.parent));
        this.parent.serviceLocator.register('sheet', new SheetRender(this.parent));
    };
    /**
     * Destroy the Render module.
     *
     * @returns {void}
     */
    Render.prototype.destroy = function () {
        this.removeEventListener();
        this.parent = null;
    };
    Render.prototype.addEventListener = function () {
        this.parent.on(initialLoad, this.instantiateRenderer, this);
        this.parent.on(dataRefresh, this.refreshSheet, this);
        this.parent.on(spreadsheetDestroyed, this.destroy, this);
    };
    Render.prototype.removeEventListener = function () {
        this.parent.off(initialLoad, this.instantiateRenderer);
        this.parent.off(dataRefresh, this.refreshSheet);
        this.parent.off(spreadsheetDestroyed, this.destroy);
    };
    return Render;
}());
export { Render };
