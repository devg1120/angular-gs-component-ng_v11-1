import { detach, EventHandler, Browser, isNullOrUndefined } from '@syncfusion/ej2-base';
import { getRangeIndexes, getCell, setCell, getSheet, getSwapRange, inRange, isHiddenRow } from '../../workbook/index';
import { getRangeAddress, workbookEditOperation, getSheetIndexFromId, getSheetName } from '../../workbook/index';
import { getFormattedCellObject, workbookFormulaOperation, checkIsFormula, mergedRange } from '../../workbook/index';
import { pasteMerge, setMerge, getCellIndexes, getCellAddress } from '../../workbook/index';
import { ribbonClick, cut, copy, paste, initiateFilterUI, focus, setPosition } from '../common/index';
import { hasTemplate, getTextHeightWithBorder, getLines, getExcludedColumnWidth } from '../common/index';
import { enableToolbarItems, rowHeightChanged, completeAction, beginAction } from '../common/index';
import { clearCopy, selectRange, dialog, contentLoaded, tabSwitch, cMenuBeforeOpen, locale, createImageElement } from '../common/index';
import { getMaxHgt, setMaxHgt, setRowEleHeight, deleteImage, getRowIdxFromClientY, getColIdxFromClientX } from '../common/index';
import { Deferred } from '@syncfusion/ej2-data';
import { refreshRibbonIcons, isCellReference, getColumn, isLocked as isCellLocked } from '../../workbook/index';
import { getFilteredCollection, setChart, parseIntValue, isSingleCell, activeCellMergedRange, getRowsHeight } from '../../workbook/index';
/**
 * Represents clipboard support for Spreadsheet.
 */
