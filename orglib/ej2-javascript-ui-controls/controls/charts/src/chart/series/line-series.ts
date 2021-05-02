/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable valid-jsdoc */
/* eslint-disable jsdoc/require-param */
import { withInRange, getPoint, ChartLocation, TransformToVisible } from '../../common/utils/helper';
import { PathOption } from '@syncfusion/ej2-svg-base';
import { Series, Points } from './chart-series';
import { LineBase } from './line-base';
import { AnimationModel } from '../../common/model/base-model';
import { Axis } from '../../chart/axis/axis';

/**
 * `LineSeries` module used to render the line series.
 */
export class LineSeries extends LineBase {
    /**
     * Render Line Series.
     *
     * @returns {void}
     * @private
     */
    public render(series: Series, xAxis: Axis, yAxis: Axis, isInverted: boolean): void {
        let point1: ChartLocation;
        let point2: ChartLocation;
        let direction: string = '';
        let prevPoint: Points = null;
        let startPoint: string = 'M';
        const isPolar: boolean = (series.chart && series.chart.chartAreaType === 'PolarRadar');
        const isDrop: boolean = (series.emptyPointSettings && series.emptyPointSettings.mode === 'Drop');
        const getCoordinate: Function = isPolar ? TransformToVisible : getPoint;
        const visiblePoints: Points[] = series.category === 'TrendLine' ? series.points : this.enableComplexProperty(series);
        for (const point of visiblePoints) {
            point.regions = [];
            point.symbolLocations = [];
            if (point.visible && withInRange(visiblePoints[point.index - 1], point, visiblePoints[point.index + 1], series)) {
                direction += this.getLineDirection(prevPoint, point, series, isInverted, getCoordinate, startPoint);
                startPoint = prevPoint ? 'L' : startPoint;
                prevPoint = point;
                this.storePointLocation(point, series, isInverted, getCoordinate);
            } else {
                prevPoint = isDrop ? prevPoint : null;
                startPoint = isDrop ? startPoint : 'M';
            }
        }
        if (isPolar) {
            if (series.isClosed) {
                const points: {first: Points, last: Points} = this.getFirstLastVisiblePoint(visiblePoints);
                point2 = getCoordinate(
                    points.last.xValue, points.last.yValue,
                    xAxis, yAxis, isInverted, series
                );
                point1 = getCoordinate(points.first.xValue, points.first.yValue, xAxis, yAxis, isInverted, series);
                direction = direction.concat(startPoint + ' ' + point2.x + ' ' + point2.y + ' ' + 'L' + ' ' + point1.x + ' ' + point1.y);
            }
        }
        const name: string = series.category === 'Indicator' ? series.chart.element.id + '_Indicator_' + series.index + '_' + series.name :
            series.category === 'TrendLine' ? series.chart.element.id + '_Series_' + series.sourceIndex + '_TrendLine_' + series.index :
                series.chart.element.id + '_Series_' + (series.index === undefined ? series.category : series.index);
        const options: PathOption = new PathOption(
            name, 'none', series.width, series.interior,
            series.opacity, series.dashArray, direction
        );
        this.appendLinePath(options, series, '');
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
        this.doProgressiveAnimation(series, option);
    }

    /**
     * Get module name.
     */

    protected getModuleName(): string {
        /**
         * Returns the module name of the series
         */
        return 'LineSeries';
    }

    /**
     * To destroy the line series.
     *
     * @returns {void}
     * @private
     */

    public destroy(): void {
        /**
         * Destroy method performed here
         */
    }
}
