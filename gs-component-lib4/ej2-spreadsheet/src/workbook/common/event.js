/**
 * Specifies Workbook internal events.
 */
/** @hidden */
export var workbookDestroyed = 'workbookDestroyed';
/** @hidden */
export var updateSheetFromDataSource = 'updateSheetFromDataSource';
/** @hidden */
export var dataSourceChanged = 'dataSourceChanged';
/** @hidden */
export var dataChanged = 'dataChanged';
/** @hidden */
export var triggerDataChange = 'triggerDataChange';
/** @hidden */
export var workbookOpen = 'workbookOpen';
/** @hidden */
export var beginSave = 'beginSave';
/** @hidden */
export var sortImport = 'sortImport';
/** @hidden */
export var ribbonFind = 'ribbonFind';
/** @hidden */
export var getFilteredCollection = 'getFilteredCollection';
/** @hidden */
export var saveCompleted = 'saveCompleted';
/** @hidden */
export var applyNumberFormatting = 'applyNumber';
/** @hidden */
export var getFormattedCellObject = 'getFormattedCell';
/** @hidden */
export var refreshCellElement = 'refreshCellElem';
/** @hidden */
export var setCellFormat = 'setCellFormat';
/** @hidden */
export var findAllValues = 'findAllValues';
/** @hidden */
export var textDecorationUpdate = 'textDecorationUpdate';
/** @hidden */
export var applyCellFormat = 'applyCellFormat';
/** @hidden */
export var updateUsedRange = 'updateUsedRange';
/** @hidden */
export var workbookFormulaOperation = 'workbookFormulaOperation';
/** @hidden */
export var workbookEditOperation = 'workbookEditOperation';
/** @hidden */
export var checkDateFormat = 'checkDateFormat';
/** @hidden */
export var getFormattedBarText = 'getFormattedBarText';
/** @hidden */
export var activeCellChanged = 'activeCellChanged';
/** @hidden */
export var openSuccess = 'openSuccess';
/** @hidden */
export var openFailure = 'openFailure';
/** @hidden */
export var sheetCreated = 'sheetCreated';
/** @hidden */
export var sheetsDestroyed = 'sheetsDestroyed';
/** @hidden */
export var aggregateComputation = 'aggregateComputation';
/** @hidden */
export var beforeSort = 'beforeSort';
/** @hidden */
export var initiateSort = 'initiateSort';
/** @hidden */
export var sortComplete = 'sortComplete';
/** @hidden */
export var sortRangeAlert = 'sortRangeAlert';
/** @hidden */
export var initiatelink = 'initiatelink';
/** @hidden */
export var beforeHyperlinkCreate = 'beforeHyperlinkCreate';
/** @hidden */
export var afterHyperlinkCreate = 'afterHyperlinkCreate';
/** @hidden */
export var beforeHyperlinkClick = 'beforeHyperlinkClick';
/** @hidden */
export var afterHyperlinkClick = 'afterHyperlinkClick';
/** @hidden */
export var addHyperlink = 'addHyperlink';
/** @hidden */
export var setLinkModel = 'setLinkModel';
/** @hidden */
export var beforeFilter = 'beforeFilter';
/** @hidden */
export var initiateFilter = 'initiateFilter';
/** @hidden */
export var filterComplete = 'filterComplete';
/** @hidden */
export var filterRangeAlert = 'filterRangeAlert';
/** @hidden */
export var clearAllFilter = 'clearAllFilter';
/** @hidden */
export var wrapEvent = 'wrapText';
/** @hidden */
export var onSave = 'onSave';
/** @hidden */
export var insert = 'insert';
/** @hidden */
export var deleteAction = 'delete';
/** @hidden */
export var insertModel = 'insertModel';
/** @hidden */
export var deleteModel = 'deleteModel';
/** @hidden */
export var isValidation = 'isValidation';
/** @hidden */
export var setValidation = 'setValidation';
/** @hidden */
export var addHighlight = 'addHighlight';
/** @hidden */
export var dataValidate = 'dataValidate';
/** @hidden */
export var findNext = 'findNext';
/** @hidden */
export var findPrevious = 'findPrevious';
/** @hidden */
export var goto = 'gotoHandler';
/** @hidden */
export var findWorkbookHandler = 'findHandler';
/** @hidden */
export var replaceHandler = 'replace';
/** @hidden */
export var replaceAllHandler = 'replaceAll';
/** @hidden */
export var showDialog = 'ShowDialog';
/** @hidden */
export var findUndoRedo = 'findUndoRedo';
/** @hidden */
export var findKeyUp = 'findKeyUp';
/** @hidden */
export var removeValidation = 'removeValidation';
/** @hidden */
export var removeHighlight = 'removeHighlight';
/** @hidden */
export var queryCellInfo = 'queryCellInfo';
/** @hidden */
export var count = 'count';
/** @hidden */
export var findCount = 'findCount';
/** @hidden */
export var protectSheetWorkBook = 'protectSheet';
/** @hidden */
export var updateToggle = 'updateToggleItem';
/** @hidden */
export var protectsheetHandler = 'protectsheetHandler';
/** @hidden */
export var replaceAllDialog = 'replaceAllDialog';
/** @hidden */
export var unprotectsheetHandler = 'unprotectsheetHandler';
/** @hidden */
export var workBookeditAlert = 'editAlert';
/** @hidden */
export var setLockCells = 'setLockCells';
/** @hidden */
export var applyLockCells = 'applyLockCells';
/** @hidden */
export var setMerge = 'setMerge';
/** @hidden */
export var applyMerge = 'applyMerge';
/** @hidden */
export var mergedRange = 'mergedRange';
/** @hidden */
export var activeCellMergedRange = 'activeCellMergedRange';
/** @hidden */
export var insertMerge = 'insertMerge';
/** @hidden */
export var pasteMerge = 'pasteMerge';
/** @hidden */
export var setCFRule = 'setCFRule';
/** @hidden */
export var cFInitialCheck = 'cFInitialCheck';
/** @hidden */
export var clearCFRule = 'clearCFRule';
/** @hidden */
export var initiateClearCFRule = 'initiateClearCFRule';
/** @hidden */
export var cFRender = 'cFRender';
/** @hidden */
export var cFDelete = 'cFDelete';
/** @hidden */
export var clear = 'clear';
/** @hidden */
export var clearCF = 'clearCF';
/** @hidden */
export var clearCells = 'clearCells';
/** @hidden */
export var setImage = 'setImage';
/** @hidden */
export var setChart = 'setChart';
/** @hidden */
export var initiateChart = 'initiateChart';
/** @hidden */
export var refreshRibbonIcons = 'refreshRibbonIcons';
/** @hidden */
export var refreshChart = 'refreshChart';
/** @hidden */
export var refreshChartSize = 'refreshChartSize';
/** @hidden */
export var updateChart = 'updateChart';
/** @hidden */
export var deleteChartColl = 'deleteChartColl';
/** @hidden */
export var initiateChartModel = 'initiateChartModel';
/** @hidden */
export var focusChartBorder = 'focusChartBorder';
/** @hidden */
export var saveError = 'saveError';
/** @hidden */
export var validationHighlight = 'validationHighlight';
/** @hidden */
export var dataRefresh = 'dataRefresh';
/** @hidden */
export var updateFilter = 'updateFilter';
