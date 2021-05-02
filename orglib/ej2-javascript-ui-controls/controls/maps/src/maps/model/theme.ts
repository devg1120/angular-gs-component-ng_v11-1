/**
 * Maps Themes doc
 */
import { IFontMapping, MapsTheme } from '../index';
import { IThemeStyle } from './interface';

/**
 * Specifies Maps Themes
 */
// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Theme {
    /** @private */
    export const mapsTitleFont: IFontMapping = {
        size: '14px',
        fontWeight: 'Medium',
        color: '#424242',
        fontStyle: 'Medium',
        fontFamily: 'Roboto, Noto, Sans-serif'
    };
    /** @private */
    export const mapsSubTitleFont: IFontMapping = {
        size: '13px',
        fontWeight: 'Medium',
        color: '#424242',
        fontStyle: 'Medium',
        fontFamily: 'Roboto, Noto, Sans-serif'
    };
    /** @private */
    export const tooltipLabelFont: IFontMapping = {
        size: '12px',
        fontWeight: 'Regular',
        color: '#FFFFFF',
        fontStyle: 'Regular',
        fontFamily: 'Roboto'
    };
    /** @private */
    export const legendTitleFont: IFontMapping = {
        size: '14px',
        fontWeight: 'Regular',
        color: '#757575',
        fontStyle: 'Regular',
        fontFamily: 'Roboto, Noto, Sans-serif'
    };
    /** @private */
    export const legendLabelFont: IFontMapping = {
        size: '13px',
        fontWeight: 'Medium',
        color: '#757575',
        fontStyle: 'Medium',
        fontFamily: 'Roboto, Noto, Sans-serif'
    };
    /** @private */
    export const dataLabelFont: IFontMapping = {
        size: '12px',
        fontWeight: 'Medium',
        color: '#000000',
        fontStyle: 'Medium',
        fontFamily: 'Roboto, Noto, Sans-serif'
    };
}
// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace FabricTheme {
    /** @private */
    export const mapsTitleFont: IFontMapping = {
        size: '14px',
        fontWeight: 'Semibold',
        color: '#424242',
        fontStyle: 'Semibold',
        fontFamily: 'SegoeUI, Helvetica Neue, Helvetica, Arial, sans-serif'
    };
    /** @private */
    export const mapsSubTitleFont: IFontMapping = {
        size: '13px',
        fontWeight: 'Regular',
        color: '#424242',
        fontStyle: 'Regular',
        fontFamily: 'SegoeUI, Helvetica Neue, Helvetica, Arial, sans-serif'
    };
    /** @private */
    export const tooltipLabelFont: IFontMapping = {
        size: '12px',
        fontWeight: 'Regular',
        color: '#FFFFFF',
        fontStyle: 'Regular',
        fontFamily: 'Roboto'
    };
    /** @private */
    export const legendTitleFont: IFontMapping = {
        size: '14px',
        fontWeight: 'Regular',
        color: '#757575',
        fontStyle: 'Regular',
        fontFamily: 'SegoeUI, Helvetica Neue, Helvetica, Arial, sans-serif'
    };
    /** @private */
    export const legendLabelFont: IFontMapping = {
        size: '13px',
        fontWeight: 'Medium',
        color: '#757575',
        fontStyle: 'Medium',
        fontFamily: 'SegoeUI, Helvetica Neue, Helvetica, Arial, sans-serif'
    };
    /** @private */
    export const dataLabelFont: IFontMapping = {
        size: '12px',
        fontWeight: 'Medium',
        color: '#000000',
        fontStyle: 'Medium',
        fontFamily: 'SegoeUI, Helvetica Neue, Helvetica, Arial, sans-serif'
    };
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace BootstrapTheme {
    /** @private */
    export const mapsTitleFont: IFontMapping = {
        size: '14px',
        fontWeight: 'Semibold',
        color: '#424242',
        fontStyle: 'Semibold',
        fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif'
    };
    /** @private */
    export const mapsSubTitleFont: IFontMapping = {
        size: '13px',
        fontWeight: 'Regular',
        color: '#424242',
        fontStyle: 'Regular',
        fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif'
    };
    /** @private */
    export const tooltipLabelFont: IFontMapping = {
        size: '12px',
        fontWeight: 'Regular',
        color: '#FFFFFF',
        fontStyle: 'Regular',
        fontFamily: 'Roboto'
    };
    /** @private */
    export const legendTitleFont: IFontMapping = {
        size: '14px',
        fontWeight: 'Regular',
        color: '#757575',
        fontStyle: 'Regular',
        fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif'
    };
    /** @private */
    export const legendLabelFont: IFontMapping = {
        size: '13px',
        fontWeight: 'Medium',
        color: '#757575',
        fontStyle: 'Medium',
        fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif'
    };
    /** @private */
    export const dataLabelFont: IFontMapping = {
        size: '12px',
        fontWeight: 'Medium',
        color: '#000000',
        fontStyle: 'Medium',
        fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif'
    };
}
/**
 * Internal use of Method to getting colors based on themes.
 *
 * @private
 * @param {MapsTheme} theme Specifies the theme of the maps
 * @returns {string[]} Returns the shape color
 */
export function getShapeColor(theme: MapsTheme): string[] {
    return ['#B5E485', '#7BC1E8', '#DF819C', '#EC9B79', '#78D0D3',
        '#D6D572', '#9178E3', '#A1E5B4', '#87A4B4', '#E4C16C'];
}
/**
 * HighContrast Theme configuration
 */
// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace HighContrastTheme {
    /** @private */
    export const mapsTitleFont: IFontMapping = {
        size: '14px',
        fontWeight: 'Medium',
        color: '#FFFFFF',
        fontStyle: 'Medium',
        fontFamily: 'Roboto, Noto, Sans-serif'
    };
    /** @private */
    export const mapsSubTitleFont: IFontMapping = {
        size: '13px',
        fontWeight: 'Medium',
        color: '#FFFFFF',
        fontStyle: 'Medium',
        fontFamily: 'Roboto, Noto, Sans-serif'
    };
    /** @private */
    export const tooltipLabelFont: IFontMapping = {
        size: '12px',
        fontWeight: 'Regular',
        color: '#000000',
        fontStyle: 'Regular',
        fontFamily: 'Roboto'
    };
    /** @private */
    export const legendTitleFont: IFontMapping = {
        size: '14px',
        fontWeight: 'Regular',
        color: '#FFFFFF',
        fontStyle: 'Regular',
        fontFamily: 'Roboto, Noto, Sans-serif'
    };
    /** @private */
    export const legendLabelFont: IFontMapping = {
        size: '13px',
        fontWeight: 'Medium',
        color: '#FFFFFF',
        fontStyle: 'Medium',
        fontFamily: 'Roboto, Noto, Sans-serif'
    };
    /** @private */
    export const dataLabelFont: IFontMapping = {
        size: '12px',
        fontWeight: 'Medium',
        color: '#000000',
        fontStyle: 'Medium',
        fontFamily: 'Roboto, Noto, Sans-serif'
    };
}

/**
 * Dark Theme configuration
 */
// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace DarkTheme {
    /** @private */
    export const mapsTitleFont: IFontMapping = {
        fontFamily: 'Roboto, Noto, Sans-serif',
        fontWeight: 'Medium',
        size: '14px',
        fontStyle: 'Medium',
        color: '#FFFFFF'
    };
    /** @private */
    export const mapsSubTitleFont: IFontMapping = {
        size: '13px',
        color: '#FFFFFF',
        fontWeight: 'Medium',
        fontFamily: 'Roboto, Noto, Sans-serif',
        fontStyle: 'Medium'
    };
    /** @private */
    export const tooltipLabelFont: IFontMapping = {
        size: '12px',
        color: '#282727',
        fontWeight: 'Regular',
        fontFamily: 'Roboto',
        fontStyle: 'Regular'
    };
    /** @private */
    export const legendTitleFont: IFontMapping = {
        size: '14px',
        fontWeight: 'Regular',
        color: '#FFFFFF',
        fontStyle: 'Regular',
        fontFamily: 'Roboto, Noto, Sans-serif'
    };
    /** @private */
    export const legendLabelFont: IFontMapping = {
        size: '13px',
        fontFamily: 'Roboto, Noto, Sans-serif',
        fontWeight: 'Medium',
        color: '#DADADA',
        fontStyle: 'Medium'
    };

}

export function getThemeStyle(theme: MapsTheme): IThemeStyle {
    let style: IThemeStyle; let color: string;
    switch (theme.toLowerCase()) {
    case 'materialdark':
        color = '#303030';
        break;
    case 'fabricdark':
        color = '#201F1F';
        break;
    case 'bootstrapdark':
        color = '#1A1A1A';
        break;
    }
    switch (theme.toLowerCase()) {
    case 'materialdark':
    case 'fabricdark':
    case 'bootstrapdark':
        style = {
            backgroundColor: color,
            areaBackgroundColor: color,
            titleFontColor: '#FFFFFF',
            subTitleFontColor: '#FFFFFF',
            legendTitleFontColor: '#DADADA',
            legendTextColor: '#DADADA',
            dataLabelFontColor: '#DADADA',
            tooltipFontColor: '#ffffff',
            tooltipFillColor: '#363F4C',
            zoomFillColor: '#FFFFFF',
            labelFontFamily: 'Roboto, Noto, Sans-serif'
        };
        break;
    case 'highcontrast':
        style = {
            backgroundColor: '#000000',
            areaBackgroundColor: '#000000',
            titleFontColor: '#FFFFFF',
            subTitleFontColor: '#FFFFFF',
            legendTitleFontColor: '#FFFFFF',
            legendTextColor: '#FFFFFF',
            dataLabelFontColor: '#000000',
            tooltipFontColor: '#000000',
            tooltipFillColor: '#ffffff',
            zoomFillColor: '#FFFFFF',
            labelFontFamily: 'Roboto, Noto, Sans-serif'
        };
        break;
    case 'bootstrap4':
        style = {
            backgroundColor: '#FFFFFF',
            areaBackgroundColor: '#FFFFFF',
            titleFontColor: '#212529',
            subTitleFontColor: '#212529',
            legendTitleFontColor: '#212529',
            legendTextColor: '#212529',
            dataLabelFontColor: '#212529',
            tooltipFontColor: '#FFFFFF',
            tooltipFillColor: '#000000',
            zoomFillColor: '#5B6269',
            fontFamily: 'HelveticaNeue-Medium',
            titleFontSize: '16px',
            legendFontSize: '14px',
            tooltipFillOpacity: 1,
            tooltipTextOpacity: 0.9,
            labelFontFamily: 'HelveticaNeue-Medium'
        };
        break;
    default:
        style = {
            backgroundColor: '#FFFFFF',
            areaBackgroundColor: '#FFFFFF',
            titleFontColor: '#424242',
            subTitleFontColor: '#424242',
            legendTitleFontColor: '#757575',
            legendTextColor: '#757575',
            dataLabelFontColor: '#000000',
            tooltipFontColor: '#ffffff',
            tooltipFillColor: '#000000',
            zoomFillColor: '#737373',
            labelFontFamily: 'Roboto, Noto, Sans-serif'
        };
        break;
    }
    return style;
}

