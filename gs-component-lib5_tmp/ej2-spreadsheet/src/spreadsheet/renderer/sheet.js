import { formatUnit, detach, attributes, isNullOrUndefined, Browser } from '@syncfusion/ej2-base';
import { getCellIndexes, getRangeIndexes } from './../../workbook/common/address';
import { getColumnsWidth, getColumnWidth } from '../../workbook/base/column';
import { contentLoaded, editOperation, getUpdateUsingRaf, removeAllChildren } from '../common/index';
import { beforeContentLoaded, getColGroupWidth, virtualContentLoaded, setAriaOptions, dataBound } from '../common/index';
import { created, spreadsheetDestroyed, skipHiddenIdx, isReact, getDPRValue } from '../common/index';
import { checkMerge, forRefSelRender, initiateEdit, chartRangeSelection, renderReactTemplates, rowHeightChanged } from '../common/index';
import { colWidthChanged, clearUndoRedoCollection } from '../common/index';
import { getCell, getRowsHeight } from '../../workbook/index';
/**
 * Sheet module is used to render Sheet
 *
 * @hidden
 */
var SheetRender = /** @class */ (function () {
    function SheetRender(parent) {
        this.colGroupWidth = 30; //Row header and selectall table colgroup width
        this.parent = parent;
        this.col = parent.createElement('col');
        this.rowRenderer = parent.serviceLocator.getService('row');
        this.cellRenderer = parent.serviceLocator.getService('cell');
        this.addEventListener();
    }
    SheetRender.prototype.refreshSelectALLContent = function () {
        var cell;
        var sheet = this.parent.getActiveSheet();
        if (sheet.frozenColumns || sheet.frozenRows) {
            var tHead = this.getSelectAllTable().querySelector('thead');
            var row = this.rowRenderer.render();
            tHead.appendChild(row);
            cell = this.parent.createElement('th', { className: 'e-select-all-cell' });
            row.appendChild(cell);
        }
        else {
            cell = this.headerPanel.firstElementChild;
            cell.classList.add('e-select-all-cell');
        }
        cell.appendChild(this.parent.createElement('button', { className: 'e-selectall e-icons',
            id: this.parent.element.id + "_select_all" }));
    };
    SheetRender.prototype.updateLeftColGroup = function (width, rowHdr) {
        if (width) {
            this.colGroupWidth = width;
        }
        if (!rowHdr) {
            rowHdr = this.getRowHeaderPanel();
        }
        var table = rowHdr.querySelector('table');
        var sheet = this.parent.getActiveSheet();
        var colGrp;
        if (width) {
            table.querySelector('colgroup').firstElementChild.style.width = this.colGroupWidth + "px";
        }
        else {
            colGrp = this.parent.createElement('colgroup');
            var col = this.col.cloneNode();
            col.style.width = this.colGroupWidth + "px";
            colGrp.appendChild(col);
            table.insertBefore(colGrp, table.querySelector('tbody'));
        }
        if (sheet.frozenRows || sheet.frozenColumns) {
            table = this.getSelectAllTable();
            if (width) {
                table.querySelector('colgroup').firstElementChild.style.width = this.colGroupWidth + "px";
            }
            else {
                table.insertBefore(colGrp.cloneNode(true), table.querySelector('thead'));
            }
        }
        this.setPanelWidth(sheet, rowHdr);
        this.setPanelHeight(sheet);
    };
    SheetRender.prototype.setPanelWidth = function (sheet, rowHdr) {
        var scrollSize = this.getScrollSize();
        var width = this.getRowHeaderWidth(sheet);
        var offset = this.parent.enableRtl ? 'right' : 'left';
        if (sheet.frozenColumns) {
            var frozenCol = document.getElementById(this.parent.element.id + '_sheet').getElementsByClassName('e-frozen-column')[0];
            frozenCol.style.height = "calc(100% - " + scrollSize + "px)";
            frozenCol.style[offset] = width - getDPRValue(1) + 'Px';
            frozenCol.style.display = '';
        }
        this.setHeaderPanelWidth(this.getSelectAllContent(), width);
        this.getColHeaderPanel().style.width = "calc(100% - " + width + "px)";
        this.getColHeaderPanel().style[offset] = width + 'px';
        this.setHeaderPanelWidth(rowHdr, width);
        this.getContentPanel().style.width = "calc(100% - " + width + "px)";
        this.getContentPanel().style[offset] = width + 'px';
        var scroll = (this.contentPanel.nextElementSibling ? this.contentPanel.nextElementSibling : null);
        if (scroll) {
            scroll.style.height = scrollSize + 1 + 'px';
            if (!scrollSize) {
                scroll.style.borderTopWidth = '0px';
            }
            scroll = scroll.firstElementChild;
            scroll.style[offset] = width + 'px';
            scroll.style.width = "calc(100% - " + width + "px)";
        }
    };
    SheetRender.prototype.getScrollSize = function () {
        var prop = this.parent.enableRtl ? 'margin-left' : 'margin-right';
        return parseInt(this.headerPanel.style[prop], 10) ? parseInt(this.headerPanel.style[prop], 10) : 0;
    };
    SheetRender.prototype.setHeaderPanelWidth = function (content, width) {
        var emptyCol = [].slice.call(content.querySelectorAll('col.e-empty'));
        emptyCol.forEach(function (col) {
            width += parseInt(col.style.width, 10);
        });
        content.style.width = width + 'px';
    };
    SheetRender.prototype.setPanelHeight = function (sheet) {
        var scrollSize = this.getScrollSize();
        if (sheet.frozenRows) {
            var topIndex = getCellIndexes(sheet.topLeftCell)[0];
            var frozenHeight = (sheet.showHeaders ? getDPRValue(31) : 0) +
                getRowsHeight(sheet, topIndex, topIndex + sheet.frozenRows - 1, true);
            if (!sheet.showHeaders && !sheet.frozenColumns) {
                this.headerPanel.style.height = frozenHeight + 'px';
            }
            else {
                this.headerPanel.style.height = '';
            }
            this.contentPanel.style.height = "calc(100% - " + (frozenHeight + scrollSize) + "px)";
            var frozenRow = document.getElementById(this.parent.element.id + '_sheet').getElementsByClassName('e-frozen-row')[0];
            frozenRow.style.width = Browser.isDevice ? '100%' :
                "calc(100% - " + scrollSize + "px)";
            frozenRow.style.top = frozenHeight - 1 - (sheet.showHeaders ? 1 : 0) + 'px';
            frozenRow.style.display = '';
        }
        else {
            this.contentPanel.style.height = "calc(100% - " + ((sheet.showHeaders ? 31 : 0) + scrollSize) + "px)";
        }
    };
    SheetRender.prototype.renderPanel = function () {
        this.contentPanel = this.parent.createElement('div', { className: 'e-main-panel' });
        var sheet = this.parent.getActiveSheet();
        var id = this.parent.element.id;
        this.contentPanel.appendChild(this.parent.createElement('div', { className: 'e-row-header', id: id + "_row_header" }));
        this.initHeaderPanel();
        if (this.parent.allowScrolling) {
            this.parent.scrollModule.setPadding();
        }
        var sheetEle = document.getElementById(this.parent.element.id + '_sheet');
        if (sheet.frozenColumns) {
            sheetEle.classList.add('e-frozen-columns');
        }
        if (sheet.frozenRows) {
            sheetEle.classList.add('e-frozen-rows');
        }
        this.updateHideHeaders(sheet, sheetEle);
        if (!sheet.showGridLines) {
            sheetEle.classList.add('e-hide-gridlines');
        }
        var content = this.contentPanel.appendChild(this.parent.createElement('div', { className: 'e-sheet-content', id: id + "_main_content" }));
        if (!this.parent.allowScrolling) {
            content.style.overflow = 'hidden';
        }
        if (sheet.frozenRows) {
            sheetEle.appendChild(this.parent.createElement('div', { className: 'e-frozen-row', styles: 'display: none' }));
        }
        if (sheet.frozenColumns) {
            sheetEle.appendChild(this.parent.createElement('div', { className: 'e-frozen-column', styles: 'display: none' }));
        }
    };
    SheetRender.prototype.initHeaderPanel = function () {
        var id = this.parent.element.id;
        this.headerPanel = this.parent.createElement('div', { className: 'e-header-panel' });
        this.headerPanel.appendChild(this.parent.createElement('div', { className: 'e-selectall-container', id: id + "_selectall" }));
        this.headerPanel.appendChild(this.parent.createElement('div', { className: 'e-column-header', id: id + "_col_header" }));
    };
    SheetRender.prototype.createHeaderTable = function () {
        var rowHdrEle = this.contentPanel.querySelector('.e-row-header');
        var sheet = this.parent.getActiveSheet();
        if (sheet.frozenRows || sheet.frozenColumns) {
            this.updateTable(sheet.frozenRows ? ['thead', 'tbody'] : ['thead'], 'selectall', this.headerPanel.querySelector('.e-selectall-container'));
        }
        this.updateTable(sheet.frozenRows ? ['thead', 'tbody'] : ['thead'], 'colhdr', this.headerPanel.querySelector('.e-column-header'));
        this.updateTable(['tbody'], 'rowhdr', rowHdrEle);
        this.updateLeftColGroup(null, rowHdrEle);
    };
    SheetRender.prototype.updateTable = function (tagName, name, appendTo) {
        var _this = this;
        var table = this.parent.createElement('table', { className: 'e-table', attrs: { 'role': 'grid' } });
        table.classList.add("e-" + name + "-table");
        appendTo.appendChild(table);
        tagName.forEach(function (tag) { table.appendChild(_this.parent.createElement(tag)); });
    };
    /**
     * It is used to refresh the select all, row header, column header and content of the spreadsheet.
     *
     * @param {SheetRenderArgs} args - Specifies the cells, indexes, direction, skipUpdateOnFirst, top, left, initload properties.
     * @returns {void}
     */
    SheetRender.prototype.renderTable = function (args) {
        var _this = this;
        var indexes;
        var row;
        var hRow;
        var sheet = this.parent.getActiveSheet();
        var frag = document.createDocumentFragment();
        frag.appendChild(this.headerPanel);
        frag.appendChild(this.contentPanel);
        if (this.parent.allowScrolling) {
            var scrollPanel = this.parent.createElement('div', { className: 'e-scrollbar' });
            scrollPanel.appendChild(this.parent.createElement('div', { className: 'e-scroller' }));
            frag.appendChild(scrollPanel);
        }
        this.createHeaderTable();
        this.updateTable(['tbody'], 'content', this.contentPanel.lastElementChild);
        var colGrp = this.parent.createElement('colgroup');
        var col;
        var cTBody = this.contentPanel.querySelector('.e-sheet-content tbody');
        this.refreshSelectALLContent();
        var selectAllColGrp = this.getSelectAllContent().querySelector('colgroup');
        var rowHdrColGrp = this.getRowHeaderPanel().querySelector('colgroup');
        var selectAllHdrRow = this.getSelectAllContent().querySelector('thead .e-header-row');
        var rHdrTBody = this.contentPanel.querySelector('.e-row-header tbody');
        var selectAllTBody = this.getSelectAllContent().querySelector('tbody');
        var cHdrTHead = this.headerPanel.querySelector('.e-column-header thead');
        var cHdrTBody = this.headerPanel.querySelector('.e-column-header tbody');
        var cHdrRow = this.rowRenderer.render();
        cHdrTHead.appendChild(cHdrRow);
        this.getColHeaderTable().insertBefore(colGrp, cHdrTHead);
        var frozenRow = this.parent.frozenRowCount(sheet);
        var frozenCol = this.parent.frozenColCount(sheet);
        this.parent.notify(beforeContentLoaded, { top: args.top, left: args.left });
        var colCount = sheet.colCount.toString();
        var rowCount = sheet.colCount.toString();
        var layout = args.top && args.left ? 'RowColumn' : (args.top ? 'Row' : (args.left ? 'Column' : ''));
        this.parent.getColHeaderTable().setAttribute('aria-colcount', colCount);
        this.parent.getRowHeaderTable().setAttribute('aria-rowcount', rowCount);
        var emptyRow;
        attributes(this.parent.getContentTable(), { 'aria-rowcount': rowCount, 'aria-colcount': colCount });
        args.cells.forEach(function (value, key) {
            indexes = getRangeIndexes(key);
            if (indexes[1] === args.indexes[1] || !row) {
                hRow = _this.rowRenderer.render(indexes[0], true);
                if (frozenCol && frozenRow && indexes[1] < frozenCol && indexes[0] < frozenRow) {
                    emptyRow = selectAllTBody.querySelector('.e-empty');
                    if (emptyRow) {
                        selectAllTBody.insertBefore(hRow, emptyRow);
                    }
                    else {
                        selectAllTBody.appendChild(hRow);
                    }
                    row = hRow;
                }
                else if (frozenCol && indexes[1] < frozenCol) {
                    rHdrTBody.appendChild(hRow);
                    row = hRow;
                }
                else {
                    row = _this.rowRenderer.render(indexes[0]);
                    if (frozenRow && indexes[0] < frozenRow) {
                        emptyRow = cHdrTBody.querySelector('.e-empty');
                        if (emptyRow) {
                            cHdrTBody.insertBefore(row, emptyRow);
                        }
                        else {
                            cHdrTBody.appendChild(row);
                        }
                    }
                    else {
                        cTBody.appendChild(row);
                    }
                    if (indexes[1] === args.indexes[1]) {
                        if (frozenRow && indexes[0] < frozenRow) {
                            selectAllTBody.appendChild(hRow);
                        }
                        else {
                            rHdrTBody.appendChild(hRow);
                        }
                    }
                }
                if (indexes[1] === args.indexes[1]) {
                    hRow.appendChild(_this.cellRenderer.renderRowHeader(indexes[0]));
                }
            }
            row.appendChild(_this.cellRenderer.render({ colIdx: indexes[1], rowIdx: indexes[0], cell: value,
                address: key, lastCell: indexes[1] === args.indexes[3], isHeightCheckNeeded: true, row: row, hRow: hRow,
                pRow: row.previousSibling, pHRow: hRow.previousSibling, isRefreshing: args.isRefreshing,
                first: layout ? (layout.includes('Row') ? (indexes[0] === args.indexes[0] ? 'Row' : (layout.includes('Column') ? (indexes[1] === args.indexes[1] ? 'Column' : '') : '')) : (indexes[1] === args.indexes[1] ? 'Column' : '')) : '' }));
            if (frozenCol && indexes[1] === frozenCol - 1) {
                row = null;
            }
            if (indexes[0] === args.indexes[0]) {
                if (frozenCol && indexes[1] < frozenCol) {
                    col = _this.updateCol(sheet, indexes[1], selectAllColGrp);
                    var empty = rowHdrColGrp.querySelector('.e-empty');
                    empty ? rowHdrColGrp.insertBefore(col, empty) : rowHdrColGrp.appendChild(col);
                    rowHdrColGrp.appendChild(col.cloneNode(true));
                    selectAllHdrRow.appendChild(_this.cellRenderer.renderColHeader(indexes[1]));
                }
                else {
                    _this.updateCol(sheet, indexes[1], colGrp);
                    cHdrRow.appendChild(_this.cellRenderer.renderColHeader(indexes[1]));
                }
            }
        });
        if (this.parent[isReact]) {
            this.parent[renderReactTemplates]();
        }
        cTBody.parentElement.insertBefore(colGrp.cloneNode(true), cTBody);
        getUpdateUsingRaf(function () {
            var content = _this.parent.getMainContent();
            var sheetContent = document.getElementById(_this.parent.element.id + '_sheet');
            sheetContent.appendChild(frag);
            sheetContent.style.backgroundColor = '';
            if (args.top) {
                content.parentElement.scrollTop = args.top;
            }
            if (args.left) {
                content.scrollLeft = args.left;
                _this.parent.getColumnHeaderContent().scrollLeft = args.left;
                if (_this.parent.allowScrolling) {
                    _this.parent.getScrollElement().scrollLeft = args.left;
                }
            }
            _this.parent.notify(contentLoaded, args);
            _this.checkTableWidth(sheet);
            _this.parent.notify(editOperation, { action: 'renderEditor' });
            if (!args.initLoad && !_this.parent.isOpen) {
                _this.parent.hideSpinner();
            }
            setAriaOptions(content, { busy: false });
            _this.parent.trigger(dataBound, {});
            if (_this.parent.isEdit) {
                _this.parent.notify(initiateEdit, null);
            }
            if (args.initLoad) {
                var triggerEvent = true;
                if (_this.parent.scrollSettings.enableVirtualization) {
                    for (var i = 0; i < sheet.ranges.length; i++) {
                        if (sheet.ranges[i].info.count - 1 > _this.parent.viewport.bottomIndex) {
                            triggerEvent = false;
                            break;
                        }
                    }
                }
                if (triggerEvent) {
                    _this.triggerCreatedEvent();
                }
            }
        });
    };
    SheetRender.prototype.triggerCreatedEvent = function () {
        if (!this.parent.isOpen) {
            this.parent.hideSpinner();
        }
        if (this.parent.createdHandler) {
            if (this.parent.createdHandler.observers) {
                this.parent[created].observers = this.parent.createdHandler.observers;
            }
            else {
                this.parent.setProperties({ created: this.parent.createdHandler }, true);
            }
            this.parent.createdHandler = undefined;
            this.parent.trigger(created, null);
            this.parent.notify(clearUndoRedoCollection, null);
        }
    };
    SheetRender.prototype.checkTableWidth = function (sheet) {
        if (this.parent.scrollSettings.isFinite && !this.parent.scrollSettings.enableVirtualization && sheet.colCount - 1 ===
            this.parent.viewport.rightIndex) {
            var cellsWidth = getColumnsWidth(sheet, this.parent.viewport.leftIndex + this.parent.frozenColCount(sheet), this.parent.viewport.rightIndex);
            var rowHdrWidth = this.getRowHeaderWidth(sheet);
            var scrollSize = this.getScrollSize();
            if (cellsWidth < this.contentPanel.getBoundingClientRect().width - rowHdrWidth - scrollSize) {
                this.getContentPanel().style.width = cellsWidth + 'px';
                this.getColHeaderPanel().style.width = cellsWidth + 'px';
            }
            else if (!this.getContentPanel().style.width.includes('calc')) {
                this.getContentPanel().style.width = "calc(100% - " + rowHdrWidth + "px)";
                this.getColHeaderPanel().style.width = "calc(100% - " + rowHdrWidth + "px)";
            }
        }
    };
    SheetRender.prototype.refreshColumnContent = function (args) {
        var _this = this;
        var indexes;
        var row;
        var table;
        var count = 0;
        var cell;
        var col;
        var sheet = this.parent.getActiveSheet();
        var frag = document.createDocumentFragment();
        var hFrag = document.createDocumentFragment();
        var tBody = this.parent.element.querySelector('.e-sheet-content tbody');
        var hTBody = this.parent.element.querySelector('.e-column-header tbody');
        var colGrp = this.parent.element.querySelector('.e-sheet-content colgroup');
        colGrp = colGrp.cloneNode();
        frag.appendChild(colGrp);
        tBody = frag.appendChild(tBody.cloneNode(true));
        var hColGrp = colGrp.cloneNode();
        hFrag.appendChild(hColGrp);
        var tHead;
        tHead = this.parent.element.querySelector('.e-column-header thead');
        tHead = hFrag.appendChild(tHead.cloneNode(true));
        var hRow = tHead.querySelector('tr');
        hRow.innerHTML = '';
        var frozenRow = this.parent.frozenRowCount(sheet);
        var frozenCol = this.parent.frozenColCount(sheet);
        if (frozenRow) {
            hTBody = hFrag.appendChild(hTBody.cloneNode(true));
        }
        args.cells.forEach(function (value, key) {
            indexes = getRangeIndexes(key);
            if (indexes[0] === args.indexes[0]) {
                col = _this.updateCol(sheet, indexes[1], hColGrp);
                colGrp.appendChild(col.cloneNode());
                hRow.appendChild(_this.cellRenderer.renderColHeader(indexes[1]));
            }
            if (indexes[1] - frozenCol === args.indexes[1]) {
                if (indexes[0] < frozenRow) {
                    row = hTBody.children[count];
                }
                else {
                    row = tBody.children[count];
                }
                if (row) {
                    row.innerHTML = '';
                    count++;
                }
                else {
                    return;
                }
            }
            cell = row.appendChild(_this.cellRenderer.render({
                colIdx: indexes[1], rowIdx: indexes[0], cell: value, address: key, row: row, pRow: row.previousSibling,
                first: !args.skipUpdateOnFirst && indexes[1] === args.indexes[1] ? 'Column' : (_this.parent.scrollSettings.
                    enableVirtualization && indexes[0] === args.indexes[0] && _this.parent.viewport.topIndex !==
                    skipHiddenIdx(sheet, 0, true) ? 'Row' : '')
            }));
            _this.checkColMerge(indexes, args.indexes, cell, value);
            if (frozenRow && indexes[0] === frozenRow - 1) {
                count = 0;
            }
        });
        getUpdateUsingRaf(function () {
            table = _this.getColHeaderTable();
            removeAllChildren(table);
            table.appendChild(hFrag);
            table = _this.getContentTable();
            removeAllChildren(table);
            table.appendChild(frag);
            _this.parent.notify(virtualContentLoaded, { refresh: 'Column', prevRowColCnt: args.prevRowColCnt });
            if (_this.parent.isEdit) {
                _this.parent.notify(forRefSelRender, {});
            }
            if (_this.parent.allowChart) {
                _this.parent.notify(chartRangeSelection, null);
            }
            if (!_this.parent.isOpen) {
                _this.parent.hideSpinner();
            }
            setAriaOptions(_this.parent.getMainContent(), { busy: false });
        });
    };
    SheetRender.prototype.refreshRowContent = function (args) {
        var _this = this;
        var indexes;
        var row;
        var hdrRow;
        var colGroupWidth = this.colGroupWidth;
        var sheet = this.parent.getActiveSheet();
        var cell;
        var frag = document.createDocumentFragment();
        var tBody = this.parent.createElement('tbody');
        var hFrag = document.createDocumentFragment();
        var hTBody = tBody.cloneNode();
        hFrag.appendChild(hTBody);
        frag.appendChild(tBody);
        var frozenCol = this.parent.frozenColCount(sheet);
        args.cells.forEach(function (value, key) {
            indexes = getRangeIndexes(key);
            if (indexes[1] === args.indexes[1] || !row) {
                hdrRow = _this.rowRenderer.render(indexes[0], true);
                if (frozenCol && indexes[1] < frozenCol) {
                    hTBody.appendChild(hdrRow);
                    row = hdrRow;
                }
                else {
                    if (indexes[1] === args.indexes[1]) {
                        hTBody.appendChild(hdrRow);
                    }
                    row = _this.rowRenderer.render(indexes[0]);
                    tBody.appendChild(row);
                }
                if (indexes[1] === args.indexes[1]) {
                    hdrRow.appendChild(_this.cellRenderer.renderRowHeader(indexes[0]));
                    colGroupWidth = getColGroupWidth(indexes[0] + 1);
                }
            }
            cell = row.appendChild(_this.cellRenderer.render({
                rowIdx: indexes[0], colIdx: indexes[1], cell: value, address: key, lastCell: indexes[1] === args.indexes[3], row: row, hRow: hdrRow, pRow: row.previousSibling,
                pHRow: hdrRow.previousSibling,
                isHeightCheckNeeded: true, first: !args.skipUpdateOnFirst && indexes[0] === args.indexes[0] ?
                    'Row' : (_this.parent.scrollSettings.enableVirtualization && indexes[1] === args.indexes[1] && _this.parent.viewport.leftIndex
                    !== skipHiddenIdx(sheet, 0, true, 'columns') ? 'Column' : '')
            }));
            _this.checkRowMerge(indexes, args.indexes, cell, value);
            if (frozenCol && indexes[1] === frozenCol - 1) {
                row = null;
            }
        });
        if (this.colGroupWidth !== colGroupWidth) {
            this.updateLeftColGroup(colGroupWidth);
        }
        if (this.contentPanel.querySelector('.e-row-header tbody')) {
            detach(this.contentPanel.querySelector('.e-row-header tbody'));
            this.getRowHeaderTable().appendChild(hFrag);
        }
        if (this.contentPanel.querySelector('.e-sheet-content tbody')) {
            detach(this.contentPanel.querySelector('.e-sheet-content tbody'));
            this.getContentTable().appendChild(frag);
        }
        this.parent.notify(virtualContentLoaded, { refresh: 'Row', prevRowColCnt: args.prevRowColCnt });
        if (this.parent.allowChart) {
            this.parent.notify(chartRangeSelection, {});
        }
        if (this.parent.isEdit) {
            this.parent.notify(forRefSelRender, null);
        }
        if (!this.parent.isOpen) {
            this.parent.hideSpinner();
        }
        setAriaOptions(this.parent.getMainContent(), { busy: false });
    };
    SheetRender.prototype.updateCol = function (sheet, idx, appendTo) {
        var col = this.col.cloneNode();
        col.style.width = formatUnit(getColumnWidth(sheet, idx, null, true));
        if (appendTo) {
            var empty = appendTo.querySelector('.e-empty');
            return empty ? appendTo.insertBefore(col, empty) : appendTo.appendChild(col);
        }
        else {
            return col;
        }
    };
    SheetRender.prototype.updateColContent = function (args) {
        var _this = this;
        getUpdateUsingRaf(function () {
            var indexes;
            var row;
            var refChild;
            var cell;
            var rowCount = 0;
            var col;
            var sheet = _this.parent.getActiveSheet();
            var hRow = _this.parent.element.querySelector('.e-column-header .e-header-row');
            var hRefChild = hRow.firstElementChild;
            var colGrp = _this.parent.element.querySelector('.e-sheet-content colgroup');
            var hColGrp = _this.parent.element.querySelector('.e-column-header colgroup');
            var colRefChild = colGrp.firstElementChild;
            var skipRender;
            var hColRefChild = hColGrp.firstElementChild;
            var tBody = _this.parent.element.querySelector('.e-sheet-content tbody');
            var hTBody = _this.parent.element.querySelector('.e-column-header tbody');
            var frozenRow = _this.parent.frozenRowCount(sheet);
            var frozenCol = _this.parent.frozenColCount(sheet);
            args.cells.forEach(function (value, key) {
                if (skipRender) {
                    return;
                }
                indexes = getRangeIndexes(key);
                if (args.direction === 'first' && indexes[1] === args.indexes[1]) {
                    _this.checkColMerge([indexes[0], _this.parent.viewport.leftIndex + frozenCol], args.indexes, ((indexes[0] < frozenRow ? hTBody : tBody).rows[rowCount] ||
                        { cells: [] }).cells[(args.indexes[3] - args.indexes[1]) + 1], getCell(indexes[0], _this.parent.viewport.leftIndex + frozenCol, sheet) || {});
                }
                if (indexes[0] === args.indexes[0]) {
                    if (args.direction === 'last') {
                        col = _this.col.cloneNode();
                        col.style.width = formatUnit(getColumnWidth(sheet, indexes[1], null, true));
                        colGrp.insertBefore(col, colRefChild);
                        hColGrp.insertBefore(col.cloneNode(), hColRefChild);
                        hRow.insertBefore(_this.cellRenderer.renderColHeader(indexes[1]), hRefChild);
                    }
                    else {
                        col = _this.updateCol(sheet, indexes[1], colGrp);
                        hColGrp.appendChild(col.cloneNode());
                        hRow.appendChild(_this.cellRenderer.renderColHeader(indexes[1]));
                    }
                    if (_this.parent.scrollSettings.enableVirtualization && args.direction) {
                        /* eslint-disable */
                        detach(colGrp[args.direction + 'ElementChild']);
                        detach(hColGrp[args.direction + 'ElementChild']);
                        detach(hRow[args.direction + 'ElementChild']);
                        /* eslint-enable */
                    }
                }
                if (indexes[1] === args.indexes[1]) {
                    if (indexes[0] < frozenRow) {
                        row = hTBody.children[rowCount];
                    }
                    else {
                        row = tBody.children[rowCount];
                        if (!row) {
                            skipRender = true;
                            return;
                        }
                    }
                    rowCount++;
                    refChild = row.firstElementChild;
                }
                cell = _this.cellRenderer.render({ colIdx: indexes[1], rowIdx: indexes[0], cell: value, address: key,
                    lastCell: indexes[1] === args.indexes[3], isHeightCheckNeeded: args.direction === 'first',
                    first: args.direction === 'last' && !args.skipUpdateOnFirst && indexes[1] === args.indexes[1] ? 'Column' : '',
                    checkNextBorder: args.direction === 'last' && indexes[3] === args.indexes[3] ? 'Column' : '' });
                if (args.direction === 'last') {
                    _this.checkColMerge(indexes, args.indexes, cell, value, ((indexes[0] < frozenRow ? hTBody : tBody).rows[rowCount - 1] ||
                        { cells: [] }).cells[0]);
                    row.insertBefore(cell, refChild);
                }
                else {
                    row.appendChild(cell);
                }
                if (_this.parent.scrollSettings.enableVirtualization && args.direction) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    detach(row[args.direction + 'ElementChild']);
                }
                if (frozenRow && indexes[0] === frozenRow - 1) {
                    rowCount = 0;
                }
            });
            _this.parent.notify(virtualContentLoaded, { refresh: 'Column', prevRowColCnt: args.prevRowColCnt });
            if (_this.parent.allowChart) {
                _this.parent.notify(chartRangeSelection, null);
            }
            if (_this.parent.isEdit) {
                _this.parent.notify(forRefSelRender, {});
            }
            if (!_this.parent.isOpen) {
                _this.parent.hideSpinner();
            }
            setAriaOptions(_this.parent.getMainContent(), { busy: false });
        });
    };
    SheetRender.prototype.updateRowContent = function (args) {
        var _this = this;
        var colGroupWidth = this.colGroupWidth;
        var row;
        var hRow;
        var cell;
        var sheet = this.parent.getActiveSheet();
        var count = 0;
        var tBody = this.parent.getMainContent().querySelector('tbody');
        var rTBody = this.parent.getRowHeaderContent().querySelector('tbody');
        var rFrag = document.createDocumentFragment();
        var indexes;
        var frag = document.createDocumentFragment();
        this.parent.showSpinner();
        var frozenCol = this.parent.frozenColCount(sheet);
        var frozenRow = this.parent.frozenRowCount(sheet);
        var firstRow;
        args.cells.forEach(function (value, cKey) {
            indexes = getRangeIndexes(cKey);
            if (args.direction === 'first' && indexes[0] === args.indexes[0]) {
                if (firstRow === undefined) {
                    firstRow = (indexes[1] < frozenCol ? rTBody : tBody).rows[(args.indexes[2] - args.indexes[0]) + 1] || null;
                }
                _this.checkRowMerge([_this.parent.viewport.topIndex + frozenRow, indexes[1]], args.indexes, (firstRow || { cells: [] }).cells[indexes[1] < frozenCol ? count + 1 : count], getCell(_this.parent.viewport.topIndex + frozenRow, indexes[1], sheet) || {});
            }
            if (indexes[1] === args.indexes[1] || !row) {
                hRow = _this.rowRenderer.render(indexes[0], true);
                if (frozenCol && indexes[1] < frozenCol) {
                    rFrag.appendChild(hRow);
                    row = hRow;
                }
                else {
                    row = _this.rowRenderer.render(indexes[0]);
                    frag.appendChild(row);
                    if (indexes[1] === args.indexes[1]) {
                        rFrag.appendChild(hRow);
                    }
                    if (_this.parent.scrollSettings.enableVirtualization && args.direction) {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        detach(tBody[args.direction + 'ElementChild']);
                    }
                }
                if (indexes[1] === args.indexes[1]) {
                    hRow.appendChild(_this.cellRenderer.renderRowHeader(indexes[0]));
                    colGroupWidth = getColGroupWidth(indexes[0] + 1);
                    if (_this.parent.scrollSettings.enableVirtualization && args.direction) {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        detach(rTBody[args.direction + 'ElementChild']);
                    }
                }
            }
            cell = row.appendChild(_this.cellRenderer.render({ colIdx: indexes[1], rowIdx: indexes[2], cell: value, address: cKey, lastCell: indexes[1] === args.indexes[3], row: row, pHRow: hRow.previousSibling,
                checkNextBorder: args.direction === 'last' && indexes[2] === args.indexes[2] ? 'Row' : '', pRow: row.previousSibling,
                isHeightCheckNeeded: args.direction === 'first' || args.direction === '', hRow: hRow, first: args.direction === 'last' &&
                    !args.skipUpdateOnFirst && indexes[0] === args.indexes[0] ? 'Row' : '' }));
            if (args.direction === 'last' && tBody.rows.length) {
                _this.checkRowMerge(indexes, args.indexes, cell, value, (indexes[1] < frozenCol ? rTBody : tBody).rows[0].cells[indexes[1] < frozenCol ?
                    count + 1 : count]);
            }
            count++;
            if (frozenCol && indexes[1] === frozenCol - 1) {
                row = null;
                firstRow = undefined;
                count = 0;
            }
        });
        if (this.colGroupWidth !== colGroupWidth) {
            this.updateLeftColGroup(colGroupWidth);
        }
        if (args.direction === 'last') {
            rTBody.insertBefore(rFrag, rTBody.firstElementChild);
            tBody.insertBefore(frag, tBody.firstElementChild);
        }
        else {
            rTBody.appendChild(rFrag);
            tBody.appendChild(frag);
        }
        if (this.parent.scrollSettings.enableVirtualization) {
            this.parent.notify(virtualContentLoaded, { refresh: 'Row', prevRowColCnt: args.prevRowColCnt });
        }
        if (this.parent.isEdit) {
            this.parent.notify(forRefSelRender, null);
        }
        if (this.parent.allowChart) {
            this.parent.notify(chartRangeSelection, {});
        }
        if (!this.parent.isOpen) {
            this.parent.hideSpinner();
        }
        setAriaOptions(this.parent.getMainContent(), { busy: false });
    };
    SheetRender.prototype.checkRowMerge = function (indexes, range, cell, model, firstcell) {
        if (this.parent.scrollSettings.enableVirtualization && cell &&
            (!isNullOrUndefined(model.rowSpan) || !isNullOrUndefined(model.colSpan))) {
            var frozenRow = this.parent.frozenRowCount(this.parent.getActiveSheet());
            if (indexes[0] === this.parent.viewport.topIndex + frozenRow) {
                if (model.rowSpan < 0) {
                    var args = { td: cell, rowIdx: indexes[0], colIdx: indexes[1], isRow: true,
                        isFreezePane: true };
                    this.parent.notify(checkMerge, args);
                    if (args.insideFreezePane) {
                        return;
                    }
                    if (this.parent.viewport.topIndex + frozenRow >= range[0]) {
                        this.refreshPrevMerge(range[0] + 1, indexes[1]);
                    }
                }
                if (firstcell && (firstcell.colSpan > 1 || firstcell.rowSpan > 1)) {
                    this.cellRenderer.refresh(indexes[0] + (range[2] - range[0]) + 1, indexes[1], null, firstcell);
                }
            }
            else if (model.rowSpan > 1) {
                var prevTopIdx = range[2] + 1;
                if (indexes[0] + model.rowSpan - 1 > prevTopIdx && indexes[0] < prevTopIdx) {
                    this.refreshPrevMerge(prevTopIdx, indexes[1], this.parent.viewport.topIndex + frozenRow);
                }
            }
        }
    };
    SheetRender.prototype.refreshPrevMerge = function (prevTopIdx, colIndex, currTopIdx) {
        var td = this.parent.getCell(prevTopIdx, colIndex, this.parent.getRow(currTopIdx ?
            currTopIdx : 0, null, colIndex));
        if (td && td.rowSpan > 1) {
            this.cellRenderer.refresh(prevTopIdx, colIndex, null, td);
        }
    };
    SheetRender.prototype.checkColMerge = function (indexes, range, cell, model, firstcell) {
        if (this.parent.scrollSettings.enableVirtualization && cell && indexes[1] === this.parent.viewport.leftIndex +
            this.parent.frozenColCount(this.parent.getActiveSheet()) && (!isNullOrUndefined(model.rowSpan) ||
            !isNullOrUndefined(model.colSpan))) {
            if (model.colSpan < 0) {
                var e = { td: cell, colIdx: indexes[1], rowIdx: indexes[0], isFreezePane: true };
                this.parent.notify(checkMerge, e);
                if (e.insideFreezePane) {
                    return;
                }
            }
            if (firstcell && (firstcell.colSpan > 1 || firstcell.rowSpan > 1)) {
                this.cellRenderer.refresh(indexes[0], indexes[1] + (range[3] - range[1]) + 1, null, firstcell);
            }
        }
    };
    /**
     * Used to toggle row and column headers.
     *
     * @returns {void}
     */
    SheetRender.prototype.showHideHeaders = function () {
        var _this = this;
        var sheet = this.parent.getActiveSheet();
        getUpdateUsingRaf(function () {
            if (sheet.showHeaders) {
                var content = _this.getContentPanel();
                _this.setPanelWidth(sheet, _this.getRowHeaderPanel());
                _this.setPanelHeight(sheet);
                document.getElementById(_this.parent.element.id + '_sheet').classList.remove('e-hide-headers');
                _this.getColHeaderPanel().scrollLeft = content.scrollLeft;
                _this.parent.selectRange(sheet.selectedRange);
            }
            else {
                _this.updateHideHeaders(sheet, document.getElementById(_this.parent.element.id + '_sheet'));
                _this.setPanelHeight(sheet);
                if (_this.parent.frozenColCount(sheet) || _this.parent.frozenRowCount(sheet)) {
                    _this.setPanelWidth(sheet, _this.getRowHeaderPanel());
                    _this.parent.selectRange(sheet.selectedRange);
                }
                else {
                    _this.getContentPanel().style.width = '';
                    var offset = _this.parent.enableRtl ? 'right' : 'left';
                    _this.getContentPanel().style[offset] = '';
                }
            }
        });
    };
    SheetRender.prototype.updateHideHeaders = function (sheet, ele) {
        if (!sheet.showHeaders) {
            ele.classList.add('e-hide-headers');
        }
    };
    SheetRender.prototype.rowHeightChange = function (args) {
        if (args.threshold) {
            var sheet = this.parent.getActiveSheet();
            if (args.rowIdx < this.parent.frozenRowCount(sheet)) {
                this.setPanelHeight(sheet);
            }
        }
    };
    SheetRender.prototype.colWidthChange = function (args) {
        if (args.threshold) {
            var sheet = this.parent.getActiveSheet();
            if (args.colIdx < this.parent.frozenColCount(sheet)) {
                this.setPanelWidth(sheet, this.getRowHeaderPanel());
            }
            this.checkTableWidth(sheet);
        }
    };
    SheetRender.prototype.getRowHeaderWidth = function (sheet, skipFreezeCheck) {
        var width = 0;
        if (!skipFreezeCheck && sheet.frozenColumns) {
            var leftIdx = getCellIndexes(sheet.topLeftCell)[1];
            width = getColumnsWidth(sheet, leftIdx, leftIdx + sheet.frozenColumns - 1, true);
        }
        width += sheet.showHeaders ? getDPRValue(this.colGroupWidth) : 0;
        return width;
    };
    SheetRender.prototype.getColHeaderHeight = function (sheet, skipHeader) {
        var topIndex = getCellIndexes(sheet.topLeftCell)[0];
        return (sheet.showHeaders && !skipHeader ? 31 : 0) + getRowsHeight(sheet, topIndex, topIndex + sheet.frozenRows - 1, true);
    };
    /**
     * Get the select all table element of spreadsheet
     *
     * @returns {HTMLElement} - Select all content element.
     */
    SheetRender.prototype.getSelectAllContent = function () {
        return this.headerPanel.getElementsByClassName('e-selectall-container')[0];
    };
    /**
     * Get the horizontal scroll element of spreadsheet
     *
     * @returns {HTMLElement} - Select all content element.
     */
    SheetRender.prototype.getScrollElement = function () {
        return (this.contentPanel.parentElement || this.contentPanel.nextElementSibling).querySelector('.e-scroller');
    };
    /**
     * Get the select all table element of spreadsheet
     *
     * @returns {HTMLTableElement} - Select all table element.
     */
    SheetRender.prototype.getSelectAllTable = function () {
        return this.headerPanel.getElementsByClassName('e-selectall-table')[0];
    };
    /**
     * Get the column header element of spreadsheet
     *
     * @returns {HTMLTableElement} - Column header table element.
     */
    SheetRender.prototype.getColHeaderTable = function () {
        return this.headerPanel.getElementsByClassName('e-colhdr-table')[0];
    };
    /**
     * Get the row header table element of spreadsheet
     *
     * @returns {HTMLTableElement} - Row header table element.
     */
    SheetRender.prototype.getRowHeaderTable = function () {
        return this.contentPanel.getElementsByClassName('e-rowhdr-table')[0];
    };
    /**
     * Get the main content table element of spreadsheet
     *
     * @returns {Element} - Content table element.
     */
    SheetRender.prototype.getContentTable = function () {
        return this.contentPanel.getElementsByClassName('e-content-table')[0];
    };
    /**
     * Get the row header div element of spreadsheet
     *
     * @returns {HTMLElement} - Row header panel element.
     */
    SheetRender.prototype.getRowHeaderPanel = function () {
        return this.contentPanel.getElementsByClassName('e-row-header')[0];
    };
    /**
     * Get the column header div element of spreadsheet
     *
     * @returns {HTMLElement} - Column header panel element.
     */
    SheetRender.prototype.getColHeaderPanel = function () {
        return this.headerPanel.getElementsByClassName('e-column-header')[0];
    };
    /**
     * Get the main content div element of spreadsheet
     *
     * @returns {HTMLElement} - Content panel element.
     */
    SheetRender.prototype.getContentPanel = function () {
        return this.contentPanel.getElementsByClassName('e-sheet-content')[0];
    };
    SheetRender.prototype.addEventListener = function () {
        this.parent.on(created, this.triggerCreatedEvent, this);
        this.parent.on(rowHeightChanged, this.rowHeightChange, this);
        this.parent.on(colWidthChanged, this.colWidthChange, this);
        this.parent.on(spreadsheetDestroyed, this.destroy, this);
    };
    SheetRender.prototype.destroy = function () {
        this.removeEventListener();
        this.parent = null;
    };
    SheetRender.prototype.removeEventListener = function () {
        this.parent.off(created, this.triggerCreatedEvent);
        this.parent.off(rowHeightChanged, this.rowHeightChange);
        this.parent.off(colWidthChanged, this.colWidthChange);
        this.parent.off(spreadsheetDestroyed, this.destroy);
    };
    return SheetRender;
}());
export { SheetRender };
