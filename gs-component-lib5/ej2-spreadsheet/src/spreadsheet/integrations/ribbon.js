import { Ribbon as RibbonComponent } from '../../ribbon/index';
import { ribbon, selectionComplete, beforeRibbonCreate, removeDataValidation, clearViewer } from '../common/index';
import { initiateDataValidation, invalidData, setUndoRedo, initiateConditionalFormat, setCF, focus, freeze } from '../common/index';
import { dialog, reapplyFilter, enableFileMenuItems, applyProtect, protectCellFormat, protectWorkbook } from '../common/index';
import { findHandler, insertChart, chartDesignTab, unProtectWorkbook } from '../common/index';
import { destroyComponent, performUndoRedo, beginAction, completeAction, applySort, hideRibbonTabs } from '../common/index';
import { enableToolbarItems, ribbonClick, paste, locale, refreshSheetTabs, initiateCustomSort, getFilteredColumn } from '../common/index';
import { tabSwitch, getUpdateUsingRaf, updateToggleItem, initiateHyperlink, editHyperlink } from '../common/index';
import { addRibbonTabs, addToolbarItems, hideFileMenuItems, addFileMenuItems, hideToolbarItems, enableRibbonTabs } from '../common/index';
import { Toolbar, Menu } from '@syncfusion/ej2-navigations';
import { ColorPicker } from '@syncfusion/ej2-inputs';
import { extend, isNullOrUndefined, getComponent, closest, detach, selectAll, select, EventHandler } from '@syncfusion/ej2-base';
import { getCellIndexes, getFormatFromType, getTypeFromFormat, setCell } from '../../workbook/index';
import { DropDownButton, SplitButton } from '@syncfusion/ej2-splitbuttons';
import { calculatePosition } from '@syncfusion/ej2-popups';
import { applyNumberFormatting, getFormattedCellObject, getRangeIndexes, ribbonFind, setMerge } from '../../workbook/common/index';
import { activeCellChanged, textDecorationUpdate, isNumber } from '../../workbook/common/index';
import { sheetsDestroyed, getRangeAddress, clearCFRule } from '../../workbook/common/index';
import { getCell, setCellFormat } from '../../workbook/index';
import { Button } from '@syncfusion/ej2-buttons';
import { ColorPicker as RibbonColorPicker } from './color-picker';
import { Dialog as FindDialog } from '@syncfusion/ej2-popups';
import { findDlg, insertDesignChart, removeDesignChart, getScrollBarWidth } from '../common/index';
import { refreshRibbonIcons } from '../../workbook/common/index';
/**
 * Represents Ribbon for Spreadsheet.
 */