var Clipboard = /** @class */ (function () {
    function Clipboard(parent) {
        this.externalMerge = false;
        this.parent = parent;
        this.init();
        this.addEventListener();
    }
    Clipboard.prototype.init = function () {
        this.parent.element
            .appendChild(this.parent.createElement('input', { className: 'e-clipboard', attrs: { 'contenteditable': 'true' } }));
    };
    Clipboard.prototype.addEventListener = function () {
        var ele = this.getClipboardEle();
        this.parent.on(cut, this.cut, this);
        this.parent.on(copy, this.copy, this);
        this.parent.on(paste, this.paste, this);
        this.parent.on(clearCopy, this.clearCopiedInfo, this);
        this.parent.on(tabSwitch, this.tabSwitchHandler, this);
        this.parent.on(cMenuBeforeOpen, this.cMenuBeforeOpenHandler, this);
        this.parent.on(ribbonClick, this.ribbonClickHandler, this);
        this.parent.on(contentLoaded, this.initCopyIndicator, this);
        this.parent.on(rowHeightChanged, this.rowHeightChanged, this);
        EventHandler.add(ele, 'cut', this.cut, this);
        EventHandler.add(ele, 'copy', this.copy, this);
        EventHandler.add(ele, 'paste', this.paste, this);
    };
    Clipboard.prototype.removeEventListener = function () {
        var ele = this.getClipboardEle();
        if (!this.parent.isDestroyed) {
            this.parent.off(cut, this.cut);
            this.parent.off(copy, this.copy);
            this.parent.off(paste, this.paste);
            this.parent.off(clearCopy, this.clearCopiedInfo);
            this.parent.off(tabSwitch, this.tabSwitchHandler);
            this.parent.off(cMenuBeforeOpen, this.cMenuBeforeOpenHandler);
            this.parent.off(ribbonClick, this.ribbonClickHandler);
            this.parent.off(contentLoaded, this.initCopyIndicator);
            this.parent.off(rowHeightChanged, this.rowHeightChanged);
        }
        EventHandler.remove(ele, 'cut', this.cut);
        EventHandler.remove(ele, 'copy', this.copy);
        EventHandler.remove(ele, 'paste', this.paste);
    };
    Clipboard.prototype.ribbonClickHandler = function (args) {
        var parentId = this.parent.element.id;
        switch (args.item.id) {
            case parentId + '_cut':
                this.cut({ isAction: true });
                break;
            case parentId + '_copy':
                this.copy({ isAction: true });
                break;
        }
        focus(this.parent.element);
    };
    Clipboard.prototype.tabSwitchHandler = function (args) {
        if (args.activeTab === 0 && !this.copiedInfo && !this.copiedShapeInfo) {
            this.hidePaste();
        }
    };
    Clipboard.prototype.cMenuBeforeOpenHandler = function (e) {
        var sheet = this.parent.getActiveSheet();
        var l10n = this.parent.serviceLocator.getService(locale);
        var delRowItems = [];
        var hideRowItems = [];
        var delColItems = [];
        var hideColItems = [];
        var actCell = sheet.activeCell;
        var actCellIndex = getCellIndexes(actCell);
        var cellObj = getCell(actCellIndex[0], actCellIndex[1], sheet);
        var isLocked = sheet.isProtected && isCellLocked(cellObj, getColumn(sheet, actCellIndex[1]));
        if (e.target === 'Content' || e.target === 'RowHeader' || e.target === 'ColumnHeader') {
            this.parent.enableContextMenuItems([l10n.getConstant('Paste'), l10n.getConstant('PasteSpecial')], (this.copiedInfo ||
                this.copiedShapeInfo && !isLocked) ? true : false);
            this.parent.enableContextMenuItems([l10n.getConstant('Cut')], (!isLocked) ? true : false);
        }
        if ((e.target === 'Content') && isLocked) {
            this.parent.enableContextMenuItems([l10n.getConstant('Cut'), l10n.getConstant('Filter'), l10n.getConstant('Sort')], false);
        }
        if ((e.target === 'Content') && (isLocked && !sheet.protectSettings.insertLink)) {
            this.parent.enableContextMenuItems([l10n.getConstant('Hyperlink')], false);
        }
        if (e.target === 'ColumnHeader' && sheet.isProtected) {
            delColItems = [l10n.getConstant('DeleteColumn'), l10n.getConstant('DeleteColumns'),
                l10n.getConstant('InsertColumn'), l10n.getConstant('InsertColumns')];
            hideColItems = [l10n.getConstant('HideColumn'), l10n.getConstant('HideColumns'),
                l10n.getConstant('UnHideColumns')];
            this.parent.enableContextMenuItems(delColItems, false);
            this.parent.enableContextMenuItems(hideColItems, (sheet.protectSettings.formatColumns) ? true : false);
        }
        if (e.target === 'RowHeader' && sheet.isProtected) {
            delRowItems = [l10n.getConstant('DeleteRow'), l10n.getConstant('DeleteRows'),
                l10n.getConstant('InsertRow'), l10n.getConstant('InsertRows')];
            hideRowItems = [l10n.getConstant('HideRow'), l10n.getConstant('HideRows'), l10n.getConstant('UnHideRows')];
            this.parent.enableContextMenuItems(delRowItems, false);
            this.parent.enableContextMenuItems(hideRowItems, (sheet.protectSettings.formatRows) ? true : false);
        }
    };
    Clipboard.prototype.rowHeightChanged = function (args) {
        if (this.copiedInfo && this.copiedInfo.range[0] > args.rowIdx) {
            var ele = this.parent.element.getElementsByClassName('e-copy-indicator')[0];
            if (ele) {
                ele.style.top = parseInt(ele.style.top, 10) + args.threshold + "px";
            }
        }
    };
    Clipboard.prototype.cut = function (args) {
        this.setCopiedInfo(args, true);
    };
    Clipboard.prototype.copy = function (args) {
        this.copiedSheet = this.parent.getActiveSheet();
        this.setCopiedInfo(args, false);
    };
    Clipboard.prototype.paste = function (args) {
        if (this.parent.isEdit || this.parent.element.getElementsByClassName('e-dialog').length > 0) {
            return;
        }
        var rfshRange;
        args.isAction = true;
        var isExternal = ((args && args.clipboardData) || window['clipboardData']);
        var copiedIdx = this.getCopiedIdx();
        var isCut;
        var copyInfo = Object.assign({}, this.copiedInfo);
        if (isExternal || this.copiedShapeInfo || (args.isInternal && this.copiedInfo)) {
            var cSIdx = (args && args.sIdx > -1) ? args.sIdx : this.parent.activeSheetIndex;
            var curSheet = getSheet(this.parent, cSIdx);
            var selIdx = getSwapRange(args && args.range || getRangeIndexes(curSheet.selectedRange));
            var rows = isExternal && this.getExternalCells(args);
            if (!args.isInternal && rows && rows.internal) {
                isExternal = false;
                if (!this.copiedInfo) {
                    return;
                }
            }
            if (isExternal && !rows.length) { // If image pasted
                return;
            }
            var cellLength = 0;
            if (rows) {
                for (var i = 0; i < rows.length; i++) {
                    cellLength = rows[i].cells.length > cellLength ? rows[i].cells.length : cellLength;
                }
            }
            var rowIdx = selIdx[0];
            var cIdx = isExternal
                ? [0, 0, rows.length - 1, cellLength - 1] : getSwapRange(this.copiedShapeInfo ?
                getRangeIndexes(curSheet.selectedRange) : this.copiedInfo.range);
            var isRepeative = (selIdx[2] - selIdx[0] + 1) % (cIdx[2] - cIdx[0] + 1) === 0
                && (selIdx[3] - selIdx[1] + 1) % (cIdx[3] - cIdx[1] + 1) === 0;
            rfshRange = isRepeative ? selIdx : [selIdx[0], selIdx[1]]
                .concat([selIdx[0] + cIdx[2] - cIdx[0], selIdx[1] + cIdx[3] - cIdx[1] || selIdx[1]]);
            var beginEventArgs = {
                requestType: 'paste',
                copiedInfo: this.copiedInfo,
                copiedRange: getRangeAddress(cIdx),
                pastedRange: getRangeAddress(rfshRange),
                type: (args && args.type) || 'All',
                cancel: false
            };
            if (args.isAction && !this.copiedShapeInfo && this.copiedInfo) {
                this.parent.notify(beginAction, { eventArgs: beginEventArgs, action: 'clipboard' });
            }
            if (beginEventArgs.cancel) {
                return;
            }
            var cell = void 0;
            var isExtend = void 0;
            var prevCell = void 0;
            var mergeCollection = [];
            var prevSheet = getSheet(this.parent, isExternal ? cSIdx : copiedIdx);
            var notRemoveMerge = isSingleCell(cIdx) && this.isRangeMerged(selIdx, curSheet);
            selIdx = getRangeIndexes(beginEventArgs.pastedRange);
            rowIdx = selIdx[0];
            cIdx = isExternal
                ? [0, 0, rows.length - 1, cellLength - 1] : getSwapRange(this.copiedShapeInfo ?
                getRangeIndexes(curSheet.selectedRange) : this.copiedInfo.range);
            isRepeative = (selIdx[2] - selIdx[0] + 1) % (cIdx[2] - cIdx[0] + 1) === 0 && (selIdx[3] - selIdx[1] + 1) %
                (cIdx[3] - cIdx[1] + 1) === 0 && !notRemoveMerge;
            var mergeArgs = {
                range: cIdx, prevSheet: prevSheet, cancel: false
            };
            rfshRange = isRepeative ? selIdx : [selIdx[0], selIdx[1]]
                .concat([selIdx[0] + cIdx[2] - cIdx[0], selIdx[1] + cIdx[3] - cIdx[1] || selIdx[1]]);
            if (this.copiedShapeInfo && !this.copiedInfo) {
                var pictureElem = this.copiedShapeInfo.pictureElem;
                if (pictureElem.classList.contains('e-datavisualization-chart')) {
                    this.copiedShapeInfo.chartInfo.top = null;
                    this.copiedShapeInfo.chartInfo.left = null;
                    this.parent.notify(setChart, {
                        chart: [this.copiedShapeInfo.chartInfo], isInitCell: true, isUndoRedo: true, isPaste: true,
                        dataSheetIdx: this.copiedShapeInfo.sheetIdx, isCut: this.copiedShapeInfo.isCut,
                        range: args.range || curSheet.selectedRange, isIdAvailabe: false
                    });
                }
                else {
                    this.parent.notify(createImageElement, {
                        options: {
                            src: pictureElem.style.backgroundImage.replace(/url\((['"])?(.*?)\1\)/gi, '$2'),
                            height: this.copiedShapeInfo.height, width: this.copiedShapeInfo.width,
                            imageId: this.copiedShapeInfo.isCut ? pictureElem.id : ''
                        },
                        range: getRangeAddress([rowIdx, selIdx[1], rowIdx, selIdx[1]]), isPublic: false, isUndoRedo: true
                    });
                }
                var pastedCell = getCell(rowIdx, selIdx[1], curSheet);
                if (pastedCell && !isNullOrUndefined(pastedCell.image)) {
                    var imgLen = pastedCell.image ? pastedCell.image.length - 1 : 0;
                    var eventArgs = {
                        requestType: 'imagePaste',
                        copiedShapeInfo: this.copiedShapeInfo,
                        pasteSheetIndex: this.parent.activeSheetIndex,
                        pastedRange: getSheetName(this.parent) + '!' + getRangeAddress([rowIdx, selIdx[1], rowIdx, selIdx[1]]),
                        pastedPictureElement: document.getElementById(pastedCell.image[imgLen].id)
                    };
                    this.parent.notify(completeAction, { eventArgs: eventArgs, action: 'clipboard' });
                }
            }
            else {
                this.parent.notify(pasteMerge, mergeArgs);
                if (mergeArgs.cancel) {
                    return;
                }
                var pasteType = beginEventArgs.type ? beginEventArgs.type : args.type;
                var cRows = [];
                var isInRange = this.isInRange(cIdx, selIdx, copiedIdx);
                for (var i = cIdx[0], l = 0; i <= cIdx[2]; i++, l++) {
                    if (isInRange) {
                        cRows[selIdx[0] + l] = { cells: [] };
                    }
                    if (!isHiddenRow(this.parent.getActiveSheet(), i)) {
                        for (var j = cIdx[1], k = 0; j <= cIdx[3]; j++, k++) {
                            if (isInRange) {
                                cRows[selIdx[0] + l].cells[selIdx[1] + k] = getCell(selIdx[0] + l, selIdx[1] + k, prevSheet);
                            }
                            cell = isExternal ? rows[i].cells[j] : Object.assign({}, (isInRange && cRows[i] && cRows[i].cells[j])
                                ? cRows[i].cells[j] : getCell(i, j, prevSheet));
                            this.copiedCell = [i, j];
                            if (cell && args && args.type || pasteType) {
                                switch (pasteType) {
                                    case 'Formats':
                                        cell = { format: cell.format, style: cell.style };
                                        break;
                                    case 'Values':
                                        cell = { value: cell.value };
                                        if (cell.value && cell.value.toString().indexOf('\n') > -1) {
                                            var ele = this.parent.getCell(selIdx[0], selIdx[1]);
                                            ele.classList.add('e-alt-unwrap');
                                        }
                                        break;
                                }
                                isExtend = ['Formats', 'Values'].indexOf(args.type) > -1;
                            }
                            if ((!this.parent.scrollSettings.isFinite && (cIdx[2] - cIdx[0] > (1048575 - selIdx[0])
                                || cIdx[3] - cIdx[1] > (16383 - selIdx[1])))
                                || (this.parent.scrollSettings.isFinite && (cIdx[2] - cIdx[0] > (curSheet.rowCount - 1 - selIdx[0])
                                    || cIdx[3] - cIdx[1] > (curSheet.colCount - 1 - selIdx[1])))) {
                                this.showDialog();
                                return;
                            }
                            if (isRepeative) {
                                for (var x = selIdx[0]; x <= selIdx[2]; x += (cIdx[2] - cIdx[0]) + 1) {
                                    for (var y = selIdx[1]; y <= selIdx[3]; y += (cIdx[3] - cIdx[1] + 1)) {
                                        prevCell = getCell(x + l, y + k, curSheet) || {};
                                        if (!this.externalMerge && prevCell.colSpan !== undefined || prevCell.rowSpan !== undefined) {
                                            mergeArgs = { range: [x + l, y + k, x + l, y + k] };
                                            var merge = { range: mergeArgs.range, merge: false, isAction: false, type: 'All' };
                                            mergeCollection.push(merge);
                                            if (this.parent.activeSheetIndex === curSheet.index) {
                                                this.parent.notify(setMerge, merge);
                                            }
                                        }
                                        var colInd = y + k;
                                        if (this.externalMerge && this.externalMergeRow === x + l) {
                                            colInd = colInd + 1;
                                        }
                                        else {
                                            this.externalMerge = false;
                                        }
                                        if (!isExtend) {
                                            var newFormula = this.isFormula([x + l, colInd]);
                                            if (!isNullOrUndefined(newFormula)) {
                                                cell.formula = newFormula;
                                            }
                                        }
                                        var toSkip = false;
                                        if (this.parent.filteredRows && this.parent.filteredRows.rowIdxColl &&
                                            this.parent.filteredRows.sheetIdxColl) {
                                            for (var i_1 = 0, len = this.parent.filteredRows.sheetIdxColl.length; i_1 < len; i_1++) {
                                                if (this.parent.filteredRows.sheetIdxColl[i_1] === this.parent.activeSheetIndex &&
                                                    this.parent.filteredRows.rowIdxColl[i_1] === x + l) {
                                                    toSkip = true;
                                                    break;
                                                }
                                            }
                                        }
                                        if (!toSkip) {
                                            this.setCell(x + l, colInd, curSheet, cell, isExtend, false, y === selIdx[3], isExternal);
                                        }
                                        var sId = this.parent.activeSheetIndex;
                                        var cellElem = this.parent.getCell(x + l, colInd);
                                        var address = getCellAddress(x + l, colInd);
                                        var cellArgs = {
                                            address: this.parent.sheets[sId].name + '!' + address,
                                            requestType: 'paste',
                                            value: getCell(x + l, colInd, curSheet) ? getCell(x + l, colInd, curSheet).value : '',
                                            oldValue: prevCell.value,
                                            element: cellElem,
                                            displayText: this.parent.getDisplayText(cell)
                                        };
                                        this.parent.trigger('cellSave', cellArgs);
                                    }
                                }
                            }
                            else {
                                if (isExternal || !hasTemplate(this.parent, i, j, copiedIdx)) {
                                    if (notRemoveMerge) {
                                        this.setCell(rowIdx, selIdx[1] + k, curSheet, { value: cell.value }, true, false, j === cIdx[3]);
                                    }
                                    else {
                                        this.setCell(rowIdx, selIdx[1] + k, curSheet, cell, isExtend, false, j === cIdx[3]);
                                    }
                                }
                            }
                            if (!isExternal && this.copiedInfo.isCut && !(inRange(selIdx, i, j) && copiedIdx ===
                                this.parent.activeSheetIndex)) {
                                this.setCell(i, j, prevSheet, null, false, true, j === cIdx[3]);
                            }
                        }
                        rowIdx++;
                    }
                    else {
                        selIdx[2] = selIdx[2] - 1;
                        l = l - 1;
                    }
                }
                this.parent.notify(refreshRibbonIcons, null);
                this.parent.setUsedRange(rfshRange[2] + 1, rfshRange[3]);
                if (cSIdx === this.parent.activeSheetIndex) {
                    this.parent.serviceLocator.getService('cell').refreshRange(rfshRange);
                    this.parent.notify(selectRange, { address: getRangeAddress(rfshRange) });
                }
                if (!isExternal && this.copiedInfo.isCut) {
                    isCut = this.copiedInfo.isCut;
                    if (copiedIdx === this.parent.activeSheetIndex) {
                        this.parent.serviceLocator.getService('cell').refreshRange(cIdx);
                    }
                    this.clearCopiedInfo();
                    this.cutInfo = isCut;
                }
                if ((isExternal || isInRange) && this.copiedInfo) {
                    this.clearCopiedInfo();
                }
                if (isExternal || (args && args.isAction)) {
                    focus(this.parent.element);
                }
                if (args.isAction) {
                    var sheetIndex = copyInfo && copyInfo.sId ? getSheetIndexFromId(this.parent, copyInfo.sId) :
                        this.parent.activeSheetIndex;
                    var eventArgs = {
                        requestType: 'paste',
                        copiedInfo: copyInfo,
                        mergeCollection: mergeCollection,
                        pasteSheetIndex: this.parent.activeSheetIndex,
                        copiedRange: this.parent.sheets[sheetIndex].name + '!' + getRangeAddress(copyInfo && copyInfo.range ?
                            copyInfo.range : getRangeIndexes(this.parent.sheets[sheetIndex].selectedRange)),
                        pastedRange: getSheetName(this.parent) + '!' + getRangeAddress(rfshRange),
                        type: pasteType || 'All'
                    };
                    if (!isExternal) {
                        this.parent.notify(completeAction, { eventArgs: eventArgs, action: 'clipboard' });
                    }
                }
                if (isCut) {
                    this.updateFilter(copyInfo, rfshRange);
                    setMaxHgt(prevSheet, cIdx[0], cIdx[1], this.parent.getCell(cIdx[0], cIdx[1]).offsetHeight);
                    var hgt = getMaxHgt(prevSheet, cIdx[0]);
                    setRowEleHeight(this.parent, prevSheet, hgt, cIdx[0]);
                }
                var copySheet = getSheet(this.parent, copiedIdx);
                if (!isExternal && cIdx[0] === cIdx[2] && (cIdx[3] - cIdx[1]) === copySheet.colCount - 1) {
                    var hgt = copySheet.rows[cIdx[0]].height;
                    for (var i = selIdx[0]; i <= selIdx[2]; i++) {
                        setRowEleHeight(this.parent, this.parent.getActiveSheet(), hgt, i);
                    }
                    if (isCut) {
                        setRowEleHeight(this.parent, copySheet, 20, cIdx[0]);
                    }
                }
            }
        }
        else {
            this.getClipboardEle().select();
        }
    };
    Clipboard.prototype.isRangeMerged = function (range, sheet) {
        var cell = getCell(range[0], range[1], sheet);
        if (cell && (cell.colSpan > 1 || cell.rowSpan > 1)) {
            var args = { range: range.slice(2, 4).concat(range.slice(2, 4)) };
            this.parent.notify(activeCellMergedRange, args);
            return args.range[0] === range[0] && args.range[1] === range[1] && args.range[2] === range[2] && args.range[3] === range[3];
        }
        return false;
    };
    Clipboard.prototype.updateFilter = function (copyInfo, pastedRange) {
        var isFilterCut;
        var diff;
        this.parent.notify(getFilteredCollection, null);
        for (var i = 0; i < this.parent.sheets.length; i++) {
            if (this.parent.filterCollection && this.parent.filterCollection[i] &&
                this.parent.filterCollection[i].sheetIndex === getSheetIndexFromId(this.parent, copyInfo.sId)) {
                var range = copyInfo.range;
                var fRange = getRangeIndexes(this.parent.filterCollection[i].filterRange);
                range = getSwapRange(range);
                if (fRange[0] === range[0] && fRange[2] === range[2] && fRange[1] === range[1] && fRange[3] === range[3]) {
                    isFilterCut = true;
                    diff = [Math.abs(range[0] - fRange[0]), Math.abs(range[1] - fRange[1]),
                        Math.abs(range[2] - fRange[2]), Math.abs(range[3] - fRange[3])];
                }
            }
        }
        var cell = this.parent.getCell(copyInfo.range[0], copyInfo.range[1]);
        cell = cell ? (cell.querySelector('.e-filter-icon') ? cell : this.parent.getCell(copyInfo.range[2], copyInfo.range[3])) : cell;
        var asc = cell ? cell.querySelector('.e-sortasc-filter') : cell;
        var desc = cell ? cell.querySelector('.e-sortdesc-filter') : cell;
        if (isFilterCut) {
            for (var n = 0; n < this.parent.filterCollection.length; n++) {
                var filterCol = this.parent.filterCollection[n];
                var sheetIndex = copyInfo && copyInfo.sId ? getSheetIndexFromId(this.parent, copyInfo.sId) :
                    this.parent.activeSheetIndex;
                if (filterCol.sheetIndex === sheetIndex) {
                    this.parent.notify(initiateFilterUI, { predicates: null, range: filterCol.filterRange, sIdx: sheetIndex, isCut: true });
                }
                if (filterCol.sheetIndex === sheetIndex && sheetIndex === this.parent.activeSheetIndex) {
                    diff = [pastedRange[0] + diff[0], pastedRange[1] + diff[1],
                        Math.abs(pastedRange[2] - diff[2]), Math.abs(pastedRange[3] - diff[3])];
                    this.parent.notify(initiateFilterUI, { predicates: null, range: getRangeAddress(diff), sIdx: null, isCut: true });
                    if (copyInfo.range[3] === copyInfo.range[1]) { // To update sorted icon after pasting.
                        var filteredCell = this.parent.getCell(pastedRange[0], pastedRange[1]);
                        if (asc && filteredCell) {
                            filteredCell.querySelector('.e-filter-icon').classList.add('e-sortasc-filter');
                        }
                        if (desc && filteredCell) {
                            filteredCell.querySelector('.e-filter-icon').classList.add('e-sortdesc-filter');
                        }
                    }
                }
            }
        }
    };
    Clipboard.prototype.isInRange = function (cRng, pRng, sIdx) {
        var activeSheetIndex = this.parent.activeSheetIndex;
        return (inRange(cRng, pRng[0], pRng[1]) && sIdx === activeSheetIndex) ||
            (inRange(cRng, pRng[2], pRng[3]) && sIdx === activeSheetIndex);
    };
    Clipboard.prototype.isFormula = function (selIdx) {
        var cIdxValue;
        var cell;
        var sheet;
        if (!isNullOrUndefined(this.copiedCell)) {
            sheet = !isNullOrUndefined(this.copiedSheet) ? this.copiedSheet : this.parent.getActiveSheet();
            cell = getCell(this.copiedCell[0], this.copiedCell[1], sheet);
            if (!isNullOrUndefined(cell)) {
                cIdxValue = cell.formula ? cell.formula.toUpperCase() : '';
            }
        }
        if (cIdxValue !== '' && !isNullOrUndefined(cIdxValue)) {
            if (cIdxValue.indexOf('=') === 0) {
                cIdxValue = cIdxValue.slice(1);
            }
            var start = cIdxValue.indexOf('(');
            var end = cIdxValue.indexOf(')');
            if (start > -1 && end > -1) {
                cIdxValue = cIdxValue.slice(start + 1, end);
            }
            var difIndex = [];
            var formulaOperators = ['+', '-', '*', '/'];
            var splitArray = void 0;
            var value = cIdxValue;
            for (var i = 0; i < formulaOperators.length; i++) {
                splitArray = value.split(formulaOperators[i]);
                value = splitArray.join(',');
            }
            splitArray = value.split(',');
            var isRange = void 0;
            if (splitArray.length === 1 && splitArray.indexOf(':')) {
                splitArray = value.split(':');
                isRange = true;
            }
            for (var j = 0; j < splitArray.length; j++) {
                if (isCellReference(splitArray[j])) {
                    var range = getCellIndexes(splitArray[j]);
                    var diff = [this.copiedCell[0] - range[0], this.copiedCell[1] - range[1]];
                    difIndex.push(diff[0]);
                    difIndex.push(diff[1]);
                }
            }
            var newAddress = [];
            for (var j = 0; j < difIndex.length; j++) {
                var address = getCellAddress(selIdx[0] - difIndex[0 + j], selIdx[1] - difIndex[1 + j]);
                newAddress.push(address);
                j++;
            }
            var inValidRef = void 0;
            for (var a = 0; a < newAddress.length; a++) {
                if (isCellReference(newAddress[a])) {
                    var range = getRangeIndexes(newAddress[a]);
                    if (range[0] < 0 || range[1] < 0) {
                        inValidRef = true;
                    }
                }
                else {
                    inValidRef = true;
                }
                if (inValidRef) {
                    if (isRange) {
                        newAddress = ['#REF!'];
                        splitArray = [splitArray.join(':')];
                        break;
                    }
                    else {
                        newAddress[a] = '#REF!';
                    }
                }
            }
            cIdxValue = cell.formula.toUpperCase();
            for (var i = 0; i < splitArray.length; i++) {
                for (var j = 0; j < newAddress.length; j++) {
                    cIdxValue = cIdxValue.replace(splitArray[i].toUpperCase(), newAddress[j].toUpperCase());
                    i++;
                }
            }
            return cIdxValue;
        }
        else {
            return null;
        }
    };
    Clipboard.prototype.setCell = function (rIdx, cIdx, sheet, cell, isExtend, isCut, lastCell, isExternal) {
        var sheetIndex = sheet ? getSheetIndexFromId(this.parent, sheet.id) : null;
        setCell(rIdx, cIdx, sheet, isCut ? null : cell, isExtend);
        if (cell && cell.formula) {
            this.parent.notify(workbookFormulaOperation, {
                action: 'refreshCalculate', value: isCut ? '' : cell.formula, rowIndex: rIdx,
                colIndex: cIdx, sheetIndex: this.parent.activeSheetIndex, isFormula: true
            });
        }
        if (cell && !cell.formula) {
            this.parent.notify(workbookEditOperation, {
                action: 'updateCellValue', address: [rIdx, cIdx, rIdx,
                    cIdx], value: cell.value, sheetIndex: sheetIndex
            });
        }
        if (sheet.name === this.parent.getActiveSheet().name) {
            this.parent.serviceLocator.getService('cell').refresh(rIdx, cIdx, lastCell);
        }
        if (cell && cell.style && isExternal) {
            var hgt = getTextHeightWithBorder(this.parent, rIdx, cIdx, sheet, cell.style || this.parent.cellStyle, cell.wrap ?
                getLines(this.parent.getDisplayText(cell), getExcludedColumnWidth(sheet, rIdx, cIdx), cell.style, this.parent.cellStyle) : 1);
            hgt = Math.round(hgt);
            if (hgt < 20) {
                hgt = 20; // default height
            }
            setMaxHgt(sheet, rIdx, cIdx, hgt);
            var prevHeight = getRowsHeight(sheet, rIdx);
            var maxHgt = getMaxHgt(sheet, rIdx);
            var heightChanged = maxHgt > prevHeight;
            if (heightChanged) {
                setRowEleHeight(this.parent, sheet, maxHgt, rIdx);
            }
        }
    };
    Clipboard.prototype.getCopiedIdx = function () {
        if (this.copiedInfo) {
            for (var i = 0; i < this.parent.sheets.length; i++) {
                if (this.parent.sheets[i].id === this.copiedInfo.sId) {
                    return i;
                }
            }
            this.clearCopiedInfo();
        }
        return -1;
    };
    Clipboard.prototype.setCopiedInfo = function (args, isCut) {
        var _this = this;
        if (this.parent.isEdit) {
            return;
        }
        var deferred = new Deferred();
        args.promise = deferred.promise;
        var sheet = this.parent.getActiveSheet();
        var range;
        if (args && args.range) {
            var mergeArgs = { range: args.range };
            this.parent.notify(mergedRange, mergeArgs);
            range = mergeArgs.range;
        }
        else {
            range = getRangeIndexes(sheet.selectedRange);
        }
        var option = {
            sheet: sheet, indexes: [0, 0, sheet.rowCount - 1, sheet.colCount - 1], promise: 
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            new Promise(function (resolve, reject) { resolve((function () { })()); })
        };
        var pictureElements = document.getElementsByClassName('e-ss-overlay-active');
        var pictureLen = pictureElements.length;
        if (sheet.isLocalData && !(args && args.clipboardData) && range[0] === 0 && range[2] === (sheet.rowCount - 1)) {
            this.parent.showSpinner();
            this.parent.notify('updateSheetFromDataSource', option);
        }
        option.promise.then(function () {
            if (pictureLen > 0) {
                var imgRowIdx = {
                    clientY: pictureElements[0].offsetTop,
                    isImage: true
                };
                _this.parent.notify(getRowIdxFromClientY, imgRowIdx);
                var imgColIdx = {
                    clientX: pictureElements[0].offsetLeft,
                    isImage: true
                };
                _this.parent.notify(getColIdxFromClientX, imgColIdx);
                _this.copiedShapeInfo = {
                    sId: (args && args.sId) ? args.sId : sheet.id, sheetIdx: sheet.index, isCut: isCut, pictureElem: pictureElements[0], copiedRange: getRangeAddress([imgRowIdx.clientY, imgColIdx.clientX,
                        imgRowIdx.clientY, imgColIdx.clientX]), height: pictureElements[0].offsetHeight,
                    width: pictureElements[0].offsetWidth,
                    chartInfo: _this.getChartElemInfo(pictureElements[0])
                };
                _this.hidePaste(true);
                if (isCut) {
                    if (pictureElements[0].classList.contains('e-datavisualization-chart')) {
                        _this.parent.deleteChart(_this.copiedShapeInfo.chartInfo.id);
                    }
                    else {
                        _this.parent.notify(deleteImage, {
                            id: _this.copiedShapeInfo.pictureElem.id, sheetIdx: _this.copiedShapeInfo.sId,
                            range: _this.copiedShapeInfo.copiedRange
                        });
                    }
                }
            }
            else if (!(args && args.clipboardData)) {
                if (_this.copiedInfo) {
                    _this.clearCopiedInfo();
                }
                _this.copiedInfo = {
                    range: range, sId: (args && args.sId) ? args.sId : sheet.id, isCut: isCut
                };
                _this.hidePaste(true);
                _this.initCopyIndicator();
                if (!Browser.isIE) {
                    _this.getClipboardEle().select();
                }
                if (args && args.isAction) {
                    document.execCommand(isCut ? 'cut' : 'copy');
                }
                _this.parent.hideSpinner();
            }
            if (Browser.isIE) {
                _this.setExternalCells(args);
            }
            deferred.resolve();
        });
        if (args && args.clipboardData) {
            this.setExternalCells(args);
            focus(this.parent.element);
        }
    };
    Clipboard.prototype.getChartElemInfo = function (overlayEle) {
        var chartColl = this.parent.chartColl;
        if (overlayEle.classList.contains('e-datavisualization-chart')) {
            var chartId = overlayEle.getElementsByClassName('e-control')[0].id;
            for (var idx = 0; idx < chartColl.length; idx++) {
                if (chartColl[idx].id === chartId) {
                    var chart = chartColl[idx];
                    return chart;
                }
            }
        }
        return null;
    };
    Clipboard.prototype.clearCopiedInfo = function () {
        if (this.copiedInfo) {
            if (this.parent.getActiveSheet().id === this.copiedInfo.sId) {
                this.removeIndicator(this.parent.getSelectAllContent());
                this.removeIndicator(this.parent.getColumnHeaderContent());
                this.removeIndicator(this.parent.getRowHeaderContent());
                this.removeIndicator(this.parent.getMainContent());
            }
            this.copiedInfo = null;
            this.hidePaste();
        }
        if (this.copiedShapeInfo) {
            this.copiedShapeInfo = null;
            this.hidePaste();
        }
    };
    Clipboard.prototype.removeIndicator = function (ele) {
        if (ele) {
            var indicator = ele.querySelector('.e-copy-indicator');
            if (indicator) {
                detach(indicator);
            }
        }
    };
    Clipboard.prototype.initCopyIndicator = function () {
        if (this.copiedInfo && this.parent.getActiveSheet().id === this.copiedInfo.sId) {
            var copyIndicator = this.parent.createElement('div', { className: 'e-copy-indicator' });
            copyIndicator.appendChild(this.parent.createElement('div', { className: 'e-top' }));
            copyIndicator.appendChild(this.parent.createElement('div', { className: 'e-bottom' }));
            copyIndicator.appendChild(this.parent.createElement('div', { className: 'e-left' }));
            copyIndicator.appendChild(this.parent.createElement('div', { className: 'e-right' }));
            setPosition(this.parent, copyIndicator, this.copiedInfo.range, 'e-copy-indicator');
        }
    };
    Clipboard.prototype.showDialog = function () {
        var _this = this;
        this.parent.serviceLocator.getService(dialog).show({
            header: 'Spreadsheet',
            target: this.parent.element,
            height: 205, width: 340, isModal: true, showCloseIcon: true,
            content: this.parent.serviceLocator.getService(locale).getConstant('PasteAlert'),
            beforeOpen: function (args) {
                var dlgArgs = {
                    dialogName: 'PasteDialog',
                    element: args.element, target: args.target, cancel: args.cancel
                };
                _this.parent.trigger('dialogBeforeOpen', dlgArgs);
                if (dlgArgs.cancel) {
                    args.cancel = true;
                }
            }
        });
    };
    Clipboard.prototype.hidePaste = function (isShow) {
        if (this.parent.getActiveSheet().isProtected) {
            isShow = false;
        }
        this.parent.notify(enableToolbarItems, [{ items: [this.parent.element.id + '_paste'], enable: isShow || false }]);
    };
    Clipboard.prototype.setExternalCells = function (args) {
        var cell;
        var text = '';
        var range = this.copiedInfo.range;
        var sheet = this.parent.getActiveSheet();
        var data = '<html><body><table class="e-spreadsheet" xmlns="http://www.w3.org/1999/xhtml"><tbody>';
        for (var i = range[0]; i <= range[2]; i++) {
            data += '<tr>';
            for (var j = range[1]; j <= range[3]; j++) {
                cell = getCell(i, j, sheet);
                data += '<td style="white-space:' + ((cell && cell.wrap) ? 'normal' : 'nowrap') + ';vertical-align:bottom;';
                if (cell && cell.style) {
                    Object.keys(cell.style).forEach(function (style) {
                        var regex = style.match(/[A-Z]/);
                        data += (style === 'backgroundColor' ? 'background' : (regex ? style.replace(regex[0], '-'
                            + regex[0].toLowerCase()) : style)) + ':' + ((style === 'backgroundColor' || style === 'color')
                            ? cell.style[style].slice(0, 7) : cell.style[style]) + ';';
                    });
                }
                data += '">';
                if (cell && cell.value) {
                    var eventArgs = {
                        formattedText: cell.value,
                        value: cell.value,
                        format: cell.format,
                        onLoad: true
                    };
                    if (cell.format) {
                        this.parent.notify(getFormattedCellObject, eventArgs);
                    }
                    data += eventArgs.formattedText;
                    text += eventArgs.formattedText;
                }
                data += '</td>';
                text += j === range[3] ? '' : '\t';
            }
            data += '</tr>';
            text += i === range[2] ? '' : '\n';
        }
        data += '</tbody></table></body></html>';
        if (Browser.isIE) {
            window['clipboardData'].setData('text', text);
        }
        else {
            args.clipboardData.setData('text/html', data);
            args.clipboardData.setData('text/plain', text);
            args.preventDefault();
        }
    };
    Clipboard.prototype.getExternalCells = function (args) {
        var _this = this;
        var html;
        var text;
        var rows = [];
        var cells = [];
        var cellStyle;
        var ele = this.parent.createElement('span');
        if (Browser.isIE) {
            text = window['clipboardData'].getData('text');
        }
        else {
            html = args.clipboardData.getData('text/html');
            text = args.clipboardData.getData('text/plain');
            ele.innerHTML = html;
        }
        if (ele.querySelector('table')) {
            if (ele.querySelector('.e-spreadsheet') && this.copiedInfo) {
                rows = { internal: true };
            }
            else {
                ele.querySelectorAll('tr').forEach(function (tr) {
                    tr.querySelectorAll('td').forEach(function (td, j) {
                        cellStyle = _this.getStyle(td, ele);
                        td.textContent = td.textContent.replace(/(\r\n|\n|\r)/gm, '');
                        var cSpan = isNaN(parseInt(td.getAttribute('colspan'), 10)) ? 1 : parseInt(td.getAttribute('colspan'), 10);
                        var rSpan = isNaN(parseInt(td.getAttribute('rowspan'), 10)) ? 1 : parseInt(td.getAttribute('rowspan'), 10);
                        var wrap;
                        if (cellStyle.whiteSpace) {
                            wrap = true;
                            delete cellStyle['whiteSpace'];
                        }
                        cells[j] = {
                            value: td.textContent ? parseIntValue(td.textContent.trim()) : null, style: cellStyle, colSpan: cSpan,
                            rowSpan: rSpan, wrap: wrap
                        };
                    });
                    rows.push({ cells: cells });
                    cells = [];
                });
            }
        }
        else if (text) {
            if (html) {
                [].slice.call(ele.children).forEach(function (child) {
                    if (child.getAttribute('style')) {
                        cellStyle = _this.getStyle(child, ele);
                    }
                });
            }
            text.trim().split('\n').forEach(function (row) {
                row.split('\t').forEach(function (col, j) {
                    if (col) {
                        var wrap = void 0;
                        if (cellStyle && cellStyle.whiteSpace) {
                            wrap = true;
                            delete cellStyle['whiteSpace'];
                        }
                        cells[j] = { style: cellStyle, wrap: wrap };
                        if (checkIsFormula(col)) {
                            cells[j].formula = col;
                        }
                        else {
                            cells[j].value = parseIntValue(col.trim());
                        }
                    }
                });
                rows.push({ cells: cells });
                cells = [];
            });
        }
        setTimeout(function () { _this.getClipboardEle().innerHTML = ''; }, 0);
        return rows;
    };
    Clipboard.prototype.getStyle = function (td, ele) {
        var styles = [];
        var cellStyle = {};
        var keys = Object.keys(this.parent.commonCellStyle);
        if (td.classList.length || td.getAttribute('style') || keys.length) {
            if (ele.querySelector('style') && td.classList.length) {
                if (ele.querySelector('style').innerHTML.indexOf(td.classList[0]) > -1) {
                    styles.push(ele.querySelector('style').innerHTML.split(td.classList[0])[1].split('{')[1].split('}')[0]);
                }
            }
            if (td.getAttribute('style')) {
                styles.push(td.getAttribute('style'));
                if (td.children && td.children.length) {
                    for (var i = 0, len = td.children.length; i < len; i++) {
                        if (td.children[i] && td.children[i].getAttribute('style')) {
                            styles.push(td.children[i].getAttribute('style'));
                            if (td.children[i] && td.children[i].children) {
                                for (var i_2 = 0, len_1 = td.children[i_2].children.length; i_2 < len_1; i_2++) {
                                    if ((td.children[i_2] && td.children[i_2].children[i_2]) &&
                                        td.children[i_2].children[i_2].getAttribute('style')) {
                                        styles.push(td.children[i_2].children[i_2].getAttribute('style'));
                                    }
                                }
                            }
                        }
                    }
                }
            }
            if (keys.length) {
                if (ele.querySelector('style')) {
                    var tdStyle = ele.querySelector('style').innerHTML.split('td')[1].split('{')[1].split('}')[0];
                    for (var i = 0; i < keys.length; i++) {
                        var key = keys[i];
                        var regex = key.match(/[A-Z]/);
                        if (regex) {
                            key = key.replace(regex[0], '-' + regex[0].toLowerCase());
                        }
                        if (tdStyle.indexOf(key) > -1) {
                            cellStyle[keys[i]] = tdStyle.split(key + ':')[1].split(';')[0];
                        }
                    }
                }
            }
            styles.forEach(function (styles) {
                styles.split(';').forEach(function (style) {
                    var char = style.split(':')[0].trim();
                    if (['font-family', 'vertical-align', 'text-align', 'text-indent', 'color', 'background', 'font-weight', 'font-style',
                        'font-size', 'text-decoration', 'border-bottom', 'border-top', 'border-right', 'border-left',
                        'border', 'white-space'].indexOf(char) > -1) {
                        char = char === 'background' ? 'backgroundColor' : char;
                        var regex = char.match(/-[a-z]/);
                        var value = style.split(':')[1];
                        cellStyle[regex ? char.replace(regex[0], regex[0].charAt(1).toUpperCase()) : char]
                            = (char === 'font-weight' && ['bold', 'normal'].indexOf(value) === -1)
                                ? (value > '599' ? 'bold' : 'normal') : value;
                    }
                });
            });
        }
        if (td.innerHTML.indexOf('<s>') > -1) {
            cellStyle.textDecoration = 'line-through';
        }
        return this.defaultCellStyle(cellStyle);
    };
    Clipboard.prototype.defaultCellStyle = function (style) {
        var textDecoration = ['underline', 'line-through', 'underline line-through', 'none'];
        var textAlign = ['left', 'center', 'right'];
        var verticalAlign = ['bottom', 'middle', 'top'];
        var fontSize = style.fontSize ? style.fontSize.trim() : null;
        if (style.textDecoration && textDecoration.indexOf(style.textDecoration.trim()) < 0) {
            style.textDecoration = 'none';
        }
        if (style.textAlign && textAlign.indexOf(style.textAlign.trim()) < 0) {
            style.textAlign = 'left';
        }
        if (style.verticalAlign && verticalAlign.indexOf(style.verticalAlign.trim()) < 0) {
            style.verticalAlign = 'bottom';
        }
        if (fontSize) {
            fontSize = (fontSize.indexOf('px') > -1) ? (parseFloat(fontSize) * 0.75) + 'pt' : fontSize;
            style.fontSize = Math.round(parseFloat(fontSize)) + 'pt';
        }
        return style;
    };
    Clipboard.prototype.getClipboardEle = function () {
        return this.parent.element.getElementsByClassName('e-clipboard')[0];
    };
    Clipboard.prototype.getModuleName = function () {
        return 'clipboard';
    };
    Clipboard.prototype.destroy = function () {
        this.removeEventListener();
        var ele = this.getClipboardEle();
        detach(ele);
        this.parent = null;
    };
    return Clipboard;
}());
export { Clipboard };
