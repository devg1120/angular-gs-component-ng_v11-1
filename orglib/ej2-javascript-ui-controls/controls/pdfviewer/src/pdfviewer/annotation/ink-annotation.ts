/* eslint-disable */
import { PdfViewer } from '../index';
import { PdfViewerBase, IPageAnnotations } from '../index';
import { PdfAnnotationBaseModel } from '../drawing/pdf-annotation-model';
import { PdfAnnotationBase } from '../drawing/pdf-annotation';
import { AnnotationSelectorSettingsModel } from '../pdfviewer-model';
import { splitArrayCollection, processPathData, getPathString } from '@syncfusion/ej2-drawings';

export class InkAnnotation {
    private pdfViewer: PdfViewer;
    private pdfViewerBase: PdfViewerBase;
    // eslint-disable-next-line
    public newObject: any = [];
    /**
     * @private
     */
    public outputString: string = '';
    /**
     * @private
     */
    public mouseX: number;
    /**
     * @private
     */
    public mouseY: number;
    /**
     * @private
     */
    // eslint-disable-next-line
    public inkAnnotationindex: any = [];
    /**
     * @private
     */
    public currentPageNumber: string = '';
    constructor(pdfViewer: PdfViewer, pdfViewerBase: PdfViewerBase) {
        this.pdfViewer = pdfViewer;
        this.pdfViewerBase = pdfViewerBase;
    }
    /**
     * @private
     */
    public drawInk(): void {
        this.pdfViewerBase.disableTextSelectionMode();
        this.pdfViewer.tool = 'Ink';
    }

    public drawInkAnnotation(pageNumber?: number): void {
        if (this.pdfViewerBase.isToolbarInkClicked) {
            this.pdfViewerBase.isInkAdded = true;
            const pageIndex: number = !isNaN(pageNumber) ? pageNumber : this.pdfViewerBase.currentPageNumber - 1;
            if (this.outputString && this.outputString !== '') {
                const currentAnnot: PdfAnnotationBaseModel = this.addInk(pageIndex);
                this.pdfViewer.renderDrawing(undefined, pageIndex);
                this.pdfViewer.clearSelection(pageIndex);
                this.pdfViewer.select([currentAnnot.id], currentAnnot.annotationSelectorSettings);
                if (this.pdfViewer.toolbar && this.pdfViewer.toolbar.annotationToolbarModule) {
                    this.pdfViewer.toolbar.annotationToolbarModule.enableSignaturePropertiesTools(true);
                }
            } else {
                this.outputString = '';
                this.newObject = [];
                this.pdfViewerBase.isToolbarInkClicked = false;
                this.pdfViewer.tool = '';
            }
            this.pdfViewerBase.isInkAdded = false;
        }
    }

