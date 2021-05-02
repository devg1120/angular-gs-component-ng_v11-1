import { detach, EventHandler, Browser, L10n, isNullOrUndefined } from '@syncfusion/ej2-base';
import { ClickEventArgs } from '@syncfusion/ej2-navigations';
import { Spreadsheet } from '../base/index';
import { SheetModel, getRangeIndexes, getCell, setCell, getSheet, CellModel, getSwapRange, inRange, isHiddenRow, Workbook } from '../../workbook/index';
import { CellStyleModel, getRangeAddress, workbookEditOperation, getSheetIndexFromId, getSheetName } from '../../workbook/index';
import { RowModel, getFormattedCellObject, workbookFormulaOperation, checkIsFormula, Sheet, mergedRange } from '../../workbook/index';
import { ExtendedSheet, Cell, pasteMerge, setMerge, MergeArgs, getCellIndexes, getCellAddress, ChartModel } from '../../workbook/index';
import { ribbonClick, ICellRenderer, cut, copy, paste, PasteSpecialType, initiateFilterUI, focus, setPosition } from '../common/index';
import { BeforePasteEventArgs, hasTemplate, getTextHeightWithBorder, getLines, getExcludedColumnWidth } from '../common/index';
import { enableToolbarItems, rowHeightChanged, completeAction, beginAction, DialogBeforeOpenEventArgs } from '../common/index';
import { clearCopy, selectRange, dialog, contentLoaded, tabSwitch, cMenuBeforeOpen, locale, createImageElement } from '../common/index';
import { getMaxHgt, setMaxHgt, setRowEleHeight, deleteImage, getRowIdxFromClientY, getColIdxFromClientX } from '../common/index';
import { Dialog } from '../services/index';
import { Deferred } from '@syncfusion/ej2-data';
import { BeforeOpenEventArgs } from '@syncfusion/ej2-popups';
import { refreshRibbonIcons, isCellReference, getColumn, isLocked as isCellLocked, FilterCollectionModel } from '../../workbook/index';
import { getFilteredCollection, setChart, parseIntValue, isSingleCell, activeCellMergedRange, getRowsHeight } from '../../workbook/index';

/**
 * Represents clipboard support for Spreadsheet.
 */
export class Clipboard {
    private parent: Spreadsheet;
    private cutInfo: boolean;
    private externalMerge: boolean = false;
    private externalMergeRow: number;
    private copiedInfo: { range: number[], sId: number, isCut: boolean };
    private copiedShapeInfo: {
        pictureElem: HTMLElement, sId: number, sheetIdx: number, isCut: boolean,
        copiedRange: string, height: number, width: number, chartInfo: ChartModel
    };
    private copiedSheet: SheetModel;
    private copiedCell: number[];
    constructor(parent: Spreadsheet) {
        this.parent = parent;
        this.init();
        this.addEventListener();
    }

    private init(): void {
        this.parent.element
            .appendChild(this.parent.createElement('input', { className: 'e-clipboard', attrs: { 'contenteditable': 'true' } }));
    }

    private addEventListener(): void {
        const ele: Element = this.getClipboardEle();
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
    }

    private removeEventListener(): void {
        const ele: Element = this.getClipboardEle();
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
    }

    private ribbonClickHandler(args: ClickEventArgs): void {
        const parentId: string = this.parent.element.id;
        switch (args.item.id) {
        case parentId + '_cut':
            this.cut({ isAction: true } as CopyArgs & ClipboardEvent);
            break;
        case parentId + '_copy':
            this.copy({ isAction: true } as CopyArgs & ClipboardEvent);
            break;
        }
        focus(this.parent.element);
    }

    private tabSwitchHandler(args: { activeTab: number }): void {
        if (args.activeTab === 0 && !this.copiedInfo && !this.copiedShapeInfo) { this.hidePaste(); }
    }

