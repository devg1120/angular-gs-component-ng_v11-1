/**
 * Check whether the text is formula or not.
 *
 * @param {string} text - Specify the text.
 * @returns {boolean} - Check whether the text is formula or not.
 */
export function checkIsFormula(text) {
    return text && text[0] === '=' && text.length > 1;
}
/**
 * Check whether the value is cell reference or not.
 *
 * @param {string} value - Specify the value to check.
 * @returns {boolean} - Returns boolean value
 */
export function isCellReference(value) {
    var range = value;
    range = range.split('$').join('');
    if (range.indexOf(':') > -1) {
        var rangeSplit = range.split(':');
        if (isValidCellReference(rangeSplit[0]) && isValidCellReference(rangeSplit[1])) {
            return true;
        }
    }
    else if (range.indexOf(':') < 0) {
        if (isValidCellReference(range)) {
            return true;
        }
    }
    return false;
}
/**
 * Check whether the value is character or not.
 *
 * @param {string} value - Specify the value to check.
 * @returns {boolean} - Returns boolean value
 */
export function isChar(value) {
    if ((value.charCodeAt(0) >= 65 && value.charCodeAt(0) <= 90) || (value.charCodeAt(0) >= 97 && value.charCodeAt(0) <= 122)) {
        return true;
    }
    return false;
}
/**
 * @param {number[]} range - Specify the range
 * @param {number} rowIdx - Specify the row index
 * @param {number} colIdx - Specify the col index
 * @returns {boolean} - Returns boolean value
 */
export function inRange(range, rowIdx, colIdx) {
    return range && (rowIdx >= range[0] && rowIdx <= range[2] && colIdx >= range[1] && colIdx <= range[3]);
}
/** @hidden
 * @param {number[]} range - Specify the range
 * @param {number[]} testRange - Specify the test range
 * @param {boolean} isModify - Specify the boolean value
 * @returns {boolean} - Returns boolean value
 */
export function isInRange(range, testRange, isModify) {
    var inRange = range[0] <= testRange[0] && range[2] >= testRange[2] && range[1] <= testRange[1] && range[3] >= testRange[3];
    if (inRange) {
        return true;
    }
    if (isModify) {
        if (testRange[0] < range[0] && testRange[2] < range[0] || testRange[0] > range[2] && testRange[2] > range[2]) {
            return false;
        }
        else {
            if (testRange[0] < range[0] && testRange[2] > range[0]) {
                testRange[0] = range[0];
                inRange = true;
            }
            if (testRange[2] > range[2]) {
                testRange[2] = range[2];
                inRange = true;
            }
        }
        if (testRange[1] < range[1] && testRange[3] < range[1] || testRange[1] > range[3] && testRange[3] > range[3]) {
            return false;
        }
        else {
            if (testRange[1] < range[1] && testRange[3] > range[1]) {
                testRange[1] = range[1];
                inRange = true;
            }
            if (testRange[3] > range[3]) {
                testRange[3] = range[3];
                inRange = true;
            }
        }
    }
    return inRange;
}
/**
 * Check whether the cell is locked or not
 *
 * @param {CellModel} cell - Specify the cell.
 * @param {ColumnModel} column - Specify the column.
 * @returns {boolean} - Returns boolean value
 * @hidden
 */
export function isLocked(cell, column) {
    if (!cell) {
        cell = {};
    }
    if (cell.isLocked) {
        return true;
    }
    else if (cell.isLocked === false) {
        return false;
    }
    else if (column && column.isLocked) {
        return true;
    }
    else if (!cell.isLocked && (column && column.isLocked !== false)) {
        return true;
    }
    return false;
}
/**
 * Check whether the value is cell reference or not.
 *
 * @param {string} value - Specify the value to check.
 * @returns {boolean} - Returns boolean value
 * @hidden
 */
export function isValidCellReference(value) {
    var text = value;
    var startNum = 0;
    var endNum = 0;
    var j = 0;
    var numArr = [89, 71, 69];
    // XFD is the last column, for that we are using ascii values of Z, G, E (89, 71, 69) to restrict the flow.
    var cellText = '';
    var textLength = text.length;
    for (var i = 0; i < textLength; i++) {
        if (isChar(text[i])) {
            endNum++;
        }
    }
    cellText = text.substring(startNum, endNum);
    var cellTextLength = cellText.length;
    if (cellTextLength !== textLength) {
        if (cellTextLength < 4) {
            if (textLength !== 1 && (isNaN(parseInt(text, 10)))) {
                while (j < cellTextLength) {
                    if ((cellText[j]) && cellText[j].charCodeAt(0) < numArr[j]) {
                        j++;
                        continue;
                    }
                    else if (!(cellText[j]) && j > 0) {
                        break;
                    }
                    else {
                        return false;
                    }
                }
                var cellNumber = parseFloat(text.substring(endNum, textLength));
                if (cellNumber > 0 && cellNumber < 1048577) { // 1048576 - Maximum number of rows in excel.
                    return true;
                }
            }
        }
    }
    return false;
}
