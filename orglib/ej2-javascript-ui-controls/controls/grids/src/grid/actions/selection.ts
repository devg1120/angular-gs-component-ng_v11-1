import { Browser, EventHandler, MouseEventArgs, createElement, isBlazor } from '@syncfusion/ej2-base';
import { isNullOrUndefined, isUndefined, addClass, removeClass } from '@syncfusion/ej2-base';
import { remove, closest, classList, select } from '@syncfusion/ej2-base';
import { Query } from '@syncfusion/ej2-data';
import {
    IGrid, IAction, IIndex, ISelectedCell, IPosition, IRenderer, EJ2Intance, NotifyArgs, CellFocusArgs,
    BeforeAutoFillEventArgs, RowDeselectEventArgs
} from '../base/interface';
import { SelectionSettings } from '../base/grid';
import { setCssInGridPopUp, getPosition, isGroupAdaptive, addRemoveActiveClasses, removeAddCboxClasses } from '../base/util';
import { getCellsByTableName, getCellByColAndRowIndex, parentsUntil, gridActionHandler } from '../base/util';
import * as events from '../base/constant';
import { RenderType, CheckState, freezeTable } from '../base/enum';
import { ServiceLocator } from '../services/service-locator';
import { RendererFactory } from '../services/renderer-factory';
import { Column } from '../models/column';
import { Row } from '../models/row';
import { Data } from '../actions/data';
import { ReturnType } from '../base/type';
import { FocusStrategy } from '../services/focus-strategy';
import { iterateExtend, setChecked } from '../base/util';
import { VirtualContentRenderer } from '../renderer/virtual-content-renderer';
import { VirtualFreezeRenderer } from '../renderer/virtual-freeze-renderer';
import { ColumnDeselectEventArgs, ColumnSelectEventArgs, ColumnSelectingEventArgs } from '../base/interface';
import { addRemoveEventListener } from '../base/util';
import * as literals from '../base/string-literals';

/**
* The `Selection` module is used to handle cell and row selection.
*/
export class Selection implements IAction {
    //Internal letiables       
    /**
     * @hidden
     */
    public selectedRowIndexes: number[] = [];
    /**
     * @hidden
     */
    public selectedRowCellIndexes: ISelectedCell[] = [];
    /**
     * @hidden
     */
    public selectedRecords: Element[] = [];
    /**
     * @hidden
     */
    public isRowSelected: boolean;
    /**
     * @hidden
     */
    public isCellSelected: boolean;
    /**
     * @hidden
     */
    public preventFocus: boolean = false;
    /**
     * @hidden
     */
    public prevRowIndex: number;
    /**
     *  @hidden
     */
    public selectedColumnsIndexes: number[] = [];
    public isColumnSelected: boolean;
    private prevColIndex: number;
    public checkBoxState: boolean = false;
    private selectionSettings: SelectionSettings;
    private prevCIdxs: IIndex;
    private prevECIdxs: IIndex;
    private selectedRowIndex: number;
    private isMultiShiftRequest: boolean = false;
    private isMultiCtrlRequest: boolean = false;
    private enableSelectMultiTouch: boolean = false;
    private clearRowCheck: boolean = false;
    private selectRowCheck: boolean = false;
    private element: HTMLElement;
    private autofill: HTMLElement;
    private isAutoFillSel: boolean;
    private startCell: Element;
    private endCell: Element;
    private startAFCell: Element;
    private endAFCell: Element;
    private startIndex: number;
    private startCellIndex: number;
    private startDIndex: number;
    private startDCellIndex: number;
    private currentIndex: number;
    private isDragged: boolean;
    private isCellDrag: boolean;
    private x: number;
    private y: number;
    private target: Element;
    private actualTarget: Element;
    private factory: RendererFactory;
    private contentRenderer: IRenderer;
    private checkedTarget: HTMLInputElement;
    private primaryKey: string;
    private chkField: string;
    private selectedRowState: { [key: number]: boolean } = {};
    private totalRecordsCount: number = 0;
    private chkAllCollec: Object[] = [];
    private isCheckedOnAdd: boolean = false;
    private persistSelectedData: Object[] = [];
    private onDataBoundFunction: Function;
    private actionBeginFunction: Function;
    private actionCompleteFunction: Function;
    private actionCompleteFunc: Function;
    private resizeEndFn: Function;
    private mUPTarget: Element;
    private bdrElement: HTMLElement;
    private selectDirection: string;
    private mcBdrElement: HTMLElement;
    private frcBdrElement: HTMLElement;
    private fhBdrElement: HTMLElement;
    private mhBdrElement: HTMLElement;
    private frhBdrElement: HTMLElement;
    private bdrAFLeft: HTMLElement;
    private bdrAFRight: HTMLElement;
    private bdrAFTop: HTMLElement;
    private bdrAFBottom: HTMLElement;
    /** @hidden */
    public isInteracted: boolean;
    private isHeaderCheckboxClicked: boolean;
    private checkSelectAllClicked: boolean;
    private isRowClicked: boolean;
    private needColumnSelection: boolean = false;
    /**
     * @hidden
     */
    public index: number;
    private toggle: boolean;
    private data: Object;
    private removed: boolean;
    //Module declarations
    private parent: IGrid;
    private focus: FocusStrategy;
    private isCancelDeSelect: boolean = false;
    private isPreventCellSelect: boolean = false;
    private disableUI: boolean = false;
    private isPersisted: boolean = false;
    private cmdKeyPressed: boolean = false;
    private isMacOS: boolean;
    private cellselected: boolean = false;
    private isMultiSelection: boolean = false;
    private isAddRowsToSelection: boolean = false;
    private initialRowSelection: boolean = false;
    private isPrevRowSelection: boolean = false;
    private evtHandlers: { event: string, handler: Function }[];
    /**
     * @hidden
     */
    public autoFillRLselection: boolean = true;
    private mouseButton: number;
    /**
     * Constructor for the Grid selection module
     * @hidden
     */
    constructor(parent?: IGrid, selectionSettings?: SelectionSettings, locator?: ServiceLocator) {
        this.parent = parent;
        this.selectionSettings = selectionSettings;
        this.factory = locator.getService<RendererFactory>('rendererFactory');
        this.focus = locator.getService<FocusStrategy>('focus');
        this.addEventListener();
        this.wireEvents();
    }

    private initializeSelection(): void {
        this.parent.log('selection_key_missing');
        this.render();
    }

    /**
     * The function used to trigger onActionBegin
     * @return {void}
     * @hidden
     */
    public onActionBegin(args: Object, type: string): void {
        this.parent.trigger(<string>type, this.fDataUpdate(args));
    }

    private fDataUpdate(args: { cellIndex?: IIndex, foreignKeyData?: Object, rowIndex?: number }): Object {
        if (!this.isMultiSelection && (!isNullOrUndefined(args.cellIndex) || !isNullOrUndefined(args.rowIndex))) {
            let rowObj: Row<Column> = this.getRowObj(isNullOrUndefined(args.rowIndex) ? isNullOrUndefined(args.cellIndex) ?
                this.currentIndex : args.cellIndex.rowIndex : args.rowIndex);
            args.foreignKeyData = rowObj.foreignKeyData;
        }
        return args;
    }

    /**
     * The function used to trigger onActionComplete
     * @return {void}
     * @hidden
     */
    public onActionComplete(args: Object, type: string): void {
        this.parent.trigger(<string>type, this.fDataUpdate(args));
        this.isMultiSelection = false;
    }

    /**
     * For internal use only - Get the module name.
     * @private
     */
    protected getModuleName(): string {
        return 'selection';
    }

    /**
     * To destroy the selection 
     * @return {void}
     * @hidden
     */
    public destroy(): void {
        let gridElement: Element = this.parent.element;
        if (!gridElement || (!gridElement.querySelector('.' + literals.gridHeader) && !gridElement.querySelector( '.' + literals.gridContent))) { return; }
        this.hidePopUp();
        this.clearSelection();
        this.removeEventListener();
        this.unWireEvents();
        EventHandler.remove(this.parent.getContent(), 'mousedown', this.mouseDownHandler);
        EventHandler.remove(this.parent.getHeaderContent(), 'mousedown', this.mouseDownHandler);
    }

    private isEditing(): boolean {
        return (this.parent.editSettings.mode === 'Normal' || (this.parent.editSettings.mode === 'Batch' && this.parent.editModule &&
            this.parent.editModule.formObj && !this.parent.editModule.formObj.validate())) &&
            this.parent.isEdit && !this.parent.isPersistSelection;
    }

    private getSelectedMovableRow(index: number): Element {
        let gObj: IGrid = this.parent;
        if (gObj.isFrozenGrid() && this.parent.getContent().querySelector('.' + literals.movableContent)) {
            return gObj.getMovableRowByIndex(index);
        }
        return null;
    }

    private getSelectedFrozenRightRow(index: number): Element {
        let gObj: IGrid = this.parent;
        if (gObj.isFrozenGrid() && gObj.getFrozenMode() === literals.leftRight && gObj.getFrozenRightContent()) {
            return gObj.getFrozenRightRowByIndex(index);
        }
        return null;
    }

    public getCurrentBatchRecordChanges(): Object[] {
        let gObj: IGrid = this.parent;
        if (gObj.editSettings.mode === 'Batch' && gObj.editModule) {
            let currentRecords: Object[] = iterateExtend(this.parent.getCurrentViewRecords());
            currentRecords = gObj.editSettings.newRowPosition === 'Bottom' ?
                currentRecords.concat(this.parent.editModule.getBatchChanges()[literals.addedRecords]) :
                this.parent.editModule.getBatchChanges()[literals.addedRecords].concat(currentRecords);
            let deletedRecords: Object[] = this.parent.editModule.getBatchChanges()[literals.deletedRecords];
            let primaryKey: string = this.parent.getPrimaryKeyFieldNames()[0];
            for (let i: number = 0; i < (deletedRecords.length); i++) {
                for (let j: number = 0; j < currentRecords.length; j++) {
                    if (deletedRecords[i][primaryKey] === currentRecords[j][primaryKey]) {
                        currentRecords.splice(j, 1);
                        break;
                    }
                }
            }
            return currentRecords;
        } else {
            return gObj.getCurrentViewRecords();
        }
    }

    /** 
     * Selects a row by the given index. 
     * @param  {number} index - Defines the row index. 
     * @param  {boolean} isToggle - If set to true, then it toggles the selection.
     * @return {void} 
     */
    public selectRow(index: number, isToggle?: boolean): void {
        if (this.selectedRowIndexes.length && this.selectionSettings.enableSimpleMultiRowSelection) {
            this.addRowsToSelection([index]);
            return;
        }
        let gObj: IGrid = this.parent;
        let selectedRow: Element = gObj.getRowByIndex(index);
        let selectedMovableRow: Element = this.getSelectedMovableRow(index);
        let selectedFrozenRightRow: Element = this.getSelectedFrozenRightRow(index);
        let selectData: Object;
        let isRemoved: boolean = false;
        if (gObj.enableVirtualization && index > -1) {
            this.parent.notify(events.selectVirtualRow, { selectedIndex: index });
            let frozenData: Object = gObj.isFrozenGrid() ? (gObj.contentModule as VirtualFreezeRenderer).getRowObjectByIndex(index)
                : null;
            if (selectedRow && (gObj.getRowObjectFromUID(selectedRow.getAttribute('data-uid')) || frozenData)) {
                selectData = frozenData ? frozenData : gObj.getRowObjectFromUID(selectedRow.getAttribute('data-uid')).data;
            } else {
                let prevSelectedData: Object[] = this.parent.getSelectedRecords();
                if (prevSelectedData.length > 0) {
                    this.clearRowSelection();
                }
                return;
            }
        } else {
           selectData = this.getCurrentBatchRecordChanges()[index];
        }
        if (!this.isRowType() || !selectedRow || this.isEditing()) {
            // if (this.isEditing()) {
            //     gObj.selectedRowIndex = index;
            // }
            return;
        }
        let isRowSelected: boolean = selectedRow.hasAttribute('aria-selected');
        this.activeTarget();
        isToggle = !isToggle ? isToggle :
            !this.selectedRowIndexes.length ? false :
                (this.selectedRowIndexes.length === 1 ? (index === this.selectedRowIndexes[0]) : false);
        let args: Object;
        let can: string = 'cancel';
        if (!isToggle) {
            args = {
                data: selectData, rowIndex: index, isCtrlPressed: this.isMultiCtrlRequest,
                isShiftPressed: this.isMultiShiftRequest, row: selectedRow,
                previousRow: gObj.getRowByIndex(this.prevRowIndex),
                previousRowIndex: this.prevRowIndex, target: this.actualTarget, cancel: false, isInteracted: this.isInteracted,
                isHeaderCheckboxClicked: this.isHeaderCheckboxClicked
            };
            args = this.addMovableArgs(args, selectedMovableRow, selectedFrozenRightRow);
            this.parent.trigger(events.rowSelecting, this.fDataUpdate(args),
                this.rowSelectingCallBack(args, isToggle, index, selectData, isRemoved, isRowSelected, can));
        } else {
            this.rowSelectingCallBack(args, isToggle, index, selectData, isRemoved, isRowSelected, can)(args);
        }
    }

    private rowSelectingCallBack(args: Object, isToggle: boolean, index: number, selectData: object, isRemoved: boolean,
                                 isRowSelected: boolean, can: string): Function {
        return (args: Object) => {
            if (!isNullOrUndefined(args) && args[can] === true) {
                this.disableInteracted();
                return;
            }
            this.index = index;  this.toggle =  isToggle; this.data =  selectData; this.removed = isRemoved;
            if (isRowSelected && this.selectionSettings.persistSelection && !(this.selectionSettings.checkboxMode === 'ResetOnRowClick')) {
                this.clearSelectedRow(index);
                this.selectRowCallBack();
            } else if (!isRowSelected && this.selectionSettings.persistSelection &&
                this.selectionSettings.checkboxMode !== 'ResetOnRowClick') {
                this.selectRowCallBack();
            }
            if (this.selectionSettings.checkboxMode === 'ResetOnRowClick') {
                this.clearSelection();
            }
            if (!this.selectionSettings.persistSelection || this.selectionSettings.checkboxMode === 'ResetOnRowClick' ||
                (!this.parent.isCheckBoxSelection && this.selectionSettings.persistSelection)) {
                this.selectRowCheck = true;
                this.clearRow();
            }
        };
    }

    private selectRowCallBack(): void  {
        let gObj: IGrid =  this.parent;
        let args: Object;
        let index: number = this.index;
        let isToggle: boolean = this.toggle;
        let selectData: Object = this.data;
        let isRemoved: boolean = this.removed;
        let selectedRow: Element = gObj.getRowByIndex(index);
        let selectedMovableRow: Element = this.getSelectedMovableRow(index);
        let selectedFrozenRightRow: Element = this.getSelectedFrozenRightRow(index);
        if (!isToggle && !isRemoved) {
            if (this.selectedRowIndexes.indexOf(index) <= -1) {
                this.updateRowSelection(selectedRow, index);
                this.selectMovableRow(selectedMovableRow, selectedFrozenRightRow, index);
            }
            this.selectRowIndex(index);
        }
        if (!isToggle) {
                args = {
                    data: selectData, rowIndex: index,
                    row: selectedRow, previousRow: gObj.getRowByIndex(this.prevRowIndex),
                    previousRowIndex: this.prevRowIndex, target: this.actualTarget, isInteracted: this.isInteracted,
                    isHeaderCheckBoxClicked: this.isHeaderCheckboxClicked
                };
                args = this.addMovableArgs(args, selectedMovableRow, selectedFrozenRightRow);
            this.onActionComplete(args, events.rowSelected);
        }
        this.isInteracted = false;
        this.updateRowProps(index);
    }

    private selectMovableRow(selectedMovableRow: Element, selectedFrozenRightRow: Element, index: number): void {
        if (this.parent.isFrozenGrid()) {
            this.updateRowSelection(selectedMovableRow, index);
            if (this.parent.getFrozenMode() === literals.leftRight && selectedFrozenRightRow) {
                this.updateRowSelection(selectedFrozenRightRow, index);
            }
        }
    }

    private addMovableArgs(targetObj: Object, mRow: Element, frRow: Element): Object {
        if (this.parent.isFrozenGrid()) {
            let mObj: Object = { mRow: mRow, previousMovRow: this.parent.getMovableRows()[this.prevRowIndex] };
            let frozenRightRow: string = 'frozenRightRow'; let previousFrozenRightRow: string = 'previousFrozenRightRow';
            if (this.parent.getFrozenMode() === literals.leftRight && frRow) {
                mObj[frozenRightRow] = frRow;
                mObj[previousFrozenRightRow] = this.parent.getFrozenRightDataRows()[this.prevRowIndex];
            }
            targetObj = { ...targetObj, ...mObj };
        }
        return targetObj;
    }

    /** 
     * Selects a range of rows from start and end row indexes. 
     * @param  {number} startIndex - Specifies the start row index. 
     * @param  {number} endIndex - Specifies the end row index. 
     * @return {void} 
     */
    public selectRowsByRange(startIndex: number, endIndex?: number): void {
        this.selectRows(this.getCollectionFromIndexes(startIndex, endIndex));
        this.selectRowIndex(endIndex);
    }

    /** 
     * Selects a collection of rows by index. 
     * @param  {number[]} rowIndexes - Specifies an array of row indexes.
     * @return {void} 
     */
    public selectRows(rowIndexes: number[]): void {
        let gObj: IGrid = this.parent;
        let rowIndex: number = !this.isSingleSel() ? rowIndexes[0] : rowIndexes[rowIndexes.length - 1];
        this.isMultiSelection = true;
        let selectedRows: Element[] = [];
        let foreignKeyData: Object[] = [];
        let selectedMovableRow: Element = this.getSelectedMovableRow(rowIndex);
        let selectedFrozenRightRow: Element = this.getSelectedFrozenRightRow(rowIndex);
        let can: string = 'cancel';
        let selectedData: Object[] = [];
        if (!this.isRowType() || this.isEditing()) {
            return;
        }
        for (let i: number = 0, len: number = rowIndexes.length; i < len; i++) {
            let currentRow: Element = this.parent.getDataRows()[rowIndexes[i]];
            let rowObj: Row<Column> = this.getRowObj(currentRow);
            if (rowObj) {
                selectedData.push(rowObj.data);
                selectedRows.push(currentRow);
                foreignKeyData.push(rowObj.foreignKeyData);
            }
        }
        let isHybrid: string = 'isHybrid';
        this.activeTarget();
        let args: Object;
        if (!isBlazor() || this.parent.isJsComponent || this.parent[isHybrid]) {
            args = {
                cancel: false,
                rowIndexes: rowIndexes, row: selectedRows, rowIndex: rowIndex, target: this.actualTarget,
                prevRow: gObj.getRows()[this.prevRowIndex], previousRowIndex: this.prevRowIndex,
                isInteracted: this.isInteracted, isCtrlPressed: this.isMultiCtrlRequest, isShiftPressed: this.isMultiShiftRequest,
                data: selectedData, isHeaderCheckboxClicked: this.isHeaderCheckboxClicked, foreignKeyData: foreignKeyData
            };
            args = this.addMovableArgs(args, selectedMovableRow, selectedFrozenRightRow);
        } else {
            args  = {
                cancel: false,
                rowIndexes: rowIndexes, rowIndex: rowIndex, previousRowIndex: this.prevRowIndex,
                isCtrlPressed: this.isMultiCtrlRequest, isShiftPressed: this.isMultiShiftRequest,
                data: selectedData, isHeaderCheckboxClicked: this.isHeaderCheckboxClicked, foreignKeyData: foreignKeyData
            };
        }
        this.parent.trigger(events.rowSelecting, this.fDataUpdate(args), (args: Object) => {
            if (!isNullOrUndefined(args) && args[can] === true) {
                this.disableInteracted();
                return;
            }
            this.clearRow();
            this.selectRowIndex(rowIndexes.slice(-1)[0]);
            let selectRowFn: Function = (index: number) => {
                this.updateRowSelection(gObj.getRowByIndex(index), index);
                if (gObj.isFrozenGrid()) {
                    let rightEle: Element = this.parent.getFrozenMode() === literals.leftRight ? gObj.getFrozenRightRowByIndex(index)
                        : undefined;
                   this.selectMovableRow(gObj.getMovableRowByIndex(index), rightEle, index);
                }
                this.updateRowProps(rowIndex);
            };
            if (!this.isSingleSel()) {
                for (let rowIdx of rowIndexes) {
                    selectRowFn(rowIdx);
                }
            } else {
                selectRowFn(rowIndex);
            }
            let isHybrid: string = 'isHybrid';
            if (!isBlazor() || this.parent.isJsComponent || this.parent[isHybrid]) {
                args = {
                    rowIndexes: rowIndexes, row: selectedRows, rowIndex: rowIndex, target: this.actualTarget,
                    prevRow: gObj.getRows()[this.prevRowIndex], previousRowIndex: this.prevRowIndex,
                    data: this.getSelectedRecords(), isInteracted: this.isInteracted,
                    isHeaderCheckboxClicked: this.isHeaderCheckboxClicked, foreignKeyData: foreignKeyData
                };
                args = this.addMovableArgs(args, selectedMovableRow, selectedFrozenRightRow);
            } else {
                args = {
                    rowIndexes: rowIndexes, rowIndex: rowIndex, previousRowIndex: this.prevRowIndex,
                    row: selectedRows, prevRow: gObj.getRows()[this.prevRowIndex],
                    data: this.getSelectedRecords(), isInteracted: this.isInteracted,
                    isHeaderCheckboxClicked: this.isHeaderCheckboxClicked, foreignKeyData: foreignKeyData
                };
            }
            if (this.isRowSelected) {
                this.onActionComplete(args, events.rowSelected);
            }
            this.isInteracted = false;
        });
    }

