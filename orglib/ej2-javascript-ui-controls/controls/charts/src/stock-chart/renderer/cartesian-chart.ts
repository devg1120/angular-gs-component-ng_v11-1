/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable @typescript-eslint/ban-types */
/**
 * Cartesian chart renderer for financial chart
 */
import { Chart } from '../../chart/chart';
import { Series } from '../../chart/series/chart-series';
import { StockChart } from '../stock-chart';
import { Size } from '@syncfusion/ej2-svg-base';
import { Axis, VisibleRangeModel } from '../../chart/axis/axis';
import { remove, extend } from '@syncfusion/ej2-base';
import { StockSeriesModel } from '../model/base-model';
import { ITooltipRenderEventArgs, IAxisLabelRenderEventArgs, IZoomCompleteEventArgs } from '../../chart/model/chart-interface';
import { ISeriesRenderEventArgs, IPointEventArgs, IZoomingEventArgs } from '../../chart/model/chart-interface';
import { StockSeries } from '../model/base';
import { onZooming } from '../../common/model/constants';
import { getElement } from '../../common/utils/helper';
import { MarginModel } from '../../common/model/base-model';

interface Range {
    start: number;
    end: number;
}
/** @private */
export class CartesianChart {
    private stockChart: StockChart;
    public cartesianChartSize: Size;
    constructor(chart: StockChart) {
        this.stockChart = chart;
    }
    public initializeChart(chartArgsData ?: object[]): void {
        const stockChart: StockChart = this.stockChart;
        const isProtect: string = 'isProtectedOnChange';
        stockChart[isProtect]  = true;
        if (!stockChart.chartObject) {
            stockChart.chartObject = stockChart.renderer.createGroup({
                id: stockChart.element.id + '_stockChart_chart'
            });
            stockChart.mainObject.appendChild(stockChart.chartObject);
        } else {
            const chartElement: Element = document.getElementById(stockChart.chartObject.id);
            while (chartElement.firstChild) {
                chartElement.removeChild(chartElement.firstChild);
            }
            if (getElement(stockChart.chartObject + '_tooltip')) {
                remove(getElement(stockChart.chartObject + '_tooltip'));
            }
        }

        this.cartesianChartSize = this.calculateChartSize();
        stockChart.chart = new Chart({
            chartArea : stockChart.chartArea,
            margin : this.findMargin(stockChart),
            primaryXAxis: this.copyObject(stockChart.primaryXAxis),
            primaryYAxis: this.copyObject(stockChart.primaryYAxis),
            rows: stockChart.rows,
            indicators: stockChart.indicators,
            axes: stockChart.axes,
            tooltipRender : (args : ITooltipRenderEventArgs) => {
                this.stockChart.trigger('tooltipRender', args);
            },
            axisLabelRender : (args : IAxisLabelRenderEventArgs) => {
                this.stockChart.trigger('axisLabelRender', args);
            },
            seriesRender : (args : ISeriesRenderEventArgs) => {
                if (args.data && this.stockChart.startValue && this.stockChart.endValue) {
                    args.data = (args.data as Object[])
                        .filter((data: Object) => {
                            return (
                                new Date(Date.parse(data[args.series.xName])).getTime() >= this.stockChart.startValue &&
                            new Date(Date.parse(data[args.series.xName])).getTime() <= this.stockChart.endValue
                            );
                        });
                }
                args.data = chartArgsData ? chartArgsData : args.data;
                //args.data = this.stockChart.findCurrentData(args.data ,args.series.xName);
                this.stockChart.trigger('seriesRender', args);
            },
            onZooming: (args: IZoomingEventArgs) => { this.stockChart.trigger(onZooming, args); },
            pointClick: (args: IPointEventArgs) => {
                this.stockChart.trigger('pointClick', args);
            },
            pointMove: (args: IPointEventArgs) => {
                this.stockChart.trigger('pointMove', args);
            },
            dataSource: stockChart.dataSource,
            series: this.findSeriesCollection(stockChart.series),
            zoomSettings: this.copyObject(stockChart.zoomSettings),
            tooltip: stockChart.tooltip,
            crosshair: stockChart.crosshair,
            height: this.cartesianChartSize.height.toString(),
            selectedDataIndexes: stockChart.selectedDataIndexes,
            selectionMode: stockChart.selectionMode,
            isMultiSelect: stockChart.isMultiSelect,
            annotations: stockChart.annotations,
            theme: stockChart.theme,
            legendSettings: { visible: false},
            zoomComplete: (args: IZoomCompleteEventArgs) => {
                if (args.axis.valueType === 'DateTime' && stockChart.rangeNavigator) {
                    this.stockChart.zoomChange = true;
                    const newRange: Range = this.calculateUpdatedRange(args.currentZoomFactor, args.currentZoomPosition, <Axis>args.axis);
                    stockChart.rangeSelector.sliderChange(newRange.start, newRange.end);
                }
            }
        });
        if (stockChart.indicators.length !== 0) {
            if (stockChart.isSelect) {
                for (let i: number = 0; i < stockChart.indicators.length; i++) {
                    stockChart.chart.indicators[i].animation.enable = false;
                    stockChart.chart.indicators[i].dataSource = extend([], stockChart.chart.series[0].dataSource, null, true);
                }
            }
            stockChart.isSelect = true;
        }
        stockChart.chart.stockChart = stockChart;
        stockChart.chart.appendTo(stockChart.chartObject as HTMLElement);
        stockChart[isProtect] = false;
    }

