/* eslint-disable */
import { PdfAnnotationBaseModel } from './pdf-annotation-model';
// eslint-disable-next-line max-len
import { DrawingElement, TextElement, PointModel, Point, BaseAttributes, rotateMatrix, identityMatrix, transformPointByMatrix, Matrix } from '@syncfusion/ej2-drawings';
import { Transforms } from './drawing';
import { getValue } from '@syncfusion/ej2-base';
/**
 * @param obj
 * @hidden
 */
export function isLineShapes(obj: PdfAnnotationBaseModel): boolean {
    if (obj.shapeAnnotationType === 'Line' || obj.shapeAnnotationType === 'LineWidthArrowHead'
        || obj.shapeAnnotationType === 'Distance' || obj.shapeAnnotationType === 'Polygon') {
        return true;
    }
    return false;
}
/**
 * @param obj
 * @param element
 * @hidden
 */
export function setElementStype(obj: PdfAnnotationBaseModel, element: DrawingElement): void {
    if (obj && element) {
        const fillColor: string = (obj.fillColor === '#ffffff00' ? 'transparent' : obj.fillColor);
        element.style.fill = fillColor;
        element.style.strokeColor = obj.strokeColor;
        (element as TextElement).style.color = obj.strokeColor;
        element.style.strokeWidth = obj.thickness;
        if (obj.shapeAnnotationType === 'Image') {
            element.style.strokeWidth = 0;
        }
        element.style.strokeDashArray = obj.borderDashArray;
        element.style.opacity = obj.opacity;

    }
}
/**
 * @param points
 * @hidden
 */
export function findPointsLength(points: PointModel[]): number {
    let length: number = 0;
    for (let i: number = 0; i < points.length - 1; i++) {
        length += Point.findLength(points[i], points[i + 1]);
    }
    return length;
}

/**
 * @param points
 * @hidden
 */
export function findPerimeterLength(points: PointModel[]): number {
    const length: number = Point.getLengthFromListOfPoints(points);
    return length;
}

/**
 * @param element
 * @param transform
 * @param element
 * @param transform
 * @private
 */
export function getBaseShapeAttributes(element: DrawingElement, transform?: Transforms): BaseAttributes {
    const baseShapeAttributes: BaseAttributes = {
        width: element.actualSize.width, height: element.actualSize.height,
        x: element.offsetX - element.actualSize.width * element.pivot.x + 0.5,
        y: element.offsetY - element.actualSize.height * element.pivot.y + 0.5,
        angle: element.rotateAngle + element.parentTransform, fill: element.style.fill, stroke: element.style.strokeColor,
        pivotX: element.pivot.x, pivotY: element.pivot.y, strokeWidth: 1,
        opacity: element.style.opacity, dashArray: element.style.strokeDashArray || '',
        visible: element.visible, id: element.id
    };

    if (transform) {
        baseShapeAttributes.x += transform.tx;
        baseShapeAttributes.y += transform.ty;
    }
    return baseShapeAttributes;
}

/**
 * Get function
 *
 * @param value
 * @private
 */
export function getFunction(value: Function | string): Function {
    if (value !== undefined) {
        if (typeof value === 'string') {
            value = getValue(value, window);
        }

    }
    return value as Function;
}

/**
 * @param obj
 * @param additionalProp
 * @param key
 * @param obj
 * @param additionalProp
 * @param key
 * @param obj
 * @param additionalProp
 * @param key
 * @private
 */
