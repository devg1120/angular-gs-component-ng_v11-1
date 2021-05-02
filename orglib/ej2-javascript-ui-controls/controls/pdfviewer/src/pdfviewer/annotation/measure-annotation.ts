/* eslint-disable */
import { PdfViewer, PdfViewerBase, IRectangle, IPageAnnotations, IPoint, AnnotationType as AnnotType,
    ShapeLabelSettingsModel } from '../../index';
import { NumericTextBox } from '@syncfusion/ej2-inputs';
import { PdfAnnotationBase } from '../drawing/pdf-annotation';
import { PdfAnnotationBaseModel } from '../drawing/pdf-annotation-model';
import { PdfAnnotationType } from '../drawing/enum';
import { createElement, Browser, isNullOrUndefined, isBlazor } from '@syncfusion/ej2-base';
import { Dialog } from '@syncfusion/ej2-popups';
import { DropDownButton, MenuEventArgs } from '@syncfusion/ej2-splitbuttons';
import { PointModel, Point } from '@syncfusion/ej2-drawings';
import { ICommentsCollection, IReviewCollection } from './sticky-notes-annotation';
import { LineHeadStyle, CalibrationUnit, AllowedInteraction } from '../base';
import { AnnotationSelectorSettingsModel } from '../pdfviewer-model';

/**
 * @hidden
 */
export interface IMeasureShapeAnnotation {
    shapeAnnotationType: string
    author: string
    modifiedDate: string
    subject: string
    note: string
    strokeColor: string
    fillColor: string
    opacity: number
    bounds: IRectangle
    thickness: number
    borderStyle: string
    borderDashArray: number
    rotateAngle: string
    isCloudShape: boolean
    cloudIntensity: number
    vertexPoints: PointModel[]
    lineHeadStart: string
    lineHeadEnd: string
    rectangleDifference: string[]
    isLocked: boolean
    caption: boolean
    captionPosition: string
    leaderLineExtension: number
    leaderLength: number
    leaderLineOffset: number
    indent: string
    // eslint-disable-next-line
    calibrate: any;
    id: string
    annotName: string
    comments: ICommentsCollection[]
    review: IReviewCollection
    enableShapeLabel: boolean
    labelContent: string
    labelFillColor: string
    labelBorderColor: string
    fontColor: string
    fontSize: number
    labelBounds: IRectangle
    annotationSelectorSettings: AnnotationSelectorSettingsModel
    labelSettings?: ShapeLabelSettingsModel
    // eslint-disable-next-line
    annotationSettings?: any;
    customData: object
    allowedInteractions?: AllowedInteraction
    isPrint: boolean
    isCommentLock: boolean
}

/**
 * @hidden
 */
export interface IMeasure {
    ratio: string
    x?: INumberFormat[]
    distance?: INumberFormat[]
    area?: INumberFormat[]
    angle?: INumberFormat[]
    volume?: INumberFormat[]
    targetUnitConversion?: number
    depth?: number
}

/**
 * @hidden
 */
export interface INumberFormat {
    unit: string
    conversionFactor: number
    fractionalType: string
    denominator: number
    formatDenominator: boolean
}

/**
 * @hidden
 */
export class MeasureAnnotation {
    private pdfViewer: PdfViewer;
    private pdfViewerBase: PdfViewerBase;
    /**
     * @private
     */
    public currentAnnotationMode: string;
    /**
     * @private
     */
    public distanceOpacity: number;
    /**
     * @private
     */
    public perimeterOpacity: number;
    /**
     * @private
     */
    public areaOpacity: number;
    /**
     * @private
     */
    public radiusOpacity: number;
    /**
     * @private
     */
    public volumeOpacity: number;
    /**
     * @private
     */
    public distanceFillColor: string;
    /**
     * @private
     */
    public perimeterFillColor: string;
    /**
     * @private
     */
    public areaFillColor: string;
    /**
     * @private
     */
    public radiusFillColor: string;
    /**
     * @private
     */
    public volumeFillColor: string;
    /**
     * @private
     */
    public distanceStrokeColor: string;
    /**
     * @private
     */
    public perimeterStrokeColor: string;
    /**
     * @private
     */
    public areaStrokeColor: string;
    /**
     * @private
     */
    public radiusStrokeColor: string;
    /**
     * @private
     */
    public volumeStrokeColor: string;
    /**
     * @private
     */
    public distanceThickness: number;
    /**
     * @private
     */
    public leaderLength: number;
    /**
     * @private
     */
    public perimeterThickness: number;
    /**
     * @private
     */
    public areaThickness: number;
    /**
     * @private
     */
    public radiusThickness: number;
    /**
     * @private
     */
    public volumeThickness: number;
    /**
     * @private
     */
    public distanceDashArray: number;
    /**
     * @private
     */
    public distanceStartHead: LineHeadStyle;
    /**
     * @private
     */
    public distanceEndHead: LineHeadStyle;
    /**
     * @private
     */
    public perimeterDashArray: number;
    /**
     * @private
     */
    public perimeterStartHead: LineHeadStyle;
    /**
     * @private
     */
    public perimeterEndHead: LineHeadStyle;
    private unit: CalibrationUnit;
    /**
     * @private
     */
    public displayUnit: CalibrationUnit;
    /**
     * @private
     */
    public measureShapeCount: number = 0;
    /**
     * @private
     */
    public volumeDepth: number;
    private ratio: number;
    private scaleRatioString: string;
    private scaleRatioDialog: Dialog;
    private sourceTextBox: NumericTextBox;
    private convertUnit: DropDownButton;
    private destTextBox: NumericTextBox;
    private dispUnit: DropDownButton;
    private depthTextBox: NumericTextBox;
    private depthUnit: DropDownButton;
    constructor(pdfviewer: PdfViewer, pdfViewerBase: PdfViewerBase) {
        this.pdfViewer = pdfviewer;
        this.pdfViewerBase = pdfViewerBase;
    }

    /**
     * @private
     */
    public get pixelToPointFactor(): number {
        return  (72 / 96);
    }

