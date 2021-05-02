# Changelog

## [Unreleased]

## 19.1.59 (2021-05-04)

### Spreadsheet

#### Bug Fixes

- `#24579` - `Gridlines` got disappear while performing horizontal scrolling with `showHeaders` property as `false` issue resolved.
- `#23650` - Formula reference not properly updated on copy / paste action issue resolved.
- `I319406` - Date is not updated properly in `Ukraine` time zone issue resolved.
- `#I314883` - Formula dependent cells not updated after rendering destroyed spreadsheet issue has been fixed.
- `#F164825` - Cell navigation throws script error when `allowScrolling` set to `false` issue has been fixed.
- `#23944` - Formula suggestion drop down is not displayed in the cells located in the bottom of the sheet issue has been fixed.
- `I312024` - `Sheets` property binding not working issue resolved.
- `#24848` - Nested formula issue resolved.

## 19.1.58 (2021-04-27)

### Spreadsheet

#### Bug Fixes

- `#22087` - Filter icon is removed after refresh issue has been fixed.
- `#24222` - Conditional formatting font color is changed to default color in list data validation issue has been fixed.
- `#23945` - Conditional Formatting is not working properly when range is selected from down to up & right to left issue has been fixed.
- `F163837`, `F164024` - Number format drop down shows wrong formatted value while setting locale text for the number format items issue resolved.
- `#23856` - Height of the merged cell increases on `Alt + Enter` action issue resolved.
- `#23644` - Dependent cells not updated after using `openFromJson` and `refresh` method issue resolved.

## 19.1.57 (2021-04-20)

### Spreadsheet

#### Bug Fixes

- Custom height not working properly while importing with wrap text, it updates normal height.
- `#24298` - Conditional formatting applied to selected cells even if there is no value given in the dialog issue resolved.
- Issue with copy data from power point table and paste it in spreadsheet has been fixed.
`#I314444` - Fixed cell selection issue in different screen resolution.
`#24295` - Aggregate count is not displayed properly when selected range contains zero value issue has been fixed.
`#23869` - Paste values only is not working for formula cells issue has been fixed.
`#23867` - Cancel button is not working in hyperlink dialog when sheet is protected issue has been fixed.
`#23861` - Unwrapping externally pasted wrap text does not reduce the row height issue has been fixed.
`#23112` - Match function is not working when cell reference is given as parameter issue has been fixed.
`#21561` - Unable to type percentage value without autoformat issue has been fixed.

## 19.1.56 (2021-04-13)

### Spreadsheet

#### Bug Fixes

`#I323532` - Pressing any key on chart throws script error issue has been fixed.

## 19.1.55 (2021-04-06)

### Spreadsheet

#### Bug Fixes

- Sort formula not working properly issue resolved.
- Clipboard style issue resolved.
- `I316103` - Resolved the selection misalignment issue in non virtual mode.
`#I316931` - Selection alignment for wrap cell having border on 150 resolution issue has been fixed.
`#I321143` - Warning message is not showing while deleting locked cells issue has been fixed.
`#I319204` - Skipped `query` property while saving as JSON.

## 19.1.54 (2021-03-30)

### Spreadsheet

#### New Features

- **Freeze pane:** Allows users to keep the specified rows and columns always visible at the top and left side of the sheet while scrolling through the sheet.
- **PDF Export:** Allows users to save the spreadsheet data as a PDF document.
- **Password protection:** Allows users to protect the workbook with a password.

#### Bug Fixes

- Copy / paste the merge cells not working properly issue resolved.
`#I316931` - Selection misalignment issue when applying border on wrap text has been resolved.

## 18.4.44 (2021-02-23)

### Spreadsheet

#### Bug Fixes

- The `getData` method is not working when range is passed without sheet name issue fixed.

## 18.4.43 (2021-02-16)

### Spreadsheet

#### Bug Fixes

`#F161227` - Prevented deleting range which contains lock cells.
`#F162534` - Issue on editing a cell that depend on other cell after addition of date using Plus (+) operator issue fixed.
`#313009` - Delete rows and columns using `delete` method issues resolved.
`#313000` - The `insertSheet` method will now prevent the sheet with duplicate name from inserting.
`#I312853` - Provided the actionBegin and actionComplete event for sheet rename action in spreadsheet