    /** 
     * Select rows with existing row selection by passing row indexes. 
     * @param  {number} startIndex - Specifies the row indexes. 
     * @return {void} 
     * @hidden
     */
    // tslint:disable-next-line:max-func-body-length
    public addRowsToSelection(rowIndexes: number[]): void {
        let gObj: IGrid = this.parent;
        let can: string = 'cancel';
        let target: Element = this.target;
        this.isMultiSelection = true;
        let indexes: number[] = gObj.getSelectedRowIndexes().concat(rowIndexes);
        let selectedRow: Element = !this.isSingleSel() ? gObj.getRowByIndex(rowIndexes[0]) :
            gObj.getRowByIndex(rowIndexes[rowIndexes.length - 1]);
        let selectedMovableRow: Element = !this.isSingleSel() ? this.getSelectedMovableRow(rowIndexes[0]) :
            this.getSelectedMovableRow(rowIndexes[rowIndexes.length - 1]);
        let selectedFrozenRightRow: Element = !this.isSingleSel() ? this.getSelectedFrozenRightRow(rowIndexes[0]) :
            this.getSelectedFrozenRightRow(rowIndexes[rowIndexes.length - 1]);
        if ((!this.isRowType() || this.isEditing()) && !this.selectionSettings.checkboxOnly) {
            return;
        }
        let args: Object;
        let checkboxColumn: Column[] = this.parent.getColumns().filter((col: Column) => col.type === 'checkbox');
        for (let rowIndex of rowIndexes) {
            let rowObj: Row<Column> = this.getRowObj(rowIndex);
            let isUnSelected: boolean = this.selectedRowIndexes.indexOf(rowIndex) > -1;
            this.selectRowIndex(rowIndex);
            if (isUnSelected && ((checkboxColumn.length ? true : this.selectionSettings.enableToggle) || this.isMultiCtrlRequest)) {
                this.isAddRowsToSelection = true;
                this.rowDeselect(events.rowDeselecting, [rowIndex], [rowObj.data], [selectedRow], [rowObj.foreignKeyData], target);
                if (this.isCancelDeSelect) {
                    return;
                }
                this.selectedRowIndexes.splice(this.selectedRowIndexes.indexOf(rowIndex), 1);
                this.selectedRecords.splice(this.selectedRecords.indexOf(selectedRow), 1);
                this.selectRowIndex(this.selectedRowIndexes.length ? this.selectedRowIndexes[this.selectedRowIndexes.length-1] : -1);
                selectedRow.removeAttribute('aria-selected');
                this.addRemoveClassesForRow(selectedRow, false, null, 'e-selectionbackground', 'e-active');
                if (selectedMovableRow) {
                    this.selectedRecords.splice(this.selectedRecords.indexOf(selectedMovableRow), 1);
                    selectedMovableRow.removeAttribute('aria-selected');
                    this.addRemoveClassesForRow(selectedMovableRow, false, null, 'e-selectionbackground', 'e-active');
                }
                if (selectedFrozenRightRow) {
                    this.selectedRecords.splice(this.selectedRecords.indexOf(selectedFrozenRightRow), 1);
                    selectedFrozenRightRow.removeAttribute('aria-selected');
                    this.addRemoveClassesForRow(selectedFrozenRightRow, false, null, 'e-selectionbackground', 'e-active');
                }
                this.rowDeselect(
                    events.rowDeselected, [rowIndex], [rowObj.data], [selectedRow], [rowObj.foreignKeyData], target, [selectedMovableRow],
                    undefined, [selectedFrozenRightRow]
                );
                this.isInteracted = false;
                this.isMultiSelection = false;
                this.isAddRowsToSelection = false;
            } else {
                let isHybrid: string = 'isHybrid';
                this.activeTarget();
                if (!isBlazor() || this.parent.isJsComponent || this.parent[isHybrid]) {
                    args = {
                        cancel: false,
                        data: rowObj.data, rowIndex: rowIndex, row: selectedRow, target: this.actualTarget,
                        prevRow: gObj.getRows()[this.prevRowIndex], previousRowIndex: this.prevRowIndex,
                        isCtrlPressed: this.isMultiCtrlRequest, isShiftPressed: this.isMultiShiftRequest,
                        foreignKeyData: rowObj.foreignKeyData, isInteracted: this.isInteracted,
                        isHeaderCheckboxClicked: this.isHeaderCheckboxClicked, rowIndexes: indexes
                    };
                    args = this.addMovableArgs(args, selectedMovableRow, selectedFrozenRightRow);
                } else {
                    args = {
                        cancel: false,
                        data: rowObj.data, rowIndex: rowIndex, previousRowIndex: this.prevRowIndex,
                        isCtrlPressed: this.isMultiCtrlRequest, isShiftPressed: this.isMultiShiftRequest,
                        foreignKeyData: rowObj.foreignKeyData, isInteracted: this.isInteracted,
                        isHeaderCheckboxClicked: this.isHeaderCheckboxClicked, rowIndexes: indexes
                    };
                }
                this.parent.trigger(events.rowSelecting, this.fDataUpdate(args));
                if (!isNullOrUndefined(args) && args[can] === true) {
                    this.disableInteracted();
                    return;
                }
                if (this.isSingleSel()) {
                    this.clearRow();
                }
                this.updateRowSelection(selectedRow, rowIndex);
                this.selectMovableRow(selectedMovableRow, selectedFrozenRightRow, rowIndex);
            }
            if (!isUnSelected) {
                let isHybrid: string = 'isHybrid';
                if (!isBlazor() || this.parent.isJsComponent || this.parent[isHybrid]) {
                    args = {
                        data: rowObj.data, rowIndex: rowIndex, row: selectedRow, target: this.actualTarget,
                        prevRow: gObj.getRows()[this.prevRowIndex], previousRowIndex: this.prevRowIndex,
                        foreignKeyData: rowObj.foreignKeyData, isInteracted: this.isInteracted,
                        isHeaderCheckboxClicked: this.isHeaderCheckboxClicked, rowIndexes: indexes
                    };
                    args = this.addMovableArgs(args, selectedMovableRow, selectedFrozenRightRow);
                } else {
                    args = {
                        data: rowObj.data, rowIndex: rowIndex, previousRowIndex: this.prevRowIndex,
                        row: selectedRow, prevRow: gObj.getRows()[this.prevRowIndex],
                        foreignKeyData: rowObj.foreignKeyData, isInteracted: this.isInteracted,
                        isHeaderCheckboxClicked: this.isHeaderCheckboxClicked, rowIndexes: indexes
                    };
                }
                this.onActionComplete(args, events.rowSelected);
            }
            this.isInteracted = false;
            this.updateRowProps(rowIndex);
            if (this.isSingleSel()) {
                break;
            }
        }
    }

    private getCollectionFromIndexes(startIndex: number, endIndex: number): number[] {
        let indexes: number[] = [];
        let { i, max }: { i: number, max: number } = (startIndex <= endIndex) ?
            { i: startIndex, max: endIndex } : { i: endIndex, max: startIndex };
        for (; i <= max; i++) {
            indexes.push(i);
        }
        if (startIndex > endIndex) {
            indexes.reverse();
        }
        return indexes;
    }

    private clearRow(): void {
        this.clearRowCheck = true;
        this.clearRowSelection();
    }

    private clearRowCallBack(): void  {
        if (this.isCancelDeSelect && this.parent.checkAllRows !== 'Check') {
            return;
        }
        this.selectedRowIndexes = [];
        this.selectedRecords = [];
        this.selectRowIndex(-1);
        if (this.isSingleSel() && this.parent.isPersistSelection) {
            this.selectedRowState = {};
        }
    }

    private clearSelectedRow(index: number): void {
        if (this.toggle) {
            let selectedEle: Element = this.parent.getRowByIndex(index);
            if (!this.disableUI) {
                selectedEle.removeAttribute('aria-selected');
                this.addRemoveClassesForRow(selectedEle, false, true, 'e-selectionbackground', 'e-active');
            }
            this.removed = true;
            this.updatePersistCollection(selectedEle, false);
            this.updateCheckBoxes(selectedEle);
            this.selectedRowIndexes.splice(this.selectedRowIndexes.indexOf(index), 1);
            this.selectedRecords.splice(this.selectedRecords.indexOf(this.parent.getRowByIndex(index)), 1);
        }
    }


    private updateRowProps(startIndex: number): void {
        this.prevRowIndex = startIndex;
        this.isRowSelected = this.selectedRowIndexes.length && true;
    }

    private updatePersistCollection(selectedRow: Element, chkState: boolean): void {
        if ((this.parent.isPersistSelection || this.parent.selectionSettings.persistSelection &&
            this.parent.getPrimaryKeyFieldNames().length > 0) && !isNullOrUndefined(selectedRow)) {
            if (!this.parent.isPersistSelection) {
                this.ensureCheckboxFieldSelection();
            }
            let rowObj: Row<Column> = this.getRowObj(selectedRow);
            let pKey: string = rowObj.data ? rowObj.data[this.primaryKey] : null;
            if (pKey === null) { return; }
            rowObj.isSelected = chkState;
            if (chkState) {
                this.selectedRowState[pKey] = chkState;
                if (!this.persistSelectedData.some((data: Object) => data[this.primaryKey] === pKey)) {
                    this.persistSelectedData.push(rowObj.data);
                }
            } else {
                this.updatePersistDelete(pKey);
            }
        }
    }

    private updatePersistDelete(pKey: string): void {
        delete (this.selectedRowState[pKey]);
        let index: number;
        let isPresent: boolean = this.persistSelectedData.some((data: Object, i: number) => {
            index = i;
            return data[this.primaryKey] === pKey;
        });
        if (isPresent) {
            this.persistSelectedData.splice(index, 1);
        }
    }
    private updateCheckBoxes(row: Element, chkState?: boolean, rowIndex?: number): void {
        if (!isNullOrUndefined(row)) {
            let chkBox: HTMLInputElement = row.querySelector('.e-checkselect') as HTMLInputElement;
            if (!isNullOrUndefined(chkBox)) {
                removeAddCboxClasses(chkBox.nextElementSibling as HTMLElement, chkState);
                setChecked(chkBox, chkState);
                if (isNullOrUndefined(this.checkedTarget) || (!isNullOrUndefined(this.checkedTarget)
                    && !this.checkedTarget.classList.contains('e-checkselectall'))) {
                    this.setCheckAllState(rowIndex);
                }
            }
        }
    }

    private updateRowSelection(selectedRow: Element, startIndex: number): void {
        if (!selectedRow) {
            return;
        }
        this.selectedRowIndexes.push(startIndex);
        let len: number = this.selectedRowIndexes.length;
        if (this.parent.isFrozenGrid() && len > 1) {
            if ((this.selectedRowIndexes[len - 2] === this.selectedRowIndexes[len - 1])) {
                this.selectedRowIndexes.pop();
            }
        }
        this.selectedRecords.push(selectedRow);
        selectedRow.setAttribute('aria-selected', 'true');
        this.updatePersistCollection(selectedRow, true);
        this.updateCheckBoxes(selectedRow, true);
        this.addRemoveClassesForRow(selectedRow, true, null, 'e-selectionbackground', 'e-active');
        if (!this.preventFocus) {
            let target: Element = this.focus.getPrevIndexes().cellIndex ?
                (<HTMLTableRowElement>selectedRow).cells[this.focus.getPrevIndexes().cellIndex] :
                selectedRow.querySelector('.e-selectionbackground:not(.e-hide):not(.e-detailrowcollapse):not(.e-detailrowexpand)');
            if (this.parent.contextMenuModule && this.mouseButton === 2) {
                target = this.parent.contextMenuModule.cell;
            }
            if (!target) { return; }
            this.focus.onClick({ target }, true);
        }
    }

    /** 
     * Deselects the currently selected rows and cells.
     * @return {void} 
     */
    public clearSelection(): void {
        if (!this.parent.isPersistSelection || (this.parent.isPersistSelection && !this.parent.isEdit) ||
            (!isNullOrUndefined(this.checkedTarget) && this.checkedTarget.classList.contains('e-checkselectall'))) {
            let span: Element = this.parent.element.querySelector('.e-gridpopup').querySelector('span');
            if (span.classList.contains('e-rowselect')) {
                span.classList.remove('e-spanclicked');
            }
            if (this.parent.isPersistSelection) {
                this.persistSelectedData = [];
                this.selectedRowState = {};
            }
            this.clearRowSelection();
            this.clearCellSelection();
            this.clearColumnSelection();
            this.prevRowIndex = undefined;
            this.enableSelectMultiTouch = false;
            this.isInteracted = false;
        }
    }

    /** 
     * Deselects the currently selected rows.
     * @return {void} 
     */
    // tslint:disable-next-line:max-func-body-length
    public clearRowSelection(): void {
        if (this.isRowSelected) {
            let gObj: IGrid = this.parent;
            let rows: Element[] = this.parent.getDataRows();
            let data: Object[] = [];
            let row: Element[] = [];
            let mRow: Element[] = [];
            let fRightRow: Element[] = [];
            let rowIndex: number[] = [];
            let foreignKeyData: Object[] = [];
            let target: Element = this.target;

            for (let i: number = 0, len: number = this.selectedRowIndexes.length; i < len; i++) {
                let currentRow: Element = this.parent.editSettings.mode === 'Batch' ?
                    this.parent.getRows()[this.selectedRowIndexes[i]]
                    : this.parent.getDataRows()[this.selectedRowIndexes[i]];
                let rowObj: Row<Column> = this.getRowObj(currentRow);
                if (rowObj) {
                    data.push(rowObj.data);
                    row.push(currentRow);
                    rowIndex.push(this.selectedRowIndexes[i]);
                    foreignKeyData.push(rowObj.foreignKeyData);
                }
                if (gObj.isFrozenGrid()) {
                    mRow.push(gObj.getMovableRows()[this.selectedRowIndexes[i]]);
                    if (gObj.getFrozenMode() === literals.leftRight) {
                        fRightRow.push(gObj.getFrozenRightRows()[this.selectedRowIndexes[i]]);
                    }
                }
            }
            if (this.selectionSettings.persistSelection && this.selectionSettings.checkboxMode !== 'ResetOnRowClick') {
                this.isRowClicked = this.checkSelectAllClicked ? true : false;
            }
            this.rowDeselect(events.rowDeselecting, rowIndex, data, row, foreignKeyData, target, mRow,
                () => {
                    if (this.isCancelDeSelect && (this.isRowClicked || this.checkSelectAllClicked || (this.isInteracted &&
                        !this.parent.isPersistSelection))) {
                        if (this.parent.isPersistSelection) {
                            if (this.getCheckAllStatus(this.parent.element.querySelector('.e-checkselectall')) === 'Intermediate') {
                                for (let i: number = 0; i < this.selectedRecords.length; i++) {
                                    this.updatePersistCollection(this.selectedRecords[i], true);
                                }
                            } else {
                                this.parent.checkAllRows = 'Check';
                                this.updatePersistSelectedData(true);
                            }
                        }
                        if (this.clearRowCheck) {
                            this.clearRowCallBack();
                            this.clearRowCheck = false;
                            if (this.selectRowCheck) {
                                this.selectRowCallBack();
                                this.selectRowCheck = false;
                            }
                        }
                        return;
                    }
                    let element: HTMLElement[] = [].slice.call(rows.filter((record: HTMLElement) => record.hasAttribute('aria-selected')));
                    for (let j: number = 0; j < element.length; j++) {
                        if (!this.disableUI || isBlazor()) {
                            element[j].removeAttribute('aria-selected');
                            this.addRemoveClassesForRow(element[j], false, true, 'e-selectionbackground', 'e-active');
                        }
                        // tslint:disable-next-line:align
                        if (!this.isPrevRowSelection) {
                            this.updatePersistCollection(element[j], false);
                        }
                        this.updateCheckBoxes(element[j]);
                    }
                    for (let i: number = 0, len: number = this.selectedRowIndexes.length; i < len; i++) {
                        let movableRow: Element = this.getSelectedMovableRow(this.selectedRowIndexes[i]);
                        if (movableRow) {
                            if (!this.disableUI || isBlazor()) {
                                movableRow.removeAttribute('aria-selected');
                                this.addRemoveClassesForRow(movableRow, false, true, 'e-selectionbackground', 'e-active');
                            }
                            this.updateCheckBoxes(movableRow);
                            if (!this.isPrevRowSelection) {
                                this.updatePersistCollection(movableRow, false);
                            }
                        }
                        let frRow: Element = this.getSelectedFrozenRightRow(this.selectedRowIndexes[i]);
                        if (frRow) {
                            if (!this.disableUI) {
                                frRow.removeAttribute('aria-selected');
                                this.addRemoveClassesForRow(frRow, false, true, 'e-selectionbackground', 'e-active');
                            }
                            this.updateCheckBoxes(frRow);
                            if (!this.isPrevRowSelection) {
                                this.updatePersistCollection(frRow, false);
                            }
                        }
                    }
                    this.selectedRowIndexes = [];
                    this.selectedRecords = [];
                    this.isRowSelected = false;
                    this.selectRowIndex(-1);
                    this.isPrevRowSelection = false;
                    this.rowDeselect(events.rowDeselected, rowIndex, data, row, foreignKeyData, target, mRow, undefined, fRightRow);
                    if (this.clearRowCheck) {
                        this.clearRowCallBack();
                        this.clearRowCheck = false;
                        if (this.selectRowCheck) {
                            this.selectRowCallBack();
                            this.selectRowCheck = false;
                        }
                    }
                },
                fRightRow
            );
        } else {
            if (this.clearRowCheck) {
                this.clearRowCallBack();
                this.clearRowCheck = false;
                if (this.selectRowCheck) {
                    this.selectRowCallBack();
                    this.selectRowCheck = false;
                }
            }
        }
    }

    private rowDeselect(
        type: string, rowIndex: number[], data: Object, row: Element[],
        foreignKeyData: Object[], target: Element, mRow?: Element[], rowDeselectCallBack?: Function, frozenRightRow?: Element[]): void {
        if ((this.selectionSettings.persistSelection && (this.isRowClicked || this.checkSelectAllClicked)) ||
            !this.selectionSettings.persistSelection) {
            let cancl: string = 'cancel';
            let deSelectedData: object[] = [];
            let currentRow: Element[] = this.parent.getDataRows();
            for (let i: number = 0, len: number = rowIndex.length; i < len; i++) {
                let rowObj: Row<Column> = this.getRowObj(currentRow[rowIndex[i]]);
                if (rowObj) {
                    deSelectedData.push(rowObj.data);
                }
            }
            let rowDeselectObj: RowDeselectEventArgs = {
                rowIndex: rowIndex[0], data: this.selectionSettings.persistSelection && this.parent.checkAllRows === 'Uncheck'
                && this.selectionSettings.checkboxMode !== 'ResetOnRowClick' ? deSelectedData : data, foreignKeyData: foreignKeyData,
                cancel: false, isInteracted: this.isInteracted, isHeaderCheckboxClicked: this.isHeaderCheckboxClicked
            };
            if (type === 'rowDeselected') {
                delete rowDeselectObj.cancel;
            }
            let isHybrid: string = 'isHybrid';
            if (!isBlazor() || this.parent.isJsComponent || this.parent[isHybrid]) {
                let rowInString: string = 'row';
                let target: string = 'target';
                let rowidx: string = 'rowIndex';
                let rowidxex: string = 'rowIndexes';
                let data: string = 'data';
                let foreignKey: string = 'foreignKeyData';
                rowDeselectObj[rowInString] = row;
                rowDeselectObj[target] = this.actualTarget;
                let isHeaderCheckBxClick: boolean = this.actualTarget && !isNullOrUndefined(closest(this.actualTarget, 'thead'));
                if (isHeaderCheckBxClick || rowIndex.length > 1) {
                    rowDeselectObj[rowidx] = rowIndex[0];
                    rowDeselectObj[rowidxex] = rowIndex;
                } else if (rowIndex.length === 1) {
                    rowDeselectObj[data] = rowDeselectObj[data][0];
                    rowDeselectObj[rowInString] = rowDeselectObj[rowInString][0];
                    rowDeselectObj[foreignKey] = rowDeselectObj[foreignKey][0];
                    if (this.isAddRowsToSelection) {
                        rowDeselectObj[rowidxex] = rowIndex;
                    }
                }
            } else {
                let rowIndex: string = 'rowIndex';
                let data: string = 'data';
                rowDeselectObj[rowIndex] = rowDeselectObj[rowIndex][rowDeselectObj[rowIndex].length - 1];
                rowDeselectObj[data] = rowDeselectObj[data][rowDeselectObj[data].length - 1];
            }
            this.parent.trigger(
                type, (!isBlazor() || this.parent.isJsComponent) && this.parent.isFrozenGrid() ?
                { ...rowDeselectObj, ...{ mRow: mRow, frozenRightRow: frozenRightRow } } : rowDeselectObj,
                (args: Object) => {
                    this.isCancelDeSelect = args[cancl];
                    if (!this.isCancelDeSelect || (!this.isRowClicked && !this.isInteracted && !this.checkSelectAllClicked)) {
                        this.updatePersistCollection(row[0], false);
                        this.updateCheckBoxes(row[0], undefined, rowIndex[0]);
                        if (mRow) {
                            this.updateCheckBoxes(mRow[0], undefined, rowIndex[0]);
                        }
                        if (frozenRightRow) {
                            this.updateCheckBoxes(frozenRightRow[0], undefined, rowIndex[0]);
                        }
                    }
                    if (rowDeselectCallBack !== undefined) {
                        rowDeselectCallBack();
                    }
                });
        } else if (this.selectionSettings.persistSelection && !this.isInteracted) {
            if (rowDeselectCallBack !== undefined) {
                rowDeselectCallBack();
            }
        }
    }