    /**
     * @param shapeAnnotations
     * @param pageNumber
     * @param isImportAction
     * @param shapeAnnotations
     * @param pageNumber
     * @param isImportAction
     * @private
     */
    // eslint-disable-next-line
    public renderMeasureShapeAnnotations(shapeAnnotations: any, pageNumber: number, isImportAction?: boolean): void {
        if (shapeAnnotations) {
            if (shapeAnnotations.length >= 1) {
                // eslint-disable-next-line
                let measureAnnots: any[] = this.pdfViewer.annotation.getStoredAnnotations(pageNumber, shapeAnnotations, '_annotations_shape_measure');
                if (!measureAnnots || isImportAction) {
                    for (let i: number = 0; i < shapeAnnotations.length; i++) {
                    // eslint-disable-next-line
                    let annotation: any = shapeAnnotations[i];
                        let annotationObject: IMeasureShapeAnnotation = null;
                        this.measureShapeCount = this.measureShapeCount + 1;
                        // eslint-disable-next-line max-len
                        annotation.annotationAddMode = this.pdfViewer.annotationModule.findAnnotationMode(annotation, pageNumber, annotation.AnnotType);
                        if (annotation.ShapeAnnotationType) {
                            let vertexPoints: IPoint[] = null;
                            if (annotation.VertexPoints) {
                                vertexPoints = [];
                                for (let j: number = 0; j < annotation.VertexPoints.length; j++) {
                                    const point: IPoint = { x: annotation.VertexPoints[j].X, y: annotation.VertexPoints[j].Y };
                                    vertexPoints.push(point);
                                }
                            }
                            if (annotation.Bounds && annotation.EnableShapeLabel === true) {
                            // eslint-disable-next-line max-len
                                annotation.LabelBounds = this.pdfViewer.annotationModule.inputElementModule.calculateLabelBoundsFromLoadedDocument(annotation.Bounds);
                                annotation.LabelBorderColor = annotation.LabelBorderColor ? annotation.LabelBorderColor : annotation.StrokeColor;
                                annotation.FontColor = annotation.FontColor ? annotation.FontColor : annotation.StrokeColor;
                                annotation.LabelFillColor = annotation.LabelFillColor ? annotation.LabelFillColor : annotation.FillColor;
                                annotation.FontSize = annotation.FontSize ? annotation.FontSize : 16;
                                // eslint-disable-next-line max-len
                                annotation.LabelSettings = annotation.LabelSettings ? annotation.LabelSettings : this.pdfViewer.shapeLabelSettings;
                            }
                            // eslint-disable-next-line max-len
                            annotation.AnnotationSettings = annotation.AnnotationSettings ? annotation.AnnotationSettings : this.pdfViewer.annotationModule.updateAnnotationSettings(annotation);
                            // eslint-disable-next-line max-len
                            annotation.allowedInteractions = annotation.AllowedInteractions ? annotation.AllowedInteractions : this.pdfViewer.annotationModule.updateAnnotationAllowedInteractions(annotation);
                            let isPrint: boolean = annotation.AnnotationSettings.isPrint;
                            const measureObject: IMeasure = {
                            // eslint-disable-next-line max-len
                                ratio: annotation.Calibrate.Ratio, x: this.getNumberFormatArray(annotation.Calibrate.X), distance: this.getNumberFormatArray(annotation.Calibrate.Distance), area: this.getNumberFormatArray(annotation.Calibrate.Area), angle: this.getNumberFormatArray(annotation.Calibrate.Angle), volume: this.getNumberFormatArray(annotation.Calibrate.Volume),
                                targetUnitConversion: annotation.Calibrate.TargetUnitConversion
                            };
                            if (annotation.Calibrate.Depth) {
                                measureObject.depth = annotation.Calibrate.Depth;
                            }
                            annotationObject = {
                            // eslint-disable-next-line max-len
                                id: 'measure' + this.measureShapeCount, shapeAnnotationType: annotation.ShapeAnnotationType, author: annotation.Author, allowedInteractions: annotation.allowedInteractions, modifiedDate: annotation.ModifiedDate, subject: annotation.Subject,
                                note: annotation.Note, strokeColor: annotation.StrokeColor, fillColor: annotation.FillColor, opacity: annotation.Opacity, thickness: annotation.Thickness, rectangleDifference: annotation.RectangleDifference,
                                // eslint-disable-next-line max-len
                                borderStyle: annotation.BorderStyle, borderDashArray: annotation.BorderDashArray, rotateAngle: annotation.RotateAngle, isCloudShape: annotation.IsCloudShape,
                                cloudIntensity: annotation.CloudIntensity, vertexPoints: vertexPoints, lineHeadStart: annotation.LineHeadStart, lineHeadEnd: annotation.LineHeadEnd, isLocked: annotation.IsLocked,
                                // eslint-disable-next-line max-len
                                bounds: { left: annotation.Bounds.X, top: annotation.Bounds.Y, width: annotation.Bounds.Width, height: annotation.Bounds.Height, right: annotation.Bounds.Right, bottom: annotation.Bounds.Bottom },
                                caption: annotation.Caption, captionPosition: annotation.CaptionPosition, calibrate: measureObject, leaderLength: annotation.LeaderLength, leaderLineExtension: annotation.LeaderLineExtension,
                                // eslint-disable-next-line max-len
                                leaderLineOffset: annotation.LeaderLineOffset, indent: annotation.Indent, annotName: annotation.AnnotName, comments: this.pdfViewer.annotationModule.getAnnotationComments(annotation.Comments, annotation, annotation.Author),
                                review: {state: annotation.State, stateModel: annotation.StateModel, modifiedDate: annotation.ModifiedDate, author: annotation.Author },
                                // eslint-disable-next-line max-len
                                labelContent: annotation.LabelContent, enableShapeLabel: annotation.EnableShapeLabel, labelFillColor: annotation.LabelFillColor,
                                fontColor: annotation.FontColor, labelBorderColor: annotation.LabelBorderColor, fontSize: annotation.FontSize,
                                // eslint-disable-next-line max-len
                                labelBounds: annotation.LabelBounds, annotationSelectorSettings: this.getSettings(annotation), labelSettings: annotation.LabelSettings, annotationSettings: annotation.AnnotationSettings,
                                customData: this.pdfViewer.annotation.getCustomData(annotation), isPrint: isPrint, isCommentLock: annotation.IsCommentLock
                            };
                            let annot: PdfAnnotationBaseModel;
                            // eslint-disable-next-line
                        let vPoints: any[] = annotationObject.vertexPoints;
                            if (vertexPoints == null) {
                                vPoints = [];
                            }
                            // eslint-disable-next-line max-len
                            annotation.AnnotationSelectorSettings = annotation.AnnotationSelectorSettings ? annotation.AnnotationSelectorSettings : this.pdfViewer.annotationSelectorSettings;
                            // eslint-disable-next-line max-len
                            annotation.allowedInteractions = annotation.AllowedInteractions ? annotation.AllowedInteractions : this.pdfViewer.annotationModule.updateAnnotationAllowedInteractions(annotation);
                            annot = {
                            // eslint-disable-next-line max-len
                                id: 'measure' + this.measureShapeCount, shapeAnnotationType: this.getShapeType(annotationObject), author: annotationObject.author, allowedInteractions: annotation.allowedInteractions, modifiedDate: annotationObject.modifiedDate,
                                subject: annotationObject.subject, notes: annotationObject.note, fillColor: annotationObject.fillColor, strokeColor: annotationObject.strokeColor, opacity: annotationObject.opacity,
                                // eslint-disable-next-line max-len
                                thickness: annotationObject.thickness, borderStyle: annotationObject.borderStyle, borderDashArray: annotationObject.borderDashArray.toString(), rotateAngle: parseFloat(annotationObject.rotateAngle.split('Angle')[1]),
                                isCloudShape: annotationObject.isCloudShape, cloudIntensity: annotationObject.cloudIntensity, taregetDecoraterShapes: this.pdfViewer.annotation.getArrowType(annotationObject.lineHeadEnd), sourceDecoraterShapes: this.pdfViewer.annotation.getArrowType(annotationObject.lineHeadStart),
                                // eslint-disable-next-line max-len
                                vertexPoints: vPoints, bounds: { x: annotationObject.bounds.left, y: annotationObject.bounds.top, width: annotationObject.bounds.width, height: annotationObject.bounds.height }, leaderHeight: annotationObject.leaderLength,
                                pageIndex: pageNumber, annotName: annotationObject.annotName, comments: annotationObject.comments, review: annotationObject.review,
                                measureType: this.getMeasureType(annotationObject),
                                // eslint-disable-next-line max-len
                                labelContent: annotation.LabelContent, enableShapeLabel: annotation.EnableShapeLabel, labelFillColor: annotation.LabelFillColor,
                                fontColor: annotation.FontColor, labelBorderColor: annotation.LabelBorderColor, fontSize: annotation.FontSize,
                                labelBounds: annotation.LabelBounds, annotationSelectorSettings: annotation.AnnotationSelectorSettings,
                                annotationSettings: annotationObject.annotationSettings, annotationAddMode: annotation.annotationAddMode,
                                isPrint: isPrint, isCommentLock: annotationObject.isCommentLock
                            };
                            this.pdfViewer.annotation.storeAnnotations(pageNumber, annotationObject, '_annotations_shape_measure');
                            this.pdfViewer.add(annot as PdfAnnotationBase);
                        }
                    }
                }
            } else if (shapeAnnotations.shapeAnnotationType) {
                const annotationObject: IMeasureShapeAnnotation = this.createAnnotationObject(shapeAnnotations);
                this.pdfViewer.annotationModule.storeAnnotations(pageNumber, annotationObject, '_annotations_shape_measure');
                this.pdfViewer.annotationModule.triggerAnnotationAdd(shapeAnnotations);
            }
        }
    }
    /**
     * @param annotation
     * @private
     */
    // eslint-disable-next-line
    public getSettings(annotation : any) : any {
        let selector: AnnotationSelectorSettingsModel = this.pdfViewer.annotationSelectorSettings;
        if (annotation.AnnotationSelectorSettings) {
            selector = annotation.AnnotationSelectorSettings;
        } else {
            selector = this.getSelector(annotation.Subject);
        }
        return selector;
    }
    /**
     * @param type
     * @private
     */
    public setAnnotationType(type: AnnotType): void {
        let author: string = 'Guest';
        this.updateMeasureproperties();
        this.pdfViewerBase.disableTextSelectionMode();
        switch (type) {
        case 'Distance':
            this.currentAnnotationMode = 'Distance';
            const modifiedDateDist: string = this.pdfViewer.annotation.stickyNotesAnnotationModule.getDateAndTime();
            // eslint-disable-next-line max-len
            author = (this.pdfViewer.annotationSettings.author !== 'Guest') ? this.pdfViewer.annotationSettings.author : this.pdfViewer.distanceSettings.author ? this.pdfViewer.distanceSettings.author : 'Guest';
            this.pdfViewer.drawingObject = {
                sourceDecoraterShapes: this.pdfViewer.annotation.getArrowType(this.distanceStartHead),
                taregetDecoraterShapes: this.pdfViewer.annotation.getArrowType(this.distanceEndHead), measureType: 'Distance',
                fillColor: this.distanceFillColor, notes: '', strokeColor: this.distanceStrokeColor, leaderHeight: this.leaderLength,
                opacity: this.distanceOpacity, thickness: this.distanceThickness, borderDashArray: this.distanceDashArray.toString(),
                // eslint-disable-next-line max-len
                shapeAnnotationType: 'Distance', author: author, subject: 'Distance calculation', isCommentLock: false
            };
            this.pdfViewer.tool = 'Distance';
            break;
        case 'Perimeter':
            this.currentAnnotationMode = 'Perimeter';
            const modifiedDatePeri: string = this.pdfViewer.annotation.stickyNotesAnnotationModule.getDateAndTime();
            // eslint-disable-next-line max-len
            author = (this.pdfViewer.annotationSettings.author !== 'Guest') ? this.pdfViewer.annotationSettings.author : this.pdfViewer.perimeterSettings.author ? this.pdfViewer.perimeterSettings.author : 'Guest';
            this.pdfViewer.drawingObject = {
                // eslint-disable-next-line max-len
                shapeAnnotationType: 'LineWidthArrowHead', fillColor: this.perimeterFillColor, notes: '', strokeColor: this.perimeterStrokeColor, opacity: this.perimeterOpacity,
                thickness: this.perimeterThickness, sourceDecoraterShapes: this.pdfViewer.annotation.getArrowType(this.perimeterStartHead),
                // eslint-disable-next-line max-len
                taregetDecoraterShapes: this.pdfViewer.annotation.getArrowType(this.perimeterEndHead), measureType: 'Perimeter', borderDashArray: this.perimeterDashArray.toString(),
                author: author, subject: 'Perimeter calculation', isCommentLock: false
            };
            this.pdfViewer.tool = 'Perimeter';
            break;
        case 'Area':
            this.currentAnnotationMode = 'Area';
            const modifiedDateArea: string = this.pdfViewer.annotation.stickyNotesAnnotationModule.getDateAndTime();
            // eslint-disable-next-line max-len
            author = (this.pdfViewer.annotationSettings.author !== 'Guest') ? this.pdfViewer.annotationSettings.author : this.pdfViewer.areaSettings.author ? this.pdfViewer.areaSettings.author : 'Guest';
            this.pdfViewer.drawingObject = {
                // eslint-disable-next-line max-len
                shapeAnnotationType: 'Polygon', fillColor: this.areaFillColor, notes: '', strokeColor: this.areaStrokeColor,
                thickness: this.areaThickness, opacity: this.areaOpacity, measureType: 'Area',
                modifiedDate: modifiedDateArea, borderStyle: '', borderDashArray: '0',
                author: author, subject: 'Area calculation', isCommentLock: false
            };
            this.pdfViewer.tool = 'Polygon';
            break;
        case 'Radius':
            this.currentAnnotationMode = 'Radius';
            const modifiedDateRad: string = this.pdfViewer.annotation.stickyNotesAnnotationModule.getDateAndTime();
            // eslint-disable-next-line max-len
            author = (this.pdfViewer.annotationSettings.author !== 'Guest') ? this.pdfViewer.annotationSettings.author : this.pdfViewer.radiusSettings.author ? this.pdfViewer.radiusSettings.author : 'Guest';
            this.pdfViewer.drawingObject = {
                // eslint-disable-next-line max-len
                shapeAnnotationType: 'Radius', fillColor: this.radiusFillColor, notes: '', strokeColor: this.radiusStrokeColor, opacity: this.radiusOpacity,
                thickness: this.radiusThickness, measureType: 'Radius', modifiedDate: modifiedDateRad, borderStyle: '', borderDashArray: '0',
                author: author, subject: 'Radius calculation', isCommentLock: false
            };
            this.pdfViewer.tool = 'DrawTool';
            break;
        case 'Volume':
            this.currentAnnotationMode = 'Volume';
            const modifiedDateVol: string = this.pdfViewer.annotation.stickyNotesAnnotationModule.getDateAndTime();
            // eslint-disable-next-line max-len
            author = (this.pdfViewer.annotationSettings.author !== 'Guest') ? this.pdfViewer.annotationSettings.author : this.pdfViewer.volumeSettings.author ? this.pdfViewer.volumeSettings.author : 'Guest';
            this.pdfViewer.drawingObject = {
                // eslint-disable-next-line max-len
                shapeAnnotationType: 'Polygon', notes: '', fillColor: this.volumeFillColor, strokeColor: this.volumeStrokeColor,
                opacity: this.volumeOpacity, thickness: this.volumeThickness, measureType: 'Volume',
                modifiedDate: modifiedDateVol, borderStyle: '', borderDashArray: '0',
                author: author, subject: 'Volume calculation', isCommentLock: false
            };
            this.pdfViewer.tool = 'Polygon';
            break;
        }
    }
    private updateMeasureproperties(): void {
        this.distanceFillColor = this.pdfViewer.distanceSettings.fillColor ? this.pdfViewer.distanceSettings.fillColor : '#ff0000';
        this.distanceStrokeColor = this.pdfViewer.distanceSettings.strokeColor ? this.pdfViewer.distanceSettings.strokeColor : '#ff0000';
        this.distanceOpacity = this.pdfViewer.distanceSettings.opacity ? this.pdfViewer.distanceSettings.opacity : 1;
        this.distanceThickness = this.pdfViewer.distanceSettings.thickness ? this.pdfViewer.distanceSettings.thickness : 1;
        this.distanceDashArray = this.pdfViewer.distanceSettings.borderDashArray ? this.pdfViewer.distanceSettings.borderDashArray : 0;
        this.leaderLength = this.pdfViewer.distanceSettings.leaderLength != null ? this.pdfViewer.distanceSettings.leaderLength : 40;
        // eslint-disable-next-line max-len
        this.distanceStartHead = this.pdfViewer.distanceSettings.lineHeadStartStyle ? this.pdfViewer.distanceSettings.lineHeadStartStyle : 'Closed';
        this.distanceEndHead = this.pdfViewer.distanceSettings.lineHeadEndStyle ? this.pdfViewer.distanceSettings.lineHeadEndStyle : 'Closed';
        this.perimeterFillColor = this.pdfViewer.perimeterSettings.fillColor ? this.pdfViewer.perimeterSettings.fillColor : '#ffffff00';
        this.perimeterStrokeColor = this.pdfViewer.perimeterSettings.strokeColor ? this.pdfViewer.perimeterSettings.strokeColor : '#ff0000';
        this.perimeterOpacity = this.pdfViewer.perimeterSettings.opacity ? this.pdfViewer.perimeterSettings.opacity : 1;
        this.perimeterThickness = this.pdfViewer.perimeterSettings.thickness ? this.pdfViewer.perimeterSettings.thickness : 1;
        this.perimeterDashArray = this.pdfViewer.perimeterSettings.borderDashArray ? this.pdfViewer.perimeterSettings.borderDashArray : 0;
        // eslint-disable-next-line max-len
        this.perimeterStartHead = this.pdfViewer.perimeterSettings.lineHeadStartStyle ? this.pdfViewer.perimeterSettings.lineHeadStartStyle : 'Open';
        this.perimeterEndHead = this.pdfViewer.perimeterSettings.lineHeadEndStyle ? this.pdfViewer.perimeterSettings.lineHeadEndStyle : 'Open';
        this.areaFillColor = this.pdfViewer.areaSettings.fillColor ? this.pdfViewer.areaSettings.fillColor : '#ffffff00';
        this.areaStrokeColor = this.pdfViewer.areaSettings.strokeColor ? this.pdfViewer.areaSettings.strokeColor : '#ff0000';
        this.areaOpacity = this.pdfViewer.areaSettings.opacity ? this.pdfViewer.areaSettings.opacity : 1;
        this.areaThickness = this.pdfViewer.areaSettings.thickness ? this.pdfViewer.areaSettings.thickness : 1;
        this.radiusFillColor = this.pdfViewer.radiusSettings.fillColor ? this.pdfViewer.radiusSettings.fillColor : '#ffffff00';
        this.radiusStrokeColor = this.pdfViewer.radiusSettings.strokeColor ? this.pdfViewer.radiusSettings.strokeColor : '#ff0000';
        this.radiusOpacity = this.pdfViewer.radiusSettings.opacity ? this.pdfViewer.radiusSettings.opacity : 1;
        this.radiusThickness = this.pdfViewer.radiusSettings.thickness ? this.pdfViewer.radiusSettings.thickness : 1;
        this.volumeFillColor = this.pdfViewer.volumeSettings.fillColor ? this.pdfViewer.volumeSettings.fillColor : '#ffffff00';
        this.volumeStrokeColor = this.pdfViewer.volumeSettings.strokeColor ? this.pdfViewer.volumeSettings.strokeColor : '#ff0000';
        this.volumeOpacity = this.pdfViewer.volumeSettings.opacity ? this.pdfViewer.volumeSettings.opacity : 1;
        this.volumeThickness = this.pdfViewer.volumeSettings.thickness ? this.pdfViewer.volumeSettings.thickness : 1;
        this.unit = this.pdfViewer.measurementSettings.conversionUnit.toLowerCase() as CalibrationUnit;
        this.displayUnit = this.pdfViewer.measurementSettings.displayUnit.toLowerCase() as CalibrationUnit;
        this.ratio = this.pdfViewer.measurementSettings.scaleRatio;
        this.volumeDepth = this.pdfViewer.measurementSettings.depth;
        this.scaleRatioString = '1 ' + this.unit + ' = ' + this.ratio.toString() + ' ' + this.displayUnit;
    }

