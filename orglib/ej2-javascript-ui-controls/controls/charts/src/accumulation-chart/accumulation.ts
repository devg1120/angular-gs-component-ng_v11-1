/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable jsdoc/require-returns */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable jsdoc/require-param */
/* eslint-disable valid-jsdoc */
/**
 * AccumulationChart file
 */
import { Property, Component, Complex, Collection, NotifyPropertyChanges, INotifyPropertyChanged } from '@syncfusion/ej2-base';
import { ModuleDeclaration, Internationalization, Event, EmitType, Browser, EventHandler, Touch } from '@syncfusion/ej2-base';
import { remove, extend, isNullOrUndefined, updateBlazorTemplate } from '@syncfusion/ej2-base';
import { AccumulationChartModel } from './accumulation-model';
import { Font, Margin, Border, TooltipSettings, Indexes } from '../common/model/base';
import { AccumulationSeries, AccPoints, PieCenter } from './model/acc-base';
import { AccumulationType, AccumulationSelectionMode } from './model/enum';
import { IAccSeriesRenderEventArgs, IAccTextRenderEventArgs } from './model/pie-interface';
import { IAccAnimationCompleteEventArgs, IAccPointRenderEventArgs, IAccLoadedEventArgs } from './model/pie-interface';
import { Theme, getThemeColor } from '../common/model/theme';
import { ILegendRenderEventArgs, IMouseEventArgs, IPointEventArgs, ITooltipRenderEventArgs, IAfterExportEventArgs } from '../chart/model/chart-interface';
import { IAnnotationRenderEventArgs } from '../chart/model/chart-interface';
import { load, pointClick } from '../common/model/constants';
import { pointMove, chartMouseClick, chartMouseDown } from '../common/model/constants';
import { chartMouseLeave, chartMouseMove, chartMouseUp, resized, beforeResize } from '../common/model/constants';
import { FontModel, MarginModel, BorderModel, IndexesModel, TooltipSettingsModel } from '../common/model/base-model';
import { AccumulationSeriesModel, PieCenterModel } from './model/acc-base-model';
import { LegendSettings } from '../common/legend/legend';
import { AccumulationLegend } from './renderer/legend';
import { LegendSettingsModel } from '../common/legend/legend-model';
import { ChartLocation, subtractRect, indexFinder, appendChildElement, redrawElement, blazorTemplatesReset } from '../common/utils/helper';
import { RectOption, showTooltip, ImageOption } from '../common/utils/helper';
import { textElement, createSvg, calculateSize, removeElement, firstToLowerCase, withInBounds } from '../common/utils/helper';
import { getElement, titlePositionX } from '../common/utils/helper';
import { Rect, Size, measureText, TextOption, SvgRenderer, CanvasRenderer } from '@syncfusion/ej2-svg-base';
import { Data } from '../common/model/data';
import { AccumulationTooltip } from './user-interaction/tooltip';
import { AccumulationBase } from './renderer/accumulation-base';
import { PieSeries } from './renderer/pie-series';
import { AccumulationDataLabel } from './renderer/dataLabel';
import { FunnelSeries } from './renderer/funnel-series';
import { PyramidSeries } from './renderer/pyramid-series';
import { AccumulationSelection } from './user-interaction/selection';
import { AccumulationTheme } from './model/enum';
import { AccumulationAnnotationSettingsModel } from './model/acc-base-model';
import { AccumulationAnnotationSettings } from './model/acc-base';
import { AccumulationAnnotation } from './annotation/annotation';
import { IPrintEventArgs } from '../chart/model/chart-interface';
import { Alignment, ExportType, SelectionPattern } from '../common/utils/enum';
import { getTitle } from '../common/utils/helper';
import { Index } from '../common/model/base';
import { IThemeStyle } from '../chart/model/chart-interface';
import { IAccResizeEventArgs, IAccBeforeResizeEventArgs } from './model/pie-interface';
import { DataManager } from '@syncfusion/ej2-data';
import { Export } from '../chart/print-export/export';
import { ExportUtils } from '../common/utils/export';
/**
 * Represents the AccumulationChart control.
 * ```html
 * <div id="accumulation"/>
 * <script>
 *   var accObj = new AccumulationChart({ });
 *   accObj.appendTo("#accumulation");
 * </script>
 * ```
 *
 * @public
 */
@NotifyPropertyChanges
export class AccumulationChart extends Component<HTMLElement> implements INotifyPropertyChanged {

    // Module declarations

    /**
     * `accBaseModue` is used to define the common functionalities of accumulation series
     *
     * @private
     */
    public accBaseModule: AccumulationBase;

    /**
     * `pieSeriesModule` is used to render pie series.
     *
     * @private
     */
    public pieSeriesModule: PieSeries;

    /**
     * `funnelSeriesModule` is used to render funnel series.
     *
     * @private
     */
    public funnelSeriesModule: FunnelSeries;

    /**
     * `pyramidSeriesModule` is used to render funnel series.
     *
     * @private
     */
    public pyramidSeriesModule: PyramidSeries;

    /**
     * `accumulationLegendModule` is used to manipulate and add legend in accumulation chart.
     */
    public accumulationLegendModule: AccumulationLegend;

    /**
     * `accumulationDataLabelModule` is used to manipulate and add dataLabel in accumulation chart.
     */
    public accumulationDataLabelModule: AccumulationDataLabel;

    /**
     * `accumulationTooltipModule` is used to manipulate and add tooltip in accumulation chart.
     */
    public accumulationTooltipModule: AccumulationTooltip;
    /**
     * `accumulationSelectionModule` is used to manipulate and add selection in accumulation chart.
     */
    public accumulationSelectionModule: AccumulationSelection;

    /**
     * `annotationModule` is used to manipulate and add annotation in chart.
     */
    public annotationModule: AccumulationAnnotation;
    /**
     * Export Module is used to export Accumulation chart.
     */
    public exportModule: Export;

    // Property declarations goes here

    /**
     * The width of the chart as a string in order to provide input as both like '100px' or '100%'.
     * If specified as '100%, chart will render to the full width of its parent element.
     *
     * @default null
     */

    @Property(null)
    public width: string;

    /**
     * The height of the chart as a string in order to provide input as both like '100px' or '100%'.
     * If specified as '100%, chart will render to the full height of its parent element.
     *
     * @default null
     */

    @Property(null)
    public height: string;

    /**
     * Title for accumulation chart
     *
     * @default null
     */
    @Property(null)
    public title: string;

    /**
     * The background image of the chart that accepts value in string as url link or location of an image.
     *
     * @default null
     */
    @Property(null)
    public backgroundImage: string;

    /**
     * Center of pie
     */
    @Complex<PieCenterModel>({}, PieCenter)
    public center: PieCenterModel;