    private getRowObj(row: Element | number = this.currentIndex): Row<Column> {
        if (isNullOrUndefined(row)) { return {} as Row<Column>; }
        if (typeof row === 'number') {
            row = this.parent.getRowByIndex(row);
        }
        if (row) {
            return this.parent.getRowObjectFromUID(row.getAttribute('data-uid')) || {} as Row<Column>;
        }
        return {} as Row<Column>;
    }

    private getSelectedMovableCell(cellIndex: IIndex): Element {
        let gObj: IGrid = this.parent;
        let col: Column = gObj.getColumnByIndex(cellIndex.cellIndex);
        let frzCols: boolean = gObj.isFrozenGrid();
        if (frzCols) {
            if (col.getFreezeTableName() === 'movable') {
                return gObj.getMovableCellFromIndex(cellIndex.rowIndex, this.getColIndex(cellIndex.rowIndex, cellIndex.cellIndex));
            }
            return null;
        }
        return null;
    }

    /**
     * Selects a cell by the given index.
     * @param  {IIndex} cellIndex - Defines the row and column indexes. 
     * @param  {boolean} isToggle - If set to true, then it toggles the selection.
     * @return {void}
     */
    public selectCell(cellIndex: IIndex, isToggle?: boolean): void {
        if (!this.isCellType()) { return; }
        let gObj: IGrid = this.parent;
        let selectedCell: Element = this.getSelectedMovableCell(cellIndex);
        let args: Object;
        if (!selectedCell) {
            selectedCell = gObj.getCellFromIndex(cellIndex.rowIndex, this.getColIndex(cellIndex.rowIndex, cellIndex.cellIndex));
        }
        this.currentIndex = cellIndex.rowIndex;
        let selectedData: Object = this.getCurrentBatchRecordChanges()[this.currentIndex];
        if (!this.isCellType() || !selectedCell || this.isEditing()) {
            return;
        }
        let isCellSelected: boolean = selectedCell.classList.contains('e-cellselectionbackground');
        isToggle = !isToggle ? isToggle : (!isUndefined(this.prevCIdxs) &&
            cellIndex.rowIndex === this.prevCIdxs.rowIndex && cellIndex.cellIndex === this.prevCIdxs.cellIndex &&
            isCellSelected);

        if (!isToggle) {
            args = {
                data: selectedData, cellIndex: cellIndex,
                isCtrlPressed: this.isMultiCtrlRequest, isShiftPressed: this.isMultiShiftRequest,
                previousRowCell: this.prevECIdxs ?
                    this.getCellIndex(this.prevECIdxs.rowIndex, this.prevECIdxs.cellIndex) : undefined,
                cancel: false
            };
            if (!isBlazor() || this.parent.isJsComponent) {
                let currentCell: string = 'currentCell';
                args[currentCell] = selectedCell;
                let previousRowCellIndex: string = 'previousRowCellIndex';
                args[previousRowCellIndex] = this.prevECIdxs;
            }
            this.parent.trigger(
                events.cellSelecting, this.fDataUpdate(args),
                this.successCallBack(args, isToggle, cellIndex, selectedCell, selectedData));
            this.cellselected = true;
        } else {
            this.successCallBack(args, isToggle, cellIndex, selectedCell, selectedData)(args);
        }
    }

    private successCallBack(
        cellSelectingArgs: Object, isToggle: boolean, cellIndex: IIndex,
        selectedCell: Element, selectedData: Object): Function {
        return (cellSelectingArgs: Object) => {
            let cncl: string = 'cancel';
            let currentCell: string = 'currentCell';
            if (!isNullOrUndefined(cellSelectingArgs) && cellSelectingArgs[cncl] === true) {
                return;
            }
            if (!isToggle) {
                cellSelectingArgs[currentCell] = cellSelectingArgs[currentCell] ? cellSelectingArgs[currentCell] : selectedCell;
            }
            this.clearCell();
            if (!isToggle) {
                this.updateCellSelection(selectedCell, cellIndex.rowIndex, cellIndex.cellIndex);
            }
            if (!isToggle) {
                let args: Object;
                let isHybrid: string = 'isHybrid';
                if (!isBlazor() || this.parent.isJsComponent || this.parent[isHybrid]) {
                    args = {
                        data: selectedData, cellIndex: cellIndex, currentCell: selectedCell,
                        selectedRowCellIndex: this.selectedRowCellIndexes,
                        previousRowCell: this.prevECIdxs ?
                            this.getCellIndex(this.prevECIdxs.rowIndex, this.prevECIdxs.cellIndex) : undefined
                    };
                    let previousRowCellIndex: string = 'previousRowCellIndex';
                    args[previousRowCellIndex] = this.prevECIdxs;
                } else {
                    args = { data: selectedData, cellIndex: cellIndex, selectedRowCellIndex: this.selectedRowCellIndexes };
                }
                this.updateCellProps(cellIndex, cellIndex);
                this.onActionComplete(args, events.cellSelected);
            }
        };
    }

    private getCellIndex(rIdx: number, cIdx: number): Element {
        return (this.parent.getFrozenColumns() ? (cIdx >= this.parent.getFrozenColumns() ? this.parent.getMovableCellFromIndex(rIdx, cIdx)
            : this.parent.getCellFromIndex(rIdx, cIdx)) : this.parent.getCellFromIndex(rIdx, cIdx));
    }

    /**
     * Selects a range of cells from start and end indexes. 
     * @param  {IIndex} startIndex - Specifies the row and column's start index.
     * @param  {IIndex} endIndex - Specifies the row and column's end index.
     * @return {void}
     */
    public selectCellsByRange(startIndex: IIndex, endIndex?: IIndex): void {
        if (!this.isCellType()) { return; }
        let gObj: IGrid = this.parent;
        let selectedCell: Element = this.getSelectedMovableCell(startIndex);
        let frzCols: number = gObj.getFrozenColumns();
        if (!selectedCell) {
            selectedCell = gObj.getCellFromIndex(startIndex.rowIndex, startIndex.cellIndex);
        }
        let min: number;
        let max: number;
        let stIndex: IIndex = startIndex;
        let edIndex: IIndex = endIndex = endIndex ? endIndex : startIndex;
        let cellIndexes: number[];
        this.currentIndex = startIndex.rowIndex;
        let cncl: string = 'cancel';
        let selectedData: Object = this.getCurrentBatchRecordChanges()[this.currentIndex];
        if (this.isSingleSel() || !this.isCellType() || this.isEditing()) {
            return;
        }
        let args: Object = {
            data: selectedData, cellIndex: startIndex, currentCell: selectedCell,
            isCtrlPressed: this.isMultiCtrlRequest, isShiftPressed: this.isMultiShiftRequest,
            previousRowCell: this.prevECIdxs ? this.getCellIndex(this.prevECIdxs.rowIndex, this.prevECIdxs.cellIndex) : undefined
        };
        if (!isBlazor()) {
            let previousRowCellIndex: string = 'previousRowCellIndex';
            args[previousRowCellIndex] = this.prevECIdxs;
        }
        this.parent.trigger(events.cellSelecting, this.fDataUpdate(args), (cellSelectingArgs: Object) => {
            if (!isNullOrUndefined(cellSelectingArgs) && cellSelectingArgs[cncl] === true) {
                return;
            }
            this.clearCell();
            if (startIndex.rowIndex > endIndex.rowIndex) {
                let temp: IIndex = startIndex;
                startIndex = endIndex;
                endIndex = temp;
            }
            for (let i: number = startIndex.rowIndex; i <= endIndex.rowIndex; i++) {
                if (this.selectionSettings.cellSelectionMode.indexOf('Box') < 0) {
                    min = i === startIndex.rowIndex ? (startIndex.cellIndex) : 0;
                    max = i === endIndex.rowIndex ? (endIndex.cellIndex) : this.getLastColIndex(i);
                } else {
                    min = startIndex.cellIndex;
                    max = endIndex.cellIndex;
                }
                cellIndexes = [];
                for (let j: number = min < max ? min : max, len: number = min > max ? min : max; j <= len; j++) {
                    if (frzCols) {
                        if (j < frzCols) {
                            selectedCell = gObj.getCellFromIndex(i, j);
                        } else {
                            selectedCell = gObj.getMovableCellFromIndex(i, j);
                        }
                    } else {
                        selectedCell = gObj.getCellFromIndex(i, j);
                    }
                    if (!selectedCell) {
                        continue;
                    }
                    cellIndexes.push(j);
                    this.updateCellSelection(selectedCell);
                    this.addAttribute(selectedCell);
                }
                this.selectedRowCellIndexes.push({ rowIndex: i, cellIndexes: cellIndexes });
            }

            let cellSelectedArgs: Object;
            let isHybrid: string = 'isHybrid';
            if (!isBlazor() || this.parent.isJsComponent || this.parent[isHybrid]) {
                cellSelectedArgs = {
                    data: selectedData, cellIndex: edIndex, currentCell: gObj.getCellFromIndex(edIndex.rowIndex, edIndex.cellIndex),
                    selectedRowCellIndex: this.selectedRowCellIndexes,
                    previousRowCell: this.prevECIdxs ? this.getCellIndex(this.prevECIdxs.rowIndex, this.prevECIdxs.cellIndex) : undefined
               };
                let previousRowCellIndex: string = 'previousRowCellIndex';
                cellSelectedArgs[previousRowCellIndex] = this.prevECIdxs;
            } else {
                cellSelectedArgs = { data: selectedData, cellIndex: edIndex, selectedRowCellIndex: this.selectedRowCellIndexes };
            }
            if (!this.isDragged) {
                this.onActionComplete(cellSelectedArgs, events.cellSelected);
                this.cellselected = true;
            }
            this.updateCellProps(stIndex, edIndex);
        });
    }

    /**
     * Selects a collection of cells by row and column indexes. 
     * @param  {ISelectedCell[]} rowCellIndexes - Specifies the row and column indexes.
     * @return {void}
     */
    public selectCells(rowCellIndexes: ISelectedCell[]): void {
        if (!this.isCellType()) { return; }
        let gObj: IGrid = this.parent;
        let selectedCell: Element = this.getSelectedMovableCell(rowCellIndexes[0]);
        let frzCols: number = gObj.getFrozenColumns();
        if (!selectedCell) {
            selectedCell = gObj.getCellFromIndex(rowCellIndexes[0].rowIndex, rowCellIndexes[0].cellIndexes[0]);
        }
        this.currentIndex = rowCellIndexes[0].rowIndex;
        let selectedData: Object = this.getCurrentBatchRecordChanges()[this.currentIndex];
        if (this.isSingleSel() || !this.isCellType() || this.isEditing()) {
            return;
        }
        let cellSelectArgs: Object;
        let isHybrid: string = 'isHybrid';
        if (!isBlazor() || this.parent.isJsComponent || this.parent[isHybrid]) {
            cellSelectArgs = {
                data: selectedData, cellIndex: rowCellIndexes[0].cellIndexes[0],
                currentCell: selectedCell, isCtrlPressed: this.isMultiCtrlRequest,
                isShiftPressed: this.isMultiShiftRequest,
                previousRowCell: this.prevECIdxs ? this.getCellIndex(this.prevECIdxs.rowIndex, this.prevECIdxs.cellIndex) : undefined
            };
            let previousRowCellIndex: string = 'previousRowCellIndex';
            cellSelectArgs[previousRowCellIndex] = this.prevECIdxs;
        } else {
            cellSelectArgs = {
                data: selectedData, cellIndex: rowCellIndexes[0].cellIndexes[0],
                isCtrlPressed: this.isMultiCtrlRequest, isShiftPressed: this.isMultiShiftRequest
            };
        }
        this.onActionBegin(cellSelectArgs, events.cellSelecting);
        for (let i: number = 0, len: number = rowCellIndexes.length; i < len; i++) {
            for (let j: number = 0, cellLen: number = rowCellIndexes[i].cellIndexes.length; j < cellLen; j++) {
                if (frzCols) {
                    if (rowCellIndexes[i].cellIndexes[j] < frzCols) {
                        selectedCell = gObj.getCellFromIndex(rowCellIndexes[i].rowIndex, rowCellIndexes[i].cellIndexes[j]);
                    } else {
                        selectedCell = gObj.getMovableCellFromIndex(rowCellIndexes[i].rowIndex, rowCellIndexes[i].cellIndexes[j]);
                    }
                } else {
                    selectedCell = gObj.getCellFromIndex(rowCellIndexes[i].rowIndex, rowCellIndexes[i].cellIndexes[j]);
                }
                if (!selectedCell) {
                    continue;
                }
               this.updateCellSelection(selectedCell);
                this.addAttribute(selectedCell);
                this.addRowCellIndex({ rowIndex: rowCellIndexes[i].rowIndex, cellIndex: rowCellIndexes[i].cellIndexes[j] });
            }
        }
        this.updateCellProps(
            { rowIndex: rowCellIndexes[0].rowIndex, cellIndex: rowCellIndexes[0].cellIndexes[0] },
            { rowIndex: rowCellIndexes[0].rowIndex, cellIndex: rowCellIndexes[0].cellIndexes[0] });
        let cellSelectedArgs: Object;
        if (!isBlazor() || this.parent.isJsComponent || this.parent[isHybrid]) {
            cellSelectedArgs = {
                data: selectedData, cellIndex: rowCellIndexes[0].cellIndexes[0],
                currentCell: selectedCell, selectedRowCellIndex: this.selectedRowCellIndexes,
                previousRowCell: this.prevECIdxs ? this.getCellIndex(this.prevECIdxs.rowIndex, this.prevECIdxs.cellIndex) : undefined
            };
            let previousRowCellIndex: string = 'previousRowCellIndex';
            cellSelectedArgs[previousRowCellIndex] = this.prevECIdxs;
        } else {
            cellSelectedArgs = { data: selectedData, cellIndex: rowCellIndexes[0].cellIndexes[0],
                                 selectedRowCellIndex: this.selectedRowCellIndexes };
        }
        this.onActionComplete(cellSelectedArgs, events.cellSelected);
    }

    /**
     * Select cells with existing cell selection by passing row and column index. 
     * @param  {IIndex} startIndex - Defines the collection of row and column index.
     * @return {void}
     * @hidden
     */
    // tslint:disable-next-line:max-func-body-length
    public addCellsToSelection(cellIndexes: IIndex[]): void {
        if (!this.isCellType()) { return; }
        let gObj: IGrid = this.parent;
        let selectedCell: Element;
        let index: number;
        this.currentIndex = cellIndexes[0].rowIndex;
        let cncl: string = 'cancel';
        let selectedData: Object = this.getCurrentBatchRecordChanges()[this.currentIndex];
        let isHybrid: string = 'isHybrid';
        let left: number = gObj.getFrozenLeftCount();
        let movable: number = gObj.getMovableColumnsCount();
        if (this.isSingleSel() || !this.isCellType() || this.isEditing()) {
            return;
        }
        this.hideAutoFill();
        let col: Column = gObj.getColumnByIndex(cellIndexes[0].cellIndex);
        let rowObj: Row<Column>;
        gridActionHandler(
            this.parent,
            (tableName: freezeTable, rows: Row<Column>[]) => {
                rowObj = rows[cellIndexes[0].rowIndex];
            },
            [
                !col.getFreezeTableName() || col.getFreezeTableName() === literals.frozenLeft ? gObj.getRowsObject() : [],
                col.getFreezeTableName() === 'movable' ? gObj.getMovableRowsObject() : [],
                col.getFreezeTableName() === literals.frozenRight ? gObj.getFrozenRightRowsObject() : []
            ]
        );
        let foreignKeyData: Object[] = [];
        for (let cellIndex of cellIndexes) {
            for (let i: number = 0, len: number = this.selectedRowCellIndexes.length; i < len; i++) {
                if (this.selectedRowCellIndexes[i].rowIndex === cellIndex.rowIndex) {
                    index = i; break;
                }
            }
            selectedCell = this.getSelectedMovableCell(cellIndex);
            if (!selectedCell) {
                selectedCell = gObj.getCellFromIndex(cellIndex.rowIndex, this.getColIndex(cellIndex.rowIndex, cellIndex.cellIndex));
            }
            let idx: number = col.getFreezeTableName() === 'movable' ? cellIndex.cellIndex - left
                : col.getFreezeTableName() === literals.frozenRight ? cellIndex.cellIndex - (left + movable) : cellIndex.cellIndex;
            foreignKeyData.push(rowObj.cells[idx].foreignKeyData);
            let args: Object;
            if (!isBlazor() || this.parent.isJsComponent || this.parent[isHybrid]) {
                args = {
                    cancel: false, data: selectedData, cellIndex: cellIndexes[0],
                    isShiftPressed: this.isMultiShiftRequest,
                    currentCell: selectedCell, isCtrlPressed: this.isMultiCtrlRequest,
                    previousRowCell: this.prevECIdxs ?
                        gObj.getCellFromIndex(this.prevECIdxs.rowIndex, this.prevECIdxs.cellIndex) : undefined,
                };
                let previousRowCellIndex: string = 'previousRowCellIndex';
                args[previousRowCellIndex] = this.prevECIdxs;
            } else {
                args = {
                    cancel: false, data: selectedData, cellIndex: cellIndexes[0],
                    isShiftPressed: this.isMultiShiftRequest, isCtrlPressed: this.isMultiCtrlRequest
                };
            }
            let isUnSelected: boolean = index > -1;
            if (isUnSelected) {
                let selectedCellIdx: number[] = this.selectedRowCellIndexes[index].cellIndexes;
                if (selectedCellIdx.indexOf(cellIndex.cellIndex) > -1) {
                    this.cellDeselect(
                        events.cellDeselecting, [{ rowIndex: cellIndex.rowIndex, cellIndexes: [cellIndex.cellIndex] }],
                        selectedData, [selectedCell], foreignKeyData);
                    selectedCellIdx.splice(selectedCellIdx.indexOf(cellIndex.cellIndex), 1);
                    if (selectedCellIdx.length === 0) {
                        this.selectedRowCellIndexes.splice(index, 1);
                    }
                    selectedCell.classList.remove('e-cellselectionbackground');
                    selectedCell.removeAttribute('aria-selected');
                    this.cellDeselect(
                        events.cellDeselected, [{ rowIndex: cellIndex.rowIndex, cellIndexes: [cellIndex.cellIndex] }],
                        selectedData, [selectedCell], foreignKeyData);
                } else {
                    isUnSelected = false;
                    this.onActionBegin(args, events.cellSelecting);
                    this.addRowCellIndex({ rowIndex: cellIndex.rowIndex, cellIndex: cellIndex.cellIndex });
                    this.updateCellSelection(selectedCell);
                    this.addAttribute(selectedCell);
                }
            } else {
                this.onActionBegin(args, events.cellSelecting);
                if (!isNullOrUndefined(args) && args[cncl] === true) {
                    return;
                }
                this.updateCellSelection(selectedCell, cellIndex.rowIndex, cellIndex.cellIndex);
            }
            if (!isUnSelected) {
                let cellSelectedArgs: Object;
                if (!isBlazor() || this.parent.isJsComponent || this.parent[isHybrid]) {
                    cellSelectedArgs = {
                        data: selectedData, cellIndex: cellIndexes[0], currentCell: selectedCell,
                        previousRowCell: this.prevECIdxs ? this.getCellIndex(this.prevECIdxs.rowIndex, this.prevECIdxs.cellIndex) :
                            undefined, selectedRowCellIndex: this.selectedRowCellIndexes
                    };
                    let previousRowCellIndex: string = 'previousRowCellIndex';
                    cellSelectedArgs[previousRowCellIndex] = this.prevECIdxs;
                } else {
                    cellSelectedArgs = { data: selectedData, cellIndex: cellIndexes[0], selectedRowCellIndex: this.selectedRowCellIndexes };
                }
                this.onActionComplete(cellSelectedArgs, events.cellSelected);
                this.cellselected = true;
            }
            this.updateCellProps(cellIndex, cellIndex);
        }
    }

    private getColIndex(rowIndex: number, index: number): number {
        let frzCols: boolean = this.parent.isFrozenGrid();
        let col: Column = this.parent.getColumnByIndex(index);
        let cells: Element[] = getCellsByTableName(this.parent, col, rowIndex);
        if (cells) {
            for (let m: number = 0; m < cells.length; m++) {
                let colIndex: number = parseInt(cells[m].getAttribute(literals.ariaColIndex), 10);
                if (colIndex === index) {
                    if (frzCols) {
                        if (col.getFreezeTableName() === 'movable') {
                            m += this.parent.getFrozenLeftCount();
                        } else if (col.getFreezeTableName() === literals.frozenRight) {
                            m += (this.parent.getFrozenLeftColumnsCount() + this.parent.getMovableColumnsCount());
                        }
                    }
                    return m;
                }
            }
        }
        return -1;
    }

    private getLastColIndex(rowIndex: number): number {
        let cells: NodeListOf<Element> =
            this.parent.getFrozenColumns() ? this.parent.getMovableDataRows()[rowIndex].querySelectorAll('td.e-rowcell')
                : this.parent.getDataRows()[rowIndex].querySelectorAll('td.e-rowcell');
        return parseInt(cells[cells.length - 1].getAttribute(literals.ariaColIndex), 10);
    }

    private clearCell(): void {
        this.clearCellSelection();
    }

    private cellDeselect(type: string, cellIndexes: ISelectedCell[], data: Object, cells: Element[], foreignKeyData: Object[]): void {
        let cancl: string = 'cancel';
        if (cells[0] && cells[0].classList.contains(literals.gridChkBox)) {
            this.updateCheckBoxes(closest(cells[0], 'tr'));
        }
        let args: Object = {
            cells: cells, data: data, cellIndexes: cellIndexes, foreignKeyData: foreignKeyData, cancel: false
        };
        this.parent.trigger(type, args);
        this.isPreventCellSelect = args[cancl];
    }