    private createAnnotationObject(annotationModel: PdfAnnotationBaseModel): IMeasureShapeAnnotation {
        let bound: IRectangle;
        let labelBound: IRectangle;
        const annotationName: string = this.pdfViewer.annotation.createGUID();
        // eslint-disable-next-line max-len
        const commentsDivid: string = this.pdfViewer.annotation.stickyNotesAnnotationModule.addComments('shape_measure', (annotationModel.pageIndex + 1), annotationModel.measureType);
        if (commentsDivid) {
            document.getElementById(commentsDivid).id = annotationName;
        }
        annotationModel.annotName = annotationName;
        annotationModel.author = this.pdfViewer.annotationModule.updateAnnotationAuthor('measure', annotationModel.subject);
        this.pdfViewer.annotation.stickyNotesAnnotationModule.addTextToComments(annotationName, annotationModel.notes);
        if (annotationModel.wrapper.bounds) {
            bound = {
                // eslint-disable-next-line max-len
                left: annotationModel.wrapper.bounds.x, top: annotationModel.wrapper.bounds.y, height: annotationModel.wrapper.bounds.height, width: annotationModel.wrapper.bounds.width,
                right: annotationModel.wrapper.bounds.right, bottom: annotationModel.wrapper.bounds.bottom
            };
            labelBound = this.pdfViewer.annotationModule.inputElementModule.calculateLabelBounds(annotationModel.wrapper.bounds);
        } else {
            bound = { left: 0, top: 0, height: 0, width: 0, right: 0, bottom: 0 };
            labelBound = { left: 0, top: 0, height: 0, width: 0, right: 0, bottom: 0 };
        }
        // eslint-disable-next-line radix
        let borderDashArray: number = parseInt(annotationModel.borderDashArray);
        borderDashArray = isNaN(borderDashArray) ? 0 : borderDashArray;
        // eslint-disable-next-line max-len
        const measure: IMeasure = { ratio: this.scaleRatioString, x: [this.createNumberFormat('x')], distance: [this.createNumberFormat('d')], area: [this.createNumberFormat('a')] };
        if (annotationModel.measureType === 'Volume') {
            measure.depth = this.volumeDepth;
        }
        // eslint-disable-next-line
        let annotationSettings: any = this.pdfViewer.annotationModule.findAnnotationSettings(annotationModel, true);
        // eslint-disable-next-line
        let allowedInteractions: any = this.pdfViewer.annotationModule.updateAnnotationAllowedInteractions(annotationModel);
        annotationModel.isPrint = annotationSettings.isPrint;
        return {
            // eslint-disable-next-line max-len
            id: annotationModel.id, shapeAnnotationType: this.getShapeAnnotType(annotationModel.measureType), author: annotationModel.author, allowedInteractions: allowedInteractions,
            subject: annotationModel.subject, note: annotationModel.notes, strokeColor: annotationModel.strokeColor,
            fillColor: annotationModel.fillColor, opacity: annotationModel.opacity, thickness: annotationModel.thickness,
            // eslint-disable-next-line max-len
            borderStyle: annotationModel.borderStyle, borderDashArray: borderDashArray, bounds: bound,
            // eslint-disable-next-line max-len
            modifiedDate: this.pdfViewer.annotation.stickyNotesAnnotationModule.getDateAndTime(),
            rotateAngle: 'RotateAngle' + annotationModel.rotateAngle, isCloudShape: annotationModel.isCloudShape, cloudIntensity: annotationModel.cloudIntensity,
            // eslint-disable-next-line max-len
            vertexPoints: annotationModel.vertexPoints, lineHeadStart: this.pdfViewer.annotation.getArrowTypeForCollection(annotationModel.sourceDecoraterShapes),
            lineHeadEnd: this.pdfViewer.annotation.getArrowTypeForCollection(annotationModel.taregetDecoraterShapes), rectangleDifference: [], isLocked: annotationSettings.isLock,
            // eslint-disable-next-line max-len
            leaderLength: annotationModel.leaderHeight, leaderLineExtension: 2, leaderLineOffset: 0, calibrate: measure, caption: true, captionPosition: 'Top',
            indent: this.getIndent(annotationModel.measureType), annotName: annotationName, comments: [], review: { state: '', stateModel: '', modifiedDate: this.pdfViewer.annotation.stickyNotesAnnotationModule.getDateAndTime(), author: annotationModel.author},
            // eslint-disable-next-line max-len
            labelContent: annotationModel.labelContent, enableShapeLabel: annotationModel.enableShapeLabel, labelFillColor: annotationModel.labelFillColor,
            labelBorderColor: annotationModel.labelBorderColor, fontColor: annotationModel.fontColor, fontSize: annotationModel.fontSize,
            // eslint-disable-next-line max-len
            labelBounds: labelBound,  annotationSelectorSettings: this.getSelector(annotationModel.subject), labelSettings: this.pdfViewer.shapeLabelSettings, annotationSettings: annotationSettings,
            customData: this.pdfViewer.annotation.getMeasureData(annotationModel.subject), isPrint: annotationModel.isPrint, isCommentLock: annotationModel.isCommentLock
        };
    }