    /**
     * Specifies the dataSource for the AccumulationChart. It can be an array of JSON objects or an instance of DataManager.
     * ```html
     * <div id='Pie'></div>
     * ```
     * ```typescript
     * let dataManager: DataManager = new DataManager({
     *         url: 'http://mvc.syncfusion.com/Services/Northwnd.svc/Tasks/'
     * });
     * let query: Query = new Query().take(50).where('Estimate', 'greaterThan', 0, false);
     * let pie: AccumulationChart = new AccumulationChart({
     * ...
     *     dataSource: dataManager,
     *     series: [{
     *        xName: 'Id',
     *        yName: 'Estimate',
     *        query: query
     *    }],
     * ...
     * });
     * pie.appendTo('#Pie');
     * ```
     *
     * @default ''
     */

    @Property('')
    public dataSource: Object | DataManager;

    /**
     * Options for customizing the `title` of accumulation chart.
     */

    @Complex<FontModel>(Theme.chartTitleFont, Font)
    public titleStyle: FontModel;

    /**
     * SubTitle for accumulation chart
     *
     * @default null
     */
    @Property(null)
    public subTitle: string;

    /**
     * Options for customizing the `subtitle` of accumulation chart.
     */

    @Complex<FontModel>(Theme.chartSubTitleFont, Font)
    public subTitleStyle: FontModel;

    /**
     * Options for customizing the legend of accumulation chart.
     */
    @Complex<LegendSettingsModel>({}, LegendSettings)
    public legendSettings: LegendSettingsModel;

    /**
     * Options for customizing the tooltip of accumulation chart.
     */

    @Complex<TooltipSettingsModel>({}, TooltipSettings)
    public tooltip: TooltipSettingsModel;

    /**
     * Specifies whether point has to get selected or not. Takes value either 'None 'or 'Point'
     *
     * @default None
     */
    @Property('None')
    public selectionMode: AccumulationSelectionMode;

    /**
     * Specifies whether point has to get highlighted or not. Takes value either 'None 'or 'Point'
     *
     * @default None
     */
    @Property('None')
    public highLightMode: AccumulationSelectionMode;

    /**
     * Specifies whether series or data point for accumulation chart has to be selected. They are,
     * * none: sets none as selecting pattern to accumulation chart .
     * * chessboard: sets chess board as selecting pattern accumulation chart .
     * * dots: sets dots as  selecting pattern accumulation chart .
     * * diagonalForward: sets diagonal forward as selecting pattern to accumulation chart .
     * * crosshatch: sets crosshatch as selecting pattern to accumulation chart.
     * * pacman: sets pacman selecting pattern to accumulation chart.
     * * diagonalbackward: sets diagonal backward as selecting pattern to accumulation chart.
     * * grid: sets grid as selecting pattern to accumulation chart.
     * * turquoise: sets turquoise as selecting pattern to accumulation chart.
     * * star: sets star as selecting pattern to accumulation chart.
     * * triangle: sets triangle as selecting pattern to accumulation chart.
     * * circle: sets circle as selecting pattern to accumulation chart.
     * * tile: sets tile as selecting pattern to accumulation chart.
     * * horizontaldash: sets horizontal dash as selecting pattern to accumulation chart.
     * * verticaldash: sets vertical dash as selecting pattern to accumulation chart.
     * * rectangle: sets rectangle as selecting pattern.
     * * box: sets box as selecting pattern to accumulation chart.
     * * verticalstripe: sets vertical stripe as  selecting pattern to accumulation chart.
     * * horizontalstripe: sets horizontal stripe as selecting pattern to accumulation chart.
     * * bubble: sets bubble as selecting pattern to accumulation chart.
     *
     * @default None
     */
    @Property('None')
    public selectionPattern: SelectionPattern;

    /**
     * Specifies whether series or data point has to be selected. They are,
     * * none: sets none as highlighting pattern to accumulation chart.
     * * chessboard: sets chess board as highlighting pattern to accumulation chart.
     * * dots: sets dots as highlighting pattern to accumulation chart.
     * * diagonalForward: sets diagonal forward as highlighting pattern to accumulation chart.
     * * crosshatch: sets crosshatch as highlighting pattern to accumulation chart.
     * * pacman: sets pacman highlighting  pattern to accumulation chart.
     * * diagonalbackward: sets diagonal backward as highlighting pattern to accumulation chart.
     * * grid: sets grid as highlighting pattern to accumulation chart.
     * * turquoise: sets turquoise as highlighting pattern to accumulation chart.
     * * star: sets star as highlighting  pattern to accumulation chart.
     * * triangle: sets triangle as highlighting pattern to accumulation chart.
     * * circle: sets circle as highlighting  pattern to accumulation chart.
     * * tile: sets tile as highlighting pattern to accumulation chart.
     * * horizontaldash: sets horizontal dash as highlighting pattern to accumulation chart.
     * * verticaldash: sets vertical dash as highlighting pattern to accumulation chart.
     * * rectangle: sets rectangle as highlighting  pattern to accumulation chart.
     * * box: sets box as highlighting pattern to accumulation chart.
     * * verticalstripe: sets vertical stripe as highlighting  pattern to accumulation chart.
     * * horizontalstripe: sets horizontal stripe as highlighting  pattern to accumulation chart.
     * * bubble: sets bubble as highlighting  pattern to accumulation chart.
     *
     * @default None
     */
    @Property('None')
    public highlightPattern: SelectionPattern;

    /**
     * If set true, enables the border in pie and accumulation chart while mouse moving.
     *
     * @default true
     */
    @Property(true)
    public enableBorderOnMouseMove: boolean;

    /**
     * If set true, enables the multi selection in accumulation chart. It requires `selectionMode` to be `Point`.
     *
     * @default false
     */
    @Property(false)
    public isMultiSelect: boolean;

    /**
     * If set true, enables the animation for both chart and accumulation.
     *
     * @default true
     */
    @Property(true)
    public enableAnimation: boolean;

    /**
     * Specifies the point indexes to be selected while loading a accumulation chart.
     * It requires `selectionMode` to be `Point`.
     * ```html
     * <div id='Pie'></div>
     * ```
     * ```typescript
     * let pie: AccumulationChart = new AccumulationChart({
     * ...
     *   selectionMode: 'Point',
     *   selectedDataIndexes: [ { series: 0, point: 1},
     *                          { series: 2, point: 3} ],
     * ...
     * });
     * pie.appendTo('#Pie');
     * ```
     *
     * @default []
     */
    @Collection<IndexesModel>([], Indexes)
    public selectedDataIndexes: IndexesModel[];

    /**
     *  Options to customize the left, right, top and bottom margins of accumulation chart.
     */

    @Complex<MarginModel>({}, Margin)
    public margin: MarginModel;

    /**
     * If set true, labels for the point will be placed smartly without overlapping.
     *
     * @default true
     */
    @Property(true)
    public enableSmartLabels: boolean;

    /**
     * Options for customizing the color and width of the chart border.
     */

    @Complex<BorderModel>({ color: '#DDDDDD', width: 0 }, Border)
    public border: BorderModel;

    /**
     * The background color of the chart, which accepts value in hex, rgba as a valid CSS color string.
     *
     * @default null
     */
    @Property(null)
    public background: string;

    /**
     * The configuration for series in accumulation chart.
     */

    @Collection<AccumulationSeriesModel>([{}], AccumulationSeries)
    public series: AccumulationSeriesModel[];

