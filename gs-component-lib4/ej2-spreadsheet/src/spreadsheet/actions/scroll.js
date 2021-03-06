import { EventHandler, isNullOrUndefined } from '@syncfusion/ej2-base';
import { contentLoaded, spreadsheetDestroyed, onVerticalScroll, onHorizontalScroll, getScrollBarWidth } from '../common/index';
import { onContentScroll, deInitProperties, setScrollEvent, skipHiddenIdx, mouseDown, selectionStatus } from '../common/index';
import { getRowHeight, getColumnWidth, getCellAddress } from '../../workbook/index';
import { isFormulaBarEdit, virtualContentLoaded, colWidthChanged } from '../common/index';
/**
 * The `Scroll` module is used to handle scrolling behavior.
 *
 * @hidden
 */
var Scroll = /** @class */ (function () {
    /**
     * Constructor for the Spreadsheet scroll module.
     *
     * @param {Spreadsheet} parent - Constructor for the Spreadsheet scroll module.
     * @private
     */
    function Scroll(parent) {
        this.clientX = 0;
        this.parent = parent;
        this.addEventListener();
        this.initProps();
    }
    Scroll.prototype.onContentScroll = function (e) {
        var target = this.parent.getMainContent().parentElement;
        var scrollLeft = e.scrollLeft;
        var top = e.scrollTop || target.scrollTop;
        var left = scrollLeft && this.parent.enableRtl ? this.initScrollValue - scrollLeft : scrollLeft;
        var scrollArgs;
        var prevSize;
        if (!isNullOrUndefined(scrollLeft) && this.prevScroll.scrollLeft !== left) {
            var scrollRight = left > this.prevScroll.scrollLeft;
            prevSize = this.offset.left.size;
            this.offset.left = this.getColOffset(left, scrollRight, e.skipHidden);
            if (!e.preventScroll) {
                this.parent.getColumnHeaderContent().scrollLeft = scrollLeft;
                this.parent.getMainContent().scrollLeft = scrollLeft;
                e.scrollLeft = scrollLeft;
            }
            scrollArgs = {
                cur: this.offset.left, prev: { idx: this.leftIndex, size: prevSize }, increase: scrollRight, preventScroll: e.preventScroll
            };
            this.updateTopLeftCell(scrollRight);
            this.parent.notify(onHorizontalScroll, scrollArgs);
            if (!this.parent.scrollSettings.enableVirtualization && scrollRight && !this.parent.scrollSettings.isFinite) {
                this.updateNonVirtualCols();
            }
            this.leftIndex = scrollArgs.prev.idx;
            this.prevScroll.scrollLeft = left;
        }
        if (this.prevScroll.scrollTop !== top) {
            var scrollDown = top > this.prevScroll.scrollTop;
            prevSize = this.offset.top.size;
            this.offset.top = this.getRowOffset(top, scrollDown);
            scrollArgs = {
                cur: this.offset.top, prev: { idx: this.topIndex, size: prevSize }, increase: scrollDown, preventScroll: e.preventScroll
            };
            this.updateTopLeftCell(scrollDown);
            this.parent.notify(onVerticalScroll, scrollArgs);
            if (!this.parent.scrollSettings.enableVirtualization && scrollDown && !this.parent.scrollSettings.isFinite) {
                this.updateNonVirtualRows();
            }
            this.topIndex = scrollArgs.prev.idx;
            this.prevScroll.scrollTop = top;
        }
        var isEdit = false;
        var args = { isEdit: isEdit };
        this.parent.notify(isFormulaBarEdit, args);
        if (args.isEdit) {
            var textArea = this.parent.element.querySelector('.e-formula-bar');
            textArea.focus();
        }
    };
    Scroll.prototype.updateNonVirtualRows = function () {
        var sheet = this.parent.getActiveSheet();
        var threshold = this.parent.getThreshold('row');
        if (this.offset.top.idx > sheet.rowCount - (this.parent.viewport.rowCount + threshold)) {
            this.parent.renderModule.refreshUI({ rowIndex: sheet.rowCount, colIndex: 0, direction: 'first', refresh: 'RowPart' }, getCellAddress(sheet.rowCount, 0) + ":" + getCellAddress(sheet.rowCount + threshold - 1, sheet.colCount - 1));
            this.parent.setSheetPropertyOnMute(sheet, 'rowCount', sheet.rowCount + threshold);
            this.parent.viewport.bottomIndex = sheet.rowCount - 1;
        }
    };
    Scroll.prototype.updateNonVirtualCols = function () {
        var sheet = this.parent.getActiveSheet();
        var threshold = this.parent.getThreshold('col');
        if (this.offset.left.idx > sheet.colCount - (this.parent.viewport.colCount + threshold)) {
            this.parent.renderModule.refreshUI({ rowIndex: 0, colIndex: sheet.colCount, direction: 'first', refresh: 'ColumnPart' }, getCellAddress(0, sheet.colCount) + ":" + getCellAddress(sheet.rowCount - 1, sheet.colCount + threshold - 1));
            this.parent.setSheetPropertyOnMute(sheet, 'colCount', sheet.colCount + threshold);
            this.parent.viewport.rightIndex = sheet.colCount - 1;
        }
    };
    Scroll.prototype.updateTopLeftCell = function (increase) {
        var sheet = this.parent.getActiveSheet();
        var top = this.offset.top.idx;
        var left = this.offset.left.idx;
        if (!increase) {
            top = skipHiddenIdx(sheet, top, true);
            left = skipHiddenIdx(sheet, left, true, 'columns');
        }
        this.parent.updateTopLeftCell(top, left);
    };
    Scroll.prototype.getRowOffset = function (scrollTop, scrollDown) {
        var temp = this.offset.top.size;
        var sheet = this.parent.getActiveSheet();
        var i = scrollDown ? this.offset.top.idx + 1 : (this.offset.top.idx ? this.offset.top.idx - 1 : 0);
        var count;
        var frozenRow = this.parent.frozenRowCount(sheet);
        if (this.parent.scrollSettings.isFinite) {
            count = sheet.rowCount;
            if (scrollDown && i + this.parent.viewport.rowCount + this.parent.getThreshold('row') >= count) {
                return { idx: this.offset.top.idx, size: this.offset.top.size };
            }
        }
        else {
            count = Infinity;
        }
        scrollTop = Math.round(scrollTop);
        while (i < count) {
            if (scrollDown) {
                temp += getRowHeight(sheet, i - 1 + frozenRow, true);
                if (Math.abs(Math.round(temp) - scrollTop) <= 1) { // <=1 -> For other resolution scrollTop value slightly various with row height
                    return { idx: i, size: temp };
                }
                if (Math.round(temp) > scrollTop) {
                    return { idx: i - 1, size: temp - getRowHeight(sheet, i - 1 + frozenRow, true) };
                }
                i++;
            }
            else {
                if (temp === 0) {
                    return { idx: 0, size: 0 };
                }
                temp -= getRowHeight(sheet, i + frozenRow, true);
                if (temp < 0) {
                    temp = 0;
                }
                if (Math.abs(Math.round(temp) - scrollTop) <= 1) {
                    return { idx: i, size: temp };
                }
                if (Math.round(temp) < scrollTop) {
                    temp += getRowHeight(sheet, i + frozenRow, true);
                    if (Math.round(temp) > scrollTop) {
                        return { idx: i, size: temp - getRowHeight(sheet, i + frozenRow, true) < 0 ? 0 :
                                temp - getRowHeight(sheet, i + frozenRow, true) };
                    }
                    else {
                        return { idx: i + 1, size: temp };
                    }
                }
                i--;
            }
        }
        return { idx: this.offset.top.idx, size: this.offset.top.size };
    };
    Scroll.prototype.getColOffset = function (scrollLeft, increase, skipHidden) {
        var temp = this.offset.left.size;
        var sheet = this.parent.getActiveSheet();
        var i = increase ? this.offset.left.idx + 1 : this.offset.left.idx - 1;
        var count;
        var frozenCol = this.parent.frozenColCount(sheet);
        if (this.parent.scrollSettings.isFinite) {
            count = sheet.colCount;
            if (increase && i + this.parent.viewport.colCount + this.parent.getThreshold('col') >= count) {
                return { idx: this.offset.left.idx, size: this.offset.left.size };
            }
        }
        else {
            count = Infinity;
        }
        scrollLeft = Math.round(scrollLeft);
        while (i < count) {
            if (increase) {
                temp += getColumnWidth(sheet, i - 1 + frozenCol, skipHidden, true);
                if (Math.round(temp) === scrollLeft) {
                    return { idx: i, size: temp };
                }
                if (Math.round(temp) > scrollLeft) {
                    return { idx: i - 1, size: temp - getColumnWidth(sheet, i - 1 + frozenCol, skipHidden, true) };
                }
                i++;
            }
            else {
                if (temp === 0) {
                    return { idx: 0, size: 0 };
                }
                temp -= getColumnWidth(sheet, i + frozenCol, skipHidden, true);
                if (Math.round(temp) === scrollLeft) {
                    return { idx: i, size: temp };
                }
                if (Math.round(temp) < scrollLeft) {
                    temp += getColumnWidth(sheet, i + frozenCol, skipHidden, true);
                    if (Math.round(temp) > scrollLeft) {
                        return { idx: i, size: temp - getColumnWidth(sheet, i + frozenCol, skipHidden, true) };
                    }
                    else {
                        return { idx: i + 1, size: temp };
                    }
                }
                i--;
            }
        }
        return { idx: this.offset.left.idx, size: this.offset.left.size };
    };
    Scroll.prototype.contentLoaded = function () {
        this.setScrollEvent();
        if (this.parent.enableRtl) {
            this.initScrollValue = this.parent.getScrollElement().scrollLeft;
        }
        if (!this.parent.scrollSettings.enableVirtualization) {
            var scrollTrack = this.parent.createElement('div', { className: 'e-virtualtrack' });
            this.updateNonVirualScrollWidth({ scrollTrack: scrollTrack });
            this.parent.getScrollElement().appendChild(scrollTrack);
        }
    };
    Scroll.prototype.updateNonVirualScrollWidth = function (args) {
        if (!args.scrollTrack) {
            args.scrollTrack = this.parent.getScrollElement().getElementsByClassName('e-virtualtrack')[0];
        }
        args.scrollTrack.style.width = Math.abs(this.parent.getContentTable().getBoundingClientRect().width) + 'px';
    };
    Scroll.prototype.onWheel = function (e) {
        e.preventDefault();
        this.parent.getMainContent().parentElement.scrollTop += e.deltaY;
    };
    Scroll.prototype.scrollHandler = function (e) {
        this.onContentScroll({ scrollLeft: e.target.scrollLeft });
    };
    Scroll.prototype.mouseDownHandler = function (e) {
        if (e.type === 'mousedown') {
            return;
        }
        var args = { touchSelectionStarted: false };
        this.parent.notify(selectionStatus, args);
        if (args.touchSelectionStarted) {
            return;
        }
        var sheetContent = document.getElementById(this.parent.element.id + '_sheet');
        this.clientX = e.changedTouches[0].clientX;
        EventHandler.add(sheetContent, 'touchmove', this.mouseMoveHandler, this);
        EventHandler.add(sheetContent, 'touchend', this.mouseUpHandler, this);
    };
    Scroll.prototype.mouseMoveHandler = function (e) {
        var scroller = this.parent.element.getElementsByClassName('e-scroller')[0];
        var diff = this.clientX - e.changedTouches[0].clientX;
        if (diff > 10 || diff < -10) {
            e.preventDefault();
            scroller.scrollLeft += diff;
            this.clientX = e.changedTouches[0].clientX;
        }
    };
    Scroll.prototype.mouseUpHandler = function () {
        var sheetContent = document.getElementById(this.parent.element.id + '_sheet');
        EventHandler.remove(sheetContent, 'touchmove', this.mouseMoveHandler);
        EventHandler.remove(sheetContent, 'touchend', this.mouseUpHandler);
    };
    Scroll.prototype.setScrollEvent = function (args) {
        if (args === void 0) { args = { set: true }; }
        if (args.set) {
            EventHandler.add(this.parent.sheetModule.contentPanel, 'scroll', this.onContentScroll, this);
            EventHandler.add(this.parent.getColumnHeaderContent(), 'wheel', this.onWheel, this);
            EventHandler.add(this.parent.getSelectAllContent(), 'wheel', this.onWheel, this);
            EventHandler.add(this.parent.getScrollElement(), 'scroll', this.scrollHandler, this);
        }
        else {
            EventHandler.remove(this.parent.sheetModule.contentPanel, 'scroll', this.onContentScroll);
            EventHandler.remove(this.parent.getColumnHeaderContent(), 'wheel', this.onWheel);
            EventHandler.remove(this.parent.getSelectAllContent(), 'wheel', this.onWheel);
            EventHandler.remove(this.parent.getScrollElement(), 'scroll', this.scrollHandler);
        }
    };
    Scroll.prototype.initProps = function () {
        this.topIndex = 0;
        this.leftIndex = 0;
        this.prevScroll = { scrollLeft: 0, scrollTop: 0 };
        this.offset = { left: { idx: 0, size: 0 }, top: { idx: 0, size: 0 } };
    };
    /**
     * @hidden
     *
     * @returns {void} - To Set padding
     */
    Scroll.prototype.setPadding = function () {
        this.parent.sheetModule.contentPanel.style.overflowY = 'scroll';
        var colHeader = this.parent.getColumnHeaderContent();
        var scrollWidth = getScrollBarWidth();
        var cssProps = this.parent.enableRtl ? { margin: 'marginLeft', border: 'borderLeftWidth' }
            : { margin: 'marginRight', border: 'borderRightWidth' };
        if (scrollWidth > 0) {
            colHeader.parentElement.style[cssProps.margin] = scrollWidth + 'px';
            colHeader.style[cssProps.border] = '1px';
        }
    };
    Scroll.prototype.addEventListener = function () {
        this.parent.on(contentLoaded, this.contentLoaded, this);
        this.parent.on(onContentScroll, this.onContentScroll, this);
        this.parent.on(deInitProperties, this.initProps, this);
        this.parent.on(spreadsheetDestroyed, this.destroy, this);
        this.parent.on(setScrollEvent, this.setScrollEvent, this);
        this.parent.on(mouseDown, this.mouseDownHandler, this);
        if (!this.parent.scrollSettings.enableVirtualization) {
            this.parent.on(virtualContentLoaded, this.updateNonVirualScrollWidth, this);
            this.parent.on(colWidthChanged, this.updateNonVirualScrollWidth, this);
        }
    };
    Scroll.prototype.destroy = function () {
        this.removeEventListener();
        this.parent = null;
    };
    Scroll.prototype.removeEventListener = function () {
        this.parent.off(contentLoaded, this.contentLoaded);
        this.parent.off(onContentScroll, this.onContentScroll);
        this.parent.off(deInitProperties, this.initProps);
        this.parent.off(spreadsheetDestroyed, this.destroy);
        this.parent.off(setScrollEvent, this.setScrollEvent);
        this.parent.off(mouseDown, this.mouseDownHandler);
        if (!this.parent.scrollSettings.enableVirtualization) {
            this.parent.off(virtualContentLoaded, this.updateNonVirualScrollWidth);
            this.parent.off(colWidthChanged, this.updateNonVirualScrollWidth);
        }
    };
    return Scroll;
}());
export { Scroll };