    private getSelector( type: string) : AnnotationSelectorSettingsModel {
        let selector: AnnotationSelectorSettingsModel = this.pdfViewer.annotationSelectorSettings;
        if ((type === 'Distance calculation') && this.pdfViewer.distanceSettings.annotationSelectorSettings) {
            selector = this.pdfViewer.distanceSettings.annotationSelectorSettings;
        } else if ((type === 'Perimeter calculation') && this.pdfViewer.perimeterSettings.annotationSelectorSettings) {
            selector = this.pdfViewer.perimeterSettings.annotationSelectorSettings;
        // eslint-disable-next-line max-len
        } else if ((type === 'Area calculation') && this.pdfViewer.areaSettings.annotationSelectorSettings) {
            selector = this.pdfViewer.areaSettings.annotationSelectorSettings;
        } else if ((type === 'Radius calculation') && this.pdfViewer.radiusSettings.annotationSelectorSettings) {
            selector = this.pdfViewer.radiusSettings.annotationSelectorSettings;
        } else if ((type === 'Volume calculation') && this.pdfViewer.volumeSettings.annotationSelectorSettings) {
            selector = this.pdfViewer.volumeSettings.annotationSelectorSettings;
        }
        return selector;
    }

    private getShapeAnnotType(measureType: string): string {
        let annotationType: string;
        switch (measureType) {
        case 'Distance':
            annotationType = 'Line';
            break;
        case 'Perimeter':
            annotationType = 'Polyline';
            break;
        case 'Area':
        case 'Volume':
            annotationType = 'Polygon';
            break;
        case 'Radius':
            annotationType = 'Circle';
            break;
        }
        return annotationType;
    }

    private getShapeType(shape: IMeasureShapeAnnotation): PdfAnnotationType {
        let shapeType: PdfAnnotationType;
        if (shape.shapeAnnotationType === 'Line') {
            shapeType = 'Distance';
        } else if (shape.shapeAnnotationType === 'Polyline') {
            shapeType = 'LineWidthArrowHead';
        } else if (shape.shapeAnnotationType === 'Polygon' && shape.indent === 'PolygonDimension') {
            shapeType = 'Polygon';
            // eslint-disable-next-line max-len
        } else if ((shape.shapeAnnotationType === 'Polygon' && shape.indent === 'PolygonRadius') || shape.shapeAnnotationType === 'Circle') {
            shapeType = 'Radius';
        } else if (shape.shapeAnnotationType === 'Polygon' && shape.indent === 'PolygonVolume') {
            shapeType = 'Polygon';
        }
        return shapeType;
    }

    private getMeasureType(shape: IMeasureShapeAnnotation): string {
        let measureType: string;
        if (shape.shapeAnnotationType === 'Line') {
            measureType = 'Distance';
        } else if (shape.shapeAnnotationType === 'Polyline') {
            measureType = 'Perimeter';
        } else if (shape.shapeAnnotationType === 'Polygon' && shape.indent === 'PolygonDimension') {
            measureType = 'Area';
            // eslint-disable-next-line max-len
        } else if ((shape.shapeAnnotationType === 'Polygon' && shape.indent === 'PolygonRadius') || shape.shapeAnnotationType === 'Circle') {
            measureType = 'Radius';
        } else if (shape.shapeAnnotationType === 'Polygon' && shape.indent === 'PolygonVolume') {
            measureType = 'Volume';
        }
        return measureType;
    }

    private getIndent(measureType: string): string {
        let indent: string;
        switch (measureType) {
        case 'Distance':
            indent = 'LineDimension';
            break;
        case 'Perimeter':
            indent = 'PolyLineDimension';
            break;
        case 'Area':
            indent = 'PolygonDimension';
            break;
        case 'Radius':
            indent = 'PolygonRadius';
            break;
        case 'Volume':
            indent = 'PolygonVolume';
            break;
        }
        return indent;
    }

    // eslint-disable-next-line
    private getNumberFormatArray(list: any[]): INumberFormat[] {
        // eslint-disable-next-line
        let numberFormatArray: Array<any> = new Array();
        if (list) {
            for (let i: number = 0; i < list.length; i++) {
                // eslint-disable-next-line max-len
                numberFormatArray[i] = { unit: list[i].Unit, fractionalType: list[i].FractionalType, conversionFactor: list[i].ConversionFactor, denominator: list[i].Denominator, formatDenominator: list[i].FormatDenominator };
            }
        }
        return numberFormatArray;
    }

    private createNumberFormat(type: string): INumberFormat {
        let cFactor: number = 1;
        let unit: string = this.displayUnit;
        if (type === 'x') {
            cFactor = this.getFactor(this.unit);
        }
        if (type === 'a') {
            unit = 'sq ' + this.displayUnit;
        }
        // eslint-disable-next-line max-len
        const numberFormat: INumberFormat = { unit: unit, fractionalType: 'D', conversionFactor: cFactor, denominator: 100, formatDenominator: false };
        return numberFormat;
    }

    /**
     * @private
     */
    public saveMeasureShapeAnnotations(): string {
        // eslint-disable-next-line
        let storeObject: any = window.sessionStorage.getItem(this.pdfViewerBase.documentId + '_annotations_shape_measure');
        if (this.pdfViewerBase.isStorageExceed) {
            storeObject = this.pdfViewerBase.annotationStorage[this.pdfViewerBase.documentId + '_annotations_shape_measure'];
        }
        // eslint-disable-next-line
        let annotations: Array<any> = new Array();
        for (let j: number = 0; j < this.pdfViewerBase.pageCount; j++) {
            annotations[j] = [];
        }
        if (storeObject && !this.pdfViewer.annotationSettings.skipDownload) {
            const annotationCollection: IPageAnnotations[] = JSON.parse(storeObject);
            for (let i: number = 0; i < annotationCollection.length; i++) {
                let newArray: IMeasureShapeAnnotation[] = [];
                const pageAnnotationObject: IPageAnnotations = annotationCollection[i];
                if (pageAnnotationObject) {
                    for (let z: number = 0; pageAnnotationObject.annotations.length > z; z++) {
                        this.pdfViewer.annotationModule.updateModifiedDate(pageAnnotationObject.annotations[z]);
                        // eslint-disable-next-line max-len
                        pageAnnotationObject.annotations[z].bounds = JSON.stringify(this.pdfViewer.annotation.getBounds(pageAnnotationObject.annotations[z].bounds, pageAnnotationObject.pageIndex));
                        const strokeColorString: string = pageAnnotationObject.annotations[z].strokeColor;
                        pageAnnotationObject.annotations[z].strokeColor = JSON.stringify(this.getRgbCode(strokeColorString));
                        const fillColorString: string = pageAnnotationObject.annotations[z].fillColor;
                        pageAnnotationObject.annotations[z].fillColor = JSON.stringify(this.getRgbCode(fillColorString));
                        // eslint-disable-next-line max-len
                        pageAnnotationObject.annotations[z].vertexPoints = JSON.stringify(this.pdfViewer.annotation.getVertexPoints(pageAnnotationObject.annotations[z].vertexPoints, pageAnnotationObject.pageIndex));
                        if (pageAnnotationObject.annotations[z].rectangleDifference !== null) {
                            // eslint-disable-next-line max-len
                            pageAnnotationObject.annotations[z].rectangleDifference = JSON.stringify(pageAnnotationObject.annotations[z].rectangleDifference);
                        }
                        // eslint-disable-next-line max-len
                        pageAnnotationObject.annotations[z].calibrate = this.getStringifiedMeasure(pageAnnotationObject.annotations[z].calibrate);
                        if (pageAnnotationObject.annotations[z].enableShapeLabel === true) {
                            // eslint-disable-next-line max-len
                            pageAnnotationObject.annotations[z].labelBounds = JSON.stringify(this.pdfViewer.annotationModule.inputElementModule.calculateLabelBounds(JSON.parse(pageAnnotationObject.annotations[z].bounds), pageAnnotationObject.pageIndex));
                            const labelFillColorString: string = pageAnnotationObject.annotations[z].labelFillColor;
                            pageAnnotationObject.annotations[z].labelFillColor = JSON.stringify(this.getRgbCode(labelFillColorString));
                            const labelBorderColorString: string = pageAnnotationObject.annotations[z].labelBorderColor;
                            pageAnnotationObject.annotations[z].labelBorderColor = JSON.stringify(this.getRgbCode(labelBorderColorString));
                            const fontColorString: string = pageAnnotationObject.annotations[z].fontColor;
                            pageAnnotationObject.annotations[z].fontColor = JSON.stringify(this.getRgbCode(fontColorString));
                        }
                    }
                    newArray = pageAnnotationObject.annotations;
                }
                annotations[pageAnnotationObject.pageIndex] = newArray;
            }
        }
        return JSON.stringify(annotations);
    }

