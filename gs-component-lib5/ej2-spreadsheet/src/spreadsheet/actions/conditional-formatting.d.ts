import { Spreadsheet } from '../index';
/**
 * Represents Conditional Formatting support for Spreadsheet.
 */
export declare class ConditionalFormatting {
    private parent;
    private typeData;
    /**
     * Constructor for the Spreadsheet Conditional Formatting module.
     *
     * @param {Spreadsheet} parent - Constructor for the Spreadsheet Conditional Formatting module.
     */
    constructor(parent: Spreadsheet);
    /**
     * To destroy the Conditional Formatting module.
     *
     * @returns {void} - To destroy the Conditional Formatting module.
     */
    protected destroy(): void;
    private addEventListener;
    private removeEventListener;
    private setCF;
    private addClearCFHandler;
    private cFDeleteHandler;
    private clearCFHandler;
    private setCFHandler;
    private initiateCFHandler;
    private dlgClickHandler;
    private getType;
    private getCFColor;
    private cFDlgContent;
    private validateCfInput;
    private checkCellHandler;
    private getDlgText;
    private cFInitialRender;
    private cFInitialCheckHandler;
    private checkConditionalFormatHandler;
    private setColor;
    private hexToRgb;
    private cFRCheck;
    private isDataBarColorScalesIconSets;
    private applyIconSet;
    private applyIconSetIcon;
    private getIconList;
    private applyColorScale;
    private applyDataBars;
    private getNumericArray;
    private getColor;
    private getGradient;
    private getLinear;
    private byteLinear;
    private isGreaterThanLessThan;
    private isBetWeen;
    private isEqualTo;
    private isContainsText;
    private isTopBottomTenValue;
    private isTopBottomTenPercentage;
    private isAboveBelowAverage;
    private isDuplicateUnique;
    private setFormat;
    /**
     * Gets the module name.
     *
     * @returns {string} - Gets the module name.
     */
    protected getModuleName(): string;
}
