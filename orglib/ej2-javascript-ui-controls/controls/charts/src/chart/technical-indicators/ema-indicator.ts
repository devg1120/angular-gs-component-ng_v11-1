/* eslint-disable jsdoc/require-returns */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable valid-jsdoc */
/* eslint-disable jsdoc/require-param */
import { Series, Points } from '../series/chart-series';
import { firstToLowerCase } from '../../common/utils/helper';
import { TechnicalIndicator } from './technical-indicator';
import { TechnicalAnalysis } from './indicator-base';
import { Chart } from '../chart';

/**
 * `EmaIndicator` module is used to render EMA indicator.
 */
export class EmaIndicator extends TechnicalAnalysis {
    /**
     * Defines the predictions based on EMA approach
     *
     * @private
     */
    public initDataSource(indicator: TechnicalIndicator, chart: Chart): void {
        const field: string = firstToLowerCase(indicator.field);
        const xField: string = 'x';
        const emaPoints: Points[] = [];
        const signalSeries: Series = indicator.targetSeries[0];

        //prepare data
        const validData: Points[] = indicator.points;

        if (validData && validData.length && validData.length >= indicator.period) {

            //find initial average
            let sum: number = 0;
            let average: number = 0;

            //smoothing factor
            const k: number = (2 / (indicator.period + 1));

            for (let i: number = 0; i < indicator.period; i++) {
                sum += validData[i][field];
            }

            average = sum / indicator.period;

            emaPoints.push(this.getDataPoint(
                validData[indicator.period - 1][xField], average,
                validData[indicator.period - 1], signalSeries, emaPoints.length));

            let index: number = indicator.period;
            while (index < validData.length) {
                //previous average
                const prevAverage: number = emaPoints[index - indicator.period][signalSeries.yName];

                const yValue: number = (validData[index][field] - prevAverage) * k + prevAverage;

                emaPoints.push(this.getDataPoint(
                    validData[index][xField], yValue,
                    validData[index], signalSeries, emaPoints.length));

                index++;
            }
        }
        this.setSeriesRange(emaPoints, indicator);
    }

    /**
     * To destroy the EMA Indicator
     *
     * @returns {void}
     * @private
     */

    public destroy(): void {
        /**
         * Destroys the EMA Indicator
         */
    }

    /**
     * Get module name.
     */
    protected getModuleName(): string {
        /**
         * Returns the module name of the series
         */
        return 'EmaIndicator';
    }
}
