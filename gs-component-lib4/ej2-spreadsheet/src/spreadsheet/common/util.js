import { Browser, setStyleAttribute as setBaseStyleAttribute, getComponent, detach, isNullOrUndefined } from '@syncfusion/ej2-base';
import { clearViewer, deleteImage, createImageElement, refreshImgCellObj } from './index';
import { getRowsHeight, getColumnsWidth, getSwapRange, clearCells } from '../../workbook/index';
import { getRangeIndexes, wrap, setRowHeight, insertModel, getColumnWidth } from '../../workbook/index';
import { initiateSort, getIndexesFromAddress, getRowHeight, setMerge } from '../../workbook/index';
import { setValidation, removeValidation, clearCFRule, setCFRule } from '../../workbook/index';
import { removeSheetTab, rowHeightChanged } from './index';
import { getCell, setChart, refreshChartSize } from '../../workbook/index';
import { deleteChart } from '../../spreadsheet/index';
import { initiateFilterUI } from './event';
/**
 * The function used to update Dom using requestAnimationFrame.
 *
 * @param  {Function} fn - Function that contains the actual action
 * @returns {void}
 * @hidden
 */
export function getUpdateUsingRaf(fn) {
    requestAnimationFrame(function () {
        fn();
    });
}
/**
 * The function used to remove the dom element children.
 *
 * @param  {Element} parent - Specify the parent
 * @returns {void} - The function used to get colgroup width based on the row index.
 * @hidden
 */
export function removeAllChildren(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}
/**
 * The function used to get colgroup width based on the row index.
 *
 * @param  {number} index - Specify the index
 * @returns {number} - The function used to get colgroup width based on the row index.
 * @hidden
 */
export function getColGroupWidth(index) {
    var width = 30;
    if (index.toString().length > 3) {
        width = index.toString().length * 10;
    }
    return width;
}
var scrollAreaWidth = null;
/**
 * @hidden
 * @returns {number} - To get scrollbar width
 */
export function getScrollBarWidth() {
    if (scrollAreaWidth !== null) {
        return scrollAreaWidth;
    }
    var htmlDivNode = document.createElement('div');
    var result = 0;
    htmlDivNode.style.cssText = 'width:100px;height: 100px;overflow: scroll;position: absolute;top: -9999px;';
    document.body.appendChild(htmlDivNode);
    result = (htmlDivNode.offsetWidth - htmlDivNode.clientWidth) | 0;
    document.body.removeChild(htmlDivNode);
    return scrollAreaWidth = result;
}
var classes = ['e-ribbon', 'e-formula-bar-panel', 'e-sheet-tab-panel', 'e-header-toolbar'];
/**
 * @hidden
 * @param {HTMLElement} element - Specify the element.
 * @param {string[]} classList - Specify the classList.
 * @returns {number} - get Siblings Height
 */
export function getSiblingsHeight(element, classList) {
    if (classList === void 0) { classList = classes; }
    var previous = getHeightFromDirection(element, 'previous', classList);
    var next = getHeightFromDirection(element, 'next', classList);
    return previous + next;
}
/**
 * @param {HTMLElement} element - Specify the element.
 * @param {string} direction - Specify the direction.
 * @param {string[]} classList - Specify the classList.
 * @returns {number} - get Height FromDirection
 */
function getHeightFromDirection(element, direction, classList) {
    var sibling = (element)[direction + 'ElementSibling'];
    var result = 0;
    while (sibling) {
        if (classList.some(function (value) { return sibling.classList.contains(value); })) {
            result += sibling.offsetHeight;
        }
        sibling = (sibling)[direction + 'ElementSibling'];
    }
    return result;
}
/**
 * @hidden
 * @param {Spreadsheet} context - Specify the spreadsheet.
 * @param {number[]} range - Specify the range.
 * @param {boolean} isModify - Specify the boolean value.
 * @returns {boolean} - Returns boolean value.
 */
export function inView(context, range, isModify) {
    if (context.scrollSettings.enableVirtualization) {
        var topIdx = context.viewport.topIndex;
        var leftIdx = context.viewport.leftIndex;
        var bottomIdx = topIdx + context.viewport.rowCount + context.getThreshold('row') * 2;
        var rightIdx = leftIdx + context.viewport.colCount + context.getThreshold('col') * 2;
        var inView_1 = topIdx <= range[0] && bottomIdx >= range[2] && leftIdx <= range[1] && rightIdx >= range[3];
        if (inView_1) {
            return true;
        }
        if (isModify) {
            if (range[0] < topIdx && range[2] < topIdx || range[0] > bottomIdx && range[2] > bottomIdx) {
                return false;
            }
            else {
                if (range[0] < topIdx && range[2] > topIdx) {
                    range[0] = topIdx;
                    inView_1 = true;
                }
                if (range[2] > bottomIdx) {
                    range[2] = bottomIdx;
                    inView_1 = true;
                }
            }
            if (range[1] < leftIdx && range[3] < leftIdx || range[1] > rightIdx && range[3] > rightIdx) {
                return false;
            }
            else {
                if (range[1] < leftIdx && range[3] > leftIdx) {
                    range[1] = leftIdx;
                    inView_1 = true;
                }
                if (range[3] > rightIdx) {
                    range[3] = rightIdx;
                    inView_1 = true;
                }
            }
        }
        return inView_1;
    }
    else {
        return true;
    }
}
/**
 * To get the top left cell position in viewport.
 *
 * @hidden
 * @param {SheetModel} sheet - Specify the sheet.
 * @param {number[]} indexes - Specify the indexes.
 * @param {number} frozenRow - Specify the frozen row.
 * @param {number} frozenColumn - Specify the frozen column
 * @param {number} freezeScrollHeight - Specify the freeze scroll height
 * @param {number} freezeScrollWidth - Specify the freeze scroll width
 * @param {number} rowHdrWidth - Specify the row header width
 * @returns {number} - To get the top left cell position in viewport.
 */
export function getCellPosition(sheet, indexes, frozenRow, frozenColumn, freezeScrollHeight, freezeScrollWidth, rowHdrWidth) {
    var i;
    var offset = { left: { idx: 0, size: 0 }, top: { idx: 0, size: 0 } };
    var top = offset.top.size;
    var left = offset.left.size;
    for (i = offset.top.idx; i < indexes[0]; i++) {
        if (frozenRow) {
            if (frozenRow - 1 < indexes[0] && i < frozenRow) {
                continue;
            }
        }
        top += getRowHeight(sheet, i, true);
    }
    for (i = offset.left.idx; i < indexes[1]; i++) {
        if (frozenColumn && frozenColumn - 1 < indexes[1] && i < frozenColumn) {
            continue;
        }
        left += getColumnWidth(sheet, i, null, true);
    }
    if (frozenRow && indexes[0] < frozenRow) {
        if (sheet.showHeaders) {
            top += 30;
        }
        if (freezeScrollHeight) {
            top -= freezeScrollHeight;
        }
    }
    if (frozenColumn && indexes[1] < frozenColumn) {
        if (sheet.showHeaders) {
            left += rowHdrWidth ? rowHdrWidth : 30;
        }
        if (freezeScrollWidth) {
            left -= freezeScrollWidth;
        }
    }
    return { top: top, left: left };
}
/**
 * @param {Spreadsheet} parent - Specify the parent
 * @param {HTMLElement} ele - Specify the element
 * @param {number[]} range - Specify the range
 * @param {string} cls - Specify the class name
 * @returns {void} - To set the position
 * @hidden
 */
