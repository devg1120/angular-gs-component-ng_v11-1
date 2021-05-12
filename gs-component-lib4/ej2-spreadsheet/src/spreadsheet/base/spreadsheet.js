var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path='../../workbook/base/workbook-model.d.ts'/>
import { Property, NotifyPropertyChanges, Event, isUndefined } from '@syncfusion/ej2-base';
import { addClass, removeClass, Complex, formatUnit, L10n, isNullOrUndefined, Browser } from '@syncfusion/ej2-base';
import { detach, select, closest, setStyleAttribute, EventHandler } from '@syncfusion/ej2-base';
import { initialLoad, mouseDown, spreadsheetDestroyed, keyUp, clearViewer, blankWorkbook, refreshSheetTabs } from '../common/index';
import { hideShow, performUndoRedo, overlay, createImageElement, deleteImage } from '../common/index';
import { sheetNameUpdate, updateUndoRedoCollection, getUpdateUsingRaf, setAutoFit, created } from '../common/index';
import { actionEvents, keyDown, enableFileMenuItems, hideToolbarItems, updateAction } from '../common/index';
import { colWidthChanged, rowHeightChanged, hideRibbonTabs, addFileMenuItems, getSiblingsHeight } from '../common/index';
import { defaultLocale, locale, setAriaOptions, setResize, initiateFilterUI, clearFilter, clearTemplate, isReact } from '../common/index';
import { ribbon, formulaBar, sheetTabs, formulaOperation, addRibbonTabs } from '../common/index';
import { addContextMenuItems, removeContextMenuItems, enableContextMenuItems, selectRange, addToolbarItems } from '../common/index';
import { cut, copy, paste, dialog, editOperation, activeSheetChanged, refreshFormulaDatasource } from '../common/index';
import { Render } from '../renderer/render';
import { Scroll, VirtualScroll, Edit, CellFormat, Selection, KeyboardNavigation, KeyboardShortcut, WrapText } from '../actions/index';
import { Clipboard, ShowHide, UndoRedo, SpreadsheetHyperlink, Resize, Insert, Delete, FindAndReplace, Merge } from '../actions/index';
import { ProtectSheet } from '../actions/index';
import { click, hideFileMenuItems } from '../common/index';
import { Dialog, ActionEvents, Overlay } from '../services/index';
import { ServiceLocator } from '../../workbook/services/index';
import { getColumnsWidth, getSheetIndex, WorkbookHyperlink } from './../../workbook/index';
import { getCellAddress } from './../../workbook/common/index';
import { activeCellChanged, afterHyperlinkCreate, getColIndex } from './../../workbook/index';
import { WorkbookInsert, WorkbookDelete, WorkbookMerge } from './../../workbook/index';
import { getSheetNameFromAddress, DataBind, beforeHyperlinkCreate } from './../../workbook/index';
import { sortComplete, dataSourceChanged } from './../../workbook/index';
import { getSheetIndexFromId, WorkbookEdit, WorkbookOpen, WorkbookSave, WorkbookCellFormat, WorkbookSort } from './../../workbook/index';
import { findKeyUp, refreshRibbonIcons } from './../../workbook/index';
import { Workbook } from '../../workbook/base/workbook';
import { getRequiredModules, ScrollSettings, enableToolbarItems } from '../common/index';
import { SelectionSettings, getStartEvent, enableRibbonTabs, getDPRValue } from '../common/index';
import { createSpinner, showSpinner, hideSpinner } from '@syncfusion/ej2-popups';
import { setRowHeight, getRowsHeight, getColumnWidth, getRowHeight, setColumn, setRow } from './../../workbook/base/index';
import { getRangeIndexes, getIndexesFromAddress, getCellIndexes, WorkbookNumberFormat, WorkbookFormula } from '../../workbook/index';
import { Ribbon, FormulaBar, SheetTabs, Open, ContextMenu, Save, NumberFormat, Formula } from '../integrations/index';
import { Sort, Filter, SpreadsheetImage, SpreadsheetChart } from '../integrations/index';
import { isNumber, getColumn, WorkbookFilter } from '../../workbook/index';
import { DataValidation } from '../actions/index';
import { WorkbookDataValidation, WorkbookConditionalFormat, WorkbookFindAndReplace } from '../../workbook/actions/index';
import { findAllValues } from './../../workbook/common/index';
import { ConditionalFormatting } from '../actions/conditional-formatting';
import { WorkbookImage, WorkbookChart } from '../../workbook/integrations/index';
import { WorkbookProtectSheet } from '../../workbook/actions/index';
import { beginAction, contentLoaded, completeAction, freeze, getScrollBarWidth } from '../common/index';
import { getFilteredCollection } from './../../workbook/common/index';
/**
 * Represents the Spreadsheet component.
 *
 * ```html
 * <div id='spreadsheet'></div>
 * <script>
 *  var spreadsheetObj = new Spreadsheet();
 *  spreadsheetObj.appendTo('#spreadsheet');
 * </script>
 * ```
 */