    /**
     * The configuration for annotation in chart.
     */

    @Collection<AccumulationAnnotationSettingsModel>([{}], AccumulationAnnotationSettings)
    public annotations: AccumulationAnnotationSettingsModel[];

    /**
     * Specifies the theme for accumulation chart.
     *
     * @default 'Material'
     */
    @Property('Material')
    public theme: AccumulationTheme;

    /**
     * Specifies whether a grouping separator should be used for a number.
     *
     * @default false
     */
    @Property(false)
    public useGroupingSeparator: boolean;

    /**
     * To enable export feature in chart.
     *
     * @default true
     */
    @Property(true)
    public enableExport: boolean;

    /**
     * To enable export feature in blazor chart.
     *
     * @default false
     */
    @Property(false)
    public allowExport: boolean;

    /**
     * Triggers after accumulation chart loaded.
     *
     * @event
     * @blazorProperty 'Loaded'
     */
    @Event()
    public loaded: EmitType<IAccLoadedEventArgs>;

    /**
     * Triggers before accumulation chart load.
     *
     * @event
     */
    @Event()
    public load: EmitType<IAccLoadedEventArgs>;

    /**
     * Triggers before the series gets rendered.
     *
     * @event
     * @deprecated
     */
    @Event()
    public seriesRender: EmitType<IAccSeriesRenderEventArgs>;

    /**
     * Triggers before the legend gets rendered.
     *
     * @event
     * @deprecated
     */
    @Event()
    public legendRender: EmitType<ILegendRenderEventArgs>;

    /**
     * Triggers before the data label for series gets rendered.
     *
     * @event
     * @deprecated
     */
    @Event()
    public textRender: EmitType<IAccTextRenderEventArgs>;

    /**
     * Triggers before the tooltip for series gets rendered.
     *
     * @event
     */
    @Event()
    public tooltipRender: EmitType<ITooltipRenderEventArgs>;

    /**
     * Triggers before each points for series gets rendered.
     *
     * @event
     * @deprecated
     */

    @Event()
    public pointRender: EmitType<IAccPointRenderEventArgs>;

    /**
     * Triggers before the annotation gets rendered.
     *
     * @event
     * @deprecated
     */

    @Event()
    public annotationRender: EmitType<IAnnotationRenderEventArgs>;

    /**
     * Triggers before the prints gets started.
     *
     * @event
     * @blazorProperty 'OnPrint'
     */

    @Event()
    public beforePrint: EmitType<IPrintEventArgs>;

    /**
     * Triggers on hovering the accumulation chart.
     *
     * @event
     * @blazorProperty 'OnChartMouseMove'
     */

    @Event()
    public chartMouseMove: EmitType<IMouseEventArgs>;

    /**
     * Triggers on clicking the accumulation chart.
     *
     * @event
     * @blazorProperty 'OnChartMouseClick'
     */

    @Event()
    public chartMouseClick: EmitType<IMouseEventArgs>;

    /**
     * Triggers on point click.
     *
     * @event
     * @blazorProperty 'OnPointClick'
     */

    @Event()
    public pointClick: EmitType<IPointEventArgs>;

    /**
     * Triggers on point move.
     *
     * @event
     * @blazorProperty 'PointMoved'
     */

    @Event()
    public pointMove: EmitType<IPointEventArgs>;

    /**
     * Triggers after animation gets completed for series.
     *
     * @event
     * @blazorProperty 'OnAnimationComplete'
     */
    @Event()
    public animationComplete: EmitType<IAccAnimationCompleteEventArgs>;

    /**
     * Triggers on mouse down.
     *
     * @event
     * @blazorProperty 'OnChartMouseDown'
     */

    @Event()
    public chartMouseDown: EmitType<IMouseEventArgs>;

    /**
     * Triggers while cursor leaves the accumulation chart.
     *
     * @event
     * @blazorProperty 'OnChartMouseLeave'
     */

    @Event()
    public chartMouseLeave: EmitType<IMouseEventArgs>;

    /**
     * Triggers on mouse up.
     *
     * @event
     * @blazorProperty 'OnChartMouseUp'
     */

    @Event()
    public chartMouseUp: EmitType<IMouseEventArgs>;

    /**
     * Triggers before window resize.
     * @event
     * @blazorProperty 'BeforeResize'
     */
    @Event()
    public beforeResize: EmitType<IAccBeforeResizeEventArgs>;

    /**
     * Triggers after window resize.
     *
     * @event
     * @blazorProperty 'Resized'
     */

    @Event()
    public resized: EmitType<IAccResizeEventArgs>;

    /**
     * Triggers after the export completed.
     *
     * @event
     * @blazorProperty 'AfterExport'
     */
    @Event()
    public afterExport: EmitType<IAfterExportEventArgs>;

    /**
     * Defines the currencyCode format of the accumulation chart
     *
     * @private
     * @aspType string
     */

    @Property('USD')
    private currencyCode: string;

    /**
     * Animate the series bounds on data change.
     *
     * @private
     */
    public animate(duration?: number): void {
        this.duration = duration ? duration : 700;
        this.animateselected = true;
        this.animateSeries = false;
        let temIndex: number = 0;
        const tempcolor: string[] = [];
        const tempindex: number[] = [];
        const tempindex1: number[] = [];
        const currentSeries: AccumulationSeries = this.visibleSeries[0];
        let datasource: object[] = [];
        datasource = currentSeries.dataSource as Object[];
        currentSeries.sumOfPoints = 0;
        if (currentSeries.points.length < Object.keys(currentSeries.dataSource).length) {
            this.refresh();
        } else if (currentSeries.points.length > Object.keys(currentSeries.dataSource).length) {
            const currentSeries: AccumulationSeries = this.visibleSeries[0];
            currentSeries.points = currentSeries.points.filter((entry1: AccPoints) => {
                entry1.visible = false;
                tempindex.push(entry1.index);
                tempcolor.push(entry1.color);
                return (datasource).some((entry2: AccPoints) => {
                    const accPoint: AccPoints = entry2 as AccPoints;
                    if (entry1.x === accPoint.x) {
                        entry1.visible = true;
                        tempindex1.push(entry1.index);
                        entry1.index = temIndex;
                        temIndex++;
                    }
                    return entry1.x === accPoint.x;
                });
            });
            const missing: number[] = tempindex.filter((item: number) => tempindex1.indexOf(item) < 0);
            const interval: number = tempindex.length - missing.length;
            for (let i: number = (tempindex.length - 1); i >= interval; i--) {
                removeElement('container_Series_0_Point_' + tempindex[i]);
            }
            for (let i: number = 0; i < currentSeries.points.length; i++) {
                currentSeries.points[i].y = currentSeries.dataSource[i].y;
                currentSeries.points[i].color = tempcolor[i];
                currentSeries.sumOfPoints += currentSeries.dataSource[i].y;
            }
            this.redraw = this.enableAnimation;
            this.animateSeries = false;
            this.calculateBounds();
            this.renderElements();
        } else {
            for (let i: number = 0; i < currentSeries.points.length; i++) {
                currentSeries.points[i].y = currentSeries.dataSource[i][currentSeries.yName];
                currentSeries.points[i].color = currentSeries.dataSource[i][currentSeries.pointColorMapping] != null
                    ? currentSeries.dataSource[i][currentSeries.pointColorMapping] : currentSeries.points[i].color;
                currentSeries.sumOfPoints += currentSeries.dataSource[i][currentSeries.yName];
            }
            this.redraw = this.enableAnimation;
            this.animateSeries = false;
            this.removeSvg();
            this.refreshPoints(currentSeries.points);
            this.renderElements();
        }
    }