export function setPosition(parent, ele, range, cls) {
    if (cls === void 0) { cls = 'e-selection'; }
    var sheet = parent.getActiveSheet();
    if (sheet.frozenRows || sheet.frozenColumns) {
        var content_1;
        var frozenRow_1 = parent.frozenRowCount(sheet);
        var frozenCol_1 = parent.frozenColCount(sheet);
        if (cls === 'e-active-cell') {
            if (range[0] < frozenRow_1 || range[1] < frozenCol_1) {
                ele.style.display = 'none';
                content_1 = range[0] < frozenRow_1 && range[1] < frozenCol_1 ? parent.getSelectAllContent() :
                    (range[0] < frozenRow_1 ? parent.getColumnHeaderContent() : parent.getRowHeaderContent());
                var rangeEle = content_1.querySelector('.' + cls);
                if (!rangeEle) {
                    rangeEle = ele.cloneNode(true);
                    content_1.appendChild(rangeEle);
                }
                ele = rangeEle;
                locateElem(ele, range, sheet, parent.enableRtl, frozenRow_1, frozenCol_1, true, parent.viewport.beforeFreezeHeight, parent.viewport.beforeFreezeWidth, parent.sheetModule.colGroupWidth);
            }
            else {
                locateElem(ele, range, sheet, parent.enableRtl, frozenRow_1, frozenCol_1);
            }
            if (ele.style.display) {
                ele.style.display = '';
            }
            removeRangeEle(parent.getSelectAllContent(), content_1, true);
            removeRangeEle(parent.getColumnHeaderContent(), content_1, true);
            removeRangeEle(parent.getRowHeaderContent(), content_1, true);
        }
        else {
            var swapRange = getSwapRange(range);
            if (swapRange[0] < frozenRow_1 || swapRange[1] < frozenCol_1) {
                ele.classList.add('e-hide');
                var ranges_1 = [];
                if (swapRange[0] < frozenRow_1 && swapRange[1] < frozenCol_1) {
                    if (swapRange[2] < frozenRow_1 && swapRange[3] < frozenCol_1) {
                        ranges_1.push(range);
                        removeRangeEle(parent.getColumnHeaderContent(), content_1, false);
                        removeRangeEle(parent.getRowHeaderContent(), content_1, false);
                    }
                    else if (swapRange[2] > frozenRow_1 - 1) {
                        if (swapRange[3] < frozenCol_1) {
                            removeRangeEle(parent.getColumnHeaderContent(), content_1, false);
                            ranges_1.push([swapRange[0], swapRange[1], frozenRow_1 - 1, swapRange[3]]);
                            ranges_1.push([frozenRow_1, swapRange[1], swapRange[2], swapRange[3]]);
                        }
                        else {
                            ranges_1.push([swapRange[0], swapRange[1], frozenRow_1 - 1, frozenCol_1 - 1]);
                            ranges_1.push([frozenRow_1, swapRange[1], swapRange[2], frozenCol_1 - 1]);
                            ranges_1.push([swapRange[0], frozenCol_1, frozenRow_1 - 1, swapRange[3]]);
                            ranges_1.push([frozenRow_1, frozenCol_1, swapRange[2], swapRange[3]]);
                        }
                    }
                    else {
                        if (swapRange[2] < frozenRow_1) {
                            ranges_1.push([swapRange[0], swapRange[1], swapRange[2], frozenCol_1 - 1]);
                            ranges_1.push([swapRange[0], frozenCol_1, swapRange[2], swapRange[3]]);
                            removeRangeEle(parent.getRowHeaderContent(), content_1, false);
                        }
                        else {
                            ranges_1.push([frozenRow_1, swapRange[1], swapRange[2], frozenCol_1 - 1]);
                            ranges_1.push([swapRange[0], swapRange[1], frozenRow_1 - 1, frozenCol_1 - 1]);
                            ranges_1.push([frozenRow_1, frozenCol_1, swapRange[2], swapRange[3]]);
                            ranges_1.push([swapRange[0], frozenCol_1, frozenRow_1 - 1, swapRange[3]]);
                        }
                    }
                }
                else if (swapRange[0] < frozenRow_1) {
                    if (swapRange[2] < frozenRow_1) {
                        ranges_1.push(range);
                    }
                    else {
                        ranges_1.push([swapRange[0], swapRange[1], frozenRow_1 - 1, swapRange[3]]);
                        ranges_1.push([frozenRow_1, swapRange[1], swapRange[2], swapRange[3]]);
                        removeRangeEle(parent.getSelectAllContent(), content_1, false);
                        removeRangeEle(parent.getRowHeaderContent(), content_1, false);
                    }
                }
                else {
                    if (swapRange[3] < frozenCol_1) {
                        ranges_1.push(range);
                    }
                    else {
                        ranges_1.push([swapRange[0], swapRange[1], swapRange[2], frozenCol_1 - 1]);
                        ranges_1.push([swapRange[0], frozenCol_1, swapRange[2], swapRange[3]]);
                        removeRangeEle(parent.getSelectAllContent(), content_1, false);
                        removeRangeEle(parent.getColumnHeaderContent(), content_1, false);
                    }
                }
                var removeEle_1;
                ranges_1.forEach(function (rng) {
                    content_1 = rng[2] < frozenRow_1 && rng[3] < frozenCol_1 ? parent.getSelectAllContent() :
                        (rng[2] < frozenRow_1 ? parent.getColumnHeaderContent() : (rng[3] < frozenCol_1 ?
                            parent.getRowHeaderContent() : parent.getMainContent()));
                    var rangeEle;
                    if (cls === 'e-copy-indicator' || cls === 'e-range-indicator') {
                        rangeEle = ele.cloneNode(true);
                        content_1.appendChild(rangeEle);
                        if (frozenRow_1) {
                            if (rng[2] + 1 === frozenRow_1) {
                                ranges_1.forEach(function (subRng) {
                                    if (subRng !== rng) {
                                        removeEle_1 = rangeEle.getElementsByClassName('e-bottom')[0];
                                        if (removeEle_1 && subRng[0] === frozenRow_1) {
                                            detach(removeEle_1);
                                        }
                                    }
                                });
                            }
                            if (rng[0] === frozenRow_1 && content_1.parentElement.classList.contains('e-main-panel')) {
                                ranges_1.forEach(function (subRng) {
                                    if (subRng !== rng) {
                                        removeEle_1 = rangeEle.getElementsByClassName('e-top')[0];
                                        if (removeEle_1 && subRng[2] + 1 === frozenRow_1) {
                                            detach(removeEle_1);
                                        }
                                    }
                                });
                            }
                        }
                        if (frozenCol_1) {
                            if (rng[3] + 1 === frozenCol_1) {
                                ranges_1.forEach(function (subRng) {
                                    if (subRng !== rng) {
                                        removeEle_1 = rangeEle.getElementsByClassName('e-right')[0];
                                        if (removeEle_1 && subRng[1] === frozenCol_1) {
                                            detach(removeEle_1);
                                        }
                                    }
                                });
                            }
                            if (rng[1] === frozenCol_1 && (content_1.classList.contains('e-sheet-content') || content_1.classList.contains('e-column-header'))) {
                                ranges_1.forEach(function (subRng) {
                                    if (subRng !== rng) {
                                        removeEle_1 = rangeEle.getElementsByClassName('e-left')[0];
                                        if (removeEle_1 && subRng[3] + 1 === frozenCol_1) {
                                            detach(removeEle_1);
                                        }
                                    }
                                });
                            }
                        }
                    }
                    else {
                        rangeEle = content_1.querySelector('.' + cls);
                        if (!rangeEle) {
                            rangeEle = ele.cloneNode(true);
                            content_1.appendChild(rangeEle);
                        }
                    }
                    locateElem(rangeEle, rng, sheet, parent.enableRtl, frozenRow_1, frozenCol_1, false, parent.viewport.beforeFreezeHeight, parent.viewport.beforeFreezeWidth, parent.sheetModule.colGroupWidth);
                    if (rangeEle.classList.contains('e-hide')) {
                        rangeEle.classList.remove('e-hide');
                    }
                });
            }
            else {
                removeRangeEle(parent.getSelectAllContent(), null, false);
                removeRangeEle(parent.getColumnHeaderContent(), null, false);
                removeRangeEle(parent.getRowHeaderContent(), null, false);
                locateElem(ele, range, sheet, parent.enableRtl, frozenRow_1, frozenCol_1);
                if (cls === 'e-range-indicator' || !parent.getMainContent().querySelector('.' + cls)) {
                    parent.getMainContent().appendChild(ele);
                }
            }
        }
    }
    else {
        locateElem(ele, range, sheet, parent.enableRtl, 0, 0);
        if (ele && !parent.getMainContent().querySelector('.' + cls)) {
            parent.getMainContent().appendChild(ele);
        }
    }
}
/**
 * @param {Element} content - Specify the content element.
 * @param {HTMLElement} checkElement - Specify the element.
 * @param {boolean} checkActiveCell - Specify the boolean value.
 * @returns {void} - remove element with given range
 */