    private findMargin(stockChart: StockChart) : MarginModel {
        const margin : MarginModel = {};
        margin.top = stockChart.margin.top * 2;
        margin.left = stockChart.margin.left;
        margin.right = stockChart.margin.right;
        margin.bottom = stockChart.margin.bottom;
        return margin;
    }

    private findSeriesCollection(series: StockSeriesModel[]) : Series[] {
        const chartSeries : Series[] = [];
        for (let i: number = 0, len: number = series.length; i < len; i++) {
            chartSeries.push(<Series>series[i]);
            chartSeries[i].high = series[i].high;
            chartSeries[i].low = series[i].low;
            chartSeries[i].open = series[i].open;
            chartSeries[i].close = series[i].close;
            chartSeries[i].xName = series[i].xName;
            chartSeries[i].volume = series[i].volume;
            chartSeries[i].animation = series[i].animation;
            if ((series[i] as StockSeries).localData) {
                chartSeries[i].dataSource = (series[i] as StockSeries).localData;
            }
            if (chartSeries[i].type !== 'HiloOpenClose' && chartSeries[i].type !== 'Candle' && chartSeries[i].yName === 'volume') {
                chartSeries[i].enableTooltip = false;
            }
        }
        return chartSeries;
    }

    public calculateChartSize(): Size {
        const stockChart: StockChart = this.stockChart;
        return (
            new Size(
                stockChart.availableSize.width, (stockChart.enablePeriodSelector && stockChart.enableSelector) ?
                    ((stockChart.availableSize.height - stockChart.toolbarHeight - 80)) :
                    (stockChart.enableSelector && !stockChart.enablePeriodSelector) ? (stockChart.availableSize.height - 80) :
                        (stockChart.enablePeriodSelector && !stockChart.enableSelector) ?
                            stockChart.availableSize.height - stockChart.toolbarHeight : stockChart.availableSize.height)
        );
    }

    private calculateUpdatedRange(zoomFactor: number, zoomPosition: number, axis: Axis): Range {
        let start: number;
        let end: number;
        //if (zoomFactor < 1 || zoomPosition > 0) {
        const chartRange: VisibleRangeModel = axis.actualRange;
        const inversed: boolean = false;
        if (!inversed) {
            start = chartRange.min + zoomPosition * chartRange.delta;
            end = start + zoomFactor * chartRange.delta;
        } else {
            start = chartRange.max - (zoomPosition * chartRange.delta);
            end = start - (zoomFactor * chartRange.delta);
        }
        //}
        const result: Range = { start: start, end: end };
        return result;
    }

    /**
     * Cartesian chart refreshes based on start and end value
     *
     * @param {StockChart} stockChart stock chart instance
     * @param {Object[]} data stock chart data
     * @returns {void}
     */
    public cartesianChartRefresh(stockChart: StockChart, data?: Object[]): void {
        stockChart.cartesianChart.initializeChart(data);
    }

    private copyObject(originalObject: Object): Object {
        return (extend({}, originalObject, {}, true));
    }
}