    private updateCellSelection(selectedCell: Element, rowIndex?: number, cellIndex?: number): void {
        if (!isNullOrUndefined(rowIndex)) {
            this.addRowCellIndex({ rowIndex: rowIndex, cellIndex: cellIndex });
        }
        selectedCell.classList.add('e-cellselectionbackground');
        if (selectedCell.classList.contains(literals.gridChkBox)) {
            this.updateCheckBoxes(closest(selectedCell, 'tr'), true);
        }
        this.addAttribute(selectedCell);
    }

    private addAttribute(cell: Element): void {
        this.target = cell;
        if (!isNullOrUndefined(cell)) {
            cell.setAttribute('aria-selected', 'true');
            if (!this.preventFocus) {
                this.focus.onClick({ target: cell }, true);
            }
        }
    }

    private updateCellProps(startIndex: IIndex, endIndex: IIndex): void {
        this.prevCIdxs = startIndex;
        this.prevECIdxs = endIndex;
        this.isCellSelected = this.selectedRowCellIndexes.length && true;
    }

    private addRowCellIndex(rowCellIndex: IIndex): void {
        let isRowAvail: boolean;
        let index: number;
        for (let i: number = 0, len: number = this.selectedRowCellIndexes.length; i < len; i++) {
            if (this.selectedRowCellIndexes[i].rowIndex === rowCellIndex.rowIndex) {
                isRowAvail = true;
                index = i;
                break;
            }
        }
        if (isRowAvail) {
            if (this.selectedRowCellIndexes[index].cellIndexes.indexOf(rowCellIndex.cellIndex) < 0) {
                this.selectedRowCellIndexes[index].cellIndexes.push(rowCellIndex.cellIndex);
            }
        } else {
            this.selectedRowCellIndexes.push({ rowIndex: rowCellIndex.rowIndex, cellIndexes: [rowCellIndex.cellIndex] });
        }

    }

    /** 
     * Deselects the currently selected cells.
     * @return {void} 
     */
    public clearCellSelection(): void {
        if (this.isCellSelected) {
            let gObj: IGrid = this.parent;
            let selectedCells: Element[] = this.getSelectedCellsElement();
            let rowCell: ISelectedCell[] = this.selectedRowCellIndexes;
            let data: Object[] = [];
            let cells: Element[] = [];
            let foreignKeyData: Object[] = [];
            let currentViewData: Object[] = this.getCurrentBatchRecordChanges();
            let frzCols: boolean = gObj.isFrozenGrid();

            this.hideAutoFill();
            for (let i: number = 0, len: number = rowCell.length; i < len; i++) {
                data.push(currentViewData[rowCell[i].rowIndex]);
                let rowObj: Row<Column> = this.getRowObj(rowCell[i].rowIndex);
                for (let j: number = 0, cLen: number = rowCell[i].cellIndexes.length; j < cLen; j++) {
                    if (frzCols) {
                        let col: Column = gObj.getColumnByIndex(rowCell[i].cellIndexes[j]);
                        cells.push(getCellByColAndRowIndex(this.parent, col, rowCell[i].rowIndex, rowCell[i].cellIndexes[j]));
                    } else {
                        if (rowObj.cells) {
                            foreignKeyData.push(rowObj.cells[rowCell[i].cellIndexes[j]].foreignKeyData);
                        }
                        cells.push(gObj.getCellFromIndex(rowCell[i].rowIndex, rowCell[i].cellIndexes[j]));
                    }
                }
            }
            this.cellDeselect(events.cellDeselecting, rowCell, data, cells, foreignKeyData);
            if (this.isPreventCellSelect === true) {
                return;
            }

            for (let i: number = 0, len: number = selectedCells.length; i < len; i++) {
                selectedCells[i].classList.remove('e-cellselectionbackground');
                selectedCells[i].removeAttribute('aria-selected');
            }
            if (this.bdrElement) {
                this.showHideBorders('none');
            }
            this.selectedRowCellIndexes = [];
            this.isCellSelected = false;
            if (!this.isDragged && this.cellselected) {
                this.cellDeselect(events.cellDeselected, rowCell, data, cells, foreignKeyData);
            }
        }
    }

    private getSelectedCellsElement(): Element[] {
        let gObj: IGrid = this.parent;
        let rows: Element[] = gObj.getDataRows();
        let mRows: Element[];
        if (gObj.isFrozenGrid()) {
            mRows = gObj.getMovableDataRows();
            rows = gObj.addMovableRows(rows as HTMLElement[], mRows as HTMLElement[]);
            if (gObj.getFrozenMode() === literals.leftRight) {
                rows = gObj.addMovableRows(rows as HTMLElement[], gObj.getFrozenRightDataRows() as HTMLElement[]);
            }
        }
        let cells: Element[] = [];
        for (let i: number = 0, len: number = rows.length; i < len; i++) {
            cells = cells.concat([].slice.call(rows[i].getElementsByClassName('e-cellselectionbackground')));
        }
        return cells;
    }

    private mouseMoveHandler(e: MouseEventArgs): void {
        e.preventDefault();
        let gBRect: ClientRect = this.parent.element.getBoundingClientRect();
        let x1: number = this.x;
        let y1: number = this.y;
        let position: IPosition = getPosition(e);
        let x2: number = position.x - gBRect.left;
        let y2: number = position.y - gBRect.top;
        let tmp: number;
        let target: Element = closest(e.target as Element, 'tr');
        this.isDragged = true;
        if (!this.isCellDrag) {
            if (!target) {
                target = closest(document.elementFromPoint(this.parent.element.offsetLeft + 2, e.clientY), 'tr');
            }
            if (x1 > x2) {
                tmp = x2;
                x2 = x1;
                x1 = tmp;
            }
            if (y1 > y2) {
                tmp = y2;
                y2 = y1;
                y1 = tmp;
            }
            this.element.style.left = x1 + 'px';
            this.element.style.top = y1 + 'px';
            this.element.style.width = x2 - x1 + 'px';
            this.element.style.height = y2 - y1 + 'px';
        }
        if (target && !e.ctrlKey && !e.shiftKey) {
            let rowIndex: number = parseInt(target.getAttribute(literals.ariaRowIndex), 10);
            if (!this.isCellDrag) {
                this.hideAutoFill();
                this.selectRowsByRange(this.startDIndex, rowIndex);
            } else {
                let td: Element = parentsUntil(e.target as HTMLElement, literals.rowCell);
                if (td) {
                    this.startAFCell = this.startCell;
                    this.endAFCell = parentsUntil(e.target as Element, literals.rowCell);
                    this.selectLikeExcel(e, rowIndex, parseInt(td.getAttribute(literals.ariaColIndex), 10));
                }
            }
        }
    }

    private selectLikeExcel(e: MouseEvent, rowIndex: number, cellIndex: number): void {
        if (!this.isAutoFillSel) {
            this.clearCellSelection();
            this.selectCellsByRange(
                { rowIndex: this.startDIndex, cellIndex: this.startDCellIndex },
                { rowIndex: rowIndex, cellIndex: cellIndex });
            this.drawBorders();
        } else { //Autofill
            this.showAFBorders();
            this.selectLikeAutoFill(e);
        }
    }

    private drawBorders(): void {
        if (this.selectionSettings.cellSelectionMode === 'BoxWithBorder' && this.selectedRowCellIndexes.length && !this.parent.isEdit) {
            this.parent.element.classList.add('e-enabledboxbdr');
           if (!this.bdrElement) {
                this.createBorders();
            }
            this.positionBorders();
        } else {
            this.showHideBorders('none');
        }
    }

    private isLastCell(cell: Element): boolean {
        let cells: Element[] = [].slice.call(cell.parentElement.querySelectorAll('.e-rowcell:not(.e-hide)'));
        return cells[cells.length - 1] === cell;
    }

    private isLastRow(cell: Element): boolean {
        let rows: Element[] = [].slice.call(closest(cell,  literals.tbody).querySelectorAll('.e-row:not(.e-hiddenrow)'));
        return cell.parentElement === rows[rows.length - 1];
    }

    private isFirstRow(cell: Element): boolean {
        let rows: Element[] = [].slice.call(closest(cell,  literals.tbody).querySelectorAll('.e-row:not(.e-hiddenrow)'));
        return cell.parentElement === rows[0];
    }

    private isFirstCell(cell: Element): boolean {
        let cells: Element[] = [].slice.call(cell.parentElement.querySelectorAll('.e-rowcell:not(.e-hide)'));
        return cells[0] === cell;
    }

    private setBorders(parentEle: Element, border: HTMLElement, bdrStr: string): void {
        let cells: HTMLElement[] = [].slice.call(parentEle.getElementsByClassName('e-cellselectionbackground')).
            filter((ele: HTMLElement) => ele.style.display === '');
        if (cells.length) {
            let isFrozen: boolean = this.parent.isFrozenGrid();
            let start: HTMLElement = cells[0];
            let end: HTMLElement = cells[cells.length - 1];
            let stOff: ClientRect = start.getBoundingClientRect();
            let endOff: ClientRect = end.getBoundingClientRect();
            let parentOff: ClientRect = start.offsetParent.getBoundingClientRect();

            let rowHeight: number = this.isLastRow(end) && (bdrStr === '1' || bdrStr === '2' || bdrStr === '5') ? 2 : 0;
            let topOffSet: number = this.parent.frozenRows && (bdrStr === '1' || bdrStr === '2') &&
                this.isFirstRow(start) ? 1.5 : 0;
            let leftOffset: number = isFrozen && (bdrStr === '2' || bdrStr === '4') && this.isFirstCell(start) ? 1 : 0;
            let rightOffset: number = ((this.parent.getFrozenMode() === 'Right' && (bdrStr === '1' || bdrStr === '3'))
                || (this.parent.getFrozenMode() === literals.leftRight && (bdrStr === '5' || bdrStr === '6')))
                && this.isFirstCell(start) ? 1 : 0;

            if (this.parent.enableRtl) {
                border.style.right = parentOff.right - stOff.right - leftOffset + 'px';
                border.style.width = stOff.right - endOff.left + leftOffset + 1 + 'px';
            } else {
                border.style.left = stOff.left - parentOff.left - leftOffset - rightOffset + 'px';
                border.style.width = endOff.right - stOff.left + leftOffset - rightOffset + 1 + 'px';
            }
            border.style.top = stOff.top - parentOff.top - topOffSet + 'px';
            border.style.height = endOff.top - stOff.top > 0 ?
                (endOff.top - parentOff.top + endOff.height + 1) - (stOff.top - parentOff.top) - rowHeight + topOffSet + 'px' :
                endOff.height + topOffSet - rowHeight + 1 + 'px';
            this.selectDirection += bdrStr;
        } else {
            border.style.display = 'none';
        }
    }

    private positionBorders(): void {
        this.updateStartEndCells();
        if (!this.startCell || !this.bdrElement || !this.selectedRowCellIndexes.length) {
            return;
        }
        this.selectDirection = '';
        this.showHideBorders('');
        this.setBorders(this.parent.getContentTable(), this.bdrElement, '1');
        if (this.parent.isFrozenGrid()) {
            this.setBorders(this.parent.contentModule.getMovableContent(), this.mcBdrElement, '2');
            if (this.parent.getFrozenMode() === literals.leftRight) {
                this.setBorders(this.parent.contentModule.getFrozenRightContent(), this.frcBdrElement, '5');
            }
        }
        if (this.parent.frozenRows) {
            this.setBorders(this.parent.getHeaderTable(), this.fhBdrElement, '3');

            if (this.parent.isFrozenGrid()) {
                this.setBorders(this.parent.headerModule.getMovableHeader(), this.mhBdrElement, '4');
                if (this.parent.getFrozenMode() === literals.leftRight) {
                    this.setBorders(this.parent.headerModule.getFrozenRightHeader(), this.frhBdrElement, '6');
                }
            }
        }
        this.applyBorders(this.selectDirection);
    }

    private bottom: string = "0 0 2px 0";
    private top: string = "2px 0 0 0";
    private right_bottom: string = "0 2px 2px 0";
    private bottom_left: string = "0 0 2px 2px";
    private top_right: string = "2px 2px 0 0";
    private top_left: string = "2px 0 0 2px";
    private top_bottom: string = "2px 0 2px 0";
    private top_right_bottom: string = "2px 2px 2px 0";
    private top_bottom_left: string = "2px 0 2px 2px";
    private top_right_left: string = "2px 2px 0 2px";
    private right_bottom_left: string = "0 2px 2px 2px";
    private all_border: string = "2px";

    private applyBothFrozenBorders(str: string): void {
        let rtl: boolean = this.parent.enableRtl;
        switch (str.length) {
            case 6: {
                this.bdrElement.style.borderWidth = rtl ? this.right_bottom : this.bottom_left;
                this.mcBdrElement.style.borderWidth = this.bottom;
                this.fhBdrElement.style.borderWidth = rtl ? this.top_right : this.top_left;
                this.mhBdrElement.style.borderWidth = this.top;
                this.frcBdrElement.style.borderWidth = rtl ? this.bottom_left : this.right_bottom;
                this.frhBdrElement.style.borderWidth = rtl ? this.top_left : this.top_right;
            }
                break;
            case 4: {
                if (str.includes('1') && str.includes('2') && str.includes('3') && str.includes('4')) {
                    this.fhBdrElement.style.borderWidth = rtl ? this.top_right : this.top_left;
                    this.mhBdrElement.style.borderWidth = rtl ? this.top_left : this.top_right;
                    this.bdrElement.style.borderWidth = rtl ? this.right_bottom : this.bottom_left;
                    this.mcBdrElement.style.borderWidth = rtl ? this.bottom_left : this.right_bottom;
                }
                if (str.includes('2') && str.includes('4') && str.includes('5') && str.includes('6')) {
                    this.mcBdrElement.style.borderWidth = rtl ? this.right_bottom : this.bottom_left;
                    this.mhBdrElement.style.borderWidth = rtl ? this.top_right : this.top_left;
                    this.frcBdrElement.style.borderWidth = rtl ? this.bottom_left : this.right_bottom;
                    this.frhBdrElement.style.borderWidth = rtl ? this.top_left : this.top_right;
                }
            }
                break;
            case 3: {
                this.bdrElement.style.borderWidth = rtl ? this.top_right_bottom : this.top_bottom_left;
                this.mcBdrElement.style.borderWidth = this.top_bottom;
                this.frcBdrElement.style.borderWidth = rtl ? this.top_bottom_left : this.top_right_bottom;
                if (this.parent.frozenRows) {
                    this.fhBdrElement.style.borderWidth = rtl ? this.top_right_bottom : this.top_bottom_left;
                    this.mhBdrElement.style.borderWidth = this.top_bottom;
                    this.frcBdrElement.style.borderWidth = rtl ? this.top_bottom_left : this.top_right_bottom;
                }
            }
                break;
            case 2: {
                if (str.includes('1')) {
                    this.mcBdrElement.style.borderWidth = rtl ? this.top_bottom_left : this.top_right_bottom;
                    if (this.parent.frozenRows) {
                        this.fhBdrElement.style.borderWidth = this.top_right_left;
                    }
                }
                if (str.includes('2')) {
                    this.bdrElement.style.borderWidth = rtl ? this.top_right_bottom : this.top_bottom_left;
                    this.frcBdrElement.style.borderWidth = rtl ? this.top_bottom_left : this.top_right_bottom;
                    if (this.parent.frozenRows) {
                        this.mhBdrElement.style.borderWidth = this.top_right_left;
                    }
                }
                if (str.includes('3')) {
                    this.mhBdrElement.style.borderWidth = rtl ? this.top_bottom_left : this.top_right_bottom;
                    this.bdrElement.style.borderWidth = this.right_bottom_left;
                }
                if (str.includes('4')) {
                    this.fhBdrElement.style.borderWidth = rtl ? this.top_right_bottom : this.top_bottom_left;
                    this.frhBdrElement.style.borderWidth = rtl ? this.top_bottom_left : this.top_right_bottom;
                    this.mcBdrElement.style.borderWidth = this.right_bottom_left;
                }
                if (str.includes('5')) {
                    this.mcBdrElement.style.borderWidth = rtl ? this.top_right_bottom : this.top_bottom_left;
                    if (this.parent.frozenRows) {
                        this.frhBdrElement.style.borderWidth = this.top_right_left;
                    }
                }
                if (str.includes('6')) {
                    this.mhBdrElement.style.borderWidth = rtl ? this.top_right_bottom : this.top_bottom_left;
                    this.frcBdrElement.style.borderWidth = this.right_bottom_left;
                }
            }
                break;
            default:
                this.bdrElement.style.borderWidth = this.all_border;
                this.mcBdrElement.style.borderWidth = this.all_border;
                this.frcBdrElement.style.borderWidth = this.all_border;
                if (this.parent.frozenRows) {
                    this.fhBdrElement.style.borderWidth = this.all_border;
                    this.mhBdrElement.style.borderWidth = this.all_border;
                    this.frhBdrElement.style.borderWidth = this.all_border;
                }
                break;
        }
    }

    private applyBorders(str: string): void {
        let rtl: boolean = this.parent.enableRtl;
        if (this.parent.getFrozenMode() === literals.leftRight) {
            this.applyBothFrozenBorders(str);
        } else {
            switch (str.length) {
                case 4: {
                    if (this.parent.getFrozenMode() === 'Right') {
                        this.bdrElement.style.borderWidth = rtl ? this.bottom_left : this.right_bottom;
                        this.mcBdrElement.style.borderWidth = rtl ? this.right_bottom : this.bottom_left;
                        this.fhBdrElement.style.borderWidth = rtl ? this.top_left : this.top_right;
                        this.mhBdrElement.style.borderWidth = rtl ? this.top_right : this.top_left;
                    } else {
                        this.bdrElement.style.borderWidth = rtl ? this.right_bottom : this.bottom_left;
                        this.mcBdrElement.style.borderWidth = rtl ? this.bottom_left : this.right_bottom;
                        this.fhBdrElement.style.borderWidth = rtl ? this.top_right : this.top_left;
                        this.mhBdrElement.style.borderWidth = rtl ? this.top_left : this.top_right;
                    }
                }
                    break;
                case 2: {
                    if (this.parent.getFrozenMode() === 'Right') {
                        this.bdrElement.style.borderWidth = str.includes('2') ? rtl ? this.top_bottom_left
                            : this.top_right_bottom : this.right_bottom_left;
                        this.mcBdrElement.style.borderWidth = str.includes('1') ? rtl ? this.top_right_bottom
                            : this.top_bottom_left : this.right_bottom_left;
                        if (this.parent.frozenRows) {
                            this.fhBdrElement.style.borderWidth = str.includes('1') ? this.top_right_left
                                : rtl ? this.top_bottom_left : this.top_right_bottom;
                            this.mhBdrElement.style.borderWidth = str.includes('2') ? this.top_right_left
                                : rtl ? this.top_right_bottom : this.top_bottom_left;
                        }
                    } else {
                        this.bdrElement.style.borderWidth = str.includes('2') ? rtl ? this.top_right_bottom
                            : this.top_bottom_left : this.right_bottom_left;
                        if (this.parent.isFrozenGrid()) {
                            this.mcBdrElement.style.borderWidth = str.includes('1') ? rtl ? this.top_bottom_left
                                : this.top_right_bottom : this.right_bottom_left;
                        }
                        if (this.parent.frozenRows) {
                            this.fhBdrElement.style.borderWidth = str.includes('1') ? this.top_right_left
                                : rtl ? this.top_right_bottom : this.top_bottom_left;
                            if (this.parent.isFrozenGrid()) {
                                this.mhBdrElement.style.borderWidth = str.includes('2') ? this.top_right_left
                                    : rtl ? this.top_bottom_left : this.top_right_bottom;
                            }
                        }
                    }
                }
                    break;
                default:
                    this.bdrElement.style.borderWidth = this.all_border;
                    if (this.parent.isFrozenGrid()) {
                        this.mcBdrElement.style.borderWidth = this.all_border;
                    }
                    if (this.parent.frozenRows) {
                        this.fhBdrElement.style.borderWidth = this.all_border;
                        if (this.parent.isFrozenGrid()) {
                            this.mhBdrElement.style.borderWidth = this.all_border;
                        }
                    }
                    break;
            }
        }
    }

    private createBorders(): void {
        if (!this.bdrElement) {
            this.bdrElement = this.parent.getContentTable().parentElement.appendChild(
                createElement('div', {
                    className: 'e-xlsel', id: this.parent.element.id + '_bdr',
                    styles: 'width: 2px; border-width: 0;'
                }));
            if (this.parent.isFrozenGrid()) {
                this.mcBdrElement = this.parent.contentModule.getMovableContent().appendChild(
                    createElement('div', {
                        className: 'e-xlsel', id: this.parent.element.id + '_mcbdr',
                        styles: 'height: 2px; border-width: 0;'
                    }));
                if (this.parent.getFrozenMode() === literals.leftRight) {
                    this.frcBdrElement = this.parent.contentModule.getFrozenRightContent().appendChild(
                        createElement('div', {
                            className: 'e-xlsel', id: this.parent.element.id + '_frcbdr',
                            styles: 'height: 2px; border-width: 0;'
                        }));
                }
            }
            if (this.parent.frozenRows) {
                this.fhBdrElement = this.parent.getHeaderTable().parentElement.appendChild(
                    createElement('div', { className: 'e-xlsel', id: this.parent.element.id + '_fhbdr', styles: 'height: 2px;' }));
            }
            if (this.parent.frozenRows && this.parent.isFrozenGrid()) {
                this.mhBdrElement = this.parent.headerModule.getMovableHeader().appendChild(
                    createElement('div', { className: 'e-xlsel', id: this.parent.element.id + '_mhbdr', styles: 'height: 2px;' }));
                if (this.parent.getFrozenMode() === literals.leftRight) {
                    this.frhBdrElement = this.parent.headerModule.getFrozenRightHeader().appendChild(
                        createElement('div', { className: 'e-xlsel', id: this.parent.element.id + '_frhbdr', styles: 'height: 2px;' }));
                }
            }
        }
    }