export function removeRangeEle(content, checkElement, checkActiveCell) {
    var ele;
    if (checkActiveCell) {
        if (content !== checkElement) {
            ele = content.querySelector('.e-active-cell');
            if (ele) {
                detach(ele);
            }
        }
    }
    else {
        ele = content.querySelector('.e-selection');
        if (ele) {
            detach(ele);
        }
    }
}
/**
 * Position element with given range
 *
 * @hidden
 * @param {HTMLElement} ele - Specify the element.
 * @param {number[]} range - specify the range.
 * @param {SheetModel} sheet - Specify the sheet.
 * @param {boolean} isRtl - Specify the boolean value.
 * @param {number} frozenRow - Specidy the frozen row.
 * @param {number} frozenColumn - Specify the frozen column
 * @param {boolean} isActiveCell - Specidy the boolean value.
 * @param {number} freezeScrollHeight - Specify the freeze scroll height
 * @param {number} freezeScrollWidth - Specify the freeze scroll width
 * @param {number} rowHdrWidth - Specify the row header width
 * @returns {void} - Position element with given range
 */
export function locateElem(ele, range, sheet, isRtl, frozenRow, frozenColumn, isActiveCell, freezeScrollHeight, freezeScrollWidth, rowHdrWidth) {
    var swapRange = getSwapRange(range);
    var cellPosition = getCellPosition(sheet, swapRange, frozenRow, frozenColumn, freezeScrollHeight, freezeScrollWidth, rowHdrWidth);
    var startIndex = [skipHiddenIdx(sheet, 0, true), skipHiddenIdx(sheet, 0, true, 'columns')];
    var height = getRowsHeight(sheet, range[0], range[2], true);
    var width = getColumnsWidth(sheet, range[1], range[3], true);
    var attrs = {
        'top': (swapRange[0] === startIndex[0] ? cellPosition.top : cellPosition.top - getDPRValue(1)) + 'px',
        'height': height && height + (swapRange[0] === startIndex[0] ? 0 : getDPRValue(1)) + 'px',
        'width': width && width + (swapRange[1] === startIndex[1] ? 0 : getDPRValue(1)) + (isActiveCell
            && frozenColumn && swapRange[1] < frozenColumn && swapRange[3] >= frozenColumn ? 1 : 0) + 'px'
    };
    attrs[isRtl ? 'right' : 'left'] = (swapRange[1] === startIndex[1] ? cellPosition.left : cellPosition.left - 1) + 'px';
    if (ele) {
        setStyleAttribute([{ element: ele, attrs: attrs }]);
    }
}
/**
 * To update element styles using request animation frame
 *
 * @hidden
 * @param {StyleType[]} styles - Specify the styles
 * @returns {void} - To update element styles using request animation frame
 */
export function setStyleAttribute(styles) {
    requestAnimationFrame(function () {
        styles.forEach(function (style) {
            setBaseStyleAttribute(style.element, style.attrs);
        });
    });
}
/**
 * @hidden
 * @returns {string} - to get Start Event
 */
export function getStartEvent() {
    return (Browser.isPointer ? 'pointerdown' : 'mousedown touchstart');
}
/**
 * @hidden
 * @returns {string} - to get Move Event
 */
export function getMoveEvent() {
    return (Browser.isPointer ? 'pointermove' : 'mousemove touchmove');
}
/**
 * @hidden
 * @returns {string} - Returns string value.
 */
export function getEndEvent() {
    return (Browser.isPointer ? 'pointerup' : 'mouseup touchend');
}
/**
 * @hidden
 * @param {Event} e - To specify the event.
 * @returns {boolean} - Returns boolean value.
 */
export function isTouchStart(e) {
    return e.type === 'touchstart' || (e.type === 'pointerdown' && e.pointerType === 'touch');
}
/**
 * @hidden
 * @param {Event} e - To specify the event.
 * @returns {boolean} - Returns boolean value.
 */
export function isTouchMove(e) {
    return e.type === 'touchmove' || (e.type === 'pointermove' && e.pointerType === 'touch');
}
/**
 * @hidden
 * @param {Event} e - To specify the event.
 * @returns {boolean} - Returns boolean value.
 */
export function isTouchEnd(e) {
    return e.type === 'touchend' || (e.type === 'pointerup' && e.pointerType === 'touch');
}
/**
 * @hidden
 * @param {TouchEvent | MouseEvent} e - To specify the mouse and touch event.
 * @returns {number} - To get client value
 */
export function isMouseDown(e) {
    return e && (e.type === 'mousedown' || e.type === 'pointerdown');
}
/**
 * @param {MouseEvent} e - Specify the event.
 * @returns {boolean} - To get boolean value.
 * @hidden
 */
export function isMouseMove(e) {
    return e && (e.type === 'mousemove' || e.type === 'pointermove');
}
/**
 * @param {MouseEvent} e - Specify the event.
 * @returns {boolean} - To get boolean value
 * @hidden
 */
export function isMouseUp(e) {
    return e && (e.type === 'mouseup' || e.type === 'pointerup');
}
/**
 * @param {MouseEvent | TouchEvent} e - To specify the mouse or touch event.
 * @returns {number} - To get client X value.
 * @hidden
 */
export function getClientX(e) {
    return e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
}
/**
 * @hidden
 * @param {MouseEvent | TouchEvent} e - To specify the mouse and touch event.
 * @returns {number} - To get client value
 */
export function getClientY(e) {
    return e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
}
/**
 * Get even number based on device pixel ratio
 *
 * @param {number} value - Specify the number
 * @param {boolean} preventDecrease - Specify the boolean value
 * @returns {number} - To get DPR value
 * @hidden
 */
export function getDPRValue(value, preventDecrease) {
    if (window.devicePixelRatio % 1 > 0) {
        var pointValue = (value * window.devicePixelRatio) % 1;
        return value + (pointValue ? (((pointValue > 0.5 || preventDecrease) ? (1 - pointValue) : -1 * pointValue)
            / window.devicePixelRatio) : 0);
    }
    else {
        return value;
    }
}
var config = {
    role: 'role',
    selected: 'aria-selected',
    multiselectable: 'aria-multiselectable',
    busy: 'aria-busy',
    colcount: 'aria-colcount'
};
/**
 * @hidden
 * @param {HTMLElement} target - specify the target.
 * @param {IAriaOptions<boolean>} options - Specify the options.
 * @returns {void} -  to set Aria Options
 */
export function setAriaOptions(target, options) {
    var props = Object.keys(options);
    props.forEach(function (name) {
        if (target) {
            target.setAttribute(config[name], options[name]);
        }
    });
}
/**
 * @hidden
 * @param {HTMLElement} element - specify the element.
 * @param {Object} component - Specify the component.
 * @returns {void} -  to destroy the component.
 */
export function destroyComponent(element, component) {
    if (element) {
        var compObj = getComponent(element, component);
        if (compObj) {
            compObj.destroy();
        }
    }
}
/**
 * @hidden
 * @param {number} idx - Specify the index
 * @param {number} index - Specify the index
 * @param {string} value - Specify the value.
 * @param {boolean} isCol - Specify the boolean value.
 * @param {Spreadsheet} parent - Specify the parent.
 * @returns {void} - To set resize.
 */
