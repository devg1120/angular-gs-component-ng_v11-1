import { NumberFormatType } from '../common/index';
import { CellModel, Workbook } from '../base/index';
/**
 * Specifies number format.
 */
export declare class WorkbookNumberFormat {
    private parent;
    private localeObj;
    private decimalSep;
    private groupSep;
    constructor(parent: Workbook);
    private numberFormatting;
    /**
     * @hidden
     *
     * @param {Object} args - Specifies the args.
     * @returns {string} - to get formatted cell.
     */
    getFormattedCell(args: {
        [key: string]: string | number | boolean | CellModel;
    }): string;
    private processFormats;
    private autoDetectGeneralFormat;
    private getPercentageFormat;
    private findSuffix;
    private applyNumberFormat;
    private isCustomFormat;
    private currencyFormat;
    private percentageFormat;
    private accountingFormat;
    private getFormatForOtherCurrency;
    private shortDateFormat;
    private longDateFormat;
    private timeFormat;
    private scientificFormat;
    private fractionFormat;
    private findDecimalPlaces;
    checkDateFormat(args: {
        [key: string]: string | number | boolean | Date | CellModel;
    }): void;
    private checkCustomDateFormat;
    private formattedBarText;
    /**
     * Adding event listener for number format.
     *
     * @returns {void} - Adding event listener for number format.
     */
    private addEventListener;
    /**
     * Removing event listener for number format.
     *
     * @returns {void} -  Removing event listener for number format.
     */
    private removeEventListener;
    /**
     * To Remove the event listeners.
     *
     * @returns {void} - To Remove the event listeners.
     */
    destroy(): void;
    /**
     * Get the workbook number format module name.
     *
     * @returns {string} - Get the module name.
     */
    getModuleName(): string;
}
/**
 * To Get the number built-in format code from the number format type.
 *
 * @param {string} type - Specifies the type of the number formatting.
 * @returns {string} - To Get the number built-in format code from the number format type.
 */
export declare function getFormatFromType(type: NumberFormatType): string;
/**
 * @hidden
 * @param {string} format -  Specidfies the format.
 * @returns {string} - To get type from format.
 */
export declare function getTypeFromFormat(format: string): string;