    private showHideBorders(display: string): void {
        if (this.bdrElement) {
            this.bdrElement.style.display = display;
            if (this.parent.isFrozenGrid()) {
                this.mcBdrElement.style.display = display;
                if (this.parent.getFrozenMode() === literals.leftRight) {
                    this.frcBdrElement.style.display = display;
                }
           }
            if (this.parent.frozenRows) {
                this.fhBdrElement.style.display = display;
            }
            if (this.parent.frozenRows && this.parent.isFrozenGrid()) {
                this.mhBdrElement.style.display = display;
                if (this.parent.getFrozenMode() === literals.leftRight) {
                    this.frhBdrElement.style.display = display;
                }
            }
        }
    }

    private drawAFBorders(): void {
        if (!this.bdrAFBottom) {
            this.createAFBorders();
        }
        this.positionAFBorders();
    }

    private positionAFBorders(): void {
        if (!this.startCell || !this.bdrAFLeft) {
            return;
        }
        let stOff: ClientRect = this.startAFCell.getBoundingClientRect();
        let endOff: ClientRect = this.endAFCell.getBoundingClientRect();
        let top: number = endOff.top - stOff.top > 0 ? 1 : 0;
        let firstCellTop: number = endOff.top - stOff.top >= 0 && (parentsUntil(this.startAFCell, literals.movableContent) ||
        parentsUntil(this.startAFCell, 'e-frozencontent')) && this.isFirstRow(this.startAFCell) ? 1.5 : 0;
        let firstCellLeft: number = (parentsUntil(this.startAFCell, literals.movableContent) ||
        parentsUntil(this.startAFCell, literals.movableHeader)) && this.isFirstCell(this.startAFCell) ? 1 : 0;
        let rowHeight: number = this.isLastRow(this.endAFCell) && (parentsUntil(this.endAFCell, literals.movableContent) ||
        parentsUntil(this.endAFCell, 'e-frozencontent')) ? 2 : 0;
        let parentOff: ClientRect = (this.startAFCell as HTMLElement).offsetParent.getBoundingClientRect();
        let parentRect: ClientRect = this.parent.element.getBoundingClientRect();
        let sTop: number = (this.startAFCell as HTMLElement).offsetParent.parentElement.scrollTop;
        let sLeft: number = (this.startAFCell as HTMLElement).offsetParent.parentElement.scrollLeft;
        let scrollTop: number = sTop - (this.startAFCell as HTMLElement).offsetTop;
        let scrollLeft: number = sLeft - (this.startAFCell as HTMLElement).offsetLeft;
        let totalHeight: number = this.parent.element.clientHeight;
        let totalWidth: number = this.parent.element.clientWidth;
        scrollTop = scrollTop > 0 ? Math.floor(scrollTop) - 1 : 0;
        scrollLeft = scrollLeft > 0 ? scrollLeft : 0;
        let left: number = stOff.left - parentRect.left;

        if (!this.parent.enableRtl) {
            this.bdrAFLeft.style.left = left - firstCellLeft + scrollLeft - 1 + 'px';

            this.bdrAFRight.style.left = endOff.left - parentRect.left - 2 + endOff.width + 'px';

            this.bdrAFRight.style.width = totalWidth <= parseInt(this.bdrAFRight.style.left, 10) ? '0px' : '2px';
            this.bdrAFTop.style.left = left + scrollLeft - 0.5 + 'px';
            this.bdrAFTop.style.width = parseInt(this.bdrAFRight.style.left, 10) - parseInt(this.bdrAFLeft.style.left, 10)
                - firstCellLeft + 1 + 'px';
            if (totalWidth <= (parseInt(this.bdrAFTop.style.width, 10) + parseInt(this.bdrAFTop.style.left, 10))) {
                let leftRemove: number = (parseInt(this.bdrAFTop.style.width, 10) + parseInt(this.bdrAFTop.style.left, 10)) - totalWidth;
                this.bdrAFTop.style.width = parseInt(this.bdrAFTop.style.width, 10) - leftRemove + 'px';
            }
        } else {
            let scrolloffSet: number = (parentsUntil(this.startAFCell, literals.movableContent) ||
                parentsUntil(this.startAFCell, literals.movableHeader)) ? stOff.right -
                (this.startAFCell as HTMLElement).offsetParent.parentElement.getBoundingClientRect().width -
                parentRect.left : 0;
            this.bdrAFLeft.style.right = parentRect.right - endOff.right - 2 + endOff.width + 'px';

            this.bdrAFLeft.style.width = totalWidth <= parseInt(this.bdrAFLeft.style.right, 10) ? '0px' : '2px';
            this.bdrAFRight.style.right = parentRect.right - stOff.right - firstCellLeft + scrolloffSet - 1 + 'px';

            this.bdrAFTop.style.left = endOff.left - parentRect.left - 0.5 + 'px';
            this.bdrAFTop.style.width = parseInt(this.bdrAFLeft.style.right, 10) - parseInt(this.bdrAFRight.style.right, 10)
                - firstCellLeft + 1 + 'px';
            if (parseInt(this.bdrAFTop.style.left, 10) < 0) {
                this.bdrAFTop.style.width = parseInt(this.bdrAFTop.style.width, 10) + parseInt(this.bdrAFTop.style.left, 10) + 'px';
                this.bdrAFTop.style.left = '0px';
            }
        }

        this.bdrAFLeft.style.top = stOff.top - parentRect.top - firstCellTop + scrollTop + 'px';
        this.bdrAFLeft.style.height = endOff.top - stOff.top > 0 ?
            (endOff.top - parentOff.top + endOff.height + 1) - (stOff.top - parentOff.top) + firstCellTop - rowHeight - scrollTop + 'px' :
            endOff.height + firstCellTop - rowHeight - scrollTop + 'px';

        this.bdrAFRight.style.top = this.bdrAFLeft.style.top;
        this.bdrAFRight.style.height = parseInt(this.bdrAFLeft.style.height, 10) + 'px';

        this.bdrAFTop.style.top = this.bdrAFRight.style.top;

        this.bdrAFBottom.style.left = this.bdrAFTop.style.left;
        this.bdrAFBottom.style.top = parseFloat(this.bdrAFLeft.style.top) + parseFloat(this.bdrAFLeft.style.height) - top - 1 + 'px';
        this.bdrAFBottom.style.width = totalHeight <=  parseFloat(this.bdrAFBottom.style.top) ? '0px' :  this.bdrAFTop.style.width;
        if (totalHeight <= (parseInt(this.bdrAFLeft.style.height, 10) + parseInt(this.bdrAFLeft.style.top, 10))) {
            let topRemove: number = parseInt(this.bdrAFLeft.style.height, 10) + parseInt(this.bdrAFLeft.style.top, 10) - totalHeight;
            this.bdrAFLeft.style.height = parseInt(this.bdrAFLeft.style.height, 10) - topRemove + 'px';
            this.bdrAFRight.style.height = parseInt(this.bdrAFLeft.style.height, 10) + 'px';
        }
    }

    private createAFBorders(): void {
        if (!this.bdrAFLeft) {
            this.bdrAFLeft = this.parent.element.appendChild(
                createElement('div', { className: 'e-xlselaf', id: this.parent.element.id + '_bdrafleft', styles: 'width: 2px;' }));
            this.bdrAFRight = this.parent.element.appendChild(
                createElement('div', { className: 'e-xlselaf', id: this.parent.element.id + '_bdrafright', styles: 'width: 2px;' }));
            this.bdrAFBottom = this.parent.element.appendChild(
                createElement('div', { className: 'e-xlselaf', id: this.parent.element.id + '_bdrafbottom', styles: 'height: 2px;' }));
            this.bdrAFTop = this.parent.element.appendChild(
                createElement('div', { className: 'e-xlselaf', id: this.parent.element.id + '_bdraftop', styles: 'height: 2px;' }));
        }
    }

    private showAFBorders(): void {
        if (this.bdrAFLeft) {
            this.bdrAFLeft.style.display = '';
            this.bdrAFRight.style.display = '';
            this.bdrAFBottom.style.display = '';
            this.bdrAFTop.style.display = '';
        }
    }

    private hideAFBorders(): void {
        if (this.bdrAFLeft) {
            this.bdrAFLeft.style.display = 'none';
            this.bdrAFRight.style.display = 'none';
            this.bdrAFBottom.style.display = 'none';
            this.bdrAFTop.style.display = 'none';
        }
    }

    private updateValue(rIdx: number, cIdx: number, cell: HTMLElement): void {
        let args: BeforeAutoFillEventArgs = this.createBeforeAutoFill(rIdx, cIdx, cell);
        if (!args.cancel) {
            let col: Column = this.parent.getColumnByIndex(cIdx);
            if (this.parent.editModule && cell) {
                if (col.type === 'number') {
                    this.parent.editModule.updateCell(rIdx, col.field, parseInt(args.value, 10));
                } else {
                    this.parent.editModule.updateCell(rIdx, col.field, args.value);
                }
            }
        }
    }

    private createBeforeAutoFill(rowIndex: number, colIndex: number, cell: HTMLElement): BeforeAutoFillEventArgs {
        let col: Column = this.parent.getColumnByIndex(colIndex);
        let args: BeforeAutoFillEventArgs = {
            column: col,
            value: cell.innerText
        };
        this.parent.trigger(events.beforeAutoFill, args);
        return args;
    }

    private getAutoFillCells(rowIndex: number, startCellIdx: number): HTMLElement[] {
        let cls: string = '.e-cellselectionbackground';
        let cells: HTMLElement[] = [].slice.call(this.parent.getDataRows()[rowIndex].querySelectorAll(cls));
        if (this.parent.isFrozenGrid()) {
            cells = cells.concat([].slice.call(this.parent.getMovableDataRows()[rowIndex].querySelectorAll(cls)));
            if (this.parent.getFrozenMode() === literals.leftRight) {
                cells = cells.concat([].slice.call(this.parent.getFrozenRightDataRows()[rowIndex].querySelectorAll(cls)));
            }
        }
        return cells;
    }

    /* tslint:disable-next-line:max-func-body-length */
    private selectLikeAutoFill(e: MouseEvent, isApply?: boolean): void {
        let startrowIdx: number = parseInt(parentsUntil(this.startAFCell, literals.row).getAttribute(literals.ariaRowIndex), 10);
       let startCellIdx: number = parseInt(this.startAFCell.getAttribute(literals.ariaColIndex), 10);
        let endrowIdx: number = parseInt(parentsUntil(this.endAFCell, literals.row).getAttribute(literals.ariaRowIndex), 10);
        let endCellIdx: number = parseInt(this.endAFCell.getAttribute(literals.ariaColIndex), 10);
        let rowLen: number = this.selectedRowCellIndexes.length - 1;
        let colLen: number = this.selectedRowCellIndexes[0].cellIndexes.length - 1;
        switch (true) { //direction         
            case !isApply && this.endAFCell.classList.contains('e-cellselectionbackground') &&
                !!parentsUntil(e.target as Element, literals.rowCell)
                :
                this.startAFCell = this.parent.getCellFromIndex(startrowIdx, startCellIdx);
                this.endAFCell = this.parent.getCellFromIndex(startrowIdx + rowLen, startCellIdx + colLen);
                this.drawAFBorders();
                break;
            case this.autoFillRLselection && startCellIdx + colLen < endCellIdx && //right
                endCellIdx - startCellIdx - colLen + 1 > endrowIdx - startrowIdx - rowLen // right bottom
                && endCellIdx - startCellIdx - colLen + 1 > startrowIdx - endrowIdx: //right top
                this.endAFCell = this.parent.getCellFromIndex(startrowIdx + rowLen, endCellIdx);
                endrowIdx = parseInt(parentsUntil(this.endAFCell, literals.row).getAttribute(literals.ariaRowIndex), 10);
                endCellIdx = parseInt(this.endAFCell.getAttribute(literals.ariaColIndex), 10);
                if (!isApply) {
                    this.drawAFBorders();
                } else {
                   let cellIdx: number = parseInt(this.endCell.getAttribute(literals.ariaColIndex), 10);
                    for (let i: number = startrowIdx; i <= endrowIdx; i++) {
                        let cells: HTMLElement[] = this.getAutoFillCells(i, startCellIdx);
                        let c: number = 0;
                        for (let j: number = cellIdx + 1; j <= endCellIdx; j++) {
                            if (c > colLen) {
                                c = 0;
                            }
                            this.updateValue(i, j, cells[c]);
                            c++;
                        }
                    }
                    this.selectCellsByRange(
                        { rowIndex: startrowIdx, cellIndex: this.startCellIndex },
                        { rowIndex: endrowIdx, cellIndex: endCellIdx });
                }
                break;
            case this.autoFillRLselection && startCellIdx > endCellIdx && // left
                startCellIdx - endCellIdx + 1 > endrowIdx - startrowIdx - rowLen && //left top
                startCellIdx - endCellIdx + 1 > startrowIdx - endrowIdx: // left bottom
                this.startAFCell = this.parent.getCellFromIndex(startrowIdx, endCellIdx);
                this.endAFCell = this.endCell;
                if (!isApply) {
                    this.drawAFBorders();
                } else {
                    for (let i: number = startrowIdx; i <= startrowIdx + rowLen; i++) {
                        let cells: HTMLElement[] = this.getAutoFillCells(i, startCellIdx);
                        cells.reverse();
                        let c: number = 0;
                        for (let j: number = this.startCellIndex - 1; j >= endCellIdx; j--) {
                            if (c > colLen) {
                                c = 0;
                            }
                            this.updateValue(i, j, cells[c]);
                            c++;
                        }
                    }
                    this.selectCellsByRange(
                        { rowIndex: startrowIdx, cellIndex: endCellIdx },
                        { rowIndex: startrowIdx + rowLen, cellIndex: this.startCellIndex + colLen });
                }
                break;
            case startrowIdx > endrowIdx: //up
                this.startAFCell = this.parent.getCellFromIndex(endrowIdx, startCellIdx);
                this.endAFCell = this.endCell;
                if (!isApply) {
                    this.drawAFBorders();
                } else {
                    let trIdx: number = parseInt(this.endCell.parentElement.getAttribute(literals.ariaRowIndex), 10);
                    let r: number = trIdx;
                    for (let i: number = startrowIdx - 1; i >= endrowIdx; i--) {
                        if (r === this.startIndex - 1) {
                            r = trIdx;
                        }
                        let cells: HTMLElement[] = this.getAutoFillCells(r, startCellIdx);
                        let c: number = 0;
                        r--;
                        for (let j: number = this.startCellIndex; j <= this.startCellIndex + colLen; j++) {
                            this.updateValue(i, j, cells[c]);
                            c++;
                        }
                    }
                    this.selectCellsByRange(
                        { rowIndex: endrowIdx, cellIndex: startCellIdx + colLen },
                        { rowIndex: startrowIdx + rowLen, cellIndex: startCellIdx });
                }
                break;
            default:                //down
                this.endAFCell = this.parent.getCellFromIndex(endrowIdx, startCellIdx + colLen);
                if (!isApply) {
                    this.drawAFBorders();
                } else {
                    let trIdx: number = parseInt(this.endCell.parentElement.getAttribute(literals.ariaRowIndex), 10);
                    let r: number = this.startIndex;
                    for (let i: number = trIdx + 1; i <= endrowIdx; i++) {
                        if (r === trIdx + 1) {
                            r = this.startIndex;
                        }
                        let cells: HTMLElement[] = this.getAutoFillCells(r, startCellIdx);
                        r++;
                        let c: number = 0;
                        for (let m: number = this.startCellIndex; m <= this.startCellIndex + colLen; m++) {
                            this.updateValue(i, m, cells[c]);
                            c++;
                        }
                    }
                    this.selectCellsByRange(
                        { rowIndex: trIdx - rowLen, cellIndex: startCellIdx }, { rowIndex: endrowIdx, cellIndex: startCellIdx + colLen });
                }
                break;
        }
    }

    private mouseUpHandler(e: MouseEventArgs): void {
        document.body.classList.remove('e-disableuserselect');
        if (this.element) {
            remove(this.element);
        }
        if (this.isDragged && this.selectedRowCellIndexes.length === 1 && this.selectedRowCellIndexes[0].cellIndexes.length === 1) {
            this.mUPTarget = parentsUntil(e.target as Element, literals.rowCell);
        } else {
            this.mUPTarget = null;
        }
        if (this.isDragged && !this.isAutoFillSel && this.selectionSettings.mode === 'Cell' ) {
            let target: Element = e.target as Element;
            let rowIndex: number = parseInt(target.parentElement.getAttribute(literals.ariaRowIndex), 10);
            let cellIndex: number =  parseInt(target.getAttribute(literals.ariaColIndex), 10);
            this.isDragged = false;
            this.clearCellSelection();
            this.selectCellsByRange(
                { rowIndex: this.startDIndex, cellIndex: this.startDCellIndex },
                { rowIndex: rowIndex, cellIndex: cellIndex });
        }
        this.isDragged = false;
        this.updateAutoFillPosition();
        if (this.isAutoFillSel) {
            let lastCell: Element = parentsUntil(e.target as Element, literals.rowCell);
            this.endAFCell = lastCell ? lastCell : this.endCell === this.endAFCell ? this.startAFCell : this.endAFCell;
            this.startAFCell = this.startCell;
            this.updateStartCellsIndex();
            this.selectLikeAutoFill(e, true);
            this.updateAutoFillPosition();
            this.hideAFBorders();
            this.positionBorders();
            this.isAutoFillSel = false;
        }
        EventHandler.remove(this.parent.getContent(), 'mousemove', this.mouseMoveHandler);
        if (this.parent.frozenRows) {
            EventHandler.remove(this.parent.getHeaderContent(), 'mousemove', this.mouseMoveHandler);
        }
        EventHandler.remove(document, 'mouseup', this.mouseUpHandler);
    }

    private hideAutoFill(): void {
        if (this.autofill) {
            this.autofill.style.display = 'none';
        }
    }
    /**
     * @hidden
     */
    public updateAutoFillPosition(): void {
        if (this.parent.enableAutoFill && !this.parent.isEdit &&
            this.selectionSettings.cellSelectionMode.indexOf('Box') > -1 && !this.isRowType() && !this.isSingleSel()
            && this.selectedRowCellIndexes.length) {
            let index: number = parseInt(this.target.getAttribute(literals.ariaColIndex), 10);
            let rindex: number = parseInt(this.target.getAttribute('index'), 10);
            let rowIndex: number = this.selectedRowCellIndexes[this.selectedRowCellIndexes.length - 1].rowIndex;
            let cells: Element[] = this.getAutoFillCells(rowIndex, index).filter((ele: HTMLElement) => ele.style.display === '');
            let col: Column = this.parent.getColumnByIndex(index);
            let isFrozenCol: Boolean = col.getFreezeTableName() === 'movable';
            let isFrozenRow: Boolean = rindex < this.parent.frozenRows;
            let isFrozenRight: boolean = this.parent.getFrozenMode() === literals.leftRight && col.getFreezeTableName() === literals.frozenRight;
            if (!select('#' + this.parent.element.id + '_autofill', parentsUntil(this.target, literals.table))) {
                if (select('#' + this.parent.element.id + '_autofill', this.parent.element)) {
                    select('#' + this.parent.element.id + '_autofill', this.parent.element).remove();
                }
                this.autofill = createElement(
                    'div', { className: 'e-autofill', id: this.parent.element.id + '_autofill' });
                this.autofill.style.display = 'none';
                !isFrozenRow ? !isFrozenCol ? this.parent.getContentTable().parentElement.appendChild(this.autofill) :
                    this.parent.contentModule.getMovableContent().appendChild(this.autofill) :
                    !isFrozenCol ? this.parent.getHeaderTable().parentElement.appendChild(this.autofill) :
                        this.parent.headerModule.getMovableHeader().appendChild(this.autofill);
                if (isFrozenRight) {
                    isFrozenRow ? this.parent.getFrozenRightHeader().appendChild(this.autofill)
                        : this.parent.getFrozenRightContent().appendChild(this.autofill);
                }
            }
            let cell: HTMLElement = cells[cells.length - 1] as HTMLElement;
            if (cell && cell.offsetParent) {
                let clientRect: ClientRect = cell.getBoundingClientRect();
                let parentOff: ClientRect = cell.offsetParent.getBoundingClientRect();
                let colWidth: number = this.isLastCell(cell) ? 4 : 0;
                let rowHeight: number = this.isLastRow(cell) ? 3 : 0;
                if (!this.parent.enableRtl) {
                    this.autofill.style.left = clientRect.left - parentOff.left + clientRect.width - 4 - colWidth + 'px';
                } else {
                    this.autofill.style.right = parentOff.right - clientRect.right + clientRect.width - 4 - colWidth + 'px';
                }
                this.autofill.style.top = clientRect.top - parentOff.top + clientRect.height - 5 - rowHeight + 'px';
            }
            this.autofill.style.display = '';
        } else {
            this.hideAutoFill();
        }
    }