    // internal properties for Accumulation charts
    /** @private */
    public svgObject: Element;
    /** @private */
    private animateselected: boolean = false;
    /** @public */
    public duration: number;
    /** @private */
    public initialClipRect: Rect;
    /** @private */
    public availableSize: Size;
    /** @private */
    public renderer: SvgRenderer | CanvasRenderer;
    /** @private */
    public intl: Internationalization;
    /** @private */
    public visibleSeries: AccumulationSeries[];
    /** @private */
    public seriesCounts: number;
    /** @private */
    public explodeDistance: number = 0;
    /** @private */
    public mouseX: number;
    /** @private */
    public mouseY: number;
    private resizeTo: number;
    /** @private */
    public origin: ChartLocation;
    /** @private */
    public get type(): AccumulationType {
        if (this.series && this.series.length) {
            return this.series[0].type;
        }
        return 'Pie';
    }
    /** @private */
    public isTouch: boolean;
    /** @private */
    public redraw: boolean;
    /** @private */
    public animateSeries: boolean;
    private titleCollection: string[];
    private subTitleCollection: string[];
    /** @private */
    public themeStyle: IThemeStyle;
    private chartid: number = 57724;
    /** @private */
    public isBlazor: boolean;
    /**
     * Constructor for creating the AccumulationChart widget
     *
     * @private
     */
    constructor(options?: AccumulationChartModel, element?: string | HTMLElement) {
        super(options, element);
    }

    // accumulation chart methods
    /**
     *  To create svg object, renderer and binding events for the container.
     */
    protected preRender(): void {
        const blazor: string = 'Blazor';
        this.isBlazor = window[blazor];
        this.allowServerDataBinding = false;

        this.unWireEvents();
        this.setCulture();
        this.animateSeries = true;
        if (this.element.id === '') {
            const collection: number = document.getElementsByClassName('e-accumulationchart').length;
            this.element.id = 'acc_chart_' + this.chartid + '_' + collection;
        }
        calculateSize(this);
        this.wireEvents();
    }
    /**
     * Themeing for chart goes here
     */

    private setTheme(): void {
        /*! Set theme for accumulation chart */
        this.themeStyle = getThemeColor(this.theme);
    }
    /**
     * To render the accumulation chart elements
     */
    protected render(): void {
        if (this.element.className.indexOf('e-accumulationchart') === -1) {
            this.element.classList.add('e-accumulationchart');
        }
        const loadEventData: IAccLoadedEventArgs = {
            chart: this.isBlazor ? {} as AccumulationChart : this,
            accumulation: this.isBlazor ? {} as AccumulationChart : this,
            theme: this.theme, name: load, cancel: false
        };
        this.trigger(load, loadEventData, () => {

            this.theme = this.isBlazor ? loadEventData.theme : this.theme;
            this.setTheme();

            this.accBaseModule = new AccumulationBase(this);
            this.pieSeriesModule = new PieSeries(this);

            this.calculateVisibleSeries();

            this.processData();

            this.renderComplete();

            this.allowServerDataBinding = true;
        });

    }
    /**
     * Method to unbind events for accumulation chart
     */

    private unWireEvents(): void {
        /*! Find the Events type */
        const isIE11Pointer: Boolean = Browser.isPointer;

        const start: string = Browser.touchStartEvent;
        const move: string = Browser.touchMoveEvent;
        const stop: string = Browser.touchEndEvent;
        const cancel: string = isIE11Pointer ? 'pointerleave' : 'mouseleave';
        /*! UnBind the Event handler */

        EventHandler.remove(this.element, move, this.accumulationMouseMove);
        EventHandler.remove(this.element, stop, this.accumulationMouseEnd);
        EventHandler.remove(this.element, start, this.accumulationMouseStart);
        EventHandler.remove(this.element, 'click', this.accumulationOnMouseClick);
        EventHandler.remove(this.element, 'contextmenu', this.accumulationRightClick);
        EventHandler.remove(this.element, cancel, this.accumulationMouseLeave);
        window.removeEventListener(
            (Browser.isTouch && ('orientation' in window && 'onorientationchange' in window)) ? 'orientationchange' : 'resize',
            this.accumulationResize
        );
    }
    /**
     * Method to bind events for the accumulation chart
     */
    private wireEvents(): void {
        /**
         * To fix react timeout destroy issue.
         */
        if (!this.element) {
            return;
        }
        /*! Find the Events type */

        const isIE11Pointer: Boolean = Browser.isPointer;
        const start: string = Browser.touchStartEvent;
        const stop: string = Browser.touchEndEvent;
        const move: string = Browser.touchMoveEvent;
        const cancel: string = isIE11Pointer ? 'pointerleave' : 'mouseleave';

        /*! Bind the Event handler */
        EventHandler.add(this.element, move, this.accumulationMouseMove, this);
        EventHandler.add(this.element, stop, this.accumulationMouseEnd, this);
        EventHandler.add(this.element, start, this.accumulationMouseStart, this);
        EventHandler.add(this.element, 'click', this.accumulationOnMouseClick, this);
        EventHandler.add(this.element, 'contextmenu', this.accumulationRightClick, this);
        EventHandler.add(this.element, cancel, this.accumulationMouseLeave, this);

        window.addEventListener(
            (Browser.isTouch && ('orientation' in window && 'onorientationchange' in window)) ? 'orientationchange' : 'resize',
            this.accumulationResize.bind(this)
        );
        new Touch(this.element); // To avoid geasture blocking for browser
        /*! Apply the style for chart */
        this.setStyle(<HTMLElement>this.element);
    }
    /**
     * Method to set mouse x, y from events
     */
    private setMouseXY(e: PointerEvent): void {
        let pageX: number;
        let pageY: number;
        const svgRectElement: Element = getElement(this.element.id + '_svg');
        if (svgRectElement && this.element) {
            const svgRect: ClientRect = svgRectElement.getBoundingClientRect();
            const rect: ClientRect = this.element.getBoundingClientRect();
            if (e.type.indexOf('touch') > -1) {
                this.isTouch = true;
                const touchArg: TouchEvent = <TouchEvent & PointerEvent>e;
                pageY = touchArg.changedTouches[0].clientY;
                pageX = touchArg.changedTouches[0].clientX;
            } else {
                this.isTouch = e.pointerType === 'touch' || e.pointerType === '2';
                pageX = e.clientX;
                pageY = e.clientY;
            }
            this.mouseY = (pageY - rect.top) - Math.max(svgRect.top - rect.top, 0);
            this.mouseX = (pageX - rect.left) - Math.max(svgRect.left - rect.left, 0);
        }
    }
    /**
     * Handles the mouse end.
     *
     * @returns {boolean} Mouse end of accumulation chart.
     * @private
     */
    public accumulationMouseEnd(e: PointerEvent): boolean {
        this.setMouseXY(e);
        this.trigger(chartMouseUp, { target: (<Element>e.target).id, x: this.mouseX, y: this.mouseY });
        if (this.isTouch) {
            this.titleTooltip(e, this.mouseX, this.mouseY, this.isTouch);
            if (this.accumulationDataLabelModule && this.visibleSeries[0].dataLabel.visible) {
                this.accumulationDataLabelModule.move(e, this.mouseX, this.mouseY, this.isTouch);
            }
            if (this.accumulationLegendModule && this.legendSettings.visible) {
                this.accumulationLegendModule.move(e);
            }
        }
        this.notify(Browser.touchEndEvent, e);
        return false;
    }