    /**
     * @private
     */
    public createScaleRatioWindow(): void {
        if (!isBlazor()) {
            const elementID: string = this.pdfViewer.element.id;
            // eslint-disable-next-line max-len
            const dialogDiv: HTMLElement = createElement('div', { id: elementID + '_scale_ratio_window', className: 'e-pv-scale-ratio-window' });
            this.pdfViewerBase.pageContainer.appendChild(dialogDiv);
            const contentElement: HTMLElement = this.createRatioUI();
            this.scaleRatioDialog = new Dialog({
                showCloseIcon: true, closeOnEscape: false, isModal: true, header: this.pdfViewer.localeObj.getConstant('Scale Ratio'),
                target: this.pdfViewer.element, content: contentElement, close: () => {
                    this.sourceTextBox.destroy();
                    this.convertUnit.destroy();
                    this.destTextBox.destroy();
                    this.dispUnit.destroy();
                    this.scaleRatioDialog.destroy();
                    const dialogElement: HTMLElement = this.pdfViewerBase.getElement('_scale_ratio_window');
                    dialogElement.parentElement.removeChild(dialogElement);
                }
            });
            if (!Browser.isDevice || this.pdfViewer.enableDesktopMode) {
                this.scaleRatioDialog.buttons = [
                    // eslint-disable-next-line max-len
                    { buttonModel: { content: this.pdfViewer.localeObj.getConstant('OK'), isPrimary: true }, click: this.onOkClicked.bind(this) },
                    { buttonModel: { content: this.pdfViewer.localeObj.getConstant('Cancel') }, click: this.onCancelClicked.bind(this) }
                ];
            } else {
                this.scaleRatioDialog.buttons = [
                    { buttonModel: { content: this.pdfViewer.localeObj.getConstant('Cancel') }, click: this.onCancelClicked.bind(this) },
                    // eslint-disable-next-line max-len
                    { buttonModel: { content: this.pdfViewer.localeObj.getConstant('OK'), isPrimary: true }, click: this.onOkClicked.bind(this) }
                ];
            }
            if (this.pdfViewer.enableRtl) {
                this.scaleRatioDialog.enableRtl = true;
            }
            this.scaleRatioDialog.appendTo(dialogDiv);
            this.convertUnit.content = this.createContent(this.unit).outerHTML;
            this.dispUnit.content = this.createContent(this.displayUnit).outerHTML;
            this.depthUnit.content = this.createContent(this.displayUnit).outerHTML;
        } else {
            this.pdfViewer._dotnetInstance.invokeMethodAsync('OpenScaleRatioDialog');
        }
    }

    private createRatioUI(): HTMLElement {
        const element: HTMLElement = createElement('div');
        const elementID: string = this.pdfViewer.element.id;
        // eslint-disable-next-line max-len
        const items: { [key: string]: Object }[] = [{ text: 'pt' }, { text: 'in' }, { text: 'mm' }, { text: 'cm' }, { text: 'p' }, { text: 'ft' }, { text: 'ft_in' }, { text: 'm' }];
        const labelText: HTMLElement = createElement('div', { id: elementID + '_scale_ratio_label', className: 'e-pv-scale-ratio-text' });
        labelText.textContent = this.pdfViewer.localeObj.getConstant('Scale Ratio');
        element.appendChild(labelText);
        const sourceContainer: HTMLElement = createElement('div', { id: elementID + '_scale_src_container' });
        element.appendChild(sourceContainer);
        // eslint-disable-next-line max-len
        const srcInputElement: HTMLElement = this.createInputElement('input', 'e-pv-scale-ratio-src-input', elementID + '_src_input', sourceContainer);
        this.sourceTextBox = new NumericTextBox({ value: 1, format: '##', cssClass: 'e-pv-scale-ratio-src-input', min: 1, max: 100 }, (srcInputElement as HTMLInputElement));
        // eslint-disable-next-line max-len
        const srcUnitElement: HTMLElement = this.createInputElement('button', 'e-pv-scale-ratio-src-unit', elementID + '_src_unit', sourceContainer);
        this.convertUnit = new DropDownButton({ items: items, cssClass: 'e-pv-scale-ratio-src-unit' }, (srcUnitElement as HTMLButtonElement));
        this.convertUnit.select = this.convertUnitSelect.bind(this);
        const destinationContainer: HTMLElement = createElement('div', { id: elementID + '_scale_dest_container' });
        // eslint-disable-next-line max-len
        const destInputElement: HTMLElement = this.createInputElement('input', 'e-pv-scale-ratio-dest-input', elementID + '_dest_input', destinationContainer);
        this.destTextBox = new NumericTextBox({ value: 1, format: '##', cssClass: 'e-pv-scale-ratio-dest-input', min: 1, max: 100 }, (destInputElement as HTMLInputElement));
        // eslint-disable-next-line max-len
        const destUnitElement: HTMLElement = this.createInputElement('button', 'e-pv-scale-ratio-dest-unit', elementID + '_dest_unit', destinationContainer);
        this.dispUnit = new DropDownButton({ items: items, cssClass: 'e-pv-scale-ratio-dest-unit' }, (destUnitElement as HTMLButtonElement));
        this.dispUnit.select = this.dispUnitSelect.bind(this);
        element.appendChild(destinationContainer);
        const depthLabelText: HTMLElement = createElement('div', { id: elementID + '_depth_label', className: 'e-pv-depth-text' });
        depthLabelText.textContent = this.pdfViewer.localeObj.getConstant('Depth');
        element.appendChild(depthLabelText);
        const depthContainer: HTMLElement = createElement('div', { id: elementID + '_depth_container' });
        element.appendChild(depthContainer);
        // eslint-disable-next-line max-len
        const depthInputElement: HTMLElement = this.createInputElement('input', 'e-pv-depth-input', elementID + '_depth_input', depthContainer);
        this.depthTextBox = new NumericTextBox({ value: this.volumeDepth, format: '##', cssClass: 'e-pv-depth-input', min: 1 }, (depthInputElement as HTMLInputElement));
        // eslint-disable-next-line max-len
        const depthUnitElement: HTMLElement = this.createInputElement('button', 'e-pv-depth-unit', elementID + '_depth_unit', depthContainer);
        this.depthUnit = new DropDownButton({ items: items, cssClass: 'e-pv-depth-unit' }, (depthUnitElement as HTMLButtonElement));
        this.depthUnit.select = this.depthUnitSelect.bind(this);
        return element;
    }

    private convertUnitSelect(args: MenuEventArgs): void {
        this.convertUnit.content = this.createContent(args.item.text).outerHTML;
    }

    private dispUnitSelect(args: MenuEventArgs): void {
        this.dispUnit.content = this.createContent(args.item.text).outerHTML;
        this.depthUnit.content = this.createContent(args.item.text).outerHTML;
    }

    private depthUnitSelect(args: MenuEventArgs): void {
        this.depthUnit.content = this.createContent(args.item.text).outerHTML;
    }

    private createContent(text: string): HTMLElement {
        const divElement: HTMLElement = createElement('div', { className: 'e-pv-scale-unit-content' });
        divElement.textContent = text;
        return divElement;
    }

    private createInputElement(input: string, className: string, idString: string, parentElement: HTMLElement): HTMLElement {
        const container: HTMLElement = createElement('div', { id: idString + '_container', className: className + '-container' });
        const textBoxInput: HTMLElement = createElement(input, { id: idString });
        if (input === 'input') {
            (textBoxInput as HTMLInputElement).type = 'text';
        }
        container.appendChild(textBoxInput);
        parentElement.appendChild(container);
        return textBoxInput;
    }

    /**
     * @private
     */
    public onOkClicked(): void {
        if (isBlazor()) {
            // eslint-disable-next-line
            let unitElement: any = document.querySelector('#'+ this.pdfViewer.element.id +'_src_unit');
            // eslint-disable-next-line
            let displayElement: any = document.querySelector('#'+ this.pdfViewer.element.id +'_dest_unit');
            // eslint-disable-next-line
            let sourceTextBox: any = document.querySelector('#'+ this.pdfViewer.element.id +'_ratio_input');
            // eslint-disable-next-line
            let destTextBox: any = document.querySelector('#'+ this.pdfViewer.element.id +'_dest_input');
            // eslint-disable-next-line
            let depthTextBox: any = document.querySelector('#'+ this.pdfViewer.element.id +'_depth_input');
            if (unitElement && displayElement && sourceTextBox && destTextBox && depthTextBox) {
                this.unit = unitElement.value;
                this.displayUnit = displayElement.value;
                // eslint-disable-next-line
                this.ratio = parseInt(destTextBox.value) / parseInt(sourceTextBox.value);
                // eslint-disable-next-line
                this.volumeDepth = parseInt(depthTextBox.value);
            }
            // eslint-disable-next-line
            this.scaleRatioString = parseInt(sourceTextBox.value) + ' ' + this.unit + ' = ' + parseInt(destTextBox.value) + ' ' + this.displayUnit;
            this.updateMeasureValues(this.scaleRatioString, this.displayUnit, this.unit, this.volumeDepth);
        } else {
            this.unit = this.getContent(this.convertUnit.content) as CalibrationUnit;
            this.displayUnit = this.getContent(this.dispUnit.content) as CalibrationUnit;
            this.ratio = this.destTextBox.value / this.sourceTextBox.value;
            this.volumeDepth = this.depthTextBox.value;
            this.scaleRatioString = this.sourceTextBox.value + ' ' + this.unit + ' = ' + this.destTextBox.value + ' ' + this.displayUnit;
            this.scaleRatioDialog.hide();
            this.updateMeasureValues(this.scaleRatioString, this.displayUnit, this.unit, this.volumeDepth);
        }
    }

    /**
     * @param ratio
     * @param displayUnit
     * @param conversionUnit
     * @param depth
     * @private
     */
    public updateMeasureValues(ratio: string, displayUnit: CalibrationUnit, conversionUnit: CalibrationUnit, depth: number): void {
        this.scaleRatioString = ratio;
        this.displayUnit = displayUnit;
        this.unit = conversionUnit;
        this.volumeDepth = depth;
        for (let i: number = 0; i < this.pdfViewerBase.pageCount; i++) {
            let pageAnnotations: IMeasureShapeAnnotation[] = this.getAnnotations(i, null);
            if (pageAnnotations) {
                for (let j: number = 0; j < pageAnnotations.length; j++) {
                    pageAnnotations = this.getAnnotations(i, null);
                    const measureObject: IMeasureShapeAnnotation = pageAnnotations[j];
                    measureObject.calibrate.ratio = ratio;
                    measureObject.calibrate.x[0].unit = displayUnit;
                    measureObject.calibrate.distance[0].unit = displayUnit;
                    measureObject.calibrate.area[0].unit = displayUnit;
                    measureObject.calibrate.x[0].conversionFactor = this.getFactor(conversionUnit);
                    if (measureObject.indent === 'PolygonVolume') {
                        measureObject.calibrate.depth = depth;
                    }
                    pageAnnotations[j] = measureObject;
                    this.manageAnnotations(pageAnnotations, i);
                    this.pdfViewer.annotation.updateCalibrateValues(this.getAnnotationBaseModel(measureObject.id));
                }
            }
            this.pdfViewer.annotation.renderAnnotations(i, null, null, null, null, false);
        }
    }