export function setResize(idx, index, value, isCol, parent) {
    var curEle;
    var curEleH;
    var curEleC;
    var preEle;
    var preEleH;
    var preEleC;
    var nxtEle;
    var nxtEleH;
    var nxtEleC;
    var sheet = parent.getActiveSheet();
    var frozenRow = parent.frozenRowCount(sheet);
    var frozenCol = parent.frozenColCount(sheet);
    if (isCol) {
        var header = idx < frozenCol ? parent.getSelectAllContent() : parent.getColumnHeaderContent();
        curEle = header.getElementsByTagName('th')[index];
        curEleH = header.getElementsByTagName('col')[index];
        curEleC = (idx < frozenCol ? parent.getRowHeaderContent() : parent.getMainContent()).getElementsByTagName('col')[index];
    }
    else {
        curEle = curEleH = frozenRow || frozenCol ? parent.getRow(idx, null, frozenCol - 1) :
            parent.getRow(idx, parent.getRowHeaderTable());
        curEleH.style.height = parseInt(value, 10) > 0 ? getDPRValue(parseInt(value, 10)) + 'px' : '2px';
        curEleC = parent.getRow(idx, null, frozenCol);
        curEleC.style.height = parseInt(value, 10) > 0 ? getDPRValue(parseInt(value, 10)) + 'px' : '0px';
        var hdrFntSize = void 0;
        if (sheet.showHeaders) {
            var hdrRow = parent.getRowHeaderContent().getElementsByClassName('e-row');
            var hdrClone = [];
            hdrClone[0] = hdrRow[index].getElementsByTagName('td')[0].cloneNode(true);
            hdrFntSize = findMaxValue(parent.getRowHeaderTable(), hdrClone, false, parent) + 1;
        }
        var contentRow = parent.getMainContent().getElementsByClassName('e-row');
        var contentClone = [];
        for (var idx_1 = 0; idx_1 < contentRow[index].getElementsByTagName('td').length; idx_1++) {
            contentClone[idx_1] = contentRow[index].getElementsByTagName('td')[idx_1].cloneNode(true);
        }
        var cntFntSize = findMaxValue(parent.getContentTable(), contentClone, false, parent) + 1;
        var fntSize = hdrFntSize >= cntFntSize ? hdrFntSize : cntFntSize;
        if (parseInt(curEleC.style.height, 10) < fntSize ||
            (curEle && curEle.classList.contains('e-reach-fntsize') && parseInt(curEleC.style.height, 10) === fntSize)) {
            if (sheet.showHeaders) {
                curEle.classList.add('e-reach-fntsize');
                curEleH.style.lineHeight = parseInt(value, 10) >= 4 ? ((parseInt(value, 10)) - 4) + 'px' :
                    parseInt(value, 10) > 0 ? ((parseInt(value, 10)) - 1) + 'px' : '0px';
            }
            curEleC.style.lineHeight = parseInt(value, 10) > 0 ? ((parseInt(value, 10)) - 1) + 'px' : '0px';
        }
        else {
            if (curEleH) {
                curEleH.style.removeProperty('line-height');
            }
            curEleC.style.removeProperty('line-height');
            if (curEle && curEle.classList.contains('e-reach-fntsize')) {
                curEle.classList.remove('e-reach-fntsize');
            }
        }
    }
    preEleC = curEleC.previousElementSibling;
    nxtEleC = curEleC.nextElementSibling;
    if (preEleC) {
        if (sheet.showHeaders) {
            preEle = curEle.previousElementSibling;
            preEleH = curEleH.previousElementSibling;
        }
        preEleC = curEleC.previousElementSibling;
    }
    if (nxtEleC) {
        if (sheet.showHeaders) {
            nxtEle = curEle.nextElementSibling;
            nxtEleH = curEleH.nextElementSibling;
        }
        nxtEleC = curEleC.nextElementSibling;
    }
    if (parseInt(value, 10) <= 0 && !(curEleC.classList.contains('e-zero') || curEleC.classList.contains('e-zero-start'))) {
        if (preEleC && nxtEleC) {
            if (isCol) {
                if (sheet.showHeaders) {
                    curEleH.style.width = '2px';
                }
                curEleC.style.width = '0px';
            }
            else {
                if (sheet.showHeaders) {
                    curEleH.style.height = '2px';
                }
                curEleC.style.height = '0px';
            }
            if (preEleC.classList.contains('e-zero-start')) {
                if (sheet.showHeaders) {
                    curEle.classList.add('e-zero-start');
                }
                curEleC.classList.add('e-zero-start');
            }
            else {
                if (sheet.showHeaders) {
                    curEle.classList.add('e-zero');
                }
                curEleC.classList.add('e-zero');
            }
            if (nxtEle && !nxtEle.classList.contains('e-zero') && !nxtEle.classList.contains('e-zero-last')) {
                if (sheet.showHeaders) {
                    curEle.classList.add('e-zero-last');
                }
                curEleC.classList.add('e-zero-last');
            }
            if (preEleC.classList.contains('e-zero-last')) {
                if (sheet.showHeaders) {
                    preEle.classList.remove('e-zero-last');
                }
                preEleC.classList.remove('e-zero-last');
            }
            if (sheet.showHeaders && preEle.classList.contains('e-zero')) {
                if (curEle.classList.contains('e-zero-end')) {
                    setWidthAndHeight(preEleH, -2, isCol);
                }
                else {
                    setWidthAndHeight(preEleH, -2, isCol);
                }
            }
            else if (sheet.showHeaders) {
                setWidthAndHeight(preEleH, -1, isCol);
            }
            if (sheet.showHeaders && preEle.classList.contains('e-zero-start')) {
                setWidthAndHeight(curEleH, -1, isCol);
            }
            if (sheet.showHeaders && nxtEle.classList.contains('e-zero')) {
                if (curEle.classList.contains('e-zero-start')) {
                    while (nxtEle) {
                        if (nxtEle.classList.contains('e-zero') && (parseInt(nxtEleH.style.height, 10) !== 0 && !isCol) ||
                            (parseInt(nxtEleH.style.width, 10) !== 0 && isCol)) {
                            if (isCol) {
                                curEleH.style.width = parseInt(curEleH.style.width, 10) - 1 + 'px';
                                nxtEleH.style.width = parseInt(nxtEleH.style.width, 10) - 1 + 'px';
                            }
                            else {
                                curEleH.style.height = parseInt(curEleH.style.height, 10) - 1 + 'px';
                                nxtEleH.style.height = parseInt(nxtEleH.style.height, 10) - 1 + 'px';
                            }
                            nxtEle.classList.remove('e-zero');
                            nxtEle.classList.add('e-zero-start');
                            break;
                        }
                        else {
                            var nxtIndex = void 0;
                            nxtEle.classList.remove('e-zero');
                            nxtEle.classList.add('e-zero-start');
                            if (isCol) {
                                nxtIndex = parseInt(nxtEle.getAttribute('aria-colindex'), 10) - 1;
                                nxtEle = parent.getColHeaderTable().getElementsByTagName('th')[nxtIndex + 1];
                                nxtEleH = parent.getColHeaderTable().getElementsByTagName('col')[nxtIndex + 1];
                            }
                            else {
                                nxtIndex = parseInt(nxtEle.getAttribute('aria-rowindex'), 10) - 1;
                                nxtEle = parent.getRowHeaderTable().getElementsByTagName('tr')[nxtIndex + 1];
                                nxtEleH = parent.getRowHeaderTable().getElementsByTagName('tr')[nxtIndex + 1];
                            }
                        }
                    }
                }
                else {
                    setWidthAndHeight(curEleH, -2, isCol);
                }
            }
            else if (sheet.showHeaders) {
                if (nxtEle.classList.contains('e-zero-end')) {
                    if (isCol) {
                        curEleH.style.width = '0px';
                    }
                    else {
                        curEleH.style.height = '0px';
                    }
                }
                else {
                    setWidthAndHeight(nxtEleH, -1, isCol);
                }
            }
        }
        else if (preEleC) {
            if (isCol) {
                if (sheet.showHeaders) {
                    curEleH.style.width = '1px';
                }
                curEleC.style.width = '0px';
            }
            else {
                if (sheet.showHeaders) {
                    curEleH.style.height = '1px';
                }
                curEleC.style.height = '0px';
            }
            if (sheet.showHeaders) {
                curEle.classList.add('e-zero-end');
            }
            curEleC.classList.add('e-zero-end');
            if (sheet.showHeaders) {
                curEle.classList.add('e-zero-last');
            }
            curEleC.classList.add('e-zero-last');
            if (sheet.showHeaders && preEle.classList.contains('e-zero')) {
                setWidthAndHeight(preEleH, -2, isCol);
            }
            else {
                setWidthAndHeight(preEleH, -1, isCol);
            }
        }
        else if (nxtEle) {
            curEle.classList.add('e-zero-start');
            curEleC.classList.add('e-zero-start');
            if (!nxtEle.classList.contains('e-zero')) {
                curEle.classList.add('e-zero-last');
                curEleC.classList.add('e-zero-last');
            }
            if (isCol) {
                curEleH.style.width = '1px';
                curEleC.style.width = '0px';
            }
            else {
                curEleH.style.height = '1px';
                curEleC.style.height = '0px';
            }
            if (sheet.showHeaders && nxtEle.classList.contains('e-zero')) {
                while (nxtEle) {
                    if (nxtEle.classList.contains('e-zero') && (parseInt(nxtEleH.style.width, 10) !== 0
                        && isCol) || (parseInt(nxtEleH.style.height, 10) !== 0 && !isCol)) {
                        if (isCol) {
                            nxtEleH.style.width = parseInt(nxtEleH.style.width, 10) - 1 + 'px';
                            curEleH.style.width = parseInt(curEleH.style.width, 10) - 1 + 'px';
                        }
                        else {
                            nxtEleH.style.height = parseInt(nxtEleH.style.height, 10) - 1 + 'px';
                            curEleH.style.height = parseInt(curEleH.style.height, 10) - 1 + 'px';
                        }
                        nxtEle.classList.add('e-zero-start');
                        nxtEle.classList.remove('e-zero');
                        break;
                    }
                    else {
                        var nxtIndex = void 0;
                        nxtEle.classList.add('e-zero-start');
                        nxtEle.classList.remove('e-zero');
                        if (isCol) {
                            nxtIndex = parseInt(nxtEle.getAttribute('aria-colindex'), 10) - 1;
                            nxtEleH = parent.getColHeaderTable().getElementsByTagName('col')[nxtIndex + 1];
                            nxtEle = parent.getColHeaderTable().getElementsByTagName('th')[nxtIndex + 1];
                        }
                        else {
                            nxtIndex = parseInt(nxtEle.getAttribute('aria-rowindex'), 10) - 1;
                            nxtEleH = parent.getRowHeaderTable().getElementsByTagName('tr')[nxtIndex + 1];
                            nxtEle = parent.getRowHeaderTable().getElementsByTagName('tr')[nxtIndex + 1];
                        }
                    }
                }
            }
            else if (sheet.showHeaders) {
                setWidthAndHeight(nxtEleH, -1, isCol);
            }
        }
    }
    else if (parseInt(value, 10) > 0) {
        var DPRValue = getDPRValue(parseInt(value, 10)) + 'px';
        if (isCol) {
            curEleH.style.width = DPRValue;
            curEleC.style.width = DPRValue;
        }
        else {
            curEleH.style.height = DPRValue;
            curEleC.style.height = DPRValue;
        }
        if (sheet.showHeaders && preEle && nxtEle) {
            if (preEle.classList.contains('e-zero')) {
                if (curEle.classList.contains('e-zero')) {
                    if (isCol) {
                        preEleH.style.width = parseInt(preEleH.style.width, 10) + 2 + 'px';
                        curEleH.style.width = parseInt(curEleH.style.width, 10) - 1 + 'px';
                    }
                    else {
                        preEleH.style.height = parseInt(preEleH.style.height, 10) + 2 + 'px';
                        curEleH.style.height = parseInt(curEleH.style.height, 10) - 1 + 'px';
                    }
                }
                else {
                    setWidthAndHeight(curEleH, -1, isCol);
                }
            }
            else {
                if (curEle.classList.contains('e-zero')) {
                    setWidthAndHeight(preEleH, 1, isCol);
                }
                else {
                    if (curEle.classList.contains('e-zero-start')) {
                        if (isCol) {
                            preEleH.style.width = parseInt(preEleH.style.width, 10) + 1 + 'px';
                            curEleH.style.width = parseInt(curEleH.style.width, 10) - 1 + 'px';
                        }
                        else {
                            preEleH.style.height = parseInt(preEleH.style.height, 10) + 1 + 'px';
                            curEleH.style.height = parseInt(curEleH.style.height, 10) - 1 + 'px';
                        }
                    }
                }
            }
            if (nxtEle.classList.contains('e-zero')) {
                setWidthAndHeight(curEleH, -1, isCol);
            }
            else {
                if (curEle.classList.contains('e-zero') || curEle.classList.contains('e-zero-start')) {
                    setWidthAndHeight(nxtEleH, 1, isCol);
                }
            }
            if (curEle.classList.contains('e-zero')) {
                curEle.classList.remove('e-zero');
            }
            if (curEle.classList.contains('e-zero-start')) {
                curEle.classList.remove('e-zero-start');
            }
            if (curEleC.classList.contains('e-zero')) {
                curEleC.classList.remove('e-zero');
            }
            if (curEleC.classList.contains('e-zero-start')) {
                curEleC.classList.remove('e-zero-start');
            }
            if (curEle.classList.contains('e-zero-last')) {
                curEle.classList.remove('e-zero-last');
            }
            if (curEleC.classList.contains('e-zero-last')) {
                curEleC.classList.remove('e-zero-last');
            }
            if (preEle.classList.contains('e-zero') || preEle.classList.contains('e-zero-start')) {
                preEle.classList.add('e-zero-last');
                preEleC.classList.add('e-zero-last');
            }
        }
        else if (sheet.showHeaders && preEle) {
            if (preEle.classList.contains('e-zero')) {
                if (curEle.classList.contains('e-zero')) {
                    if (isCol) {
                        curEleH.style.width = parseInt(curEleH.style.width, 10) - 1 + 'px';
                        preEleH.style.width = parseInt(preEleH.style.width, 10) + 2 + 'px';
                    }
                    else {
                        curEleH.style.height = parseInt(curEleH.style.height, 10) - 1 + 'px';
                        preEleH.style.height = parseInt(preEleH.style.height, 10) + 2 + 'px';
                    }
                }
                else {
                    setWidthAndHeight(curEleH, -1, isCol);
                }
            }
            else {
                if (curEle.classList.contains('e-zero')) {
                    setWidthAndHeight(preEleH, 1, isCol);
                }
                else {
                    setWidthAndHeight(curEleH, -1, isCol);
                }
            }
            if (curEle.classList.contains('e-zero')) {
                curEle.classList.remove('e-zero');
            }
            if (curEle.classList.contains('e-zero-end')) {
                curEle.classList.remove('e-zero-end');
            }
            if (curEleC.classList.contains('e-zero')) {
                curEleC.classList.remove('e-zero');
            }
            if (curEleC.classList.contains('e-zero-end')) {
                curEleC.classList.remove('e-zero-end');
            }
        }
        else if (sheet.showHeaders && nxtEle) {
            if (nxtEle.classList.contains('e-zero')) {
                setWidthAndHeight(curEleH, -1, isCol);
            }
            else if (curEle.classList.contains('e-zero-start')) {
                setWidthAndHeight(nxtEleH, 1, isCol);
                curEle.classList.remove('e-zero-start');
            }
            if (curEle.classList.contains('e-zero')) {
                curEle.classList.remove('e-zero');
            }
            if (curEleC.classList.contains('e-zero')) {
                curEleC.classList.remove('e-zero');
            }
            if (curEle.classList.contains('e-zero-start')) {
                curEle.classList.remove('e-zero-start');
            }
            if (curEleC.classList.contains('e-zero-start')) {
                curEleC.classList.remove('e-zero-start');
            }
        }
    }
}
/**
 * @hidden
 * @param {HTMLElement} trgt - Specify the target element.
 * @param {number} value - specify the number.
 * @param {boolean} isCol - Specify the boolean vlaue.
 * @returns {void} -  to set width and height.
 */