var Spreadsheet = /** @class */ (function (_super) {
    __extends(Spreadsheet, _super);
    /**
     * Constructor for creating the widget.
     *
     * @param  {SpreadsheetModel} options - Configures Spreadsheet options.
     * @param  {string|HTMLElement} element - Element to render Spreadsheet.
     */
    function Spreadsheet(options, element) {
        var _this = _super.call(this, options) || this;
        /** @hidden */
        _this.viewport = {
            rowCount: 0, colCount: 0, height: 0, topIndex: 0, leftIndex: 0, width: 0,
            bottomIndex: 0, rightIndex: 0, beforeFreezeHeight: 0, beforeFreezeWidth: 0
        };
        _this.needsID = true;
        Spreadsheet_1.Inject(Ribbon, FormulaBar, SheetTabs, Selection, Edit, KeyboardNavigation, KeyboardShortcut, Clipboard, DataBind, Open, ContextMenu, Save, NumberFormat, CellFormat, Formula, WrapText, WorkbookEdit, WorkbookOpen, WorkbookSave, WorkbookCellFormat, WorkbookNumberFormat, WorkbookFormula, Sort, WorkbookSort, Resize, UndoRedo, WorkbookFilter, Filter, SpreadsheetHyperlink, WorkbookHyperlink, Insert, Delete, WorkbookInsert, WorkbookDelete, DataValidation, WorkbookDataValidation, ProtectSheet, WorkbookProtectSheet, FindAndReplace, WorkbookFindAndReplace, Merge, WorkbookMerge, SpreadsheetImage, ConditionalFormatting, WorkbookImage, WorkbookConditionalFormat, SpreadsheetChart, WorkbookChart);
        if (element) {
            _this.appendTo(element);
        }
        return _this;
    }
    Spreadsheet_1 = Spreadsheet;
    /**
     * To get cell element.
     *
     * @param {number} rowIndex - specify the rowIndex.
     * @param {number} colIndex - specify the colIndex.
     * @param {HTMLTableElement} row - specify the row.
     * @returns {HTMLElement} - Get cell element
     * @hidden
     */
    Spreadsheet.prototype.getCell = function (rowIndex, colIndex, row) {
        if (!row) {
            row = this.getRow(rowIndex, null, colIndex);
        }
        colIndex = this.getViewportIndex(colIndex, true);
        return row ? row.cells[colIndex] : row;
    };
    /**
     * Get cell element.
     *
     * @param {number} index - specify the index.
     * @param {HTMLTableElement} table - specify the table.
     * @param {number} colIdx - specify the column index.
     * @returns {HTMLTableRowElement} - Get cell element
     * @hidden
     */
    Spreadsheet.prototype.getRow = function (index, table, colIdx) {
        if (!table) {
            var sheet = this.getActiveSheet();
            var frozenRow = this.frozenRowCount(sheet);
            var frozenCol = this.frozenColCount(sheet);
            if (isNullOrUndefined(colIdx) || index > frozenRow - 1 && colIdx > frozenCol - 1) {
                table = this.getContentTable();
            }
            else {
                table = index < frozenRow && colIdx < frozenCol ? this.sheetModule.getSelectAllTable() : (index < frozenRow ?
                    this.getColHeaderTable() : this.getRowHeaderTable());
            }
        }
        index = this.getViewportIndex(index);
        return table ? table.rows[index] : null;
    };
    /**
     * To get hidden row/column count between two specified index.
     *
     * Set `layout` as `columns` if you want to get column hidden count.
     *
     * @param {number} startIndex - specify the startIndex.
     * @param {number} endIndex - specify the endIndex.
     * @param {string} layout - specify the layout.
     * @returns {number} - To get hidden row/column count between two specified index.
     * @hidden
     */
    Spreadsheet.prototype.hiddenCount = function (startIndex, endIndex, layout) {
        if (layout === void 0) { layout = 'rows'; }
        var sheet = this.getActiveSheet();
        var count = 0;
        for (var i = startIndex; i <= endIndex; i++) {
            if ((sheet[layout])[i] && (sheet[layout])[i].hidden) {
                count++;
            }
        }
        return count;
    };
    /**
     * To get row/column viewport index.
     *
     * @param {number} index - specify the index.
     * @param {boolean} isCol - specify the bool value.
     * @returns {number} - To get row/column viewport index.
     * @hidden
     */
    Spreadsheet.prototype.getViewportIndex = function (index, isCol) {
        var sheet = this.getActiveSheet();
        if (isCol) {
            var frozenCol = this.frozenColCount(sheet);
            if (frozenCol) {
                var leftIndex = getCellIndexes(sheet.topLeftCell)[1];
                if (index < frozenCol) {
                    index -= leftIndex;
                    return index + 1;
                }
                else {
                    index -= frozenCol;
                }
            }
        }
        else {
            var frozenRow = this.frozenRowCount(sheet);
            if (frozenRow) {
                var topIndex = getCellIndexes(sheet.topLeftCell)[0];
                if (index < frozenRow) {
                    index -= topIndex;
                    return index + 1;
                }
                else {
                    index -= frozenRow;
                }
            }
        }
        if (this.scrollSettings.enableVirtualization) {
            if (isCol) {
                index -= this.hiddenCount(this.viewport.leftIndex, index, 'columns');
                index -= this.viewport.leftIndex;
            }
            else {
                index -= this.hiddenCount(this.viewport.topIndex, index);
                index -= this.viewport.topIndex;
            }
        }
        return index;
    };
    /**
     * To initialize the services;
     *
     * @returns {void} - To initialize the services.
     * @hidden
     */
    Spreadsheet.prototype.preRender = function () {
        _super.prototype.preRender.call(this);
        this.serviceLocator = new ServiceLocator;
        this.initServices();
    };
    Spreadsheet.prototype.initServices = function () {
        this.serviceLocator.register(locale, new L10n(this.getModuleName(), defaultLocale, this.locale));
        this.serviceLocator.register(dialog, new Dialog(this));
        this.serviceLocator.register(actionEvents, new ActionEvents(this));
        this.serviceLocator.register(overlay, new Overlay(this));
    };
    /**
     * To Initialize the component rendering.
     *
     * @returns {void} - To Initialize the component rendering.
     * @hidden
     */
    Spreadsheet.prototype.render = function () {
        _super.prototype.render.call(this);
        this.element.setAttribute('tabindex', '0');
        setAriaOptions(this.element, { role: 'grid' });
        this.renderModule = new Render(this);
        this.notify(initialLoad, null);
        this.renderSpreadsheet();
        this.wireEvents();
        if (this.created) {
            if (this[created].observers) {
                if (this[created].observers.length > 0) {
                    this.createdHandler = { observers: this[created].observers };
                    this[created].observers = [];
                }
            }
            else {
                this.createdHandler = this.created;
                this.setProperties({ created: undefined }, true);
            }
        }
    };
    Spreadsheet.prototype.renderSpreadsheet = function () {
        if (this.cssClass) {
            addClass([this.element], this.cssClass.split(' '));
        }
        this.setHeight();
        this.setWidth();
        createSpinner({ target: this.element }, this.createElement);
        if (this.isMobileView() && this.cssClass.indexOf('e-mobile-view') === -1) {
            this.element.classList.add('e-mobile-view');
        }
        this.sheetModule = this.serviceLocator.getService('sheet');
        if (this.allowScrolling) {
            this.scrollModule = new Scroll(this);
        }
        if (this.scrollSettings.enableVirtualization) {
            new VirtualScroll(this);
        }
        this.renderModule.render(this.refreshing);
        new ShowHide(this);
    };
    /**
     * By default, Spreadsheet shows the spinner for all its actions. To manually show spinner you this method at your needed time.
     *
     * {% codeBlock src='spreadsheet/showSpinner/index.md' %}{% endcodeBlock %}
     *
     * @returns {void} - shows spinner
     */
    Spreadsheet.prototype.showSpinner = function () {
        showSpinner(this.element);
    };
    /**
     * To hide showed spinner manually.
     *
     * {% codeBlock src='spreadsheet/hideSpinner/index.md' %}{% endcodeBlock %}
     *
     * @returns {void} - To hide showed spinner manually.
     */
    Spreadsheet.prototype.hideSpinner = function () {
        hideSpinner(this.element);
    };
    /**
     * To protect the particular sheet.
     *
     * {% codeBlock src='spreadsheet/protectSheet/index.md' %}{% endcodeBlock %}
     *
     * @param {number | string} sheet - Specifies the sheet to protect.
     * @param {ProtectSettingsModel} protectSettings - Specifies the protect sheet options.
     * @default { selectCells: 'false', formatCells: 'false', formatRows: 'false', formatColumns:'false', insertLink:'false' }
     * @returns {void} - To protect the particular sheet.
     */
    Spreadsheet.prototype.protectSheet = function (sheet, protectSettings) {
        if (typeof (sheet) === 'string') {
            sheet = getSheetIndex(this, sheet);
        }
        if (sheet) {
            this.setSheetPropertyOnMute(this.sheets[sheet], 'isProtected', true);
            this.setSheetPropertyOnMute(this.sheets[sheet], 'protectSettings', protectSettings);
        }
        sheet = this.getActiveSheet().index;
        this.setSheetPropertyOnMute(this.getActiveSheet(), 'isProtected', true);
        _super.prototype.protectSheet.call(this, sheet, protectSettings);
    };
    /**
     * To unprotect the particular sheet.
     *
     * {% codeBlock src='spreadsheet/unprotectSheet/index.md' %}{% endcodeBlock %}
     *
     * @param {number | string} sheet - Specifies the sheet name or index to Unprotect.
     * @returns {void} - To unprotect the particular sheet.
     */
    Spreadsheet.prototype.unprotectSheet = function (sheet) {
        if (typeof (sheet) === 'string') {
            sheet = getSheetIndex(this, sheet);
        }
        if (sheet) {
            this.sheets[sheet].isProtected = false;
        }
        else {
            this.getActiveSheet().isProtected = false;
        }
        _super.prototype.unprotectSheet.call(this, sheet);
    };
    /**
     * To find the specified cell value.
     *
     * {% codeBlock src='spreadsheet/find/index.md' %}{% endcodeBlock %}
     *
     * @param {FindOptions} args - Specifies the replace value with find args to replace specified cell value.
     * @param {string} args.value - Specifies the value to be find.
     * @param {string} args.mode - Specifies the value to be find within sheet or workbook.
     * @param {string} args.searchBy - Specifies the value to be find by row or column.
     * @param {boolean} args.isCSen - Specifies the find match with case sensitive or not.
     * @param {boolean} args.isEMatch - Specifies the find match with entire match or not.
     * @param {string} args.findOpt - Specifies the next or previous find match.
     * @param {number} args.sheetIndex - Specifies the current sheet to find.
     * @default { mode: 'Sheet', searchBy: 'By Row', isCSen: 'false', isEMatch:'false' }
     * @returns {void} - To find the specified cell value.
     */
    Spreadsheet.prototype.find = function (args) {
        _super.prototype.findHandler.call(this, args);
    };
    /**
     * To replace the specified cell value.
     *
     * {% codeBlock src='spreadsheet/replace/index.md' %}{% endcodeBlock %}
     *
     * @param {FindOptions} args - Specifies the replace value with find args to replace specified cell value.
     * @param {string} args.replaceValue - Specifies the replacing value.
     * @param {string} args.replaceBy - Specifies the value to be replaced for one or all.
     * @param {string} args.value - Specifies the value to be replaced
     * @returns {void} - To replace the specified cell value.
     */
    Spreadsheet.prototype.replace = function (args) {
        args = {
            value: args.value, mode: args.mode ? args.mode : 'Sheet', isCSen: args.isCSen ? args.isCSen : false,
            isEMatch: args.isEMatch ? args.isEMatch : false, searchBy: args.searchBy ? args.searchBy : 'By Row',
            replaceValue: args.replaceValue, replaceBy: args.replaceBy,
            sheetIndex: args.sheetIndex ? args.sheetIndex : this.activeSheetIndex, findOpt: args.findOpt ? args.findOpt : ''
        };
        _super.prototype.replaceHandler.call(this, args);
    };
    /**
     * To Find All the Match values Address within Sheet or Workbook.
     *
     * {% codeBlock src='spreadsheet/findAll/index.md' %}{% endcodeBlock %}
     *
     * @param {string} value - Specifies the value to find.
     * @param {string} mode - Specifies the value to be find within Sheet/Workbook.
     * @param {boolean} isCSen - Specifies the find match with case sensitive or not.
     * @param {boolean} isEMatch - Specifies the find match with entire match or not.
     * @param {number} sheetIndex - Specifies the sheetIndex. If not specified, it will consider the active sheet.
     * @returns {string[]} - To Find All the Match values Address within Sheet or Workbook.
     */
    Spreadsheet.prototype.findAll = function (value, mode, isCSen, isEMatch, sheetIndex) {
        mode = mode ? mode : 'Sheet';
        sheetIndex = sheetIndex ? sheetIndex : this.activeSheetIndex;
        isCSen = isCSen ? isCSen : false;
        isEMatch = isEMatch ? isEMatch : false;
        var findCollection = [];
        var findAllArguments = {
            value: value, mode: mode, sheetIndex: sheetIndex, isCSen: isCSen,
            isEMatch: isEMatch, findCollection: findCollection
        };
        this.notify(findAllValues, findAllArguments);
        return findCollection;
    };
    /**
     * Used to navigate to cell address within workbook.
     *
     * {% codeBlock src='spreadsheet/goTo/index.md' %}{% endcodeBlock %}
     *
     * @param {string} address - Specifies the cell address you need to navigate.
     * You can specify the address in two formats,
     * `{sheet name}!{cell address}` - Switch to specified sheet and navigate to specified cell address.
     * `{cell address}` - Navigate to specified cell address with in the active sheet.
     * @returns {void} - Used to navigate to cell address within workbook.
     */
    Spreadsheet.prototype.goTo = function (address) {
        if (address.includes('!')) {
            var addrArr = address.split('!');
            var idx = getSheetIndex(this, addrArr[0]);
            if (idx === undefined) {
                return;
            }
            if (idx !== this.activeSheetIndex) {
                var activeCell = addrArr[1].split(':')[0];
                var sheet_1 = this.sheets[idx];
                this.setSheetPropertyOnMute(sheet_1, 'activeCell', activeCell);
                this.setSheetPropertyOnMute(sheet_1, 'selectedRange', addrArr[1]);
                var cellIndex = getCellIndexes(activeCell);
                if (sheet_1.frozenColumns || sheet_1.frozenRows) {
                    var topLeftCell = getCellIndexes(sheet_1.topLeftCell);
                    if (!((sheet_1.frozenRows && cellIndex[0] < topLeftCell[0]) || (sheet_1.frozenColumns && cellIndex[1] < topLeftCell[1]))) {
                        var frozenRow_1 = this.frozenRowCount(sheet_1);
                        var frozenCol_1 = this.frozenColCount(sheet_1);
                        var curCell = [];
                        var paneCell = [];
                        var paneTopLeftCell = getCellIndexes(sheet_1.paneTopLeftCell);
                        if (frozenRow_1) {
                            curCell.push(topLeftCell[0]);
                            if (cellIndex[0] >= frozenRow_1) {
                                paneCell.push(cellIndex[0]);
                            }
                            else {
                                paneCell.push(paneTopLeftCell[0]);
                            }
                        }
                        else {
                            curCell.push(cellIndex[0]);
                            paneCell.push(cellIndex[0]);
                        }
                        if (frozenCol_1) {
                            curCell.push(topLeftCell[1]);
                            if (cellIndex[1] >= frozenCol_1) {
                                paneCell.push(cellIndex[1]);
                            }
                            else {
                                paneCell.push(paneTopLeftCell[1]);
                            }
                        }
                        else {
                            curCell.push(cellIndex[1]);
                            paneCell.push(cellIndex[1]);
                        }
                        this.setSheetPropertyOnMute(sheet_1, 'topLeftCell', getCellAddress(curCell[0], curCell[1]));
                        this.setSheetPropertyOnMute(sheet_1, 'paneTopLeftCell', getCellAddress(paneCell[0], paneCell[1]));
                    }
                }
                else {
                    if (cellIndex[0] < this.viewport.rowCount) {
                        cellIndex[0] = 0;
                    }
                    if (cellIndex[1] < this.viewport.colCount) {
                        cellIndex[1] = 0;
                    }
                    this.updateTopLeftCell(cellIndex[0], cellIndex[1], null, sheet_1);
                }
                this.activeSheetIndex = idx;
                this.dataBind();
                return;
            }
        }
        var indexes = getRangeIndexes(address);
        var sheet = this.getActiveSheet();
        var frozenRow = this.frozenRowCount(sheet);
        var frozenCol = this.frozenColCount(sheet);
        var insideDomCount = this.insideViewport(indexes[0], indexes[1]);
        if (insideDomCount) {
            this.selectRange(address);
            var viewportIndexes = getCellIndexes(sheet.paneTopLeftCell);
            var lastRowIdx = (viewportIndexes[0] - frozenRow) + (this.viewport.rowCount - 1 - sheet.frozenRows);
            viewportIndexes[2] = lastRowIdx;
            viewportIndexes[3] = (viewportIndexes[1] - frozenCol) + (this.viewport.colCount - 1 - sheet.frozenColumns);
            if (indexes[0] >= viewportIndexes[0] && indexes[0] < viewportIndexes[2] && indexes[1] >= viewportIndexes[1] &&
                indexes[1] < viewportIndexes[3]) {
                return;
            }
            if (frozenRow || frozenCol) {
                viewportIndexes = [].concat(getCellIndexes(sheet.topLeftCell), [frozenRow, viewportIndexes[3]]);
                if (indexes[0] >= viewportIndexes[0] && indexes[0] < viewportIndexes[2] && indexes[1] >= viewportIndexes[1] &&
                    indexes[1] < viewportIndexes[3]) {
                    return;
                }
                viewportIndexes[2] = lastRowIdx;
                viewportIndexes[3] = frozenCol;
                if (indexes[0] >= viewportIndexes[0] && indexes[0] < viewportIndexes[2] && indexes[1] >= viewportIndexes[1] &&
                    indexes[1] < viewportIndexes[3]) {
                    return;
                }
            }
        }
        var content = this.getMainContent().parentElement;
        var vTrack;
        var cVTrack;
        var offset;
        var vWidth;
        var vHeight;
        var scrollableSize;
        if (indexes[0] === frozenRow) {
            offset = 0;
        }
        else {
            offset = getRowsHeight(sheet, frozenRow, indexes[0] - 1, true);
            if (this.scrollSettings.enableVirtualization) {
                scrollableSize = offset + this.getContentTable().getBoundingClientRect().height;
                vHeight = parseFloat(content.querySelector('.e-virtualtrack').style.height);
                if (scrollableSize > vHeight) {
                    scrollableSize += 10;
                    vTrack = content.querySelector('.e-virtualtrack');
                    vTrack.style.height = scrollableSize + "px";
                    getUpdateUsingRaf(function () { vTrack.style.height = vHeight + "px"; });
                }
            }
        }
        content.scrollTop = offset;
        content = this.element.getElementsByClassName('e-scroller')[0];
        if (indexes[1] === frozenCol) {
            offset = 0;
        }
        else {
            offset = getColumnsWidth(sheet, frozenCol, indexes[1] - 1, true);
            if (this.scrollSettings.enableVirtualization) {
                scrollableSize = offset + this.getContentTable().getBoundingClientRect().width;
                vWidth = parseFloat(content.querySelector('.e-virtualtrack').style.width);
                if (scrollableSize > vWidth) {
                    scrollableSize += 10;
                    vTrack = content.querySelector('.e-virtualtrack');
                    vTrack.style.width = scrollableSize + "px";
                    cVTrack = this.getColumnHeaderContent().querySelector('.e-virtualtrack');
                    cVTrack.style.width = scrollableSize + "px";
                    vTrack = this.getMainContent().querySelector('.e-virtualtrack');
                    vTrack.style.width = scrollableSize + "px";
                    getUpdateUsingRaf(function () {
                        vTrack.style.width = vWidth + "px";
                        cVTrack.style.width = vWidth + "px";
                    });
                }
            }
        }
        content.scrollLeft = offset;
        if (!insideDomCount) {
            this.selectRange(address);
        }
    };
    /**
     * @hidden
     * @param {number} rowIndex - Specifies the row index.
     * @param {number} colIndex - Specifies the column index.
     * @returns {boolean} - Specifies the boolean value.
     */
    Spreadsheet.prototype.insideViewport = function (rowIndex, colIndex) {
        var sheet = this.getActiveSheet();
        if (sheet.frozenRows || sheet.frozenColumns) {
            var frozenRow = this.frozenRowCount(sheet);
            var frozenCol = this.frozenColCount(sheet);
            var indexes = getCellIndexes(sheet.topLeftCell);
            return ((rowIndex >= indexes[0] && rowIndex < frozenRow) || (rowIndex >= this.viewport.topIndex + frozenRow && rowIndex <=
                this.viewport.bottomIndex)) && ((colIndex >= indexes[1] && colIndex < frozenCol) || (colIndex >= this.viewport.leftIndex +
                frozenCol && colIndex <= this.viewport.rightIndex));
        }
        else {
            return rowIndex >= this.viewport.topIndex && rowIndex <= this.viewport.bottomIndex && colIndex >= this.viewport.leftIndex &&
                colIndex <= this.viewport.rightIndex;
        }
    };
    /**
     * Used to resize the Spreadsheet.
     *
     * {% codeBlock src='spreadsheet/resize/index.md' %}{% endcodeBlock %}
     *
     * @returns {void} - Used to resize the Spreadsheet.
     */
    Spreadsheet.prototype.resize = function () {
        this.renderModule.setSheetPanelSize();
        if (this.scrollSettings.enableVirtualization) {
            this.renderModule.refreshSheet();
        }
    };
    /**
     * To cut the specified cell or cells properties such as value, format, style etc...
     *
     * {% codeBlock src='spreadsheet/cut/index.md' %}{% endcodeBlock %}
     *
     * @param {string} address - Specifies the range address to cut.
     * @returns {Promise<Object>} - To cut the specified cell or cells properties such as value, format, style etc...
     */
    Spreadsheet.prototype.cut = function (address) {
        var promise = 
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        new Promise(function (resolve, reject) { resolve((function () { })()); });
        this.notify(cut, address ? {
            range: getIndexesFromAddress(address),
            sId: this.sheets[getSheetIndex(this, getSheetNameFromAddress(address))].id,
            promise: promise
        } : { promise: promise });
        return promise;
    };
    /**
     * To copy the specified cell or cells properties such as value, format, style etc...
     *
     * {% codeBlock src='spreadsheet/copy/index.md' %}{% endcodeBlock %}
     *
     * @param {string} address - Specifies the range address.
     * @returns {Promise<Object>} - To copy the specified cell or cells properties such as value, format, style etc...
     */
    Spreadsheet.prototype.copy = function (address) {
        var promise = 
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        new Promise(function (resolve, reject) { resolve((function () { })()); });
        this.notify(copy, address ? {
            range: getIndexesFromAddress(address),
            sId: this.sheets[getSheetIndex(this, getSheetNameFromAddress(address))] ?
                this.sheets[getSheetIndex(this, getSheetNameFromAddress(address))].id : this.activeSheetIndex,
            promise: promise
        } : { promise: promise });
        return promise;
    };
    /**
     * This method is used to paste the cut or copied cells in to specified address.
     *
     * {% codeBlock src='spreadsheet/paste/index.md' %}{% endcodeBlock %}
     *
     * @param {string} address - Specifies the cell or range address.
     * @param {PasteSpecialType} type - Specifies the type of paste.
     * @returns {void} - used to paste the cut or copied cells in to specified address.
     */
    Spreadsheet.prototype.paste = function (address, type) {
        this.notify(paste, {
            range: address ? getIndexesFromAddress(address) : address,
            sIdx: address ? getSheetIndex(this, getSheetNameFromAddress(address)) : address,
            type: type, isAction: false, isInternal: true
        });
    };
    /**
     * To update the action which need to perform.
     *
     * {% codeBlock src='spreadsheet/updateAction/index.md' %}{% endcodeBlock %}
     *
     * @param {string} options - It describes an action and event args to perform.
     * @param {string} options.action - specifies an action.
     * @param {string} options.eventArgs - specifies an args to perform an action.
     * @returns {void} - To update the action which need to perform.
     */
    Spreadsheet.prototype.updateAction = function (options) {
        updateAction(options, this);
    };
    Spreadsheet.prototype.setHeight = function () {
        if (this.height.toString().indexOf('%') > -1) {
            this.element.style.minHeight = '400px';
        }
        this.element.style.height = formatUnit(this.height);
    };
    Spreadsheet.prototype.setWidth = function () {
        if (this.width.toString().indexOf('%') > -1 || this.width === 'auto') {
            this.element.style.minWidth = '300px';
        }
        this.element.style.width = formatUnit(this.width);
    };
    /**
     * Set the width of column.
     *
     * {% codeBlock src='spreadsheet/setColWidth/index.md' %}{% endcodeBlock %}
     *
     * @param {number} width - To specify the width
     * @param {number} colIndex - To specify the colIndex
     * @param {number} sheetIndex - To specify the sheetIndex
     * @returns {void} - Set the width of column.
     */
    Spreadsheet.prototype.setColWidth = function (width, colIndex, sheetIndex) {
        if (width === void 0) { width = 64; }
        if (colIndex === void 0) { colIndex = 0; }
        var colThreshold = this.getThreshold('col');
        var lastIdx = this.viewport.leftIndex + this.viewport.colCount + (colThreshold * 2);
        var sheet = isNullOrUndefined(sheetIndex) ? this.getActiveSheet() : this.sheets[sheetIndex];
        if (sheet) {
            var mIndex = colIndex;
            var colWidth = (typeof width === 'number') ? width + 'px' : width;
            colIndex = isNullOrUndefined(colIndex) ? getCellIndexes(sheet.activeCell)[1] : colIndex;
            if (sheet === this.getActiveSheet()) {
                if (colIndex >= this.viewport.leftIndex && colIndex <= lastIdx) {
                    if (this.scrollSettings.enableVirtualization) {
                        colIndex = colIndex - this.viewport.leftIndex;
                    }
                    var trgt = void 0;
                    if (sheet.showHeaders) {
                        trgt = this.getColumnHeaderContent().getElementsByClassName('e-header-cell')[colIndex];
                    }
                    else {
                        trgt = this.getContentTable().getElementsByClassName('e-row')[0]
                            .getElementsByClassName('e-cell')[colIndex];
                    }
                    var eleWidth = getColumnWidth(sheet, colIndex, null, true);
                    var threshold = getDPRValue(parseInt(colWidth, 10)) - eleWidth;
                    if (threshold < 0 && eleWidth < -(threshold)) {
                        getCellIndexes(sheet.activeCell);
                        threshold = -eleWidth;
                    }
                    var oldIdx = parseInt(trgt.getAttribute('aria-colindex'), 10) - 1;
                    if (this.getActiveSheet() === sheet) {
                        this.notify(colWidthChanged, { threshold: threshold, colIdx: oldIdx });
                        setResize(colIndex, colIndex, colWidth, true, this);
                    }
                }
                else {
                    var oldWidth = getColumnWidth(sheet, colIndex);
                    var threshold = void 0;
                    if (parseInt(colWidth, 10) > 0) {
                        threshold = -(oldWidth - parseInt(colWidth, 10));
                    }
                    else {
                        threshold = -oldWidth;
                    }
                    this.notify(colWidthChanged, { threshold: threshold, colIdx: colIndex });
                }
            }
            getColumn(sheet, mIndex).width = parseInt(colWidth, 10) > 0 ? parseInt(colWidth, 10) : 0;
            sheet.columns[mIndex].customWidth = true;
        }
    };
    /**
     * Set the height of row.
     *
     * {% codeBlock src='spreadsheet/setRowHeight/index.md' %}{% endcodeBlock %}
     *
     * @param {number} height - Specifies height needs to be updated. If not specified, it will set the default height 20.
     * @param {number} rowIndex - Specifies the row index. If not specified, it will consider the first row.
     * @param {number} sheetIndex - Specifies the sheetIndex. If not specified, it will consider the active sheet.
     * @param {boolean} edited - Specifies the boolean value.
     * @returns {void} - Set the height of row.
     */
    Spreadsheet.prototype.setRowHeight = function (height, rowIndex, sheetIndex, edited) {
        if (height === void 0) { height = 20; }
        if (rowIndex === void 0) { rowIndex = 0; }
        var sheet = isNullOrUndefined(sheetIndex) ? this.getActiveSheet() : this.sheets[sheetIndex - 1];
        if (sheet) {
            var mIndex = rowIndex;
            var rowHeight = (typeof height === 'number') ? height + 'px' : height;
            rowIndex = isNullOrUndefined(rowIndex) ? getCellIndexes(sheet.activeCell)[0] : rowIndex;
            if (sheet === this.getActiveSheet()) {
                if (rowIndex <= this.viewport.bottomIndex && rowIndex >= this.viewport.topIndex) {
                    if (this.scrollSettings.enableVirtualization) {
                        rowIndex = rowIndex - this.viewport.topIndex;
                    }
                    var trgt = void 0;
                    if (sheet.showHeaders) {
                        trgt = this.getRowHeaderContent().getElementsByClassName('e-header-cell')[rowIndex].parentElement;
                    }
                    else {
                        trgt = this.getContentTable().getElementsByClassName('e-row')[rowIndex];
                    }
                    var eleHeight = getRowHeight(sheet, rowIndex, true);
                    var threshold = getDPRValue(parseInt(rowHeight, 10)) - eleHeight;
                    if (threshold < 0 && eleHeight < -(threshold)) {
                        threshold = -eleHeight;
                    }
                    var oldIdx = parseInt(trgt.getAttribute('aria-rowindex'), 10) - 1;
                    if (this.getActiveSheet() === sheet) {
                        this.notify(rowHeightChanged, { threshold: threshold, rowIdx: oldIdx });
                        if (isNullOrUndefined(edited)) {
                            edited = false;
                        }
                        if (!edited) {
                            setResize(rowIndex, rowIndex, rowHeight, false, this);
                            edited = false;
                        }
                    }
                }
                else {
                    var oldHeight = getRowHeight(sheet, rowIndex);
                    var threshold = void 0;
                    if (parseInt(rowHeight, 10) > 0) {
                        threshold = -(oldHeight - parseInt(rowHeight, 10));
                    }
                    else {
                        threshold = -oldHeight;
                    }
                    this.notify(rowHeightChanged, { threshold: threshold, rowIdx: rowIndex });
                }
            }
            setRowHeight(sheet, mIndex, parseInt(rowHeight, 10) > 0 ? parseInt(rowHeight, 10) : 0);
            sheet.rows[mIndex].customHeight = true;
        }
    };
    /**
     * This method is used to autofit the range of rows or columns
     *
     * {% codeBlock src='spreadsheet/autoFit/index.md' %}{% endcodeBlock %}
     *
     * @param {string} range - range of rows or columns that needs to be autofit.
     *
     * @returns {void} - used to autofit the range of rows or columns
     * ```html
     * <div id='Spreadsheet'></div>
     * ```
     * ```typescript
     * let spreadsheet = new Spreadsheet({
     *      allowResizing: true
     * ...
     * }, '#Spreadsheet');
     * spreadsheet.autoFit('A:D'); // Auto fit from A to D columns
     * Spreadsheet.autoFit('1:4'); // Auto fit from 1 to 4 rows
     *
     * ```
     */
    Spreadsheet.prototype.autoFit = function (range) {
        var values = this.getIndexes(range);
        var startIdx = values.startIdx;
        var endIdx = values.endIdx;
        var isCol = values.isCol;
        var maximumColInx = isCol ? getColIndex('XFD') : 1048576;
        if (startIdx <= maximumColInx) {
            if (endIdx > maximumColInx) {
                endIdx = maximumColInx;
            }
        }
        else {
            return;
        }
        for (startIdx; startIdx <= endIdx; startIdx++) {
            this.notify(setAutoFit, { idx: startIdx, isCol: isCol });
        }
    };
    /**
     * @hidden
     * @param {string} range - specify the range.
     * @returns {number | boolean} - to get the index.
     *
     */
    Spreadsheet.prototype.getIndexes = function (range) {
        var startIsCol;
        var endIsCol;
        var start;
        var end;
        if (range.indexOf(':') !== -1) {
            var starttoend = range.split(':');
            start = starttoend[0];
            end = starttoend[1];
        }
        else {
            start = range;
            end = range;
        }
        if (!isNullOrUndefined(start)) {
            var startValues = this.getAddress(start);
            start = startValues.address;
            startIsCol = startValues.isCol;
        }
        if (!isNullOrUndefined(end)) {
            var endValues = this.getAddress(end);
            end = endValues.address;
            endIsCol = endValues.isCol;
        }
        var isCol = startIsCol === true && endIsCol === true ? true : false;
        var startIdx = isCol ? getColIndex(start.toUpperCase()) : parseInt(start, 10);
        var endIdx = isCol ? getColIndex(end.toUpperCase()) : parseInt(end, 10);
        return { startIdx: startIdx, endIdx: endIdx, isCol: isCol };
    };
    Spreadsheet.prototype.getAddress = function (address) {
        var isCol;
        if (address.substring(0, 1).match(/\D/g)) {
            isCol = true;
            address = address.replace(/[0-9]/g, '');
            return { address: address, isCol: isCol };
        }
        else if (address.substring(0, 1).match(/[0-9]/g) && address.match(/\D/g)) {
            return { address: '', isCol: false };
        }
        else {
            address = (parseInt(address, 10) - 1).toString();
            return { address: address, isCol: isCol };
        }
    };
    /**
     * To add the hyperlink in the cell
     *
     * {% codeBlock src='spreadsheet/addHyperlink/index.md' %}{% endcodeBlock %}
     *
     * @param {string | HyperlinkModel} hyperlink - to specify the hyperlink
     * @param {string} address - to specify the address
     * @returns {void} - To add the hyperlink in the cell
     */
    Spreadsheet.prototype.addHyperlink = function (hyperlink, address) {
        this.insertHyperlink(hyperlink, address, '', true);
    };
    /**
     * To remove the hyperlink in the cell
     *
     * {% codeBlock src='spreadsheet/removeHyperlink/index.md' %}{% endcodeBlock %}
     *
     * @param {string} range - To specify the range
     * @returns {void} - To remove the hyperlink in the cell
     */
    Spreadsheet.prototype.removeHyperlink = function (range) {
        var rangeArr;
        var sheet = this.getActiveSheet();
        var sheetIdx;
        if (range && range.indexOf('!') !== -1) {
            rangeArr = range.split('!');
            var sheets = this.sheets;
            for (var idx = 0; idx < sheets.length; idx++) {
                if (sheets[idx].name === rangeArr[0]) {
                    sheetIdx = idx;
                }
            }
            sheet = this.sheets[sheetIdx];
            range = rangeArr[1];
        }
        var rangeIndexes = range ? getRangeIndexes(range) : getRangeIndexes(this.getActiveSheet().activeCell);
        var cellMod;
        for (var rowIdx = rangeIndexes[0]; rowIdx <= rangeIndexes[2]; rowIdx++) {
            for (var colIdx = rangeIndexes[1]; colIdx <= rangeIndexes[3]; colIdx++) {
                if (sheet && sheet.rows[rowIdx] && sheet.rows[rowIdx].cells[colIdx]) {
                    cellMod = sheet.rows[rowIdx].cells[colIdx];
                    if (cellMod && cellMod.hyperlink) {
                        if (typeof (cellMod.hyperlink) === 'string') {
                            cellMod.value = cellMod.value ? cellMod.value : cellMod.hyperlink;
                        }
                        else {
                            cellMod.value = cellMod.value ? cellMod.value : cellMod.hyperlink.address;
                        }
                        delete (cellMod.hyperlink);
                        if (cellMod.style) {
                            if (sheet === this.getActiveSheet()) {
                                this.serviceLocator.getService('cell').refreshRange([rowIdx, colIdx, rowIdx, colIdx]);
                                this.notify(refreshRibbonIcons, null);
                            }
                        }
                        if (sheet === this.getActiveSheet()) {
                            var eleRowIdx = void 0;
                            var eleColIdx = void 0;
                            if (this.scrollSettings.enableVirtualization) {
                                eleRowIdx = rowIdx - this.viewport.topIndex;
                                eleColIdx = colIdx - this.viewport.leftIndex;
                            }
                            var cell = this.element.getElementsByClassName('e-sheet-content')[0].
                                getElementsByClassName('e-row')[eleRowIdx].getElementsByClassName('e-cell')[eleColIdx];
                            if (cell.getElementsByClassName('e-hyperlink')[0]) {
                                cell.innerText = cell.getElementsByClassName('e-hyperlink')[0].innerHTML;
                            }
                        }
                    }
                }
            }
        }
    };
    /**
     * @hidden
     * @param {string | HyperlinkModel} hyperlink - specify the hyperlink
     * @param {string} address - To specify the address
     * @param {string} displayText - To specify the displayText
     * @param {boolean} isMethod - To specify the bool value
     * @returns {void} - to insert the hyperlink
     */
    Spreadsheet.prototype.insertHyperlink = function (hyperlink, address, displayText, isMethod) {
        if (this.allowHyperlink) {
            //let value: string;
            var addrRange = void 0;
            var sheetIdx = void 0;
            var cellIdx = void 0;
            var sheet = this.getActiveSheet();
            // let isEmpty: boolean;
            address = address ? address : this.getActiveSheet().activeCell;
            var befArgs = { hyperlink: hyperlink, cell: address, cancel: false };
            var aftArgs = { hyperlink: hyperlink, cell: address };
            if (!isMethod) {
                this.trigger(beforeHyperlinkCreate, befArgs);
            }
            if (!befArgs.cancel) {
                hyperlink = befArgs.hyperlink;
                address = befArgs.cell;
                _super.prototype.addHyperlink.call(this, hyperlink, address);
                if (address && address.indexOf('!') !== -1) {
                    addrRange = address.split('!');
                    var sheets = this.sheets;
                    for (var idx = 0; idx < sheets.length; idx++) {
                        if (sheets[idx].name === addrRange[0]) {
                            sheetIdx = idx;
                        }
                    }
                    sheet = this.sheets[sheetIdx];
                    address = addrRange[1];
                }
                if (!sheet) {
                    return;
                }
                address = address ? address : this.getActiveSheet().activeCell;
                cellIdx = getRangeIndexes(address);
                // if (typeof (hyperlink) === 'string') {
                //     value = hyperlink;
                // } else {
                //     value = hyperlink.address;
                // }
                var mCell = sheet.rows[cellIdx[0]].cells[cellIdx[1]];
                if (isNullOrUndefined(mCell.value) || mCell.value === '') {
                    // isEmpty = true;
                    if (!isNullOrUndefined(displayText) && displayText !== '') {
                        mCell.value = displayText;
                    }
                }
                else {
                    if (mCell.value !== displayText) {
                        mCell.value = displayText;
                    }
                }
                if (!isMethod) {
                    this.trigger(afterHyperlinkCreate, aftArgs);
                }
                if (sheet === this.getActiveSheet()) {
                    this.serviceLocator.getService('cell').refreshRange(cellIdx);
                    this.notify(refreshRibbonIcons, null);
                }
            }
        }
    };
    /**
     * This method is used to add data validation.
     *
     * {% codeBlock src='spreadsheet/addDataValidation/index.md' %}{% endcodeBlock %}
     *
     * @param {ValidationModel} rules - specifies the validation rules like type, operator, value1, value2, ignoreBlank, inCellDropDown, isHighlighted arguments.
     * @param {string} range - range that needs to be add validation.
     * @returns {void} - used to add data validation.
     */
    Spreadsheet.prototype.addDataValidation = function (rules, range) {
        _super.prototype.addDataValidation.call(this, rules, range);
    };
    /**
     * This method is used for remove validation.
     *
     * {% codeBlock src='spreadsheet/removeDataValidation/index.md' %}{% endcodeBlock %}
     *
     * @param {string} range - range that needs to be remove validation.
     * @returns {void} - This method is used for remove validation.
     */
    Spreadsheet.prototype.removeDataValidation = function (range) {
        _super.prototype.removeDataValidation.call(this, range);
    };
    /**
     * This method is used to highlight the invalid data.
     *
     * {% codeBlock src='spreadsheet/addInvalidHighlight/index.md' %}{% endcodeBlock %}
     *
     * @param {string} range - range that needs to be highlight the invalid data.
     * @returns {void} - This method is used to highlight the invalid data.
     */
    Spreadsheet.prototype.addInvalidHighlight = function (range) {
        _super.prototype.addInvalidHighlight.call(this, range);
    };
    /**
     * This method is used for remove highlight from invalid data.
     *
     * {% codeBlock src='spreadsheet/removeInvalidHighlight/index.md' %}{% endcodeBlock %}
     *
     * @param {string} range - range that needs to be remove invalid highlight.
     * @returns {void} - This method is used for remove highlight from invalid data.
     */
    Spreadsheet.prototype.removeInvalidHighlight = function (range) {
        _super.prototype.removeInvalidHighlight.call(this, range);
    };
    /**
     * This method is used to add conditional formatting.
     *
     * {% codeBlock src='spreadsheet/conditionalFormat/index.md' %}{% endcodeBlock %}
     *
     * @param {ConditionalFormatModel} conditionalFormat - Specify the conditionalFormat.
     * @returns {void} - used to add conditional formatting.
     */
    Spreadsheet.prototype.conditionalFormat = function (conditionalFormat) {
        _super.prototype.conditionalFormat.call(this, conditionalFormat);
    };
    /**
     * This method is used for remove conditional formatting.
     *
     * {% codeBlock src='spreadsheet/clearConditionalFormat/index.md' %}{% endcodeBlock %}
     *
     * @param {string} range - range that needs to be remove conditional formatting.
     * @returns {void} - used for remove conditional formatting.
     */
    Spreadsheet.prototype.clearConditionalFormat = function (range) {
        range = range || this.getActiveSheet().selectedRange;
        _super.prototype.clearConditionalFormat.call(this, range);
    };
    /**
     * @hidden
     * @returns {void} - set Panel Size.
     */
    Spreadsheet.prototype.setPanelSize = function () {
        if (this.height !== 'auto') {
            var panel = document.getElementById(this.element.id + '_sheet_panel');
            panel.style.height = this.element.getBoundingClientRect().height - getSiblingsHeight(panel) + "px";
        }
    };
    /**
     * Opens the Excel file.
     *
     * {% codeBlock src='spreadsheet/open/index.md' %}{% endcodeBlock %}
     *
     * @param {OpenOptions} options - Options for opening the excel file.
     * @returns {void} - Open the Excel file.
     */
    Spreadsheet.prototype.open = function (options) {
        this.isOpen = true;
        _super.prototype.open.call(this, options);
        if (this.isOpen) {
            this.showSpinner();
        }
    };
    /**
     * @hidden
     * @param {number} startIndex - specify the start index
     * @param {number} endIndex - specify the end index.
     * @param {boolean} hide - Specify the bool value.
     * @returns {void} - To hide the row
     */
    Spreadsheet.prototype.hideRow = function (startIndex, endIndex, hide) {
        if (endIndex === void 0) { endIndex = startIndex; }
        if (hide === void 0) { hide = true; }
        var sheet = this.getActiveSheet();
        if (this.renderModule && !sheet.frozenRows && !sheet.frozenColumns) {
            this.notify(hideShow, { startIndex: startIndex, endIndex: endIndex, hide: hide });
        }
        else {
            _super.prototype.hideRow.call(this, startIndex, endIndex, hide);
        }
    };
    /**
     * @hidden
     * @param {number} startIndex - specify the start index
     * @param {number} endIndex - specify the end index.
     * @param {boolean} hide - Specify the bool value
     * @returns {void} - To hide the column
     */
    Spreadsheet.prototype.hideColumn = function (startIndex, endIndex, hide) {
        if (endIndex === void 0) { endIndex = startIndex; }
        if (hide === void 0) { hide = true; }
        var sheet = this.getActiveSheet();
        if (this.renderModule && !sheet.frozenRows && !sheet.frozenColumns) {
            this.notify(hideShow, { startIndex: startIndex, endIndex: endIndex, hide: hide, isCol: true });
        }
        else {
            _super.prototype.hideColumn.call(this, startIndex, endIndex, hide);
        }
    };
    /**
     * This method is used to Clear contents, formats and hyperlinks in spreadsheet.
     *
     * {% codeBlock src='spreadsheet/clear/index.md' %}{% endcodeBlock %}
     *
     * @param {ClearOptions} options - Options for clearing the content, formats and hyperlinks in spreadsheet.
     * @returns {void} -  Used to Clear contents, formats and hyperlinks in spreadsheet
     */
    Spreadsheet.prototype.clear = function (options) {
        this.notify(clearViewer, { options: options, isPublic: true });
    };
    /**
     * Used to refresh the spreadsheet in UI level.
     *
     * {% codeBlock src='spreadsheet/refresh/index.md' %}{% endcodeBlock %}
     *
     * @param {boolean} isNew - Specifies `true` / `false` to create new workbook in spreadsheet.
     * @returns {void} -  Used to refresh the spreadsheet.
     */
    Spreadsheet.prototype.refresh = function (isNew) {
        if (this[isReact]) {
            this[clearTemplate]();
        }
        if (isNew) {
            this.notify(blankWorkbook, {});
        }
        else {
            _super.prototype.refresh.call(this);
        }
    };
    /**
     * Used to set the image in spreadsheet.
     *
     * {% codeBlock src='spreadsheet/insertImage/index.md' %}{% endcodeBlock %}
     *
     * @param {ImageModel} images - Specifies the options to insert image in spreadsheet.
     * @param {string} range - Specifies the range in spreadsheet.
     * @returns {void} -  Used to set the image in spreadsheet.
     */
    Spreadsheet.prototype.insertImage = function (images, range) {
        var i;
        for (i = 0; i < images.length; i++) {
            this.notify(createImageElement, {
                options: images[i],
                range: range ? range : this.getActiveSheet().selectedRange, isPublic: true
            });
        }
    };
    /**
     * Used to delete the image in spreadsheet.
     *
     * {% codeBlock src='spreadsheet/deleteImage/index.md' %}{% endcodeBlock %}
     *
     * @param {string} id - Specifies the id of the image element to be deleted.
     * @param {string} range - Specifies the range in spreadsheet.
     * @returns {void} - Used to delete the image in spreadsheet.
     */
    Spreadsheet.prototype.deleteImage = function (id, range) {
        this.notify(deleteImage, { id: id, range: range ? range : this.getActiveSheet().selectedRange });
    };
    /**
     * Gets the row header div of the Spreadsheet.
     *
     * @returns {Element} - Gets the row header div of the Spreadsheet.
     * @hidden
     */
    Spreadsheet.prototype.getRowHeaderContent = function () {
        return this.sheetModule.getRowHeaderPanel();
    };
    /**
     * Gets the column header div of the Spreadsheet.
     *
     * @returns {HTMLElement} - Gets the column header div of the Spreadsheet.
     * @hidden
     */
    Spreadsheet.prototype.getColumnHeaderContent = function () {
        return this.sheetModule.getColHeaderPanel();
    };
    /**
     * Gets the main content div of the Spreadsheet.
     *
     * @returns {HTMLElement} - Gets the main content div of the Spreadsheet.
     * @hidden
     */
    Spreadsheet.prototype.getMainContent = function () {
        return this.sheetModule.getContentPanel();
    };
    /**
     * Get the select all div of spreadsheet
     *
     * @returns {HTMLElement} - Get the select all div of spreadsheet
     */
    Spreadsheet.prototype.getSelectAllContent = function () {
        return this.sheetModule.getSelectAllContent();
    };
    /**
     * Gets the horizontal scroll element of the Spreadsheet.
     *
     * @returns {HTMLElement} - Gets the column header div of the Spreadsheet.
     * @hidden
     */
    Spreadsheet.prototype.getScrollElement = function () {
        return this.sheetModule.getScrollElement();
    };
    /**
     * Get the main content table element of spreadsheet.
     *
     * @returns {HTMLTableElement} -Get the main content table element of spreadsheet.
     * @hidden
     */
    Spreadsheet.prototype.getContentTable = function () {
        return this.sheetModule.getContentTable();
    };
    /**
     * Get the row header table element of spreadsheet.
     *
     * @returns {HTMLTableElement} - Get the row header table element of spreadsheet.
     * @hidden
     */
    Spreadsheet.prototype.getRowHeaderTable = function () {
        return this.sheetModule.getRowHeaderTable();
    };
    /**
     * Get the column header table element of spreadsheet.
     *
     * @returns {HTMLTableElement} - Get the column header table element of spreadsheet.
     * @hidden
     */
    Spreadsheet.prototype.getColHeaderTable = function () {
        return this.sheetModule.getColHeaderTable();
    };
    /**
     * To get the backup element count for row and column virtualization.
     *
     * @param {'row' | 'col'} layout -  specify the layout.
     * @returns {number} - To get the backup element count for row and column virtualization.
     * @hidden
     */
    Spreadsheet.prototype.getThreshold = function (layout) {
        var threshold = Math.round((this.viewport[layout + 'Count'] + 1) / 2);
        return threshold < 15 ? 15 : threshold;
    };
    /**
     * @hidden
     * @returns {boolean} - Returns the bool value.
     */
    Spreadsheet.prototype.isMobileView = function () {
        return ((this.cssClass.indexOf('e-mobile-view') > -1 || Browser.isDevice) && this.cssClass.indexOf('e-desktop-view') === -1)
            && false;
    };
    /**
     * @hidden
     * @param {number} sheetIndex - specify the sheet index
     * @param {number} rowIndex - specify the row index.
     * @param {number} colIndex - specify the col index.
     * @returns {string | number} - to get Value Row Col.
     */
    Spreadsheet.prototype.getValueRowCol = function (sheetIndex, rowIndex, colIndex) {
        var val = _super.prototype.getValueRowCol.call(this, sheetIndex, rowIndex, colIndex);
        return val;
    };
    /**
     * To update a cell properties.
     *
     * {% codeBlock src='spreadsheet/updateCell/index.md' %}{% endcodeBlock %}
     *
     * @param {CellModel} cell - Cell properties.
     * @param {string} address - Address to update.
     * @returns {void} - To update a cell properties.
     */
    Spreadsheet.prototype.updateCell = function (cell, address) {
        address = address || this.getActiveSheet().activeCell;
        _super.prototype.updateCell.call(this, cell, address);
        this.serviceLocator.getService('cell').refreshRange(getIndexesFromAddress(address));
        this.notify(activeCellChanged, null);
    };
    /**
     * Sorts the range of cells in the active sheet.
     *
     * {% codeBlock src='spreadsheet/sort/index.md' %}{% endcodeBlock %}
     *
     * @param {SortOptions} sortOptions - options for sorting.
     * @param {string} range - address of the data range.
     * @returns {Promise<SortEventArgs>} - Sorts the range of cells in the active sheet.
     */
    Spreadsheet.prototype.sort = function (sortOptions, range) {
        var _this = this;
        if (!this.allowSorting) {
            return Promise.reject();
        }
        return _super.prototype.sort.call(this, sortOptions, range).then(function (args) {
            _this.notify(sortComplete, args);
            return Promise.resolve(args);
        });
    };
    /**
     * @hidden
     * @param {number} sheetIndex - specify the sheet index.
     * @param {string | number} value - Specify the value.
     * @param {number} rowIndex - Specify the row index.
     * @param {number} colIndex - Specify the col index.
     * @returns {void} - To set value for row and col.
     */
    Spreadsheet.prototype.setValueRowCol = function (sheetIndex, value, rowIndex, colIndex) {
        if (value === 'circular reference: ') {
            var circularArgs = {
                action: 'isCircularReference', argValue: value
            };
            this.notify(formulaOperation, circularArgs);
            value = circularArgs.argValue;
        }
        _super.prototype.setValueRowCol.call(this, sheetIndex, value, rowIndex, colIndex);
        sheetIndex = getSheetIndexFromId(this, sheetIndex);
        this.notify(editOperation, {
            action: 'refreshDependentCellValue', rowIdx: rowIndex, colIdx: colIndex,
            sheetIdx: sheetIndex
        });
    };
    /**
     * Get component name.
     *
     * @returns {string} - Get component name.
     * @hidden
     */
    Spreadsheet.prototype.getModuleName = function () {
        return 'spreadsheet';
    };
    /**
     * @hidden
     * @param {Element} td - Specify the element.
     * @param {RefreshValueArgs} args - specify the args.
     * @returns {void} - to refresh the node.
     */
    Spreadsheet.prototype.refreshNode = function (td, args) {
        var value;
        if (td) {
            var spanElem = select('#' + this.element.id + '_currency', td);
            var alignClass = 'e-right-align';
            if (args) {
                args.result = isNullOrUndefined(args.result) ? '' : args.result.toString();
                if (spanElem) {
                    detach(spanElem);
                }
                if (args.type === 'Accounting' && isNumber(args.value)) {
                    if (td.querySelector('a')) {
                        td.querySelector('a').textContent = args.result.split(args.curSymbol).join('');
                    }
                    else {
                        td.innerHTML = '';
                    }
                    td.appendChild(this.createElement('span', {
                        id: this.element.id + '_currency',
                        innerHTML: "" + args.curSymbol,
                        styles: 'float: left'
                    }));
                    if (!td.querySelector('a')) {
                        td.innerHTML += args.result.split(args.curSymbol).join('');
                    }
                    td.classList.add(alignClass);
                    return;
                }
                else {
                    if (args.result && (args.result.toLowerCase() === 'true' || args.result.toLowerCase() === 'false')) {
                        args.result = args.result.toUpperCase();
                        alignClass = 'e-center-align';
                        args.isRightAlign = true; // Re-use this to center align the cell.
                    }
                    value = args.result;
                }
                if (args.isRightAlign) {
                    td.classList.add(alignClass);
                }
                else {
                    td.classList.remove(alignClass);
                }
            }
            value = !isNullOrUndefined(value) ? value : '';
            if (!isNullOrUndefined(td)) {
                var node = td.lastChild;
                if (td.querySelector('.e-databar-value')) {
                    node = td.querySelector('.e-databar-value').lastChild;
                }
                if (td.querySelector('.e-hyperlink')) {
                    node = td.querySelector('.e-hyperlink').lastChild;
                }
                if (td.querySelector('.e-wrap-content')) {
                    node = td.querySelector('.e-wrap-content').lastChild;
                }
                if (node && (node.nodeType === 3 || node.nodeType === 1)) {
                    node.nodeValue = value;
                }
                else {
                    td.appendChild(document.createTextNode(value));
                }
            }
        }
    };
    /**
     * @hidden
     * @param {CellStyleModel} style - specify the style.
     * @param {number} lines - Specify the lines.
     * @param {number} borderWidth - Specify the borderWidth.
     * @returns {number} - To calculate Height
     */
    Spreadsheet.prototype.calculateHeight = function (style, lines, borderWidth) {
        if (lines === void 0) { lines = 1; }
        if (borderWidth === void 0) { borderWidth = 1; }
        var fontSize = (style && style.fontSize) || this.cellStyle.fontSize;
        var threshold = style.fontFamily === 'Arial Black' ? 1.44 : 1.24;
        return ((fontSize.indexOf('pt') > -1 ? parseInt(fontSize, 10) * 1.33 : parseInt(fontSize, 10)) * threshold * lines) +
            (borderWidth * threshold);
    };
    /**
     * @hidden
     * @param {number} startIdx - specify the start index.
     * @param {number} endIdx - Specify the end index.
     * @param {string} layout - Specify the rows.
     * @returns {number[]} - To skip the hidden rows.
     */
    Spreadsheet.prototype.skipHidden = function (startIdx, endIdx, layout) {
        if (layout === void 0) { layout = 'rows'; }
        var sheet = this.getActiveSheet();
        var totalCount;
        if (this.scrollSettings.isFinite) {
            totalCount = (layout === 'rows' ? sheet.rowCount : sheet.colCount) - 1;
        }
        for (var i = startIdx; i <= endIdx; i++) {
            if ((sheet[layout])[i] && (sheet[layout])[i].hidden) {
                if (sheet.frozenColumns || sheet.frozenRows) {
                    if (layout === 'rows') {
                        setRow(sheet, i, { hidden: false });
                    }
                    else {
                        setColumn(sheet, i, { hidden: false });
                    }
                    continue;
                }
                if (startIdx === i) {
                    startIdx++;
                }
                endIdx++;
                if (totalCount && endIdx > totalCount) {
                    endIdx = totalCount;
                    break;
                }
            }
        }
        return [startIdx, endIdx];
    };
    /**
     * @hidden
     * @param {HTMLElement} nextTab - Specify the element.
     * @param {string} selector - Specify the selector
     * @returns {void} - To update the active border.
     */
    Spreadsheet.prototype.updateActiveBorder = function (nextTab, selector) {
        if (selector === void 0) { selector = '.e-ribbon'; }
        var indicator = select(selector + " .e-tab-header .e-indicator", this.element);
        indicator.style.display = 'none';
        setStyleAttribute(indicator, { 'left': '', 'right': '' });
        setStyleAttribute(indicator, {
            'left': nextTab.offsetLeft + 'px', 'right': nextTab.parentElement.offsetWidth - (nextTab.offsetLeft + nextTab.offsetWidth) + 'px'
        });
        indicator.style.display = '';
    };
    /**
     * To perform the undo operation in spreadsheet.
     *
     * {% codeBlock src='spreadsheet/undo/index.md' %}{% endcodeBlock %}
     *
     * @returns {void} - To perform the undo operation in spreadsheet.
     */
    Spreadsheet.prototype.undo = function () {
        this.notify(performUndoRedo, { isUndo: true, isPublic: true });
    };
    /**
     * To perform the redo operation in spreadsheet.
     *
     * {% codeBlock src='spreadsheet/redo/index.md' %}{% endcodeBlock %}
     *
     * @returns {void} - To perform the redo operation in spreadsheet.
     */
    Spreadsheet.prototype.redo = function () {
        this.notify(performUndoRedo, { isUndo: false, isPublic: true });
    };
    /**
     * To update the undo redo collection in spreadsheet.
     *
     * {% codeBlock src='spreadsheet/updateUndoRedoCollection/index.md' %}{% endcodeBlock %}
     *
     * @param {object} args - options for undo redo.
     * @returns {void} - To update the undo redo collection in spreadsheet.
     */
    Spreadsheet.prototype.updateUndoRedoCollection = function (args) {
        this.notify(updateUndoRedoCollection, { args: args, isPublic: true });
    };
    /**
     * Adds the defined name to the Spreadsheet.
     *
     * {% codeBlock src='spreadsheet/addDefinedName/index.md' %}{% endcodeBlock %}
     *
     * @param {DefineNameModel} definedName - Specifies the name, scope, comment, refersTo.
     * @returns {boolean} - Return the added status of the defined name.
     */
    Spreadsheet.prototype.addDefinedName = function (definedName) {
        var eventArgs = {
            action: 'addDefinedName',
            isAdded: false,
            definedName: definedName
        };
        this.notify(formulaOperation, eventArgs);
        return eventArgs.isAdded;
    };
    /**
     * Removes the defined name from the Spreadsheet.
     *
     * {% codeBlock src='spreadsheet/removeDefinedName/index.md' %}{% endcodeBlock %}
     *
     * @param {string} definedName - Specifies the name.
     * @param {string} scope - Specifies the scope of the defined name.
     * @returns {boolean} - Return the removed status of the defined name.
     */
    Spreadsheet.prototype.removeDefinedName = function (definedName, scope) {
        return _super.prototype.removeDefinedName.call(this, definedName, scope);
    };
    Spreadsheet.prototype.mouseClickHandler = function (e) {
        this.notify(click, e);
    };
    Spreadsheet.prototype.mouseDownHandler = function (e) {
        this.notify(mouseDown, e);
    };
    Spreadsheet.prototype.keyUpHandler = function (e) {
        if (closest(e.target, '.e-find-dlg')) {
            this.notify(findKeyUp, e);
        }
        else {
            this.notify(keyUp, e);
        }
    };
    Spreadsheet.prototype.keyDownHandler = function (e) {
        if (!closest(e.target, '.e-findtool-dlg')) {
            this.notify(keyDown, e);
        }
    };
    Spreadsheet.prototype.freeze = function (e) {
        var args = { row: e.row, column: e.column,
            cancel: false, sheetIndex: this.activeSheetIndex };
        this.notify(beginAction, { eventArgs: args, action: 'freezePanes' });
        if (args.cancel) {
            return;
        }
        this.on(contentLoaded, this.freezePaneUpdated, this);
        // const indexes: number[] = getCellIndexes(this.getActiveSheet().topLeftCell);
        if (e.row || e.column) {
            var hasFilter = false;
            this.notify(getFilteredCollection, null);
            if (this.filterCollection) {
                for (var i = 0, len = this.filterCollection.length; i < len; i++) {
                    if (this.filterCollection[i].sheetIndex === this.activeSheetIndex) {
                        hasFilter = true;
                        break;
                    }
                }
            }
            if (hasFilter) {
                this.clearFilter();
            }
        }
        this.freezePanes(e.row, e.column);
        this.notify(refreshRibbonIcons, null);
    };
    Spreadsheet.prototype.freezePaneUpdated = function () {
        this.off(contentLoaded, this.freezePaneUpdated);
        var sheet = this.getActiveSheet();
        this.notify(completeAction, { eventArgs: { row: sheet.frozenRows, column: sheet.frozenColumns,
                sheetIndex: this.activeSheetIndex }, action: 'freezePanes' });
    };
    /**
     * Binding events to the element while component creation.
     *
     * @returns {void} - Binding events to the element while component creation.
     */
    Spreadsheet.prototype.wireEvents = function () {
        EventHandler.add(this.element, 'click', this.mouseClickHandler, this);
        EventHandler.add(this.element, getStartEvent(), this.mouseDownHandler, this);
        EventHandler.add(this.element, 'keyup', this.keyUpHandler, this);
        EventHandler.add(this.element, 'keydown', this.keyDownHandler, this);
        EventHandler.add(this.element, 'noderefresh', this.refreshNode, this);
        this.on(freeze, this.freeze, this);
    };
    /**
     * Destroys the component (detaches/removes all event handlers, attributes, classes, and empties the component element).
     *
     * @returns {void} - Destroys the component
     */
    Spreadsheet.prototype.destroy = function () {
        if (this[isReact]) {
            this[clearTemplate]();
        }
        this.unwireEvents();
        this.notify(spreadsheetDestroyed, null);
        _super.prototype.destroy.call(this);
        this.element.innerHTML = '';
        this.element.removeAttribute('tabindex');
        this.element.removeAttribute('role');
        this.element.style.removeProperty('height');
        this.element.style.removeProperty('width');
        this.element.style.removeProperty('min-height');
        this.element.style.removeProperty('min-width');
    };
    /**
     * Unbinding events from the element while component destroy.
     *
     * @returns {void} - Unbinding events from the element while component destroy.
     */
    Spreadsheet.prototype.unwireEvents = function () {
        EventHandler.remove(this.element, 'click', this.mouseClickHandler);
        EventHandler.remove(this.element, getStartEvent(), this.mouseDownHandler);
        EventHandler.remove(this.element, 'keyup', this.keyUpHandler);
        EventHandler.remove(this.element, 'keydown', this.keyDownHandler);
        EventHandler.remove(this.element, 'noderefresh', this.refreshNode);
        this.off(freeze, this.freeze);
    };
    /**
     * To add context menu items.
     *
     * {% codeBlock src='spreadsheet/addContextMenu/index.md' %}{% endcodeBlock %}
     *
     * @param {MenuItemModel[]} items - Items that needs to be added.
     * @param {string} text - Item before / after that the element to be inserted.
     * @param {boolean} insertAfter - Set `false` if the `items` need to be inserted before the `text`.
     * By default, `items` are added after the `text`.
     * @param {boolean} isUniqueId - Set `true` if the given `text` is a unique id.
     * @returns {void} - To add context menu items.
     */
    Spreadsheet.prototype.addContextMenuItems = function (items, text, insertAfter, isUniqueId) {
        if (insertAfter === void 0) { insertAfter = true; }
        this.notify(addContextMenuItems, { items: items, text: text, insertAfter: insertAfter, isUniqueId: isUniqueId });
    };
    /**
     * To remove existing context menu items.
     *
     * {% codeBlock src='spreadsheet/removeContextMenuItems/index.md' %}{% endcodeBlock %}
     *
     * @param {string[]} items - Items that needs to be removed.
     * @param {boolean} isUniqueId - Set `true` if the given `text` is a unique id.
     * @returns {void} - To remove existing context menu items.
     */
    Spreadsheet.prototype.removeContextMenuItems = function (items, isUniqueId) {
        this.notify(removeContextMenuItems, { items: items, isUniqueId: isUniqueId });
    };
    /**
     * To enable / disable context menu items.
     *
     * {% codeBlock src='spreadsheet/enableContextMenuItems/index.md' %}{% endcodeBlock %}
     *
     * @param {string[]} items - Items that needs to be enabled / disabled.
     * @param {boolean} enable - Set `true` / `false` to enable / disable the menu items.
     * @param {boolean} isUniqueId - Set `true` if the given `text` is a unique id.
     * @returns {void} - To enable / disable context menu items.
     */
    Spreadsheet.prototype.enableContextMenuItems = function (items, enable, isUniqueId) {
        if (enable === void 0) { enable = true; }
        this.notify(enableContextMenuItems, { items: items, enable: enable, isUniqueId: isUniqueId });
    };
    /**
     * To enable / disable file menu items.
     *
     * {% codeBlock src='spreadsheet/enableFileMenuItems/index.md' %}{% endcodeBlock %}
     *
     * @param {string[]} items - Items that needs to be enabled / disabled.
     * @param {boolean} enable - Set `true` / `false` to enable / disable the menu items.
     * @param {boolean} isUniqueId - Set `true` if the given file menu items `text` is a unique id.
     * @returns {void} - To enable / disable file menu items.
     */
    Spreadsheet.prototype.enableFileMenuItems = function (items, enable, isUniqueId) {
        if (enable === void 0) { enable = true; }
        this.notify(enableFileMenuItems, { items: items, enable: enable, isUniqueId: isUniqueId });
    };
    /**
     * To show/hide the file menu items in Spreadsheet ribbon.
     *
     * {% codeBlock src='spreadsheet/hideFileMenuItems/index.md' %}{% endcodeBlock %}
     *
     * @param {string[]} items - Specifies the file menu items text which is to be show/hide.
     * @param {boolean} hide - Set `true` / `false` to hide / show the file menu items.
     * @param {boolean} isUniqueId - Set `true` if the given file menu items `text` is a unique id.
     * @returns {void} - To show/hide the file menu items in Spreadsheet ribbon.
     */
    Spreadsheet.prototype.hideFileMenuItems = function (items, hide, isUniqueId) {
        if (hide === void 0) { hide = true; }
        this.notify(hideFileMenuItems, { items: items, hide: hide, isUniqueId: isUniqueId });
    };
    /**
     * To add custom file menu items.
     *
     * {% codeBlock src='spreadsheet/addFileMenuItems/index.md' %}{% endcodeBlock %}
     *
     * @param {MenuItemModel[]} items - Specifies the ribbon file menu items to be inserted.
     * @param {string} text - Specifies the existing file menu item text before / after which the new file menu items to be inserted.
     * @param {boolean} insertAfter - Set `false` if the `items` need to be inserted before the `text`.
     * By default, `items` are added after the `text`.
     * @param {boolean} isUniqueId - Set `true` if the given file menu items `text` is a unique id.
     * @returns {void} - To add custom file menu items.
     */
    Spreadsheet.prototype.addFileMenuItems = function (items, text, insertAfter, isUniqueId) {
        if (insertAfter === void 0) { insertAfter = true; }
        this.notify(addFileMenuItems, { items: items, text: text, insertAfter: insertAfter, isUniqueId: isUniqueId });
    };
    /**
     * To show/hide the existing ribbon tabs.
     *
     * {% codeBlock src='spreadsheet/hideRibbonTabs/index.md' %}{% endcodeBlock %}
     *
     * @param {string[]} tabs - Specifies the tab header text which needs to be shown/hidden.
     * @param {boolean} hide - Set `true` / `false` to hide / show the ribbon tabs.
     * @returns {void} - To show/hide the existing ribbon tabs.
     */
    Spreadsheet.prototype.hideRibbonTabs = function (tabs, hide) {
        if (hide === void 0) { hide = true; }
        this.notify(hideRibbonTabs, { tabs: tabs, hide: hide });
    };
    /**
     * To enable / disable the existing ribbon tabs.
     *
     * {% codeBlock src='spreadsheet/enableRibbonTabs/index.md' %}{% endcodeBlock %}
     *
     * @param {string[]} tabs - Specifies the tab header text which needs to be enabled / disabled.
     * @param {boolean} enable - Set `true` / `false` to enable / disable the ribbon tabs.
     * @returns {void} - To enable / disable the existing ribbon tabs.
     */
    Spreadsheet.prototype.enableRibbonTabs = function (tabs, enable) {
        if (enable === void 0) { enable = true; }
        this.notify(enableRibbonTabs, { tabs: tabs, enable: enable });
    };
    /**
     * To add custom ribbon tabs.
     *
     * {% codeBlock src='spreadsheet/addRibbonTabs/index.md' %}{% endcodeBlock %}
     *
     * @param {RibbonItemModel[]} items - Specifies the ribbon tab items to be inserted.
     * @param {string} insertBefore - Specifies the existing ribbon header text before which the new tabs will be inserted.
     * If not specified, the new tabs will be inserted at the end.
     * @returns {void} - To add custom ribbon tabs.
     */
    Spreadsheet.prototype.addRibbonTabs = function (items, insertBefore) {
        this.notify(addRibbonTabs, { items: items, insertBefore: insertBefore });
    };
    /**
     * Enables or disables the specified ribbon toolbar items or all ribbon items.
     *
     * {% codeBlock src='spreadsheet/enableToolbarItems/index.md' %}{% endcodeBlock %}
     *
     * @param {string} tab - Specifies the ribbon tab header text under which the toolbar items need to be enabled / disabled.
     * @param {number[]} items - Specifies the toolbar item indexes / unique id's which needs to be enabled / disabled.
     * If it is not specified the entire toolbar items will be enabled / disabled.
     * @param  {boolean} enable - Boolean value that determines whether the toolbar items should be enabled or disabled.
     * @returns {void} - Enables or disables the specified ribbon toolbar items or all ribbon items.
     */
    Spreadsheet.prototype.enableToolbarItems = function (tab, items, enable) {
        this.notify(enableToolbarItems, [{ tab: tab, items: items, enable: enable === undefined ? true : enable }]);
    };
    /**
     * To show/hide the existing Spreadsheet ribbon toolbar items.
     *
     * {% codeBlock src='spreadsheet/hideToolbarItems/index.md' %}{% endcodeBlock %}
     *
     * @param {string} tab - Specifies the ribbon tab header text under which the specified items needs to be hidden / shown.
     * @param {number[]} indexes - Specifies the toolbar indexes which needs to be shown/hidden from UI.
     * @param {boolean} hide - Set `true` / `false` to hide / show the toolbar items.
     * @returns {void} - To show/hide the existing Spreadsheet ribbon toolbar items.
     */
    Spreadsheet.prototype.hideToolbarItems = function (tab, indexes, hide) {
        if (hide === void 0) { hide = true; }
        this.notify(hideToolbarItems, { tab: tab, indexes: indexes, hide: hide });
    };
    /**
     * To add the custom items in Spreadsheet ribbon toolbar.
     *
     * {% codeBlock src='spreadsheet/addToolbarItems/index.md' %}{% endcodeBlock %}
     *
     * @param {string} tab - Specifies the ribbon tab header text under which the specified items will be inserted.
     * @param {ItemModel[]} items - Specifies the ribbon toolbar items that needs to be inserted.
     * @param {number} index - Specifies the index text before which the new items will be inserted.
     * If not specified, the new items will be inserted at the end of the toolbar.
     * @returns {void} - To add the custom items in Spreadsheet ribbon toolbar.
     */
    Spreadsheet.prototype.addToolbarItems = function (tab, items, index) {
        this.notify(addToolbarItems, { tab: tab, items: items, index: index });
    };
    /**
     * Selects the cell / range of cells with specified address.
     *
     * {% codeBlock src='spreadsheet/selectRange/index.md' %}{% endcodeBlock %}
     *
     * @param {string} address - Specifies the range address.
     * @returns {void} - To select the range.
     */
    Spreadsheet.prototype.selectRange = function (address) {
        this.notify(selectRange, { address: address });
    };
    /**
     * Start edit the active cell.
     *
     * {% codeBlock src='spreadsheet/startEdit/index.md' %}{% endcodeBlock %}
     *
     * @returns {void} - Start edit the active cell.
     */
    Spreadsheet.prototype.startEdit = function () {
        this.notify(editOperation, { action: 'startEdit', isNewValueEdit: false });
    };
    /**
     * Cancels the edited state, this will not update any value in the cell.
     *
     * {% codeBlock src='spreadsheet/closeEdit/index.md' %}{% endcodeBlock %}
     *
     * @returns {void} - Cancels the edited state, this will not update any value in the cell.
     */
    Spreadsheet.prototype.closeEdit = function () {
        this.notify(editOperation, { action: 'cancelEdit' });
    };
    /**
     * If Spreadsheet is in editable state, you can save the cell by invoking endEdit.
     *
     * {% codeBlock src='spreadsheet/endEdit/index.md' %}{% endcodeBlock %}
     *
     * @returns {void} - If Spreadsheet is in editable state, you can save the cell by invoking endEdit.
     */
    Spreadsheet.prototype.endEdit = function () {
        this.notify(editOperation, { action: 'endEdit' });
    };
    /**
     * Called internally if any of the property value changed.
     *
     * @param  {SpreadsheetModel} newProp - Specify the new properties
     * @param  {SpreadsheetModel} oldProp - Specify the old properties
     * @returns {void} - Called internally if any of the property value changed.
     * @hidden
     */
    Spreadsheet.prototype.onPropertyChanged = function (newProp, oldProp) {
        var _this = this;
        _super.prototype.onPropertyChanged.call(this, newProp, oldProp);
        for (var _i = 0, _a = Object.keys(newProp); _i < _a.length; _i++) {
            var prop = _a[_i];
            var header = void 0;
            var addBtn = void 0;
            switch (prop) {
                case 'enableRtl':
                    header = this.getColumnHeaderContent();
                    if (header) {
                        header = header.parentElement;
                    }
                    if (!header) {
                        break;
                    }
                    if (newProp.enableRtl) {
                        header.style.marginLeft = getScrollBarWidth() + 'px';
                        header.style.marginRight = '';
                        document.getElementById(this.element.id + '_sheet_panel').classList.add('e-rtl');
                    }
                    else {
                        header.style.marginRight = getScrollBarWidth() + 'px';
                        header.style.marginLeft = '';
                        document.getElementById(this.element.id + '_sheet_panel').classList.remove('e-rtl');
                    }
                    this.renderModule.refreshSheet();
                    break;
                case 'cssClass':
                    if (oldProp.cssClass) {
                        removeClass([this.element], oldProp.cssClass.split(' '));
                    }
                    if (newProp.cssClass) {
                        addClass([this.element], newProp.cssClass.split(' '));
                    }
                    break;
                case 'activeSheetIndex':
                    this.renderModule.refreshSheet();
                    this.notify(activeSheetChanged, { idx: newProp.activeSheetIndex });
                    break;
                case 'width':
                    this.setWidth();
                    this.resize();
                    break;
                case 'height':
                    this.setHeight();
                    this.resize();
                    break;
                case 'showRibbon':
                    this.notify(ribbon, { uiUpdate: true });
                    break;
                case 'showFormulaBar':
                    this.notify(formulaBar, { uiUpdate: true });
                    break;
                case 'showSheetTabs':
                    this.notify(sheetTabs, null);
                    break;
                case 'cellStyle':
                    this.renderModule.refreshSheet();
                    break;
                case 'allowEditing':
                    if (this.allowEditing) {
                        this.notify(editOperation, { action: 'renderEditor' });
                    }
                    break;
                case 'allowInsert':
                    addBtn = this.element.getElementsByClassName('e-add-sheet-tab')[0];
                    if (addBtn) {
                        addBtn.disabled = !this.allowInsert;
                        if (this.allowInsert) {
                            if (addBtn.classList.contains('e-disabled')) {
                                addBtn.classList.remove('e-disabled');
                            }
                        }
                        else {
                            if (!addBtn.classList.contains('e-disabled')) {
                                addBtn.classList.add('e-disabled');
                            }
                        }
                    }
                    break;
                case 'sheets':
                    if (newProp.sheets === this.sheets) {
                        this.renderModule.refreshSheet();
                        this.notify(refreshSheetTabs, null);
                        break;
                    }
                    Object.keys(newProp.sheets).forEach(function (sheetIdx, index) {
                        var sheet = newProp.sheets[sheetIdx];
                        if (sheet.ranges && Object.keys(sheet.ranges).length) {
                            var ranges_1 = Object.keys(sheet.ranges);
                            var newRangeIdx_1;
                            ranges_1.forEach(function (rangeIdx, idx) {
                                if (!sheet.ranges[rangeIdx].info) {
                                    newRangeIdx_1 = idx;
                                }
                            });
                            ranges_1.forEach(function (rangeIdx, idx) {
                                if (sheet.ranges[rangeIdx].dataSource && (isUndefined(newRangeIdx_1)
                                    || (!isUndefined(newRangeIdx_1) && newRangeIdx_1 === idx))) {
                                    _this.notify(dataSourceChanged, {
                                        sheetIdx: sheetIdx, rangeIdx: rangeIdx,
                                        isLastRange: ranges_1.length - 1 === idx
                                    });
                                }
                            });
                        }
                        else {
                            if (index === 0) {
                                _this.renderModule.refreshSheet();
                            }
                            if (_this.showSheetTabs && sheet.name) {
                                _this.notify(sheetNameUpdate, {
                                    items: _this.element.querySelector('.e-sheet-tabs-items').children[sheetIdx],
                                    value: sheet.name,
                                    idx: sheetIdx
                                });
                            }
                        }
                    });
                    break;
                case 'locale':
                    this.refresh();
                    break;
                case 'password':
                    if (this.password.length > 0) {
                        if (this.showSheetTabs) {
                            this.element.querySelector('.e-add-sheet-tab').setAttribute('disabled', 'true');
                            this.element.querySelector('.e-add-sheet-tab').classList.add('e-disabled');
                        }
                    }
                    break;
                case 'isProtected':
                    if (this.isProtected) {
                        var addBtn_1 = this.element.getElementsByClassName('e-add-sheet-tab')[0];
                        if (addBtn_1) {
                            addBtn_1.disabled = this.isProtected;
                            if (this.isProtected) {
                                if (addBtn_1.classList.contains('e-disabled')) {
                                    addBtn_1.classList.add('e-disabled');
                                }
                            }
                            else {
                                if (!addBtn_1.classList.contains('e-disabled')) {
                                    addBtn_1.classList.remove('e-disabled');
                                }
                            }
                        }
                    }
            }
        }
    };
    /**
     * To provide the array of modules needed for component rendering.
     *
     * @returns {ModuleDeclaration[]} - To provide the array of modules needed for component rendering.
     * @hidden
     */
    Spreadsheet.prototype.requiredModules = function () {
        return getRequiredModules(this);
    };
    /**
     * Appends the control within the given HTML Div element.
     *
     * {% codeBlock src='spreadsheet/appendTo/index.md' %}{% endcodeBlock %}
     *
     * @param {string | HTMLElement} selector - Target element where control needs to be appended.
     * @returns {void} - Appends the control within the given HTML Div element.
     */
    Spreadsheet.prototype.appendTo = function (selector) {
        _super.prototype.appendTo.call(this, selector);
    };
    /**
     * Filters the range of cells in the sheet.
     *
     * @hidden
     * @param {FilterOptions} filterOptions - specifiy the FilterOptions.
     * @param {string} range - Specify the range
     * @returns {Promise<FilterEventArgs>} - Filters the range of cells in the sheet.
     */
    Spreadsheet.prototype.filter = function (filterOptions, range) {
        if (!this.allowFiltering) {
            return Promise.reject();
        }
        range = range || this.getActiveSheet().selectedRange;
        return _super.prototype.filter.call(this, filterOptions, range);
    };
    /**
     * Clears the filter changes of the sheet.
     *
     * {% codeBlock src='spreadsheet/clearFilter/index.md' %}{% endcodeBlock %}
     *
     * @param {string} field - Specify the field.
     * @returns {void} - To clear the filter.
     */
    Spreadsheet.prototype.clearFilter = function (field) {
        if (field) {
            this.notify(clearFilter, { field: field });
        }
        else {
            _super.prototype.clearFilter.call(this);
        }
    };
    /**
     * Applies the filter UI in the range of cells in the sheet.
     *
     * {% codeBlock src='spreadsheet/applyFilter/index.md' %}{% endcodeBlock %}
     *
     * @param {PredicateModel[]} predicates - Specifies the predicates.
     * @param {string} range - Specify the range.
     * @returns {void} - to apply the filter.
     */
    Spreadsheet.prototype.applyFilter = function (predicates, range) {
        this.notify(initiateFilterUI, { predicates: predicates, range: range });
    };
    /**
     * To add custom library function.
     *
     *  {% codeBlock src='spreadsheet/addCustomFunction/index.md' %}{% endcodeBlock %}
     *
     * @param {string} functionHandler - Custom function handler name
     * @param {string} functionName - Custom function name
     * @returns {void} - To add custom function.
     */
    Spreadsheet.prototype.addCustomFunction = function (functionHandler, functionName) {
        _super.prototype.addCustomFunction.call(this, functionHandler, functionName);
        this.notify(refreshFormulaDatasource, null);
    };
    var Spreadsheet_1;
    __decorate([
        Property('')
    ], Spreadsheet.prototype, "cssClass", void 0);
    __decorate([
        Property(true)
    ], Spreadsheet.prototype, "allowScrolling", void 0);
    __decorate([
        Property(true)
    ], Spreadsheet.prototype, "allowResizing", void 0);
    __decorate([
        Property(true)
    ], Spreadsheet.prototype, "enableClipboard", void 0);
    __decorate([
        Property(true)
    ], Spreadsheet.prototype, "enableContextMenu", void 0);
    __decorate([
        Property(true)
    ], Spreadsheet.prototype, "enableKeyboardNavigation", void 0);
    __decorate([
        Property(true)
    ], Spreadsheet.prototype, "enableKeyboardShortcut", void 0);
    __decorate([
        Property(true)
    ], Spreadsheet.prototype, "allowUndoRedo", void 0);
    __decorate([
        Property(true)
    ], Spreadsheet.prototype, "allowWrap", void 0);
    __decorate([
        Complex({}, SelectionSettings)
    ], Spreadsheet.prototype, "selectionSettings", void 0);
    __decorate([
        Complex({}, ScrollSettings)
    ], Spreadsheet.prototype, "scrollSettings", void 0);
    __decorate([
        Event()
    ], Spreadsheet.prototype, "beforeCellRender", void 0);
    __decorate([
        Event()
    ], Spreadsheet.prototype, "beforeSelect", void 0);
    __decorate([
        Event()
    ], Spreadsheet.prototype, "select", void 0);
    __decorate([
        Event()
    ], Spreadsheet.prototype, "contextMenuBeforeOpen", void 0);
    __decorate([
        Event()
    ], Spreadsheet.prototype, "fileMenuBeforeOpen", void 0);
    __decorate([
        Event()
    ], Spreadsheet.prototype, "contextMenuBeforeClose", void 0);
    __decorate([
        Event()
    ], Spreadsheet.prototype, "dialogBeforeOpen", void 0);
    __decorate([
        Event()
    ], Spreadsheet.prototype, "fileMenuBeforeClose", void 0);
    __decorate([
        Event()
    ], Spreadsheet.prototype, "contextMenuItemSelect", void 0);
    __decorate([
        Event()
    ], Spreadsheet.prototype, "fileMenuItemSelect", void 0);
    __decorate([
        Event()
    ], Spreadsheet.prototype, "beforeDataBound", void 0);
    __decorate([
        Event()
    ], Spreadsheet.prototype, "dataBound", void 0);
    __decorate([
        Event()
    ], Spreadsheet.prototype, "dataSourceChanged", void 0);
    __decorate([
        Event()
    ], Spreadsheet.prototype, "cellEdit", void 0);
    __decorate([
        Event()
    ], Spreadsheet.prototype, "cellEditing", void 0);
    __decorate([
        Event()
    ], Spreadsheet.prototype, "cellSave", void 0);
    __decorate([
        Event()
    ], Spreadsheet.prototype, "beforeCellSave", void 0);
    __decorate([
        Event()
    ], Spreadsheet.prototype, "created", void 0);
    __decorate([
        Event()
    ], Spreadsheet.prototype, "beforeSort", void 0);
    __decorate([
        Event()
    ], Spreadsheet.prototype, "beforeHyperlinkCreate", void 0);
    __decorate([
        Event()
    ], Spreadsheet.prototype, "afterHyperlinkCreate", void 0);
    __decorate([
        Event()
    ], Spreadsheet.prototype, "beforeHyperlinkClick", void 0);
    __decorate([
        Event()
    ], Spreadsheet.prototype, "afterHyperlinkClick", void 0);
    __decorate([
        Event()
    ], Spreadsheet.prototype, "actionBegin", void 0);
    __decorate([
        Event()
    ], Spreadsheet.prototype, "actionComplete", void 0);
    __decorate([
        Event()
    ], Spreadsheet.prototype, "openComplete", void 0);
    __decorate([
        Event()
    ], Spreadsheet.prototype, "sortComplete", void 0);
    Spreadsheet = Spreadsheet_1 = __decorate([
        NotifyPropertyChanges
    ], Spreadsheet);
    return Spreadsheet;
}(Workbook));
export { Spreadsheet };