    private mouseDownHandler(e: MouseEventArgs): void {
        this.mouseButton = e.button;
        let target: Element = e.target as Element;
        let gObj: IGrid = this.parent;
        let isDrag: boolean;
        let gridElement: Element = parentsUntil(target, 'e-grid');
        if (gridElement && gridElement.id !== gObj.element.id || parentsUntil(target, literals.headerContent) && !this.parent.frozenRows ||
            parentsUntil(target, 'e-editedbatchcell') || parentsUntil(target, literals.editedRow)) {
            return;
        }
        if (e.shiftKey || e.ctrlKey) {
            e.preventDefault();
        }
        if (parentsUntil(target, literals.rowCell) && !e.shiftKey && !e.ctrlKey) {

            if (gObj.selectionSettings.cellSelectionMode.indexOf('Box') > -1 && !this.isRowType() && !this.isSingleSel()) {
                this.isCellDrag = true;
                isDrag = true;
            } else if (gObj.allowRowDragAndDrop && !gObj.isEdit && !this.parent.selectionSettings.checkboxOnly) {
                if (!this.isRowType() || this.isSingleSel() || closest(target, 'td').classList.contains('e-selectionbackground')) {
                    this.isDragged = false;
                    return;
                }
                isDrag = true;
                this.element = this.parent.createElement('div', { className: 'e-griddragarea' });
                gObj.getContent().appendChild(this.element);
            }
            if (isDrag) {
                this.enableDrag(e, true);
            }
       }
        this.updateStartEndCells();
        if (target.classList.contains('e-autofill') || target.classList.contains('e-xlsel')) {
            this.isCellDrag = true;
            this.isAutoFillSel = true;
            this.enableDrag(e);
        }
    }

    private updateStartEndCells(): void {
        let cells: Element[] = [].slice.call(this.parent.element.getElementsByClassName('e-cellselectionbackground'));
        this.startCell = cells[0];
        this.endCell = cells[cells.length - 1];
        if (this.startCell) {
            this.startIndex = parseInt(this.startCell.parentElement.getAttribute(literals.ariaRowIndex), 10);
            this.startCellIndex = parseInt(parentsUntil(this.startCell, literals.rowCell).getAttribute(literals.ariaColIndex), 10);
        }
    }

    private updateStartCellsIndex(): void {
        if (this.startCell) {
            this.startIndex = parseInt(this.startCell.parentElement.getAttribute(literals.ariaRowIndex), 10);
            this.startCellIndex = parseInt(parentsUntil(this.startCell, literals.rowCell).getAttribute(literals.ariaColIndex), 10);
        }
    }

    private enableDrag(e: MouseEventArgs, isUpdate?: boolean): void {
        let gObj: IGrid = this.parent;

        if (isUpdate) {
            let tr: Element = closest(e.target as Element, 'tr');
            this.startDIndex = parseInt(tr.getAttribute(literals.ariaRowIndex), 10);
            this.startDCellIndex = parseInt(parentsUntil(e.target as Element, literals.rowCell).getAttribute(literals.ariaColIndex), 10);
        }

        document.body.classList.add('e-disableuserselect');
        let gBRect: ClientRect = gObj.element.getBoundingClientRect();
        let postion: IPosition = getPosition(e);
        this.x = postion.x - gBRect.left;
        this.y = postion.y - gBRect.top;

        EventHandler.add(gObj.getContent(), 'mousemove', this.mouseMoveHandler, this);
        if (this.parent.frozenRows) {
            EventHandler.add(gObj.getHeaderContent(), 'mousemove', this.mouseMoveHandler, this);
        }
        EventHandler.add(document, 'mouseup', this.mouseUpHandler, this);
    }

    private clearSelAfterRefresh(e: { requestType: string }): void {
        let isInfiniteScroll: boolean = this.parent.enableInfiniteScrolling && e.requestType === 'infiniteScroll';
        if (e.requestType !== 'virtualscroll' && !this.parent.isPersistSelection && !isInfiniteScroll) {
            this.clearSelection();
        }
    }

    /**
     * @hidden
     */
    public addEventListener(): void {
        if (this.parent.isDestroyed) { return; }
        this.evtHandlers = [{ event: events.uiUpdate, handler: this.enableAfterRender },
        { event: events.initialEnd, handler: this.initializeSelection },
        { event: events.rowSelectionComplete, handler: this.onActionComplete },
        { event: events.cellSelectionComplete, handler: this.onActionComplete },
        { event: events.inBoundModelChanged, handler: this.onPropertyChanged },
        { event: events.cellFocused, handler: this.onCellFocused },
        { event: events.beforeFragAppend, handler: this.clearSelAfterRefresh },
        { event: events.columnPositionChanged, handler: this.columnPositionChanged },
        { event: events.contentReady, handler: this.initialEnd },
        { event: events.rowsRemoved, handler: this.rowsRemoved },
        { event: events.headerRefreshed, handler: this.refreshHeader },
        ];
        addRemoveEventListener(this.parent, this.evtHandlers, true, this);
        this.actionBeginFunction = this.actionBegin.bind(this);
        this.actionCompleteFunction = this.actionComplete.bind(this);
        this.parent.addEventListener(events.actionBegin, this.actionBeginFunction);
        this.parent.addEventListener(events.actionComplete, this.actionCompleteFunction);
        this.addEventListener_checkbox();
    }
    /**
     * @hidden
     */
    public removeEventListener(): void {
        if (this.parent.isDestroyed) { return; }
        addRemoveEventListener(this.parent, this.evtHandlers, false);
        this.parent.removeEventListener(events.actionBegin, this.actionBeginFunction);
        this.parent.removeEventListener(events.actionComplete, this.actionCompleteFunction);
        this.removeEventListener_checkbox();
    }

    private wireEvents(): void {
        this.isMacOS = navigator.userAgent.indexOf('Mac OS') !== -1;
        if (this.isMacOS) {
            EventHandler.add(this.parent.element, 'keydown', this.keyDownHandler, this);
            EventHandler.add(this.parent.element, 'keyup', this.keyUpHandler, this);
        }
    }

    private unWireEvents(): void {
        if (this.isMacOS) {
            EventHandler.remove(this.parent.element, 'keydown', this.keyDownHandler);
            EventHandler.remove(this.parent.element, 'keyup', this.keyUpHandler);
        }
    }

    private columnPositionChanged(): void {
        if (!this.parent.isPersistSelection) {
            this.clearSelection();
        }
    }

    private refreshHeader(): void {
        this.setCheckAllState();
    }

    private rowsRemoved(e: { records: Object[] }): void {
        for (let i: number = 0; i < e.records.length; i++) {
            delete (this.selectedRowState[e.records[i][this.primaryKey]]);
            --this.totalRecordsCount;
        }
        this.setCheckAllState();
    };

    public beforeFragAppend(e: { requestType: string }): void {
        if (e.requestType !== 'virtualscroll' && !this.parent.isPersistSelection) {
            this.clearSelection();
        }
    };

    private getCheckAllBox(): HTMLInputElement {
        return this.parent.getHeaderContent().querySelector('.e-checkselectall') as HTMLInputElement;
    }

    private enableAfterRender(e: NotifyArgs): void {
        if (e.module === this.getModuleName() && e.enable) {
            this.render();
            this.initPerisistSelection();
        }
    }

    private render(e?: NotifyArgs): void {
        EventHandler.add(this.parent.getContent(), 'mousedown', this.mouseDownHandler, this);
        EventHandler.add(this.parent.getHeaderContent(), 'mousedown', this.mouseDownHandler, this);
    }

    private onPropertyChanged(e: { module: string, properties: SelectionSettings }): void {
        if (e.module !== this.getModuleName()) {
            return;
        }
        let gObj: IGrid = this.parent;
        if (!isNullOrUndefined(e.properties.type) && this.selectionSettings.type === 'Single') {
            if (this.selectedRowCellIndexes.length > 1) {
                this.clearCellSelection();
                this.prevCIdxs = undefined;
            }
            if (this.selectedRowIndexes.length > 1) {
                this.clearRowSelection();
                this.prevRowIndex = undefined;
            }
            if (this.selectedColumnsIndexes.length > 1) {
                this.clearColumnSelection();
                this.prevColIndex = undefined;
            }
            this.enableSelectMultiTouch = false;
            this.hidePopUp();
        }

        if (!isNullOrUndefined(e.properties.mode) ||
            !isNullOrUndefined(e.properties.cellSelectionMode)) {
            this.clearSelection();
            this.prevRowIndex = undefined;
            this.prevCIdxs = undefined;
            this.prevColIndex = undefined;
        }
        this.isPersisted = true;
        this.checkBoxSelectionChanged();
        this.isPersisted = false;
        this.initPerisistSelection();
        let checkboxColumn: Column[] = this.parent.getColumns().filter((col: Column) => col.type === 'checkbox');
        if (checkboxColumn.length) {
            gObj.isCheckBoxSelection = !(this.selectionSettings.checkboxMode === 'ResetOnRowClick');
        }
        this.drawBorders();
   }

    private hidePopUp(): void {
        if (this.parent.element.querySelector('.e-gridpopup').getElementsByClassName('e-rowselect').length) {
            (this.parent.element.querySelector('.e-gridpopup') as HTMLElement).style.display = 'none';
        }
    }

    private initialEnd(e: { rows: Row<Column>[], args: NotifyArgs }): void {
        let isFrozen: boolean = this.parent.isFrozenGrid();
        let isLeftRightFrozen: boolean = this.parent.getFrozenMode() === literals.leftRight;
        if (!isFrozen || (isFrozen && (!isLeftRightFrozen && !e.args.isFrozen)
            || (isLeftRightFrozen && e.args.renderFrozenRightContent))) {
            this.parent.off(events.contentReady, this.initialEnd);
            this.selectRow(this.parent.selectedRowIndex);
        }
    }

    private checkBoxSelectionChanged(): void {
        this.parent.off(events.contentReady, this.checkBoxSelectionChanged);
        let gobj: IGrid = this.parent;
        let checkboxColumn: Column[] = gobj.getColumns().filter((col: Column) => col.type === 'checkbox');
        if (checkboxColumn.length > 0) {
            gobj.isCheckBoxSelection = true;
            this.chkField = checkboxColumn[0].field;
            this.totalRecordsCount = this.parent.pageSettings.totalRecordsCount;
            if (isNullOrUndefined(this.totalRecordsCount)) {
                this.totalRecordsCount = this.getCurrentBatchRecordChanges().length;
            }
            if (this.isSingleSel()) {
                gobj.selectionSettings.type = 'Multiple';
                gobj.dataBind();
            } else {
                this.initPerisistSelection();
            }
        }
        if (!gobj.isCheckBoxSelection && !this.isPersisted) {
            this.chkField = null;
            this.initPerisistSelection();
        }
    }

    private initPerisistSelection(): void {
        let gobj: IGrid = this.parent;
        if (this.parent.selectionSettings.persistSelection && this.parent.getPrimaryKeyFieldNames().length > 0) {
            gobj.isPersistSelection = true;
            this.ensureCheckboxFieldSelection();
        } else if (this.parent.getPrimaryKeyFieldNames().length > 0) {
            gobj.isPersistSelection = false;
            this.ensureCheckboxFieldSelection();
        } else {
            gobj.isPersistSelection = false;
            this.selectedRowState = {};
        }
    }

    private ensureCheckboxFieldSelection(): void {
        let gobj: IGrid = this.parent;
        this.primaryKey = this.parent.getPrimaryKeyFieldNames()[0];
        if (!gobj.enableVirtualization && this.chkField
            && ((gobj.isPersistSelection && Object.keys(this.selectedRowState).length === 0) ||
                !gobj.isPersistSelection)) {
            let data: Data = this.parent.getDataModule();
            let query: Query = new Query().where(this.chkField, 'equal', true);
            if (!query.params) {
                query.params = this.parent.query.params;
            }
            let dataManager: Promise<Object> = data.getData({} as NotifyArgs, query);
            let proxy: Selection = this;
            this.parent.showSpinner();
            dataManager.then((e: ReturnType) => {
                proxy.dataSuccess(e.result);
                proxy.refreshPersistSelection();
                proxy.parent.hideSpinner();
            });
        }
    }

    private dataSuccess(res: Object[]): void {
        for (let i: number = 0; i < res.length; i++) {
            if (isNullOrUndefined(this.selectedRowState[res[i][this.primaryKey]]) && res[i][this.chkField]) {
                this.selectedRowState[res[i][this.primaryKey]] = res[i][this.chkField];
            }
        }
        this.persistSelectedData = res;
    }

    private setRowSelection(state: boolean): void {
        if (!this.parent.getDataModule().isRemote() && !isBlazor()) {
            if (state) {
                if (this.parent.groupSettings.columns.length) {
                    for (let data of (<{ records?: Object[] }>this.getData()).records) {
                        this.selectedRowState[data[this.primaryKey]] = true;
                    }
                } else {
                    for (let data of this.getData()) {
                        this.selectedRowState[data[this.primaryKey]] = true;
                    }
                }
            } else {
                this.selectedRowState = {};
            }

            // (this.getData()).forEach(function (data) {
            //     this.selectedRowState[data[this.primaryKey]] = true;
            // })
        }
    }

    private getData(): object[] {
        return this.parent.getDataModule().dataManager.executeLocal(this.parent.getDataModule().generateQuery(true));
    }

    private refreshPersistSelection(): void {
        let rows: Element[] = this.parent.getRows();
        if (this.parent.isCheckBoxSelection && this.parent.isFrozenGrid()) {
            let mtbody: Element = this.parent.getMovableContentTbody();
            if (mtbody.querySelector('.e-checkselect')) {
                rows = this.parent.getMovableRows();
            }
            if (this.parent.getFrozenMode() === literals.leftRight) {
                let frtbody: Element = this.parent.getFrozenRightContentTbody();
                if (frtbody.querySelector('.e-checkselect')) {
                    rows = this.parent.getFrozenRightRows();
                }
            }
        }
        this.totalRecordsCount = this.parent.getCurrentViewRecords().length;
        if (this.parent.allowPaging) {
            this.totalRecordsCount = this.parent.pageSettings.totalRecordsCount;
        }
        if (rows !== null && rows.length > 0 && (this.parent.isPersistSelection || this.chkField)) {
            let indexes: number[] = [];
            for (let j: number = 0; j < rows.length; j++) {
                let rowObj: Row<Column> = this.getRowObj(rows[j]);
                let pKey: string = rowObj ? rowObj.data ? rowObj.data[this.primaryKey] : null : null;
                if (pKey === null) { return; }
                let checkState: boolean;
                let chkBox: HTMLInputElement = (rows[j].querySelector('.e-checkselect') as HTMLInputElement);
                if (this.selectedRowState[pKey] || (this.parent.checkAllRows === 'Check' &&
                    this.totalRecordsCount === Object.keys(this.selectedRowState).length && this.chkAllCollec.indexOf(pKey) < 0)
                    || (this.parent.checkAllRows === 'Uncheck' && this.chkAllCollec.indexOf(pKey) > 0)
                    || (this.parent.checkAllRows === 'Intermediate' && !isNullOrUndefined(this.chkField) && rowObj.data[this.chkField])
                ) {
                    indexes.push(parseInt(rows[j].getAttribute(literals.ariaRowIndex), 10));
                    checkState = true;
                } else {
                    checkState = false;
                    if (this.checkedTarget !== chkBox && this.parent.isCheckBoxSelection) {
                        removeAddCboxClasses(chkBox.nextElementSibling as HTMLElement, checkState);
                    }
                }
                this.updatePersistCollection(rows[j], checkState);
            }
            this.isSingleSel() && indexes.length > 0 ? this.selectRow(indexes[0], true) : this.selectRows(indexes);
        }
        if (this.parent.isCheckBoxSelection && this.getCurrentBatchRecordChanges().length > 0) {
            this.setCheckAllState();
        }
    }


    private actionBegin(e: { requestType: string }): void {
        if (e.requestType === 'save' && this.parent.isPersistSelection) {
            let editChkBox: HTMLInputElement = this.parent.element.querySelector('.e-edit-checkselect') as HTMLInputElement;
            if (!isNullOrUndefined(editChkBox)) {
                let row: HTMLElement = closest(editChkBox, '.' + literals.editedRow) as HTMLElement;
                if (row) {
                    if (this.parent.editSettings.mode === 'Dialog') {
                        row = this.parent.element.querySelector('.e-dlgeditrow') as HTMLElement;
                    }
                    let rowObj: Row<Column> = this.getRowObj(row);
                    if (!rowObj) { return; }
                    this.selectedRowState[rowObj.data[this.primaryKey]] = rowObj.isSelected = editChkBox.checked;
                } else {
                    this.isCheckedOnAdd = editChkBox.checked;
                }
            }
        }
    }

    private actionComplete(e: { requestType: string, action: string, selectedRow: number, data: Object[] }): void {
        if (e.requestType === 'save' && this.parent.isPersistSelection) {
            if (e.action === 'add' && this.isCheckedOnAdd) {
                let rowObj: Row<Column> = this.parent.getRowObjectFromUID(this.parent.getRows()[e.selectedRow].getAttribute('data-uid'));
                this.selectedRowState[rowObj.data[this.primaryKey]] = rowObj.isSelected = this.isCheckedOnAdd;
            }
            this.refreshPersistSelection();
        }
        if (e.requestType === 'delete' && this.parent.isPersistSelection) {
            let records: object[] = e.data;
            let data: Object[] = records.slice();
            for (let i: number = 0; i < data.length; i++) {
                if (!isNullOrUndefined(data[i][this.primaryKey])) {
                    this.updatePersistDelete(data[i][this.primaryKey]);
                }
            }
            this.setCheckAllState();
            this.totalRecordsCount = this.parent.pageSettings.totalRecordsCount;
        }
        if (e.requestType === 'paging') {
            this.prevRowIndex = undefined;
            this.prevCIdxs = undefined;
            this.prevECIdxs = undefined;
        }
    }

    private onDataBound(): void {
        if (!this.parent.enableVirtualization && this.parent.isPersistSelection) {
            if (this.selectedRecords.length) {
                this.isPrevRowSelection = true;
            }
            this.refreshPersistSelection();
        }
        if (this.parent.enableVirtualization) {
            this.setCheckAllState();
        }
        this.initialRowSelection = this.isRowType() && this.parent.element.querySelectorAll('.e-selectionbackground') &&
            this.parent.getSelectedRows().length ? true : false;
        if (this.parent.isCheckBoxSelection && !this.initialRowSelection) {
            let totalRecords: Row<Column>[] = this.parent.getRowsObject();
            let indexes: number[] = [];
            for (let i: number = 0; i < totalRecords.length; i++) {
                if (totalRecords[i].isSelected) {
                    indexes.push(i);
                }
            }
            if (indexes.length) {
                this.selectRows(indexes);
            }
            this.initialRowSelection = true;
        }
    }

    private updatePersistSelectedData(checkState: boolean): void {
        if (this.parent.isPersistSelection) {
            let rows: Element[] = this.parent.getRows();
            for (let i: number = 0; i < rows.length; i++) {
                this.updatePersistCollection(rows[i], checkState);
            }
            if (this.parent.checkAllRows === 'Uncheck') {
                this.setRowSelection(false);
                this.persistSelectedData = this.parent.getDataModule().isRemote() ? this.persistSelectedData : [];
            } else if (this.parent.checkAllRows === 'Check') {
                this.setRowSelection(true);
                this.persistSelectedData = (!this.parent.getDataModule().isRemote() && !isBlazor()) ?
                    this.parent.groupSettings.columns.length ? (<{ records?: Object[] }>this.getData()).records.slice() :
                        this.getData().slice() : this.persistSelectedData;
            }
        }
    }

    private checkSelectAllAction(checkState: boolean): void {
        let cRenderer: IRenderer = this.getRenderer();
        let editForm: HTMLFormElement = this.parent.element.querySelector('.e-gridform') as HTMLFormElement;
        this.checkedTarget = this.getCheckAllBox();
        if (checkState && this.getCurrentBatchRecordChanges().length) {
            this.parent.checkAllRows = 'Check';
            this.updatePersistSelectedData(checkState);
            this.selectRowsByRange(
                cRenderer.getVirtualRowIndex(0),
                cRenderer.getVirtualRowIndex(this.getCurrentBatchRecordChanges().length - 1));
        } else {
            this.parent.checkAllRows = 'Uncheck';
            this.updatePersistSelectedData(checkState);
            this.clearSelection();
        }
        this.chkAllCollec = [];
        if (!isNullOrUndefined(editForm)) {
            let editChkBox: HTMLElement = editForm.querySelector('.e-edit-checkselect') as HTMLElement;
            if (!isNullOrUndefined(editChkBox)) {
                removeAddCboxClasses(editChkBox.nextElementSibling as HTMLElement, checkState);
            }
        }
    }

    private checkSelectAll(checkBox: HTMLInputElement): void {
        let stateStr: string = this.getCheckAllStatus(checkBox);
        let state: boolean = stateStr === 'Check';
        this.isHeaderCheckboxClicked = true;
        if (stateStr === 'Intermediate') {
            state = this.getCurrentBatchRecordChanges().some((data: Object) =>
                data[this.primaryKey] in this.selectedRowState);
        }
        if (this.parent.isPersistSelection && this.parent.allowPaging) {
            this.totalRecordsCount = this.parent.pageSettings.totalRecordsCount;
        }
        this.checkSelectAllAction(!state);
        this.target = null;
        if (this.getCurrentBatchRecordChanges().length > 0) {
            this.setCheckAllState();
        }
        this.triggerChkChangeEvent(checkBox, !state);
    }

    private getCheckAllStatus(ele?: HTMLElement): CheckState {
        let classes: DOMTokenList = ele ? ele.nextElementSibling.classList :
            this.getCheckAllBox().nextElementSibling.classList;
        let status: CheckState;
        if (classes.contains('e-check')) {
            status = 'Check';
        } else if (classes.contains('e-uncheck')) {
            status = 'Uncheck';
        } else if (classes.contains('e-stop')) {
            status = 'Intermediate';
        } else {
            status = 'None';
        }
        return status;
    }