    /*public removeSvgOffset(x: number, y: number): ChartLocation {
        let rect: ClientRect = this.element.getBoundingClientRect();
        let svgRect: ClientRect = getElement(this.element.id + '_svg').getBoundingClientRect();
        return { x: (x - rect.left) - Math.max(svgRect.left - rect.left, 0), y: (y - rect.top) - Math.max(svgRect.top - rect.top, 0)};
    }*/

    /**
     * Handles the mouse start.
     *
     * @returns {boolean} Mouse start of accumulation chart.
     * @private
     */
    public accumulationMouseStart(e: PointerEvent): boolean {
        this.setMouseXY(e);
        this.trigger(chartMouseDown, { target: (<Element>e.target).id, x: this.mouseX, y: this.mouseY });
        return false;
    }
    /**
     * Handles the accumulation chart resize.
     *
     * @returns {boolean} Resize method of accumulation chart.
     * @private
     */
    public accumulationResize(): boolean {
        this.animateSeries = false;
        const args: IAccResizeEventArgs = {
            accumulation: this.isBlazor ? {} as AccumulationChart : this,
            previousSize: new Size(
                this.availableSize.width,
                this.availableSize.height
            ),
            name: resized,
            currentSize: new Size(0, 0),
            chart: this.isBlazor ? {} as AccumulationChart : this
        };
        let beforeResizeArgs: IAccBeforeResizeEventArgs = { name: 'beforeResize', cancelResizedEvent: false };
        if (this.resizeTo) {
            clearTimeout(this.resizeTo);
        }
        this.trigger(beforeResize, beforeResizeArgs);
        if (!beforeResizeArgs.cancelResizedEvent) {
            this.resizeTo = +setTimeout(
                (): void => {
                    if (this.isDestroyed) {
                        clearTimeout(this.resizeTo);
                        return;
                    }
                    calculateSize(this);
                    args.currentSize = this.availableSize;
                    this.trigger(resized, args);
                    this.refreshSeries();
                    this.refreshChart();
                },
                500);
        }
        return false;
    }

    /**
     * Handles the print method for accumulation chart control.
     */
    public print(id?: string[] | string | Element): void {
        // To handle the print funtion in IE and Edge browsers
        const clippath: string = document.getElementById(this.element.id + '_Series_0').style.clipPath;
        document.getElementById(this.element.id + '_Series_0').style.clipPath = '';
        const exportChart: ExportUtils = new ExportUtils(this);
        exportChart.print(id);
        document.getElementById(this.element.id + '_Series_0').style.clipPath = clippath;
    }

    /**
     * Export method for the chart.
     */
    public export(type: ExportType, fileName: string): void {
        if (this.exportModule) {
            this.exportModule.export(type, fileName);
            if (this.afterExport) {
                this.exportModule.getDataUrl(this);
            }
        }
    }

    /**
     * Applying styles for accumulation chart element
     */
    private setStyle(element: HTMLElement): void {
        element.style.touchAction = 'element';
        element.style.msTouchAction = 'element';
        element.style.msContentZooming = 'none';
        element.style.msUserSelect = 'none';
        element.style.webkitUserSelect = 'none';
        element.style.position = 'relative';
        element.style.display = 'block';
    }

    /**
     * Method to set the annotation content dynamically for accumulation.
     */
    public setAnnotationValue(annotationIndex: number, content: string): void {
        const annotation: AccumulationAnnotationSettings = <AccumulationAnnotationSettings>this.annotations[annotationIndex];
        let element: HTMLElement;
        const parentNode: Element = getElement(this.element.id + '_Annotation_Collections');
        if (content) {
            annotation.content = content;
            if (parentNode) {
                element = this.createElement('div');
                removeElement(this.element.id + '_Annotation_' + annotationIndex);
                this.annotationModule.processAnnotation(
                    annotation, annotationIndex, element
                );
                parentNode.appendChild(element.children[0]);
            } else {
                this.annotationModule.renderAnnotations(
                    getElement(this.element.id + '_Secondary_Element')
                );
            }
        }
    }

    /**
     * Handles the mouse move on accumulation chart.
     *
     * @returns {boolean} Mouse move of accumulation chart.
     * @private
     */
    public accumulationMouseMove(e: PointerEvent): boolean {
        if (!getElement(this.element.id + '_svg')) {
            return false;
        }
        this.setMouseXY(e);
        this.trigger(chartMouseMove, { target: (<Element>e.target).id, x: this.mouseX, y: this.mouseY });
        if (this.pointMove) {
            this.triggerPointEvent(pointMove, <Element>e.target, e);
        }
        if (this.accumulationLegendModule && this.legendSettings.visible) {
            this.accumulationLegendModule.move(e);
        }
        if (this.accumulationDataLabelModule && this.visibleSeries[0] && this.visibleSeries[0].dataLabel.visible) {
            this.accumulationDataLabelModule.move(e, this.mouseX, this.mouseY);
        }
        if (!this.isTouch) {
            this.titleTooltip(e, this.mouseX, this.mouseY);
        }
        if (this.enableBorderOnMouseMove && this.type === 'Pie' && this.pieSeriesModule &&
            withInBounds(this.mouseX, this.mouseY, this.initialClipRect)) {
            this.pieSeriesModule.findSeries(e);
        }
        this.notify(Browser.touchMoveEvent, e);

        return false;
    }
    public titleTooltip(event: Event, x: number, y: number, isTouch?: boolean): void {
        const targetId: string = (<HTMLElement>event.target).id;
        const id: boolean = (targetId === (this.element.id + '_title') || targetId === (this.element.id + '_subTitle') ||
            targetId === (this.element.id + '_chart_legend_title'));
        if (((<HTMLElement>event.target).textContent.indexOf('...') > -1) && id) {
            const title: string = (targetId === (this.element.id + '_title')) ?
                this.title : (targetId === (this.element.id + '_subTitle')) ? this.subTitle : this.legendSettings.title;
            showTooltip(
                title, x, y, this.element.offsetWidth, this.element.id + '_EJ2_Title_Tooltip',
                getElement(this.element.id + '_Secondary_Element'),
                isTouch
            );
        } else {
            removeElement(this.element.id + '_EJ2_Title_Tooltip');
        }
    }

