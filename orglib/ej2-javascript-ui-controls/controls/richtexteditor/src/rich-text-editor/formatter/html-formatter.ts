import { Formatter } from './formatter';
import { IEditorModel, IHtmlFormatterModel } from './../base/interface';
import { EditorManager } from './../../editor-manager/base/editor-manager';
import { extend } from '@syncfusion/ej2-base';
import { htmlKeyConfig } from './../../common/config';
import { HtmlToolbarStatus } from '../actions/html-toolbar-status';

/**
 * HTML adapter
 * 
 * @hidden
 * @deprecated
 */
export class HTMLFormatter extends Formatter {
    public keyConfig: { [key: string]: string };
    public currentDocument: Document;
    public element: Element;
    public editorManager: IEditorModel;
    private toolbarUpdate: HtmlToolbarStatus;

    public constructor(options?: IHtmlFormatterModel) {
        super();
        this.initialize();
        extend(this, this, options, true);
        if (this.currentDocument && this.element) {
            this.updateFormatter(this.element, this.currentDocument, options.options);
        }
    }
    private initialize(): void {
        this.keyConfig = htmlKeyConfig;
    }
    /**
     * Update the formatter of RichTextEditor
     *
     * @param  {Element} editElement - specifies the edit element.
     * @param  {Document} doc - specifies the doucment
     * @param {number} options - specifies the options
     * @returns {void}
     * @hidden
     * @deprecated
     */
    public updateFormatter(editElement: Element, doc?: Document, options?: { [key: string]: number }): void {
        if (editElement && doc) {
            this.editorManager = new EditorManager({
                document: doc,
                editableElement: editElement,
                options: options
            });
        }
    }
}