## 18.4.42 (2021-02-09)

### Spreadsheet

#### Bug Fixes

- External paste for cell style is not working properly when spreadsheet has common style issue has been fixed.
- Ribbon items are not updated during external paste issue has been fixed.
- External paste is not working for `strikethrough` style issue has been fixed.
- Wrap with Resize, text align issue fixed.
- Formula range with more than AA issue fixed.

## 18.4.41 (2021-02-02)

### Spreadsheet

#### Bug Fixes

`#I311925` - Event `cellSave` is not triggered when list value changes issue has been fixed.

## 18.4.39 (2021-01-28)

### Spreadsheet

#### Bug Fixes

`#F161227` - Lock cell delete issue prevented.
`#I311230` - Sorting for number is not working after editing issue has been fixed.
`#I311230` - Pasting within the copied range is not working properly issue has been fixed.

## 18.4.35 (2021-01-19)

### Spreadsheet

#### Bug Fixes

`#I308657` - Hyperlink issue with the colon specified address is fixed.

## 18.4.34 (2021-01-12)

### Spreadsheet

#### Bug Fixes

`#I309395` - Merge method for different sheet is not working issue fixed.
`#I309076` - Formula parsing issue fixed.

## 18.4.33 (2021-01-05)

### Spreadsheet

#### Bug Fixes

`#I308693` - Editing merge cell shows text two times issue has been fixed.
`#I308693` - Undo & redo is not working for background color issue has been fixed.
`#I293654` - Nested formula issue fixed.

## 18.4.32 (2020-12-29)

### Spreadsheet

#### Bug Fixes

`#I308504` - Added missed text in the localization file.
`#I305131` - Unlocking cells is not working for the defined columns in the view in ASP.NET Core issue has been fixed.

## 18.4.31 (2020-12-22)

### Spreadsheet

#### Bug Fixes

`#I296802` - Provided proper error support and if formula issue fixed.

## 18.4.30 (2020-12-17)

### Spreadsheet

#### New Features

- **Chart:** Transforms your Spreadsheet data to an intuitive overview for better understanding and to make smart business decisions.
`#I298335` - Provided support to paste content inside a cell while editing.
`#I301769` - Provided support for short date formats `dd/MM/yyyy` and `yyyy-MM-dd`.

#### Bug Fixes

`#I301769` - Entered date value changes for Eastern European Standard Time issue has been fixed.
`#I301769` - Sorting whole column show empty rows first issue has been fixed.

## 18.3.52 (2020-12-01)

### Spreadsheet

#### Bug Fixes

- Paste is not working when clicking on paste button in the ribbon tab.
`#I296802` - Fixed column paste and formula issue.

## 18.3.51 (2020-11-24)

### Spreadsheet

#### New Features

`#I300338` - Provided support to link the whole column or row data to the list validation.
`#I300657` - Provided support for custom alert message to the validation dialog.

#### Bug Fixes

`#I301708` - Border is removed when pasting values adjacent to border contained cells issue has been fixed.

## 18.3.50 (2020-11-17)

### Spreadsheet

#### Bug Fixes

`#I301868` - Script error throws after editing long number in custom format applied cell issue has been fixed.
`#I301863` - Issue of editing date in `Text` format applied cell is formatted to date value has been fixed.
`#I300737` - Issue of select all after scrolling not selecting some top rows has been fixed.
`#I300737` - External paste is not working when spreadsheet has copied data issue has been fixed.

## 18.3.48 (2020-11-11)

### Spreadsheet

#### Bug Fixes

- Cell text navigation through mouse click is not working during cell edit issue has been fixed.
`#I301019` - Default value not set for data validation model issue has been fixed.
`#I301121` - Script error throws while editing the border style applied cell issue fixed.

## 18.3.47 (2020-11-05)

### Spreadsheet

#### Bug Fixes