export function setWidthAndHeight(trgt, value, isCol) {
    if (isCol) {
        trgt.style.width = parseInt(trgt.style.width, 10) + value + 'px';
    }
    else {
        trgt.style.height = parseInt(trgt.style.height, 10) + value + 'px';
    }
}
/**
 * @hidden
 * @param {HTMLElement} table - Specify the table.
 * @param {HTMLElement[]} text - specify the text.
 * @param {boolean} isCol - Specifyt boolean value
 * @param {Spreadsheet} parent - Specify the parent.
 * @param {string} prevData - specify the prevData.
 * @param {boolean} isWrap - Specifyt boolean value
 * @returns {number} - To find maximum value.
 */
export function findMaxValue(table, text, isCol, parent, prevData, isWrap) {
    var myTableDiv = parent.createElement('div', { className: parent.element.className, styles: 'display: block' });
    var myTable = parent.createElement('table', {
        className: table.className + 'e-resizetable',
        styles: 'width: auto;height: auto'
    });
    var myTr = parent.createElement('tr');
    if (isCol) {
        text.forEach(function (element) {
            var tr = myTr.cloneNode();
            tr.appendChild(element);
            myTable.appendChild(tr);
        });
    }
    else {
        text.forEach(function (element) {
            myTr.appendChild(element.cloneNode(true));
        });
        myTable.appendChild(myTr);
    }
    myTableDiv.appendChild(myTable);
    document.body.appendChild(myTableDiv);
    var offsetWidthValue;
    var offsetHeightValue;
    var tableMaxWidth = myTable.getBoundingClientRect().width;
    var tableMaxHeight = myTable.getBoundingClientRect().height;
    if (!isWrap) {
        offsetHeightValue = tableMaxHeight;
        offsetWidthValue = tableMaxWidth;
    }
    else {
        if (isCol && parseInt(prevData, 10) > tableMaxWidth) {
            offsetWidthValue = tableMaxWidth;
        }
        else {
            offsetWidthValue = parseInt(prevData, 10);
        }
        if (!isCol && parseInt(prevData, 10) > tableMaxHeight) {
            offsetHeightValue = tableMaxHeight;
        }
        else {
            offsetHeightValue = parseInt(prevData, 10);
        }
    }
    document.body.removeChild(myTableDiv);
    if (isCol) {
        return Math.ceil(offsetWidthValue);
    }
    else {
        return Math.ceil(offsetHeightValue);
    }
}
/**
 * @hidden
 * @param {CollaborativeEditArgs} options - Specify the collaborative edit arguments.
 * @param {Spreadsheet} spreadsheet - specify the spreadsheet.
 * @param {boolean} isRedo - Specifyt he boolean value.
 * @returns {void} - To update the Action.
 */