var Ribbon = /** @class */ (function () {
    function Ribbon(parent) {
        this.border = '1px solid #000000';
        this.fontNameIndex = 5;
        this.numPopupWidth = 0;
        this.findValue = '';
        this.preTabIdx = 1;
        this.chartThemeIndex = 5;
        this.parent = parent;
        this.addEventListener();
        new RibbonColorPicker(parent);
    }
    Ribbon.prototype.getModuleName = function () {
        return 'ribbon';
    };
    Ribbon.prototype.initRibbon = function (args) {
        if (!this.parent.showRibbon && this.ribbon) {
            this.destroy();
            return;
        }
        this.parent.notify(beforeRibbonCreate, {});
        if (this.parent.isMobileView()) {
            this.createMobileView();
        }
        else {
            this.createRibbon(args);
        }
    };
    Ribbon.prototype.getRibbonMenuItems = function () {
        var l10n = this.parent.serviceLocator.getService(locale);
        var id = this.parent.element.id;
        return [{
                text: this.parent.isMobileView() ? '' : l10n.getConstant('File'),
                iconCss: this.parent.isMobileView() ? 'e-icons e-file-menu-icon' : null, id: id + "_File",
                items: [
                    { text: l10n.getConstant('New'), id: id + "_New", iconCss: 'e-new e-icons' },
                    { text: l10n.getConstant('Open'), id: id + "_Open", iconCss: 'e-open e-icons' },
                    {
                        text: l10n.getConstant('SaveAs'), iconCss: 'e-save e-icons', id: id + "_Save_As",
                        items: [
                            { text: l10n.getConstant('ExcelXlsx'), id: id + "_Xlsx", iconCss: 'e-xlsx e-icons' },
                            { text: l10n.getConstant('ExcelXls'), id: id + "_Xls", iconCss: 'e-xls e-icons' },
                            { text: l10n.getConstant('CSV'), id: id + "_Csv", iconCss: 'e-csv e-icons' },
                            { text: l10n.getConstant('PDF'), id: id + "_Pdf", iconCss: 'e-pdf e-icons' }
                        ]
                    }
                ]
            }];
    };
    Ribbon.prototype.getRibbonItems = function () {
        var _this = this;
        var id = this.parent.element.id;
        var l10n = this.parent.serviceLocator.getService(locale);
        var items = [{
                header: { text: l10n.getConstant('Home') },
                content: [
                    { prefixIcon: 'e-undo-icon', tooltipText: l10n.getConstant('Undo') + " (Ctrl+Z)", id: id + '_undo', disabled: true },
                    { prefixIcon: 'e-redo-icon', tooltipText: l10n.getConstant('Redo') + " (Ctrl+Y)", id: id + '_redo', disabled: true },
                    { type: 'Separator', id: id + '_separator_1' },
                    { prefixIcon: 'e-cut-icon', tooltipText: l10n.getConstant('Cut') + " (Ctrl+X)", id: id + '_cut' },
                    { prefixIcon: 'e-copy-icon', tooltipText: l10n.getConstant('Copy') + " (Ctrl+C)", id: id + '_copy' },
                    { tooltipText: l10n.getConstant('Paste') + " (Ctrl+V)", template: this.getPasteBtn(id), id: id + '_paste',
                        disabled: true
                    }, { type: 'Separator', id: id + '_separator_2' },
                    { template: this.getNumFormatDDB(id), tooltipText: l10n.getConstant('NumberFormat'), id: id + '_number_format' },
                    { type: 'Separator', id: id + '_separator_3' },
                    { template: this.getFontNameDDB(id), tooltipText: l10n.getConstant('Font'), id: id + '_font_name' },
                    { type: 'Separator', id: id + '_separator_4' },
                    { template: this.getFontSizeDDB(id), tooltipText: l10n.getConstant('FontSize'), id: id + '_font_size' },
                    { type: 'Separator', id: id + '_separator_5' },
                    { template: this.getBtn(id, 'bold'), tooltipText: l10n.getConstant('Bold') + " (Ctrl+B)", id: id + '_bold' },
                    { template: this.getBtn(id, 'italic'), tooltipText: l10n.getConstant('Italic') + " (Ctrl+I)", id: id + '_italic' },
                    { template: this.getBtn(id, 'line-through'), tooltipText: l10n.getConstant('Strikethrough') + " (Ctrl+5)",
                        id: id + '_line-through' },
                    { template: this.getBtn(id, 'underline'), tooltipText: l10n.getConstant('Underline') + " (Ctrl+U)",
                        id: id + '_underline' },
                    { template: document.getElementById(id + "_font_color_picker"), tooltipText: l10n.getConstant('TextColor'),
                        id: id + '_font_color_picker' }, { type: 'Separator', id: id + '_separator_6' },
                    { template: document.getElementById(id + "_fill_color_picker"), tooltipText: l10n.getConstant('FillColor'),
                        id: id + '_fill_color_picker' },
                    { template: this.getBordersDBB(id), tooltipText: l10n.getConstant('Borders'), id: id + '_borders' }, {
                        template: this.getMergeSplitBtn(id), tooltipText: l10n.getConstant('MergeCells'), id: id + '_merge_cells',
                        disabled: true
                    }, { type: 'Separator', id: id + '_separator_7' },
                    { template: this.getTextAlignDDB(id), tooltipText: l10n.getConstant('HorizontalAlignment'), id: id + '_text_align' }, { template: this.getVerticalAlignDDB(id), tooltipText: l10n.getConstant('VerticalAlignment'), id: id + '_vertical_align' },
                    { template: this.getBtn(id, 'wrap', false), tooltipText: "" + l10n.getConstant('WrapText'), id: id + '_wrap' }
                ]
            },
            {
                header: { text: l10n.getConstant('Insert') }, content: [
                    {
                        prefixIcon: 'e-hyperlink-icon', text: l10n.getConstant('Link'),
                        id: id + '_hyperlink', tooltipText: l10n.getConstant('Link'), click: function () { _this.getHyperlinkDlg(); }
                    },
                    {
                        prefixIcon: 'e-image-icon', text: l10n.getConstant('Image'),
                        id: id + '_', tooltipText: l10n.getConstant('Image'), click: function () {
                            select('#' + id + '_imageUpload', _this.parent.element).click();
                        }
                    }
                ]
            },
            {
                header: { text: l10n.getConstant('Formulas') }, content: [{
                        prefixIcon: 'e-insert-function', tooltipText: l10n.getConstant('InsertFunction'),
                        text: l10n.getConstant('InsertFunction'), id: id + '_insert_function'
                    }]
            },
            {
                header: { text: l10n.getConstant('Data') }, content: [
                    {
                        prefixIcon: 'e-protect-icon', text: l10n.getConstant('ProtectSheet'), id: id + '_protect',
                        tooltipText: l10n.getConstant('ProtectSheet')
                    },
                    {
                        prefixIcon: 'e-password-protect-icon', text: l10n.getConstant('ProtectWorkbook'), id: id + '_protectworkbook',
                        tooltipText: l10n.getConstant('ProtectWorkbook')
                    },
                    { type: 'Separator', id: id + '_separator_8' },
                    {
                        template: this.datavalidationDDB(id), tooltipText: l10n.getConstant('DataValidation'),
                        id: id + '_datavalidation'
                    }
                ]
            },
            {
                header: { text: l10n.getConstant('View') }, content: [
                    {
                        prefixIcon: 'e-hide-headers', text: this.getLocaleText('Headers'), id: id + '_headers',
                        tooltipText: this.getLocaleText('Headers')
                    }, { type: 'Separator', id: id + '_separator_9' },
                    {
                        prefixIcon: 'e-hide-gridlines', text: this.getLocaleText('GridLines'), id: id + '_gridlines',
                        tooltipText: this.getLocaleText('GridLines')
                    },
                    { type: 'Separator', id: id + '_separator_13' },
                    { prefixIcon: 'e-freeze-pane', text: l10n.getConstant('FreezePanes'), id: id + '_freezepanes', tooltipText: l10n.getConstant('FreezePanes') },
                    { prefixIcon: 'e-freeze-row', text: l10n.getConstant('FreezeRows'), id: id + '_freezerows', tooltipText: l10n.getConstant('FreezeRows') },
                    { prefixIcon: 'e-freeze-column', text: l10n.getConstant('FreezeColumns'), id: id + '_freezecolumns', tooltipText: l10n.getConstant('FreezeColumns') }
                ]
            }];
        if (this.parent.allowConditionalFormat) {
            items.find(function (x) { return x.header && x.header.text === l10n.getConstant('Home'); }).content.push({ type: 'Separator', id: id + '_separator_10' }, { template: this.getCFDBB(id), tooltipText: l10n.getConstant('ConditionalFormatting'), id: id + '_conditionalformatting' });
        }
        if (this.parent.allowChart) {
            items.find(function (x) { return x.header && x.header.text === l10n.getConstant('Insert'); }).content.push({ type: 'Separator', id: id + '_separator_11' }, {
                template: this.getChartDDB(id, true), text: l10n.getConstant('Chart'),
                tooltipText: l10n.getConstant('Chart'), id: id + '_chart'
            });
        }
        if (this.parent.allowCellFormatting) {
            items.find(function (x) { return x.header && x.header.text === l10n.getConstant('Home'); }).content.push({ type: 'Separator', id: id + '_separator_12' }, { template: this.getClearDDB(id), tooltipText: l10n.getConstant('Clear'), id: id + '_clear' });
        }
        if (this.parent.allowSorting || this.parent.allowFiltering) {
            items.find(function (x) { return x.header && x.header.text === l10n.getConstant('Home'); }).content.push({ template: this.getSortFilterDDB(id), tooltipText: l10n.getConstant('SortAndFilter'), id: id + '_sorting' });
        }
        if (this.parent.allowFindAndReplace) {
            items.find(function (x) { return x.header && x.header.text === l10n.getConstant('Home'); }).content.push({
                template: this.getFindDDb(id), prefixIcon: 'e-tbar-search-icon tb-icons',
                tooltipText: l10n.getConstant('FindReplaceTooltip'), id: id + '_find'
            });
        }
        return items;
    };
    Ribbon.prototype.getPasteBtn = function (id) {
        var _this = this;
        var btn = this.parent.element.appendChild(this.parent.createElement('button', { id: id + '_paste' }));
        var l10n = this.parent.serviceLocator.getService(locale);
        this.pasteSplitBtn = new SplitButton({
            iconCss: 'e-icons e-paste-icon',
            items: [
                { text: l10n.getConstant('All'), id: 'All' },
                { text: l10n.getConstant('Values'), id: 'Values' },
                { text: l10n.getConstant('Formats'), id: 'Formats' }
            ],
            select: function (args) {
                _this.parent.notify(paste, { type: args.item.id, isAction: true, isInternal: true });
            },
            click: function () {
                _this.parent.notify(paste, { isAction: true, isInternal: true });
            },
            close: function () { focus(_this.parent.element); }
        });
        this.pasteSplitBtn.createElement = this.parent.createElement;
        this.pasteSplitBtn.appendTo(btn);
        return btn.parentElement;
    };
    Ribbon.prototype.getHyperlinkDlg = function () {
        var indexes = getRangeIndexes(this.parent.getActiveSheet().activeCell);
        var row = this.parent.sheets[this.parent.getActiveSheet().id - 1].rows[indexes[0]];
        var cell;
        if (!isNullOrUndefined(row)) {
            cell = row.cells[indexes[1]];
        }
        if (isNullOrUndefined(cell)) {
            setCell(indexes[0], indexes[1], this.parent.getActiveSheet(), cell, false);
        }
        if (cell && cell.hyperlink) {
            this.parent.notify(editHyperlink, null);
        }
        else {
            this.parent.notify(initiateHyperlink, null);
        }
    };
    Ribbon.prototype.passwordProtectDlg = function () {
        if (this.parent.password.length > 0) {
            this.parent.notify(unProtectWorkbook, null);
        }
        else {
            if (document.getElementById(this.parent.element.id + '_protectworkbook').classList.contains('e-active')) {
                document.getElementById(this.parent.element.id + '_protectworkbook').classList.remove('e-active');
                if (this.parent.showSheetTabs) {
                    this.parent.element.querySelector('.e-add-sheet-tab').removeAttribute('disabled');
                }
            }
            else {
                this.parent.notify(protectWorkbook, null);
            }
        }
    };
    Ribbon.prototype.getLocaleText = function (str, setClass) {
        var text;
        var l10n = this.parent.serviceLocator.getService(locale);
        var sheet = this.parent.getActiveSheet();
        if (sheet['show' + str]) {
            if (setClass) {
                document.getElementById(this.parent.element.id + '_sheet').classList.remove('e-hide-' + str.toLowerCase());
            }
            text = l10n.getConstant('Hide' + str);
        }
        else {
            if (setClass) {
                document.getElementById(this.parent.element.id + '_sheet').classList.add('e-hide-' + str.toLowerCase());
            }
            text = l10n.getConstant('Show' + str);
        }
        return text;
    };
    Ribbon.prototype.getLocaleProtectText = function (str, setClass) {
        var text;
        var l10n = this.parent.serviceLocator.getService(locale);
        var sheet = this.parent.getActiveSheet();
        if (sheet.isProtected) {
            if (setClass) {
                this.parent.getMainContent().classList.remove('e-hide-' + str.toLowerCase());
            }
            text = l10n.getConstant('Unprotect' + str);
        }
        else {
            if (setClass) {
                this.parent.getMainContent().classList.add('e-hide-' + str.toLowerCase());
            }
            text = l10n.getConstant('Protect' + str);
        }
        return text;
    };
    Ribbon.prototype.getLocaleProtectWorkbook = function (str, setClass) {
        var text;
        var l10n = this.parent.serviceLocator.getService(locale);
        if (this.parent.isProtected) {
            if (setClass) {
                this.parent.getMainContent().classList.remove('e-hide-' + str.toLowerCase());
            }
            text = l10n.getConstant(str);
        }
        else {
            if (setClass) {
                this.parent.getMainContent().classList.add('e-hide-' + str.toLowerCase());
            }
            text = l10n.getConstant(str);
        }
        return text;
    };
    Ribbon.prototype.insertDesignChart = function () {
        var _this = this;
        var l10n = this.parent.serviceLocator.getService(locale);
        var tabIdx = this.ribbon.items.length - 1;
        this.preTabIdx = this.ribbon.selectedTab;
        if (this.parent.allowChart && this.ribbon.items[tabIdx] && this.ribbon.items[tabIdx].header.text !==
            l10n.getConstant('ChartDesign')) {
            var id = this.parent.element.id;
            var items = [{
                    header: { text: l10n.getConstant('ChartDesign') },
                    content: [
                        {
                            template: this.getAddChartEleDBB(id),
                            tooltipText: l10n.getConstant('AddChartElement'), id: id + 'add_chart_ element_chart'
                        },
                        { type: 'Separator' },
                        {
                            prefixIcon: 'e-switch-row-column-icon', text: l10n.getConstant('SwitchRowColumn'),
                            tooltipText: l10n.getConstant('SwitchRowColumn'),
                            id: id + 'switch_row_column_chart', click: function () {
                                _this.parent.notify(chartDesignTab, { switchRowColumn: true });
                            }
                        },
                        { type: 'Separator' },
                        { template: this.getChartThemeDDB(id), tooltipText: l10n.getConstant('ChartTheme'), id: id + '_chart_theme' },
                        { type: 'Separator' },
                        { template: this.getChartDDB(id, false), tooltipText: l10n.getConstant('ChartType'), id: id + '_chart_type' }
                    ]
                }];
            this.parent.addRibbonTabs(items);
            tabIdx = this.ribbon.items.length;
            this.ribbon.tabObj.select(tabIdx);
        }
    };
    Ribbon.prototype.removeDesignChart = function () {
        var l10n = this.parent.serviceLocator.getService(locale);
        var tabIdx = this.ribbon.items.length - 1;
        if (this.parent.allowChart && this.ribbon.items[tabIdx] && this.ribbon.items[tabIdx].header.text ===
            l10n.getConstant('ChartDesign')) {
            this.ribbon.tabObj.select(this.preTabIdx + 1);
            this.parent.hideRibbonTabs([l10n.getConstant('ChartDesign')], true);
            if (document.getElementsByClassName('e-addchart-ddb').length > 0) {
                document.getElementsByClassName('e-addchart-ddb')[0].remove();
            }
            if (document.getElementsByClassName('e-chart-type-ddb').length > 0) {
                document.getElementsByClassName('e-chart-type-ddb')[0].remove();
            }
            if (document.getElementsByClassName('e-charttheme-ddb').length > 0) {
                document.getElementsByClassName('e-charttheme-ddb')[0].remove();
            }
            delete this.ribbon.items[tabIdx].content[0];
            this.ribbon.items.length = this.ribbon.items.length - 1;
        }
    };
    Ribbon.prototype.createRibbon = function (args) {
        var ribbonElement = this.parent.createElement('div', { id: this.parent.element.id + "_ribbon" });
        this.ribbon = new RibbonComponent({
            selectedTab: 0,
            menuItems: this.getRibbonMenuItems(),
            items: this.getRibbonItems(),
            fileMenuItemSelect: this.fileMenuItemSelect.bind(this),
            beforeOpen: this.fileMenuBeforeOpen.bind(this),
            beforeClose: this.fileMenuBeforeClose.bind(this),
            clicked: this.toolbarClicked.bind(this),
            created: this.ribbonCreated.bind(this),
            selecting: this.tabSelecting.bind(this),
            expandCollapse: this.expandCollapseHandler.bind(this),
            beforeFileMenuItemRender: this.beforeRenderHandler.bind(this)
        });
        this.ribbon.createElement = this.parent.createElement;
        if (args && args.uiUpdate) {
            var refEle = this.parent.element.querySelector('.e-formula-bar-panel') ||
                document.getElementById(this.parent.element.id + '_sheet_panel');
            this.parent.element.insertBefore(ribbonElement, refEle);
        }
        else {
            this.parent.element.appendChild(ribbonElement);
        }
        this.ribbon.appendTo(ribbonElement);
    };
    Ribbon.prototype.tabSelecting = function (args) {
        if (args.selectingIndex !== this.ribbon.selectedTab) {
            this.refreshRibbonContent(args.selectingIndex);
            this.parent.notify(tabSwitch, { activeTab: args.selectingIndex });
        }
    };
    Ribbon.prototype.beforeRenderHandler = function (args) {
        var l10n = this.parent.serviceLocator.getService(locale);
        if (args.item.text === l10n.getConstant('Open') && (!this.parent.openUrl || !this.parent.allowOpen)) {
            args.element.classList.add('e-disabled');
        }
        if (args.item.text === l10n.getConstant('SaveAs') && (!this.parent.saveUrl || !this.parent.allowSave)) {
            args.element.classList.add('e-disabled');
        }
    };
    Ribbon.prototype.getChartThemeDDB = function (id) {
        var _this = this;
        var chartThemeBtn = this.parent.createElement('button', { id: id + '_chart_theme' });
        chartThemeBtn.appendChild(this.parent.createElement('span', { className: 'e-tbar-btn-text', innerHTML: 'Material' }));
        this.chartThemeDDB = new DropDownButton({
            items: this.getChartThemeDdbItems(),
            content: '',
            select: function (args) { return _this.chartThemeDDBSelect(args); },
            close: function () { return _this.parent.element.focus(); },
            cssClass: 'e-flat e-charttheme-ddb',
            beforeOpen: function (args) { return _this.tBarDdbBeforeOpen(args.element, args.items); }
        });
        this.chartThemeDDB.createElement = this.parent.createElement;
        this.chartThemeDDB.appendTo(chartThemeBtn);
        return chartThemeBtn;
    };
    Ribbon.prototype.getNumFormatDDB = function (id) {
        var _this = this;
        var numFormatBtn = this.parent.createElement('button', { id: id + '_number_format' });
        numFormatBtn.appendChild(this.parent.createElement('span', { className: 'e-tbar-btn-text', innerHTML: 'General' }));
        this.numFormatDDB = new DropDownButton({
            items: this.getNumFormatDdbItems(id),
            content: '',
            select: function (args) { return _this.numDDBSelect(args); },
            open: function (args) { return _this.numDDBOpen(args); },
            beforeItemRender: function (args) { return _this.previewNumFormat(args); },
            close: function () { return focus(_this.parent.element); },
            cssClass: 'e-flat e-numformat-ddb',
            beforeOpen: function (args) { return _this.tBarDdbBeforeOpen(args.element, args.items); }
        });
        this.numFormatDDB.createElement = this.parent.createElement;
        this.numFormatDDB.appendTo(numFormatBtn);
        return numFormatBtn;
    };
    Ribbon.prototype.getFontSizeDDB = function (id) {
        var _this = this;
        this.fontSizeDdb = new DropDownButton({
            cssClass: 'e-font-size-ddb',
            content: '11',
            items: [{ text: '8' }, { text: '9' }, { text: '10' }, { text: '11' }, { text: '12' }, { text: '14' }, { text: '16' },
                { text: '18' }, { text: '20' }, { text: '22' }, { text: '24' }, { text: '26' }, { text: '28' }, { text: '36' },
                { text: '48' }, { text: '72' }],
            beforeOpen: function (args) {
                _this.tBarDdbBeforeOpen(args.element, args.items);
                _this.refreshSelected(_this.fontSizeDdb, args.element, 'content', 'text');
            },
            select: function (args) {
                var eventArgs = { style: { fontSize: args.item.text + "pt" }, onActionUpdate: true };
                _this.parent.notify(setCellFormat, eventArgs);
                if (!eventArgs.cancel) {
                    _this.fontSizeDdb.content = eventArgs.style.fontSize.split('pt')[0];
                    _this.fontSizeDdb.dataBind();
                }
            },
            close: function () { return focus(_this.parent.element); }
        });
        this.fontSizeDdb.createElement = this.parent.createElement;
        this.fontSizeDdb.appendTo(this.parent.createElement('button', { id: id + '_font_size' }));
        return this.fontSizeDdb.element;
    };
    Ribbon.prototype.getChartDDB = function (id, isChart) {
        var _this = this;
        var l10n = this.parent.serviceLocator.getService(locale);
        var menuClass = isChart ? 'e-chart-menu' : 'e-chart-type-menu';
        this.chartMenu = new Menu({
            cssClass: menuClass,
            items: [
                {
                    iconCss: 'e-icons e-column', text: l10n.getConstant('Column'),
                    items: [{ id: 'column_chart' }]
                },
                {
                    iconCss: 'e-icons e-bar', text: l10n.getConstant('Bar'),
                    items: [{ id: 'bar_chart' }]
                },
                {
                    iconCss: 'e-icons e-area', text: l10n.getConstant('Area'),
                    items: [{ id: 'area_chart' }]
                },
                {
                    iconCss: 'e-icons e-pie-doughnut', text: l10n.getConstant('PieAndDoughnut'),
                    items: [{ id: 'pie_doughnut_chart' }]
                },
                {
                    iconCss: 'e-icons e-line', text: l10n.getConstant('Line'),
                    items: [{ id: 'line_chart' }]
                },
                // {
                //     iconCss: 'e-icons e-radar', text: l10n.getConstant('Radar'),
                //     items: [{ id: 'radar_chart' }]
                // },
                {
                    iconCss: 'e-icons e-scatter', text: l10n.getConstant('Scatter'),
                    items: [{ id: 'scatter_chart' }]
                }
            ],
            orientation: 'Vertical',
            beforeOpen: function (args) {
                if (args.parentItem.text === l10n.getConstant('Column')) {
                    args.element.firstChild.appendChild(column);
                    args.element.parentElement.classList.add('e-column-chart');
                }
                else if (args.parentItem.text === l10n.getConstant('Bar')) {
                    args.element.firstChild.appendChild(bar);
                    args.element.parentElement.classList.add('e-bar-chart');
                }
                else if (args.parentItem.text === l10n.getConstant('Area')) {
                    args.element.firstChild.appendChild(area);
                    args.element.parentElement.classList.add('e-area-chart');
                }
                else if (args.parentItem.text === l10n.getConstant('Line')) {
                    args.element.firstChild.appendChild(line);
                    args.element.parentElement.classList.add('e-line-chart');
                }
                else if (args.parentItem.text === l10n.getConstant('PieAndDoughnut')) {
                    args.element.firstChild.appendChild(pie);
                    args.element.parentElement.classList.add('e-pie-doughnut-chart');
                }
                else if (args.parentItem.text === l10n.getConstant('Radar')) {
                    args.element.firstChild.appendChild(radar);
                    args.element.parentElement.classList.add('e-radar-chart');
                }
                else if (args.parentItem.text === l10n.getConstant('Scatter')) {
                    args.element.firstChild.appendChild(scatter);
                    args.element.parentElement.classList.add('e-scatter-chart');
                }
            },
            select: this.chartSelected.bind(this)
        });
        this.chartMenu.createElement = this.parent.createElement;
        var column = this.parent.createElement('div', { id: 'column_main', className: 'e-column-main' });
        var column1Text = this.parent.createElement('div', { id: 'column1_text', className: 'e-column1-text', innerHTML: l10n.getConstant('Column') });
        var column1Cont = this.parent.createElement('div', { id: 'column1_cont', className: 'e-column1-cont' });
        var column2Cont = this.parent.createElement('div', { id: 'column2_cont', className: 'e-column2-cont' });
        column.appendChild(column1Text);
        column.appendChild(column1Cont);
        //column.appendChild(column2Text);
        //column.appendChild(column2Cont);
        var clusteredColumn = this.parent.createElement('span', { id: 'clusteredColumn', className: 'e-clusteredcolumn e-column-icon e-menu-icon e-icons' });
        var stackedColumn = this.parent.createElement('span', {
            id: 'stackedColumn', className: 'e-stackedcolumn e-column-icon e-menu-icon e-icons'
        });
        var stackedColumn100 = this.parent.createElement('span', {
            id: 'stackedColumn100', className: 'e-stackedcolumn100 e-column-icon e-menu-icon e-icons'
        });
        var clusteredColumn3D = this.parent.createElement('span', {
            id: 'clusteredColumn3D', className: 'e-clusteredColumn3D e-column-icon'
        });
        var stackedColumn3D = this.parent.createElement('span', { id: 'stackedColumn3D', className: 'e-stackedColumn3D e-column-icon' });
        var stackedColumn1003D = this.parent.createElement('span', { id: 'stackedColumn1003D', className: 'e-stackedColumn1003D e-column-icon' });
        clusteredColumn.title = l10n.getConstant('ClusteredColumn');
        stackedColumn.title = l10n.getConstant('StackedColumn');
        stackedColumn100.title = l10n.getConstant('StackedColumn100');
        stackedColumn1003D.title = l10n.getConstant('OrangeDataBar');
        stackedColumn3D.title = l10n.getConstant('LightblueDataBar');
        clusteredColumn3D.title = l10n.getConstant('PurpleDataBar');
        column1Cont.appendChild(clusteredColumn);
        column1Cont.appendChild(stackedColumn);
        column1Cont.appendChild(stackedColumn100);
        column2Cont.appendChild(clusteredColumn3D);
        column2Cont.appendChild(stackedColumn3D);
        column2Cont.appendChild(stackedColumn1003D);
        var bar = this.parent.createElement('div', { id: 'bar_main', className: 'e-bar-main' });
        var bar1Text = this.parent.createElement('div', { id: 'bar1_text', className: 'e-bar1-text', innerHTML: l10n.getConstant('Bar') });
        var bar1Cont = this.parent.createElement('div', { id: 'bar1_cont', className: 'e-bar1-cont' });
        var bar2Cont = this.parent.createElement('div', { id: 'bar2_cont', className: 'e-bar2-cont' });
        bar.appendChild(bar1Text);
        bar.appendChild(bar1Cont);
        //bar.appendChild(bar2Text);
        //bar.appendChild(bar2Cont);
        var clusteredBar = this.parent.createElement('span', { id: 'clusteredBar', className: 'e-clusteredbar e-bar-icon e-menu-icon e-icons' });
        var stackedBar = this.parent.createElement('span', { id: 'stackedBar', className: 'e-stackedbar e-bar-icon e-menu-icon e-icons' });
        var stackedBar100 = this.parent.createElement('span', { id: 'stackedBar100', className: 'e-stackedbar100 e-bar-icon e-menu-icon e-icons' });
        var clusteredBar3D = this.parent.createElement('span', { id: 'clusteredBar3D', className: 'e-clusteredBar3D e-bar-icon' });
        var stackedBar3D = this.parent.createElement('span', { id: 'stackedBar3D', className: 'e-stackedBar3D e-bar-icon' });
        var stackedBar1003D = this.parent.createElement('span', { id: 'stackedBar1003D', className: 'e-stackedBar1003D e-bar-icon' });
        clusteredBar.title = l10n.getConstant('ClusteredBar');
        stackedBar.title = l10n.getConstant('StackedBar');
        stackedBar100.title = l10n.getConstant('StackedBar100');
        stackedBar1003D.title = l10n.getConstant('OrangeDataBar');
        stackedBar3D.title = l10n.getConstant('LightblueDataBar');
        clusteredBar3D.title = l10n.getConstant('PurpleDataBar');
        bar1Cont.appendChild(clusteredBar);
        bar1Cont.appendChild(stackedBar);
        bar1Cont.appendChild(stackedBar100);
        bar2Cont.appendChild(clusteredBar3D);
        bar2Cont.appendChild(stackedBar3D);
        bar2Cont.appendChild(stackedBar1003D);
        var area = this.parent.createElement('div', { id: 'area_main', className: 'e-area-main' });
        var areaText = this.parent.createElement('div', { id: 'area_text', className: 'e-area-text', innerHTML: l10n.getConstant('Area') });
        var areaCont = this.parent.createElement('div', { id: 'area_cont', className: 'e-area-cont' });
        area.appendChild(areaText);
        area.appendChild(areaCont);
        var defArea = this.parent.createElement('span', { id: 'area', className: 'e-area e-area-icon e-menu-icon e-icons' });
        var stackedArea = this.parent.createElement('span', { id: 'stackedArea', className: 'e-stackedarea e-area-icon e-menu-icon e-icons' });
        var stackedArea100 = this.parent.createElement('span', { id: 'stackedArea100', className: 'e-stackedarea100 e-area-icon e-menu-icon e-icons' });
        defArea.title = l10n.getConstant('Area');
        stackedArea.title = l10n.getConstant('StackedArea');
        stackedArea100.title = l10n.getConstant('StackedArea100');
        areaCont.appendChild(defArea);
        areaCont.appendChild(stackedArea);
        areaCont.appendChild(stackedArea100);
        var line = this.parent.createElement('div', { id: 'line_main', className: 'e-line-main' });
        var lineText = this.parent.createElement('div', { id: 'line_text', className: 'e-line-text', innerHTML: l10n.getConstant('Line') });
        var lineCont = this.parent.createElement('div', { id: 'line_cont', className: 'e-line-cont' });
        line.appendChild(lineText);
        line.appendChild(lineCont);
        var defLine = this.parent.createElement('span', { id: 'line', className: 'e-line e-line-icon e-menu-icon e-icons' });
        var stackedLine = this.parent.createElement('span', { id: 'stackedLine', className: 'e-stackedline e-line-icon e-menu-icon e-icons' });
        var stackedLine100 = this.parent.createElement('span', {
            id: 'stackedline100', className: 'e-stackedline100 e-line-icon e-menu-icon e-icons'
        });
        defLine.title = l10n.getConstant('Line');
        stackedLine.title = l10n.getConstant('StackedLine');
        stackedLine100.title = l10n.getConstant('StackedLine100');
        lineCont.appendChild(defLine);
        lineCont.appendChild(stackedLine);
        lineCont.appendChild(stackedLine100);
        var pie = this.parent.createElement('div', { id: 'pie_main', className: 'e-pie-main' });
        var pieText = this.parent.createElement('div', { id: 'pie_text', className: 'e-pie-text', innerHTML: l10n.getConstant('Pie') });
        var pieCont = this.parent.createElement('div', { id: 'pie_cont', className: 'e-pie-cont' });
        pie.appendChild(pieText);
        pie.appendChild(pieCont);
        var defPie = this.parent.createElement('span', { id: 'pie', className: 'e-pie e-pie-icon e-menu-icon e-icons' });
        var doughnut = this.parent.createElement('span', { id: 'doughnut', className: 'e-doughnut e-pie-icon e-menu-icon e-icons' });
        defPie.title = l10n.getConstant('Pie');
        doughnut.title = l10n.getConstant('Doughnut');
        pieCont.appendChild(defPie);
        pieCont.appendChild(doughnut);
        var radar = this.parent.createElement('div', { id: 'radar_main', className: 'e-radar-main' });
        var radarText = this.parent.createElement('div', { id: 'radar_text', className: 'e-radar-text', innerHTML: 'Radar' });
        var radarCont = this.parent.createElement('div', { id: 'radar_cont', className: 'e-radar-cont' });
        radar.appendChild(radarText);
        radar.appendChild(radarCont);
        var defradar = this.parent.createElement('span', { id: 'radar', className: 'e-radar e-radar-icon e-menu-icon e-icons' });
        var radarMarkers = this.parent.createElement('span', { id: 'radar_markers', className: 'e-radar-markers e-radar-icon e-menu-icon e-icons' });
        defradar.title = l10n.getConstant('BlueDataBar');
        radarMarkers.title = l10n.getConstant('GreenDataBar');
        radarCont.appendChild(defradar);
        radarCont.appendChild(radarMarkers);
        var scatter = this.parent.createElement('div', { id: 'scatter_main', className: 'e-scatter-main' });
        var scatterText = this.parent.createElement('div', { id: 'scatter_text', className: 'e-scatter-text', innerHTML: l10n.getConstant('Scatter') });
        var scatterCont = this.parent.createElement('div', { id: 'scatter_cont', className: 'e-scatter-cont' });
        scatter.appendChild(scatterText);
        scatter.appendChild(scatterCont);
        var defscatter = this.parent.createElement('span', { id: 'scatter', className: 'e-scatter e-scatter-icon e-menu-icon e-icons' });
        defscatter.title = l10n.getConstant('Scatter');
        scatterCont.appendChild(defscatter);
        var ulClass = isChart ? '_chart_menu' : '_chart_type_menu';
        var ul = this.parent.element.appendChild(this.parent.createElement('ul', {
            id: id + ulClass, styles: 'display: none;'
        }));
        this.chartMenu.appendTo(ul);
        ul.classList.add('e-ul');
        var ddbIconCss = isChart ? 'e-chart-icon' : 'e-chart-type-icon';
        var ddbCssClass = isChart ? 'e-chart-ddb' : 'e-chart-type-ddb';
        var chartBtnId = isChart ? id + '_chart-btn' : id + '_chart-type-btn';
        this.chartDdb = new DropDownButton({
            iconCss: 'e-icons' + ' ' + ddbIconCss,
            cssClass: ddbCssClass,
            target: this.chartMenu.element.parentElement,
            created: function () { _this.chartMenu.element.style.display = ''; },
            beforeClose: function (args) {
                if (args.event && closest(args.event.target, '.' + ddbCssClass)) {
                    if (closest(args.event.target, '.' + ddbCssClass).id !== chartBtnId) {
                        args.cancel = true;
                    }
                }
            },
            close: function () { return focus(_this.parent.element); }
        });
        this.chartDdb.createElement = this.parent.createElement;
        var chartBtn;
        if (isChart) {
            chartBtn = this.parent.createElement('button', { id: chartBtnId });
            chartBtn.appendChild(this.parent.createElement('span', { id: id + '_chart', innerHTML: l10n.getConstant('Chart') }));
        }
        else {
            chartBtn = this.parent.createElement('button', { id: chartBtnId });
            chartBtn.appendChild(this.parent.createElement('span', { id: id + '_chart_type', innerHTML: l10n.getConstant('ChartType') }));
        }
        this.chartDdb.appendTo(chartBtn);
        return this.chartDdb.element;
    };
    Ribbon.prototype.getAddChartEleDBB = function (id) {
        var _this = this;
        var l10n = this.parent.serviceLocator.getService(locale);
        this.addChartMenu = new Menu({
            cssClass: 'e-addchart-menu', title: l10n.getConstant('AddChartElement'),
            items: [{
                    iconCss: 'e-icons e-axes', text: l10n.getConstant('Axes'),
                    items: [{
                            iconCss: 'e-icons e-ph-axes', id: 'PHAxes',
                            text: l10n.getConstant('PrimaryHorizontal')
                        },
                        {
                            iconCss: 'e-icons e-pv-axes', id: 'PVAxes',
                            text: l10n.getConstant('PrimaryVertical')
                        }]
                },
                {
                    iconCss: 'e-icons e-axis-title', text: l10n.getConstant('AxisTitle'),
                    items: [{
                            iconCss: 'e-icons e-ph-axistitle', id: 'PHAxisTitle',
                            text: l10n.getConstant('PrimaryHorizontal')
                        },
                        {
                            iconCss: 'e-icons e-pv-axistitle', id: 'PVAxisTitle',
                            text: l10n.getConstant('PrimaryVertical')
                        }]
                },
                {
                    iconCss: 'e-icons e-chart-title', text: l10n.getConstant('ChartTitle'),
                    items: [{ iconCss: 'e-icons e-ct-none', id: 'ChartTitleNone', text: l10n.getConstant('None') },
                        { iconCss: 'e-icons e-ct-abovechart', id: 'ChartTitleAbove', text: l10n.getConstant('AboveChart') }
                        // { iconCss: 'e-icons e-ct-farchart', id: 'chart_farchart', text: l10n.getConstant('AboveChart') },
                        // { iconCss: 'e-icons e-ct-nearchart', id: 'chart_nearchart', text: l10n.getConstant('AboveChart') }
                    ]
                },
                {
                    iconCss: 'e-icons e-data-labels', text: l10n.getConstant('DataLabels'),
                    items: [{ iconCss: 'e-icons e-dl-none', id: 'DLNone', text: l10n.getConstant('None') },
                        { iconCss: 'e-icons e-dl-center', id: 'DLCenter', text: l10n.getConstant('Center') },
                        { iconCss: 'e-icons e-dl-insideend', id: 'DLInsideend', text: l10n.getConstant('InsideEnd') },
                        { iconCss: 'e-icons e-dl-insidebase', id: 'DLInsidebase', text: l10n.getConstant('InsideBase') },
                        { iconCss: 'e-icons e-dl-outsideend', id: 'DLOutsideend', text: l10n.getConstant('OutsideEnd') }]
                },
                {
                    iconCss: 'e-icons e-gridlines', text: l10n.getConstant('Gridlines'),
                    items: [{
                            iconCss: 'e-icons e-gl-major-horizontal', id: 'GLMajorHorizontal',
                            text: l10n.getConstant('PrimaryMajorHorizontal')
                        },
                        {
                            iconCss: 'e-icons e-gl-major-vertical', id: 'GLMajorVertical',
                            text: l10n.getConstant('PrimaryMajorVertical')
                        },
                        {
                            iconCss: 'e-icons e-gl-minor-horizontal', id: 'GLMinorHorizontal',
                            text: l10n.getConstant('PrimaryMinorHorizontal')
                        },
                        {
                            iconCss: 'e-icons e-gl-minor-vertical', id: 'GLMinorVertical',
                            text: l10n.getConstant('PrimaryMinorVertical')
                        }]
                },
                {
                    iconCss: 'e-icons e-legends', text: l10n.getConstant('Legends'),
                    items: [{ iconCss: 'e-icons e-legends-none', id: 'LegendNone', text: l10n.getConstant('None') },
                        { iconCss: 'e-icons e-legends-right', id: 'LegendsRight', text: l10n.getConstant('Right') },
                        { iconCss: 'e-icons e-legends-left', id: 'LegendsLeft', text: l10n.getConstant('Left') },
                        { iconCss: 'e-icons e-legends-bottom', id: 'LegendsBottom', text: l10n.getConstant('Bottom') },
                        { iconCss: 'e-icons e-legends-top', id: 'LegendsTop', text: l10n.getConstant('Top') }]
                }],
            orientation: 'Vertical',
            select: this.addChartEleSelected.bind(this)
        });
        var ul = this.parent.element.appendChild(this.parent.createElement('ul', {
            id: id + '_add_chart_menu', styles: 'display: none;'
        }));
        this.addChartMenu.appendTo(ul);
        ul.classList.add('e-ul');
        this.addChartDdb = new DropDownButton({
            iconCss: 'e-icons e-addchart-icon',
            cssClass: 'e-addchart-ddb',
            target: this.addChartMenu.element.parentElement,
            created: function () { _this.addChartMenu.element.style.display = ''; },
            beforeClose: function (args) {
                if (args.event && closest(args.event.target, '.e-addchart-ddb')) {
                    if (closest(args.event.target, '.e-addchart-ddb').id !== id + '_addchart') {
                        args.cancel = true;
                    }
                }
            },
            close: function () { return _this.parent.element.focus(); }
        });
        this.addChartDdb.createElement = this.parent.createElement;
        var addChartBtn = this.parent.createElement('button', { id: id + '_addchart' });
        addChartBtn.appendChild(this.parent.createElement('span', { id: id + '_chart', innerHTML: l10n.getConstant('AddChartElement') }));
        this.addChartDdb.appendTo(addChartBtn);
        return this.addChartDdb.element;
    };
    Ribbon.prototype.getCFDBB = function (id) {
        var _this = this;
        var l10n = this.parent.serviceLocator.getService(locale);
        this.cFMenu = new Menu({
            cssClass: 'e-cf-menu',
            items: [{
                    iconCss: 'e-icons e-hlcellrules', text: l10n.getConstant('HighlightCellsRules'),
                    items: [{ iconCss: 'e-icons e-greaterthan', id: 'cf_greaterthan', text: l10n.getConstant('GreaterThan') + '...' },
                        { iconCss: 'e-icons e-lessthan', id: 'cf_lessthan', text: l10n.getConstant('LessThan') + '...' },
                        { iconCss: 'e-icons e-between', id: 'cf_between', text: l10n.getConstant('Between') + '...' },
                        { iconCss: 'e-icons e-equalto', id: 'cf_eqaulto', text: l10n.getConstant('CFEqualTo') + '...' }, {
                            iconCss: 'e-icons e-textcontains', id: 'cf_textthatcontains',
                            text: l10n.getConstant('TextThatContains') + '...'
                        }, { iconCss: 'e-icons e-adateoccuring', id: 'cf_adateoccuring', text: l10n.getConstant('ADateOccuring') + '...' }, {
                            iconCss: 'e-icons e-duplicate', id: 'cf_duplicatevalues',
                            text: l10n.getConstant('DuplicateValues') + '...'
                        }]
                },
                {
                    iconCss: 'e-icons e-topbottomrules', text: l10n.getConstant('TopBottomRules'),
                    items: [{ iconCss: 'e-icons e-top10items', id: 'cf_top10items', text: l10n.getConstant('Top10Items') + '...' },
                        { iconCss: 'e-icons e-top10', id: 'cf_top10', text: l10n.getConstant('Top10') + ' %...' },
                        { iconCss: 'e-icons e-bottom10items', id: 'cf_bottom10items', text: l10n.getConstant('Bottom10Items') + '...' },
                        { iconCss: 'e-icons e-bottom10', id: 'cf_bottom10', text: l10n.getConstant('Bottom10') + ' %...' },
                        { iconCss: 'e-icons e-aboveaverage', id: 'cf_aboveaverage', text: l10n.getConstant('AboveAverage') + '...' },
                        { iconCss: 'e-icons e-belowaverage', id: 'cf_belowaverage', text: l10n.getConstant('BelowAverage') + '...' }]
                },
                {
                    iconCss: 'e-icons e-databars', text: l10n.getConstant('DataBars'),
                    items: [{ id: 'cf_databars' }]
                },
                {
                    iconCss: 'e-icons e-colorscales', text: l10n.getConstant('ColorScales'),
                    items: [{ id: 'cf_colorscales' }]
                },
                {
                    iconCss: 'e-icons e-iconsets', text: l10n.getConstant('IconSets'),
                    items: [{ id: 'cf_iconsets' }]
                },
                {
                    iconCss: 'e-icons e-clearrules', text: l10n.getConstant('ClearRules'),
                    items: [{ id: 'cf_cr_cells', text: l10n.getConstant('SelectedCells') },
                        { id: 'cf_cr_sheet', text: l10n.getConstant('EntireSheet') }]
                }],
            orientation: 'Vertical',
            beforeOpen: function (args) {
                if (args.parentItem.text === l10n.getConstant('DataBars')) {
                    args.element.firstChild.appendChild(dataBars);
                    args.element.parentElement.classList.add('e-databars');
                }
                else if (args.parentItem.text === l10n.getConstant('ColorScales')) {
                    args.element.firstChild.appendChild(colorScales);
                    args.element.parentElement.classList.add('e-colorscales');
                }
                else if (args.parentItem.text === l10n.getConstant('IconSets')) {
                    args.element.firstChild.appendChild(iconSets);
                    args.element.parentElement.classList.add('e-iconsets');
                }
            },
            select: this.cFSelected.bind(this)
        });
        var dataBars = this.parent.createElement('div', { id: 'db', className: 'e-db' });
        var db1 = this.parent.createElement('div', { id: 'db1', className: 'e-db1' });
        var db2 = this.parent.createElement('div', { id: 'db2', className: 'e-db2' });
        dataBars.appendChild(db1);
        dataBars.appendChild(db2);
        var bBar = this.parent.createElement('span', { id: 'BlueDataBar', className: 'e-bdatabar e-databar-icon' });
        var gBar = this.parent.createElement('span', { id: 'GreenDataBar', className: 'e-gdatabar e-databar-icon' });
        var rBar = this.parent.createElement('span', { id: 'RedDataBar', className: 'e-rdatabar e-databar-icon' });
        var oBar = this.parent.createElement('span', { id: 'OrangeDataBar', className: 'e-odatabar e-databar-icon' });
        var lBBar = this.parent.createElement('span', { id: 'LightBlueDataBar', className: 'e-lbdatabar e-databar-icon' });
        var pBar = this.parent.createElement('span', { id: 'PurpleDataBar', className: 'e-pdatabar e-databar-icon' });
        bBar.title = l10n.getConstant('BlueDataBar');
        gBar.title = l10n.getConstant('GreenDataBar');
        rBar.title = l10n.getConstant('RedDataBar');
        oBar.title = l10n.getConstant('OrangeDataBar');
        lBBar.title = l10n.getConstant('LightblueDataBar');
        pBar.title = l10n.getConstant('PurpleDataBar');
        db1.appendChild(bBar);
        db1.appendChild(gBar);
        db1.appendChild(rBar);
        db2.appendChild(oBar);
        db2.appendChild(lBBar);
        db2.appendChild(pBar);
        this.cFMenu.createElement = this.parent.createElement;
        var colorScales = this.parent.createElement('div', { id: 'db', className: 'e-cs' });
        var cs1 = this.parent.createElement('div', { id: 'cs1', className: 'e-cs1' });
        var cs2 = this.parent.createElement('div', { id: 'cs2', className: 'e-cs2' });
        var cs3 = this.parent.createElement('div', { id: 'cs3', className: 'e-cs3' });
        colorScales.appendChild(cs1);
        colorScales.appendChild(cs2);
        colorScales.appendChild(cs3);
        var gyr = this.parent.createElement('span', { id: 'GYRColorScale', className: 'e-gyr e-colorscale-icon' });
        var ryg = this.parent.createElement('span', { id: 'RYGColorScale', className: 'e-ryg e-colorscale-icon' });
        var gwr = this.parent.createElement('span', { id: 'GWRColorScale', className: 'e-gwr e-colorscale-icon' });
        var rwg = this.parent.createElement('span', { id: 'RWGColorScale', className: 'e-rwg e-colorscale-icon' });
        var bwr = this.parent.createElement('span', { id: 'BWRColorScale', className: 'e-bwr e-colorscale-icon' });
        var rwb = this.parent.createElement('span', { id: 'RWBColorScale', className: 'e-rwb e-colorscale-icon' });
        var wr = this.parent.createElement('span', { id: 'WRColorScale', className: 'e-wr e-colorscale-icon' });
        var rw = this.parent.createElement('span', { id: 'RWColorScale', className: 'e-rw e-colorscale-icon' });
        var gw = this.parent.createElement('span', { id: 'GWColorScale', className: 'e-gw e-colorscale-icon' });
        var wg = this.parent.createElement('span', { id: 'WGColorScale', className: 'e-wg e-colorscale-icon' });
        var gy = this.parent.createElement('span', { id: 'GYColorScale', className: 'e-gy e-colorscale-icon' });
        var yg = this.parent.createElement('span', { id: 'YGColorScale', className: 'e-yg e-colorscale-icon' });
        gyr.title = l10n.getConstant('GYRColorScale');
        ryg.title = l10n.getConstant('RYGColorScale');
        gwr.title = l10n.getConstant('GWRColorScale');
        rwg.title = l10n.getConstant('RWGColorScale');
        bwr.title = l10n.getConstant('BWRColorScale');
        rwb.title = l10n.getConstant('RWBColorScale');
        wr.title = l10n.getConstant('WRColorScale');
        rw.title = l10n.getConstant('RWColorScale');
        gw.title = l10n.getConstant('GWColorScale');
        wg.title = l10n.getConstant('WGColorScale');
        gy.title = l10n.getConstant('GYColorScale');
        yg.title = l10n.getConstant('YGColorScale');
        cs1.appendChild(gyr);
        cs1.appendChild(ryg);
        cs1.appendChild(gwr);
        cs1.appendChild(rwg);
        cs2.appendChild(bwr);
        cs2.appendChild(rwb);
        cs2.appendChild(wr);
        cs2.appendChild(rw);
        cs3.appendChild(gw);
        cs3.appendChild(wg);
        cs3.appendChild(gy);
        cs3.appendChild(yg);
        var iconSets = this.parent.createElement('div', { id: 'is', className: 'e-is' });
        var is1 = this.parent.createElement('div', { id: 'is1', className: 'e-is1', innerHTML: 'Directional' });
        var is2 = this.parent.createElement('div', { id: 'is2', className: 'e-is2' });
        var is3 = this.parent.createElement('div', { id: 'is3', className: 'e-is3', innerHTML: 'Shapes' });
        var is4 = this.parent.createElement('div', { id: 'is4', className: 'e-is4' });
        var is5 = this.parent.createElement('div', { id: 'is5', className: 'e-is5', innerHTML: 'Indicators' });
        var is6 = this.parent.createElement('div', { id: 'is6', className: 'e-is6' });
        var is7 = this.parent.createElement('div', { id: 'is7', className: 'e-is7', innerHTML: 'Ratings' });
        var is8 = this.parent.createElement('div', { id: 'is8', className: 'e-is8' });
        is1.title = l10n.getConstant('GYColorScale');
        is2.title = l10n.getConstant('YGColorScale');
        is3.title = l10n.getConstant('GYColorScale');
        is4.title = l10n.getConstant('YGColorScale');
        is5.title = l10n.getConstant('GYColorScale');
        is6.title = l10n.getConstant('YGColorScale');
        is7.title = l10n.getConstant('GYColorScale');
        is8.title = l10n.getConstant('YGColorScale');
        iconSets.appendChild(is1);
        iconSets.appendChild(is2);
        iconSets.appendChild(is3);
        iconSets.appendChild(is4);
        iconSets.appendChild(is5);
        iconSets.appendChild(is6);
        iconSets.appendChild(is7);
        iconSets.appendChild(is8);
        var directional1 = this.parent.createElement('div', { id: 'ThreeArrows', className: 'e-3arrows e-is-wrapper' });
        var directional2 = this.parent.createElement('div', { id: 'ThreeArrowsGray', className: 'e-3arrowsgray e-is-wrapper' });
        var directional3 = this.parent.createElement('div', { id: 'ThreeTriangles', className: 'e-3triangles e-is-wrapper' });
        var directional4 = this.parent.createElement('div', { id: 'FourArrowsGray', className: 'e-4arrowsgray e-is-wrapper' });
        var directional5 = this.parent.createElement('div', { id: 'FourArrows', className: 'e-4arrows e-is-wrapper' });
        var directional6 = this.parent.createElement('div', { id: 'FiveArrowsGray', className: 'e-5arrowsgray e-is-wrapper' });
        var directional7 = this.parent.createElement('div', { id: 'FiveArrows', className: 'e-5arrows e-is-wrapper' });
        directional1.title = l10n.getConstant('ThreeArrowsColor');
        directional2.title = l10n.getConstant('ThreeArrowsGray');
        directional3.title = l10n.getConstant('ThreeTriangles');
        directional4.title = l10n.getConstant('FourArrowsColor');
        directional5.title = l10n.getConstant('FourArrowsGray');
        directional6.title = l10n.getConstant('FiveArrowsColor');
        directional7.title = l10n.getConstant('FiveArrowsGray');
        is2.appendChild(directional1);
        is2.appendChild(directional2);
        is2.appendChild(directional3);
        is2.appendChild(directional4);
        is2.appendChild(directional5);
        is2.appendChild(directional6);
        is2.appendChild(directional7);
        var shapes1 = this.parent.createElement('div', { id: 'ThreeTrafficLights1', className: 'e-3trafficlights e-is-wrapper' });
        var shapes2 = this.parent.createElement('div', { id: 'ThreeTrafficLights2', className: 'e-3rafficlights2 e-is-wrapper' });
        var shapes3 = this.parent.createElement('div', { id: 'ThreeSigns', className: 'e-3signs e-is-wrapper' });
        var shapes4 = this.parent.createElement('div', { id: 'FourTrafficLights', className: 'e-4trafficlights e-is-wrapper' });
        var shapes5 = this.parent.createElement('div', { id: 'FourRedToBlack', className: 'e-4redtoblack e-is-wrapper' });
        shapes1.title = l10n.getConstant('ThreeTrafficLights1');
        shapes2.title = l10n.getConstant('ThreeTrafficLights2');
        shapes3.title = l10n.getConstant('ThreeSigns');
        shapes4.title = l10n.getConstant('FourTrafficLights');
        shapes5.title = l10n.getConstant('RedToBlack');
        is4.appendChild(shapes1);
        is4.appendChild(shapes2);
        is4.appendChild(shapes3);
        is4.appendChild(shapes4);
        is4.appendChild(shapes5);
        var indicators1 = this.parent.createElement('div', { id: 'ThreeSymbols', className: 'e-3symbols e-is-wrapper' });
        var indicators2 = this.parent.createElement('div', { id: 'ThreeSymbols2', className: 'e-3symbols2 e-is-wrapper' });
        var indicators3 = this.parent.createElement('div', { id: 'ThreeFlags', className: 'e-3flags e-is-wrapper' });
        indicators1.title = l10n.getConstant('ThreeSymbols1');
        indicators2.title = l10n.getConstant('ThreeSymbols2');
        indicators3.title = l10n.getConstant('ThreeFlags');
        is6.appendChild(indicators1);
        is6.appendChild(indicators2);
        is6.appendChild(indicators3);
        var ratings1 = this.parent.createElement('div', { id: 'ThreeStars', className: 'e-3stars e-is-wrapper' });
        var ratings2 = this.parent.createElement('div', { id: 'FourRating', className: 'e-4rating e-is-wrapper' });
        var ratings3 = this.parent.createElement('div', { id: 'FiveQuarters', className: 'e-5quarters e-is-wrapper' });
        var ratings4 = this.parent.createElement('div', { id: 'FiveRating', className: 'e-5rating e-is-wrapper' });
        var ratings5 = this.parent.createElement('div', { id: 'FiveBoxes', className: 'e-5boxes e-is-wrapper' });
        ratings1.title = l10n.getConstant('ThreeStars');
        ratings2.title = l10n.getConstant('FourRatings');
        ratings3.title = l10n.getConstant('FiveQuarters');
        ratings4.title = l10n.getConstant('FiveRatings');
        ratings5.title = l10n.getConstant('FiveBoxes');
        is8.appendChild(ratings1);
        is8.appendChild(ratings2);
        is8.appendChild(ratings3);
        is8.appendChild(ratings4);
        is8.appendChild(ratings5);
        directional1.appendChild(this.createElement('span', 'e-3arrows-1 e-iconsetspan'));
        directional1.appendChild(this.createElement('span', 'e-3arrows-2 e-iconsetspan'));
        directional1.appendChild(this.createElement('span', 'e-3arrows-3 e-iconsetspan'));
        directional2.appendChild(this.createElement('span', 'e-3arrowsgray-1 e-iconsetspan'));
        directional2.appendChild(this.createElement('span', 'e-3arrowsgray-2 e-iconsetspan'));
        directional2.appendChild(this.createElement('span', 'e-3arrowsgray-3 e-iconsetspan'));
        directional3.appendChild(this.createElement('span', 'e-3triangles-1 e-iconsetspan'));
        directional3.appendChild(this.createElement('span', 'e-3triangles-2 e-iconsetspan'));
        directional3.appendChild(this.createElement('span', 'e-3triangles-3 e-iconsetspan'));
        directional4.appendChild(this.createElement('span', 'e-4arrowsgray-1 e-iconsetspan'));
        directional4.appendChild(this.createElement('span', 'e-4arrowsgray-2 e-iconsetspan'));
        directional4.appendChild(this.createElement('span', 'e-4arrowsgray-3 e-iconsetspan'));
        directional4.appendChild(this.createElement('span', 'e-4arrowsgray-4 e-iconsetspan'));
        directional5.appendChild(this.createElement('span', 'e-4arrows-1 e-iconsetspan'));
        directional5.appendChild(this.createElement('span', 'e-4arrows-2 e-iconsetspan'));
        directional5.appendChild(this.createElement('span', 'e-4arrows-3 e-iconsetspan'));
        directional5.appendChild(this.createElement('span', 'e-4arrows-4 e-iconsetspan'));
        directional6.appendChild(this.createElement('span', 'e-5arrowsgray-1 e-iconsetspan'));
        directional6.appendChild(this.createElement('span', 'e-5arrowsgray-2 e-iconsetspan'));
        directional6.appendChild(this.createElement('span', 'e-5arrowsgray-3 e-iconsetspan'));
        directional6.appendChild(this.createElement('span', 'e-5arrowsgray-4 e-iconsetspan'));
        directional6.appendChild(this.createElement('span', 'e-5arrowsgray-5 e-iconsetspan'));
        directional7.appendChild(this.createElement('span', 'e-5arrows-1 e-iconsetspan'));
        directional7.appendChild(this.createElement('span', 'e-5arrows-2 e-iconsetspan'));
        directional7.appendChild(this.createElement('span', 'e-5arrows-3 e-iconsetspan'));
        directional7.appendChild(this.createElement('span', 'e-5arrows-4 e-iconsetspan'));
        directional7.appendChild(this.createElement('span', 'e-5arrows-5 e-iconsetspan'));
        shapes1.appendChild(this.createElement('span', 'e-3trafficlights-1 e-iconsetspan'));
        shapes1.appendChild(this.createElement('span', 'e-3trafficlights-2 e-iconsetspan'));
        shapes1.appendChild(this.createElement('span', 'e-3trafficlights-3 e-iconsetspan'));
        shapes2.appendChild(this.createElement('span', 'e-3rafficlights2-1 e-iconsetspan'));
        shapes2.appendChild(this.createElement('span', 'e-3rafficlights2-2 e-iconsetspan'));
        shapes2.appendChild(this.createElement('span', 'e-3rafficlights2-3 e-iconsetspan'));
        shapes3.appendChild(this.createElement('span', 'e-3signs-1 e-iconsetspan'));
        shapes3.appendChild(this.createElement('span', 'e-3signs-2 e-iconsetspan'));
        shapes3.appendChild(this.createElement('span', 'e-3signs-3 e-iconsetspan'));
        shapes4.appendChild(this.createElement('span', 'e-4trafficlights-1 e-iconsetspan'));
        shapes4.appendChild(this.createElement('span', 'e-4trafficlights-2 e-iconsetspan'));
        shapes4.appendChild(this.createElement('span', 'e-4trafficlights-3 e-iconsetspan'));
        shapes4.appendChild(this.createElement('span', 'e-4trafficlights-4 e-iconsetspan'));
        shapes5.appendChild(this.createElement('span', 'e-4redtoblack-1 e-iconsetspan'));
        shapes5.appendChild(this.createElement('span', 'e-4redtoblack-2 e-iconsetspan'));
        shapes5.appendChild(this.createElement('span', 'e-4redtoblack-3 e-iconsetspan'));
        shapes5.appendChild(this.createElement('span', 'e-4redtoblack-4 e-iconsetspan'));
        indicators1.appendChild(this.createElement('span', 'e-3symbols-1 e-iconsetspan'));
        indicators1.appendChild(this.createElement('span', 'e-3symbols-2 e-iconsetspan'));
        indicators1.appendChild(this.createElement('span', 'e-3symbols-3 e-iconsetspan'));
        indicators2.appendChild(this.createElement('span', 'e-3symbols2-1 e-iconsetspan'));
        indicators2.appendChild(this.createElement('span', 'e-3symbols2-2 e-iconsetspan'));
        indicators2.appendChild(this.createElement('span', 'e-3symbols2-3 e-iconsetspan'));
        indicators3.appendChild(this.createElement('span', 'e-3flags-1 e-iconsetspan'));
        indicators3.appendChild(this.createElement('span', 'e-3flags-2 e-iconsetspan'));
        indicators3.appendChild(this.createElement('span', 'e-3flags-3 e-iconsetspan'));
        ratings1.appendChild(this.createElement('span', 'e-3stars-1 e-iconsetspan'));
        ratings1.appendChild(this.createElement('span', 'e-3stars-2 e-iconsetspan'));
        ratings1.appendChild(this.createElement('span', 'e-3stars-3 e-iconsetspan'));
        ratings2.appendChild(this.createElement('span', 'e-4rating-1 e-iconsetspan'));
        ratings2.appendChild(this.createElement('span', 'e-4rating-2 e-iconsetspan'));
        ratings2.appendChild(this.createElement('span', 'e-4rating-3 e-iconsetspan'));
        ratings2.appendChild(this.createElement('span', 'e-4rating-4 e-iconsetspan'));
        ratings3.appendChild(this.createElement('span', 'e-5quarters-1 e-iconsetspan'));
        ratings3.appendChild(this.createElement('span', 'e-5quarters-2 e-iconsetspan'));
        ratings3.appendChild(this.createElement('span', 'e-5quarters-3 e-iconsetspan'));
        ratings3.appendChild(this.createElement('span', 'e-5quarters-4 e-iconsetspan'));
        ratings3.appendChild(this.createElement('span', 'e-5quarters-5 e-iconsetspan'));
        ratings4.appendChild(this.createElement('span', 'e-5rating-1 e-iconsetspan'));
        ratings4.appendChild(this.createElement('span', 'e-5rating-2 e-iconsetspan'));
        ratings4.appendChild(this.createElement('span', 'e-5rating-3 e-iconsetspan'));
        ratings4.appendChild(this.createElement('span', 'e-5rating-4 e-iconsetspan'));
        ratings4.appendChild(this.createElement('span', 'e-5rating-5 e-iconsetspan'));
        ratings5.appendChild(this.createElement('span', 'e-5boxes-1 e-iconsetspan'));
        ratings5.appendChild(this.createElement('span', 'e-5boxes-2 e-iconsetspan'));
        ratings5.appendChild(this.createElement('span', 'e-5boxes-3 e-iconsetspan'));
        ratings5.appendChild(this.createElement('span', 'e-5boxes-4 e-iconsetspan'));
        ratings5.appendChild(this.createElement('span', 'e-5boxes-5 e-iconsetspan'));
        var ul = this.parent.element.appendChild(this.parent.createElement('ul', {
            id: id + '_cf_menu', styles: 'display: none;'
        }));
        this.cFMenu.appendTo(ul);
        ul.classList.add('e-ul');
        this.cFDdb = new DropDownButton({
            iconCss: 'e-icons e-conditionalformatting-icon',
            cssClass: 'e-cf-ddb',
            target: this.cFMenu.element.parentElement,
            created: function () { _this.cFMenu.element.style.display = ''; },
            close: function () { return focus(_this.parent.element); }
        });
        this.cFDdb.createElement = this.parent.createElement;
        this.cFDdb.appendTo(this.parent.createElement('button', { id: id + '_conditionalformatting' }));
        return this.cFDdb.element;
    };
    Ribbon.prototype.createElement = function (tag, className) {
        return this.parent.createElement(tag, { className: className });
    };
    Ribbon.prototype.getBordersDBB = function (id) {
        var _this = this;
        var cPickerWrapper;
        var l10n = this.parent.serviceLocator.getService(locale);
        this.bordersMenu = new Menu({
            cssClass: 'e-borders-menu',
            items: [{ iconCss: 'e-icons e-top-borders', text: l10n.getConstant('TopBorders') }, {
                    iconCss: 'e-icons e-left-borders',
                    text: l10n.getConstant('LeftBorders')
                }, { iconCss: 'e-icons e-right-borders', text: l10n.getConstant('RightBorders') }, {
                    iconCss: 'e-icons e-bottom-borders', text: l10n.getConstant('BottomBorders')
                }, {
                    iconCss: 'e-icons e-all-borders', text: l10n.getConstant('AllBorders')
                }, { iconCss: 'e-icons e-horizontal-borders', text: l10n.getConstant('HorizontalBorders') }, {
                    iconCss: 'e-icons e-vertical-borders', text: l10n.getConstant('VerticalBorders')
                }, {
                    iconCss: 'e-icons e-outside-borders',
                    text: l10n.getConstant('OutsideBorders')
                }, { iconCss: 'e-icons e-inside-borders', text: l10n.getConstant('InsideBorders') },
                { iconCss: 'e-icons e-no-borders', text: l10n.getConstant('NoBorders') }, { separator: true }, {
                    text: l10n.getConstant('BorderColor'), items: [{ id: id + "_border_colors" }]
                }, {
                    text: l10n.getConstant('BorderStyle'), items: [
                        { iconCss: 'e-icons e-selected-icon', id: id + "_1px" }, { id: id + "_2px" },
                        { id: id + "_3px" }, { id: id + "_dashed" },
                        { id: id + "_dotted" }, { id: id + "_double" }
                    ]
                }],
            orientation: 'Vertical',
            beforeOpen: function (args) {
                if (args.parentItem.text === 'Border Color') {
                    _this.colorPicker.refresh();
                    cPickerWrapper = _this.colorPicker.element.parentElement;
                    args.element.firstElementChild.appendChild(cPickerWrapper);
                    cPickerWrapper.style.display = 'inline-block';
                    args.element.parentElement.classList.add('e-border-color');
                }
                else {
                    args.element.classList.add('e-border-style');
                }
            },
            beforeClose: function (args) {
                if (args.parentItem.text === 'Border Color') {
                    if (!closest(args.event.target, '.e-border-colorpicker') ||
                        closest(args.event.target, '.e-apply') || closest(args.event.target, '.e-cancel')) {
                        _this.colorPicker = getComponent(_this.cPickerEle, 'colorpicker');
                        if (_this.colorPicker.mode === 'Picker') {
                            _this.colorPicker.mode = 'Palette';
                            _this.colorPicker.dataBind();
                        }
                        cPickerWrapper.style.display = '';
                        _this.parent.element.appendChild(cPickerWrapper);
                    }
                    else {
                        args.cancel = true;
                    }
                }
            },
            onOpen: function (args) {
                if (args.parentItem.text === 'Border Color') {
                    args.element.parentElement.style.overflow = 'visible';
                }
            },
            select: this.borderSelected.bind(this)
        });
        this.bordersMenu.createElement = this.parent.createElement;
        var ul = this.parent.element.appendChild(this.parent.createElement('ul', {
            id: id + '_borders_menu', styles: 'display: none;'
        }));
        this.bordersMenu.appendTo(ul);
        ul.classList.add('e-ul');
        this.cPickerEle = this.parent.createElement('input', { id: id + "_cell_border_color", attrs: { 'type': 'color' } });
        this.parent.element.appendChild(this.cPickerEle);
        this.colorPicker = new ColorPicker({
            cssClass: 'e-border-colorpicker',
            mode: 'Palette',
            inline: true,
            change: function (args) {
                var border = _this.border.split(' ');
                border[2] = args.currentValue.hex;
                _this.border = border.join(' ');
            },
            created: function () { cPickerWrapper = _this.colorPicker.element.parentElement; }
        });
        this.colorPicker.createElement = this.parent.createElement;
        this.colorPicker.appendTo(this.cPickerEle);
        this.bordersDdb = new DropDownButton({
            iconCss: 'e-icons e-bottom-borders',
            cssClass: 'e-borders-ddb',
            target: this.bordersMenu.element.parentElement,
            created: function () { _this.bordersMenu.element.style.display = ''; },
            beforeOpen: function (args) { return _this.tBarDdbBeforeOpen(args.element.firstElementChild, _this.bordersMenu.items, 1); },
            beforeClose: function (args) {
                if (args.event && closest(args.event.target, '.e-borders-menu')) {
                    args.cancel = true;
                }
            },
            close: function () { return focus(_this.parent.element); }
        });
        this.bordersDdb.createElement = this.parent.createElement;
        this.bordersDdb.appendTo(this.parent.createElement('button', { id: id + '_borders' }));
        return this.bordersDdb.element;
    };
    Ribbon.prototype.chartSelected = function (args) {
        var isChart = !isNullOrUndefined(closest(args.element, '.e-chart-menu'));
        var eleId = args.element.id;
        if (('column_chart' + 'bar_chart' + 'area_chart' + 'pie_doughnut_chart' +
            'line_chart' + 'radar_chart' + 'scatter_chart').includes(eleId)) {
            var id = args.event.target.id;
            this.parent.notify(insertChart, { action: eleId, id: id, isChart: isChart });
        }
    };
    Ribbon.prototype.addChartEleSelected = function (args) {
        var eleId = args.element.id;
        this.parent.notify(chartDesignTab, { addChartEle: eleId });
    };
    Ribbon.prototype.cFSelected = function (args) {
        var eleId = args.element.id;
        if (('cf_greaterthan' + 'cf_lessthan' + 'cf_between' + 'cf_eqaulto' + 'cf_textthatcontains' +
            'cf_adateoccuring' + 'cf_duplicatevalues' + 'cf_top10items' + 'cf_top10' + 'cf_bottom10items' +
            'cf_bottom10' + 'cf_aboveaverage' + 'cf_belowaverage').includes(eleId)) {
            this.parent.notify(initiateConditionalFormat, { action: args.item.text });
        }
        else if (('cf_databars' + 'cf_colorscales').includes(eleId)) {
            var id = args.event.target.id;
            this.parent.notify(setCF, { action: eleId, id: id });
        }
        else if ('cf_iconsets' === args.element.id) {
            var target = args.event.target;
            var iconName = (target.id === '') ? target.parentElement.id : target.id;
            this.parent.notify(setCF, { action: eleId, id: iconName });
        }
        if (eleId === 'cf_cr_cells') {
            this.parent.notify(clearCFRule, { range: this.parent.getActiveSheet().selectedRange, isPublic: false });
        }
        else if (eleId === 'cf_cr_sheet') {
            var sheet = this.parent.getActiveSheet();
            var range = getRangeAddress([0, 0, sheet.rowCount - 1, sheet.colCount - 1]);
            this.parent.conditionalFormat = null;
            this.parent.notify(clearCFRule, { range: range, isPublic: false });
        }
    };
    Ribbon.prototype.borderSelected = function (args) {
        if (args.item.items.length || args.item.id === this.parent.element.id + "_border_colors") {
            return;
        }
        if (!args.item.text) {
            var id = this.parent.element.id;
            var border = this.border.split(' ');
            var prevStyleId_1 = border[1] === 'solid' ? id + "_" + border[0] : id + "_" + border[1];
            if (prevStyleId_1 === args.item.id) {
                return;
            }
            if (args.item.id === id + "_1px" || args.item.id === id + "_2px" || args.item.id === id + "_3px") {
                border[0] = args.item.id.split(id + "_")[1];
                border[1] = 'solid';
            }
            else {
                border[1] = args.item.id.split(id + "_")[1];
                border[0] = border[1] === 'double' ? '3px' : '1px';
            }
            this.border = border.join(' ');
            this.bordersMenu.items[12].items.forEach(function (item) {
                if (item.id === prevStyleId_1) {
                    item.iconCss = null;
                }
                if (item.id === args.item.id) {
                    item.iconCss = 'e-icons e-selected-icon';
                }
            });
            this.bordersMenu.setProperties({ 'items': this.bordersMenu.items }, true);
            return;
        }
        this.bordersDdb.toggle();
        this.parent.showSpinner();
        switch (args.item.text) {
            case 'Top Borders':
                this.parent.notify(setCellFormat, { style: { borderTop: this.border }, onActionUpdate: true });
                break;
            case 'Left Borders':
                this.parent.notify(setCellFormat, { style: { borderLeft: this.border }, onActionUpdate: true });
                break;
            case 'Right Borders':
                this.parent.notify(setCellFormat, { style: { borderRight: this.border }, onActionUpdate: true });
                break;
            case 'Bottom Borders':
                this.parent.notify(setCellFormat, { style: { borderBottom: this.border }, onActionUpdate: true });
                break;
            case 'All Borders':
                this.parent.notify(setCellFormat, { style: { border: this.border }, onActionUpdate: true });
                break;
            case 'Horizontal Borders':
                this.parent.notify(setCellFormat, { style: { border: this.border }, onActionUpdate: true, borderType: 'Horizontal' });
                break;
            case 'Vertical Borders':
                this.parent.notify(setCellFormat, { style: { border: this.border }, onActionUpdate: true, borderType: 'Vertical' });
                break;
            case 'Outside Borders':
                this.parent.notify(setCellFormat, { style: { border: this.border }, onActionUpdate: true, borderType: 'Outer' });
                break;
            case 'Inside Borders':
                this.parent.notify(setCellFormat, { style: { border: this.border }, onActionUpdate: true, borderType: 'Inner' });
                break;
            case 'No Borders':
                this.parent.notify(setCellFormat, { style: { border: '' }, onActionUpdate: true });
                break;
        }
        this.parent.hideSpinner();
    };
    Ribbon.prototype.getFontNameDDB = function (id) {
        var _this = this;
        var fontNameBtn = this.parent.createElement('button', { id: id + '_font_name' });
        fontNameBtn.appendChild(this.parent.createElement('span', { className: 'e-tbar-btn-text', innerHTML: 'Calibri' }));
        this.fontNameDdb = new DropDownButton({
            cssClass: 'e-font-family',
            items: this.getFontFamilyItems(),
            select: function (args) {
                var eventArgs = { style: { fontFamily: args.item.text }, onActionUpdate: true };
                _this.parent.notify(setCellFormat, eventArgs);
                if (!eventArgs.cancel) {
                    _this.refreshFontNameSelection(eventArgs.style.fontFamily);
                }
            },
            close: function () { return focus(_this.parent.element); },
            beforeOpen: function (args) { return _this.tBarDdbBeforeOpen(args.element, args.items); }
        });
        this.fontNameDdb.createElement = this.parent.createElement;
        this.fontNameDdb.appendTo(fontNameBtn);
        return fontNameBtn;
    };
    Ribbon.prototype.getBtn = function (id, name, bindEvent) {
        if (bindEvent === void 0) { bindEvent = true; }
        var btnObj = new Button({ iconCss: "e-icons e-" + name + "-icon", isToggle: true });
        btnObj.createElement = this.parent.createElement;
        btnObj.appendTo(this.parent.createElement('button', { id: id + "_" + name }));
        if (bindEvent) {
            btnObj.element.addEventListener('click', this.toggleBtnClicked.bind(this));
        }
        return btnObj.element;
    };
    Ribbon.prototype.datavalidationDDB = function (id) {
        var _this = this;
        var l10n = this.parent.serviceLocator.getService(locale);
        var direction;
        this.datavalidationDdb = new DropDownButton({
            cssClass: 'e-datavalidation-ddb',
            iconCss: 'e-datavalidation-icon e-icons',
            items: [
                { text: l10n.getConstant('DataValidation') },
                { text: l10n.getConstant('HighlightInvalidData') },
                { text: l10n.getConstant('ClearHighlight') },
                { text: l10n.getConstant('ClearValidation') }
            ],
            beforeOpen: function (args) {
                _this.refreshSelected(_this.datavalidationDdb, args.element, 'iconCss');
            },
            select: function (args) {
                switch (args.item.text) {
                    case l10n.getConstant('DataValidation'):
                        _this.parent.notify(initiateDataValidation, null);
                        break;
                    case l10n.getConstant('HighlightInvalidData'):
                        _this.parent.notify(invalidData, { isRemoveHighlight: false });
                        break;
                    case l10n.getConstant('ClearHighlight'):
                        _this.parent.notify(invalidData, { isRemoveHighlight: true });
                        break;
                    case l10n.getConstant('ClearValidation'):
                        _this.parent.notify(removeDataValidation, null);
                        break;
                    default:
                        direction = args.item.text === l10n.getConstant('SortAscending') ? 'Ascending' : 'Descending';
                        _this.parent.notify(applySort, { sortOptions: { sortDescriptors: { order: direction } } });
                        break;
                }
            },
            close: function () { return focus(_this.parent.element); }
        });
        this.datavalidationDdb.createElement = this.parent.createElement;
        this.datavalidationDdb.appendTo(this.parent.createElement('button', { id: id + '_datavalidation' }));
        return this.datavalidationDdb.element;
    };
    Ribbon.prototype.getTextAlignDDB = function (id) {
        var _this = this;
        this.textAlignDdb = new DropDownButton({
            cssClass: 'e-align-ddb',
            iconCss: 'e-icons e-left-icon',
            items: [{ iconCss: 'e-icons e-left-icon' }, { iconCss: 'e-icons e-center-icon' }, { iconCss: 'e-icons e-right-icon' }],
            beforeItemRender: this.alignItemRender.bind(this),
            beforeOpen: function (args) {
                _this.refreshSelected(_this.textAlignDdb, args.element, 'iconCss');
            },
            select: function (args) {
                var eventArgs = {
                    style: { textAlign: args.item.iconCss.split(' e-')[1].split('-icon')[0] }, onActionUpdate: true
                };
                _this.parent.notify(setCellFormat, eventArgs);
                if (!eventArgs.cancel) {
                    _this.textAlignDdb.iconCss = "e-icons e-" + eventArgs.style.textAlign + "-icon";
                    _this.textAlignDdb.dataBind();
                }
            },
            close: function () { return focus(_this.parent.element); }
        });
        this.textAlignDdb.createElement = this.parent.createElement;
        this.textAlignDdb.appendTo(this.parent.createElement('button', { id: id + '_text_align' }));
        return this.textAlignDdb.element;
    };
    Ribbon.prototype.getVerticalAlignDDB = function (id) {
        var _this = this;
        this.verticalAlignDdb = new DropDownButton({
            cssClass: 'e-align-ddb',
            iconCss: 'e-icons e-bottom-icon',
            items: [{ iconCss: 'e-icons e-top-icon' }, { iconCss: 'e-icons e-middle-icon' }, { iconCss: 'e-icons e-bottom-icon' }],
            beforeItemRender: this.alignItemRender.bind(this),
            beforeOpen: function (args) {
                _this.refreshSelected(_this.verticalAlignDdb, args.element, 'iconCss');
            },
            select: function (args) {
                var eventArgs = {
                    style: { verticalAlign: args.item.iconCss.split(' e-')[1].split('-icon')[0] }, onActionUpdate: true
                };
                _this.parent.notify(setCellFormat, eventArgs);
                if (!eventArgs.cancel) {
                    _this.verticalAlignDdb.iconCss = "e-icons e-" + eventArgs.style.verticalAlign + "-icon";
                    _this.verticalAlignDdb.dataBind();
                }
            },
            close: function () { return focus(_this.parent.element); }
        });
        this.verticalAlignDdb.createElement = this.parent.createElement;
        this.verticalAlignDdb.appendTo(this.parent.createElement('button', { id: id + '_vertical_align' }));
        return this.verticalAlignDdb.element;
    };
    Ribbon.prototype.getMergeSplitBtn = function (id) {
        var _this = this;
        this.parent.element.appendChild(this.parent.createElement('button', { id: id + '_merge' }));
        var l10n = this.parent.serviceLocator.getService(locale);
        this.mergeSplitBtn = new SplitButton({
            cssClass: 'e-merge-ddb',
            iconCss: 'e-icons e-merge-icon',
            items: [{ text: l10n.getConstant('MergeAll'), id: id + "_merge_all" }, { text: l10n.getConstant('MergeHorizontally'), id: id + "_merge_horizontally" }, { text: l10n.getConstant('MergeVertically'), id: id + "_merge_vertically" },
                { separator: true, id: id + "_merge_separator" }, { text: l10n.getConstant('Unmerge'), id: id + "_unmerge" }],
            select: this.mergeSelectHandler.bind(this),
            close: function () { return focus(_this.parent.element); },
            click: function (args) {
                if (args.element.classList.contains('e-active')) {
                    _this.toggleActiveState(false);
                    _this.unMerge();
                }
                else {
                    _this.toggleActiveState(true);
                    _this.merge(_this.parent.element.id + "_merge_all");
                }
            },
            created: function () {
                _this.mergeSplitBtn.element.title = l10n.getConstant('MergeCells');
                _this.mergeSplitBtn.element.nextElementSibling.title = l10n.getConstant('SelectMergeType');
            }
        });
        this.mergeSplitBtn.createElement = this.parent.createElement;
        this.mergeSplitBtn.appendTo('#' + id + '_merge');
        return this.mergeSplitBtn.element.parentElement;
    };
    Ribbon.prototype.mergeSelectHandler = function (args) {
        if (args.item.id === this.parent.element.id + "_unmerge") {
            this.unMerge();
        }
        else {
            this.merge(args.item.id);
        }
    };
    Ribbon.prototype.unMerge = function () {
        this.parent.showSpinner();
        this.parent.notify(setMerge, { merge: false, range: this.parent.getActiveSheet().selectedRange,
            isAction: true, refreshRibbon: true, type: 'All' });
        this.parent.hideSpinner();
    };
    Ribbon.prototype.merge = function (itemId) {
        var _this = this;
        var sheet = this.parent.getActiveSheet();
        var indexes = getRangeIndexes(sheet.selectedRange);
        var cell;
        var isDataPresent;
        for (var i = indexes[0]; i <= indexes[2]; i++) {
            for (var j = indexes[1]; j <= indexes[3]; j++) {
                if (i === indexes[0] && j === indexes[1] && itemId.includes('merge_all')) {
                    continue;
                }
                if (i === indexes[0] && itemId.includes('merge_vertically')) {
                    continue;
                }
                if (j === indexes[1] && itemId.includes('_merge_horizontally')) {
                    continue;
                }
                cell = getCell(i, j, sheet) || {};
                if (cell.value || cell.formula) {
                    isDataPresent = true;
                }
            }
        }
        if (!isDataPresent) {
            this.performMerge(itemId);
            return;
        }
        var dialogInst = this.parent.serviceLocator.getService(dialog);
        dialogInst.show({
            target: this.parent.element, height: 200, width: 400, isModal: true, showCloseIcon: true,
            content: this.parent.serviceLocator.getService(locale).getConstant('MergeCellsAlert'),
            beforeOpen: function (args) {
                var dlgArgs = {
                    dialogName: 'MergeAlertDialog',
                    element: args.element, target: args.target, cancel: args.cancel
                };
                _this.parent.trigger('dialogBeforeOpen', dlgArgs);
                if (dlgArgs.cancel) {
                    args.cancel = true;
                }
                focus(_this.parent.element);
            },
            buttons: [{
                    buttonModel: { content: this.parent.serviceLocator.getService(locale).getConstant('Ok'), isPrimary: true },
                    click: function () { dialogInst.hide(); _this.performMerge(itemId); }
                }]
        });
    };
    Ribbon.prototype.performMerge = function (itemId) {
        var id = this.parent.element.id;
        this.parent.showSpinner();
        switch (itemId) {
            case id + "_merge_all":
                this.parent.notify(setMerge, { merge: true, range: this.parent.getActiveSheet().selectedRange,
                    type: 'All', isAction: true, refreshRibbon: true });
                break;
            case id + "_merge_horizontally":
                this.parent.notify(setMerge, { merge: true, range: this.parent.getActiveSheet().selectedRange,
                    type: 'Horizontally', isAction: true });
                break;
            case id + "_merge_vertically":
                this.parent.notify(setMerge, { merge: true, range: this.parent.getActiveSheet().selectedRange,
                    type: 'Vertically', isAction: true });
                break;
        }
        this.parent.hideSpinner();
    };
    Ribbon.prototype.getSortFilterDDB = function (id) {
        var _this = this;
        var l10n = this.parent.serviceLocator.getService(locale);
        var direction;
        this.sortingDdb = new DropDownButton({
            cssClass: 'e-sort-filter-ddb',
            iconCss: 'e-icons e-sort-filter-icon',
            items: [
                { text: l10n.getConstant('SortAscending'), iconCss: 'e-icons e-sort-asc' },
                { text: l10n.getConstant('SortDescending'), iconCss: 'e-icons e-sort-desc' },
                { text: l10n.getConstant('CustomSort') + '...', iconCss: 'e-icons e-sort-custom' },
                { separator: true },
                { text: l10n.getConstant('Filter'), iconCss: 'e-icons e-filter-apply', id: id + '_applyfilter' },
                { text: l10n.getConstant('ClearAllFilter'), iconCss: 'e-icons e-filter-clear', id: id + '_clearfilter' },
                { text: l10n.getConstant('ReapplyFilter'), iconCss: 'e-icons e-filter-reapply', id: id + '_reapplyfilter' }
            ],
            beforeItemRender: function (args) {
                var eventArgs = { isFiltered: false, isClearAll: true };
                _this.parent.notify(getFilteredColumn, eventArgs);
                if (args.item.id === id + '_clearfilter' || args.item.id === id + '_reapplyfilter') {
                    if (!eventArgs.isFiltered) {
                        args.element.classList.add('e-disabled');
                    }
                    else {
                        args.element.classList.remove('e-disabled');
                    }
                }
                else if (args.item.id === id + '_applyfilter') {
                    var sheet = _this.parent.getActiveSheet();
                    if (sheet.frozenColumns || sheet.frozenRows) {
                        args.element.classList.add('e-disabled');
                    }
                }
            },
            beforeOpen: function (args) {
                _this.refreshSelected(_this.sortingDdb, args.element, 'iconCss');
            },
            select: function (args) {
                switch (args.item.text) {
                    case l10n.getConstant('Filter'):
                        _this.parent.applyFilter();
                        break;
                    case l10n.getConstant('ClearAllFilter'):
                        _this.parent.clearFilter();
                        break;
                    case l10n.getConstant('ReapplyFilter'):
                        _this.parent.notify(reapplyFilter, null);
                        break;
                    case l10n.getConstant('CustomSort') + '...':
                        _this.parent.notify(initiateCustomSort, null);
                        break;
                    default:
                        direction = args.item.text === l10n.getConstant('SortAscending') ? 'Ascending' : 'Descending';
                        _this.parent.notify(applySort, { sortOptions: { sortDescriptors: { order: direction } } });
                        break;
                }
            },
            close: function () { return focus(_this.parent.element); }
        });
        this.sortingDdb.createElement = this.parent.createElement;
        this.sortingDdb.appendTo(this.parent.createElement('button', { id: id + '_sorting' }));
        return this.sortingDdb.element;
    };
    Ribbon.prototype.getFindDDb = function (id) {
        var _this = this;
        var findToolbtn = this.parent.createElement('button', { id: id + '_findbtn' });
        this.findDdb = new Button({
            cssClass: 'e-spreadsheet-find-ddb e-caret-hide',
            iconCss: 'e-icons e-search-icon'
        });
        this.findDdb.createElement = this.parent.createElement;
        this.findDdb.appendTo(findToolbtn);
        findToolbtn.onclick = function () {
            _this.findToolDlg();
        };
        return this.findDdb.element;
    };
    Ribbon.prototype.findToolDlg = function () {
        var _this = this;
        var countArgs;
        if (isNullOrUndefined(this.parent.element.querySelector('.e-findtool-dlg'))) {
            // eslint-disable-next-line prefer-const
            var toolbarObj_1;
            var findTextElement = this.parent.createElement('div', { className: 'e-input-group' });
            var findTextInput = this.parent.createElement('input', {
                className: 'e-input e-text-findNext-short', attrs: { 'type': 'Text', value: this.findValue }
            });
            var l10n = this.parent.serviceLocator.getService(locale);
            findTextInput.setAttribute('placeholder', l10n.getConstant('FindValue'));
            var findSpan_1 = this.parent.createElement('span', { className: 'e-input-group-icon' });
            findTextInput.onkeyup = function () {
                countArgs = { countOpt: 'count', findCount: '' };
                _this.parent.notify(findHandler, { countArgs: countArgs });
                findSpan_1.textContent = countArgs.findCount;
                var element = document.querySelector('.e-text-findNext-short');
                var value = element.value;
                var nextElement = document.querySelector('.e-findRib-next');
                var prevElement = document.querySelector('.e-findRib-prev');
                if (isNullOrUndefined(value) || (value === '') || (countArgs.findCount === '0 of 0')) {
                    toolbarObj_1.enableItems(nextElement, false);
                    toolbarObj_1.enableItems(prevElement, false);
                    findSpan_1.textContent = '0 of 0';
                }
                else if (!isNullOrUndefined(value) || (countArgs.findCount !== '0 of 0')) {
                    toolbarObj_1.enableItems(nextElement, true);
                    toolbarObj_1.enableItems(prevElement, true);
                }
            };
            findTextInput.onkeydown = function (e) {
                countArgs = { countOpt: 'count', findCount: '' };
                _this.parent.notify(findHandler, { countArgs: countArgs });
                var count = countArgs.findCount;
                _this.findOnKeyDown(e, count);
            };
            findTextElement.appendChild(findTextInput);
            findTextElement.appendChild(findSpan_1);
            var toolItemModel = [
                { type: 'Input', template: findTextElement },
                {
                    prefixIcon: 'e-icons e-prev-icon', tooltipText: 'Find Previous', type: 'Button', cssClass: 'e-findRib-prev',
                    disabled: true
                },
                { prefixIcon: 'e-icons e-next-icon', tooltipText: 'Find Next', type: 'Button', cssClass: 'e-findRib-next', disabled: true },
                { type: 'Separator' },
                { prefixIcon: 'e-icons e-option-icon', tooltipText: 'More Options', type: 'Button', cssClass: 'e-findRib-more' },
                { prefixIcon: 'e-icons e-close', tooltipText: 'Close', type: 'Button', cssClass: 'e-findRib-close' }
            ];
            toolbarObj_1 = new Toolbar({
                clicked: function (args) {
                    if (args.item.cssClass === 'e-findRib-next') {
                        _this.parent.notify(findHandler, { findOption: 'next' });
                        countArgs = { countOpt: 'count', findCount: '' };
                        _this.parent.notify(findHandler, { countArgs: countArgs });
                        findSpan_1.textContent = countArgs.findCount;
                    }
                    else if (args.item.cssClass === 'e-findRib-prev') {
                        _this.parent.notify(findHandler, { findOption: 'prev' });
                        countArgs = { countOpt: 'count', findCount: '' };
                        _this.parent.notify(findHandler, { countArgs: countArgs });
                        findSpan_1.textContent = countArgs.findCount;
                    }
                    else if (args.item.cssClass === 'e-findRib-more') {
                        _this.parent.notify(findDlg, null);
                        _this.findDialog.hide();
                    }
                }, width: 'auto', height: 'auto', items: toolItemModel, cssClass: 'e-find-toolObj'
            });
            var toolbarElement_1 = this.parent.createElement('div', { className: 'e-find-toolbar' });
            var dialogDiv = this.parent.createElement('div', { className: 'e-dlg-div' });
            this.findDialog = new FindDialog({
                isModal: false, showCloseIcon: false, cssClass: 'e-findtool-dlg', content: toolbarElement_1, visible: false,
                allowDragging: true, target: this.parent.element.querySelector('.e-sheet'),
                beforeOpen: function () {
                    EventHandler.add(document, 'click', _this.closeDialog, _this);
                },
                open: function () {
                    _this.textFocus(toolbarObj_1.element);
                },
                beforeClose: function () {
                    _this.findValue = _this.parent.element.querySelector('.e-text-findNext-short').value;
                    toolbarObj_1.destroy();
                    var element = document.querySelector('.e-find-toolbar');
                    EventHandler.remove(element, 'focus', _this.textFocus);
                    EventHandler.remove(document, 'click', _this.closeDialog);
                    focus(_this.parent.element);
                },
                created: function () {
                    toolbarObj_1.createElement = _this.parent.createElement;
                    toolbarObj_1.appendTo(toolbarElement_1);
                    _this.findDialog.width = getComputedStyle(document.querySelector('.e-findtool-dlg')).width;
                    var offset = _this.parent.element.querySelector('.e-main-panel').getBoundingClientRect();
                    var width = _this.findDialog.width.toString();
                    _this.findDialog.position = { X: offset.width - parseInt(width, 10) - (_this.parent.allowScrolling ? getScrollBarWidth() :
                            0), Y: _this.parent.getActiveSheet().showHeaders ? 31 : 0 };
                    _this.findDialog.dataBind();
                    _this.findDialog.show();
                }
            });
            this.findDialog.createElement = this.parent.createElement;
            this.findDialog.appendTo(dialogDiv);
        }
        else {
            if (!isNullOrUndefined(this.parent.element.querySelector('.e-findtool-dlg'))) {
                this.findDialog.hide();
                detach(this.parent.element.querySelector('.e-findtool-dlg'));
                this.findDialog = null;
                focus(this.parent.element);
            }
        }
    };
    Ribbon.prototype.findOnKeyDown = function (e, count) {
        if (document.querySelector('.e-text-findNext-short').value) {
            if (count !== '0 of 0') {
                if (e.shiftKey) {
                    if (e.keyCode === 13) {
                        var buttonArgs = { findOption: 'prev' };
                        this.parent.notify(findHandler, buttonArgs);
                    }
                }
                else if (e.keyCode === 13) {
                    var buttonArg = { findOption: 'next' };
                    this.parent.notify(findHandler, buttonArg);
                }
            }
        }
    };
    Ribbon.prototype.closeDialog = function (e) {
        if ((closest(e.target, '.e-findRib-close')) || (!closest(e.target, '.e-spreadsheet'))) {
            if (!isNullOrUndefined(this.findDialog)) {
                this.findDialog.hide();
                detach(this.parent.element.querySelector('.e-findtool-dlg'));
                this.findDialog = null;
            }
        }
    };
    Ribbon.prototype.textFocus = function (element) {
        element = document.querySelector('.e-find-toolbar');
        element.addEventListener('focus', function () {
            var elements = document.querySelector('.e-text-findNext-short');
            elements.focus();
            elements.classList.add('e-input-focus');
            (elements).setSelectionRange(0, elements.value.length);
        });
    };
    Ribbon.prototype.getClearDDB = function (id) {
        var _this = this;
        var l10n = this.parent.serviceLocator.getService(locale);
        this.clearDdb = new DropDownButton({
            cssClass: 'e-clear-ddb',
            iconCss: 'e-icons e-clear-icon',
            items: [
                { text: l10n.getConstant('ClearAll') },
                { text: l10n.getConstant('ClearFormats') },
                { text: l10n.getConstant('ClearContents') },
                { text: l10n.getConstant('ClearHyperlinks') }
            ],
            select: function (args) {
                _this.parent.notify(clearViewer, { options: { type: args.item.text } });
            },
            close: function () { return focus(_this.parent.element); }
        });
        this.clearDdb.createElement = this.parent.createElement;
        this.clearDdb.appendTo(this.parent.createElement('button', { id: id + '_clear' }));
        return this.clearDdb.element;
    };
    Ribbon.prototype.ribbonCreated = function () {
        this.ribbon.element.querySelector('.e-drop-icon').title
            = this.parent.serviceLocator.getService(locale).getConstant('CollapseToolbar');
    };
    Ribbon.prototype.alignItemRender = function (args) {
        var text = args.item.iconCss.split(' e-')[1].split('-icon')[0];
        text = text[0].toUpperCase() + text.slice(1, text.length);
        args.element.title = this.parent.serviceLocator.getService(locale).getConstant('Align' + text);
    };
    Ribbon.prototype.toggleBtnClicked = function (e) {
        var target = closest(e.target, '.e-btn');
        var parentId = this.parent.element.id;
        var id = target.id;
        var property = setCellFormat;
        var value;
        var defaultModel;
        var activeModel;
        var eventArgs;
        var key;
        switch (id) {
            case parentId + "_bold":
                defaultModel = { fontWeight: 'normal' };
                activeModel = { fontWeight: 'bold' };
                key = 'fontWeight';
                break;
            case parentId + "_italic":
                defaultModel = { fontStyle: 'normal' };
                activeModel = { fontStyle: 'italic' };
                key = 'fontStyle';
                break;
            case parentId + "_line-through":
                property = textDecorationUpdate;
                defaultModel = { textDecoration: 'line-through' };
                activeModel = defaultModel;
                key = 'textDecoration';
                break;
            case parentId + "_underline":
                property = textDecorationUpdate;
                defaultModel = { textDecoration: 'underline' };
                activeModel = defaultModel;
                key = 'textDecoration';
                break;
        }
        if (target.classList.contains('e-active')) {
            value = activeModel[key];
            eventArgs = { style: activeModel, onActionUpdate: true };
            this.parent.notify(property, eventArgs);
            if (eventArgs.cancel) {
                target.classList.remove('e-active');
            }
        }
        else {
            value = defaultModel[key];
            eventArgs = { style: defaultModel, onActionUpdate: true };
            this.parent.notify(property, eventArgs);
            if (eventArgs.cancel) {
                target.classList.add('e-active');
            }
        }
        if (!eventArgs.cancel && value !== eventArgs.style[key]) {
            this.refreshToggleBtn(getCellIndexes(this.parent.getActiveSheet().activeCell));
        }
        focus(this.parent.element);
    };
    Ribbon.prototype.getCellStyleValue = function (cssProp, indexes) {
        var cell = getCell(indexes[0], indexes[1], this.parent.getActiveSheet());
        var value = this.parent.cellStyle[cssProp];
        if (cell && cell.style && cell.style[cssProp]) {
            value = cell.style[cssProp];
        }
        return value;
    };
    Ribbon.prototype.refreshSelected = function (inst, element, key, itemKey) {
        if (itemKey === void 0) { itemKey = key; }
        for (var i = 0; i < inst.items.length; i++) {
            if (inst.items[i][itemKey] === inst[key]) {
                element.children[i].classList.add('e-selected');
                break;
            }
        }
    };
    Ribbon.prototype.expandCollapseHandler = function (args) {
        var target = this.ribbon.element.querySelector('.e-drop-icon');
        var l10n = this.parent.serviceLocator.getService(locale);
        if (args.expanded) {
            target.title = l10n.getConstant('CollapseToolbar');
        }
        else {
            target.title = l10n.getConstant('ExpandToolbar');
        }
        this.parent.setPanelSize();
    };
    Ribbon.prototype.getChartThemeDdbItems = function () {
        var l10n = this.parent.serviceLocator.getService(locale);
        return [
            { id: 'Material', text: l10n.getConstant('Material') },
            { id: 'Fabric', text: l10n.getConstant('Fabric') },
            { id: 'Bootstrap', text: l10n.getConstant('Bootstrap') },
            { id: 'HighContrastLight', text: l10n.getConstant('HighContrastLight') },
            { id: 'MaterialDark', text: l10n.getConstant('MaterialDark') },
            { id: 'FabricDark', text: l10n.getConstant('FabricDark') },
            { id: 'HighContrast', text: l10n.getConstant('HighContrast') },
            { id: 'BootstrapDark', text: l10n.getConstant('BootstrapDark') },
            { id: 'Bootstrap4', text: l10n.getConstant('Bootstrap4') }
        ];
    };
    Ribbon.prototype.getNumFormatDdbItems = function (id) {
        var l10n = this.parent.serviceLocator.getService(locale);
        return [
            { id: id + '_General', text: l10n.getConstant('General') },
            { id: id + '_Number', text: l10n.getConstant('Number') },
            { id: id + '_Currency', text: l10n.getConstant('Currency') },
            { id: id + '_Accounting', text: l10n.getConstant('Accounting') },
            { id: id + '_ShortDate', text: l10n.getConstant('ShortDate') },
            { id: id + '_LongDate', text: l10n.getConstant('LongDate') },
            { id: id + '_Time', text: l10n.getConstant('Time') },
            { id: id + '_Percentage', text: l10n.getConstant('Percentage') },
            { id: id + '_Fraction', text: l10n.getConstant('Fraction') },
            { id: id + '_Scientific', text: l10n.getConstant('Scientific') },
            { id: id + '_Text', text: l10n.getConstant('Text') }
        ];
    };
    Ribbon.prototype.getFontFamilyItems = function () {
        return [{ text: 'Arial' }, { text: 'Arial Black' }, { text: 'Axettac Demo' }, { text: 'Batang' }, { text: 'Book Antiqua' },
            { text: 'Calibri', iconCss: 'e-icons e-selected-icon' }, { text: 'Courier' }, { text: 'Courier New' },
            { text: 'Din Condensed' }, { text: 'Georgia' }, { text: 'Helvetica' }, { text: 'Helvetica New' }, { text: 'Roboto' },
            { text: 'Tahoma' }, { text: 'Times New Roman' }, { text: 'Verdana' }];
    };
    Ribbon.prototype.numDDBSelect = function (args) {
        var eventArgs = {
            format: getFormatFromType(args.item.id.split(this.parent.element.id + '_')[1]),
            range: this.parent.getActiveSheet().selectedRange, cancel: false, requestType: 'NumberFormat'
        };
        var actionArgs = {
            range: this.parent.getActiveSheet().name + '!' + eventArgs.range,
            format: eventArgs.format, requestType: 'NumberFormat'
        };
        this.parent.trigger('beforeCellFormat', eventArgs);
        this.parent.notify(beginAction, { eventArgs: eventArgs, action: 'format' });
        if (eventArgs.cancel) {
            return;
        }
        this.parent.notify(applyNumberFormatting, eventArgs);
        this.parent.notify(selectionComplete, { type: 'mousedown' });
        this.refreshNumFormatSelection(args.item.text);
        this.parent.notify(completeAction, { eventArgs: actionArgs, action: 'format' });
    };
    Ribbon.prototype.chartThemeDDBSelect = function (args) {
        this.parent.notify(selectionComplete, { type: 'mousedown' });
        this.refreshChartThemeSelection(args.item.id);
        this.parent.notify(chartDesignTab, { chartTheme: args.item.id });
    };
    Ribbon.prototype.tBarDdbBeforeOpen = function (element, items, separatorCount) {
        if (separatorCount === void 0) { separatorCount = 0; }
        var viewportHeight = this.parent.viewport.height;
        var actualHeight = (parseInt(getComputedStyle(element.firstElementChild).height, 10) * (items.length - separatorCount)) +
            (parseInt(getComputedStyle(element).paddingTop, 10) * 2);
        if (separatorCount) {
            var separatorStyle = getComputedStyle(element.querySelector('.e-separator'));
            actualHeight += (separatorCount * (parseInt(separatorStyle.borderBottomWidth, 10) + (parseInt(separatorStyle.marginTop, 10) * 2)));
        }
        if (actualHeight > viewportHeight) {
            element.style.height = viewportHeight + "px";
            element.style.overflowY = 'auto';
        }
        else {
            if (element.style.height) {
                element.style.height = '';
                element.style.overflowY = '';
            }
        }
    };
    Ribbon.prototype.numDDBOpen = function (args) {
        this.numPopupWidth = 0;
        var elemList = args.element.querySelectorAll('span.e-numformat-preview-text');
        for (var i = 0, len = elemList.length; i < len; i++) {
            if (this.numPopupWidth < elemList[i].offsetWidth) {
                this.numPopupWidth = elemList[i].offsetWidth;
            }
        }
        var popWidth = this.numPopupWidth + 160;
        document.querySelector('.e-numformat-ddb.e-dropdown-popup').style.width = popWidth + "px";
    };
    Ribbon.prototype.previewNumFormat = function (args) {
        var cellIndex = getCellIndexes(this.parent.getActiveSheet().activeCell);
        var cell = getCell(cellIndex[0], cellIndex[1], this.parent.getActiveSheet());
        var eventArgs = {
            type: args.item.text,
            formattedText: '',
            value: cell && cell.value ? cell.value : '',
            format: getFormatFromType(args.item.id.split(this.parent.element.id + '_')[1]),
            sheetIndex: this.parent.activeSheetIndex,
            onLoad: true
        };
        var numElem = this.parent.createElement('div', {
            className: 'e-numformat-text',
            styles: 'width:100%',
            innerHTML: args.element.innerHTML
        });
        args.element.innerHTML = '';
        this.parent.notify(getFormattedCellObject, eventArgs);
        var previewElem = this.parent.createElement('span', {
            className: 'e-numformat-preview-text',
            styles: 'float:right;',
            innerHTML: eventArgs.formattedText.toString()
        });
        numElem.appendChild(previewElem);
        args.element.appendChild(numElem);
    };
    Ribbon.prototype.refreshRibbonContent = function (activeTab) {
        if (!this.ribbon) {
            return;
        }
        if (isNullOrUndefined(activeTab)) {
            activeTab = this.ribbon.selectedTab;
        }
        var l10n = this.parent.serviceLocator.getService(locale);
        var sheet = this.parent.getActiveSheet();
        switch (this.ribbon.items[activeTab].header.text) {
            case l10n.getConstant('Home'):
                this.refreshHomeTabContent(getCellIndexes(sheet.activeCell));
                break;
            case l10n.getConstant('Insert'):
                // Second tab functionality comes here
                break;
            case l10n.getConstant('Formulas'):
                // Third tab functionality comes here
                break;
            case l10n.getConstant('Data'):
                this.refreshDataTabContent(activeTab);
                break;
            case l10n.getConstant('View'):
                this.refreshViewTabContent(activeTab);
                break;
        }
    };
    Ribbon.prototype.refreshHomeTabContent = function (indexes) {
        if (!isNullOrUndefined(document.getElementById(this.parent.element.id + '_number_format'))) {
            this.numFormatDDB = getComponent(document.getElementById(this.parent.element.id + '_number_format'), DropDownButton);
        }
        var sheet = this.parent.getActiveSheet();
        var actCell = getCellIndexes(this.parent.getActiveSheet().activeCell);
        var l10n = this.parent.serviceLocator.getService(locale);
        var cell = getCell(actCell[0], actCell[1], this.parent.getActiveSheet()) || {};
        var type = getTypeFromFormat(cell.format ? cell.format : 'General');
        if (this.numFormatDDB) {
            if (sheet.isProtected && !sheet.protectSettings.formatCells) {
                type = 'General';
                this.refreshNumFormatSelection(type);
            }
            else {
                this.refreshNumFormatSelection(l10n.getConstant(type));
            }
        }
        if (this.fontNameDdb) {
            if (sheet.isProtected && !sheet.protectSettings.formatCells) {
                this.refreshFontNameSelection('Calibri');
            }
            else {
                this.refreshFontNameSelection(this.getCellStyleValue('fontFamily', indexes));
            }
        }
        if (this.fontSizeDdb) {
            var value = this.getCellStyleValue('fontSize', indexes);
            if (sheet.isProtected && !sheet.protectSettings.formatCells) {
                this.fontSizeDdb.content = '11';
            }
            else {
                value = value.includes('pt') ? value.split('pt')[0] : '11';
                if (value !== this.fontSizeDdb.content) {
                    this.fontSizeDdb.content = value;
                    this.fontSizeDdb.dataBind();
                }
            }
        }
        if (this.textAlignDdb) {
            var style = this.getCellStyleValue('textAlign', indexes);
            if (sheet.isProtected && !sheet.protectSettings.formatCells) {
                this.textAlignDdb.iconCss = 'e-icons e-left-icon';
            }
            else {
                if (cell.value !== undefined && style === 'left' && (type === 'Accounting' || isNumber(cell.value))) {
                    style = 'right';
                }
                var value = "e-icons e-" + style.toLowerCase() + "-icon";
                if (value !== this.textAlignDdb.iconCss) {
                    this.textAlignDdb.iconCss = value;
                    this.textAlignDdb.dataBind();
                }
            }
        }
        if (this.verticalAlignDdb) {
            var value = "e-icons e-" + this.getCellStyleValue('verticalAlign', indexes).toLowerCase() + "-icon";
            if (sheet.isProtected && !sheet.protectSettings.formatCells) {
                this.verticalAlignDdb.iconCss = 'e-icons e-bottom-icon';
            }
            else {
                if (value !== this.verticalAlignDdb.iconCss) {
                    this.verticalAlignDdb.iconCss = value;
                    this.verticalAlignDdb.dataBind();
                }
            }
        }
        this.refreshToggleBtn(indexes);
        if (!sheet.isProtected && (cell.rowSpan > 1 || cell.colSpan > 1)) {
            this.enableToolbarItems([{ tab: l10n.getConstant('Home'), items: [this.parent.element.id + "_merge_cells"],
                    enable: true }]);
            this.toggleActiveState(true);
        }
        else {
            var indexes_1 = getRangeIndexes(sheet.selectedRange);
            this.enableToolbarItems([{ tab: l10n.getConstant('Home'), items: [this.parent.element.id + "_merge_cells"],
                    enable: indexes_1[0] !== indexes_1[2] || indexes_1[1] !== indexes_1[3] ? true : false }]);
            this.toggleActiveState(false);
        }
    };
    Ribbon.prototype.toggleActiveState = function (active) {
        var l10n = this.parent.serviceLocator.getService(locale);
        if (!this.parent.getActiveSheet().isProtected) {
            if (active) {
                this.mergeSplitBtn.element.classList.add('e-active');
                this.mergeSplitBtn.element.title = l10n.getConstant('UnmergeCells');
            }
            else {
                if (this.mergeSplitBtn.element.classList.contains('e-active')) {
                    this.mergeSplitBtn.element.classList.remove('e-active');
                }
                this.mergeSplitBtn.element.title = l10n.getConstant('MergeCells');
            }
        }
    };
    Ribbon.prototype.refreshToggleBtn = function (indexes) {
        var _this = this;
        var sheet = this.parent.getActiveSheet();
        var btn;
        var id = this.parent.element.id;
        var value;
        var isActive;
        var cell = getCell(indexes[0], indexes[1], sheet);
        var fontProps = ['fontWeight', 'fontStyle', 'textDecoration', 'textDecoration'];
        ['bold', 'italic', 'line-through', 'underline', 'wrap'].forEach(function (name, index) {
            btn = document.getElementById(id + "_" + name);
            if (btn) {
                if (sheet.isProtected && !sheet.protectSettings.formatCells) {
                    btn.classList.remove('e-active');
                }
                else if (name === 'wrap') {
                    isActive = cell && cell.wrap;
                }
                else {
                    value = _this.getCellStyleValue(fontProps[index], indexes).toLowerCase();
                    isActive = value.indexOf(name) > -1;
                }
                if (isActive) {
                    btn.classList.add('e-active');
                }
                else {
                    if (btn.classList.contains('e-active')) {
                        btn.classList.remove('e-active');
                    }
                }
            }
        });
    };
    Ribbon.prototype.refreshFontNameSelection = function (fontFamily) {
        fontFamily = fontFamily.split('"').join('');
        this.fontNameDdb.element.firstElementChild.textContent = fontFamily;
        for (var i = 0; i < this.fontNameDdb.items.length; i++) {
            if (this.fontNameDdb.items[i].text === fontFamily) {
                this.fontNameDdb.items[i].iconCss = 'e-icons e-selected-icon';
                if (i !== this.fontNameIndex) {
                    this.fontNameDdb.items[this.fontNameIndex].iconCss = '';
                }
                this.fontNameDdb.setProperties({ 'items': this.fontNameDdb.items }, true);
                this.fontNameIndex = i;
                break;
            }
        }
        if (['Arial', 'Arial Black', 'Axettac Demo', 'Batang', 'Book Antiqua', 'Calibri', 'Courier',
            'Courier New', 'Din Condensed', 'Georgia', 'Helvetica', 'Helvetica New', 'Roboto',
            'Tahoma', 'Times New Roman', 'Verdana'].indexOf(fontFamily) < 0) {
            this.fontNameDdb.items[this.fontNameIndex].iconCss = '';
        }
    };
    Ribbon.prototype.refreshNumFormatSelection = function (type) {
        for (var i = 0; i < this.numFormatDDB.items.length; i++) {
            if (this.numFormatDDB.items[i].iconCss !== '') {
                this.numFormatDDB.items[i].iconCss = '';
            }
            if (this.numFormatDDB.items[i].text === type) {
                this.numFormatDDB.items[i].iconCss = 'e-icons e-selected-icon';
            }
        }
        this.numFormatDDB.element.firstElementChild.textContent = type;
        this.numFormatDDB.setProperties({ 'items': this.numFormatDDB.items }, true);
    };
    Ribbon.prototype.refreshChartThemeSelection = function (chartTheme) {
        if (chartTheme !== this.chartThemeDDB.items[this.chartThemeIndex].text) {
            this.chartThemeDDB.element.firstElementChild.textContent = this.getChartThemeText(chartTheme);
            for (var i = 0; i < this.chartThemeDDB.items.length; i++) {
                if (this.chartThemeDDB.items[i].id === chartTheme) {
                    this.chartThemeDDB.items[i].iconCss = 'e-icons e-selected-icon';
                    this.chartThemeDDB.items[this.chartThemeIndex].iconCss = '';
                    this.chartThemeDDB.setProperties({ 'items': this.chartThemeDDB.items }, true);
                    this.chartThemeIndex = i;
                    break;
                }
            }
        }
    };
    Ribbon.prototype.getChartThemeText = function (theme) {
        var l10n = this.parent.serviceLocator.getService(locale);
        var selectedTheme = '';
        switch (theme) {
            case 'Material':
                selectedTheme = l10n.getConstant('Material');
                break;
            case 'Fabric':
                selectedTheme = l10n.getConstant('Fabric');
                break;
            case 'Bootstrap':
                selectedTheme = l10n.getConstant('Bootstrap');
                break;
            case 'HighContrastLight':
                selectedTheme = l10n.getConstant('HighContrastLight');
                break;
            case 'MaterialDark':
                selectedTheme = l10n.getConstant('MaterialDark');
                break;
            case 'FabricDark':
                selectedTheme = l10n.getConstant('FabricDark');
                break;
            case 'HighContrast':
                selectedTheme = l10n.getConstant('HighContrast');
                break;
            case 'BootstrapDark':
                selectedTheme = l10n.getConstant('BootstrapDark');
                break;
            case 'Bootstrap4':
                selectedTheme = l10n.getConstant('Bootstrap4');
                break;
        }
        return selectedTheme;
    };
    Ribbon.prototype.fileMenuItemSelect = function (args) {
        var _this = this;
        var selectArgs = extend({ cancel: false }, args);
        this.parent.trigger('fileMenuItemSelect', selectArgs);
        var id = this.parent.element.id;
        var dialogInst;
        if (!selectArgs.cancel) {
            switch (args.item.id) {
                case id + "_Open":
                    select('#' + id + '_fileUpload', this.parent.element).click();
                    break;
                case id + "_Xlsx":
                case id + "_Xls":
                case id + "_Csv":
                case id + "_Pdf":
                    this.parent.save({ saveType: args.item.id.split(id + "_")[1] });
                    break;
                case id + "_New":
                    dialogInst = this.parent.serviceLocator.getService(dialog);
                    dialogInst.show({
                        height: 200, width: 400, isModal: true, showCloseIcon: true,
                        content: this.parent.serviceLocator.getService(locale).getConstant('DestroyAlert'),
                        beforeOpen: function (args) {
                            var dlgArgs = {
                                dialogName: 'DestroySheetDialog',
                                element: args.element, target: args.target, cancel: args.cancel
                            };
                            _this.parent.trigger('dialogBeforeOpen', dlgArgs);
                            if (dlgArgs.cancel) {
                                args.cancel = true;
                            }
                            focus(_this.parent.element);
                        },
                        buttons: [{
                                buttonModel: {
                                    content: this.parent.serviceLocator.getService(locale).getConstant('Ok'), isPrimary: true
                                },
                                click: function () {
                                    _this.parent.sheets.length = 0;
                                    _this.parent.createSheet();
                                    dialogInst.hide();
                                    _this.parent.activeSheetIndex = _this.parent.sheets.length - 1;
                                    _this.parent.notify(refreshSheetTabs, {});
                                    _this.parent.notify(sheetsDestroyed, {});
                                    _this.parent.renderModule.refreshSheet();
                                }
                            }]
                    });
                    break;
            }
        }
    };
    Ribbon.prototype.toolbarClicked = function (args) {
        if (!(args.item.id === 'spreadsheet_find')) {
            var parentId = this.parent.element.id;
            var sheet = this.parent.getActiveSheet();
            var evtHArgs = void 0;
            var evtglArgs = void 0;
            var isActive = void 0;
            var indexes = void 0;
            var selectCell = void 0;
            switch (args.item.id) {
                case parentId + '_headers':
                    evtHArgs = {
                        isShow: !sheet.showHeaders,
                        sheetIdx: this.parent.activeSheetIndex,
                        cancel: false
                    };
                    this.parent.notify(completeAction, { eventArgs: evtHArgs, action: 'headers' });
                    if (evtHArgs.cancel) {
                        return;
                    }
                    this.parent.setSheetPropertyOnMute(sheet, 'showHeaders', !sheet.showHeaders);
                    this.parent.serviceLocator.getService('sheet').showHideHeaders();
                    this.toggleRibbonItems({ props: 'Headers', activeTab: this.ribbon.selectedTab });
                    focus(this.parent.element);
                    break;
                case parentId + '_gridlines':
                    evtglArgs = {
                        isShow: !sheet.showGridLines,
                        sheetIdx: this.parent.activeSheetIndex,
                        cancel: false
                    };
                    this.parent.notify(completeAction, { eventArgs: evtglArgs, action: 'gridLines' });
                    if (evtglArgs.cancel) {
                        return;
                    }
                    this.parent.setSheetPropertyOnMute(sheet, 'showGridLines', !sheet.showGridLines);
                    this.toggleRibbonItems({ props: 'GridLines', activeTab: this.ribbon.selectedTab });
                    focus(this.parent.element);
                    break;
                case parentId + '_protect':
                    this.parent.setSheetPropertyOnMute(sheet, 'isProtected', !sheet.isProtected);
                    isActive = sheet.isProtected ? false : true;
                    this.parent.notify(applyProtect, { isActive: isActive, id: parentId + '_protect' });
                    break;
                case parentId + '_undo':
                    this.parent.notify(performUndoRedo, { isUndo: true });
                    break;
                case parentId + '_redo':
                    this.parent.notify(performUndoRedo, { isUndo: false });
                    break;
                case parentId + '_freezepanes':
                    indexes = getCellIndexes(sheet.topLeftCell);
                    selectCell = sheet.frozenRows || sheet.frozenColumns ? indexes : getCellIndexes(sheet.activeCell);
                    this.parent.notify(freeze, { row: selectCell[0] - indexes[0], column: selectCell[1] - indexes[1], isAction: true });
                    break;
                case parentId + '_freezerows':
                    this.parent.notify(freeze, { row: sheet.frozenRows ? 0 : getCellIndexes(sheet.activeCell)[0] - getCellIndexes(sheet.topLeftCell)[0], column: sheet.frozenColumns, isAction: true });
                    break;
                case parentId + '_freezecolumns':
                    this.parent.notify(freeze, { row: sheet.frozenRows, column: sheet.frozenColumns ? 0 : getCellIndexes(sheet.activeCell)[1] - getCellIndexes(sheet.topLeftCell)[1], isAction: true });
                    break;
                case parentId + '_protectworkbook':
                    if (this.parent.password.length > 0) {
                        this.parent.notify(unProtectWorkbook, null);
                    }
                    else {
                        if (this.parent.isProtected) {
                            this.parent.isProtected = false;
                            if (this.parent.showSheetTabs) {
                                this.parent.element.querySelector('.e-add-sheet-tab').removeAttribute('disabled');
                                this.parent.element.querySelector('.e-add-sheet-tab').classList.remove('e-disabled');
                            }
                            this.toggleRibbonItems({ props: 'Protectworkbook', activeTab: this.ribbon.selectedTab });
                        }
                        else if (this.parent.element.querySelector('.e-add-sheet-tab').classList.contains('e-disabled')) {
                            this.toggleRibbonItems({ props: 'Protectworkbook', activeTab: this.ribbon.selectedTab });
                        }
                        else {
                            this.parent.notify(protectWorkbook, null);
                        }
                    }
                    break;
            }
            this.parent.notify(ribbonClick, args);
        }
    };
    Ribbon.prototype.toggleRibbonItems = function (args) {
        var text = '';
        var viewtabHeader = this.parent.serviceLocator.getService(locale).getConstant('View');
        var datatabHeader = this.parent.serviceLocator.getService(locale).getConstant('Data');
        if (this.ribbon.items[this.ribbon.selectedTab].header.text === viewtabHeader) {
            if (isNullOrUndefined(args.activeTab)) {
                for (var i = 0, len_1 = this.ribbon.items.length; i < len_1; i++) {
                    if (this.ribbon.items[i].header.text === viewtabHeader) {
                        args.activeTab = i;
                        break;
                    }
                }
            }
            var text_1 = this.getLocaleText(args.props, args.props === 'GridLines');
            var id = this.parent.element.id + "_" + args.props.toLowerCase();
            var len = this.ribbon.items[args.activeTab].content.length;
            for (var i = void 0; i < len; i++) {
                if (this.ribbon.items[args.activeTab].content[i].type === 'Separator') {
                    continue;
                }
                if (this.ribbon.items[args.activeTab].content[i].id === id) {
                    this.ribbon.items[args.activeTab].content[i].text = text_1;
                    this.ribbon.setProperties({ 'items': this.ribbon.items }, true);
                }
            }
            if (this.ribbon.items[this.ribbon.selectedTab].header.text === viewtabHeader) {
                this.updateToggleText(args.props.toLowerCase(), text_1);
            }
        }
        if (this.ribbon.items[this.ribbon.selectedTab].header.text === datatabHeader) {
            if (isNullOrUndefined(args.activeTab)) {
                for (var i = 0, len_2 = this.ribbon.items.length; i < len_2; i++) {
                    if (this.ribbon.items[i].header.text === datatabHeader) {
                        args.activeTab = i;
                        break;
                    }
                }
            }
            var id = this.parent.element.id + "_" + args.props.toLowerCase();
            if (id === this.parent.element.id + '_protect') {
                var len_3 = this.ribbon.items[this.ribbon.selectedTab].content.length;
                var j = void 0;
                for (j = 0; j < len_3; j++) {
                    if (this.ribbon.items[this.ribbon.selectedTab].content[j].id === this.parent.element.id + '_protect') {
                        break;
                    }
                }
                text = this.getLocaleProtectText('Sheet', true);
            }
            else if (id === this.parent.element.id + '_protectworkbook') {
                var len_4 = this.ribbon.items[this.ribbon.selectedTab].content.length;
                var j = void 0;
                for (j = 0; j < len_4; j++) {
                    if (this.ribbon.items[this.ribbon.selectedTab].content[j].id === this.parent.element.id + '_protectworkbook') {
                        break;
                    }
                }
                if (this.parent.isProtected || this.parent.password.length > 0) {
                    text = this.getLocaleProtectWorkbook('UnProtectWorkbook');
                }
                else if (!this.parent.isProtected) {
                    text = this.getLocaleProtectWorkbook('ProtectWorkbook');
                }
            }
            var len = this.ribbon.items[args.activeTab].content.length;
            for (var i = void 0; i < len; i++) {
                if (this.ribbon.items[args.activeTab].content[i].type === 'Separator') {
                    continue;
                }
                if (this.ribbon.items[args.activeTab].content[i].id === id) {
                    this.ribbon.items[args.activeTab].content[i].text = text;
                    this.ribbon.setProperties({ 'items': this.ribbon.items }, true);
                }
            }
            if (this.ribbon.items[this.ribbon.selectedTab].header.text === datatabHeader) {
                this.updateToggleText(args.props.toLowerCase(), text);
            }
        }
    };
    Ribbon.prototype.enableFileMenuItems = function (args) {
        this.ribbon.enableMenuItems(args.items, args.enable, args.isUniqueId);
    };
    Ribbon.prototype.hideRibbonTabs = function (args) {
        this.ribbon.hideTabs(args.tabs, args.hide);
    };
    Ribbon.prototype.addRibbonTabs = function (args) {
        this.ribbon.addTabs(args.items, args.insertBefore);
        var nextTab = select('.e-ribbon .e-tab-header .e-toolbar-item:not(.e-menu-tab).e-hide', this.parent.element);
        if (nextTab) {
            this.parent.updateActiveBorder(selectAll('.e-ribbon .e-tab-header .e-toolbar-item:not(.e-menu-tab)', this.parent.element)[this.ribbon.selectedTab]);
        }
    };
    Ribbon.prototype.updateToggleText = function (item, text) {
        var _this = this;
        getUpdateUsingRaf(function () {
            var ele = select("#" + _this.parent.element.id + "_" + item + " .e-tbar-btn-text", _this.ribbon.element);
            if (ele) {
                ele.textContent = text;
            }
        });
        if (item === 'headers' && this.findDialog) {
            this.findDialog.position.Y = this.parent.getActiveSheet().showHeaders ? 31 : 0;
            this.findDialog.dataBind();
        }
    };
    Ribbon.prototype.refreshViewTabContent = function (activeTab) {
        var id = this.parent.element.id;
        var sheet = this.parent.getActiveSheet();
        var l10n = this.parent.serviceLocator.getService(locale);
        for (var i = 0; i < this.ribbon.items[activeTab].content.length; i++) {
            if (this.ribbon.items[activeTab].content[i].type === 'Separator') {
                continue;
            }
            if (this.ribbon.items[activeTab].content[i].id === id + "_headers") {
                this.updateViewTabContent(activeTab, 'Headers', i);
            }
            if (this.ribbon.items[activeTab].content[i].id === id + "_gridlines") {
                this.updateViewTabContent(activeTab, 'GridLines', i);
            }
            if (this.ribbon.items[activeTab].content[i].id === (id + "_freezepanes")) {
                if (sheet.frozenRows || sheet.frozenColumns) {
                    if (this.ribbon.items[activeTab].content[i].text === l10n.getConstant('FreezePanes')) {
                        this.updateToggleText('freezepanes', this.updateRibbonItemText('Unfreeze', 'Panes', i, activeTab));
                    }
                }
                else {
                    if (this.ribbon.items[activeTab].content[i].text === l10n.getConstant('UnfreezePanes')) {
                        this.updateToggleText('freezepanes', this.updateRibbonItemText('Freeze', 'Panes', i, activeTab));
                    }
                }
            }
            if (this.ribbon.items[activeTab].content[i].id === (id + "_freezerows")) {
                if (sheet.frozenRows) {
                    if (this.ribbon.items[activeTab].content[i].text === l10n.getConstant('FreezeRows')) {
                        this.updateToggleText('freezerows', this.updateRibbonItemText('Unfreeze', 'Rows', i, activeTab));
                    }
                }
                else {
                    if (this.ribbon.items[activeTab].content[i].text === l10n.getConstant('UnfreezeRows')) {
                        this.updateToggleText('freezerows', this.updateRibbonItemText('Freeze', 'Rows', i, activeTab));
                    }
                }
            }
            if (this.ribbon.items[activeTab].content[i].id === (id + "_freezecolumns")) {
                if (sheet.frozenColumns) {
                    if (this.ribbon.items[activeTab].content[i].text === l10n.getConstant('FreezeColumns')) {
                        this.updateToggleText('freezecolumns', this.updateRibbonItemText('Unfreeze', 'Columns', i, activeTab));
                    }
                }
                else {
                    if (this.ribbon.items[activeTab].content[i].text === l10n.getConstant('UnfreezeColumns')) {
                        this.updateToggleText('freezecolumns', this.updateRibbonItemText('Freeze', 'Columns', i, activeTab));
                    }
                }
            }
        }
    };
    Ribbon.prototype.updateViewTabContent = function (activeTab, item, idx) {
        var sheet = this.parent.getActiveSheet();
        var l10n = this.parent.serviceLocator.getService(locale);
        if (sheet['show' + item]) {
            if (this.ribbon.items[activeTab].content[idx].text === l10n.getConstant('Show' + item)) {
                this.updateToggleText(item.toLowerCase(), this.updateRibbonItemText('Hide', item, idx, activeTab));
            }
        }
        else {
            if (this.ribbon.items[activeTab].content[idx].text === l10n.getConstant('Hide' + item)) {
                this.updateToggleText(item.toLowerCase(), this.updateRibbonItemText('Show', item, idx, activeTab));
            }
        }
    };
    Ribbon.prototype.updateRibbonItemText = function (showHideText, item, idx, activeTab) {
        var l10n = this.parent.serviceLocator.getService(locale);
        var text = l10n.getConstant(showHideText + item);
        this.ribbon.items[activeTab].content[idx].text = text;
        this.ribbon.setProperties({ 'items': this.ribbon.items }, true);
        return text;
    };
    Ribbon.prototype.refreshDataTabContent = function (activeTab) {
        var id = this.parent.element.id;
        var updated;
        for (var j = 0; j < this.ribbon.items[activeTab].content.length; j++) {
            if (this.ribbon.items[activeTab].content[j].type === 'Separator') {
                continue;
            }
            if (this.ribbon.items[activeTab].content[j].id === id + "_protect") {
                this.updateDataTabContent(activeTab, 'Sheet', j);
                if (updated) {
                    break;
                }
                updated = true;
            }
            if (this.ribbon.items[activeTab].content[j].id === id + "_protectworkbook") {
                this.updateDataTabContent(activeTab, 'Workbook', j);
            }
        }
    };
    Ribbon.prototype.updateDataTabContent = function (activeTab, item, idx) {
        var sheet = this.parent.getActiveSheet();
        var l10n = this.parent.serviceLocator.getService(locale);
        if (item === 'Sheet') {
            if (sheet.isProtected) {
                if (this.ribbon.items[activeTab].content[idx].text === l10n.getConstant('Protect' + item)) {
                    this.ribbon.items[activeTab].content[idx].cssClass = 'e-active';
                    this.updateProtectBtn('Unprotect', item, idx, activeTab);
                }
            }
            else {
                this.updateProtectBtn('Protect', item, idx, activeTab);
            }
        }
        else if (item === 'Workbook') {
            var l10n_1 = this.parent.serviceLocator.getService(locale);
            if (this.parent.isProtected) {
                if (this.ribbon.items[activeTab].content[idx].text === l10n_1.getConstant('Protect' + item)) {
                    this.updateToggleText('protectworkbook', this.updateRibbonItemText('UnProtect', item, idx, activeTab));
                }
            }
            else {
                if (this.ribbon.items[activeTab].content[idx].text === l10n_1.getConstant('UnProtect' + item)) {
                    this.updateToggleText('protectworkbook', this.updateRibbonItemText('Protect', item, idx, activeTab));
                }
            }
        }
    };
    Ribbon.prototype.updateProtectBtn = function (protectText, item, idx, activeTab) {
        var l10n = this.parent.serviceLocator.getService(locale);
        var text = l10n.getConstant(protectText + item);
        this.ribbon.items[activeTab].content[idx].text = text;
        this.ribbon.setProperties({ 'items': this.ribbon.items }, true);
        this.updateToggleText('protect', text);
    };
    Ribbon.prototype.updateProtectWorkbookBtn = function (protectText, item, idx, activeTab) {
        var l10n = this.parent.serviceLocator.getService(locale);
        var text = l10n.getConstant(protectText);
        this.ribbon.items[activeTab].content[idx].text = text;
        this.ribbon.setProperties({ 'items': this.ribbon.items }, true);
        this.updateToggleText('protectworkbook', text);
    };
    Ribbon.prototype.addToolbarItems = function (args) {
        this.ribbon.addToolbarItems(args.tab, args.items, args.index);
    };
    Ribbon.prototype.enableToolbarItems = function (args) {
        var _this = this;
        args.forEach(function (arg) {
            _this.ribbon.enableItems(arg.tab || _this.ribbon.items[_this.ribbon.selectedTab].header.text, arg.items, arg.enable);
        });
    };
    Ribbon.prototype.createMobileView = function () {
        var _this = this;
        var parentId = this.parent.element.id;
        var toobar = this.parent.createElement('div', { className: 'e-header-toolbar' });
        var menu = this.parent.createElement('ul');
        toobar.appendChild(menu);
        var toolbarObj = new Toolbar({
            items: [
                { prefixIcon: 'e-tick-icon', align: 'Left', id: parentId + 'focused_tick', cssClass: 'e-focused-tick' },
                { template: menu, align: 'Right', id: parentId + 'file_menu' }
            ],
            clicked: function (args) {
                switch (args.item.id) {
                    case parentId + 'focused_tick':
                        _this.parent.element.classList.remove('e-mobile-focused');
                        _this.parent.renderModule.setSheetPanelSize();
                        break;
                }
            },
            created: function () {
                var menuObj = new Menu({
                    cssClass: 'e-mobile e-file-menu',
                    enableRtl: true,
                    showItemOnClick: true,
                    items: _this.getRibbonMenuItems(),
                    select: _this.fileMenuItemSelect.bind(_this),
                    beforeOpen: function (args) {
                        args.element.parentElement.classList.remove('e-rtl');
                        _this.fileMenuBeforeOpen(args);
                    },
                    beforeClose: _this.fileMenuBeforeClose.bind(_this)
                });
                menuObj.createElement = _this.parent.createElement;
                menuObj.appendTo(menu);
            }
        });
        toolbarObj.createElement = this.parent.createElement;
        toolbarObj.appendTo(toobar);
        this.parent.element.insertBefore(toobar, this.parent.element.firstElementChild);
        this.renderMobileToolbar();
    };
    Ribbon.prototype.renderMobileToolbar = function () {
        var _this = this;
        var toolbarPanel = this.parent.createElement('div', { className: 'e-toolbar-panel e-ribbon' });
        var toolbar = this.parent.createElement('div');
        var ddb = this.parent.createElement('button');
        toolbarPanel.appendChild(toolbar);
        toolbarPanel.appendChild(ddb);
        toolbarPanel.style.display = 'block';
        this.parent.element.appendChild(toolbarPanel);
        var ddbObj = new DropDownButton({
            cssClass: 'e-caret-hide',
            content: this.ribbon.items[0].header.text,
            items: [
                { text: this.ribbon.items[0].header.text },
                { text: this.ribbon.items[1].header.text },
                { text: this.ribbon.items[2].header.text },
                { text: this.ribbon.items[3].header.text }
            ],
            select: function (args) {
                if (args.item.text !== ddbObj.content) {
                    toolbarObj.element.style.display = 'none';
                    ddbObj.content = args.item.text;
                    ddbObj.dataBind();
                    toolbarObj.items = _this.ribbon.items[ddbObj.items.indexOf(args.item) + 1].content;
                    toolbarObj.width = "calc(100% - " + ddb.getBoundingClientRect().width + "px)";
                    toolbarObj.element.style.display = '';
                    toolbarObj.dataBind();
                    toolbarObj.items[0].text = args.item.text;
                    toolbarObj.dataBind();
                }
            },
            open: function (args) {
                var element = args.element.parentElement;
                var clientRect = element.getBoundingClientRect();
                var offset = calculatePosition(ddbObj.element, 'right', 'bottom');
                element.style.left = offset.left - clientRect.width + "px";
                element.style.top = offset.top - clientRect.height + "px";
                for (var i = 0; i < ddbObj.items.length; i++) {
                    if (ddbObj.content === ddbObj.items[i].text) {
                        args.element.children[i].classList.add('e-selected');
                        break;
                    }
                }
            },
            close: function () { return focus(_this.parent.element); }
        });
        ddbObj.createElement = this.parent.createElement;
        ddbObj.appendTo(ddb);
        var toolbarObj = new Toolbar({
            width: "calc(100% - " + ddb.getBoundingClientRect().width + "px)",
            items: this.ribbon.items[0].content,
            clicked: this.toolbarClicked.bind(this)
        });
        toolbarObj.createElement = this.parent.createElement;
        toolbarObj.appendTo(toolbar);
        toolbarPanel.style.display = '';
    };
    Ribbon.prototype.fileMenuBeforeOpen = function (args) {
        var _this = this;
        var l10n = this.parent.serviceLocator.getService(locale);
        var wrapper;
        var contents = ['.xlsx', '.xls', '.csv', '.pdf'];
        if (args.parentItem.text === l10n.getConstant('SaveAs')) {
            [].slice.call(args.element.children).forEach(function (li, index) {
                wrapper = _this.parent.createElement('div', { innerHTML: li.innerHTML });
                li.innerHTML = '';
                wrapper.appendChild(_this.parent.createElement('span', { className: 'e-extension', innerHTML: contents[index] }));
                li.appendChild(wrapper);
            });
        }
        this.parent.trigger('fileMenuBeforeOpen', args);
    };
    Ribbon.prototype.enableRibbonTabs = function (args) {
        this.ribbon.enableTabs(args.tabs, args.enable);
    };
    Ribbon.prototype.fileMenuBeforeClose = function (args) {
        this.parent.trigger('fileMenuBeforeClose', args);
    };
    Ribbon.prototype.hideFileMenuItems = function (args) {
        this.ribbon.hideMenuItems(args.items, args.hide, args.isUniqueId);
    };
    Ribbon.prototype.addFileMenuItems = function (args) {
        this.ribbon.addMenuItems(args.items, args.text, args.insertAfter, args.isUniqueId);
    };
    Ribbon.prototype.hideToolbarItems = function (args) {
        this.ribbon.hideToolbarItems(args.tab, args.indexes, args.hide);
    };
    Ribbon.prototype.protectSheetHandler = function (args) {
        var sheet = this.parent.getActiveSheet();
        var l10n = this.parent.serviceLocator.getService(locale);
        if ((sheet.isProtected && sheet.protectSettings.formatCells) || !sheet.isProtected) {
            this.enableToolbarItems([{ tab: l10n.getConstant('Home'), items: args.enableHomeBtnId, enable: true }]);
            this.parent.notify(setUndoRedo, null);
        }
        else {
            this.enableToolbarItems([{ tab: l10n.getConstant('Home'), items: args.disableHomeBtnId, enable: false }]);
        }
        if ((sheet.isProtected && sheet.protectSettings.insertLink) || !sheet.isProtected) {
            this.enableToolbarItems([{ tab: l10n.getConstant('Insert'), items: args.enableInsertBtnId, enable: true }]);
        }
        else {
            this.enableToolbarItems([{ tab: l10n.getConstant('Insert'), items: args.enableInsertBtnId, enable: false }]);
        }
        if ((sheet.isProtected && sheet.protectSettings.selectCells) || !sheet.isProtected) {
            this.enableToolbarItems([{ tab: l10n.getConstant('Home'), items: args.findBtnId, enable: true }]);
        }
        else {
            this.enableToolbarItems([{ tab: l10n.getConstant('Home'), items: args.findBtnId, enable: false }]);
        }
        var len = this.ribbon.items[this.ribbon.selectedTab].content.length;
        var i;
        for (i = 0; i < len; i++) {
            if (this.ribbon.items[this.ribbon.selectedTab].content[i].id === this.parent.element.id + '_protectworkbook') {
                break;
            }
        }
        if (sheet.isProtected) {
            if (this.parent.isProtected && this.parent.element.querySelector('#' + this.parent.element.id + '_protectworkbook') &&
                this.parent.element.querySelector('#' + this.parent.element.id + '_protectworkbook')
                    .querySelector('.e-tbar-btn-text').textContent === l10n.getConstant('UnProtectWorkbook')) {
                if (this.ribbon.items[this.ribbon.selectedTab].header.text === l10n.getConstant('Data')) {
                    this.ribbon.items[this.ribbon.selectedTab].content[i].text = l10n.getConstant('UnProtectWorkbook');
                }
            }
            else {
                if (this.ribbon.items[this.ribbon.selectedTab].header.text === l10n.getConstant('Data')) {
                    this.ribbon.items[this.ribbon.selectedTab].content[i].text = l10n.getConstant('ProtectWorkbook');
                }
            }
            this.enableToolbarItems([{ tab: l10n.getConstant('Data'), items: args.dataValidationBtnId, enable: false }]);
            this.enableToolbarItems([{ tab: l10n.getConstant('Formulas'), items: args.enableFrmlaBtnId, enable: false }]);
            this.enableToolbarItems([{ tab: l10n.getConstant('Insert'), items: args.imageBtnId, enable: false }]);
            this.enableToolbarItems([{ tab: l10n.getConstant('Insert'), items: args.chartBtnId, enable: false }]);
        }
        else {
            if (this.parent.isProtected && this.parent.element.querySelector('#' + this.parent.element.id + '_protectworkbook') &&
                this.parent.element.querySelector('#' + this.parent.element.id + '_protectworkbook')
                    .querySelector('.e-tbar-btn-text').textContent === l10n.getConstant('UnProtectWorkbook')) {
                if (this.ribbon.items[this.ribbon.selectedTab].header.text === l10n.getConstant('Data')) {
                    this.ribbon.items[this.ribbon.selectedTab].content[i].text = l10n.getConstant('UnProtectWorkbook');
                }
            }
            else {
                if (this.ribbon.items[this.ribbon.selectedTab].header.text === l10n.getConstant('Data')) {
                    this.ribbon.items[this.ribbon.selectedTab].content[i].text = l10n.getConstant('ProtectWorkbook');
                }
            }
            this.enableToolbarItems([{ tab: l10n.getConstant('Data'), items: args.dataValidationBtnId, enable: true }]);
            this.enableToolbarItems([{ tab: l10n.getConstant('Formulas'), items: args.enableFrmlaBtnId, enable: true }]);
            this.enableToolbarItems([{ tab: l10n.getConstant('Insert'), items: args.imageBtnId, enable: true }]);
            this.enableToolbarItems([{ tab: l10n.getConstant('Insert'), items: args.chartBtnId, enable: true }]);
        }
    };
    Ribbon.prototype.updateMergeItem = function (e) {
        if (e.type === 'mousemove' || e.type === 'pointermove' || (e.shiftKey && e.type === 'mousedown')) {
            var indexes = getRangeIndexes(this.parent.getActiveSheet().selectedRange);
            if ((indexes[1] !== indexes[3] || indexes[0] !== indexes[2]) && !this.parent.getActiveSheet().isProtected) {
                this.enableToolbarItems([{ tab: this.parent.serviceLocator.getService(locale).getConstant('Home'),
                        items: [this.parent.element.id + "_merge_cells"], enable: true }]);
                this.toggleActiveState(false);
            }
        }
    };
    Ribbon.prototype.addEventListener = function () {
        this.parent.on(ribbon, this.initRibbon, this);
        this.parent.on(enableToolbarItems, this.enableToolbarItems, this);
        this.parent.on(activeCellChanged, this.refreshRibbonContent, this);
        this.parent.on(updateToggleItem, this.toggleRibbonItems, this);
        this.parent.on(enableFileMenuItems, this.enableFileMenuItems, this);
        this.parent.on(hideRibbonTabs, this.hideRibbonTabs, this);
        this.parent.on(addRibbonTabs, this.addRibbonTabs, this);
        this.parent.on(addToolbarItems, this.addToolbarItems, this);
        this.parent.on(hideFileMenuItems, this.hideFileMenuItems, this);
        this.parent.on(addFileMenuItems, this.addFileMenuItems, this);
        this.parent.on(hideToolbarItems, this.hideToolbarItems, this);
        this.parent.on(enableRibbonTabs, this.enableRibbonTabs, this);
        this.parent.on(protectCellFormat, this.protectSheetHandler, this);
        this.parent.on(selectionComplete, this.updateMergeItem, this);
        this.parent.on(refreshRibbonIcons, this.refreshRibbonContent, this);
        this.parent.on(insertDesignChart, this.insertDesignChart, this);
        this.parent.on(removeDesignChart, this.removeDesignChart, this);
        this.parent.on(ribbonFind, this.findToolDlg, this);
    };
    Ribbon.prototype.destroy = function () {
        var parentElem = this.parent.element;
        var ribbonEle = this.ribbon.element;
        var cPickerEle = this.cPickerEle;
        var id = parentElem.id;
        ['bold', 'italic', 'line-through', 'underline'].forEach(function (name) {
            destroyComponent(select('#' + (id + "_" + name), parentElem), Button);
        });
        this.pasteSplitBtn.destroy();
        this.pasteSplitBtn = null;
        this.mergeSplitBtn.destroy();
        this.mergeSplitBtn = null;
        this.numFormatDDB.destroy();
        this.numFormatDDB = null;
        this.fontSizeDdb.destroy();
        this.fontSizeDdb = null;
        this.fontNameDdb.destroy();
        this.fontNameDdb = null;
        this.textAlignDdb.destroy();
        this.textAlignDdb = null;
        this.verticalAlignDdb.destroy();
        this.verticalAlignDdb = null;
        this.sortingDdb.destroy();
        this.sortingDdb = null;
        this.clearDdb.destroy();
        this.clearDdb = null;
        this.colorPicker.destroy();
        this.colorPicker = null;
        this.bordersMenu.destroy();
        this.bordersMenu = null;
        this.bordersDdb.destroy();
        this.bordersDdb = null;
        this.findDdb.destroy();
        this.findDdb = null;
        this.chartDdb.destroy();
        this.chartDdb = null;
        this.chartMenu.destroy();
        this.chartMenu = null;
        this.cFDdb.destroy();
        this.cFDdb = null;
        this.parent.notify('destroyRibbonComponents', null);
        this.ribbon.destroy();
        if (ribbonEle) {
            detach(ribbonEle);
        }
        this.ribbon = null;
        if (cPickerEle) {
            detach(cPickerEle);
        }
        this.cPickerEle = null;
        this.removeEventListener();
    };
    Ribbon.prototype.removeEventListener = function () {
        if (!this.parent.isDestroyed) {
            this.parent.off(ribbon, this.initRibbon);
            this.parent.off(enableToolbarItems, this.enableToolbarItems);
            this.parent.off(activeCellChanged, this.refreshRibbonContent);
            this.parent.off(updateToggleItem, this.toggleRibbonItems);
            this.parent.off(enableFileMenuItems, this.enableFileMenuItems);
            this.parent.off(hideRibbonTabs, this.hideRibbonTabs);
            this.parent.off(addRibbonTabs, this.addRibbonTabs);
            this.parent.off(addToolbarItems, this.addToolbarItems);
            this.parent.off(hideFileMenuItems, this.hideFileMenuItems);
            this.parent.off(addFileMenuItems, this.addFileMenuItems);
            this.parent.off(hideToolbarItems, this.hideToolbarItems);
            this.parent.off(enableRibbonTabs, this.enableRibbonTabs);
            this.parent.off(protectCellFormat, this.protectSheetHandler);
            this.parent.off(selectionComplete, this.updateMergeItem);
            this.parent.off(refreshRibbonIcons, this.refreshRibbonContent);
            this.parent.off(insertDesignChart, this.insertDesignChart);
            this.parent.off(removeDesignChart, this.removeDesignChart);
            this.parent.on(ribbonFind, this.findToolDlg, this);
        }
    };
    return Ribbon;
}());
export { Ribbon };