`#I295003` - Column header misalignment during scrolling when the spreadsheet contains merge cell issue has been fixed.
`#I299237` - Keyboard shortcut for clipboard is not working on macOS issue has been fixed.
`#I292451` - Cell misalignment during scrolling when it contains merged range issue has been fixed.

## 18.3.44 (2020-10-27)

### Spreadsheet

#### Bug Fixes

`#I298442` - File type added for `file` property in `OpenOptions`.

#### New Features

- **Dynamic data binding:** Provides the option to change datasource dynamically by changing `dataSource` property of the range.

## 18.3.42 (2020-10-20)

### Spreadsheet

#### Bug Fixes

`#I297215`- The method `lockCell` is not working in JS platform issue has been fixed.
`#I296710`- Formula reference selection issue has been fixed.

## 18.3.40 (2020-10-13)

### Spreadsheet

#### Bug Fixes

`#I295594`- Data validation export issue with the empty values has been fixed.
`#I287796`- Image not displaying issue has been fixed.
`#I296132`- Console issue while providing the incorrect data source format has been fixed.
`#I296145`- Number value not updated properly with the property binding in angular spreadsheet fixed.
`#I290629`- Script error throws while editing the formula bar after scrolling fixed.
`#I288573` - Fixed issue of cell is duplicated randomly on merge cell during scrolling.
`#I295398`- Added isLocked cell property in import export support.
`#I301019` - Default value not set for data validation model issue has been fixed.
`#I301121` - Script error throws while editing the border style applied cell issue fixed.

## 18.3.35 (2020-10-01)

### Spreadsheet

#### Bug Fixes

`#I276272`- Spinner not showed until remote data being loaded issue is fixed.
`#I285113`, `#I285621`, `#I286053`, `#I286103`, `#I288652`- Spreadsheet is not working in ES2015 issue is fixed.
`#I287385` - Added missed text in the localization file.

#### New Features

`#I282699`- Provided option to prevent protected sheet dialog box in spreadsheet.
- **Picture:** Allows you to view, insert, and modify a picture in a spreadsheet with customizing options.
- **Multi-line editing:** Allows you to insert a line break between paragraphs of the text within a cell in a Spreadsheet.
- **Range selection helper:** Helps you to select a range or multiple ranges when editing a formula in a cell.

## 18.2.44 (2020-07-07)

### Spreadsheet

#### New Features

- **Conditional formatting:** Provides option to format a cell or range of cells based on the conditions applied.
- **Clear:** Provides option to clear the content, formats, and hyperlinks applied to a cell or range of cells in a spreadsheet.
- **Aggregates:** Provides option to check the sum, average, and count for the selected cells or range in the sheet tab.

## 18.1.56 (2020-06-09)

### Spreadsheet

#### Bug Fixes

`#I279666`- Provided the actionBegin and actionComplete event for page switching action.
`#I276608`- Provided the validation to prevent the long text exception for list data validation.

### Spreadsheet

#### Breaking Changes

- API name changes.

Old Property | New Property
-----|-----
`rangeSettings` | `ranges`

## 18.1.42 (2020-04-01)

### Spreadsheet

#### Bug Fixes

`#I256901` - Used range not setting properly while using cell data binding issue is fixed.
`#I264109` - Error alert doesn't shows when named range given with space issue is fixed.
`#I266607` - Header created multiple time while adding the sheet model dynamically is fixed.

#### New Features

- **Merge cells:** Provides option to can combine two or more cells located in the same row or column into a single cell.

#### Breaking Changes

- API name changes.

Old Property | New Property
-----|-----
`activeSheetTab` | `activeSheetIndex`

## 18.1.36-beta (2020-03-19)

### Spreadsheet

#### New Features

- **Wrap text:** Provides the option to display the large content as multiple lines in a single cell.
- **Data validation:** Provides the option to validate edited values based on data validation rules defined for a cell or range of cells.
- **Find and Replace:** Provides the option to find the data and replace it across all the sheets in Spreadsheet.
- **Protect sheet:** Provides the option to restrict the user actions like cell editing, row and column insertion, deletion, and resizing.
- **Borders:** Provides the option to customize cell gridlines such as color and its style for enhanced UI.
- **Show/Hide:** Provides the option to show/hide the rows, columns and sheets.
- **Insert/delete:** Provides the option to insert/delete the rows, columns and sheets.

