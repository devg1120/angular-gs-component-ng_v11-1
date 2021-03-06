import { keyDown, cellNavigate, renameSheet, filterCellKeyDown } from '../common/index';
import { getCellIndexes, getRangeAddress, getRowHeight, getColumnWidth, getCell } from '../../workbook/index';
import { getRangeIndexes, getSwapRange, isHiddenRow } from '../../workbook/index';
import { closest, isNullOrUndefined } from '@syncfusion/ej2-base';
/**
 * Represents keyboard navigation support for Spreadsheet.
 */
var KeyboardNavigation = /** @class */ (function () {
    /**
     * Constructor for the Spreadsheet Keyboard Navigation module.
     *
     * @private
     * @param {Spreadsheet} parent - Specify the spreadsheet
     */
    function KeyboardNavigation(parent) {
        this.parent = parent;
        this.addEventListener();
        /* code snippet */
    }
    KeyboardNavigation.prototype.addEventListener = function () {
        this.parent.on(keyDown, this.keyDownHandler, this);
        /* code snippet */
    };
    KeyboardNavigation.prototype.removeEventListener = function () {
        if (!this.parent.isDestroyed) {
            this.parent.off(keyDown, this.keyDownHandler);
        }
        /* code snippet */
    };
    KeyboardNavigation.prototype.keyDownHandler = function (e) {
        if (!this.parent.isEdit && (document.activeElement.classList.contains('e-spreadsheet') ||
            closest(document.activeElement, '.e-sheet'))) {
            var isNavigate = void 0;
            var scrollIdxes = void 0;
            var isRtl = this.parent.enableRtl;
            var sheet = this.parent.getActiveSheet();
            var filterArgs = { e: e, isFilterCell: false };
            var actIdxes = getCellIndexes(this.parent.getActiveSheet().activeCell);
            if ([9, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
                e.preventDefault();
            }
            if (e.shiftKey) { // shift selection
                this.shiftSelection(e);
            }
            if (!e.shiftKey && e.altKey && (e.keyCode === 38 || e.keyCode === 40)) {
                this.parent.notify(filterCellKeyDown, filterArgs);
            }
            if ((!e.shiftKey && ((!isRtl && e.keyCode === 37) || (isRtl && e.keyCode === 39)))
                || (e.shiftKey && e.keyCode === 9)) { //left key
                if (actIdxes[1] > 0) {
                    actIdxes[1] -= 1;
                    isNavigate = true;
                }
                else {
                    var content = this.parent.getMainContent();
                    if (actIdxes[1] === 0 && content.scrollLeft && !isRtl) {
                        content.scrollLeft = 0;
                    }
                }
            }
            else if (e.shiftKey && e.keyCode === 13) { // Up key
                if (!this.parent.element.querySelector('.e-find-toolbar')) {
                    if (actIdxes[0] > 0) {
                        actIdxes[0] -= 1;
                        isNavigate = true;
                    }
                    else {
                        var content = this.parent.getMainContent().parentElement;
                        if (actIdxes[0] === 0 && content.scrollTop) {
                            content.scrollTop = 0;
                        }
                    }
                }
            }
            else if (!filterArgs.isFilterCell && !e.shiftKey && e.keyCode === 38) { // Up key
                if (actIdxes[0] > 0) {
                    actIdxes[0] -= 1;
                    isNavigate = true;
                }
                else {
                    var content = this.parent.getMainContent().parentElement;
                    if (actIdxes[0] === 0 && content.scrollTop) {
                        content.scrollTop = 0;
                    }
                }
            }
            else if ((!e.shiftKey && ((!isRtl && e.keyCode === 39) || (isRtl && e.keyCode === 37))) || e.keyCode === 9) { // Right key
                var cell = getCell(actIdxes[0], actIdxes[1], sheet);
                if (cell && cell.colSpan > 1) {
                    actIdxes[1] += (cell.colSpan - 1);
                }
                if (actIdxes[1] < sheet.colCount - 1) {
                    actIdxes[1] += 1;
                    isNavigate = true;
                }
            }
            else if ((!filterArgs.isFilterCell && !e.shiftKey && e.keyCode === 40) || e.keyCode === 13) { // Down Key
                var cell = getCell(actIdxes[0], actIdxes[1], sheet);
                if (cell && cell.rowSpan > 1) {
                    actIdxes[0] += (cell.rowSpan - 1);
                }
                if (actIdxes[0] < sheet.rowCount - 1) {
                    actIdxes[0] += 1;
                    isNavigate = true;
                }
            }
            /* else if (e.keyCode === 36) {
                actIdxes[1] = 0;
                if (e.ctrlKey) {
                    actIdxes[0] = 0;
                }
                isNavigate = true;
                e.preventDefault();
            } else if (e.keyCode === 35 && e.ctrlKey) {
                actIdxes = [sheet.usedRange.rowIndex, sheet.usedRange.colIndex];
                scrollIdxes = [sheet.usedRange.rowIndex - this.parent.viewport.rowCount,
                    sheet.usedRange.colIndex - this.parent.viewport.colCount];
                isNavigate = true;
                e.preventDefault();
            } */
            if (isNavigate) {
                while (isHiddenRow(this.parent.getActiveSheet(), actIdxes[0])) {
                    if (e.keyCode === 40) {
                        actIdxes[0] = actIdxes[0] + 1;
                    }
                    if (e.keyCode === 38) {
                        actIdxes[0] = actIdxes[0] - 1;
                    }
                }
                this.scrollNavigation(scrollIdxes || actIdxes, scrollIdxes ? true : false);
                this.parent.setSheetPropertyOnMute(sheet, 'activeCell', getRangeAddress(actIdxes));
                this.parent.notify(cellNavigate, { range: actIdxes });
            }
        }
        var target = e.target;
        if (target.classList.contains('e-sheet-rename')) {
            if (e.keyCode === 32) {
                e.stopPropagation();
            }
            else if (e.keyCode === 13 || e.keyCode === 27) {
                this.parent.notify(renameSheet, e);
            }
        }
    };
    KeyboardNavigation.prototype.shiftSelection = function (e) {
        var sheet = this.parent.getActiveSheet();
        var selectedRange = getRangeIndexes(sheet.selectedRange);
        var swapRange = getSwapRange(selectedRange);
        var noHidden = true;
        if (e.keyCode === 38) { // shift + up arrow
            for (var i = swapRange[1]; i <= swapRange[3]; i++) {
                var cell = getCell(selectedRange[2], i, this.parent.getActiveSheet());
                if (!isNullOrUndefined(cell) && cell.rowSpan && cell.rowSpan < 0) {
                    selectedRange[2] = selectedRange[2] - (Math.abs(cell.rowSpan) + 1);
                    noHidden = false;
                    break;
                }
            }
            if (noHidden) {
                selectedRange[2] = selectedRange[2] - 1;
            }
            if (selectedRange[2] < 0) {
                selectedRange[2] = 0;
            }
        }
        if (e.keyCode === 40) { // shift + down arrow
            for (var i = swapRange[1]; i <= swapRange[3]; i++) {
                var cell = getCell(selectedRange[2], i, this.parent.getActiveSheet());
                if (!isNullOrUndefined(cell) && cell.rowSpan && cell.rowSpan > 0) {
                    selectedRange[2] = selectedRange[2] + Math.abs(cell.rowSpan);
                    noHidden = false;
                    break;
                }
            }
            if (noHidden) {
                selectedRange[2] = selectedRange[2] + 1;
            }
        }
        if (e.keyCode === 39) { // shift + right arrow
            for (var i = swapRange[0]; i <= swapRange[2]; i++) {
                var cell = getCell(i, selectedRange[3], this.parent.getActiveSheet());
                if (!isNullOrUndefined(cell) && cell.colSpan && cell.colSpan > 0) {
                    selectedRange[3] = selectedRange[3] + Math.abs(cell.colSpan);
                    noHidden = false;
                    break;
                }
            }
            if (noHidden) {
                selectedRange[3] = selectedRange[3] + 1;
            }
        }
        if (e.keyCode === 37) { // shift + left arrow
            for (var i = swapRange[0]; i <= swapRange[2]; i++) {
                var cell = getCell(i, selectedRange[3], this.parent.getActiveSheet());
                if (!isNullOrUndefined(cell) && cell.colSpan && cell.colSpan < 0) {
                    selectedRange[3] = selectedRange[3] - (Math.abs(cell.colSpan) + 1);
                    noHidden = false;
                    break;
                }
            }
            if (noHidden) {
                selectedRange[3] = selectedRange[3] - 1;
            }
            if (selectedRange[3] < 0) {
                selectedRange[3] = 0;
            }
        }
        if (e.shiftKey && e.ctrlKey && !this.parent.scrollSettings.enableVirtualization) { // ctrl + shift selection
            var usedRange = [sheet.usedRange.rowIndex, sheet.usedRange.colIndex];
            if (e.keyCode === 37) {
                if (selectedRange[3] <= usedRange[1]) {
                    selectedRange[3] = 0;
                }
                else {
                    selectedRange[3] = usedRange[1];
                }
            }
            if (e.keyCode === 38) {
                if (selectedRange[2] <= usedRange[0]) {
                    selectedRange[2] = 0;
                }
                else {
                    selectedRange[2] = usedRange[0];
                }
            }
            if (e.keyCode === 39) {
                if (selectedRange[3] <= usedRange[1]) {
                    selectedRange[3] = usedRange[1];
                }
                else {
                    selectedRange[3] = this.parent.getActiveSheet().colCount;
                }
            }
            if (e.keyCode === 40) {
                if (selectedRange[2] <= usedRange[0]) {
                    selectedRange[2] = usedRange[0];
                }
                else {
                    selectedRange[2] = this.parent.getActiveSheet().rowCount;
                }
            }
        }
        if (e.keyCode === 37 || e.keyCode === 39 || e.keyCode === 38 || e.keyCode === 40) {
            while (isHiddenRow(this.parent.getActiveSheet(), selectedRange[2])) {
                if (e.keyCode === 40) {
                    selectedRange[2] = selectedRange[2] + 1;
                }
                if (e.keyCode === 38) {
                    selectedRange[2] = selectedRange[2] - 1;
                }
            }
            this.parent.selectRange(getRangeAddress(selectedRange));
            this.scrollNavigation([selectedRange[2], selectedRange[3]], false);
        }
    };
    KeyboardNavigation.prototype.scrollNavigation = function (actIdxes, isScroll) {
        if (!this.parent.allowScrolling) {
            return;
        }
        var x = this.parent.enableRtl ? -1 : 1;
        var cont = this.parent.getMainContent().parentElement;
        var hCont = this.parent.getScrollElement();
        var sheet = this.parent.getActiveSheet();
        var selectedRange = getSwapRange(getRangeIndexes(sheet.selectedRange));
        var topLeftIdxes = getCellIndexes(sheet.topLeftCell);
        var frozenRow = this.parent.frozenRowCount(sheet);
        var frozenCol = this.parent.frozenColCount(sheet);
        var paneTopLeftIdxes = getCellIndexes(sheet.paneTopLeftCell);
        var topIdx = actIdxes[0] < frozenRow ? topLeftIdxes[0] : paneTopLeftIdxes[0];
        var leftIdx = actIdxes[1] < frozenCol ? topLeftIdxes[1] : paneTopLeftIdxes[1];
        var offsetLeftSize = this.parent.scrollModule.offset.left.size;
        var offsetTopSize = this.parent.scrollModule.offset.top.size;
        if (frozenRow && actIdxes[0] !== selectedRange[2] && cont.scrollTop) {
            if (actIdxes[0] === frozenRow) {
                cont.scrollTop = 0;
                return;
            }
            if (actIdxes[0] === frozenRow - 1) {
                cont.scrollTop = 0;
            }
        }
        if (frozenCol && actIdxes[1] !== selectedRange[3] && hCont.scrollLeft) {
            if (actIdxes[1] === frozenCol) {
                hCont.scrollLeft = 0;
                return;
            }
            if (actIdxes[1] === frozenCol - 1) {
                hCont.scrollLeft = 0;
            }
        }
        if (this.getBottomIdx(topIdx) <= actIdxes[0] || isScroll) {
            cont.scrollTop = offsetTopSize + getRowHeight(sheet, paneTopLeftIdxes[0], true);
        }
        else if (topIdx > actIdxes[0]) {
            cont.scrollTop = offsetTopSize - Math.ceil(getRowHeight(sheet, actIdxes[0], true));
        }
        if (this.getRightIdx(leftIdx) <= actIdxes[1] || isScroll) {
            hCont.scrollLeft = offsetLeftSize + getColumnWidth(sheet, paneTopLeftIdxes[1], null, true) * x;
        }
        else if (leftIdx > actIdxes[1]) {
            hCont.scrollLeft = offsetLeftSize - getColumnWidth(sheet, actIdxes[1], null, true) * x;
        }
    };
    KeyboardNavigation.prototype.getBottomIdx = function (top) {
        var hgt = 0;
        var sheet = this.parent.getActiveSheet();
        var viewPortHeight = (sheet.frozenRows ? this.parent.viewport.height - this.parent.sheetModule.getColHeaderHeight(sheet, true) : this.parent.viewport.height) - 17 || 20;
        for (var i = top;; i++) {
            hgt += getRowHeight(sheet, i, true);
            if (hgt >= viewPortHeight) {
                return i;
            }
        }
    };
    KeyboardNavigation.prototype.getRightIdx = function (left) {
        var width = 0;
        var sheet = this.parent.getActiveSheet();
        var contWidth = this.parent.getMainContent().parentElement.offsetWidth -
            this.parent.sheetModule.getRowHeaderWidth(sheet);
        for (var i = left;; i++) {
            width += getColumnWidth(sheet, i, null, true);
            if (width >= contWidth - 17) {
                return i;
            }
        }
    };
    /**
     * For internal use only - Get the module name.
     *
     * @private
     * @returns {string} - Get the module name.
     */
    KeyboardNavigation.prototype.getModuleName = function () {
        return 'keyboardNavigation';
    };
    KeyboardNavigation.prototype.destroy = function () {
        this.removeEventListener();
        this.parent = null;
    };
    return KeyboardNavigation;
}());
export { KeyboardNavigation };
