import { locale, deleteImage, createImageElement } from '../../spreadsheet/index';
import { performUndoRedo, updateUndoRedoCollection, enableToolbarItems, completeAction } from '../common/index';
import { setActionData, getBeforeActionData, updateAction, initiateFilterUI } from '../common/index';
import { setUndoRedo } from '../common/index';
import { selectRange, clearUndoRedoCollection, setMaxHgt, getMaxHgt, setRowEleHeight } from '../common/index';
import { getRangeFromAddress, getRangeIndexes, getSheet, workbookEditOperation, getSwapRange } from '../../workbook/index';
import { getCell, setCell, getSheetIndex, wrapEvent, getSheetIndexFromId } from '../../workbook/index';
import { setMerge, getRangeAddress, triggerDataChange } from '../../workbook/index';
import { addClass, extend } from '@syncfusion/ej2-base';
import { getFilteredCollection, setCellFormat, refreshRibbonIcons } from '../../workbook/index';
/**
 * UndoRedo module allows to perform undo redo functionalities.
 */
var UndoRedo = /** @class */ (function () {
    function UndoRedo(parent) {
        this.undoCollection = [];
        this.redoCollection = [];
        this.isUndo = false;
        this.undoRedoStep = 100;
        this.parent = parent;
        this.addEventListener();
    }
    UndoRedo.prototype.setActionData = function (options) {
        var sheet = this.parent.getActiveSheet();
        var address;
        var cells = [];
        var cutCellDetails = [];
        var args = options.args;
        var eventArgs = args.eventArgs;
        var copiedInfo = {};
        switch (args.action) {
            case 'format':
                address = getRangeIndexes(args.eventArgs.range);
                break;
            case 'clipboard':
                copiedInfo = eventArgs.copiedInfo;
                address = getRangeIndexes(getRangeFromAddress(eventArgs.pastedRange));
                if (copiedInfo.isCut) {
                    cutCellDetails = this.getCellDetails(copiedInfo.range, getSheet(this.parent, getSheetIndexFromId(this.parent, copiedInfo.sId)));
                }
                break;
            case 'beforeSort':
                address = getRangeIndexes(args.eventArgs.range);
                if (address[0] === address[2] && (address[2] - address[0]) === 0) { //if selected range is a single cell
                    address[0] = 0;
                    address[1] = 0;
                    address[2] = sheet.usedRange.rowIndex;
                    address[3] = sheet.usedRange.colIndex;
                }
                break;
            case 'beforeCellSave':
            case 'cellDelete':
                address = getRangeIndexes(eventArgs.address);
                break;
            case 'beforeWrap':
                address = this.parent.getAddressInfo(eventArgs.address).indices;
                break;
            case 'beforeReplace':
                address = this.parent.getAddressInfo(eventArgs.address).indices;
                break;
            case 'beforeClear':
                address = getRangeIndexes(eventArgs.range);
                break;
            case 'beforeInsertImage':
                address = getRangeIndexes(eventArgs.range);
                break;
            case 'beforeInsertChart':
                address = getRangeIndexes(eventArgs.range);
                break;
            case 'filter':
                address = getRangeIndexes(eventArgs.range);
                break;
        }
        cells = this.getCellDetails(address, sheet);
        this.beforeActionData = { cellDetails: cells, cutCellDetails: cutCellDetails };
    };
    UndoRedo.prototype.getBeforeActionData = function (args) {
        args.beforeDetails = this.beforeActionData;
    };
    UndoRedo.prototype.performUndoRedo = function (args) {
        var undoRedoArgs = args.isUndo ? this.undoCollection.pop() : this.redoCollection.pop();
        this.isUndo = args.isUndo;
        if (undoRedoArgs) {
            switch (undoRedoArgs.action) {
                case 'cellSave':
                case 'format':
                case 'sorting':
                case 'wrap':
                case 'cellDelete':
                    undoRedoArgs = this.performOperation(undoRedoArgs);
                    break;
                case 'clipboard':
                    undoRedoArgs = this.undoForClipboard(undoRedoArgs);
                    break;
                case 'resize':
                    undoRedoArgs = this.undoForResize(undoRedoArgs);
                    break;
                case 'hideShow':
                    undoRedoArgs.eventArgs.hide = !undoRedoArgs.eventArgs.hide;
                    updateAction(undoRedoArgs, this.parent);
                    break;
                case 'replace':
                    undoRedoArgs = this.performOperation(undoRedoArgs);
                    break;
                case 'insert':
                case 'filter':
                    updateAction(undoRedoArgs, this.parent, !args.isUndo);
                    break;
                case 'delete':
                    updateAction(undoRedoArgs, this.parent, !args.isUndo);
                    break;
                case 'validation':
                    updateAction(undoRedoArgs, this.parent, !args.isUndo);
                    break;
                case 'merge':
                    undoRedoArgs.eventArgs.merge = !undoRedoArgs.eventArgs.merge;
                    updateAction(undoRedoArgs, this.parent);
                    break;
                case 'clear':
                    undoRedoArgs = this.performOperation(undoRedoArgs);
                    break;
                case 'conditionalFormat':
                    updateAction(undoRedoArgs, this.parent, !args.isUndo);
                    break;
                case 'clearCF':
                    updateAction(undoRedoArgs, this.parent, !args.isUndo);
                    break;
                case 'insertImage':
                    updateAction(undoRedoArgs, this.parent, !args.isUndo);
                    break;
                case 'imageRefresh':
                    updateAction(undoRedoArgs, this.parent, !args.isUndo);
                    break;
                case 'insertChart':
                case 'deleteChart':
                    updateAction(undoRedoArgs, this.parent, !args.isUndo);
                    break;
                case 'chartRefresh':
                    updateAction(undoRedoArgs, this.parent, !args.isUndo);
                    break;
            }
            if (args.isUndo) {
                this.redoCollection.push(undoRedoArgs);
            }
            else {
                this.undoCollection.push(undoRedoArgs);
            }
            if (this.undoCollection.length > this.undoRedoStep) {
                this.undoCollection.splice(0, 1);
            }
            if (this.redoCollection.length > this.undoRedoStep) {
                this.redoCollection.splice(0, 1);
            }
            this.updateUndoRedoIcons();
            var completeArgs = Object.assign({}, undoRedoArgs.eventArgs);
            completeArgs.requestType = args.isUndo ? 'undo' : 'redo';
            delete completeArgs.beforeActionData;
            if (!args.isPublic) {
                this.parent.notify(triggerDataChange, extend({ isUndo: args.isUndo }, undoRedoArgs, null, true));
                this.parent.notify(completeAction, { eventArgs: completeArgs, action: 'undoRedo' });
            }
            this.parent.notify(refreshRibbonIcons, null);
        }
    };
    UndoRedo.prototype.updateUndoRedoCollection = function (options) {
        var actionList = ['clipboard', 'format', 'sorting', 'cellSave', 'resize', 'resizeToFit', 'wrap', 'hideShow', 'replace',
            'validation', 'merge', 'clear', 'conditionalFormat', 'clearCF', 'insertImage', 'imageRefresh', 'insertChart', 'deleteChart',
            'chartRefresh', 'filter', 'cellDelete'];
        if ((options.args.action === 'insert' || options.args.action === 'delete') && options.args.eventArgs.modelType !== 'Sheet') {
            actionList.push(options.args.action);
        }
        var action = options.args.action;
        if (actionList.indexOf(action) === -1 && !options.isPublic) {
            return;
        }
        var eventArgs = options.args.eventArgs;
        if (action === 'clipboard' || action === 'sorting' || action === 'format' || action === 'cellSave' ||
            action === 'wrap' || action === 'replace' || action === 'validation' || action === 'clear' || action === 'conditionalFormat' ||
            action === 'clearCF' || action === 'insertImage' || action === 'imageRefresh' || action === 'insertChart' ||
            action === 'chartRefresh' || action === 'filter' || action === 'cellDelete') {
            var beforeActionDetails = { beforeDetails: { cellDetails: [] } };
            this.parent.notify(getBeforeActionData, beforeActionDetails);
            eventArgs.beforeActionData = beforeActionDetails.beforeDetails;
        }
        this.undoCollection.push(options.args);
        this.redoCollection = [];
        if (this.undoCollection.length > this.undoRedoStep) {
            this.undoCollection.splice(0, 1);
        }
        this.updateUndoRedoIcons();
    };
    UndoRedo.prototype.clearUndoRedoCollection = function () {
        this.undoCollection = [];
        this.redoCollection = [];
        this.updateUndoRedoIcons();
    };
    UndoRedo.prototype.updateUndoRedoIcons = function () {
        var l10n = this.parent.serviceLocator.getService(locale);
        this.parent.notify(enableToolbarItems, [{
                tab: l10n.getConstant('Home'), items: [this.parent.element.id + '_undo'],
                enable: this.undoCollection.length > 0
            }]);
        this.parent.notify(enableToolbarItems, [{
                tab: l10n.getConstant('Home'), items: [this.parent.element.id + '_redo'],
                enable: this.redoCollection.length > 0
            }]);
    };
    UndoRedo.prototype.undoForClipboard = function (args) {
        var _this = this;
        var eventArgs = args.eventArgs;
        var address = eventArgs.pastedRange.split('!');
        var range = getRangeIndexes(address[1]);
        var sheetIndex = getSheetIndex(this.parent, address[0]);
        var sheet = getSheet(this.parent, sheetIndex);
        var copiedInfo = eventArgs.copiedInfo;
        var actionData = eventArgs.beforeActionData;
        var isRefresh = this.checkRefreshNeeded(sheetIndex);
        var pictureElem;
        if (args.eventArgs.requestType === 'imagePaste') {
            var copiedShapeInfo = eventArgs.copiedShapeInfo;
            if (this.isUndo) {
                pictureElem = copiedShapeInfo.pictureElem;
                if (copiedShapeInfo.isCut) {
                    this.parent.notify(deleteImage, {
                        id: pictureElem.id, sheetIdx: eventArgs.pasteSheetIndex + 1
                    });
                    this.parent.notify(createImageElement, {
                        options: {
                            src: pictureElem.style.backgroundImage.replace(/url\((['"])?(.*?)\1\)/gi, '$2'),
                            height: copiedShapeInfo.height, width: copiedShapeInfo.width, imageId: pictureElem.id
                        },
                        range: copiedShapeInfo.copiedRange, isPublic: false, isUndoRedo: true
                    });
                }
                else {
                    this.parent.notify(deleteImage, {
                        id: eventArgs.pastedPictureElement.id, sheetIdx: eventArgs.pasteSheetIndex + 1
                    });
                }
            }
            else {
                if (copiedShapeInfo.isCut) {
                    pictureElem = copiedShapeInfo.pictureElem;
                    this.parent.notify(deleteImage, {
                        id: pictureElem.id, sheetIdx: copiedShapeInfo.sId
                    });
                    this.parent.notify(createImageElement, {
                        options: {
                            src: pictureElem.style.backgroundImage.replace(/url\((['"])?(.*?)\1\)/gi, '$2'),
                            height: copiedShapeInfo.height, width: copiedShapeInfo.width, imageId: pictureElem.id
                        },
                        range: copiedShapeInfo.pastedRange, isPublic: false, isUndoRedo: true
                    });
                }
                else {
                    pictureElem = eventArgs.pastedPictureElement;
                    this.parent.notify(createImageElement, {
                        options: {
                            src: pictureElem.style.backgroundImage.replace(/url\((['"])?(.*?)\1\)/gi, '$2'),
                            height: pictureElem.offsetHeight, width: pictureElem.offsetWidth, imageId: pictureElem.id
                        },
                        range: copiedShapeInfo.pastedRange, isPublic: false, isUndoRedo: true
                    });
                }
            }
        }
        else {
            if (this.isUndo) {
                if (copiedInfo.isCut) {
                    var cells = actionData.cutCellDetails;
                    this.updateCellDetails(cells, getSheet(this.parent, getSheetIndexFromId(this.parent, copiedInfo.sId)), getSwapRange(copiedInfo.range), isRefresh);
                    this.parent.notify(getFilteredCollection, null);
                    for (var i = 0; i < this.parent.sheets.length; i++) {
                        var sheetIndex_1 = getSheetIndexFromId(this.parent, copiedInfo.sId);
                        if (this.parent.filterCollection && this.parent.filterCollection[i] &&
                            this.parent.filterCollection[i].sheetIndex === eventArgs.pasteSheetIndex) {
                            var filterCol = this.parent.filterCollection[i];
                            var fRange = getRangeIndexes(filterCol.filterRange);
                            var pRange = getSwapRange(range);
                            if (fRange[0] >= pRange[0] && fRange[2] <= pRange[2]) {
                                this.parent.notify(initiateFilterUI, {
                                    predicates: null, range: filterCol.filterRange,
                                    sIdx: eventArgs.pasteSheetIndex, isCut: true
                                });
                                var diff = [Math.abs(pRange[0] - fRange[0]), Math.abs(pRange[1] - fRange[1]),
                                    Math.abs(pRange[2] - fRange[2]), Math.abs(pRange[3] - fRange[3])];
                                var copiedRange = getSwapRange(copiedInfo.range);
                                diff = [copiedRange[0] + diff[0], copiedRange[1] + diff[1],
                                    Math.abs(copiedRange[2] - diff[2]), Math.abs(copiedRange[3] - diff[3])];
                                this.parent.notify(initiateFilterUI, {
                                    predicates: null,
                                    range: getRangeAddress(diff), sIdx: sheetIndex_1, isCut: true
                                });
                            }
                        }
                    }
                }
                if (actionData) {
                    this.updateCellDetails(actionData.cellDetails, sheet, range, isRefresh);
                }
                setMaxHgt(sheet, range[0], range[1], 20);
                var hgt = getMaxHgt(sheet, range[0]);
                setRowEleHeight(this.parent, sheet, hgt, range[0]);
                eventArgs.mergeCollection.forEach(function (mergeArgs) {
                    mergeArgs.merge = !mergeArgs.merge;
                    _this.parent.notify(setMerge, mergeArgs);
                    mergeArgs.merge = !mergeArgs.merge;
                });
            }
            else {
                updateAction(args, this.parent, copiedInfo.isCut);
            }
            if (isRefresh) {
                this.parent.notify(selectRange, { address: address[1] });
            }
        }
        return args;
    };
    UndoRedo.prototype.undoForResize = function (args) {
        var eventArgs = args.eventArgs;
        if (eventArgs.hide === undefined) {
            if (eventArgs.isCol) {
                var temp = eventArgs.oldWidth;
                eventArgs.oldWidth = eventArgs.width;
                eventArgs.width = temp;
            }
            else {
                var temp = eventArgs.oldHeight;
                eventArgs.oldHeight = eventArgs.height;
                eventArgs.height = temp;
            }
        }
        else {
            eventArgs.hide = !eventArgs.hide;
        }
        updateAction(args, this.parent);
        var sheet = this.parent.getActiveSheet();
        var activeCell = getRangeIndexes(sheet.activeCell);
        var CellElem = getCell(activeCell[0], activeCell[1], sheet);
        if (CellElem && CellElem.rowSpan) {
            var td = this.parent.getCell(activeCell[0], activeCell[1]);
            this.parent.element.querySelector('.e-active-cell').style.height = td.offsetHeight + 'px';
        }
        else if (CellElem && CellElem.colSpan) {
            var td = this.parent.getCell(activeCell[0], activeCell[1]);
            this.parent.element.querySelector('.e-active-cell').style.width = td.offsetWidth + 'px';
        }
        return args;
    };
    UndoRedo.prototype.performOperation = function (args) {
        var eventArgs = args.eventArgs;
        var address = (args.action === 'cellSave' || args.action === 'wrap' || args.action === 'replace'
            || args.action === 'cellDelete') ? eventArgs.address.split('!') : eventArgs.range.split('!');
        var range = getRangeIndexes(address[1]);
        var indexes = range;
        var sheetIndex = getSheetIndex(this.parent, address[0]);
        var sheet = getSheet(this.parent, sheetIndex);
        var actionData = eventArgs.beforeActionData;
        var isRefresh = this.checkRefreshNeeded(sheetIndex);
        if (this.isUndo) {
            this.updateCellDetails(actionData.cellDetails, sheet, range, isRefresh, args);
        }
        else {
            /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
            var argsEventArgs = args.eventArgs;
            var activeCellIndexes = getRangeIndexes(sheet.activeCell);
            var cellValue = this.parent.getCellStyleValue(['textDecoration'], activeCellIndexes).textDecoration;
            if (argsEventArgs && argsEventArgs.style && argsEventArgs.style.textDecoration) {
                var value = argsEventArgs.style.textDecoration;
                var changedValue = value;
                var changedStyle = void 0;
                var removeProp = false;
                if (cellValue === 'underline') {
                    changedValue = value === 'underline' ? 'none' : 'underline line-through';
                }
                else if (cellValue === 'line-through') {
                    changedValue = value === 'line-through' ? 'none' : 'underline line-through';
                }
                else if (cellValue === 'underline line-through') {
                    changedValue = value === 'underline' ? 'line-through' : 'underline';
                    removeProp = true;
                }
                if (changedValue === 'none') {
                    removeProp = true;
                }
                argsEventArgs.style.textDecoration = changedValue;
                args.eventArgs = argsEventArgs;
                this.parent.notify(setCellFormat, {
                    style: { textDecoration: changedValue }, range: activeCellIndexes, refreshRibbon: true,
                    onActionUpdate: true
                });
                for (var i = indexes[0]; i <= indexes[2]; i++) {
                    for (var j = indexes[1]; j <= indexes[3]; j++) {
                        if (i === activeCellIndexes[0] && j === activeCellIndexes[1]) {
                            continue;
                        }
                        changedStyle = {};
                        cellValue = this.parent.getCellStyleValue(['textDecoration'], [i, j]).textDecoration;
                        if (cellValue === 'none') {
                            if (removeProp) {
                                continue;
                            }
                            changedStyle.textDecoration = value;
                        }
                        else if (cellValue === 'underline' || cellValue === 'line-through') {
                            if (removeProp) {
                                if (value === cellValue) {
                                    changedStyle.textDecoration = 'none';
                                }
                                else {
                                    continue;
                                }
                            }
                            else {
                                changedStyle.textDecoration = value !== cellValue ? 'underline line-through' : value;
                            }
                        }
                        else if (cellValue === 'underline line-through') {
                            if (removeProp) {
                                changedStyle.textDecoration = value === 'underline' ? 'line-through' : 'underline';
                            }
                            else {
                                continue;
                            }
                        }
                        this.parent.notify(setCellFormat, {
                            style: { textDecoration: changedStyle.textDecoration }, range: [i, j, i, j], refreshRibbon: true,
                            onActionUpdate: true
                        });
                    }
                }
                argsEventArgs.style.textDecoration = value;
                args.eventArgs = argsEventArgs;
            }
            else {
                updateAction(args, this.parent, true);
            }
        }
        if (isRefresh) {
            this.parent.notify(selectRange, { address: address[1] });
        }
        return args;
    };
    UndoRedo.prototype.getCellDetails = function (address, sheet) {
        var cells = [];
        var cell;
        address = getSwapRange(address);
        for (var i = address[0]; i <= address[2]; i++) {
            for (var j = address[1]; j <= address[3]; j++) {
                cell = getCell(i, j, sheet);
                cells.push({
                    rowIndex: i, colIndex: j, format: cell ? cell.format : null, isLocked: cell ? cell.isLocked : null,
                    style: cell && cell.style ? Object.assign({}, cell.style) : null, value: cell ? cell.value : '', formula: cell ?
                        cell.formula : '', wrap: cell && cell.wrap, rowSpan: cell && cell.rowSpan, colSpan: cell && cell.colSpan,
                    hyperlink: cell && cell.hyperlink, image: cell && cell.image && cell.chart
                });
            }
        }
        return cells;
    };
    UndoRedo.prototype.updateCellDetails = function (cells, sheet, range, isRefresh, args) {
        var len = cells.length;
        var cellElem;
        for (var i = 0; i < len; i++) {
            setCell(cells[i].rowIndex, cells[i].colIndex, sheet, {
                value: cells[i].value, format: cells[i].format, isLocked: cells[i].isLocked,
                style: cells[i].style && Object.assign({}, cells[i].style), formula: cells[i].formula,
                wrap: cells[i].wrap, rowSpan: cells[i].rowSpan,
                colSpan: cells[i].colSpan, hyperlink: cells[i].hyperlink
            });
            this.parent.notify(workbookEditOperation, {
                action: 'updateCellValue', address: [cells[i].rowIndex, cells[i].colIndex, cells[i].rowIndex,
                    cells[i].colIndex], value: cells[i].formula ? cells[i].formula : cells[i].value
            });
            if (args && args.action === 'wrap' && args.eventArgs.wrap) {
                this.parent.notify(wrapEvent, {
                    range: [cells[i].rowIndex, cells[i].colIndex, cells[i].rowIndex,
                        cells[i].colIndex], wrap: false, sheet: sheet
                });
            }
            if (args && cells[i].hyperlink && args.action === 'clear') {
                args.eventArgs.range = sheet.name + '!' + getRangeAddress([cells[i].rowIndex, cells[i].colIndex, cells[i].rowIndex,
                    cells[i].colIndex]);
                cellElem = this.parent.getCell(cells[i].rowIndex, cells[i].colIndex);
                if (args.eventArgs.type === 'Clear All' || args.eventArgs.type === 'Clear Hyperlinks') {
                    this.parent.addHyperlink(cells[i].hyperlink, args.eventArgs.range);
                }
                else if (args.eventArgs.type === 'Clear Formats') {
                    addClass(cellElem.querySelectorAll('.e-hyperlink'), 'e-hyperlink-style');
                }
            }
        }
        if (isRefresh) {
            this.parent.serviceLocator.getService('cell').refreshRange(range);
        }
    };
    UndoRedo.prototype.checkRefreshNeeded = function (sheetIndex) {
        var isRefresh = true;
        if (sheetIndex !== this.parent.activeSheetIndex) {
            this.parent.activeSheetIndex = sheetIndex;
            this.parent.dataBind();
            isRefresh = false;
        }
        return isRefresh;
    };
    UndoRedo.prototype.addEventListener = function () {
        this.parent.on(performUndoRedo, this.performUndoRedo, this);
        this.parent.on(updateUndoRedoCollection, this.updateUndoRedoCollection, this);
        this.parent.on(setActionData, this.setActionData, this);
        this.parent.on(getBeforeActionData, this.getBeforeActionData, this);
        this.parent.on(clearUndoRedoCollection, this.clearUndoRedoCollection, this);
        this.parent.on(setUndoRedo, this.updateUndoRedoIcons, this);
    };
    UndoRedo.prototype.removeEventListener = function () {
        if (!this.parent.isDestroyed) {
            this.parent.off(performUndoRedo, this.performUndoRedo);
            this.parent.off(updateUndoRedoCollection, this.updateUndoRedoCollection);
            this.parent.off(setActionData, this.setActionData);
            this.parent.off(getBeforeActionData, this.getBeforeActionData);
            this.parent.off(clearUndoRedoCollection, this.clearUndoRedoCollection);
            this.parent.off(setUndoRedo, this.updateUndoRedoIcons);
        }
    };
    /**
     * Destroy undo redo module.
     *
     * @returns {void} - Destroy undo redo module.
     */
    UndoRedo.prototype.destroy = function () {
        this.removeEventListener();
        this.parent = null;
    };
    /**
     * Get the undo redo module name.
     *
     * @returns {string} - Get the undo redo module name.
     */
    UndoRedo.prototype.getModuleName = function () {
        return 'undoredo';
    };
    return UndoRedo;
}());
export { UndoRedo };