    /**
     * @private
     */
    public storePathData(): void {
        this.convertToPath(this.newObject);
        this.newObject = [];
    }
    /**
     * @param position
     * @param pageIndex
     * @private
     */
    // eslint-disable-next-line
    public drawInkInCanvas(position: any, pageIndex: number): void {
        // eslint-disable-next-line
        if (this.currentPageNumber !== '' && parseInt(this.currentPageNumber) !== pageIndex) {
            // eslint-disable-next-line
            this.drawInkAnnotation(parseInt(this.currentPageNumber));
            this.pdfViewerBase.isToolbarInkClicked = true;
            this.pdfViewer.tool = 'Ink';
        }
        // eslint-disable-next-line
        let canvas: any = document.getElementById(this.pdfViewer.element.id + '_annotationCanvas_' + pageIndex);
        // eslint-disable-next-line
        let context: any = canvas.getContext('2d');
        const thickness: number = this.pdfViewer.inkAnnotationSettings.thickness ? this.pdfViewer.inkAnnotationSettings.thickness : 1;
        // eslint-disable-next-line max-len
        const opacity: number = this.pdfViewer.inkAnnotationSettings.opacity ? this.pdfViewer.inkAnnotationSettings.opacity : 1;
        // eslint-disable-next-line max-len
        const strokeColor: string = this.pdfViewer.inkAnnotationSettings.strokeColor ? this.pdfViewer.inkAnnotationSettings.strokeColor : '#ff0000';
        context.beginPath();
        context.moveTo(position.prevPosition.x, position.prevPosition.y);
        context.lineTo(position.currentPosition.x, position.currentPosition.y);
        context.lineWidth = thickness;
        context.strokeStyle = strokeColor;
        context.globalAlpha = opacity;
        context.stroke();
        // context.lineWidth = 2;
        context.arc(position.prevPosition.x, position.prevPosition.y, 2 / 2, 0, Math.PI * 2, true);
        context.closePath();
        this.pdfViewerBase.prevPosition = position.currentPosition;
        this.newObject.push(position.currentPosition.x, position.currentPosition.y);
        this.currentPageNumber = pageIndex.toString();
    }
    // eslint-disable-next-line
    private convertToPath(newObject: any): void {
        this.movePath(newObject[0], newObject[1]);
        this.linePath(newObject[0], newObject[1]);
        for (let n: number = 2; n < newObject.length; n = n + 2) {
            this.linePath(newObject[n], newObject[n + 1]);
        }
    }
    private linePath(x: number, y: number): void {
        this.outputString += 'L' + x + ',' + y + ' ';
    }
    private movePath(x: number, y: number): void {
        this.outputString += 'M' + x + ',' + y + ' ';
    }
    /**
     * @param pageNumber
     * @private
     */
    // eslint-disable-next-line
    public addInk(pageNumber?:number): any {
        // eslint-disable-next-line
        let currentBounds: any = this.calculateInkSize();
        const zoomvalue: number = this.pdfViewerBase.getZoomFactor();
        // eslint-disable-next-line
        let annot: any;
        if (this.pdfViewerBase.isToolbarInkClicked) {
            const annotationName: string = this.pdfViewer.annotation.createGUID();
            const modifiedDate: string = this.pdfViewer.annotation.stickyNotesAnnotationModule.getDateAndTime();
            const pageIndex: number = !isNaN(pageNumber) ? pageNumber : this.pdfViewerBase.currentPageNumber - 1;
            const thickness: number = this.pdfViewer.inkAnnotationSettings.thickness ? this.pdfViewer.inkAnnotationSettings.thickness : 1;
            // eslint-disable-next-line max-len
            const opacity: number = this.pdfViewer.inkAnnotationSettings.opacity ? this.pdfViewer.inkAnnotationSettings.opacity : 1;
            // eslint-disable-next-line max-len
            const strokeColor: string = this.pdfViewer.inkAnnotationSettings.strokeColor ? this.pdfViewer.inkAnnotationSettings.strokeColor : '#ff0000';
            // eslint-disable-next-line
            let isLock: boolean = this.pdfViewer.inkAnnotationSettings.isLock ? this.pdfViewer.inkAnnotationSettings.isLock : this.pdfViewer.annotationSettings.isLock;
            const author: string = (this.pdfViewer.annotationSettings.author !== 'Guest') ? this.pdfViewer.annotationSettings.author : this.pdfViewer.inkAnnotationSettings.author ? this.pdfViewer.inkAnnotationSettings.author : 'Guest';
            const customData: object = this.pdfViewer.inkAnnotationSettings.customData;
            const isPrint: boolean = this.pdfViewer.inkAnnotationSettings.isPrint;
            // eslint-disable-next-line
            let allowedInteractions: any = this.pdfViewer.inkAnnotationSettings.allowedInteractions ? this.pdfViewer.inkAnnotationSettings.allowedInteractions : this.pdfViewer.annotationSettings.allowedInteractions;
            // eslint-disable-next-line
            let annotationSettings: any = this.pdfViewer.inkAnnotationSettings ? this.pdfViewer.inkAnnotationSettings : this.pdfViewer.annotationSettings;
            annot = {
                // eslint-disable-next-line max-len
                id: 'ink' + this.pdfViewerBase.inkCount, bounds: { x: currentBounds.x, y: currentBounds.y, width: currentBounds.width, height: currentBounds.height }, pageIndex: pageIndex, data: this.outputString, customData: customData,
                shapeAnnotationType: 'Ink', opacity: opacity, strokeColor: strokeColor, thickness: thickness, annotName: annotationName, comments: [],
                author: author , subject: 'Ink', notes: '',
                review: { state: '', stateModel: '', modifiedDate: modifiedDate, author: author },
                annotationSelectorSettings: this.getSelector('Ink', ''), modifiedDate: modifiedDate, annotationSettings: annotationSettings,
                isPrint: isPrint, allowedInteractions: allowedInteractions, isCommentLock: false
            };
            const annotation: PdfAnnotationBaseModel = this.pdfViewer.add(annot as PdfAnnotationBase);
            // eslint-disable-next-line
            let bounds: any = { left: annot.bounds.x, top: annot.bounds.y, width: annot.bounds.width, height: annot.bounds.height };
            // eslint-disable-next-line
            let settings: any = {
                opacity: annot.opacity, strokeColor: annot.strokeColor, thickness: annot.thickness, modifiedDate: annot.modifiedDate,
                width: annot.bounds.width, height: annot.bounds.height, data: this.outputString
            };
            this.pdfViewerBase.inkCount++;
            // eslint-disable-next-line max-len
            const commentsDivid: string = this.pdfViewer.annotation.stickyNotesAnnotationModule.addComments('ink', (annot.pageIndex + 1), annot.shapeAnnotationType);
            if (commentsDivid) {
                document.getElementById(commentsDivid).id = annotationName;
            }
            annot.annotName = annotationName;
            this.pdfViewer.annotationModule.storeAnnotations(pageIndex, annot, '_annotations_ink');
            this.pdfViewer.fireAnnotationAdd(annot.pageIndex, annot.annotName, 'Ink', bounds, settings);
            // eslint-disable-next-line max-len
            this.pdfViewer.annotation.addAction(pageIndex, null, annotation, 'Addition', '', annotation, annotation);
            if (this.pdfViewerBase.isInkAdded) {
                this.outputString = '';
                this.newObject = [];
            }
            this.pdfViewerBase.isToolbarInkClicked = false;
            this.pdfViewer.tool = '';
        }
        return annot;
    }
    /**
     * @private
     */
    public setAnnotationMode(): void {
        if (this.pdfViewerBase.isToolbarInkClicked) {
            this.drawInkAnnotation();
        } else {
            this.pdfViewerBase.isToolbarInkClicked = true;
            this.drawInk();
        }
    }
    public saveInkSignature(): string {
        // eslint-disable-next-line
        let storeObject: any = window.sessionStorage.getItem(this.pdfViewerBase.documentId + '_annotations_ink');
        // eslint-disable-next-line
        let annotations: Array<any> = new Array();
        for (let j: number = 0; j < this.pdfViewerBase.pageCount; j++) {
            annotations[j] = [];
        }
        if (storeObject) {
            const annotationCollection: IPageAnnotations[] = JSON.parse(storeObject);
            for (let i: number = 0; i < annotationCollection.length; i++) {
                // eslint-disable-next-line
                let newArray: any[] = [];
                const pageAnnotationObject: IPageAnnotations = annotationCollection[i];
                if (pageAnnotationObject) {
                    for (let z: number = 0; pageAnnotationObject.annotations.length > z; z++) {
                        this.pdfViewer.annotationModule.updateModifiedDate(pageAnnotationObject.annotations[z]);
                        // eslint-disable-next-line max-len
                        const strokeColorString: string = pageAnnotationObject.annotations[z].strokeColor;
                        pageAnnotationObject.annotations[z].strokeColor = JSON.stringify(this.pdfViewerBase.signatureModule.getRgbCode(strokeColorString));
                        pageAnnotationObject.annotations[z].bounds = JSON.stringify(pageAnnotationObject.annotations[z].bounds);
                        // eslint-disable-next-line
                        let collectionData: any = processPathData(pageAnnotationObject.annotations[z].data);
                        // eslint-disable-next-line
                        let csData: any = splitArrayCollection(collectionData);
                        pageAnnotationObject.annotations[z].data = JSON.stringify(csData);
                    }
                    newArray = pageAnnotationObject.annotations;
                }
                annotations[pageAnnotationObject.pageIndex] = newArray;
            }
        }
        return JSON.stringify(annotations);
    }
    /**
     * @param pageNumber
     * @param annotationBase
     * @param pageNumber
     * @param annotationBase
     * @private
     */
    // eslint-disable-next-line
    public addInCollection(pageNumber: number, annotationBase: any): void {
        if (annotationBase) {
            // eslint-disable-next-line
            let pageAnnotations: any[] = this.getAnnotations(pageNumber, null);
            if (pageAnnotations) {
                pageAnnotations.push(annotationBase);
            }
            this.manageInkAnnotations(pageAnnotations, pageNumber);
        }
    }
    // eslint-disable-next-line
    private calculateInkSize(): any {
        let minimumX: number = -1;
        let minimumY: number = -1;
        let maximumX: number = -1;
        let maximumY: number = -1;
        // eslint-disable-next-line
        let collectionData: any = processPathData(this.outputString);
        const zoomvalue: number = this.pdfViewerBase.getZoomFactor();
        // eslint-disable-next-line
        for (let k = 0; k < collectionData.length; k++) {
            // eslint-disable-next-line
            let val: any = collectionData[k];
            if (minimumX === -1) {
                // eslint-disable-next-line
                minimumX = (val['x']);
                // eslint-disable-next-line
                maximumX = (val['x']);
                // eslint-disable-next-line
                minimumY = (val['y']);
                // eslint-disable-next-line
                maximumY = (val['y']);
            } else {
                // eslint-disable-next-line
                let point1: any = (val['x']);
                // eslint-disable-next-line
                let point2: any = (val['y']);
                if (minimumX >= point1) {
                    minimumX = point1;
                }
                if (minimumY >= point2) {
                    minimumY = point2;
                }
                if (maximumX <= point1) {
                    maximumX = point1;
                }
                if (maximumY <= point2) {
                    maximumY = point2;
                }
            }
        }
        const newdifferenceX: number = maximumX - minimumX;
        const newdifferenceY: number = maximumY - minimumY;
        // eslint-disable-next-line max-len
        return { x: (minimumX / zoomvalue), y: (minimumY / zoomvalue), width: (newdifferenceX / zoomvalue), height: (newdifferenceY / zoomvalue) };
    }
    /**
     * @param annotationCollection
     * @param pageIndex
     * @param isImport
     * @private
     */
    // eslint-disable-next-line
    public renderExistingInkSignature(annotationCollection: any, pageIndex: number, isImport: boolean): void {
        let annot: PdfAnnotationBaseModel;
        let isinkAnnotationAdded: boolean = false;
        if (!isImport) {
            for (let p: number = 0; p < this.inkAnnotationindex.length; p++) {
                if (this.inkAnnotationindex[p] === pageIndex) {
                    isinkAnnotationAdded = true;
                    break;
                }
            }
        }
        if (annotationCollection && !isinkAnnotationAdded) {
            if (annotationCollection.length > 0 && this.inkAnnotationindex.indexOf(pageIndex) === -1) {
                this.inkAnnotationindex.push(pageIndex);
            }
            for (let n: number = 0; n < annotationCollection.length; n++) {
                // eslint-disable-next-line
                let currentAnnotation: any = annotationCollection[n];
                // eslint-disable-next-line
                if (currentAnnotation) {
                    // eslint-disable-next-line
                    let bounds: any = currentAnnotation.Bounds;
                    const currentLeft: number = (bounds.X);
                    const currentTop: number = (bounds.Y);
                    const currentWidth: number = (bounds.Width);
                    const currentHeight: number = (bounds.Height);
                    // eslint-disable-next-line
                    let data: any = currentAnnotation.PathData;
                    if (isImport) {
                        if (currentAnnotation.IsPathData || currentAnnotation.PathData.split('command').length <= 1) {
                            data = currentAnnotation.PathData;
                        } else {
                            data = getPathString(JSON.parse(currentAnnotation.PathData));
                        }
                    }
                    const isLock: boolean = currentAnnotation.AnnotationSettings ? currentAnnotation.AnnotationSettings.isLock : false;
                    // eslint-disable-next-line
                    let selectorSettings: any = currentAnnotation.AnnotationSelectorSettings ? currentAnnotation.AnnotationSelectorSettings : this.getSelector(currentAnnotation, 'Ink');
                    const customData: any = this.pdfViewer.annotation.getCustomData(currentAnnotation);
                    let isPrint: boolean = true;
                    if (currentAnnotation.AnnotationSettings) {
                        isPrint = currentAnnotation.AnnotationSettings.isPrint;
                    } else {
                        isPrint = this.pdfViewer.inkAnnotationSettings.isPrint;
                    }
                    // eslint-disable-next-line max-len
                    currentAnnotation.allowedInteractions = currentAnnotation.AllowedInteractions ? currentAnnotation.AllowedInteractions :  this.pdfViewer.annotationModule.updateAnnotationAllowedInteractions(currentAnnotation);
                    annot = {
                        // eslint-disable-next-line max-len
                        id: 'ink' + this.pdfViewerBase.inkCount, bounds: { x: currentLeft, y: currentTop, width: currentWidth, height: currentHeight }, pageIndex: pageIndex, data: data,
                        shapeAnnotationType: 'Ink', opacity: currentAnnotation.Opacity, strokeColor: currentAnnotation.StrokeColor, thickness: currentAnnotation.Thickness, annotName: currentAnnotation.AnnotName,
                        // eslint-disable-next-line max-len
                        comments: this.pdfViewer.annotationModule.getAnnotationComments(currentAnnotation.Comments, currentAnnotation, currentAnnotation.Author), author: currentAnnotation.Author, allowedInteractions: currentAnnotation.allowedInteractions, subject: currentAnnotation.Subject, modifiedDate: currentAnnotation.ModifiedDate,
                        // eslint-disable-next-line max-len
                        review: { state: '', stateModel: '', modifiedDate: currentAnnotation.ModifiedDate, author: currentAnnotation.Author }, notes: currentAnnotation.Note, annotationSettings: { isLock: isLock },
                        annotationSelectorSettings: selectorSettings, customData: customData, isPrint: isPrint, isCommentLock: currentAnnotation.IsCommentLock
                    };
                    this.pdfViewer.add(annot as PdfAnnotationBase);
                    // eslint-disable-next-line
                    let canvass: any = document.getElementById(this.pdfViewer.element.id + '_annotationCanvas_' + currentAnnotation.pageIndex);
                    // eslint-disable-next-line
                    this.pdfViewer.renderDrawing(canvass as any, annot.pageIndex);
                    this.pdfViewer.annotationModule.storeAnnotations(annot.pageIndex, annot, '_annotations_ink');
                    this.pdfViewerBase.currentSignatureAnnot = null;
                    this.pdfViewerBase.signatureCount++;
                    this.pdfViewerBase.inkCount++;
                    // eslint-disable-next-line max-len
                    if (this.pdfViewerBase.navigationPane && this.pdfViewerBase.navigationPane.annotationMenuObj && this.pdfViewer.isSignatureEditable) {
                        // eslint-disable-next-line max-len
                        this.pdfViewerBase.navigationPane.annotationMenuObj.enableItems([this.pdfViewer.localeObj.getConstant('Export Annotations')], true);
                    }
                }
            }
        }
    }
    /**
     * @param pageNumber
     * @param annotations
     * @private
     */
    // eslint-disable-next-line
    public storeInkSignatureData(pageNumber: number, annotations: any): void {
        // eslint-disable-next-line max-len
        this.pdfViewer.annotation.addAction(annotations.pageIndex, null, annotations as PdfAnnotationBase, 'Addition', '', annotations as PdfAnnotationBase, annotations);
        // eslint-disable-next-line
        let annotation: any = null;
        let left: number = annotations.bounds.left ? annotations.bounds.left : annotations.bounds.x;
        let top: number = annotations.bounds.top ? annotations.bounds.top : annotations.bounds.y;
        if (annotations.wrapper && annotations.wrapper.bounds) {
            left = annotations.wrapper.bounds.left;
            top = annotations.wrapper.bounds.top;
        }
        annotation = {
            // eslint-disable-next-line max-len
            id: annotations.id, bounds: { x: left, y: top, width: annotations.bounds.width, height: annotations.bounds.height },
            // eslint-disable-next-line max-len
            shapeAnnotationType: 'Ink', opacity: annotations.opacity, thickness: annotations.thickness, strokeColor: annotations.strokeColor, pageIndex: annotations.pageIndex, data: annotations.data,
            annotName: annotations.annotName,
            // eslint-disable-next-line max-len
            comments: annotations.comments, author: annotations.author, subject: annotations.subject, modifiedDate: annotations.modifiedDate,
            // eslint-disable-next-line max-len
            review: { state: '', stateModel: '', modifiedDate: annotations.modifiedDate, author: annotations.author }, notes: annotations.notes,
            annotationSelectorSettings: this.getSelector(annotations, 'Ink'), isCommentLock: annotations.isCommentLock
        };
        // eslint-disable-next-line
        let storeObject: any = window.sessionStorage.getItem(this.pdfViewerBase.documentId + '_annotations_ink');
        let index: number = 0;
        if (!storeObject) {
            const shapeAnnotation: IPageAnnotations = { pageIndex: pageNumber, annotations: [] };
            shapeAnnotation.annotations.push(annotation);
            index = shapeAnnotation.annotations.indexOf(annotation);
            const annotationCollection: IPageAnnotations[] = [];
            annotationCollection.push(shapeAnnotation);
            const annotationStringified: string = JSON.stringify(annotationCollection);
            window.sessionStorage.setItem(this.pdfViewerBase.documentId + '_annotations_ink', annotationStringified);
        } else {
            const annotObject: IPageAnnotations[] = JSON.parse(storeObject);
            window.sessionStorage.removeItem(this.pdfViewerBase.documentId + '_annotations_ink');
            const pageIndex: number = this.pdfViewer.annotationModule.getPageCollection(annotObject, pageNumber);
            if (annotObject[pageIndex]) {
                (annotObject[pageIndex] as IPageAnnotations).annotations.push(annotation);
                index = (annotObject[pageIndex] as IPageAnnotations).annotations.indexOf(annotation);
            } else {
                const markupAnnotation: IPageAnnotations = { pageIndex: pageNumber, annotations: [] };
                markupAnnotation.annotations.push(annotation);
                index = markupAnnotation.annotations.indexOf(annotation);
                annotObject.push(markupAnnotation);
            }
            const annotationStringified: string = JSON.stringify(annotObject);
            window.sessionStorage.setItem(this.pdfViewerBase.documentId + '_annotations_ink', annotationStringified);
        }
    }
    public getSelector(type: string, subject: string): AnnotationSelectorSettingsModel {
        let selector: AnnotationSelectorSettingsModel = this.pdfViewer.annotationSelectorSettings;
        if (type === 'Ink' && this.pdfViewer.inkAnnotationSettings.annotationSelectorSettings) {
            selector = this.pdfViewer.inkAnnotationSettings.annotationSelectorSettings;
        }
        return selector;
    }
    // eslint-disable-next-line
    private getAnnotations(pageIndex: number, shapeAnnotations: any[]): any[] {
        // eslint-disable-next-line
        let annotationCollection: any[];
        // eslint-disable-next-line
        let storeObject: any = window.sessionStorage.getItem(this.pdfViewerBase.documentId + '_annotations_ink');
        if (storeObject) {
            const annotObject: IPageAnnotations[] = JSON.parse(storeObject);
            const index: number = this.pdfViewer.annotationModule.getPageCollection(annotObject, pageIndex);
            if (annotObject[index]) {
                annotationCollection = annotObject[index].annotations;
            } else {
                annotationCollection = shapeAnnotations;
            }
        } else {
            annotationCollection = shapeAnnotations;
        }
        return annotationCollection;
    }
    /**
     * @param property
     * @param pageNumber
     * @param annotationBase
     * @param property
     * @param pageNumber
     * @param annotationBase
     * @private
     */
    // eslint-disable-next-line
    public modifySignatureInkCollection(property: string, pageNumber: number, annotationBase: any): any {
        this.pdfViewer.isDocumentEdited = true;
        // eslint-disable-next-line
        let currentAnnotObject: any = null;
        // eslint-disable-next-line
        let pageAnnotations: any[] = this.getAnnotations(pageNumber, null);
        if (pageAnnotations != null && annotationBase) {
            for (let i: number = 0; i < pageAnnotations.length; i++) {
                if (annotationBase.id === pageAnnotations[i].id) {
                    if (property === 'bounds') {
                        // eslint-disable-next-line max-len
                        pageAnnotations[i].bounds = { x: annotationBase.wrapper.bounds.left, y: annotationBase.wrapper.bounds.top, width: annotationBase.bounds.width, height: annotationBase.bounds.height };
                    } else if (property === 'stroke') {
                        pageAnnotations[i].strokeColor = annotationBase.wrapper.children[0].style.strokeColor;
                    } else if (property === 'opacity') {
                        pageAnnotations[i].opacity = annotationBase.wrapper.children[0].style.opacity;
                    } else if (property === 'thickness') {
                        pageAnnotations[i].thickness = annotationBase.wrapper.children[0].style.strokeWidth;
                    } else if (property === 'notes') {
                        pageAnnotations[i].notes = annotationBase.notes;
                    } else if (property === 'delete') {
                        currentAnnotObject = pageAnnotations.splice(i, 1)[0];
                        break;
                    }
                    pageAnnotations[i].modifiedDate = this.pdfViewer.annotation.stickyNotesAnnotationModule.getDateAndTime();
                    this.pdfViewer.annotationModule.storeAnnotationCollections(pageAnnotations[i], pageNumber);
                }
            }
            this.manageInkAnnotations(pageAnnotations, pageNumber);
        }
        return currentAnnotObject;
    }
    // eslint-disable-next-line
    private manageInkAnnotations(pageAnnotations: any[], pageNumber: number): void {
        // eslint-disable-next-line
        let storeObject: any = window.sessionStorage.getItem(this.pdfViewerBase.documentId + '_annotations_ink');
        if (storeObject) {
            const annotObject: IPageAnnotations[] = JSON.parse(storeObject);
            window.sessionStorage.removeItem(this.pdfViewerBase.documentId + '_annotations_ink');
            const index: number = this.pdfViewer.annotationModule.getPageCollection(annotObject, pageNumber);
            if (annotObject[index]) {
                annotObject[index].annotations = pageAnnotations;
            }
            const annotationStringified: string = JSON.stringify(annotObject);
            window.sessionStorage.setItem(this.pdfViewerBase.documentId + '_annotations_ink', annotationStringified);
        }
    }

