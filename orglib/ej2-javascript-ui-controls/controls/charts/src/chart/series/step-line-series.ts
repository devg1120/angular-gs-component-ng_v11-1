/* eslint-disable jsdoc/require-returns */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable valid-jsdoc */
/* eslint-disable jsdoc/require-param */
import { ChartLocation, getPoint, withInRange } from '../../common/utils/helper';
import { PathOption } from '@syncfusion/ej2-svg-base';
import { Series, Points } from './chart-series';
import { LineBase } from './line-base';
import { AnimationModel } from '../../common/model/base-model';
import { Axis } from '../../chart/axis/axis';

/**
 * `StepLineSeries` module is used to render the step line series.
 */

export class StepLineSeries extends LineBase {

    /**
     * Render the Step line series.
     *
     * @returns {void}
     * @private
     */
    public render(series: Series, xAxis: Axis, yAxis: Axis, isInverted: boolean): void {
        let direction: string = '';
        let startPoint: string = 'M';
        let prevPoint: Points = null;
        let lineLength: number;
        let point1: ChartLocation;
        let point2: ChartLocation;
        const visiblePoints: Points[] = this.enableComplexProperty(series);
        if (xAxis.valueType === 'Category' && xAxis.labelPlacement === 'BetweenTicks') {
            lineLength = 0.5;
        } else {
            lineLength = 0;
        }
        for (const point of visiblePoints) {
            point.symbolLocations = []; point.regions = [];
            if (point.visible && withInRange(visiblePoints[point.index - 1], point, visiblePoints[point.index + 1], series)) {
                if (prevPoint != null) {
                    point2 = getPoint(point.xValue, point.yValue, xAxis, yAxis, isInverted);
                    point1 = getPoint(prevPoint.xValue, prevPoint.yValue, xAxis, yAxis, isInverted);
                    direction = direction.concat(startPoint + ' ' + (point1.x) + ' ' + (point1.y) + ' ' + 'L' + ' ' +
                        (point2.x) + ' ' + (point1.y) + ' L' + ' ' + (point2.x) + ' ' + (point2.y) + ' ');
                    startPoint = 'L';
                } else {
                    point1 = getPoint(point.xValue - lineLength, point.yValue, xAxis, yAxis, isInverted);
                    direction = direction.concat(startPoint + ' ' + (point1.x) + ' ' + (point1.y) + ' ');
                    startPoint = 'L';
                }
                this.storePointLocation(point, series, isInverted, getPoint);
                prevPoint = point;
            } else {
                prevPoint = series.emptyPointSettings.mode === 'Drop' ? prevPoint : null;
                startPoint = series.emptyPointSettings.mode === 'Drop' ? startPoint : 'M';
            }
        }
        if (visiblePoints.length > 0) {
            point1 = getPoint(
                visiblePoints[visiblePoints.length - 1].xValue + lineLength,
                visiblePoints[visiblePoints.length - 1].yValue, xAxis, yAxis, isInverted
            );
            direction = direction.concat(startPoint + ' ' + (point1.x) + ' ' + (point1.y) + ' ');
        }
        const pathOptions: PathOption = new PathOption(
            series.chart.element.id + '_Series_' + series.index, 'transparent',
            series.width, series.interior, series.opacity, series.dashArray, direction
        );
        this.appendLinePath(pathOptions, series, '');
        this.renderMarker(series);
    }
    /**
     * Animates the series.
     *
     * @param  {Series} series - Defines the series to animate.
     * @returns {void}
     */
    public doAnimation(series: Series): void {
        const option: AnimationModel = series.animation;
        this.doLinearAnimation(series, option);
    }
    /**
     * To destroy the step line series.
     *
     * @returns {void}
     * @private
     */
    public destroy(): void {
        /**
         * Destroy method calling here
         */
    }
    /**
     * Get module name.
     */
    protected getModuleName(): string {
        /**
         * Returns the module name of the series
         */
        return 'StepLineSeries';
    }
}