    /**
     * Handles the mouse click on accumulation chart.
     *
     * @returns {boolean} Mouse click of accumulation chart.
     * @private
     */
    public accumulationOnMouseClick(e: PointerEvent): boolean {
        this.setMouseXY(e);
        if (this.accumulationLegendModule && this.legendSettings.visible) {
            this.accumulationLegendModule.click(e);
        }
        if (this.selectionMode !== 'None' && this.accumulationSelectionModule) {
            this.accumulationSelectionModule.calculateSelectedElements(this, e);
        }
        if (this.visibleSeries[0].explode) {
            this.accBaseModule.processExplode(e);
        }
        if (this.enableBorderOnMouseMove && this.pieSeriesModule && this.type === 'Pie') {
            this.pieSeriesModule.findSeries(e);
        }
        this.trigger(chartMouseClick, { target: (<Element>e.target).id, x: this.mouseX, y: this.mouseY });
        if (this.pointClick) {
            this.triggerPointEvent(pointClick, <Element>e.target, e);
        }
        return false;
    }

    private triggerPointEvent(event: string, element: Element, e?: PointerEvent | TouchEvent): void {
        const evt: PointerEvent = e as PointerEvent;
        const indexes: Index = indexFinder(element.id, true);
        if (indexes.series >= 0 && indexes.point >= 0) {
            this.trigger(event, {
                series: this.isBlazor ? {} : this.series[indexes.series],
                point: (<AccumulationSeries>this.series[indexes.series]).points[indexes.point],
                seriesIndex: indexes.series, pointIndex: indexes.point,
                x: this.mouseX, y: this.mouseY, pageX: evt.pageX, pageY: evt.pageY
            });
        }
    }

    /**
     * Handles the mouse right click on accumulation chart.
     *
     * @returns {boolean} Right click of accumulation chart.
     * @private
     */
    public accumulationRightClick(event: MouseEvent | PointerEvent): boolean {
        if (event.buttons === 2 || (<PointerEvent>event).pointerType === 'touch') {
            event.preventDefault();
            event.stopPropagation();
            return false;
        }
        return true;
    }

    /**
     * Handles the mouse leave on accumulation chart.
     *
     * @returns {boolean} Mouse leave of accumulation chart.
     * @private
     */
    public accumulationMouseLeave(e: PointerEvent): boolean {
        this.setMouseXY(e);
        this.trigger(chartMouseLeave, { target: (<Element>e.target).id, x: this.mouseX, y: this.mouseY });
        this.notify(Browser.isPointer ? 'pointerleave' : 'mouseleave', e);
        let borderElement: Element = document.getElementById(this.element.id + 'PointHover_Border');
        if (borderElement) {
            this.pieSeriesModule.removeBorder(borderElement, 1000);
            borderElement = null;
        }
        return false;
    }

    /**
     * Method to set culture for chart
     */
    private setCulture(): void {
        this.intl = new Internationalization();
    }

    /**
     * Method to create SVG element for accumulation chart.
     */
    private createPieSvg(): void {
        this.removeSvg();
        createSvg(this);
    }
    /**
     * To Remove the SVG from accumulation chart.
     *
     * @returns {boolean} Remove svg.
     * @private
     */
    public removeSvg(): void {
        if (this.redraw) {
            return null;
        }
        blazorTemplatesReset(this);
        removeElement(this.element.id + '_Secondary_Element');
        if (this.svgObject) {
            while (this.svgObject.childNodes.length > 0) {
                this.svgObject.removeChild(this.svgObject.firstChild);
            }
            if (!this.svgObject.hasChildNodes() && this.svgObject.parentNode) {
                remove(this.svgObject);
            }
        }
        removeElement('EJ2_legend_tooltip');
        removeElement('EJ2_datalabel_tooltip');
        removeElement(this.element.id + 'PointHover_Border');
    }
    /**
     * Method to create the secondary element for tooltip, datalabel and annotaitons.
     */
    private createSecondaryElement(): void {
        const element: Element = redrawElement(this.redraw, this.element.id + '_Secondary_Element') ||
            this.createElement('div', {
                id: this.element.id + '_Secondary_Element',
                styles: 'position: relative'
            });
        appendChildElement(false, this.element, element, this.redraw);
    }

    /**
     * Method to find visible series based on series types
     */
    private calculateVisibleSeries(): void {
        this.visibleSeries = [];
        for (let i: number = 0, length: number = this.series.length; i < length; i++) {
            (this.series[i] as AccumulationSeries).index = i;
            if (this.series[i].type === this.type && this.visibleSeries.length === 0) {
                this.visibleSeries.push(this.series[i] as AccumulationSeries);
                break;
            }
        }
    }
    /**
     * To find points from dataSource
     */
    private processData(render: boolean = true): void {
        this.seriesCounts = 0;
        for (const series of this.visibleSeries) {
            series.dataModule = new Data(series.dataSource || this.dataSource, series.query);
            series.refreshDataManager(this, render);
        }
    }
    /**
     * To refresh the accumulation chart
     *
     * @private
     */
    public refreshChart(): void {
        this.doGrouppingProcess();
        this.createPieSvg();
        this.calculateBounds();
        this.renderElements();
        removeElement('chartmeasuretext');
    }
    /**
     * Method to find groupped points
     */
    private doGrouppingProcess(): void {
        const series: AccumulationSeries = this.visibleSeries[0];
        if (!isNullOrUndefined(series.resultData) && ((!isNullOrUndefined(series.lastGroupTo) &&
            series.lastGroupTo !== series.groupTo))) {
            series.getPoints(series.resultData, this);
        }
    }
    /**
     * Method to calculate bounds for accumulation chart
     */
    private calculateBounds(): void {
        this.initialClipRect = new Rect(this.margin.left, this.margin.top, this.availableSize.width, this.availableSize.height);
        this.titleCollection = [];
        this.subTitleCollection = [];
        let titleHeight: number = 0;
        let subTitleHeight: number = 0;
        let maxWidth: number = 0;
        let titleWidth: number = 0;
        this.titleCollection = getTitle(this.title, this.titleStyle, this.initialClipRect.width);
        titleHeight = this.title ? measureText(this.title, this.titleStyle).height * this.titleCollection.length : titleHeight;
        if (this.subTitle) {
            for (const titleText of this.titleCollection) {
                titleWidth = measureText(titleText, this.titleStyle).width;
                maxWidth = titleWidth > maxWidth ? titleWidth : maxWidth;
            }
            this.subTitleCollection = getTitle(this.subTitle, this.subTitleStyle, maxWidth);
            subTitleHeight = (measureText(this.subTitle, this.subTitleStyle).height * this.subTitleCollection.length);
        }
        subtractRect(
            this.initialClipRect,
            new Rect(
                0, (subTitleHeight + titleHeight),
                this.margin.right + this.margin.left, this.margin.bottom + this.margin.top
            )
        );
        this.calculateLegendBounds();

    }
    /*
     * Method to calculate legend bounds for accumulation chart
     */
    private calculateLegendBounds(): void {
        if (!this.accumulationLegendModule || !this.legendSettings.visible) {
            return null;
        }
        this.accumulationLegendModule.getLegendOptions(this, <AccumulationSeries[]>this.visibleSeries);
        this.accumulationLegendModule.calculateLegendBounds(this.initialClipRect, this.availableSize, null);
    }
    /**
     * To render elements for accumulation chart
     *
     * @private
     */
    public renderElements(): void {

        this.renderBorder();

        this.createSecondaryElement();

        this.renderSeries();

        this.renderTitle();

        this.renderLegend();

        appendChildElement(false, this.element, this.svgObject, this.redraw);

        this.processSelection();

        this.processExplode();

        this.renderAnnotation();

        this.setSecondaryElementPosition();

        updateBlazorTemplate(this.element.id + '_DataLabel', 'Template', this.series[0].dataLabel);

        this.trigger('loaded', { accumulation: this.isBlazor ? {} : this, chart: this.isBlazor ? {} : this });

        this.animateSeries = false;
    }
    /**
     * To set the left and top position for data label template for center aligned chart
     *
     * @private
     */
    public setSecondaryElementPosition(): void {
        const tooltipParent: HTMLDivElement = getElement(this.element.id + '_Secondary_Element') as HTMLDivElement;
        if (!tooltipParent) {
            return;
        }
        const rect: ClientRect = this.element.getBoundingClientRect();
        const svgRect: ClientRect = getElement(this.element.id + '_svg').getBoundingClientRect();
        tooltipParent.style.left = Math.max(svgRect.left - rect.left, 0) + 'px';
        tooltipParent.style.top = Math.max(svgRect.top - rect.top, 0) + 'px';
    }