export function updateAction(options, spreadsheet, isRedo) {
    /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
    var eventArgs = options.eventArgs;
    var chartElement;
    var element;
    var args;
    var promise;
    var sortArgs;
    var cellEvtArgs;
    var cellValue;
    var clipboardPromise;
    var model;
    switch (options.action) {
        case 'sorting':
            args = {
                range: options.eventArgs.range,
                sortOptions: options.eventArgs.sortOptions,
                cancel: false
            };
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            promise = new Promise(function (resolve, reject) {
                resolve((function () { })());
            });
            sortArgs = { args: args, promise: promise };
            spreadsheet.notify(initiateSort, sortArgs);
            sortArgs.promise.then(function (args) {
                spreadsheet.serviceLocator.getService('cell').refreshRange(getIndexesFromAddress(args.range));
            });
            break;
        case 'cellSave':
            cellEvtArgs = options.eventArgs;
            cellValue = eventArgs.formula ? (isRedo ? { value: cellEvtArgs.formula } : { formula: cellEvtArgs.formula })
                : { value: cellEvtArgs.value };
            spreadsheet.updateCell(cellValue, cellEvtArgs.address);
            break;
        case 'cellDelete':
            spreadsheet.clearRange(options.eventArgs.address, null, true);
            spreadsheet.serviceLocator.getService('cell').refreshRange(getRangeIndexes(options.eventArgs.address));
            break;
        case 'format':
            if (eventArgs.requestType === 'CellFormat') {
                if (eventArgs.style && eventArgs.style.border && !isNullOrUndefined(eventArgs.borderType)) {
                    var style = {};
                    Object.assign(style, eventArgs.style, null, true);
                    eventArgs.style.border = undefined;
                    spreadsheet.cellFormat(eventArgs.style, eventArgs.range);
                    eventArgs.style.border = style.border;
                    spreadsheet.setBorder(eventArgs.style, eventArgs.range, eventArgs.borderType);
                    eventArgs.style = style;
                }
                else {
                    spreadsheet.cellFormat(eventArgs.style, eventArgs.range);
                }
            }
            else {
                spreadsheet.numberFormat(eventArgs.format, eventArgs.range);
            }
            break;
        case 'clipboard':
            if (eventArgs.copiedInfo.isCut && !isRedo) {
                return;
            }
            clipboardPromise = eventArgs.copiedInfo.isCut ? spreadsheet.cut(eventArgs.copiedRange)
                : spreadsheet.copy(eventArgs.copiedRange);
            clipboardPromise.then(function () {
                spreadsheet.paste(eventArgs.pastedRange, eventArgs.type);
            });
            break;
        case 'gridLines':
            spreadsheet.setSheetPropertyOnMute(spreadsheet.sheets[eventArgs.sheetIdx], 'showGridLines', eventArgs.isShow);
            break;
        case 'headers':
            spreadsheet.setSheetPropertyOnMute(spreadsheet.sheets[eventArgs.sheetIdx], 'showHeaders', eventArgs.isShow);
            break;
        case 'resize':
        case 'resizeToFit':
            if (eventArgs.isCol) {
                if (eventArgs.hide === undefined) {
                    spreadsheet.setColWidth(eventArgs.width, eventArgs.index, eventArgs.sheetIdx);
                }
                else {
                    spreadsheet.hideColumn(eventArgs.index, eventArgs.index, eventArgs.hide);
                }
            }
            else {
                if (eventArgs.hide === undefined) {
                    spreadsheet.setRowHeight(eventArgs.height, eventArgs.index, eventArgs.sheetIdx + 1);
                }
                else {
                    spreadsheet.hideRow(eventArgs.index, eventArgs.index, eventArgs.hide);
                }
            }
            break;
        case 'renameSheet':
            spreadsheet.setSheetPropertyOnMute(spreadsheet.sheets[eventArgs.index - 1], 'name', eventArgs.value);
            break;
        case 'removeSheet':
            spreadsheet.notify(removeSheetTab, {
                index: eventArgs.index,
                isAction: true,
                count: eventArgs.sheetCount,
                clicked: true
            });
            break;
        case 'wrap':
            wrap(options.eventArgs.address, options.eventArgs.wrap, spreadsheet);
            break;
        case 'hideShow':
            if (eventArgs.isCol) {
                spreadsheet.hideColumn(eventArgs.startIndex, eventArgs.endIndex, eventArgs.hide);
            }
            else {
                spreadsheet.hideRow(eventArgs.startIndex, eventArgs.endIndex, eventArgs.hide);
            }
            break;
        case 'replace':
            spreadsheet.updateCell({ value: eventArgs.compareVal }, eventArgs.address);
            break;
        case 'filter':
            spreadsheet.notify(initiateFilterUI, { predicates: null, range: eventArgs.range, sIdx: eventArgs.index, isCut: true });
            break;
        case 'insert':
            if (isRedo === false) {
                spreadsheet.delete(options.eventArgs.index, options.eventArgs.index + (options.eventArgs.model.length - 1), options.eventArgs.modelType);
            }
            else {
                spreadsheet.notify(insertModel, {
                    model: options.eventArgs.modelType === 'Sheet' ? spreadsheet :
                        spreadsheet.getActiveSheet(), start: options.eventArgs.index, end: options.eventArgs.index +
                        (options.eventArgs.model.length - 1), modelType: options.eventArgs.modelType,
                    isAction: false, checkCount: options.eventArgs.sheetCount,
                    activeSheetIndex: options.eventArgs.activeSheetIndex
                });
            }
            break;
        case 'delete':
            if (isRedo === false) {
                spreadsheet.notify(insertModel, {
                    model: options.eventArgs.modelType === 'Sheet' ? spreadsheet :
                        spreadsheet.getActiveSheet(), start: options.eventArgs.deletedModel, modelType: options.eventArgs.modelType,
                    isAction: false, columnCellsModel: options.eventArgs.deletedCellsModel
                });
            }
            else {
                spreadsheet.delete(options.eventArgs.startIndex, options.eventArgs.endIndex, options.eventArgs.modelType);
            }
            break;
        case 'validation':
            if (isRedo) {
                var rules = {
                    type: eventArgs.type, operator: eventArgs.operator, value1: eventArgs.value1,
                    value2: eventArgs.value2, ignoreBlank: eventArgs.ignoreBlank, inCellDropDown: eventArgs.inCellDropDown
                };
                spreadsheet.notify(setValidation, { rules: rules, range: eventArgs.range });
            }
            else {
                spreadsheet.notify(removeValidation, { range: eventArgs.range });
            }
            break;
        case 'merge':
            options.eventArgs.isAction = false;
            model = [];
            for (var rIdx = 0, rCnt = eventArgs.model.length; rIdx < rCnt; rIdx++) {
                model.push({ cells: [] });
                for (var cIdx = 0, cCnt = eventArgs.model[rIdx].cells.length; cIdx < cCnt; cIdx++) {
                    model[rIdx].cells[cIdx] = {};
                    Object.assign(model[rIdx].cells[cIdx], eventArgs.model[rIdx].cells[cIdx]);
                }
            }
            spreadsheet.notify(setMerge, options.eventArgs);
            eventArgs.model = model;
            break;
        case 'clear':
            spreadsheet.notify(clearViewer, { options: options.eventArgs, isPublic: true });
            break;
        case 'conditionalFormat':
            if (isRedo) {
                var conditionalFormat = {
                    type: eventArgs.type, cFColor: eventArgs.cFColor, value: eventArgs.value,
                    range: eventArgs.range
                };
                spreadsheet.notify(setCFRule, { conditionalFormat: conditionalFormat });
            }
            else {
                spreadsheet.notify(clearCFRule, { range: eventArgs.range });
            }
            break;
        case 'clearCF':
            if (isRedo) {
                spreadsheet.notify(clearCFRule, { range: eventArgs.selectedRange });
            }
            else {
                spreadsheet.notify(clearCells, {
                    conditionalFormats: eventArgs.cFormats,
                    oldRange: eventArgs.oldRange, selectedRange: eventArgs.selectedRange
                });
            }
            break;
        case 'insertImage':
            if (isRedo) {
                spreadsheet.notify(createImageElement, {
                    options: {
                        src: options.eventArgs.imageData,
                        height: options.eventArgs.imageHeight, width: options.eventArgs.imageWidth, imageId: options.eventArgs.id
                    },
                    range: options.eventArgs.range, isPublic: false, isUndoRedo: true
                });
            }
            else {
                spreadsheet.notify(deleteImage, {
                    id: options.eventArgs.id, sheetIdx: options.eventArgs.sheetIndex + 1, range: options.eventArgs.range
                });
            }
            break;
        case 'imageRefresh':
            element = document.getElementById(options.eventArgs.id);
            if (isRedo) {
                options.eventArgs.isUndoRedo = true;
                spreadsheet.notify(refreshImgCellObj, options.eventArgs);
            }
            else {
                spreadsheet.notify(refreshImgCellObj, {
                    prevTop: options.eventArgs.currentTop, prevLeft: options.eventArgs.currentLeft,
                    currentTop: options.eventArgs.prevTop, currentLeft: options.eventArgs.prevLeft, id: options.eventArgs.id,
                    currentHeight: options.eventArgs.prevHeight, currentWidth: options.eventArgs.prevWidth, requestType: 'imageRefresh',
                    prevHeight: options.eventArgs.currentHeight, prevWidth: options.eventArgs.currentWidth, isUndoRedo: true
                });
            }
            element.style.height = isRedo ? options.eventArgs.currentHeight + 'px' : options.eventArgs.prevHeight + 'px';
            element.style.width = isRedo ? options.eventArgs.currentWidth + 'px' : options.eventArgs.prevWidth + 'px';
            element.style.top = isRedo ? options.eventArgs.currentTop + 'px' : options.eventArgs.prevTop + 'px';
            element.style.left = isRedo ? options.eventArgs.currentLeft + 'px' : options.eventArgs.prevLeft + 'px';
            break;
        case 'insertChart':
            if (isRedo) {
                var chartOptions = [{
                        type: eventArgs.type, theme: eventArgs.theme, isSeriesInRows: eventArgs.isSeriesInRows,
                        range: eventArgs.range, id: eventArgs.id, height: eventArgs.height, width: eventArgs.width
                    }];
                spreadsheet.notify(setChart, {
                    chart: chartOptions, isInitCell: eventArgs.isInitCell, isUndoRedo: false, range: eventArgs.posRange
                });
            }
            else {
                spreadsheet.notify(deleteChart, { id: eventArgs.id, isUndoRedo: true });
            }
            break;
        case 'deleteChart':
            if (isRedo) {
                spreadsheet.notify(deleteChart, { id: eventArgs.id });
            }
            else {
                var chartOpts = [{
                        type: eventArgs.type, theme: eventArgs.theme, isSeriesInRows: eventArgs.isSeriesInRows,
                        range: eventArgs.range, id: eventArgs.id, height: eventArgs.height, width: eventArgs.width,
                        top: eventArgs.top, left: eventArgs.left
                    }];
                spreadsheet.notify(setChart, {
                    chart: chartOpts, isInitCell: eventArgs.isInitCell, isUndoRedo: false, range: eventArgs.posRange
                });
            }
            break;
        case 'chartRefresh':
            chartElement = document.getElementById(options.eventArgs.id);
            if (chartElement) {
                chartElement.style.height = isRedo ? options.eventArgs.currentHeight + 'px' : options.eventArgs.prevHeight + 'px';
                chartElement.style.width = isRedo ? options.eventArgs.currentWidth + 'px' : options.eventArgs.prevWidth + 'px';
                chartElement.style.top = isRedo ? options.eventArgs.currentTop + 'px' : options.eventArgs.prevTop + 'px';
                chartElement.style.left = isRedo ? options.eventArgs.currentLeft + 'px' : options.eventArgs.prevLeft + 'px';
            }
            if (isRedo) {
                options.eventArgs.isUndoRedo = true;
                spreadsheet.notify(refreshChartSize, {
                    height: chartElement.style.height, width: chartElement.style.width, overlayEle: chartElement
                });
            }
            else {
                spreadsheet.notify(refreshChartSize, {
                    height: chartElement.style.height, width: chartElement.style.width, overlayEle: chartElement
                });
            }
            break;
    }
}
/**
 * @hidden
 * @param {Workbook} workbook - Specify the workbook
 * @param {number} rowIdx - specify the roe index
 * @param {number} colIdx - specify the column Index.
 * @param {number} sheetIdx - specify the sheet index.
 * @returns {boolean} - Returns the boolean value.
 */