    /**
     * @param currentAnnotation
     * @param pageIndex
     * @param isImport
     * @param currentAnnotation
     * @param pageIndex
     * @param isImport
     * @private
     */
    // eslint-disable-next-line
    public updateInkCollections(currentAnnotation: any, pageIndex: number, isImport?: boolean): any {
        // eslint-disable-next-line
        let annot: any;
        // eslint-disable-next-line
        if (currentAnnotation) {
            // eslint-disable-next-line
            let bounds: any = currentAnnotation.Bounds;
            const currentLeft: number = (bounds.X);
            const currentTop: number = (bounds.Y);
            const currentWidth: number = (bounds.Width);
            const currentHeight: number = (bounds.Height);
            const customData: object = currentAnnotation.customData;
            const isPrint: boolean = currentAnnotation.isPrint;
            // eslint-disable-next-line
            let allowedInteractions: any = currentAnnotation.AllowedInteractions ? currentAnnotation.AllowedInteractions : this.pdfViewer.annotationModule.updateAnnotationAllowedInteractions(currentAnnotation);
            // eslint-disable-next-line
            let data: any = currentAnnotation.PathData;
            if (isImport) {
                data = getPathString(JSON.parse(currentAnnotation.PathData));
            }
            annot = {
                // eslint-disable-next-line max-len
                id: 'ink' + this.pdfViewerBase.signatureCount, bounds: { x: currentLeft, y: currentTop, width: currentWidth, height: currentHeight }, pageIndex: pageIndex, data: data,
                // eslint-disable-next-line max-len
                shapeAnnotationType: 'Ink', opacity: currentAnnotation.Opacity, strokeColor: currentAnnotation.StrokeColor, thickness: currentAnnotation.Thickness, annotationId: currentAnnotation.AnnotName,
                // eslint-disable-next-line max-len
                customData: customData, comments: this.pdfViewer.annotationModule.getAnnotationComments(currentAnnotation.Comments, currentAnnotation, currentAnnotation.Author), author: currentAnnotation.Author, allowedInteractions: allowedInteractions, subject: currentAnnotation.Subject, modifiedDate: currentAnnotation.ModifiedDate,
                review: { state: '', stateModel: '', modifiedDate: currentAnnotation.ModifiedDate, author: currentAnnotation.Author }, notes: currentAnnotation.Note, isPrint: isPrint, isCommentLock: currentAnnotation.IsCommentLock

            };
            return annot;
        }
    }
}
