import { EditorManager } from './../base/editor-manager';
import * as CONSTANT from './../base/constant';
import { NodeSelection } from './../../selection';
import { IHtmlSubCommands } from './../base/interface';
import { IHtmlKeyboardEvent } from './../../editor-manager/base/interface';
import { KeyboardEventArgs } from '@syncfusion/ej2-base';
import * as EVENTS from './../../common/constant';
import { isIDevice, setEditFrameFocus } from '../../common/util';
/**
 * Indents internal component
 * 
 * @hidden
 * @deprecated
 */
export class Indents {
    private parent: EditorManager;
    private indentValue: number = 20;
    /**
     * Constructor for creating the Formats plugin
     *
     * @param {EditorManager} parent - specifies the parent element
     * @hidden
     * @deprecated
     */
    public constructor(parent: EditorManager) {
        this.parent = parent;
        this.addEventListener();
    }
    private addEventListener(): void {
        this.parent.observer.on(CONSTANT.INDENT_TYPE, this.applyIndents, this);
        this.parent.observer.on(EVENTS.KEY_DOWN_HANDLER, this.onKeyDown, this);
    }
    private onKeyDown(e: IHtmlKeyboardEvent): void {
        switch ((e.event as KeyboardEventArgs).action) {
        case 'indents':
            this.applyIndents({ subCommand: 'Indent', callBack: e.callBack });
            e.event.preventDefault();
            break;
        case 'outdents':
            this.applyIndents({ subCommand: 'Outdent', callBack: e.callBack });
            e.event.preventDefault();
            break;
        }
    }
    private applyIndents(e: IHtmlSubCommands): void {
        const range: Range = this.parent.nodeSelection.getRange(this.parent.currentDocument);
        let save: NodeSelection = this.parent.nodeSelection.save(range, this.parent.currentDocument);
        this.parent.domNode.setMarker(save);
        const indentsNodes: Node[] = this.parent.domNode.blockNodes();
        const parentNodes: Node[] = indentsNodes.slice();
        const listsNodes: Node[] = [];
        for (let i: number = 0; i < parentNodes.length; i++) {
            if ((parentNodes[i] as Element).tagName !== 'LI' && 'LI' === (parentNodes[i].parentNode as Element).tagName) {
                indentsNodes.splice(indentsNodes.indexOf(parentNodes[i]), 1);
                listsNodes.push(parentNodes[i].parentNode);
            } else if ((parentNodes[i] as Element).tagName === 'LI') {
                indentsNodes.splice(indentsNodes.indexOf(parentNodes[i]), 1);
                listsNodes.push(parentNodes[i]);
            }
        }
        if (listsNodes.length > 0) {
            this.parent.observer.notify(EVENTS.KEY_DOWN_HANDLER, {
                event: {
                    preventDefault: () => {
                        return;
                    },
                    stopPropagation: () => {
                        return;
                    },
                    shiftKey: (e.subCommand === 'Indent' ? false : true),
                    which: 9,
                    action: 'indent'
                },
                ignoreDefault: true
            });
        }
        for (let i: number = 0; i < indentsNodes.length; i++) {
            const parentNode: Element = indentsNodes[i] as Element;
            const marginLeft: string = (parentNode as HTMLElement).style.marginLeft;
            let indentsValue: string;
            if (e.subCommand === 'Indent') {
                // eslint-disable-next-line
                indentsValue = marginLeft === '' ? this.indentValue + 'px' : parseInt(marginLeft, null) + this.indentValue + 'px';
                (parentNode as HTMLElement).style.marginLeft = indentsValue;
            } else {
                // eslint-disable-next-line
                indentsValue = (marginLeft === '' || marginLeft === '0px') ? '' : parseInt(marginLeft, null) - this.indentValue + 'px';
                (parentNode as HTMLElement).style.marginLeft = indentsValue;
            }
        }
        (this.parent.editableElement as HTMLElement).focus();
        if (isIDevice()) {
            setEditFrameFocus(this.parent.editableElement, e.selector);
        }
        save = this.parent.domNode.saveMarker(save);
        save.restore();
        if (e.callBack) {
            e.callBack({
                requestType: e.subCommand,
                editorMode: 'HTML',
                event: e.event,
                range: this.parent.nodeSelection.getRange(this.parent.currentDocument),
                elements: this.parent.domNode.blockNodes() as Element[]
            });
        }
    }
}