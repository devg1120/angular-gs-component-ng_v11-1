import { extend, isNullOrUndefined, KeyboardEventArgs, Browser, isBlazor } from '@syncfusion/ej2-base';
import * as CONSTANT from '../base/constant';
import { updateUndoRedoStatus, isIDevice } from '../base/util';
import { ActionBeginEventArgs, IDropDownItemModel, IShowPopupArgs } from './../base/interface';
import { IRichTextEditor, IEditorModel, IItemCollectionArgs } from './../base/interface';
import { IHtmlFormatterCallBack, IMarkdownFormatterCallBack, IUndoCallBack } from './../../common/interface';
import { KEY_DOWN, KEY_UP } from './../../common/constant';
import { MarkdownUndoRedoData } from '../../markdown-parser/base/interface';
import { IHtmlUndoRedoData } from '../../editor-manager/base/interface';
import { NodeSelection } from '../../selection/selection';
/**
 * Formatter
 * 
 * @hidden
 * @deprecated
 */
export class Formatter {
    public editorManager: IEditorModel;
    private timeInterval: number;
    /**
     * To execute the command
     *
     * @param  {IRichTextEditor} self - specifies the self element.
     * @param  {ActionBeginEventArgs} args - specifies the event arguments.
     * @param  {MouseEvent|KeyboardEvent} event - specifies the keyboard event.
     * @param  {IItemCollectionArgs} value - specifies the collection arguments
     * @returns {void}
     * @hidden
     * @deprecated
     */
    public process(self: IRichTextEditor, args: ActionBeginEventArgs, event: MouseEvent | KeyboardEvent, value: IItemCollectionArgs): void {
        const selection: Selection = self.contentModule.getDocument().getSelection();
        const range: Range = (selection.rangeCount > 0) ? selection.getRangeAt(selection.rangeCount - 1) : null;
        let saveSelection: NodeSelection;
        if (self.editorMode === 'HTML') {
            saveSelection = this.editorManager.nodeSelection.save(range, self.contentModule.getDocument());
        }
        if (!isNullOrUndefined(args)
            && args.item.command
            && args.item.command !== 'Table'
            && args.item.command !== 'Actions'
            && args.item.command !== 'Links'
            && args.item.command !== 'Images'
            && args.item.command !== 'Files'
            && range
            && !(self.contentModule.getEditPanel().contains(this.getAncestorNode(range.commonAncestorContainer))
                || self.contentModule.getEditPanel() === range.commonAncestorContainer
                || self.contentModule.getPanel() === range.commonAncestorContainer)) {
            return;
        }
        if (isNullOrUndefined(args)) {
            const action: string = (event as KeyboardEventArgs).action;
            if (action !== 'tab' && action !== 'enter' && action !== 'space' && action !== 'escape') {
                args = {};
                if (self.editorMode === 'Markdown' && action === 'insert-table') {
                    // eslint-disable-next-line
                    value  = <{}>{
                        'headingText': self.localeObj.getConstant('TableHeadingText'),
                        'colText': self.localeObj.getConstant('TableColText')
                    };
                }
                // eslint-disable-next-line
                const items: object = {
                    originalEvent: event, cancel: false,
                    requestType: action || ((event as KeyboardEventArgs).key + 'Key'),
                    itemCollection: value
                };
                extend(args, args, items, true);
                if (isBlazor()) {
                    delete args.item;
                    delete args.itemCollection;
                }
                self.trigger(CONSTANT.actionBegin, args, (actionBeginArgs: ActionBeginEventArgs) => {
                    if (actionBeginArgs.cancel) {
                        if (action === 'paste' || action === 'cut' || action === 'copy') {
                            event.preventDefault();
                        }
                    }
                });
            }
            const isTableModule : boolean = isNullOrUndefined(self.tableModule) ? true : self.tableModule ?
                self.tableModule.ensureInsideTableList : false;
            if ((event.which === 9 && isTableModule) || event.which !== 9) {
                this.editorManager.observer.notify((event.type === 'keydown' ? KEY_DOWN : KEY_UP), {
                    event: event,
                    callBack: this.onSuccess.bind(this, self),
                    value: value
                });
            }
        } else if (!isNullOrUndefined(args) && args.item.command && args.item.subCommand && ((args.item.command !== args.item.subCommand
            && args.item.command !== 'Font')
            || ((args.item.subCommand === 'FontName' || args.item.subCommand === 'FontSize') && args.name === 'dropDownSelect')
            || ((args.item.subCommand === 'BackgroundColor' || args.item.subCommand === 'FontColor')
                && args.name === 'colorPickerChanged'))) {
            extend(args, args, { requestType: args.item.subCommand, cancel: false, itemCollection: value }, true);
            self.trigger(CONSTANT.actionBegin, args, (actionBeginArgs: ActionBeginEventArgs) => {
                if (!actionBeginArgs.cancel) {
                    if (this.getUndoRedoStack().length === 0 && actionBeginArgs.item.command !== 'Links'
                        && actionBeginArgs.item.command !== 'Images') {
                        this.saveData();
                    }
                    self.isBlur = false;
                    (self.contentModule.getEditPanel() as HTMLElement).focus();
                    if (self.editorMode === 'HTML') {
                        saveSelection.restore();
                    }
                    const command: string = actionBeginArgs.item.subCommand.toLocaleLowerCase();
                    if (command === 'paste' || command === 'cut' || command === 'copy') {
                        self.clipboardAction(command, event);
                    } else {
                        this.editorManager.observer.notify(CONSTANT.checkUndo, { subCommand: actionBeginArgs.item.subCommand });
                        this.editorManager.execCommand(
                            actionBeginArgs.item.command,
                            actionBeginArgs.item.subCommand,
                            event, this.onSuccess.bind(this, self),
                            (actionBeginArgs.item as IDropDownItemModel).value,
                            actionBeginArgs.item.subCommand === 'Pre' && args.name === 'dropDownSelect' ?
                                { name: args.name } : value,
                            ('#' + self.getID() + ' iframe')
                        );
                    }
                }
            });
        }
        if (isNullOrUndefined(event) || event && (event as KeyboardEventArgs).action !== 'copy') {
            this.enableUndo(self);
        }
    }
    private getAncestorNode(node: Node): Node {
        node = node.nodeType === 3 ? node.parentNode : node;
        return node;
    }
    /**
     * onKeyHandler method
     *
     * @param {IRichTextEditor} self - specifies the self element.
     * @param {KeyboardEvent} e - specifies the keyboard event.
     * @returns {void}
     * @hidden
     * @deprecated
     */
    public onKeyHandler(self: IRichTextEditor, e: KeyboardEvent): void {
        this.editorManager.observer.notify(KEY_UP, {
            event: e, callBack: () => {
                self.notify(CONSTANT.contentChanged, {});
                this.enableUndo(self);
            }
        });
    }
    /**
     * onSuccess method
     *
     * @param {IRichTextEditor} self - specifies the self element.
     * @param {IMarkdownFormatterCallBack} events - specifies the event call back
     * @returns {void}
     * @hidden
     * @deprecated
     */
    public onSuccess(self: IRichTextEditor, events: IMarkdownFormatterCallBack | IHtmlFormatterCallBack): void {
        self.notify(CONSTANT.contentChanged, {});
        if (events && (isNullOrUndefined(events.event) || (events.event as KeyboardEventArgs).action !== 'copy')) {
            this.enableUndo(self);
            self.notify(CONSTANT.execCommandCallBack, events);
        }
        self.trigger(CONSTANT.actionComplete, events, (callbackArgs: IMarkdownFormatterCallBack | IHtmlFormatterCallBack) => {
            self.setPlaceHolder();
            if (callbackArgs.requestType === 'Images' || callbackArgs.requestType === 'Links' && self.editorMode === 'HTML') {
                const args: IHtmlFormatterCallBack = callbackArgs as IHtmlFormatterCallBack;
                if (callbackArgs.requestType === 'Links' && callbackArgs.event &&
                    (callbackArgs.event as KeyboardEvent).type === 'keydown' &&
                    (callbackArgs.event as KeyboardEvent).keyCode === 32) {
                    return;
                }
                self.notify(CONSTANT.insertCompleted, {
                    args: args.event, type: callbackArgs.requestType, isNotify: true,
                    elements: args.elements
                } as IShowPopupArgs);
            }
            self.autoResize();
        });
    }
    /**
     * Save the data for undo and redo action.
     *
     * @param {KeyboardEvent} e - specifies the keyboard event.
     * @returns {void}
     * @hidden
     * @deprecated
     */
    public saveData(e?: KeyboardEvent | MouseEvent | IUndoCallBack): void {
        this.editorManager.undoRedoManager.saveData(e);
    }