    private cMenuBeforeOpenHandler(e: { target: string }): void {
        const sheet: SheetModel = this.parent.getActiveSheet();
        const l10n: L10n = this.parent.serviceLocator.getService(locale);
        let delRowItems: string[] = []; let hideRowItems: string[] = [];
        let delColItems: string[] = []; let hideColItems: string[] = [];
        const actCell: string = sheet.activeCell;
        const actCellIndex: number[] = getCellIndexes(actCell);
        const cellObj: CellModel = getCell(actCellIndex[0], actCellIndex[1], sheet);
        const isLocked: boolean = sheet.isProtected && isCellLocked(cellObj, getColumn(sheet, actCellIndex[1]));
        if (e.target === 'Content' || e.target === 'RowHeader' || e.target === 'ColumnHeader') {
            this.parent.enableContextMenuItems(
                [l10n.getConstant('Paste'), l10n.getConstant('PasteSpecial')], (this.copiedInfo ||
                    this.copiedShapeInfo && !isLocked) ? true : false);
            this.parent.enableContextMenuItems([l10n.getConstant('Cut')], (!isLocked) ? true : false);
        }
        if ((e.target === 'Content') && isLocked) {
            this.parent.enableContextMenuItems(
                [l10n.getConstant('Cut'), l10n.getConstant('Filter'), l10n.getConstant('Sort')], false);
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
    }

    private rowHeightChanged(args: { rowIdx: number, threshold: number }): void {
        if (this.copiedInfo && this.copiedInfo.range[0] > args.rowIdx) {
            const ele: HTMLElement = this.parent.element.getElementsByClassName('e-copy-indicator')[0] as HTMLElement;
            if (ele) {
                ele.style.top = `${parseInt(ele.style.top, 10) + args.threshold}px`;
            }
        }
    }

    private cut(args?: CopyArgs & ClipboardEvent): void {
        this.setCopiedInfo(args, true);
    }

    private copy(args?: CopyArgs & ClipboardEvent): void {
        this.copiedSheet = this.parent.getActiveSheet();
        this.setCopiedInfo(args, false);
    }

    private paste(args?: {
        range: number[], sIdx: number, type: PasteSpecialType, isClick?: boolean,
        isAction?: boolean, isInternal?: boolean
    } & ClipboardEvent): void {
        if (this.parent.isEdit || this.parent.element.getElementsByClassName('e-dialog').length > 0) {
            return;
        }
        let rfshRange: number[];
        args.isAction = true;
        let isExternal: DataTransfer | boolean = ((args && args.clipboardData) || window['clipboardData']);
        const copiedIdx: number = this.getCopiedIdx();
        let isCut: boolean;
        const copyInfo: { range: number[], sId: number, isCut: boolean } = Object.assign({}, this.copiedInfo);
        if (isExternal || this.copiedShapeInfo || (args.isInternal && this.copiedInfo)) {
            const cSIdx: number = (args && args.sIdx > -1) ? args.sIdx : this.parent.activeSheetIndex;
            const curSheet: SheetModel = getSheet(this.parent as Workbook, cSIdx);
            let selIdx: number[] = getSwapRange(args && args.range || getRangeIndexes(curSheet.selectedRange));
            const rows: RowModel[] | { internal: boolean } = isExternal && this.getExternalCells(args);
            if (!args.isInternal && (rows as { internal: boolean }) && (rows as { internal: boolean }).internal) {
                isExternal = false;
                if (!this.copiedInfo) { return; }
            }
            if (isExternal && !(rows as RowModel[]).length) { // If image pasted
                return;
            }
            let cellLength: number = 0;
            if (rows) {
                for (let i: number = 0; i < (rows as RowModel[]).length; i++) {
                    cellLength = rows[i].cells.length > cellLength ? rows[i].cells.length : cellLength;
                }
            }
            let rowIdx: number = selIdx[0]; let cIdx: number[] = isExternal
                ? [0, 0, (rows as RowModel[]).length - 1, cellLength - 1] : getSwapRange(this.copiedShapeInfo ?
                    getRangeIndexes(curSheet.selectedRange) : this.copiedInfo.range);
            let isRepeative: boolean = (selIdx[2] - selIdx[0] + 1) % (cIdx[2] - cIdx[0] + 1) === 0
                && (selIdx[3] - selIdx[1] + 1) % (cIdx[3] - cIdx[1] + 1) === 0;
            rfshRange = isRepeative ? selIdx : [selIdx[0], selIdx[1]]
                .concat([selIdx[0] + cIdx[2] - cIdx[0], selIdx[1] + cIdx[3] - cIdx[1] || selIdx[1]]);
            const beginEventArgs: BeforePasteEventArgs = {
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
            let cell: CellModel;
            let isExtend: boolean; let prevCell: CellModel; const mergeCollection: MergeArgs[] = [];
            const prevSheet: SheetModel = getSheet(this.parent as Workbook, isExternal ? cSIdx : copiedIdx);
            const notRemoveMerge: boolean = isSingleCell(cIdx) && this.isRangeMerged(selIdx, curSheet);
            selIdx = getRangeIndexes(beginEventArgs.pastedRange);
            rowIdx = selIdx[0]; cIdx = isExternal
                ? [0, 0, (rows as RowModel[]).length - 1, cellLength - 1] : getSwapRange(this.copiedShapeInfo ?
                    getRangeIndexes(curSheet.selectedRange) : this.copiedInfo.range);
            isRepeative = (selIdx[2] - selIdx[0] + 1) % (cIdx[2] - cIdx[0] + 1) === 0 && (selIdx[3] - selIdx[1] + 1) %
                (cIdx[3] - cIdx[1] + 1) === 0 && !notRemoveMerge;
            let mergeArgs: { range: number[], prevSheet?: SheetModel, cancel?: boolean } = {
                range: cIdx, prevSheet: prevSheet, cancel: false
            };
            rfshRange = isRepeative ? selIdx : [selIdx[0], selIdx[1]]
                .concat([selIdx[0] + cIdx[2] - cIdx[0], selIdx[1] + cIdx[3] - cIdx[1] || selIdx[1]]);
            if (this.copiedShapeInfo && !this.copiedInfo) {
                const pictureElem: HTMLElement = this.copiedShapeInfo.pictureElem as HTMLElement;
                if (pictureElem.classList.contains('e-datavisualization-chart')) {
                    this.copiedShapeInfo.chartInfo.top = null;
                    this.copiedShapeInfo.chartInfo.left = null;
                    this.parent.notify(setChart, {
                        chart: [this.copiedShapeInfo.chartInfo], isInitCell: true, isUndoRedo: true, isPaste: true,
                        dataSheetIdx: this.copiedShapeInfo.sheetIdx, isCut: this.copiedShapeInfo.isCut,
                        range: args.range || curSheet.selectedRange, isIdAvailabe: false
                    });
                } else {
                    this.parent.notify(createImageElement, {
                        options: {
                            src: pictureElem.style.backgroundImage.replace(/url\((['"])?(.*?)\1\)/gi, '$2'),
                            height: this.copiedShapeInfo.height, width: this.copiedShapeInfo.width,
                            imageId: this.copiedShapeInfo.isCut ? pictureElem.id : ''
                        },
                        range: getRangeAddress([rowIdx, selIdx[1], rowIdx, selIdx[1]]), isPublic: false, isUndoRedo: true
                    });
                }
                const pastedCell: CellModel = getCell(rowIdx, selIdx[1], curSheet);
                if (pastedCell && !isNullOrUndefined(pastedCell.image)) {
                    const imgLen: number = pastedCell.image ? pastedCell.image.length - 1 : 0;
                    const eventArgs: Object = {
                        requestType: 'imagePaste',
                        copiedShapeInfo: this.copiedShapeInfo,
                        pasteSheetIndex: this.parent.activeSheetIndex,
                        pastedRange: getSheetName(this.parent as Workbook) + '!' + getRangeAddress([rowIdx, selIdx[1], rowIdx, selIdx[1]]),
                        pastedPictureElement: document.getElementById(pastedCell.image[imgLen].id)
                    };
                    this.parent.notify(completeAction, { eventArgs: eventArgs, action: 'clipboard' });
                }
            } else {
                this.parent.notify(pasteMerge, mergeArgs);
                if (mergeArgs.cancel) { return; }
                const pasteType: string = beginEventArgs.type ? beginEventArgs.type : args.type;
                const cRows: RowModel[] = [];
                const isInRange: boolean = this.isInRange(cIdx, selIdx, copiedIdx);
                for (let i: number = cIdx[0], l: number = 0;  i <= cIdx[2]; i++, l++) {
                    if (isInRange) {
                        cRows[selIdx[0] + l] = { cells: [] };
                    }
                    if (!isHiddenRow(this.parent.getActiveSheet(), i)) {
                        for (let j: number = cIdx[1], k: number = 0; j <= cIdx[3]; j++, k++) {
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
                                        const ele: Element = this.parent.getCell(selIdx[0], selIdx[1]);
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
                                for (let x: number = selIdx[0]; x <= selIdx[2]; x += (cIdx[2] - cIdx[0]) + 1) {
                                    for (let y: number = selIdx[1]; y <= selIdx[3]; y += (cIdx[3] - cIdx[1] + 1)) {
                                        prevCell = getCell(x + l, y + k, curSheet) || {};
                                        if (!this.externalMerge && prevCell.colSpan !== undefined || prevCell.rowSpan !== undefined) {
                                            mergeArgs = { range: [x + l, y + k, x + l, y + k] };
                                            const merge: MergeArgs = { range: mergeArgs.range, merge: false, isAction: false, type: 'All' };
                                            mergeCollection.push(merge);
                                            if (this.parent.activeSheetIndex === curSheet.index) {
                                                this.parent.notify(setMerge, merge);
                                            }
                                        }
                                        let colInd: number = y + k;
                                        if (this.externalMerge && this.externalMergeRow === x + l) {
                                            colInd = colInd + 1;
                                        } else {
                                            this.externalMerge = false;
                                        }
                                        if (!isExtend) {
                                            const newFormula: string = this.isFormula([x + l, colInd]);
                                            if (!isNullOrUndefined(newFormula)) {
                                                cell.formula = newFormula;
                                            }
                                        }
                                        let toSkip: boolean = false;
                                        if (this.parent.filteredRows && this.parent.filteredRows.rowIdxColl &&
                                            this.parent.filteredRows.sheetIdxColl) {
                                            for (let i: number = 0, len: number =
                                                this.parent.filteredRows.sheetIdxColl.length; i < len; i++) {
                                                if (this.parent.filteredRows.sheetIdxColl[i] === this.parent.activeSheetIndex &&
                                                    this.parent.filteredRows.rowIdxColl[i] === x + l) {
                                                    toSkip = true;
                                                    break;
                                                }
                                            }
                                        }
                                        if (!toSkip) {
                                            this.setCell(x + l, colInd, curSheet, cell, isExtend, false, y === selIdx[3],
                                                         isExternal as boolean);
                                        }
                                        const sId: number = this.parent.activeSheetIndex;
                                        const cellElem: HTMLTableCellElement = this.parent.getCell(x + l, colInd) as HTMLTableCellElement;
                                        const address: string = getCellAddress(x + l, colInd);
                                        const cellArgs: Object = {
                                            address: this.parent.sheets[sId].name + '!' + address,
                                            requestType: 'paste',
                                            value : getCell(x + l, colInd, curSheet ) ? getCell(x + l, colInd, curSheet ).value : '',
                                            oldValue:  prevCell.value,
                                            element: cellElem,
                                            displayText: this.parent.getDisplayText(cell)
                                        };
                                        this.parent.trigger('cellSave', cellArgs);
                                    }
                                }
                            } else {
                                if (isExternal || !hasTemplate(this.parent as Workbook, i, j, copiedIdx)) {
                                    if (notRemoveMerge) {
                                        this.setCell(rowIdx, selIdx[1] + k, curSheet, { value: cell.value }, true, false, j === cIdx[3]);
                                    } else {
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
                    this.parent.serviceLocator.getService<ICellRenderer>('cell').refreshRange(rfshRange);
                    this.parent.notify(selectRange, { address: getRangeAddress(rfshRange) });
                }
                if (!isExternal && this.copiedInfo.isCut) {
                    isCut = this.copiedInfo.isCut;
                    if (copiedIdx === this.parent.activeSheetIndex) {
                        this.parent.serviceLocator.getService<ICellRenderer>('cell').refreshRange(cIdx);
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
                    const sheetIndex: number = copyInfo && copyInfo.sId ? getSheetIndexFromId(this.parent as Workbook, copyInfo.sId) :
                        this.parent.activeSheetIndex;
                    const eventArgs: Object = {
                        requestType: 'paste',
                        copiedInfo: copyInfo,
                        mergeCollection: mergeCollection,
                        pasteSheetIndex: this.parent.activeSheetIndex,
                        copiedRange: this.parent.sheets[sheetIndex].name + '!' + getRangeAddress(copyInfo && copyInfo.range ?
                            copyInfo.range : getRangeIndexes(this.parent.sheets[sheetIndex].selectedRange)),
                        pastedRange: getSheetName(this.parent as Workbook) + '!' + getRangeAddress(rfshRange),
                        type: pasteType || 'All'
                    };
                    if (!isExternal) {
                        this.parent.notify(completeAction, { eventArgs: eventArgs, action: 'clipboard' });
                    }
                }
                if (isCut) {
                    this.updateFilter(copyInfo, rfshRange);
                    setMaxHgt(prevSheet, cIdx[0], cIdx[1], this.parent.getCell(cIdx[0], cIdx[1]).offsetHeight);
                    const hgt: number = getMaxHgt(prevSheet, cIdx[0]);
                    setRowEleHeight(this.parent, prevSheet, hgt, cIdx[0]);
                }
                const copySheet: SheetModel = getSheet(this.parent as Workbook, copiedIdx);
                if (!isExternal && cIdx[0] === cIdx[2] && (cIdx[3] - cIdx[1]) === copySheet.colCount - 1) {
                    const hgt: number = copySheet.rows[cIdx[0]].height;
                    for (let i: number = selIdx[0]; i <= selIdx[2]; i++) {
                        setRowEleHeight(this.parent, this.parent.getActiveSheet(), hgt, i);
                    }
                    if (isCut) {
                        setRowEleHeight(this.parent, copySheet, 20, cIdx[0]);
                    }
                }
            }
        } else {
            this.getClipboardEle().select();
        }
    }

    private isRangeMerged(range: number[], sheet: SheetModel): boolean {
        const cell: CellModel = getCell(range[0], range[1], sheet);
        if (cell && (cell.colSpan > 1 || cell.rowSpan > 1)) {
            const args: { range: number[] } = { range: range.slice(2, 4).concat(range.slice(2, 4)) };
            this.parent.notify(activeCellMergedRange, args);
            return args.range[0] === range[0] && args.range[1] === range[1] && args.range[2] === range[2] && args.range[3] === range[3];
        }
        return false;
    }

    private updateFilter(copyInfo: { range: number[], sId: number, isCut: boolean }, pastedRange: number[]): void {
        let isFilterCut: boolean; let diff: number[];
        this.parent.notify(getFilteredCollection, null);
        for (let i: number = 0; i < this.parent.sheets.length; i++) {
            if (this.parent.filterCollection && this.parent.filterCollection[i] &&
                this.parent.filterCollection[i].sheetIndex === getSheetIndexFromId(this.parent as Workbook, copyInfo.sId)) {
                let range: number[] = copyInfo.range;
                const fRange: number[] = getRangeIndexes(this.parent.filterCollection[i].filterRange);
                range = getSwapRange(range);
                if (fRange[0] === range[0] && fRange[2] === range[2] && fRange[1] === range[1] && fRange[3] === range[3]) {
                    isFilterCut = true;
                    diff = [Math.abs(range[0] - fRange[0]), Math.abs(range[1] - fRange[1]),
                        Math.abs(range[2] - fRange[2]), Math.abs(range[3] - fRange[3])];
                }
            }
        }
        let cell: HTMLElement = this.parent.getCell(copyInfo.range[0], copyInfo.range[1]);
        cell = cell ? (cell.querySelector('.e-filter-icon') ? cell : this.parent.getCell(copyInfo.range[2], copyInfo.range[3])) : cell;
        const asc: HTMLElement = cell ? cell.querySelector('.e-sortasc-filter') : cell;
        const desc: HTMLElement = cell ? cell.querySelector('.e-sortdesc-filter') : cell;
        if (isFilterCut) {
            for (let n: number = 0; n < this.parent.filterCollection.length; n++) {
                const filterCol: FilterCollectionModel = this.parent.filterCollection[n];
                const sheetIndex: number = copyInfo && copyInfo.sId ? getSheetIndexFromId(this.parent as Workbook, copyInfo.sId) :
                    this.parent.activeSheetIndex;
                if (filterCol.sheetIndex === sheetIndex) {
                    this.parent.notify(initiateFilterUI, { predicates: null, range: filterCol.filterRange, sIdx: sheetIndex, isCut: true });
                }
                if (filterCol.sheetIndex === sheetIndex && sheetIndex === this.parent.activeSheetIndex) {
                    diff = [pastedRange[0] + diff[0], pastedRange[1] + diff[1],
                        Math.abs(pastedRange[2] - diff[2]), Math.abs(pastedRange[3] - diff[3])];
                    this.parent.notify(initiateFilterUI, { predicates: null, range: getRangeAddress(diff), sIdx: null, isCut: true });
                    if (copyInfo.range[3] === copyInfo.range[1]) { // To update sorted icon after pasting.
                        const filteredCell: HTMLElement = this.parent.getCell(pastedRange[0], pastedRange[1]);
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
    }

    private isInRange(cRng: number[], pRng: number[], sIdx: number): boolean {
        const activeSheetIndex: number = this.parent.activeSheetIndex;
        return (inRange(cRng, pRng[0], pRng[1]) && sIdx === activeSheetIndex) ||
            (inRange(cRng, pRng[2], pRng[3]) && sIdx === activeSheetIndex);
    }

    private isFormula(selIdx: number[]): string {
        let cIdxValue: string; let cell: CellModel; let sheet: SheetModel;
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
            const start : number = cIdxValue.indexOf('(');
            const end: number =  cIdxValue.indexOf(')');
            if (start > -1 && end > -1) {
                cIdxValue = cIdxValue.slice(start + 1, end);
            }
            const difIndex: number[] = [];
            const formulaOperators: string[] = ['+', '-', '*', '/']; let splitArray: string[];
            let value: string = cIdxValue;
            for (let i: number = 0; i < formulaOperators.length; i++) {
                splitArray = value.split(formulaOperators[i]);
                value = splitArray.join(',');
            }
            splitArray = value.split(','); let isRange: boolean;
            if (splitArray.length === 1 && splitArray.indexOf(':')) {
                splitArray = value.split(':'); isRange = true;
            }
            for (let j: number = 0; j < splitArray.length; j++) {
                if (isCellReference(splitArray[j])) {
                    const range: number[] = getCellIndexes(splitArray[j]);
                    const diff: number[] = [this.copiedCell[0] - range[0], this.copiedCell[1] - range[1]];
                    difIndex.push(diff[0]);
                    difIndex.push(diff[1]);
                }
            }
            let newAddress: string[] = [];
            for (let j: number = 0; j < difIndex.length; j++) {
                const address: string = getCellAddress(selIdx[0] - difIndex[0 + j], selIdx[1] - difIndex[1 + j]);
                newAddress.push(address);
                j++;
            }
            let inValidRef: boolean;
            for (let a: number = 0; a < newAddress.length; a++) {
                if (isCellReference(newAddress[a])) {
                    const range: number[] = getRangeIndexes(newAddress[a]);
                    if (range[0] < 0 || range[1] < 0) { inValidRef = true; }
                } else {
                    inValidRef = true;
                }
                if (inValidRef) {
                    if (isRange) {
                        newAddress = ['#REF!']; splitArray = [splitArray.join(':')]; break;
                    } else {
                        newAddress[a] = '#REF!';
                    }
                }
            }
            cIdxValue = cell.formula.toUpperCase();
            for (let i: number = 0; i < splitArray.length; i++) {
                for (let j: number = 0; j < newAddress.length; j++) {
                    cIdxValue = cIdxValue.replace(splitArray[i].toUpperCase(), newAddress[j].toUpperCase());
                    i++;
                }
            }
            return cIdxValue;
        } else {
            return null;
        }
    }
    private setCell(
        rIdx: number, cIdx: number, sheet: SheetModel, cell: CellModel, isExtend?: boolean, isCut?: boolean,
        lastCell?: boolean, isExternal?: boolean): void {
        let sheetIndex: number = sheet ? getSheetIndexFromId(this.parent, sheet.id) : null;
        setCell(rIdx, cIdx, sheet, isCut ? null : cell, isExtend);
        if (cell && cell.formula) {
            this.parent.notify(workbookFormulaOperation, {
                action: 'refreshCalculate', value: isCut ? '' : cell.formula, rowIndex: rIdx,
                colIndex: cIdx, sheetIndex: this.parent.activeSheetIndex, isFormula: true
            });
        }
        if (cell && !cell.formula) {
            this.parent.notify(
                workbookEditOperation,
                {
                    action: 'updateCellValue', address: [rIdx, cIdx, rIdx,
                        cIdx], value: cell.value, sheetIndex: sheetIndex
                });
        }
        if (sheet.name === this.parent.getActiveSheet().name) {
            this.parent.serviceLocator.getService<ICellRenderer>('cell').refresh(rIdx, cIdx, lastCell);
        }
        if (cell && cell.style && isExternal) {
            let hgt: number =
                getTextHeightWithBorder(this.parent as Workbook, rIdx, cIdx, sheet, cell.style || this.parent.cellStyle, cell.wrap ?
                    getLines(this.parent.getDisplayText(cell),
                             getExcludedColumnWidth(sheet, rIdx, cIdx), cell.style, this.parent.cellStyle) : 1);
            hgt = Math.round(hgt);
            if (hgt < 20) {
                hgt = 20; // default height
            }
            setMaxHgt(sheet, rIdx, cIdx, hgt);
            const prevHeight: number = getRowsHeight(sheet, rIdx);
            const maxHgt: number = getMaxHgt(sheet, rIdx);
            const heightChanged: boolean = maxHgt > prevHeight;
            if (heightChanged) {
                setRowEleHeight(this.parent, sheet, maxHgt, rIdx);
            }
        }
    }

    private getCopiedIdx(): number {
        if (this.copiedInfo) {
            for (let i: number = 0; i < this.parent.sheets.length; i++) {
                if (this.parent.sheets[i].id === this.copiedInfo.sId) {
                    return i;
                }
            }
            this.clearCopiedInfo();
        }
        return -1;
    }

    private setCopiedInfo(args?: SetClipboardInfo & ClipboardEvent, isCut?: boolean): void {
        if (this.parent.isEdit) {
            return;
        }
        const deferred: Deferred = new Deferred();
        args.promise = deferred.promise;
        const sheet: ExtendedSheet = this.parent.getActiveSheet() as Sheet;
        let range: number[];
        if (args && args.range) {
            const mergeArgs: MergeArgs = { range: args.range };
            this.parent.notify(mergedRange, mergeArgs);
            range = mergeArgs.range as number[];
        } else {
            range = getRangeIndexes(sheet.selectedRange);
        }
        const option: { sheet: SheetModel, indexes: number[], promise?: Promise<Cell> } = {
            sheet: sheet, indexes: [0, 0, sheet.rowCount - 1, sheet.colCount - 1], promise:
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                new Promise((resolve: Function, reject: Function) => { resolve((() => { /** */ })()); })
        };
        const pictureElements: HTMLCollection = document.getElementsByClassName('e-ss-overlay-active');
        const pictureLen: number = pictureElements.length;
        if (sheet.isLocalData && !(args && args.clipboardData) && range[0] === 0 && range[2] === (sheet.rowCount - 1)) {
            this.parent.showSpinner();
            this.parent.notify('updateSheetFromDataSource', option);
        }
        option.promise.then(() => {
            if (pictureLen > 0) {
                const imgRowIdx: { clientY: number, isImage: boolean } = {
                    clientY: (pictureElements[0] as HTMLElement).offsetTop,
                    isImage: true
                };
                this.parent.notify(getRowIdxFromClientY, imgRowIdx);
                const imgColIdx: { clientX: number, isImage: boolean } = {
                    clientX: (pictureElements[0] as HTMLElement).offsetLeft,
                    isImage: true
                };
                this.parent.notify(getColIdxFromClientX, imgColIdx);
                this.copiedShapeInfo = {
                    sId: (args && args.sId) ? args.sId : sheet.id, sheetIdx: sheet.index, isCut: isCut, pictureElem:
                        pictureElements[0] as HTMLElement, copiedRange: getRangeAddress([imgRowIdx.clientY, imgColIdx.clientX,
                        imgRowIdx.clientY, imgColIdx.clientX]), height: (pictureElements[0] as HTMLElement).offsetHeight,
                    width: (pictureElements[0] as HTMLElement).offsetWidth,
                    chartInfo: this.getChartElemInfo(pictureElements[0] as HTMLElement)
                };
                this.hidePaste(true);
                if (isCut) {
                    if (pictureElements[0].classList.contains('e-datavisualization-chart')) {
                        this.parent.deleteChart(this.copiedShapeInfo.chartInfo.id);
                    } else {
                        this.parent.notify(deleteImage, {
                            id: this.copiedShapeInfo.pictureElem.id, sheetIdx: this.copiedShapeInfo.sId,
                            range: this.copiedShapeInfo.copiedRange
                        });
                    }
                }
            } else if (!(args && args.clipboardData)) {
                if (this.copiedInfo) {
                    this.clearCopiedInfo();
                }

                this.copiedInfo = {
                    range: range, sId: (args && args.sId) ? args.sId : sheet.id, isCut: isCut
                };
                this.hidePaste(true);
                this.initCopyIndicator();
                if (!Browser.isIE) {
                    this.getClipboardEle().select();
                }
                if (args && args.isAction) {
                    document.execCommand(isCut ? 'cut' : 'copy');
                }
                this.parent.hideSpinner();
            }
            if (Browser.isIE) {
                this.setExternalCells(args);
            }
            deferred.resolve();
        });
        if (args && args.clipboardData) {
            this.setExternalCells(args);
            focus(this.parent.element);
        }
    }

    private getChartElemInfo(overlayEle: HTMLElement): ChartModel {
        const chartColl: ChartModel[] = this.parent.chartColl;
        if (overlayEle.classList.contains('e-datavisualization-chart')) {
            const chartId: string = overlayEle.getElementsByClassName('e-control')[0].id;
            for (let idx: number = 0; idx < chartColl.length; idx++) {
                if (chartColl[idx].id === chartId) {
                    const chart: ChartModel = chartColl[idx];
                    return chart;
                }
            }
        }
        return null;
    }

    private clearCopiedInfo(): void {
        if (this.copiedInfo) {
            if (this.parent.getActiveSheet().id === this.copiedInfo.sId) {
                this.removeIndicator(this.parent.getSelectAllContent()); this.removeIndicator(this.parent.getColumnHeaderContent());
                this.removeIndicator(this.parent.getRowHeaderContent()); this.removeIndicator(this.parent.getMainContent());
            }
            this.copiedInfo = null;
            this.hidePaste();
        }
        if (this.copiedShapeInfo) {
            this.copiedShapeInfo = null;
            this.hidePaste();
        }
    }

    private removeIndicator(ele: Element): void {
        if (ele) {
            const indicator: Element = ele.querySelector('.e-copy-indicator');
            if (indicator) { detach(indicator); }
        }
    }

    private initCopyIndicator(): void {
        if (this.copiedInfo && this.parent.getActiveSheet().id === this.copiedInfo.sId) {
            const copyIndicator: HTMLElement = this.parent.createElement('div', { className: 'e-copy-indicator' });
            copyIndicator.appendChild(this.parent.createElement('div', { className: 'e-top' }));
            copyIndicator.appendChild(this.parent.createElement('div', { className: 'e-bottom' }));
            copyIndicator.appendChild(this.parent.createElement('div', { className: 'e-left' }));
            copyIndicator.appendChild(this.parent.createElement('div', { className: 'e-right' }));
            setPosition(this.parent, copyIndicator, this.copiedInfo.range, 'e-copy-indicator');
        }
    }

    private showDialog(): void {
        (this.parent.serviceLocator.getService(dialog) as Dialog).show({
            header: 'Spreadsheet',
            target: this.parent.element,
            height: 205, width: 340, isModal: true, showCloseIcon: true,
            content: (this.parent.serviceLocator.getService(locale) as L10n).getConstant('PasteAlert'),
            beforeOpen: (args: BeforeOpenEventArgs): void => {
                const dlgArgs: DialogBeforeOpenEventArgs = {
                    dialogName: 'PasteDialog',
                    element: args.element, target: args.target, cancel: args.cancel
                };
                this.parent.trigger('dialogBeforeOpen', dlgArgs);
                if (dlgArgs.cancel) {
                    args.cancel = true;
                }
            }
        });
    }

    private hidePaste(isShow?: boolean): void {
        if (this.parent.getActiveSheet().isProtected) {
            isShow = false;
        }
        this.parent.notify(enableToolbarItems, [{ items: [this.parent.element.id + '_paste'], enable: isShow || false }]);
    }

    private setExternalCells(args: ClipboardEvent): void {
        let cell: CellModel;
        let text: string = '';
        const range: number[] = this.copiedInfo.range;
        const sheet: SheetModel = this.parent.getActiveSheet();
        let data: string = '<html><body><table class="e-spreadsheet" xmlns="http://www.w3.org/1999/xhtml"><tbody>';
        for (let i: number = range[0]; i <= range[2]; i++) {
            data += '<tr>';
            for (let j: number = range[1]; j <= range[3]; j++) {
                cell = getCell(i, j, sheet);
                data += '<td style="white-space:' + ((cell && cell.wrap) ? 'normal' : 'nowrap') + ';vertical-align:bottom;';
                if (cell && cell.style) {
                    Object.keys(cell.style).forEach((style: string) => {
                        const regex: RegExpMatchArray = style.match(/[A-Z]/);
                        data += (style === 'backgroundColor' ? 'background' : (regex ? style.replace(regex[0], '-'
                            + regex[0].toLowerCase()) : style)) + ':' + ((style === 'backgroundColor' || style === 'color')
                            ? cell.style[style].slice(0, 7) : cell.style[style]) + ';';
                    });
                }
                data += '">';
                if (cell && cell.value) {
                    const eventArgs: { [key: string]: string | number | boolean } = {
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
        } else {
            args.clipboardData.setData('text/html', data);
            args.clipboardData.setData('text/plain', text);
            args.preventDefault();
        }
    }

    private getExternalCells(args: ClipboardEvent): RowModel[] | { internal: boolean } {
        let html: string;
        let text: string;
        let rows: RowModel[] | { internal: boolean } = [];
        let cells: CellModel[] = [];
        let cellStyle: CellStyleModel;
        const ele: Element = this.parent.createElement('span');
        if (Browser.isIE) {
            text = window['clipboardData'].getData('text');
        } else {
            html = args.clipboardData.getData('text/html');
            text = args.clipboardData.getData('text/plain');
            ele.innerHTML = html;
        }
        if (ele.querySelector('table')) {
            if (ele.querySelector('.e-spreadsheet') && this.copiedInfo) {
                rows = { internal: true };
            } else {
                ele.querySelectorAll('tr').forEach((tr: Element) => {
                    tr.querySelectorAll('td').forEach((td: Element, j: number) => {
                        cellStyle = this.getStyle(td, ele);
                        td.textContent = td.textContent.replace(/(\r\n|\n|\r)/gm, '');
                        const cSpan: number = isNaN(parseInt(td.getAttribute('colspan'), 10)) ? 1 : parseInt(td.getAttribute('colspan'), 10);
                        const rSpan: number = isNaN(parseInt(td.getAttribute('rowspan'), 10)) ? 1 : parseInt(td.getAttribute('rowspan'), 10);
                        let wrap: boolean;
                        if ((cellStyle as { whiteSpace: string }).whiteSpace) {
                            wrap = true;
                            delete cellStyle['whiteSpace'];
                        }
                        cells[j] = {
                            value: td.textContent ? <string>parseIntValue(td.textContent.trim()) : null, style: cellStyle, colSpan: cSpan,
                            rowSpan: rSpan, wrap: wrap
                        };
                    });
                    (rows as RowModel[]).push({ cells: cells });
                    cells = [];
                });
            }
        } else if (text) {
            if (html) {
                [].slice.call(ele.children).forEach((child: Element) => {
                    if (child.getAttribute('style')) {
                        cellStyle = this.getStyle(child, ele);
                    }
                });
            }
            text.trim().split('\n').forEach((row: string) => {
                row.split('\t').forEach((col: string, j: number) => {
                    if (col) {
                        let wrap: boolean;
                        if (cellStyle && (cellStyle as { whiteSpace: string }).whiteSpace) {
                            wrap = true;
                            delete cellStyle['whiteSpace'];
                        }
                        cells[j] = { style: cellStyle, wrap: wrap };
                        if (checkIsFormula(col)) {
                            cells[j].formula = col;
                        } else {
                            cells[j].value = <string>parseIntValue(col.trim());
                        }
                    }
                });
                (rows as RowModel[]).push({ cells: cells });
                cells = [];
            });
        }
        setTimeout(() => { this.getClipboardEle().innerHTML = ''; }, 0);
        return rows;
    }

    private getStyle(td: Element, ele: Element): CellStyleModel {
        const styles: string[] = [];
        const cellStyle: CellStyleModel = {};
        const keys: string[] = Object.keys(this.parent.commonCellStyle);
        if (td.classList.length || td.getAttribute('style') || keys.length) {
            if (ele.querySelector('style') && td.classList.length) {
                if (ele.querySelector('style').innerHTML.indexOf(td.classList[0]) > -1) {
                    styles.push(ele.querySelector('style').innerHTML.split(td.classList[0])[1].split('{')[1].split('}')[0]);
                }
            }
            if (td.getAttribute('style')) {
                styles.push(td.getAttribute('style'));
                if (td.children && td.children.length) {
                    for (let i: number = 0, len: number = td.children.length; i < len; i++) {
                        if (td.children[i] && td.children[i].getAttribute('style')) {
                            styles.push(td.children[i].getAttribute('style'));
                            if ((td.children[i] as HTMLElement) && (td.children[i] as HTMLElement).children) {
                                for (let i: number = 0, len: number = (td.children[i] as HTMLElement).children.length; i < len; i++) {
                                    if (((td.children[i] as HTMLElement) && (td.children[i] as HTMLElement).children[i] as HTMLElement) &&
                                    ((td.children[i] as HTMLElement).children[i] as HTMLElement).getAttribute('style')) {
                                        styles.push(((td.children[i] as HTMLElement).children[i] as HTMLElement).getAttribute('style'));
                                    }
                                }
                            }
                        }
                    }
                }
            }
            if (keys.length) {
                if (ele.querySelector('style')) {
                    const tdStyle: string = ele.querySelector('style').innerHTML.split('td')[1].split('{')[1].split('}')[0];
                    for (let i: number = 0; i < keys.length; i++) {
                        let key: string = keys[i];
                        const regex: RegExpMatchArray = key.match(/[A-Z]/);
                        if (regex) {
                            key = key.replace(regex[0], '-' + regex[0].toLowerCase());
                        }
                        if (tdStyle.indexOf(key) > -1) {
                            cellStyle[keys[i]] = tdStyle.split(key + ':')[1].split(';')[0];
                        }
                    }
                }
            }
            styles.forEach((styles: string) => {
                styles.split(';').forEach((style: string) => {
                    let char: string = style.split(':')[0].trim();
                    if (['font-family', 'vertical-align', 'text-align', 'text-indent', 'color', 'background', 'font-weight', 'font-style',
                        'font-size', 'text-decoration', 'border-bottom', 'border-top', 'border-right', 'border-left',
                        'border', 'white-space'].indexOf(char) > -1) {
                        char = char === 'background' ? 'backgroundColor' : char;
                        const regex: RegExpMatchArray = char.match(/-[a-z]/);
                        const value: string = style.split(':')[1];
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
    }

    private defaultCellStyle(style: CellStyleModel): CellStyleModel { // for external clipboard
        const textDecoration: string[] = ['underline', 'line-through', 'underline line-through', 'none'];
        const textAlign: string[] = ['left', 'center', 'right'];
        const verticalAlign: string[] = ['bottom', 'middle', 'top'];
        let fontSize: string = style.fontSize ? style.fontSize.trim() : null;
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
            fontSize = (fontSize.indexOf('px') > - 1) ? (parseFloat(fontSize) * 0.75) + 'pt' : fontSize;
            style.fontSize = Math.round(parseFloat(fontSize)) + 'pt';
        }
        return style;
    }

    private getClipboardEle(): HTMLInputElement {
        return this.parent.element.getElementsByClassName('e-clipboard')[0] as HTMLInputElement;
    }

    protected getModuleName(): string {
        return 'clipboard';
    }

    public destroy(): void {
        this.removeEventListener();
        const ele: HTMLInputElement = this.getClipboardEle();
        detach(ele);
        this.parent = null;
    }
}

interface CopyArgs {
    range?: number[];
    sIdx?: number;
    isAction?: boolean;
}

interface SetClipboardInfo {
    range?: number[];
    sId?: number;
    isAction?: boolean;
    promise?: Promise<Object>;
}