// eslint-disable-next-line
export function cloneObject(obj: any, additionalProp?: Function | string, key?: string): Object {
    // eslint-disable-next-line
    let newObject: any = {};
    const keys: string = 'properties';
    const prop: string = 'propName';
    if (obj) {
        key = obj[prop];
        const sourceObject: Object = obj[keys] || obj;
        let properties: string[] = [];
        properties = properties.concat(Object.keys(sourceObject));
        let customProperties: string[] = [];
        properties.push('version');
        if (key) {
            const propAdditional: Function = getFunction(additionalProp);
            if (propAdditional) {
                customProperties = propAdditional(key);
            } else {
                customProperties = [];
            }
            properties = properties.concat(customProperties);
        }
        const internalProp: string[] = getInternalProperties(key);
        properties = properties.concat(internalProp);
        for (const property of properties) {
            if (property !== 'historyManager') {
                if (property !== 'wrapper') {
                    const constructorId: string = 'constructor';
                    const name: string = 'name';
                    const isEventEmmitter: boolean = obj[property] && obj.hasOwnProperty('observers') ? true : false;
                    if (!isEventEmmitter) {
                        if (obj[property] instanceof Array) {
                            newObject[property] = cloneArray(
                                (internalProp.indexOf(property) === -1 && obj[keys]) ? obj[keys][property] : obj[property],
                                additionalProp, property);
                        } else if (obj[property] instanceof Array === false && obj[property] instanceof HTMLElement) {
                            newObject[property] = obj[property].cloneNode(true).innerHtml;
                        } else if (obj[property] instanceof Array === false && obj[property] instanceof Object) {
                            newObject[property] = cloneObject(
                                (internalProp.indexOf(property) === -1 && obj[keys]) ? obj[keys][property] : obj[property]);
                        } else {
                            newObject[property] = obj[property];
                        }
                    }
                } else {
                    if (obj[property]) {
                        newObject[property] = {
                            actualSize: {
                                width: obj[property].actualSize.width, height: obj[property].actualSize.height
                            }, offsetX: obj[property].offsetX, offsetY: obj[property].offsetY
                        };
                    }
                }
            }
        }
    }
    return newObject;
}

/**
 * @param sourceArray
 * @param additionalProp
 * @param key
 * @param sourceArray
 * @param additionalProp
 * @param key
 * @param sourceArray
 * @param additionalProp
 * @param key
 * @private
 */
export function cloneArray(sourceArray: Object[], additionalProp?: Function | string, key?: string): Object[] {
    let clonedArray: Object[];
    if (sourceArray) {
        clonedArray = [];
        for (let i: number = 0; i < sourceArray.length; i++) {
            if (sourceArray[i] instanceof Array) {
                clonedArray.push(sourceArray[i]);
            } else if (sourceArray[i] instanceof Object) {
                clonedArray.push(cloneObject(sourceArray[i], additionalProp, key));
            } else {
                clonedArray.push(sourceArray[i]);
            }
        }
    }
    return clonedArray;
}


/**
 * @param propName
 * @private
 */
export function getInternalProperties(propName: string): string[] {
    switch (propName) {
    case 'nodes':
    case 'children':
        return ['inEdges', 'outEdges', 'parentId', 'processId', 'nodeId', 'umlIndex', 'isPhase', 'isLane'];
    case 'connectors':
        return ['parentId'];
    case 'annotation':
        return ['nodeId'];
    case 'annotations':
        return ['nodeId'];
    case 'shape':
        return ['hasHeader'];
    }
    return [];
}
/**
 * @param obj
 * @param position
 * @param obj
 * @param position
 * @hidden
 */
export function isLeader(obj: PdfAnnotationBaseModel, position: string): Leader {
    let rotatedPoint: PointModel;
    if (obj.shapeAnnotationType === 'Distance') {
        let leaderCount: number = 0;
        let newPoint1: PointModel;
        for (let i: number = 0; i < obj.wrapper.children.length; i++) {
            const angle: number = Point.findAngle(obj.sourcePoint, obj.targetPoint);
            // eslint-disable-next-line
            let segment: any = obj.wrapper.children[i];
            if (segment.id.indexOf('leader') > -1) {
                let center: PointModel = obj.wrapper.children[0].bounds.center;
                if (leaderCount === 0) {
                    newPoint1 = { x: obj.sourcePoint.x, y: obj.sourcePoint.y - obj.leaderHeight };
                    center = obj.sourcePoint;
                } else {
                    newPoint1 = { x: obj.targetPoint.x, y: obj.targetPoint.y - obj.leaderHeight };
                    center = obj.targetPoint;
                }
                const matrix: Matrix = identityMatrix();
                rotateMatrix(matrix, angle, center.x, center.y);
                rotatedPoint = transformPointByMatrix(matrix, { x: newPoint1.x, y: newPoint1.y });
                if (position === 'Leader' + leaderCount) {
                    return { leader: 'leader' + leaderCount, point: rotatedPoint };
                }
                leaderCount++;
            }
        }
    }
    return { leader: '', point: rotatedPoint };
}
/**
 * @hidden
 */
export interface Leader {
    leader: string
    point: PointModel
}