    private checkSelect(checkBox: HTMLInputElement): void {
        let target: HTMLElement = closest(this.checkedTarget, '.' + literals.rowCell) as HTMLElement;
        let gObj: IGrid = this.parent;
        this.isMultiCtrlRequest = true;
        let rIndex: number = 0;
        this.isHeaderCheckboxClicked = false;
        if (isGroupAdaptive(gObj)) {
            let uid: string = target.parentElement.getAttribute('data-uid');
            rIndex = gObj.getRows().map((m: HTMLTableRowElement) => m.getAttribute('data-uid')).indexOf(uid);
        } else {
            rIndex = parseInt(target.parentElement.getAttribute(literals.ariaRowIndex), 10);
        }
        if (this.parent.isPersistSelection && this.parent.element.getElementsByClassName(literals.addedRow).length > 0 &&
            this.parent.editSettings.newRowPosition === 'Top') {
            ++rIndex;
        }
        this.rowCellSelectionHandler(rIndex, parseInt(target.getAttribute(literals.ariaColIndex), 10));
       this.moveIntoUncheckCollection(closest(target, '.' + literals.row) as HTMLElement);
        this.setCheckAllState();
        this.isMultiCtrlRequest = false;
        this.triggerChkChangeEvent(checkBox, checkBox.nextElementSibling.classList.contains('e-check'));
    }

    private moveIntoUncheckCollection(row: HTMLElement): void {
        if (this.parent.checkAllRows === 'Check' || this.parent.checkAllRows === 'Uncheck') {
            let rowObj: Row<Column> = this.getRowObj(row);
            let pKey: string = rowObj && rowObj.data ? rowObj.data[this.primaryKey] : null;
            if (!pKey) { return; }
            if (this.chkAllCollec.indexOf(pKey) < 0) {
                this.chkAllCollec.push(pKey);
            } else {
                this.chkAllCollec.splice(this.chkAllCollec.indexOf(pKey), 1);
            }
        }
    }

   private triggerChkChangeEvent(checkBox: HTMLInputElement, checkState: boolean): void {
        this.parent.trigger(events.checkBoxChange, {
            checked: checkState, selectedRowIndexes: this.parent.getSelectedRowIndexes(),
            target: checkBox
        });
        if (!this.parent.isEdit) {
            this.checkedTarget = null;
        }
    }

    private updateSelectedRowIndex(index?: number): void {
        if (this.parent.isCheckBoxSelection && (this.parent.enableVirtualization || this.parent.enableInfiniteScrolling)
            && !this.parent.getDataModule().isRemote()
            && !(isBlazor() && this.parent.isServerRendered)) {
            if (this.parent.checkAllRows === 'Check') {
                this.selectedRowIndexes = [];
                let dataLength: number = this.getData().length;
                for (let data: number = 0; data < dataLength; data++) {
                    this.selectedRowIndexes.push(data);
                }
            } else if (this.parent.checkAllRows === 'Uncheck') {
                this.selectedRowIndexes = [];
            } else {
                if (index && this.parent.getRowByIndex(index).getAttribute('aria-selected') === 'false') {
                    let selectedVal: number = this.selectedRowIndexes.indexOf(index);
                    this.selectedRowIndexes.splice(selectedVal, 1);
                }
            }
        }
    };

    private setCheckAllState(index?: number, isInteraction?: boolean): void {
        if (this.parent.isCheckBoxSelection || this.parent.selectionSettings.checkboxMode === 'ResetOnRowClick') {
            let checkToSelectAll: boolean;
            let checkedLen: number = Object.keys(this.selectedRowState).length;
            if (!this.parent.isPersistSelection) {
                checkedLen = this.selectedRowIndexes.length;
                this.totalRecordsCount = this.getCurrentBatchRecordChanges().length;
            }
            let input: HTMLInputElement = this.getCheckAllBox();
            if (input) {
                let spanEle: HTMLElement = input.nextElementSibling as HTMLElement;
                removeClass([spanEle], ['e-check', 'e-stop', 'e-uncheck']);
                setChecked(input, false);
                input.indeterminate = false;
                if (checkToSelectAll || checkedLen === this.totalRecordsCount && this.totalRecordsCount
                    || ((this.parent.enableVirtualization || this.parent.enableInfiniteScrolling)
                        && !this.parent.allowPaging && !this.parent.getDataModule().isRemote()
                        && !(isBlazor() && this.parent.isServerRendered)
                        && checkedLen === this.getData().length)) {
                    addClass([spanEle], ['e-check']);
                    setChecked(input, true);
                    if (isInteraction) {
                        this.getRenderer().setSelection(null, true, true);
                    }
                    this.parent.checkAllRows = 'Check';
                } else if (!this.selectedRowIndexes.length ||
                           checkedLen === 0 && this.getCurrentBatchRecordChanges().length === 0) {
                    addClass([spanEle], ['e-uncheck']);
                    if (isInteraction) {
                        this.getRenderer().setSelection(null, false, true);
                    }
                    this.parent.checkAllRows = 'Uncheck';
                    if (checkedLen === 0 && this.getCurrentBatchRecordChanges().length === 0) {
                        addClass([spanEle.parentElement], ['e-checkbox-disabled']);
                    } else {
                        removeClass([spanEle.parentElement], ['e-checkbox-disabled']);
                    }
                } else {
                    addClass([spanEle], ['e-stop']);
                    this.parent.checkAllRows = 'Intermediate';
                    input.indeterminate = true;
                }
                if ((this.parent.enableVirtualization || this.parent.enableInfiniteScrolling)
                    && !this.parent.allowPaging && !this.parent.getDataModule().isRemote()) {
                    this.updateSelectedRowIndex(index);
                }
            }
        }
    }

    private keyDownHandler(e: KeyboardEvent): void {
        // Below are keyCode for command key in MAC OS. Safari/Chrome(91-Left command, 93-Right Command), Opera(17), FireFox(224)
        if ((((Browser.info.name === 'chrome') || (Browser.info.name === 'safari')) && (e.keyCode === 91 || e.keyCode === 93)) ||
            (Browser.info.name === 'opera' && e.keyCode === 17) || (Browser.info.name === 'mozilla' && e.keyCode === 224)) {
            this.cmdKeyPressed = true;
        }
    }

    private keyUpHandler(e: KeyboardEvent): void {
        if ((((Browser.info.name === 'chrome') || (Browser.info.name === 'safari')) && (e.keyCode === 91 || e.keyCode === 93)) ||
            (Browser.info.name === 'opera' && e.keyCode === 17) || (Browser.info.name === 'mozilla' && e.keyCode === 224)) {
            this.cmdKeyPressed = false;
        }
    }

    private clickHandler(e: MouseEvent): void {
        let target: HTMLElement = e.target as HTMLElement;
        this.actualTarget = target;
        if (parentsUntil(target, literals.row) || parentsUntil(target, 'e-headerchkcelldiv') ||
            (this.selectionSettings.allowColumnSelection && target.classList.contains('e-headercell'))) {
            this.isInteracted = true;
        }
        this.isMultiCtrlRequest = e.ctrlKey || this.enableSelectMultiTouch ||
            (this.isMacOS && this.cmdKeyPressed);
        this.isMultiShiftRequest = e.shiftKey;
        this.popUpClickHandler(e);
        let chkSelect: boolean = false;
        this.preventFocus = true;
        let checkBox: HTMLInputElement;
        let checkWrap: HTMLElement = parentsUntil(target, 'e-checkbox-wrapper') as HTMLElement;
        this.checkSelectAllClicked = checkWrap && checkWrap.getElementsByClassName('e-checkselectall') ||
            ( this.selectionSettings.persistSelection && parentsUntil(target, literals.row)) ? true : false;
        if (checkWrap && checkWrap.querySelectorAll('.e-checkselect,.e-checkselectall').length > 0) {
            checkBox = checkWrap.querySelector('input[type="checkbox"]') as HTMLInputElement;
            chkSelect = true;
        }
        this.drawBorders();
        this.updateAutoFillPosition();
        target = parentsUntil(target, literals.rowCell) as HTMLElement;
        if ((target && target.parentElement.classList.contains(literals.row) && !this.parent.selectionSettings.checkboxOnly) || chkSelect) {
            if (this.parent.isCheckBoxSelection) {
                this.isMultiCtrlRequest = true;
            }
            this.target = target;
            if (!isNullOrUndefined(checkBox)) {
                this.checkedTarget = checkBox;
                if (checkBox.classList.contains('e-checkselectall')) {
                    this.checkSelectAll(checkBox);
                } else {
                    this.checkSelect(checkBox);
                }
            } else {
                let gObj: IGrid = this.parent; let rIndex: number = 0;
                if (isGroupAdaptive(gObj)) {
                    let uid: string = target.parentElement.getAttribute('data-uid');
                    rIndex = gObj.getRows().map((m: HTMLTableRowElement) => m.getAttribute('data-uid')).indexOf(uid);
                } else {
                    rIndex = parseInt(target.parentElement.getAttribute(literals.ariaRowIndex), 10);
                }
                if (this.parent.isPersistSelection && this.parent.element.getElementsByClassName(literals.addedRow).length > 0) {
                    ++rIndex;
                }
                if (!this.mUPTarget || !this.mUPTarget.isEqualNode(target)) {
                    this.rowCellSelectionHandler(rIndex, parseInt(target.getAttribute(literals.ariaColIndex), 10));
                }
                this.parent.hoverFrozenRows(e);
                if (this.parent.isCheckBoxSelection) {
                    this.moveIntoUncheckCollection(closest(target, '.' + literals.row) as HTMLElement);
                    this.setCheckAllState();
                }
            }
            if (!this.parent.isCheckBoxSelection && Browser.isDevice && !this.isSingleSel()) {
                this.showPopup(e);
            }
        } else if ((e.target as HTMLTableCellElement).classList.contains('e-headercell') &&
            !(e.target as HTMLTableCellElement).classList.contains('e-stackedheadercell')) {
            let uid: string = (e.target as HTMLTableCellElement).querySelector('.e-headercelldiv').getAttribute('e-mappinguid');
            this.headerSelectionHandler(this.parent.getColumnIndexByUid(uid));
        }
        this.isMultiCtrlRequest = false;
        this.isMultiShiftRequest = false;
        if (isNullOrUndefined(closest(<HTMLElement>e.target, '.e-unboundcell'))) {
            this.preventFocus = false;
        }
    }

    private popUpClickHandler(e: MouseEvent): void {
        let target: Element = e.target as Element;
        if (closest(target, '.e-headercell') || (e.target as HTMLElement).classList.contains(literals.rowCell) ||
            closest(target, '.e-gridpopup')) {
            if (target.classList.contains('e-rowselect')) {
                if (!target.classList.contains('e-spanclicked')) {
                    target.classList.add('e-spanclicked');
                    this.enableSelectMultiTouch = true;
                } else {
                    target.classList.remove('e-spanclicked');
                    this.enableSelectMultiTouch = false;
                    (this.parent.element.querySelector('.e-gridpopup') as HTMLElement).style.display = 'none';
                }
            }
        } else {
            (this.parent.element.querySelector('.e-gridpopup') as HTMLElement).style.display = 'none';
        }
    }

    private showPopup(e: MouseEvent): void {
        if (!this.selectionSettings.enableSimpleMultiRowSelection) {
            setCssInGridPopUp(
                <HTMLElement>this.parent.element.querySelector('.e-gridpopup'), e,
                'e-rowselect e-icons e-icon-rowselect' +
                (!this.isSingleSel() && (this.selectedRecords.length > (this.parent.getFrozenColumns() ? 2 : 1)
                    || this.selectedRowCellIndexes.length > 1) ? ' e-spanclicked' : ''));
        }
    }

    private rowCellSelectionHandler(rowIndex: number, cellIndex: number): void {
        let gObj: IGrid = this.parent;
        if ((!this.isMultiCtrlRequest && !this.isMultiShiftRequest) || this.isSingleSel()) {
            if (!this.isDragged) {
                this.selectRow(rowIndex, this.selectionSettings.enableToggle);
            }
            this.selectCell({ rowIndex: rowIndex, cellIndex: cellIndex }, this.selectionSettings.enableToggle);
            if (this.selectedRowCellIndexes.length) {
                this.updateAutoFillPosition();
            }
            this.drawBorders();
        } else if (this.isMultiShiftRequest) {
            if (this.parent.isCheckBoxSelection || (!this.parent.isCheckBoxSelection &&
                !closest(this.target, '.' + literals.rowCell).classList.contains(literals.gridChkBox))) {
                this.selectRowsByRange(isUndefined(this.prevRowIndex) ? rowIndex : this.prevRowIndex, rowIndex);
            } else {
                this.addRowsToSelection([rowIndex]);
            }
            this.selectCellsByRange(
                isUndefined(this.prevCIdxs) ? { rowIndex: rowIndex, cellIndex: cellIndex } : this.prevCIdxs,
                { rowIndex: rowIndex, cellIndex: cellIndex });
            this.updateAutoFillPosition();
            this.drawBorders();
        } else {
            this.addRowsToSelection([rowIndex]);
            this.addCellsToSelection([{ rowIndex: rowIndex, cellIndex: cellIndex }]);
            this.showHideBorders('none');
        }
        this.isDragged = false;
    }

    /* tslint:disable-next-line:max-func-body-length */
    private onCellFocused(e: CellFocusArgs): void {
        if (this.parent.frozenRows && e.container.isHeader && e.byKey) {
            if (e.keyArgs.action === 'upArrow') {
                if (this.parent.allowFiltering) {
                    e.isJump = e.element.tagName === 'INPUT' ? true : false;
                } else {
                    e.isJump = e.element.tagName === 'TH' ? true : false;
                }
            } else {
                if (e.keyArgs.action === 'downArrow') {
                    let rIdx: number = Number(e.element.parentElement.getAttribute(literals.ariaRowIndex));
                    e.isJump = rIdx === 0 ? true : false;
                } else {
                    if (e.keyArgs.action === 'ctrlHome') {
                        e.isJump = true;
                    }
                }
            }
        }
        let clear: boolean = this.parent.isFrozenGrid() ? (((e.container.isHeader && e.element.tagName !== 'TD' && e.isJump &&
            !this.selectionSettings.allowColumnSelection) ||
            ((e.container.isContent || e.element.tagName === 'TD') && !(e.container.isSelectable || e.element.tagName === 'TD')))
            && !(e.byKey && e.keyArgs.action === 'space')) : ((e.container.isHeader && e.isJump) ||
                (e.container.isContent && !e.container.isSelectable)) && !(e.byKey && e.keyArgs.action === 'space')
                 && !(e.element.classList.contains('e-detailrowexpand') || e.element.classList.contains('e-detailrowcollapse'));
        let headerAction: boolean = (e.container.isHeader && e.element.tagName !== 'TD' && !closest(e.element, '.' + literals.rowCell))
            && !(e.byKey && e.keyArgs.action === 'space');
        if (!e.byKey || clear) {
            if (clear && !this.parent.isCheckBoxSelection) { this.clearSelection(); }
            return;
        }
        let [rowIndex, cellIndex]: number[] = e.container.isContent ? e.container.indexes : e.indexes;
        let prev: IIndex = this.focus.getPrevIndexes();
        if (this.parent.frozenRows) {
            if (e.container.isHeader && (e.element.tagName === 'TD' || closest(e.element, '.' + literals.rowCell))) {
                let thLen: number = this.parent.getHeaderTable().querySelector('thead').childElementCount;
                rowIndex -= thLen;
                prev.rowIndex = !isNullOrUndefined(prev.rowIndex) ? prev.rowIndex - thLen : null;
            } else {
                rowIndex += this.parent.frozenRows;
                prev.rowIndex = prev.rowIndex === 0 || !isNullOrUndefined(prev.rowIndex) ? prev.rowIndex + this.parent.frozenRows : null;
            }
        }
        if (this.parent.isFrozenGrid()) {
            let cIdx: number = Number(e.element.getAttribute(literals.ariaColIndex));
            let selectedIndexes: ISelectedCell[] = this.parent.getSelectedRowCellIndexes();
            if (selectedIndexes.length && prev.cellIndex === 0) {
                prev.cellIndex = selectedIndexes[selectedIndexes.length - 1].cellIndexes[0];
            }
            prev.cellIndex = !isNullOrUndefined(prev.cellIndex) ? (prev.cellIndex === cellIndex ? cIdx : cIdx - 1) : null;
            cellIndex = cIdx;
        }
        if ((headerAction || (['ctrlPlusA', 'escape'].indexOf(e.keyArgs.action) === -1 &&
            e.keyArgs.action !== 'space' && rowIndex === prev.rowIndex && cellIndex === prev.cellIndex)) &&
            !this.selectionSettings.allowColumnSelection) { return; }
        this.preventFocus = true;
        let columnIndex: number = this.getKeyColIndex(e);
        if (this.needColumnSelection) {
            cellIndex = columnIndex;
        }
        switch (e.keyArgs.action) {
            case 'downArrow':
            case 'upArrow':
            case 'enter':
            case 'shiftEnter':
                this.target = e.element;
                this.applyDownUpKey(rowIndex, cellIndex);
                break;
            case 'rightArrow':
            case 'leftArrow':
                this.applyRightLeftKey(rowIndex, cellIndex);
                break;
            case 'shiftDown':
            case 'shiftUp':
                this.shiftDownKey(rowIndex, cellIndex);
                break;
            case 'shiftLeft':
            case 'shiftRight':
                this.applyShiftLeftRightKey(rowIndex, cellIndex);
                break;
            case 'home':
            case 'end':
                cellIndex = e.keyArgs.action === 'end' ? this.getLastColIndex(rowIndex) : 0;
                this.applyHomeEndKey(rowIndex, cellIndex);
                break;
            case 'ctrlHome':
            case 'ctrlEnd':
                this.applyCtrlHomeEndKey(rowIndex, cellIndex);
                break;
            case 'escape':
                this.clearSelection();
                break;
            case 'ctrlPlusA':
                this.ctrlPlusA();
                break;
            case 'space':
                this.applySpaceSelection(e.element as HTMLElement);
                break;
            case 'tab':
                if (this.parent.editSettings.allowNextRowEdit) {
                    this.selectRow(rowIndex);
                }
                break;
        }
        this.needColumnSelection = false;
        this.preventFocus = false;
        this.positionBorders();
        this.updateAutoFillPosition();
    }

    private getKeyColIndex(e: CellFocusArgs): number {
        let uid: string;
        let index: number = null;
        let stackedHeader: HTMLElement = (e.element as HTMLTableCellElement).querySelector('.e-stackedheadercelldiv');
        if (this.selectionSettings.allowColumnSelection && parentsUntil(e.element, 'e-columnheader')) {
            this.needColumnSelection =  e.container.isHeader ? true : false;
            if (stackedHeader) {
                if (e.keyArgs.action === 'rightArrow' || e.keyArgs.action === 'leftArrow') {
                    return index;
                }
                uid = stackedHeader.getAttribute('e-mappinguid');
                let innerColumn: Column[] = this.getstackedColumns(this.parent.getColumnByUid(uid).columns as Column[]);
                let lastIndex: number = this.parent.getColumnIndexByUid(innerColumn[innerColumn.length - 1].uid);
                let firstIndex: number = this.parent.getColumnIndexByUid(innerColumn[0].uid);
                index = this.prevColIndex >= lastIndex ? firstIndex : lastIndex;
            } else {
                index = this.parent.getColumnIndexByUid((e.element as HTMLTableCellElement)
                    .querySelector('.e-headercelldiv').getAttribute('e-mappinguid'));
            }
        }
        return index;
    }

    /**
     * Apply ctrl + A key selection
     * @return {void}
     * @hidden
     */
    public ctrlPlusA(): void {
        if (this.isRowType() && !this.isSingleSel()) {
            this.selectRowsByRange(0, this.getCurrentBatchRecordChanges().length - 1);
        }
        if (this.isCellType() && !this.isSingleSel()) {
            this.selectCellsByRange(
                { rowIndex: 0, cellIndex: 0 },
                { rowIndex: this.parent.getRows().length - 1, cellIndex: this.parent.getColumns().length - 1 });
        }
    }

    private applySpaceSelection(target: HTMLElement): void {
        if (target.classList.contains('e-checkselectall')) {
            this.checkedTarget = target as HTMLInputElement;
            this.checkSelectAll(this.checkedTarget);
        } else {
            if (target.classList.contains('e-checkselect')) {
                this.checkedTarget = target as HTMLInputElement;
                this.checkSelect(this.checkedTarget);
            }
        }
    }

    private applyDownUpKey(rowIndex?: number, cellIndex?: number): void {
        let gObj: IGrid = this.parent;
        if (this.parent.isCheckBoxSelection && this.parent.checkAllRows === 'Check' && !this.selectionSettings.persistSelection) {
            this.checkSelectAllAction(false);
            this.checkedTarget = null;
        }
        if (this.isRowType()) {
            if (this.parent.frozenRows) {
                this.selectRow(rowIndex, true);
                this.applyUpDown(gObj.selectedRowIndex);
            } else {
                this.selectRow(rowIndex, true);
                this.applyUpDown(gObj.selectedRowIndex);
            }
        }
        if (this.isCellType()) {
            this.selectCell({ rowIndex, cellIndex }, true);
        }
        if (this.selectionSettings.allowColumnSelection && this.needColumnSelection) {
            this.selectColumn(cellIndex);
        }
    }