    private getAnnotationBaseModel(id: string): PdfAnnotationBaseModel {
        let annotationBase: PdfAnnotationBaseModel = null;
        for (let i: number = 0; i < this.pdfViewer.annotations.length; i++) {
            if (id === this.pdfViewer.annotations[i].id) {
                annotationBase = this.pdfViewer.annotations[i];
                break;
            }
        }
        return annotationBase;
    }

    private getContent(unit: string): string {
        return unit.split('</div>')[0].split('">')[1];
    }

    /**
     * @param value
     * @param currentAnnot
     * @private
     */
    // eslint-disable-next-line
    public setConversion(value: number, currentAnnot: any): string {
        // eslint-disable-next-line
        let values: any;
        if (currentAnnot) {
            let pageIndex: number = currentAnnot.pageIndex;
            if (currentAnnot.id === 'diagram_helper') {
                pageIndex = currentAnnot.pageIndex ? currentAnnot.pageIndex : this.pdfViewerBase.activeElements.activePageID;
                currentAnnot = this.getCurrentObject(pageIndex, null, currentAnnot.annotName);
            }
            if (currentAnnot) {
                values = this.getCurrentValues(currentAnnot.id, pageIndex);
            } else {
                values = this.getCurrentValues();
            }
        } else {
            values = this.getCurrentValues();
        }
        const scaledValue: number = value * values.ratio;
        return this.convertPointToUnits(values.factor, scaledValue, values.unit);
    }

    private onCancelClicked(): void {
        this.scaleRatioDialog.hide();
    }

    /**
     * @param property
     * @param pageNumber
     * @param annotationBase
     * @param isNewlyAdded
     * @param property
     * @param pageNumber
     * @param annotationBase
     * @param isNewlyAdded
     * @param property
     * @param pageNumber
     * @param annotationBase
     * @param isNewlyAdded
     * @param property
     * @param pageNumber
     * @param annotationBase
     * @param isNewlyAdded
     * @private
     */
    // eslint-disable-next-line
    public modifyInCollection(property: string, pageNumber: number, annotationBase: any, isNewlyAdded?: boolean): IMeasureShapeAnnotation {
        if (!isNewlyAdded) {
            this.pdfViewer.isDocumentEdited = true;
        }
        let currentAnnotObject: IMeasureShapeAnnotation = null;
        const pageAnnotations: IMeasureShapeAnnotation[] = this.getAnnotations(pageNumber, null);
        if (pageAnnotations != null && annotationBase) {
            for (let i: number = 0; i < pageAnnotations.length; i++) {
                if (annotationBase.id === pageAnnotations[i].id) {
                    if (property === 'bounds') {
                        this.pdfViewer.annotationModule.stickyNotesAnnotationModule.updateAnnotationModifiedDate(annotationBase, true);
                        if (pageAnnotations[i].shapeAnnotationType === 'Line' || pageAnnotations[i].shapeAnnotationType === 'Polyline') {
                            pageAnnotations[i].vertexPoints = annotationBase.vertexPoints;
                            // eslint-disable-next-line max-len
                            pageAnnotations[i].bounds = { left: annotationBase.bounds.x, top: annotationBase.bounds.y, width: annotationBase.bounds.width, height: annotationBase.bounds.height, right: annotationBase.bounds.right, bottom: annotationBase.bounds.bottom };
                        } else if (pageAnnotations[i].shapeAnnotationType === 'Polygon') {
                            pageAnnotations[i].vertexPoints = annotationBase.vertexPoints;
                            // eslint-disable-next-line max-len
                            pageAnnotations[i].bounds = { left: annotationBase.bounds.x, top: annotationBase.bounds.y, width: annotationBase.bounds.width, height: annotationBase.bounds.height, right: annotationBase.bounds.right, bottom: annotationBase.bounds.bottom };
                        } else {
                            // eslint-disable-next-line max-len
                            pageAnnotations[i].bounds = { left: annotationBase.bounds.x, top: annotationBase.bounds.y, width: annotationBase.bounds.width, height: annotationBase.bounds.height, right: annotationBase.bounds.right, bottom: annotationBase.bounds.bottom };
                        }
                        if (pageAnnotations[i].enableShapeLabel === true && annotationBase.wrapper) {
                            // eslint-disable-next-line max-len
                            pageAnnotations[i].labelBounds = this.pdfViewer.annotationModule.inputElementModule.calculateLabelBounds(annotationBase.wrapper.bounds);
                        }
                    } else if (property === 'fill') {
                        pageAnnotations[i].fillColor = annotationBase.wrapper.children[0].style.fill;
                    } else if (property === 'stroke') {
                        pageAnnotations[i].strokeColor = annotationBase.wrapper.children[0].style.strokeColor;
                    } else if (property === 'opacity') {
                        pageAnnotations[i].opacity = annotationBase.wrapper.children[0].style.opacity;
                    } else if (property === 'thickness') {
                        pageAnnotations[i].thickness = annotationBase.wrapper.children[0].style.strokeWidth;
                    } else if (property === 'dashArray') {
                        pageAnnotations[i].borderDashArray = annotationBase.wrapper.children[0].style.strokeDashArray;
                        pageAnnotations[i].borderStyle = annotationBase.borderStyle;
                    } else if (property === 'startArrow') {
                        // eslint-disable-next-line max-len
                        pageAnnotations[i].lineHeadStart = this.pdfViewer.annotation.getArrowTypeForCollection(annotationBase.sourceDecoraterShapes);
                    } else if (property === 'endArrow') {
                        // eslint-disable-next-line max-len
                        pageAnnotations[i].lineHeadEnd = this.pdfViewer.annotation.getArrowTypeForCollection(annotationBase.taregetDecoraterShapes);
                    } else if (property === 'leaderLength') {
                        pageAnnotations[i].leaderLength = annotationBase.leaderHeight;
                    } else if (property === 'notes') {
                        pageAnnotations[i].note = annotationBase.notes;
                        if (pageAnnotations[i].enableShapeLabel === true) {
                            pageAnnotations[i].labelContent = annotationBase.notes;
                        }
                    } else if (property === 'delete') {
                        currentAnnotObject = pageAnnotations.splice(i, 1)[0];
                        break;
                    } else if (property === 'labelContent') {
                        pageAnnotations[i].note = annotationBase.labelContent;
                        pageAnnotations[i].labelContent = annotationBase.labelContent;
                        break;
                    } else if (property === 'fontColor') {
                        pageAnnotations[i].fontColor = annotationBase.fontColor;
                    } else if (property === 'fontSize') {
                        pageAnnotations[i].fontSize = annotationBase.fontSize;
                    }
                    // eslint-disable-next-line max-len
                    pageAnnotations[i].modifiedDate = this.pdfViewer.annotation.stickyNotesAnnotationModule.getDateAndTime();
                    this.pdfViewer.annotationModule.storeAnnotationCollections(pageAnnotations[i], pageNumber);
                }
            }
            this.manageAnnotations(pageAnnotations, pageNumber);
        }
        return currentAnnotObject;
    }

    /**
     * @param pageNumber
     * @param annotationBase
     * @param pageNumber
     * @param annotationBase
     * @private
     */
    public addInCollection(pageNumber: number, annotationBase: IMeasureShapeAnnotation): void {
        const pageAnnotations: IMeasureShapeAnnotation[] = this.getAnnotations(pageNumber, null);
        if (pageAnnotations) {
            pageAnnotations.push(annotationBase);
        }
        this.manageAnnotations(pageAnnotations, pageNumber);
    }

    private manageAnnotations(pageAnnotations: IMeasureShapeAnnotation[], pageNumber: number): void {
        // eslint-disable-next-line
        let storeObject: any = window.sessionStorage.getItem(this.pdfViewerBase.documentId + '_annotations_shape_measure');
        if (this.pdfViewerBase.isStorageExceed) {
            storeObject = this.pdfViewerBase.annotationStorage[this.pdfViewerBase.documentId + '_annotations_shape_measure'];
        }
        if (storeObject) {
            const annotObject: IPageAnnotations[] = JSON.parse(storeObject);
            if (!this.pdfViewerBase.isStorageExceed) {
                window.sessionStorage.removeItem(this.pdfViewerBase.documentId + '_annotations_shape_measure');
            }
            const index: number = this.pdfViewer.annotationModule.getPageCollection(annotObject, pageNumber);
            if (annotObject[index]) {
                annotObject[index].annotations = pageAnnotations;
            }
            const annotationStringified: string = JSON.stringify(annotObject);
            if (this.pdfViewerBase.isStorageExceed) {
                this.pdfViewerBase.annotationStorage[this.pdfViewerBase.documentId + '_annotations_shape_measure'] = annotationStringified;
            } else {
                window.sessionStorage.setItem(this.pdfViewerBase.documentId + '_annotations_shape_measure', annotationStringified);
            }
        }
    }