export function hasTemplate(workbook, rowIdx, colIdx, sheetIdx) {
    var sheet = workbook.sheets[sheetIdx];
    var ranges = sheet.ranges;
    var range;
    for (var i = 0, len = ranges.length; i < len; i++) {
        if (ranges[i].template) {
            range = getRangeIndexes(ranges[i].address.length ? ranges[i].address : ranges[i].startCell);
            if (range[0] <= rowIdx && range[1] <= colIdx && range[2] >= rowIdx && range[3] >= colIdx) {
                return true;
            }
        }
    }
    return false;
}
/**
 * Setting row height in view an model.
 *
 * @hidden
 * @param {Spreadsheet} parent - Specify the parent
 * @param {SheetModel} sheet - specify the column width
 * @param {number} height - specify the style.
 * @param {number} rowIdx - specify the rowIdx
 * @param {HTMLElement} row - specify the row
 * @param {HTMLElement} hRow - specify the hRow.
 * @param {boolean} notifyRowHgtChange - specify boolean value.
 * @returns {void} - Setting row height in view an model.
 */
export function setRowEleHeight(parent, sheet, height, rowIdx, row, hRow, notifyRowHgtChange) {
    if (notifyRowHgtChange === void 0) { notifyRowHgtChange = true; }
    var prevHgt = getRowHeight(sheet, rowIdx, true);
    var frozenCol = parent.frozenColCount(sheet);
    var dprHgt = getDPRValue(height);
    row = row || (sheet.frozenRows ? parent.getRow(rowIdx, null, frozenCol) : parent.getRow(rowIdx));
    if (row) {
        row.style.height = dprHgt + "px";
    }
    hRow = hRow || (sheet.frozenColumns ? parent.getRow(rowIdx, null, frozenCol - 1) :
        parent.getRow(rowIdx, parent.getRowHeaderTable()));
    if (hRow) {
        hRow.style.height = dprHgt + "px";
    }
    setRowHeight(sheet, rowIdx, height);
    parent.setProperties({ sheets: parent.sheets }, true);
    if (notifyRowHgtChange) {
        parent.notify(rowHeightChanged, { rowIdx: rowIdx, threshold: dprHgt - prevHgt });
    }
}
/**
 * @hidden
 * @param {Workbook} context - Specify the context
 * @param {CellStyleModel} style - specify the style.
 * @param {number} lines - specify the lines
 * @returns {number} - get Text Height
 */
export function getTextHeight(context, style, lines) {
    if (lines === void 0) { lines = 1; }
    var fontSize = (style && style.fontSize) || context.cellStyle.fontSize;
    var fontSizePx = fontSize.indexOf('pt') > -1 ? parseInt(fontSize, 10) * 1.33 : parseInt(fontSize, 10);
    var hgt = fontSizePx * (style && style.fontFamily === 'Arial Black' ? 1.44 : 1.24) * lines;
    return Math.ceil(hgt % 1 > 0.9 ? hgt + 1 : hgt); // 0.9 -> if it is nearest value adding extra 1 pixel
}
/**
 * @hidden
 * @param {string} text - Specify the text
 * @param {CellStyleModel} style - specify the style.
 * @param {CellStyleModel} parentStyle - specify the parentStyle
 * @returns {number} - get Text Width
 */
