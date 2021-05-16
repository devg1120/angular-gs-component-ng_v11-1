import { Spreadsheet } from '../base/index';
/**
 * Represents clipboard support for Spreadsheet.
 */
export declare class Clipboard {
    private parent;
    private cutInfo;
    private externalMerge;
    private externalMergeRow;
    private copiedInfo;
    private copiedShapeInfo;
    private copiedSheet;
    private copiedCell;
    constructor(parent: Spreadsheet);
    private init;
    private addEventListener;
    private removeEventListener;
    private ribbonClickHandler;
    private tabSwitchHandler;
    private cMenuBeforeOpenHandler;
    private rowHeightChanged;
    private cut;
    private copy;
    private paste;
    private isRangeMerged;
    private updateFilter;
    private isInRange;
    private isFormula;
    private setCell;
    private getCopiedIdx;
    private setCopiedInfo;
    private getChartElemInfo;
    private clearCopiedInfo;
    private removeIndicator;
    private initCopyIndicator;
    private showDialog;
    private hidePaste;
    private setExternalCells;
    private getExternalCells;
    private getStyle;
    private defaultCellStyle;
    private getClipboardEle;
    protected getModuleName(): string;
    destroy(): void;
}