    // eslint-disable-next-line
    private getAnnotations(pageIndex: number, shapeAnnotations: any[]): any[] {
        // eslint-disable-next-line
        let annotationCollection: any[];
        // eslint-disable-next-line
        let storeObject: any = window.sessionStorage.getItem(this.pdfViewerBase.documentId + '_annotations_shape_measure');
        if (this.pdfViewerBase.isStorageExceed) {
            storeObject = this.pdfViewerBase.annotationStorage[this.pdfViewerBase.documentId + '_annotations_shape_measure'];
        }
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

    private getCurrentObject(pageNumber: number, id: string, annotName?: string): IMeasureShapeAnnotation {
        let currentAnnotObject: IMeasureShapeAnnotation = null;
        const pageAnnotations: IMeasureShapeAnnotation[] = this.getAnnotations(pageNumber, null);
        if (pageAnnotations != null) {
            for (let i: number = 0; i < pageAnnotations.length; i++) {
                if (id) {
                    if (id === pageAnnotations[i].id) {
                        currentAnnotObject = pageAnnotations[i];
                        break;
                    }
                } else if (annotName) {
                    if (annotName === pageAnnotations[i].annotName) {
                        currentAnnotObject = pageAnnotations[i];
                        break;
                    }
                }
            }
        }
        return currentAnnotObject;
    }

    // eslint-disable-next-line
    private getCurrentValues(id?: string, pageNumber?: number): any {
        let ratio: number;
        let unit: CalibrationUnit;
        let factor: number;
        let depth: number;
        if (id && !isNaN(pageNumber)) {
            const currentAnnotObject: IMeasureShapeAnnotation = this.getCurrentObject(pageNumber, id);
            if (currentAnnotObject) {
                ratio = this.getCurrentRatio(currentAnnotObject.calibrate.ratio);
                unit = currentAnnotObject.calibrate.x[0].unit;
                factor = currentAnnotObject.calibrate.x[0].conversionFactor;
                depth = currentAnnotObject.calibrate.depth;
            } else {
                ratio = this.ratio;
                unit = this.displayUnit;
                factor = this.getFactor(this.unit);
                depth = this.volumeDepth;
            }
        } else {
            ratio = this.ratio;
            unit = this.displayUnit;
            factor = this.getFactor(this.unit);
            depth = this.volumeDepth;
        }
        return { ratio: ratio, unit: unit, factor: factor, depth: depth };
    }

    private getCurrentRatio(ratioString: string): number {
        const stringArray: string[] = ratioString.split(' ');
        if (stringArray[3] === '=') {
            return parseFloat(stringArray[4]) / parseFloat(stringArray[0]);
        } else {
            return parseFloat(stringArray[3]) / parseFloat(stringArray[0]);
        }
    }

    /**
     * @param points
     * @param id
     * @param pageNumber
     * @param points
     * @param id
     * @param pageNumber
     * @param points
     * @param id
     * @param pageNumber
     * @private
     */
    public calculateArea(points: PointModel[], id?: string, pageNumber?: number): string {
        // eslint-disable-next-line
        let values: any = this.getCurrentValues(id, pageNumber);
        const area: number = this.getArea(points, values.factor, values.unit) * values.ratio;
        if (values.unit === 'ft_in') {
            // eslint-disable-next-line
           let calculateValue: any = Math.round(area * 100) / 100;
            if (calculateValue >= 12) {
                calculateValue = (Math.round(calculateValue / 12 * 100) / 100).toString();
                calculateValue =  calculateValue.split('.');
                if (calculateValue[1]) {
                    // eslint-disable-next-line
                    let inchValue: any = 0;
                    if (calculateValue[1].charAt(1)) {
                        // eslint-disable-next-line
                        inchValue = parseInt(calculateValue[1].charAt(0)) + '.' + parseInt(calculateValue[1].charAt(1));
                        inchValue = Math.round(inchValue);
                    } else {
                        inchValue = calculateValue[1];
                    }
                    if (!inchValue) {
                        return (calculateValue[0] + ' sq ft');
                    } else {
                        return (calculateValue[0] + ' sq ft ' + inchValue + ' in');
                    }
                } else {
                    return(calculateValue[0] + ' sq ft');
                }
            } else {
                return (Math.round(area * 100) / 100) + ' sq in';
            }
        }
        if (values.unit === 'm') {
            return ((area * 100) / 100) + ' sq ' + values.unit;
        }
        return (Math.round(area * 100) / 100) + ' sq ' + values.unit;
    }

    private getArea(points: PointModel[], factor: number, unit: string): number {
        let area: number = 0;
        let j: number = points.length - 1;
        for (let i: number = 0; i < points.length; i++) {
            // eslint-disable-next-line max-len
            area += (points[j].x * this.pixelToPointFactor * factor + points[i].x * this.pixelToPointFactor * factor) * (points[j].y * this.pixelToPointFactor * factor - points[i].y * this.pixelToPointFactor * factor);
            j = i;
        }
        if (unit === 'ft_in') {
            return (Math.abs((area) * 2.0));
        } else {
            return (Math.abs((area) / 2.0));
        }
    }

    /**
     * @param points
     * @param id
     * @param pageNumber
     * @param points
     * @param id
     * @param pageNumber
     * @param points
     * @param id
     * @param pageNumber
     * @private
     */
    public calculateVolume(points: PointModel[], id?: string, pageNumber?: number): string {
        // eslint-disable-next-line
        let values: any = this.getCurrentValues(id, pageNumber);
        const depth: number = values.depth ? values.depth : this.volumeDepth;
        const area: number = this.getArea(points, values.factor, values.unit);
        const volume: number = area * ((depth * this.convertUnitToPoint(values.unit)) * values.factor) * values.ratio;
        if (values.unit === 'ft_in') {
            // eslint-disable-next-line
            let calculateValue: any = Math.round(volume * 100) / 100;
            if (calculateValue >= 12) {
                calculateValue = (Math.round(calculateValue / 12 * 100) / 100).toString();
                calculateValue = calculateValue.split('.');
                if (calculateValue[1]) {
                    // eslint-disable-next-line
                    let inchValue: any = 0;
                    if (calculateValue[1].charAt(1)) {
                        // eslint-disable-next-line
                        inchValue = parseInt(calculateValue[1].charAt(0)) + '.' + parseInt(calculateValue[1].charAt(1));
                        inchValue = Math.round(inchValue);
                    } else {
                        inchValue = calculateValue[1];
                    }
                    if (!inchValue) {
                        return (calculateValue[0] + ' cu ft');
                    } else {
                        return (calculateValue[0] + ' cu ft ' + inchValue + ' in');
                    }
                } else {
                    return(calculateValue[0] + ' cu ft');
                }
            } else {
                return (Math.round(volume * 100) / 100) + ' cu in';
            }
        }
        return (Math.round(volume * 100) / 100) + ' cu ' + values.unit;
    }

    /**
     * @param pdfAnnotationBase
     * @private
     */
    public calculatePerimeter(pdfAnnotationBase: PdfAnnotationBaseModel): string {
        const perimeter: number = Point.getLengthFromListOfPoints(pdfAnnotationBase.vertexPoints);
        return this.setConversion(perimeter * this.pixelToPointFactor, pdfAnnotationBase);
    }

    private getFactor(unit: CalibrationUnit): number {
        let factor: number;
        switch (unit) {
        case 'in':
            factor = (1 / 72);
            break;
        case 'cm':
            factor = (1 / 28.346);
            break;
        case 'mm':
            factor = (1 / 2.835);
            break;
        case 'pt':
            factor = 1;
            break;
        case 'p':
            factor = 1 / 12;
            break;
        case 'ft':
            factor = 1 / 864;
            break;
        case 'ft_in':
            factor = 1 / 72;
            break;
        case 'm':
            factor = (1 / 2834.64567);
            break;
        }
        return factor;
    }

    private convertPointToUnits(factor: number, value: number, unit: CalibrationUnit): string {
        let convertedValue: string;
        if (unit === 'ft_in') {
            // eslint-disable-next-line
           let calculateValue: any = Math.round((value * factor) * 100) / 100;
            if (calculateValue >= 12) {
                calculateValue = (Math.round(calculateValue / 12 * 100) / 100).toString();
                calculateValue = calculateValue.split('.');
                if (calculateValue[1]) {
                    // eslint-disable-next-line
                    let inchValue: any = 0;
                    if (calculateValue[1].charAt(1)) {
                        // eslint-disable-next-line
                        inchValue = parseInt(calculateValue[1].charAt(0)) + '.' + parseInt(calculateValue[1].charAt(1));
                        inchValue = Math.round(inchValue);
                    } else {
                        inchValue = calculateValue[1];
                    }
                    if (!inchValue) {
                        convertedValue = calculateValue[0] + ' ft';
                    } else {
                        convertedValue = calculateValue[0] + ' ft ' + inchValue + ' in';
                    }
                } else {
                    convertedValue = calculateValue[0] + ' ft';
                }
            } else {
                convertedValue = Math.round((value * factor) * 100) / 100 + '  in';
            }
        } else {
            convertedValue = Math.round((value * factor) * 100) / 100 + ' ' + unit;
        }
        return convertedValue;
    }

    private convertUnitToPoint(unit: string): number {
        let factor: number;
        switch (unit) {
        case 'in':
            factor = 72;
            break;
        case 'cm':
            factor = 28.346;
            break;
        case 'mm':
            factor = 2.835;
            break;
        case 'pt':
            factor = 1;
            break;
        case 'p':
            factor = 12;
            break;
        case 'ft':
            factor = 864;
            break;
        case 'ft_in':
            factor = 72;
            break;
        case 'm':
            factor = 2834.64567;
            break;
        }
        return factor;
    }

    // eslint-disable-next-line
    private getStringifiedMeasure(measure: any): string {
        if (!isNullOrUndefined(measure)) {
            measure.angle = JSON.stringify(measure.angle);
            measure.area = JSON.stringify(measure.area);
            measure.distance = JSON.stringify(measure.distance);
            measure.volume = JSON.stringify(measure.volume);
        }
        return JSON.stringify(measure);
    }

    // eslint-disable-next-line
    private getRgbCode(colorString: string): any {
        if (!colorString.match(/#([a-z0-9]+)/gi) && !colorString.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/)) {
            colorString = this.pdfViewer.annotationModule.nameToHash(colorString);
        }
        let stringArray: string[] = colorString.split(',');
        if (isNullOrUndefined(stringArray[1])) {
            colorString = this.pdfViewer.annotationModule.getValue(colorString, 'rgba');
            stringArray = colorString.split(',');
        }
        // eslint-disable-next-line radix
        const r: number = parseInt(stringArray[0].split('(')[1]);
        // eslint-disable-next-line radix
        const g: number = parseInt(stringArray[1]);
        // eslint-disable-next-line radix
        const b: number = parseInt(stringArray[2]);
        // eslint-disable-next-line radix
        const a: number = parseInt(stringArray[3]);
        return { r: r, g: g, b: b, a: a };
    }

    /**
     * @param annotation
     * @param pageNumber
     * @param annotation
     * @param pageNumber
     * @private
     */
    // eslint-disable-next-line
    public saveImportedMeasureAnnotations(annotation: any, pageNumber: number): any {
        let annotationObject: IMeasureShapeAnnotation = null;
        let vertexPoints: IPoint[] = null;
        if (annotation.VertexPoints) {
            vertexPoints = [];
            for (let j: number = 0; j < annotation.VertexPoints.length; j++) {
                const point: IPoint = { x: annotation.VertexPoints[j].X, y: annotation.VertexPoints[j].Y };
                vertexPoints.push(point);
            }
        }
        const measureObject: IMeasure = {
            // eslint-disable-next-line max-len
            ratio: annotation.Calibrate.Ratio, x: this.getNumberFormatArray(annotation.Calibrate.X), distance: this.getNumberFormatArray(annotation.Calibrate.Distance), area: this.getNumberFormatArray(annotation.Calibrate.Area), angle: this.getNumberFormatArray(annotation.Calibrate.Angle), volume: this.getNumberFormatArray(annotation.Calibrate.Volume),
            targetUnitConversion: annotation.Calibrate.TargetUnitConversion
        };
        if (annotation.Calibrate.Depth) {
            measureObject.depth = annotation.Calibrate.Depth;
        }
        if (annotation.Bounds && annotation.EnableShapeLabel === true) {
            // eslint-disable-next-line max-len
            annotation.LabelBounds = this.pdfViewer.annotationModule.inputElementModule.calculateLabelBoundsFromLoadedDocument(annotation.Bounds);
            annotation.LabelBorderColor = annotation.LabelBorderColor ? annotation.LabelBorderColor : annotation.StrokeColor;
            annotation.FontColor = annotation.FontColor ? annotation.FontColor : annotation.StrokeColor;
            annotation.LabelFillColor = annotation.LabelFillColor ? annotation.LabelFillColor : annotation.FillColor;
            annotation.FontSize = annotation.FontSize ? annotation.FontSize : 16;
            annotation.LabelSettings = annotation.LabelSettings ? annotation.LabelSettings : this.pdfViewer.shapeLabelSettings;
        }
        // eslint-disable-next-line max-len
        annotation.AnnotationSettings = annotation.AnnotationSettings ? annotation.AnnotationSettings : this.pdfViewer.annotationModule.updateAnnotationSettings(annotation);
        annotation.Author = this.pdfViewer.annotationModule.updateAnnotationAuthor('measure', annotation.Subject);
        annotationObject = {
            // eslint-disable-next-line max-len
            id: 'measure', shapeAnnotationType: annotation.ShapeAnnotationType, author: annotation.Author, modifiedDate: annotation.ModifiedDate, subject: annotation.Subject,
            note: annotation.Note, strokeColor: annotation.StrokeColor, fillColor: annotation.FillColor, opacity: annotation.Opacity, thickness: annotation.Thickness, rectangleDifference: annotation.RectangleDifference,
            // eslint-disable-next-line max-len
            borderStyle: annotation.BorderStyle, borderDashArray: annotation.BorderDashArray, rotateAngle: annotation.RotateAngle, isCloudShape: annotation.IsCloudShape,
            cloudIntensity: annotation.CloudIntensity, vertexPoints: vertexPoints, lineHeadStart: annotation.LineHeadStart, lineHeadEnd: annotation.LineHeadEnd, isLocked: annotation.IsLocked,
            // eslint-disable-next-line max-len
            bounds: { left: annotation.Bounds.X, top: annotation.Bounds.Y, width: annotation.Bounds.Width, height: annotation.Bounds.Height, right: annotation.Bounds.Right, bottom: annotation.Bounds.Bottom },
            caption: annotation.Caption, captionPosition: annotation.CaptionPosition, calibrate: measureObject, leaderLength: annotation.LeaderLength, leaderLineExtension: annotation.LeaderLineExtension,
            // eslint-disable-next-line max-len
            leaderLineOffset: annotation.LeaderLineOffset, indent: annotation.Indent, annotName: annotation.AnnotName, comments: this.pdfViewer.annotationModule.getAnnotationComments(annotation.Comments, annotation, annotation.Author),
            review: {state: annotation.State, stateModel: annotation.StateModel, modifiedDate: annotation.ModifiedDate, author: annotation.Author},
            labelContent: annotation.LabelContent, enableShapeLabel: annotation.EnableShapeLabel, labelFillColor: annotation.LabelFillColor,
            labelBorderColor: annotation.LabelBorderColor, fontColor: annotation.FontColor, fontSize: annotation.FontSize,
            // eslint-disable-next-line max-len
            labelBounds: annotation.LabelBounds, annotationSelectorSettings: this.getSettings(annotation), labelSettings: annotation.LabelSettings, annotationSettings: annotation.AnnotationSettings,
            customData: this.pdfViewer.annotation.getCustomData(annotation), isPrint: annotation.IsPrint, isCommentLock: annotation.IsCommentLock
        };
        this.pdfViewer.annotationModule.storeAnnotations(pageNumber, annotationObject, '_annotations_shape_measure');
    }

    /**
     * @param annotation
     * @param pageNumber
     * @private
     */
    // eslint-disable-next-line
    public updateMeasureAnnotationCollections(annotation: any, pageNumber: number): any {
        // eslint-disable-next-line
        let annotationObject: any = null;
        let vertexPoints: IPoint[] = null;
        if (annotation.VertexPoints) {
            vertexPoints = [];
            for (let j: number = 0; j < annotation.VertexPoints.length; j++) {
                const point: IPoint = { x: annotation.VertexPoints[j].X, y: annotation.VertexPoints[j].Y };
                vertexPoints.push(point);
            }
        }
        const measureObject: IMeasure = {
            // eslint-disable-next-line max-len
            ratio: annotation.Calibrate.Ratio, x: this.getNumberFormatArray(annotation.Calibrate.X), distance: this.getNumberFormatArray(annotation.Calibrate.Distance), area: this.getNumberFormatArray(annotation.Calibrate.Area), angle: this.getNumberFormatArray(annotation.Calibrate.Angle), volume: this.getNumberFormatArray(annotation.Calibrate.Volume),
            targetUnitConversion: annotation.Calibrate.TargetUnitConversion
        };
        if (annotation.Calibrate.Depth) {
            measureObject.depth = annotation.Calibrate.Depth;
        }
        if (annotation.Bounds && annotation.EnableShapeLabel === true) {
            // eslint-disable-next-line max-len
            annotation.LabelBounds = this.pdfViewer.annotationModule.inputElementModule.calculateLabelBoundsFromLoadedDocument(annotation.Bounds);
            annotation.LabelBorderColor = annotation.LabelBorderColor ? annotation.LabelBorderColor : annotation.StrokeColor;
            annotation.FontColor = annotation.FontColor ? annotation.FontColor : annotation.StrokeColor;
            annotation.LabelFillColor = annotation.LabelFillColor ? annotation.LabelFillColor : annotation.FillColor;
            annotation.FontSize = annotation.FontSize ? annotation.FontSize : 16;
            annotation.LabelSettings = annotation.LabelSettings ? annotation.LabelSettings : this.pdfViewer.shapeLabelSettings;
        }
        // eslint-disable-next-line max-len
        annotation.AnnotationSelectorSettings = annotation.AnnotationSelectorSettings ? annotation.AnnotationSelectorSettings : this.pdfViewer.annotationSelectorSettings;
        // eslint-disable-next-line max-len
        annotation.AnnotationSettings = annotation.AnnotationSettings ? annotation.AnnotationSettings : this.pdfViewer.annotationModule.updateAnnotationSettings(annotation);
        annotationObject = {
            // eslint-disable-next-line max-len
            id: 'measure', shapeAnnotationType: annotation.ShapeAnnotationType, author: annotation.Author, modifiedDate: annotation.ModifiedDate, subject: annotation.Subject,
            note: annotation.Note, strokeColor: annotation.StrokeColor, fillColor: annotation.FillColor, opacity: annotation.Opacity, thickness: annotation.Thickness, rectangleDifference: annotation.RectangleDifference,
            // eslint-disable-next-line max-len
            borderStyle: annotation.BorderStyle, borderDashArray: annotation.BorderDashArray, rotateAngle: annotation.RotateAngle, isCloudShape: annotation.IsCloudShape,
            cloudIntensity: annotation.CloudIntensity, vertexPoints: vertexPoints, lineHeadStart: annotation.LineHeadStart, lineHeadEnd: annotation.LineHeadEnd, isLocked: annotation.IsLocked,
            // eslint-disable-next-line max-len
            bounds: { left: annotation.Bounds.X, top: annotation.Bounds.Y, width: annotation.Bounds.Width, height: annotation.Bounds.Height, right: annotation.Bounds.Right, bottom: annotation.Bounds.Bottom },
            caption: annotation.Caption, captionPosition: annotation.CaptionPosition, calibrate: measureObject, leaderLength: annotation.LeaderLength, leaderLineExtension: annotation.LeaderLineExtension,
            // eslint-disable-next-line max-len
            leaderLineOffset: annotation.LeaderLineOffset, indent: annotation.Indent, annotationId: annotation.AnnotName, comments: this.pdfViewer.annotationModule.getAnnotationComments(annotation.Comments, annotation, annotation.Author),
            review: {state: annotation.State, stateModel: annotation.StateModel, modifiedDate: annotation.ModifiedDate, author: annotation.Author},
            labelContent: annotation.LabelContent, enableShapeLabel: annotation.EnableShapeLabel, labelFillColor: annotation.LabelFillColor,
            labelBorderColor: annotation.LabelBorderColor, fontColor: annotation.FontColor, fontSize: annotation.FontSize,
            // eslint-disable-next-line max-len
            labelBounds: annotation.LabelBounds, pageNumber: pageNumber, annotationSelectorSettings: annotation.AnnotationSelectorSettings, labelSettings: annotation.labelSettings, annotationSettings: annotation.AnnotationSettings,
            customData: this.pdfViewer.annotation.getCustomData(annotation), isPrint: annotation.IsPrint
        };
        return annotationObject;
    }
}