    /**
     * getUndoStatus method
     *
     * @returns {void}
     * @hidden
     * @deprecated
     */
    public getUndoStatus(): { [key: string]: boolean } {
        return this.editorManager.undoRedoManager.getUndoStatus();
    }

    /* eslint-disable */
    /**
     * getUndoRedoStack method
     *
     * @param {IHtmlUndoRedoData}  - specifies the redo data.
     * @returns {void}
     * @hidden
     * @deprecated
     */
    /* eslint-enable */
    public getUndoRedoStack(): IHtmlUndoRedoData[] | MarkdownUndoRedoData[] {
        return this.editorManager.undoRedoManager.undoRedoStack;
    }

    /**
     * enableUndo method
     *
     * @param {IRichTextEditor} self - specifies the self element.
     * @returns {void}
     * @hidden
     * @deprecated
     */
    public enableUndo(self: IRichTextEditor): void {
        const status: { [key: string]: boolean } = this.getUndoStatus();
        if (self.inlineMode.enable && (!Browser.isDevice || isIDevice())) {
            updateUndoRedoStatus(self.quickToolbarModule.inlineQTBar.quickTBarObj, status);
            self.trigger(CONSTANT.toolbarStatusUpdate, status);
        } else {
            if (self.toolbarModule) {
                updateUndoRedoStatus(self.toolbarModule.baseToolbar, status);
                self.trigger(CONSTANT.toolbarStatusUpdate, status);
            }
        }
    }
}