## 17.4.51 (2020-02-25)

### Spreadsheet

#### New Features

`#I258049`- Provided LN formula support in Spreadsheet.

## 17.4.50 (2020-02-18)

### Spreadsheet

#### Bug Fixes

- File menu item select event not triggered issue fixed.

## 17.4.49 (2020-02-11)

### Spreadsheet

#### Bug Fixes

- Integrated the separate styles for filtering.

## 17.4.47 (2020-02-05)

### Spreadsheet

#### Bug Fixes

`#I256901` - Hyperlink is not working with URL scheme 'https' issue has been fixed.
`#I256901` - Export not working when adding hyperlink through method issue has been fixed.

## 17.4.46 (2020-01-30)

### Spreadsheet

#### New Features

- `#I256901` - Provided the supports to show/hide ribbon tabs, add new ribbon tabs and enable/disable file menu items.
- `#I257035` - Provided option to add custom items in Spreadsheet ribbon toolbar
- `#I261768` - Provided custom function support.
- `#I259360` - Provided sheet visibility support to hide/show the sheets in Spreadsheet.
- Provided `AutoFit` method for auto resize the rows/columns in Spreadsheet.
- `#I251695`, `#I256191`, `#I261629` - Provided Save as JSON and Load from JSON support.
- `#I251210`, `#I256211` - Provided cell template support which is used for adding custom components in to Spreadsheet.
- `#I258878`, `#I260952`, `#I258876`, `#I258049` - Provided `SLOPE` and `INTERCEPT` Formula support.

#### Bug Fixes

- `#I256901` - Script error while loading the Spreadsheet control with empty data source issue fixed.
- `#I256901` - Support Handled for providing the hyperlink through data source.
- `#I260738` - Fixed the style compatibility issue.

## 17.4.41 (2020-01-07)

### Spreadsheet

#### Bug Fixes

`#F149335` - Excel export issue has been fixed.

## 17.4.39 (2019-12-17)

### Spreadsheet

#### New Features

- **Filtering:** Helps you to view specific rows in the spreadsheet by hiding the other rows.
- **Undo Redo:** Provides the option to perform undo redo operations in spreadsheet.
- **Collaborative Editing:** Provides the option for real time changes across multiple users in the Spreadsheet.
- **Hyperlink:** Provides the option to navigate the web links or cell reference within the sheet or to other sheets in spreadsheet.

## 17.3.16 (2019-10-09)

### Spreadsheet

#### New Features

- Provided `updateCell` method to update a cell properties

## 17.3.14 (2019-10-03)

### Spreadsheet

#### New Features

- **Sorting:** Helps you to arrange the data to particular order in a selected range of cells.
- **Resize:** Allows you to change the row height and column width. Auto fit the rows and columns based on its content.

## 17.3.9-beta (2019-09-20)

### Spreadsheet

The Spreadsheet is an user interactive component to organize and analyze data in tabular format with configuration options for customization.

- **Data sources:** Binds the spreadsheet component with an array of JavaScript objects or DataManager.
- **Virtualization:** Provides option to load large amount of data without performance degradation.
- **Selection:** Provides option to select a cell or range of cells.
- **Editing:** Provides options to dynamically edit a cell.
- **Formulas:** Provides built-in calculation library with predefined formulas and named range support.
- **Clipboard:** Provides option to perform the clipboard operations.
- **Cell formatting:** Provides option to customize the appearance of cells.
- **Number formatting:** Provides option to format the cell value.
- **Open:** Provides option to open an Excel file in spreadsheet.
- **Save:** Provides option to save spreadsheet data as excel file.
- **RTL:** Provides right-to-left mode which aligns content in the spreadsheet component from right to left.
- **Localization:** Provides inherent support to localize the UI.
- **Accessibility:** Provides with built-in accessibility support which helps to access all the spreadsheet component features using the keyboard, screen readers, or other assistive technology devices.