    private applyUpDown(rowIndex: number): void {
        if (rowIndex < 0) { return; }
        if (!this.target) {
            this.target = this.parent.getRows()[0].children[this.parent.groupSettings.columns.length || 0];
        }
        let cIndex: number = parseInt(this.target.getAttribute(literals.ariaColIndex), 10);
        let frzCols: number = this.parent.getFrozenColumns();
        if (frzCols) {
            if (cIndex >= frzCols) {
                this.target =
                    this.contentRenderer.getMovableRowByIndex(rowIndex).getElementsByClassName(literals.rowCell)[cIndex - frzCols];
            } else {
                this.target = this.contentRenderer.getRowByIndex(rowIndex).getElementsByClassName(literals.rowCell)[cIndex];
            }
        } else {
            this.target = this.contentRenderer.getRowByIndex(rowIndex).getElementsByClassName(literals.rowCell)[cIndex];
        }
        this.addAttribute(this.target);
    }

    private applyRightLeftKey(rowIndex?: number, cellIndex?: number): void {
        let gObj: IGrid = this.parent;
        if (this.selectionSettings.allowColumnSelection && this.needColumnSelection) {
            this.selectColumn(cellIndex);
        } else if (this.isCellType()) {
            this.selectCell({ rowIndex, cellIndex }, true);
            this.addAttribute(this.target);
        }
    }

    private applyHomeEndKey(rowIndex?: number, cellIndex?: number): void {
        if (this.isCellType()) {
            this.selectCell({ rowIndex, cellIndex }, true);
        } else {
            this.addAttribute(this.parent.getCellFromIndex(rowIndex, cellIndex));
        }
    }

    /**
     * Apply shift+down key selection
     * @return {void}
     * @hidden
     */
    public shiftDownKey(rowIndex?: number, cellIndex?: number): void {
        let gObj: IGrid = this.parent;
        this.isMultiShiftRequest = true;
        if (this.isRowType() && !this.isSingleSel()) {
            if (!isUndefined(this.prevRowIndex)) {
                this.selectRowsByRange(this.prevRowIndex, rowIndex);
                this.applyUpDown(rowIndex);
            } else {
                this.selectRow(0, true);
            }
        }
        if (this.isCellType() && !this.isSingleSel()) {
            this.selectCellsByRange(this.prevCIdxs || { rowIndex: 0, cellIndex: 0 }, { rowIndex, cellIndex });
        }
        this.isMultiShiftRequest = false;
    }

    private applyShiftLeftRightKey(rowIndex?: number, cellIndex?: number): void {
        let gObj: IGrid = this.parent;
        this.isMultiShiftRequest = true;
        if (this.selectionSettings.allowColumnSelection && this.needColumnSelection) {
            this.selectColumnsByRange(this.prevColIndex, cellIndex);
        } else {
            this.selectCellsByRange(this.prevCIdxs, { rowIndex, cellIndex });
        }
        this.isMultiShiftRequest = false;
    }

    private getstackedColumns(column: Column[]): Column[] {
        let innerColumnIndexes: Column[] = [];
        for (let i: number = 0, len: number = column.length; i < len; i++) {
            if (column[i].columns) {
                this.getstackedColumns(column[i].columns as Column[]);
            } else {
                innerColumnIndexes.push(column[i]);
            }
        }
        return innerColumnIndexes;
    }

    private applyCtrlHomeEndKey(rowIndex: number, cellIndex: number): void {
        if (this.isRowType()) {
            this.selectRow(rowIndex, true);
            this.addAttribute(this.parent.getCellFromIndex(rowIndex, cellIndex));
        }
        if (this.isCellType()) {
            this.selectCell({ rowIndex, cellIndex }, true);
        }
    }


    private addRemoveClassesForRow(row: Element, isAdd: boolean, clearAll: boolean, ...args: string[]): void {
        if (row) {
            let cells: Element[] = [].slice.call(row.getElementsByClassName(literals.rowCell));
            let detailIndentCell: Element = row.querySelector('.e-detailrowcollapse') || row.querySelector('.e-detailrowexpand');
            let dragdropIndentCell: Element = row.querySelector('.e-rowdragdrop');
            if (detailIndentCell) { cells.push(detailIndentCell); }
            if (dragdropIndentCell) { cells.push(dragdropIndentCell); }
            addRemoveActiveClasses(cells, isAdd, ...args);
        }
        this.getRenderer().setSelection(row ? row.getAttribute('data-uid') : null, isAdd, clearAll);
    }

    private isRowType(): boolean {
        return this.selectionSettings.mode === 'Row' || this.selectionSettings.mode === 'Both';
    }

    private isCellType(): boolean {
        return this.selectionSettings.mode === 'Cell' || this.selectionSettings.mode === 'Both';
    }

    private isSingleSel(): boolean {
        return this.selectionSettings.type === 'Single';
    }

    private getRenderer(): IRenderer {
        if (isNullOrUndefined(this.contentRenderer)) {
            this.contentRenderer = this.factory.getRenderer(RenderType.Content);
        }
        return this.contentRenderer;
    }

    /**
     * Gets the collection of selected records. 
     * @return {Object[]}
     */
    public getSelectedRecords(): Object[] {
        let selectedData: Object[] = [];
        if (!this.selectionSettings.persistSelection) {
            selectedData = (<Row<Column>[]>this.parent.getRowsObject()).filter((row: Row<Column>) => row.isSelected)
                .map((m: Row<Column>) => m.data);
        } else {
            selectedData = this.persistSelectedData;
        }
        return selectedData;
    }

    /**
     * Select the column by passing start column index
     * @param  {number} startIndex 
     */
    public selectColumn(index: number): void {
        let gObj: IGrid = this.parent;
        if (isNullOrUndefined(gObj.getColumns()[index])) {
            return;
        }
        let column: Column =  gObj.getColumnByIndex(index);
        let selectedCol: Element = gObj.getColumnHeaderByUid(column.uid);
        let isColSelected: boolean = selectedCol.classList.contains('e-columnselection');
        if ((!gObj.selectionSettings.allowColumnSelection)) {
            return;
        }
        let isMultiColumns: boolean = this.selectedColumnsIndexes.length > 1 &&
            this.selectedColumnsIndexes.indexOf(index) > -1;
        this.clearColDependency();
        if (!isColSelected || !this.selectionSettings.enableToggle || isMultiColumns) {
            let args: ColumnSelectingEventArgs = {
                columnIndex: index, headerCell: selectedCol,
                column: column,
                cancel: false, target: this.actualTarget,
                isInteracted: this.isInteracted, previousColumnIndex: this.prevColIndex,
                isCtrlPressed: this.isMultiCtrlRequest, isShiftPressed: this.isMultiShiftRequest
            };
            this.onActionBegin(args, events.columnSelecting);
            if (args.cancel) {
                this.disableInteracted();
                return;
            }
            if (!(gObj.selectionSettings.enableToggle && index === this.prevColIndex && isColSelected) || isMultiColumns) {
                this.updateColSelection(selectedCol, index);
            }
            let selectedArgs: ColumnSelectEventArgs = {
               columnIndex: index, headerCell: selectedCol,
                column: column,
                target: this.actualTarget,
                isInteracted: this.isInteracted, previousColumnIndex: this.prevColIndex
            };
            this.onActionComplete(selectedArgs, events.columnSelected);
        }
        this.updateColProps(index);
    }

    /**
     * Select the columns by passing start and end column index
     * @param  {number} startIndex
     * @param  {number} endIndex  
     */
    public selectColumnsByRange(startIndex: number, endIndex?: number): void {
        let gObj: IGrid = this.parent;
        if (isNullOrUndefined(gObj.getColumns()[startIndex])) {
            return;
        }
        let indexes: number[] = [];
        if (gObj.selectionSettings.type === 'Single' || isNullOrUndefined(endIndex)) {
            indexes[0] = startIndex;
        } else {
            let min: boolean = startIndex < endIndex;
            for (let i: number = startIndex; min ? i <= endIndex : i >= endIndex; min ? i++ : i--) {
                indexes.push(i);
            }
        }
        this.selectColumns(indexes);
    }

    /**
     * Select the columns by passing column indexes
     * @param  {number[]} columnIndexes
     */
    public selectColumns(columnIndexes: number[]): void {
        let gObj: IGrid = this.parent;
        let selectedCol: Element[] | Element = this.getselectedCols();
        if (gObj.selectionSettings.type === 'Single') {
            columnIndexes = [columnIndexes[0]];
        }
        if (!gObj.selectionSettings.allowColumnSelection) {
            return;
        }
        this.clearColDependency();
        let selectingArgs: ColumnSelectingEventArgs = {
            columnIndex: columnIndexes[0], headerCell: selectedCol,
            columnIndexes: columnIndexes,
            column: gObj.getColumnByIndex(columnIndexes[0]),
            cancel: false, target: this.actualTarget,
            isInteracted: this.isInteracted, previousColumnIndex: this.prevColIndex,
            isCtrlPressed: this.isMultiCtrlRequest, isShiftPressed: this.isMultiShiftRequest
        };
        this.onActionBegin(selectingArgs, events.columnSelecting);
        if (selectingArgs.cancel) {
            this.disableInteracted();
            return;
        }
        for (let i: number = 0, len: number = columnIndexes.length; i < len; i++) {
            this.updateColSelection(gObj.getColumnHeaderByUid(gObj.getColumnByIndex(columnIndexes[i]).uid), columnIndexes[i]);
        }
        selectedCol = this.getselectedCols();
        let selectedArgs: ColumnSelectEventArgs = {
            columnIndex: columnIndexes[0], headerCell: selectedCol,
            columnIndexes: columnIndexes,
            column: gObj.getColumnByIndex(columnIndexes[0]),
            target: this.actualTarget,
            isInteracted: this.isInteracted, previousColumnIndex: this.prevColIndex
        };
        this.onActionComplete(selectedArgs, events.columnSelected);
        this.updateColProps(columnIndexes[0]);
    }

    /**
     * Select the column with existing column by passing column index
     * @param  {number} startIndex
     */
    public selectColumnWithExisting(startIndex: number): void {
        let gObj: IGrid = this.parent;
        if (isNullOrUndefined(gObj.getColumns()[startIndex])) {
            return;
        }
        let frzCols: number = gObj.getFrozenColumns();
        let isFreeze: boolean = frzCols && startIndex >= frzCols;
        let newCol: Element = gObj.getColumnHeaderByUid(gObj.getColumnByIndex(startIndex).uid);
        let selectedCol: Element[] | Element = this.getselectedCols();
        if (gObj.selectionSettings.type === 'Single') {
            this.clearColDependency();
        }
        if ( !gObj.selectionSettings.allowColumnSelection) {
            return;
        }
        if (this.selectedColumnsIndexes.indexOf(startIndex) > -1) {
            this.clearColumnSelection(startIndex);
        } else {
            let selectingArgs: ColumnSelectingEventArgs = {
                columnIndex: startIndex, headerCell: selectedCol,
                columnIndexes: this.selectedColumnsIndexes,
                column: gObj.getColumnByIndex(startIndex),
                cancel: false, target: this.actualTarget,
                isInteracted: this.isInteracted, previousColumnIndex: this.prevColIndex,
                isCtrlPressed: this.isMultiCtrlRequest, isShiftPressed: this.isMultiShiftRequest
            };
            this.onActionBegin(selectingArgs, events.columnSelecting);
            if (selectingArgs.cancel) {
                this.disableInteracted();
                return;
            }
            this.updateColSelection(newCol, startIndex);
            selectedCol = this.getselectedCols();
            let selectedArgs: ColumnSelectEventArgs = {
                columnIndex: startIndex, headerCell: selectedCol,
                column: gObj.getColumnByIndex(startIndex),
                columnIndexes: this.selectedColumnsIndexes,
                target: this.actualTarget,
                isInteracted: this.isInteracted, previousColumnIndex: this.prevColIndex
            };
            this.onActionComplete(selectedArgs, events.columnSelected);
        }
        this.updateColProps(startIndex);
    }

    /**
     * Clear the column selection
     */
    public clearColumnSelection(clearIndex?: number): void {
        if (this.isColumnSelected) {
            let gObj: IGrid = this.parent;
            if (!isNullOrUndefined(clearIndex) && this.selectedColumnsIndexes.indexOf(clearIndex) === -1) {
                return;
            }
            let index: number = !isNullOrUndefined(clearIndex) ? clearIndex :
                this.selectedColumnsIndexes[this.selectedColumnsIndexes.length - 1];
            let col: Column = gObj.getColumnByIndex(index);
            let selectedCol: Element;
            let column: Column = gObj.getColumnByIndex(index);
            if (col.getFreezeTableName() === literals.frozenRight) {
                selectedCol = gObj.getFrozenRightColumnHeaderByIndex(index);
            } else if (col.getFreezeTableName() === 'movable') {
                selectedCol = gObj.getMovableColumnHeaderByIndex(index);
            } else {
                selectedCol = gObj.getColumnHeaderByUid(column.uid);
            }
            let deselectedArgs: ColumnDeselectEventArgs = {
                columnIndex: index, headerCell: selectedCol,
                columnIndexes: this.selectedColumnsIndexes,
                column: column,
                cancel: false, target: this.actualTarget,
                isInteracted: this.isInteracted
            };
            let isCanceled: boolean = this.columnDeselect(deselectedArgs, events.columnDeselecting);
            if (isCanceled) {
                this.disableInteracted();
                return;
            }
            let selectedHeader: Element[] = !isNullOrUndefined(clearIndex) ? [selectedCol] :
                [].slice.call(gObj.getHeaderContent().getElementsByClassName('e-columnselection'));
            let selectedCells: Element[] = this.getSelectedColumnCells(clearIndex);
            for (let i: number = 0, len: number = selectedHeader.length; i < len; i++) {
                addRemoveActiveClasses([selectedHeader[i]], false, 'e-columnselection');
            }
            for (let i: number = 0, len: number = selectedCells.length; i < len; i++) {
                addRemoveActiveClasses([selectedCells[i]], false, 'e-columnselection');
            }
            if (!isNullOrUndefined(clearIndex)) {
                this.selectedColumnsIndexes.splice(this.selectedColumnsIndexes.indexOf(clearIndex), 1);
                this.parent.getColumns()[clearIndex].isSelected = false;
            } else {
            this.columnDeselect(deselectedArgs, events.columnDeselected);
            this.selectedColumnsIndexes = [];
            this.isColumnSelected = false;
            this.parent.getColumns().filter((col: Column) => col.isSelected = false);
        }
    }
}

    private getselectedCols(): Element[] {
        let gObj: IGrid = this.parent;
        let selectedCol: Element | Element[];
        if (this.selectedColumnsIndexes.length > 1) {
            selectedCol = [];
            for (let i: number = 0; i < this.selectedColumnsIndexes.length; i++) {
                (selectedCol).push(gObj.getColumnHeaderByUid(gObj.getColumnByIndex(this.selectedColumnsIndexes[i]).uid));
            }
        } else {
            selectedCol = gObj.getColumnHeaderByUid(gObj.getColumnByIndex(this.selectedColumnsIndexes[0]).uid);
        }
        return selectedCol as Element[];
    }

    private getSelectedColumnCells(clearIndex?: number): Element[] {
        let gObj: IGrid = this.parent;
        let isRowTemplate: boolean = !isNullOrUndefined(this.parent.rowTemplate);
        let rows: Element[] = isRowTemplate ? gObj.getRows() : gObj.getDataRows();
        let movableRows: Element[]; let frRows: Element[];
        if (gObj.isFrozenGrid() && gObj.getContent().querySelector('.' + literals.movableContent)) {
            movableRows = isRowTemplate ? gObj.getMovableRows() : gObj.getMovableDataRows();
            rows = gObj.addMovableRows(rows as HTMLElement[], movableRows as HTMLElement[]);
            if (gObj.getFrozenMode() === literals.leftRight) {
                frRows = isRowTemplate ? gObj.getFrozenRightRows() : gObj.getFrozenRightDataRows();
                rows = gObj.addMovableRows(rows as HTMLElement[], frRows as HTMLElement[]);
            }
        }
        let seletedcells: Element[] = [];
        let selectionString: string = !isNullOrUndefined(clearIndex) ? '[aria-colindex="' + clearIndex + '"]' : '.e-columnselection';
        for (let i: number = 0, len: number = rows.length; i < len; i++) {
            seletedcells = seletedcells.concat([].slice.call(rows[i].querySelectorAll(selectionString)));
        }
        return seletedcells;
    }

    private columnDeselect(args: ColumnDeselectEventArgs, event: string): boolean {
        if (event === 'columnDeselected') {
            delete args.cancel;
        }
        this.onActionComplete(args, event);
        return args.cancel;
    }

    private updateColProps(startIndex: number): void {
        this.prevColIndex = startIndex;
        this.isColumnSelected = this.selectedColumnsIndexes.length && true;
    }

    private clearColDependency(): void {
        this.clearColumnSelection();
        this.selectedColumnsIndexes = [];
    }

    private updateColSelection(selectedCol: Element, startIndex: number): void {
        if (isNullOrUndefined(this.parent.getColumns()[startIndex])) {
            return;
        }
        let left: number = this.parent.getFrozenLeftCount();
        let movable: number = this.parent.getMovableColumnsCount();
        let col: Column = this.parent.getColumnByIndex(startIndex);
        let isRowTemplate: boolean = !isNullOrUndefined(this.parent.rowTemplate);
        let rows: Element[];
        this.selectedColumnsIndexes.push(startIndex);
        this.parent.getColumns()[startIndex].isSelected = true;
        if (col.getFreezeTableName() === literals.frozenRight) {
            startIndex = startIndex - (left + movable);
            rows = isRowTemplate ? this.parent.getFrozenRightRows() : this.parent.getFrozenRightDataRows();
        } else if (col.getFreezeTableName() === 'movable') {
            startIndex = startIndex - left;
            rows = isRowTemplate ? this.parent.getMovableRows() : this.parent.getMovableDataRows();
        } else {
            startIndex = startIndex + this.parent.getIndentCount();
            rows = isRowTemplate ? this.parent.getRows() : this.parent.getDataRows();
        }
        addRemoveActiveClasses([selectedCol], true, 'e-columnselection');
        for (let j: number = 0, len: number = rows.length; j < len; j++) {
            if (rows[j].classList.contains(literals.row)) {
                if ((rows[j].classList.contains(literals.editedRow) || rows[j].classList.contains(literals.addedRow)) &&
                    this.parent.editSettings.mode === 'Normal' && !isNullOrUndefined(rows[j].querySelector('tr').childNodes[startIndex])) {
                    addRemoveActiveClasses([rows[j].querySelector('tr').childNodes[startIndex] as Element], true, 'e-columnselection');
                } else if (!isNullOrUndefined(rows[j].childNodes[startIndex])) {
                    addRemoveActiveClasses([rows[j].childNodes[startIndex] as Element], true, 'e-columnselection');
                }
            }
        }
    }

    private headerSelectionHandler(colIndex: number): void {
        if ((!this.isMultiCtrlRequest && !this.isMultiShiftRequest) || this.isSingleSel()) {
            this.selectColumn(colIndex);
        } else if (this.isMultiShiftRequest) {
            this.selectColumnsByRange(isUndefined(this.prevColIndex) ? colIndex : this.prevColIndex, colIndex);
        } else {
            this.selectColumnWithExisting(colIndex);
        }
    }

    private addEventListener_checkbox(): void {
        this.parent.on(events.dataReady, this.dataReady, this);
        this.onDataBoundFunction = this.onDataBound.bind(this);
        this.parent.addEventListener(events.dataBound, this.onDataBoundFunction);
        this.parent.on(events.contentReady, this.checkBoxSelectionChanged, this);
        this.parent.on(events.beforeRefreshOnDataChange, this.initPerisistSelection, this);
        this.parent.on(events.onEmpty, this.setCheckAllForEmptyGrid, this);
        this.actionCompleteFunc = this.actionCompleteHandler.bind(this);
        this.parent.addEventListener(events.actionComplete, this.actionCompleteFunc);
        this.parent.on(events.click, this.clickHandler, this);
        this.resizeEndFn = () => {
            this.updateAutoFillPosition();
            this.drawBorders();
        };
        this.resizeEndFn.bind(this);
        this.parent.addEventListener(events.resizeStop, this.resizeEndFn);
    }

    public removeEventListener_checkbox(): void {
        this.parent.off(events.dataReady, this.dataReady);
        this.parent.removeEventListener(events.dataBound, this.onDataBoundFunction);
        this.parent.removeEventListener(events.actionComplete, this.actionCompleteFunc);
        this.parent.off(events.onEmpty, this.setCheckAllForEmptyGrid);
        this.parent.off(events.click, this.clickHandler);
        this.parent.off(events.beforeRefreshOnDataChange, this.initPerisistSelection);
    }

    private setCheckAllForEmptyGrid(): void {
        let checkAllBox: HTMLElement = this.getCheckAllBox();
        if (checkAllBox) {
            this.parent.isCheckBoxSelection = true;
            let spanEle: HTMLElement = checkAllBox.nextElementSibling as HTMLElement;
            removeClass([spanEle], ['e-check', 'e-stop', 'e-uncheck']);
        }
    }

    public dataReady(e: { requestType: string }): void {
        this.isHeaderCheckboxClicked = false;
        let isInfinitecroll: boolean = this.parent.enableInfiniteScrolling && e.requestType === 'infiniteScroll';
        if (e.requestType !== 'virtualscroll' && !this.parent.isPersistSelection && !isInfinitecroll) {
            this.disableUI = !this.parent.enableImmutableMode;
            this.clearSelection();
            this.setCheckAllState();
            this.disableUI = false;
        }
    }

    private actionCompleteHandler(e: { requestType: string, action: string, selectedRow: number }): void {
        if (e.requestType === 'save' && this.parent.isPersistSelection) {
            this.refreshPersistSelection();
        }
    }

    private selectRowIndex(index: number): void {
        this.parent.isSelectedRowIndexUpdating = true;
        this.parent.selectedRowIndex = index;
    }

    private disableInteracted(): void {
        this.isInteracted = false;
    }

    private activeTarget(): void {
      this.actualTarget = this.isInteracted ? this.actualTarget : null;
  }

}
