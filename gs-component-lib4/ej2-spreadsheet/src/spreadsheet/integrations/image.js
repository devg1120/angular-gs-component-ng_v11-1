import { getColIdxFromClientX, createImageElement, deleteImage, refreshImagePosition } from '../common/event';
import { insertImage, refreshImgElem, refreshImgCellObj, getRowIdxFromClientY } from '../common/event';
import { overlay, dialog } from '../common/index';
import { removeClass } from '@syncfusion/ej2-base';
import { getCell, setCell, getSheetIndex, getRowsHeight, getColumnsWidth } from '../../workbook/index';
import { getRangeIndexes, setImage } from '../../workbook/index';
var SpreadsheetImage = /** @class */ (function () {
    function SpreadsheetImage(parent) {
        this.pictureCount = 1;
        this.parent = parent;
        this.addEventListener();
        this.renderImageUpload();
    }
    /**
     * Adding event listener for success and failure
     *
     * @returns {void} - Adding event listener for success and failure
     */
    SpreadsheetImage.prototype.addEventListener = function () {
        this.parent.on(insertImage, this.insertImage, this);
        this.parent.on(refreshImgElem, this.refreshImgElem, this);
        this.parent.on(refreshImgCellObj, this.refreshImgCellObj, this);
        this.parent.on(createImageElement, this.createImageElement, this);
        this.parent.on(deleteImage, this.deleteImage, this);
        this.parent.on(refreshImagePosition, this.refreshInsDelImagePosition, this);
    };
    /**
     * Rendering upload component for importing images.
     *
     * @returns {void} - Rendering upload component for importing images.
     */
    SpreadsheetImage.prototype.renderImageUpload = function () {
        var uploadID = this.parent.element.id + '_imageUpload';
        this.parent.element.appendChild(this.parent.createElement('input', {
            id: uploadID,
            attrs: { type: 'file', accept: '.image, .jpg, .png, .gif ,jpeg', name: 'fileUpload' }
        }));
        var uploadBox = document.getElementById(uploadID);
        uploadBox.onchange = this.imageSelect.bind(this);
        uploadBox.style.display = 'none';
    };
    /**
     * Process after select the excel and image file.
     *
     * @param {Event} args - File select native event.
     * @returns {void} - Process after select the excel and image file.
     */
    SpreadsheetImage.prototype.imageSelect = function (args) {
        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        var filesData = args.target.files[0];
        if (filesData && filesData.length < 1) {
            return;
        }
        var impArgs = {
            file: filesData
        };
        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        if (impArgs.file.type.indexOf('image') === 0) {
            this.insertImage(impArgs);
        }
        else {
            this.parent.serviceLocator.getService(dialog).show({
                content: this.parent.serviceLocator.getService('spreadsheetLocale')
                    .getConstant('UnsupportedFile'),
                width: '300'
            });
        }
        document.getElementById(this.parent.element.id + '_imageUpload').value = '';
    };
    /**
     * Removing event listener for success and failure
     *
     * @returns {void} - Removing event listener for success and failure
     */
    SpreadsheetImage.prototype.removeEventListener = function () {
        if (!this.parent.isDestroyed) {
            this.parent.off(insertImage, this.insertImage);
            this.parent.off(refreshImgCellObj, this.refreshImgCellObj);
            this.parent.off(createImageElement, this.createImageElement);
            this.parent.off(deleteImage, this.deleteImage);
            this.parent.off(refreshImagePosition, this.refreshInsDelImagePosition);
        }
    };
    /* eslint-disable */
    SpreadsheetImage.prototype.insertImage = function (args, range) {
        var _this = this;
        this.binaryStringVal(args).then(function (src) { return _this.createImageElement({ options: { src: src }, range: range, isPublic: true }); });
    };
    SpreadsheetImage.prototype.binaryStringVal = function (args) {
        return new Promise(function (resolve, reject) {
            var reader = new FileReader();
            reader.readAsDataURL(args.file);
            reader.onload = function () { return resolve(reader.result); };
            reader.onerror = function (error) { return reject(error); };
        });
    };
    /* eslint-enable */
    SpreadsheetImage.prototype.createImageElement = function (args) {
        var range = args.range ? (args.range.indexOf('!') > 0) ? args.range.split('!')[1] : args.range.split('!')[0]
            : this.parent.getActiveSheet().selectedRange;
        var sheetIndex = (args.range && args.range.indexOf('!') > 0) ?
            getSheetIndex(this.parent, args.range.split('!')[0]) : this.parent.activeSheetIndex;
        var overlayObj = this.parent.serviceLocator.getService(overlay);
        var id = args.options.imageId ? args.options.imageId : this.parent.element.id + '_overlay_picture_' + this.pictureCount;
        var indexes = getRangeIndexes(range);
        var sheet = sheetIndex ? this.parent.sheets[sheetIndex] : this.parent.getActiveSheet();
        if (document.getElementById(id)) {
            return;
        }
        var eventArgs = {
            requestType: 'beforeInsertImage', range: sheet.name + '!' + range,
            imageData: args.options.src, sheetIndex: sheetIndex
        };
        if (args.isPublic) {
            this.parent.notify('actionBegin', { eventArgs: eventArgs, action: 'beforeInsertImage' });
        }
        if (eventArgs.cancel) {
            return;
        }
        var element = overlayObj.insertOverlayElement(id, range, sheetIndex);
        element.style.backgroundImage = 'url(\'' + args.options.src + '\')';
        if (args.options.height || args.options.left) {
            element.style.height = args.options.height + 'px';
            element.style.width = args.options.width + 'px';
            element.style.top = args.options.top + 'px';
            element.style.left = args.options.left + 'px';
        }
        if (!args.options.imageId) {
            this.pictureCount++;
        }
        var imgData = {
            src: args.options.src, id: id, height: parseFloat(element.style.height.replace('px', '')),
            width: parseFloat(element.style.width.replace('px', '')), top: sheet.frozenRows || sheet.frozenColumns ?
                (indexes[0] ? getRowsHeight(sheet, 0, indexes[0] - 1) : 0) : parseFloat(element.style.top.replace('px', '')),
            left: sheet.frozenRows || sheet.frozenColumns ? (indexes[1] ? getColumnsWidth(sheet, 0, indexes[1] - 1) : 0) :
                parseFloat(element.style.left.replace('px', ''))
        };
        this.parent.setUsedRange(indexes[0], indexes[1]);
        if (args.isPublic || args.isUndoRedo) {
            this.parent.notify(setImage, { options: [imgData], range: sheet.name + '!' + range });
        }
        var currCell = getCell(indexes[0], indexes[1], sheet);
        if (!currCell.image[currCell.image.length - 1].id) {
            currCell.image[currCell.image.length - 1].id = imgData.id;
        }
        eventArgs = {
            requestType: 'insertImage', range: sheet.name + '!' + range, imageHeight: args.options.height ? args.options.height : 300,
            imageWidth: args.options.width ? args.options.width : 400, imageData: args.options.src, id: id, sheetIndex: sheetIndex
        };
        if (!args.isUndoRedo && args.isPublic) {
            this.parent.notify('actionComplete', { eventArgs: eventArgs, action: 'insertImage' });
        }
    };
    SpreadsheetImage.prototype.refreshImgElem = function () {
        var overlayElem = document.getElementsByClassName('e-ss-overlay-active')[0];
        if (overlayElem) {
            removeClass([overlayElem], 'e-ss-overlay-active');
        }
    };
    SpreadsheetImage.prototype.refreshInsDelImagePosition = function (args) {
        var count = args.count;
        var sheetIdx = args.sheetIdx;
        var sheet = this.parent.sheets[sheetIdx];
        var pictureElements;
        var currCellObj = getCell(args.rowIdx, args.colIdx, sheet);
        var imageLen = currCellObj.image.length;
        var top;
        var left;
        for (var i = 0; i < imageLen; i++) {
            pictureElements = document.getElementById(currCellObj.image[i].id);
            top = (args.type === 'Row') ? (args.status === 'insert') ? currCellObj.image[i].top + (count * 20) :
                currCellObj.image[i].top - (count * 20) : currCellObj.image[i].top;
            left = (args.type === 'Column') ? (args.status === 'insert') ? currCellObj.image[i].left + (count * 64) :
                currCellObj.image[i].left - (count * 64) : currCellObj.image[i].left;
            currCellObj.image[i].top = top;
            currCellObj.image[i].left = left;
            pictureElements.style.top = top + 'px';
            pictureElements.style.left = left + 'px';
        }
    };
    SpreadsheetImage.prototype.refreshImgCellObj = function (args) {
        var sheet = this.parent.getActiveSheet();
        var prevCellObj = getCell(args.prevRowIdx, args.prevColIdx, sheet);
        var currCellObj = getCell(args.currentRowIdx, args.currentColIdx, sheet);
        var prevCellImg = prevCellObj ? prevCellObj.image : [];
        var prevImgObj;
        var currImgObj;
        var prevCellImgLen = (prevCellImg && prevCellImg.length) ? prevCellImg.length : 0;
        if (prevCellObj && prevCellObj.image && prevCellImg.length > 0) {
            for (var i = 0; i < prevCellImgLen; i++) {
                if (prevCellImg[i] && prevCellImg[i].id === args.id) {
                    prevImgObj = prevCellImg[i];
                    prevImgObj.height = args.currentHeight;
                    prevImgObj.width = args.currentWidth;
                    prevImgObj.top = args.currentTop;
                    prevImgObj.left = args.currentLeft;
                    prevCellImg.splice(i, 1);
                }
            }
            if (currCellObj && currCellObj.image) {
                currImgObj = currCellObj.image;
                if (prevImgObj) {
                    currImgObj.push(prevImgObj);
                }
            }
            if (currImgObj) {
                setCell(args.currentRowIdx, args.currentColIdx, sheet, { image: currImgObj }, true);
            }
            else {
                setCell(args.currentRowIdx, args.currentColIdx, sheet, { image: [prevImgObj] }, true);
            }
            if (args.requestType === 'imageRefresh' && !args.isUndoRedo) {
                var eventArgs = {
                    requestType: 'imageRefresh', currentRowIdx: args.currentRowIdx, currentColIdx: args.currentColIdx,
                    prevRowIdx: args.prevRowIdx, prevColIdx: args.prevColIdx, prevTop: args.prevTop, prevLeft: args.prevLeft,
                    currentTop: args.currentTop, currentLeft: args.currentLeft, currentHeight: args.currentHeight,
                    currentWidth: args.currentWidth, prevHeight: args.prevHeight, prevWidth: args.prevWidth,
                    id: args.id, sheetIdx: this.parent.activeSheetIndex
                };
                this.parent.notify('actionComplete', { eventArgs: eventArgs, action: 'imageRefresh' });
            }
        }
    };
    SpreadsheetImage.prototype.deleteImage = function (args) {
        var sheet = this.parent.getActiveSheet();
        var pictureElements = document.getElementById(args.id);
        var rowIdx;
        var colIdx;
        if (pictureElements) {
            var imgTop = void 0;
            var imgleft = void 0;
            if (sheet.frozenRows || sheet.frozenColumns) {
                var clientRect = pictureElements.getBoundingClientRect();
                imgTop = { clientY: clientRect.top };
                imgleft = { clientX: clientRect.left };
                if (clientRect.top < this.parent.getColumnHeaderContent().getBoundingClientRect().bottom) {
                    imgTop.target = this.parent.getColumnHeaderContent();
                }
                if (clientRect.left < this.parent.getRowHeaderContent().getBoundingClientRect().right) {
                    imgleft.target = this.parent.getRowHeaderTable();
                }
            }
            else {
                imgTop = { clientY: pictureElements.offsetTop, isImage: true };
                imgleft = { clientX: pictureElements.offsetLeft, isImage: true };
            }
            this.parent.notify(getRowIdxFromClientY, imgTop);
            this.parent.notify(getColIdxFromClientX, imgleft);
            document.getElementById(args.id).remove();
            rowIdx = imgTop.clientY;
            colIdx = imgleft.clientX;
            sheet = this.parent.sheets[this.parent.activeSheetIndex];
        }
        else {
            var rangeVal = args.range ? args.range.indexOf('!') > 0 ? args.range.split('!')[1] : args.range.split('!')[0] :
                this.parent.getActiveSheet().selectedRange;
            var sheetIndex = args.range && args.range.indexOf('!') > 0 ? getSheetIndex(this.parent, args.range.split('!')[0]) :
                this.parent.activeSheetIndex;
            var index = getRangeIndexes(rangeVal);
            rowIdx = index[0];
            colIdx = index[1];
            sheet = this.parent.sheets[sheetIndex];
        }
        var cellObj = getCell(rowIdx, colIdx, sheet);
        var prevCellImg = cellObj.image;
        var imgLength = prevCellImg.length;
        for (var i = 0; i < imgLength; i++) {
            if (prevCellImg[i].id === args.id) {
                prevCellImg.splice(i, 1);
            }
        }
        setCell(rowIdx, colIdx, sheet, { image: prevCellImg }, true);
    };
    /**
     * To Remove the event listeners.
     *
     * @returns {void} - To Remove the event listeners.
     */
    SpreadsheetImage.prototype.destroy = function () {
        this.removeEventListener();
        this.parent = null;
    };
    /**
     * Get the sheet picture module name.
     *
     * @returns {string} - Get the sheet picture module name.
     */
    SpreadsheetImage.prototype.getModuleName = function () {
        return 'spreadsheetImage';
    };
    return SpreadsheetImage;
}());
export { SpreadsheetImage };