export function getTextWidth(text, style, parentStyle) {
    if (!style) {
        style = parentStyle;
    }
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    context.font = (style.fontStyle || parentStyle.fontStyle) + ' ' + (style.fontWeight || parentStyle.fontWeight) + ' '
        + (style.fontSize || parentStyle.fontSize) + ' ' + (style.fontFamily || parentStyle.fontFamily);
    return getDPRValue(context.measureText(text).width, true);
}
/**
 * @hidden
 * @param {string} text - Specify the text
 * @param {number} colwidth - specify the column width
 * @param {CellStyleModel} style - specify the style.
 * @param {CellStyleModel} parentStyle - specify the parentStyle
 * @returns {number} - Setting maximum height while doing formats and wraptext
 */
export function getLines(text, colwidth, style, parentStyle) {
    var width;
    var prevWidth = 0;
    var textArr = text.toString().split(' ');
    var spaceWidth = getTextWidth(' ', style, parentStyle);
    var lines;
    var cnt = 0;
    textArr.forEach(function (txt) {
        var lWidth = 0;
        var cWidth = 0;
        width = getTextWidth(txt, style, parentStyle);
        if (textArr[textArr.length - 1] !== txt) {
            width = width + spaceWidth;
        }
        lines = (prevWidth + width) / colwidth;
        if (lines >= 1) {
            if (prevWidth) {
                cnt++;
            }
            if (width / colwidth >= 1) {
                txt.split('').forEach(function (val) {
                    cWidth = getTextWidth(val, style, parentStyle);
                    lWidth += cWidth;
                    if (lWidth > colwidth) {
                        cnt++;
                        lWidth = cWidth;
                    }
                });
                prevWidth = lWidth + spaceWidth;
            }
            else {
                prevWidth = width;
            }
        }
        else {
            prevWidth += width;
        }
    });
    if (prevWidth) {
        cnt += Math.ceil((prevWidth - spaceWidth) / colwidth);
    }
    return cnt;
}
/**
 * calculation for width taken by border inside a cell
 *
 * @param {number} rowIdx - Specify the row index.
 * @param {number} colIdx - Specify the column index.
 * @param {SheetModel} sheet - Specify the sheet.
 * @returns {number} - get border width.
 */
function getBorderWidth(rowIdx, colIdx, sheet) {
    var width = 0;
    var cell = getCell(rowIdx, colIdx, sheet, null, true);
    var rightSideCell = getCell(rowIdx, colIdx + 1, sheet, null, true);
    if (cell.style) {
        if (cell.style.border) {
            width = (colIdx === 0 ? 2 : 1) * parseFloat(cell.style.border.split('px')[0]);
        }
        else {
            if (colIdx === 0 && cell.style.borderLeft) {
                width = parseFloat(cell.style.borderLeft.split('px')[0]);
            }
            if (cell.style.borderRight) {
                width += parseFloat(cell.style.borderRight.split('px')[0]);
            }
        }
    }
    if (!(cell.style && (cell.style.border || cell.style.borderRight)) && rightSideCell.style && rightSideCell.style.borderLeft) {
        width += parseFloat(rightSideCell.style.borderLeft.split('px')[0]);
    }
    return width;
}
/**
 * calculation for height taken by border inside a cell
 *
 * @param {number} rowIdx - Specify the row index.
 * @param {number} colIdx - Specify the column index.
 * @param {SheetModel} sheet - Specify the sheet.
 * @returns {number} - get border height.
 * @hidden
 */
export function getBorderHeight(rowIdx, colIdx, sheet) {
    var height = 0;
    var cell = getCell(rowIdx, colIdx, sheet, null, true);
    var bottomSideCell = getCell(rowIdx + 1, colIdx, sheet, null, true);
    if (cell.style) {
        if (cell.style.border) {
            height = (rowIdx === 0 ? 2 : 1) * parseFloat(cell.style.border.split('px')[0]);
        }
        else {
            if (rowIdx === 0 && cell.style.borderTop) {
                height = parseFloat(cell.style.borderTop.split('px')[0]);
            }
            if (cell.style.borderBottom) {
                height += parseFloat(cell.style.borderBottom.split('px')[0]);
            }
        }
    }
    if (!(cell.style && (cell.style.border || cell.style.borderBottom)) && bottomSideCell.style && bottomSideCell.style.borderTop) {
        height += parseFloat(bottomSideCell.style.borderTop.split('px')[0]);
    }
    return height;
}
/**
 * Calculating column width by excluding cell padding and border width
 *
 * @param {SheetModel} sheet - Specify the sheet
 * @param {number} rowIdx - Specify the row index.
 * @param {number} startColIdx - Specify the start column index.
 * @param {number} endColIdx - Specify the end column index.
 * @returns {number} - get excluded column width.
 * @hidden
 */
export function getExcludedColumnWidth(sheet, rowIdx, startColIdx, endColIdx) {
    if (endColIdx === void 0) { endColIdx = startColIdx; }
    return getColumnsWidth(sheet, startColIdx, endColIdx, true) - getDPRValue((4 + getBorderWidth(rowIdx, startColIdx, sheet))); // 4 -> For cell padding
}
/**
 * @param {Workbook} context - Specify the Workbook.
 * @param {number} rowIdx - Specify the row index.
 * @param {number} colIdx - Specify the column index.
 * @param {SheetModel} sheet - Specify the sheet.
 * @param {CellStyleModel} style - Specify the style.
 * @param {number} lines - Specify the lines.
 * @returns {number} - get text height with border.
 * @hidden
 */
export function getTextHeightWithBorder(context, rowIdx, colIdx, sheet, style, lines) {
    return getTextHeight(context, style, lines) + (getBorderHeight(rowIdx, colIdx, sheet) || 1); // 1 -> For default bottom border
}
/**
 * Setting maximum height while doing formats and wraptext
 *
 * @hidden
 * @param {SheetModel} sheet - Specify the sheet
 * @param {number} rIdx - specify the row Index
 * @param {number} cIdx - specify the column Index.
 * @param {number} hgt - specify the hgt
 * @returns {void} - Setting maximum height while doing formats and wraptext
 */
export function setMaxHgt(sheet, rIdx, cIdx, hgt) {
    if (!sheet.maxHgts[rIdx]) {
        sheet.maxHgts[rIdx] = {};
    }
    sheet.maxHgts[rIdx][cIdx] = hgt;
}
/**
 * Getting maximum height by comparing each cell's modified height.
 *
 * @hidden
 * @param {SheetModel} sheet - Specify the sheet.
 * @param {number} rIdx - Specify the row index.
 * @returns {number} - Getting maximum height by comparing each cell's modified height.
 */
export function getMaxHgt(sheet, rIdx) {
    var maxHgt = 0;
    var rowHgt = sheet.maxHgts[rIdx];
    if (rowHgt) {
        Object.keys(rowHgt).forEach(function (key) {
            if (rowHgt[key] > maxHgt) {
                maxHgt = rowHgt[key];
            }
        });
    }
    return maxHgt;
}
/**
 * @hidden
 * @param {SheetModel} sheet - Specify the sheet
 * @param {number} index - specify the index
 * @param {boolean} increase - specify the boolean value.
 * @param {string} layout - specify the string
 * @returns {number} - To skip the hidden index
 *
 */
export function skipHiddenIdx(sheet, index, increase, layout) {
    if (layout === void 0) { layout = 'rows'; }
    if (index < 0) {
        index = -1;
    }
    if ((sheet[layout])[index] && (sheet[layout])[index].hidden) {
        if (increase) {
            index++;
        }
        else {
            index--;
        }
        index = skipHiddenIdx(sheet, index, increase, layout);
    }
    return index;
}
/**
 * @hidden
 * @param {HTMLElement} ele - Specify the element.
 * @returns {void} - Specify the focus.
 */
export function focus(ele) {
    if (!document.activeElement.classList.contains('e-text-findNext-short')) {
        if (Browser.isIE) {
            var scrollX_1 = window.scrollX;
            var scrollY_1 = window.scrollY;
            ele.focus();
            window.scrollTo(scrollX_1, scrollY_1);
        }
        else {
            /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
            ele.focus({ preventScroll: true });
        }
    }
}