    /**
     * To render the annotaitions for accumulation series.
     *
     * @private
     */
    public renderAnnotation(): void {
        if (this.annotationModule) {
            this.annotationModule.renderAnnotations(
                getElement(this.element.id + '_Secondary_Element')
            );
        }
    }
    /**
     * Method to process the explode in accumulation chart
     *
     * @private
     */
    public processExplode(): void {
        if (this.redraw) {
            return null;
        }
        if (!this.visibleSeries[0].explode) {
            return null;
        }
        this.accBaseModule.invokeExplode();
    }
    /**
     * Method to render series for accumulation chart
     */
    private renderSeries(): void {
        if (!this.redraw) {
            this.svgObject.appendChild(this.renderer.createGroup({ id: this.element.id + '_SeriesCollection' }));
        }
        for (const series of this.visibleSeries) {
            if (series.visible && this[(firstToLowerCase(series.type) + 'SeriesModule')]) {
                this[(firstToLowerCase(series.type) + 'SeriesModule')].initProperties(this, series);
                series.renderSeries(this, this.redraw);
            }
        }
    }

    /**
     * Method to render border for accumulation chart
     */
    private renderBorder(): void {
        const padding: number = this.border.width;
        appendChildElement(
            false, this.svgObject, this.renderer.drawRectangle(new RectOption(
                this.element.id + '_border', this.background || this.themeStyle.background, this.border, 1,
                new Rect(padding / 2, padding / 2, this.availableSize.width - padding, this.availableSize.height - padding))
            ),
            this.redraw
        );
        // to draw back ground image for accumulation chart
        const backGroundImage: string = this.backgroundImage;
        if (backGroundImage) {
            const image: ImageOption = new ImageOption(
                this.availableSize.height - padding,
                this.availableSize.width - padding,
                backGroundImage, 0, 0,
                this.element.id + '_background',
                'visible', 'none'
            );
            appendChildElement(false, this.svgObject, this.renderer.drawImage(image) as HTMLElement, this.redraw);
        }
    }
    /**
     * Method to render legend for accumulation chart
     */
    private renderLegend(): void {
        if (!this.accumulationLegendModule || !this.legendSettings.visible) {
            return null;
        }
        if (this.accumulationLegendModule.legendCollections.length) {
            if (this.visibleSeries[0].type === 'Pie') {
                this.accumulationLegendModule.getSmartLegendLocation(
                    this.visibleSeries[0].labelBound, this.accumulationLegendModule.legendBounds, this.margin);
            }
            this.accumulationLegendModule.renderLegend(
                this, this.legendSettings, this.accumulationLegendModule.legendBounds, this.redraw);
        }
    }
    /**
     * To process the selection in accumulation chart
     *
     * @private
     */
    public processSelection(): void {
        if (!this.accumulationSelectionModule || this.selectionMode === 'None') {
            return null;
        }
        const selectedDataIndexes: Indexes[] = <Indexes[]>extend([], this.accumulationSelectionModule.selectedDataIndexes, null, true);
        this.accumulationSelectionModule.invokeSelection(this);
        if (selectedDataIndexes.length > 0) {
            this.accumulationSelectionModule.selectedDataIndexes = selectedDataIndexes;
            this.accumulationSelectionModule.redrawSelection(this);
        }
    }
    /**
     * To render title for accumulation chart
     */
    private renderTitle(): void {
        const margin: MarginModel = this.margin;
        if (!this.title) {
            return null;
        }
        const alignment: Alignment = this.titleStyle.textAlignment;
        const getAnchor: string = alignment === 'Near' ? 'start' : alignment === 'Far' ? 'end' : 'middle';
        const titleSize: Size = measureText(this.title, this.titleStyle);
        const rect: Rect = new Rect(
            margin.left, 0, this.availableSize.width - margin.left - margin.right, 0
        );
        const options: TextOption = new TextOption(
            this.element.id + '_title',
            titlePositionX(
                rect, this.titleStyle
            ),
            this.margin.top + (titleSize.height * 3 / 4),
            getAnchor, this.titleCollection, '', 'auto'
        );
        const element: Element = textElement(
            this.renderer, options, this.titleStyle, this.titleStyle.color || this.themeStyle.chartTitle, this.svgObject, false, this.redraw
        );
        if (element) {
            element.setAttribute('aria-label', this.title);
        }
        if (this.subTitle) {
            this.renderSubTitle(options);
        }
    }
    private renderSubTitle(options: TextOption): void {
        let maxWidth: number = 0;
        let titleWidth: number = 0;
        const padding: number = 10;
        const alignment: Alignment = this.titleStyle.textAlignment;
        const getAnchor: Function = (alignment: Alignment): string => {
            return alignment === 'Near' ? 'start' : alignment === 'Far' ? 'end' : 'middle';
        };
        const subTitleElementSize: Size = measureText(this.subTitle, this.subTitleStyle);
        for (const titleText of this.titleCollection) {
            titleWidth = measureText(titleText, this.titleStyle).width;
            maxWidth = titleWidth > maxWidth ? titleWidth : maxWidth;
        }
        const rect: Rect = new Rect(
            alignment === 'Center' ? (options.x - maxWidth / 2) : alignment === 'Far' ? options.x - maxWidth : options.x,
            0, maxWidth, 0
        );
        const subTitleOption: TextOption = new TextOption(
            this.element.id + '_subTitle',
            titlePositionX(
                rect, this.subTitleStyle
            ),
            options.y * options.text.length + ((subTitleElementSize.height) * 3 / 4) + padding,
            getAnchor(this.subTitleStyle.textAlignment), this.subTitleCollection, '', 'auto'
        );
        textElement(this.renderer, subTitleOption, this.subTitleStyle, this.subTitleStyle.color || this.themeStyle.chartTitle,
                    this.svgObject, false, this.redraw);
    }
    /**
     * To get the series parent element
     *
     * @private
     */
    public getSeriesElement(): Element {
        return this.svgObject.getElementsByTagName('g')[0];
    }
    /**
     * To refresh the all visible series points
     *
     * @private
     */
    public refreshSeries(): void {
        for (const series of this.visibleSeries) {
            this.refreshPoints(series.points);
        }
    }
    /**
     * To refresh points label region and visible
     *
     * @private
     */
    public refreshPoints(points: AccPoints[]): void {
        for (const point of points) {
            point.labelPosition = null;
            point.labelRegion = null;
            point.labelVisible = true;
        }
    }
    /**
     * To get Module name
     *
     *  @private
     */
    public getModuleName(): string {
        return 'accumulationchart';
    }
    /**
     * To destroy the accumulationcharts
     *
     * @private
     */
    public destroy(): void {
        /**
         * To fix react timeout destroy issue.
         */
        if (this.element) {
            this.unWireEvents();
            super.destroy();
            this.element.classList.remove('e-accumulationchart');
            this.element.innerHTML = '';
        }
    }
    /**
     * To provide the array of modules needed for control rendering
     *
     * @returns {ModuleDeclaration[]} required modules
     * @private
     */
    public requiredModules(): ModuleDeclaration[] {
        const modules: ModuleDeclaration[] = [];
        let enableAnnotation: boolean = false;
        modules.push({
            member: this.type + 'Series',
            args: [this]
        });

        if (this.legendSettings.visible) {
            modules.push({
                member: 'AccumulationLegend',
                args: [this]
            });
        }
        if (this.findDatalabelVisibility()) {
            modules.push({
                member: 'AccumulationDataLabel',
                args: [this]
            });
        }
        if (this.tooltip.enable) {
            modules.push({
                member: 'AccumulationTooltip',
                args: [this]
            });
        }
        if (this.selectionMode !== 'None') {
            modules.push({
                member: 'AccumulationSelection',
                args: [this]
            });
        }
        if (this.enableExport || this.allowExport) {
            modules.push({
                member: 'Export',
                args: [this]
            });
        }
        enableAnnotation = this.annotations.some((value: AccumulationAnnotationSettings) => {
            return (value.content !== null);
        });
        if (enableAnnotation) {
            modules.push({
                member: 'Annotation',
                args: [this]
            });
        }
        return modules;
    }
    /**
     * To find datalabel visibility in series
     */
    private findDatalabelVisibility(): boolean {
        for (const series of this.series) {
            if (series.dataLabel.visible) {
                return true;
            }
        }
        return false;
    }
    /**
     * Get visible series for accumulation chart by index
     */
    private changeVisibleSeries(visibleSeries: AccumulationSeries[], index: number): AccumulationSeries {
        for (const series of visibleSeries) {
            if (index === series.index) {
                return series;
            }
        }
        return null;
    }
    /**
     * Get the properties to be maintained in the persisted state.
     *
     * @private
     */
    public getPersistData(): string {
        return '';
    }
    /**
     * Called internally if any of the property value changed.
     *
     * @private
     */
    public onPropertyChanged(newProp: AccumulationChartModel, oldProp: AccumulationChartModel): void {
        const update: { refreshElements: boolean, refreshBounds: boolean } = {
            refreshElements: false, refreshBounds: false
        };
        for (const prop of Object.keys(newProp)) {
            switch (prop) {
            case 'theme':
                this.animateSeries = true;
                break;
            case 'title':
            case 'subTitle':
            case 'height':
            case 'width':
            case 'margin':
                update.refreshBounds = true;
                break;
            case 'titleStyle':
                if (newProp.titleStyle && (newProp.titleStyle.size || newProp.titleStyle.textOverflow)) {
                    update.refreshBounds = true;
                } else {
                    update.refreshElements = true;
                }
                break;
            case 'subTitleStyle':
                if (newProp.subTitleStyle && (newProp.subTitleStyle.size || newProp.subTitleStyle.textOverflow)) {
                    update.refreshBounds = true;
                } else {
                    update.refreshElements = true;
                }
                break;
            case 'legendSettings':
                update.refreshBounds = true;
                update.refreshElements = true;
                break;
            case 'dataSource':
                this.processData(false);
                update.refreshBounds = true;
                break;
            case 'series':
                if (!this.animateselected) {
                    const len: number = this.series.length;
                    let seriesRefresh: boolean = false;
                    let series: AccumulationSeriesModel;
                    let blazorProp: boolean;
                    for (let i: number = 0; i < len; i++) {
                        series = newProp.series[i];
                        if (this.isBlazor && (series.startAngle || series.endAngle || series.explodeOffset || series.neckHeight ||
                            series.neckWidth || series.radius || series.innerRadius || series.groupMode || series.emptyPointSettings)) {
                            blazorProp = true;
                        }
                        if (newProp.series[i] && (newProp.series[i].dataSource || newProp.series[i].yName || newProp.series[i].xName ||
                            newProp.series[i].dataLabel || blazorProp)) {
                            extend(this.changeVisibleSeries(this.visibleSeries, i), series, null, true);
                            seriesRefresh = true;
                        }
                        if (newProp.series[i] && newProp.series[i].explodeIndex !== oldProp.series[i].explodeIndex) {
                            this.accBaseModule.explodePoints(newProp.series[i].explodeIndex, this);
                            this.accBaseModule.deExplodeAll(newProp.series[i].explodeIndex, this.enableAnimation ? 300 : 0);
                        }
                    }
                    if (seriesRefresh) {
                        this.processData(false);
                        update.refreshBounds = true;
                    }
                }
                this.animateselected = false;
                this.redraw = false;
                break;
            case 'locale':
            case 'currencyCode':
                super.refresh(); break;
            case 'background':
            case 'border':
            case 'annotations':
            case 'enableSmartLabels':
                update.refreshElements = true;
                break;
            case 'isMultiSelect':
            case 'selectedDataIndexes':
            case 'selectionMode':
                if (this.accumulationSelectionModule) {
                    if (isNullOrUndefined(this.accumulationSelectionModule.selectedDataIndexes)) {
                        this.accumulationSelectionModule.invokeSelection(this);
                    } else {
                        this.accumulationSelectionModule.redrawSelection(this);
                    }
                }
                break;
            }
        }
        if (!update.refreshBounds && update.refreshElements) {
            this.createPieSvg();
            this.renderElements();
        } else if (update.refreshBounds) {
            this.refreshSeries();
            this.createPieSvg();
            this.calculateBounds();
            this.renderElements();
        }
    }
}
