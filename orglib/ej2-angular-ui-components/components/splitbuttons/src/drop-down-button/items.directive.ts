import { Directive, ViewContainerRef, ContentChildren } from '@angular/core';
import { ComplexBase, ArrayBase, setValue } from '@syncfusion/ej2-angular-base';



let input: string[] = ['disabled', 'iconCss', 'id', 'separator', 'text', 'url'];
let outputs: string[] = [];

@Directive({
    selector: 'e-dropdownbuttonitems>e-dropdownbuttonitem',
    inputs: input,
    outputs: outputs,    
    queries: {

    }
})
export class DropDownButtonItemDirective extends ComplexBase<DropDownButtonItemDirective> {
    public directivePropList: any;


    /** 
     * Used to enable or disable the item.
     * @default false
     */
    public disabled: any;
    /** 
     * Defines class/multiple classes separated by a space for the item that is used to include an icon. 
     * Action item can include font icon and sprite image.
     * @default ''
     */
    public iconCss: any;
    /** 
     * Specifies the id for item.
     * @default ''
     */
    public id: any;
    /** 
     * Specifies separator between the items. Separator are horizontal lines used to group action items.
     * @default false
     */
    public separator: any;
    /** 
     * Specifies text for item.
     * @default ''
     */
    public text: any;
    /** 
     * Specifies url for item that creates the anchor link to navigate to the url provided.
     * @default ''
     */
    public url: any;

    constructor(private viewContainerRef:ViewContainerRef) {
        super();
        setValue('currentInstance', this, this.viewContainerRef);
        this.registerEvents(outputs);
        this.directivePropList = input;
    }
}

/**
 * DropDownButtonItem Array Directive
 * @private
 */
@Directive({
    selector: 'ejs-dropdownbutton>e-dropdownbuttonitems',
    queries: {
        children: new ContentChildren(DropDownButtonItemDirective)
    },
})
export class DropDownButtonItemsDirective extends ArrayBase<DropDownButtonItemsDirective> {
    constructor() {
        super('items');
    }
}