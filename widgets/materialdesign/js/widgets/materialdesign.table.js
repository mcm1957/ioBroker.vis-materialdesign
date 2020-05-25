/*
    ioBroker.vis vis-materialdesign Widget-Set
    
    Copyright 2019 Scrounger scrounger@gmx.net
*/
"use strict";

vis.binds.materialdesign.table = {
    initialize: function (el, data) {
        try {
            let $this = $(el);
            let tableElement = []

            let headerFontSize = myMdwHelper.getFontSize(data.headerTextSize);

            let tableLayout = '';
            if (data.tableLayout === 'card') {
                tableLayout = 'materialdesign-list-card';
            } else if (data.tableLayout === 'cardOutlined') {
                tableLayout = 'materialdesign-list-card materialdesign-list-card--outlined';
            }

            tableElement.push(`<div class="mdc-data-table ${myMdwHelper.getBooleanFromData(data.fixedHeader, false) ? 'fixed-header' : ''} ${tableLayout}" style="width: 100%;">
                                    <table class="mdc-data-table__table" aria-label="Material Design Widgets Table">`)

            tableElement.push(`<thead ${myMdwHelper.getBooleanFromData(data.fixedHeader, false) ? 'style="position: sticky; top: 0;"' : ''}>
                                    <tr class="mdc-data-table__header-row" style="height: ${(myMdwHelper.getNumberFromData(data.headerRowHeight, null) !== null) ? data.headerRowHeight + 'px' : '1px'};">`)



            if (data.showHeader) {
                for (var i = 0; i <= data.countCols; i++) {
                    if (data.attr('showColumn' + i)) {
                        tableElement.push(`<th class="mdc-data-table__header-cell ${headerFontSize.class}" 
                                            colIndex="${i}" 
                                            role="columnheader" 
                                            scope="col" 
                                            style="text-align: ${data.attr('textAlign' + i)};
                                                ${headerFontSize.style}; 
                                                padding-left: ${myMdwHelper.getNumberFromData(data.attr('padding_left' + i), 8)}px; 
                                                padding-right: ${myMdwHelper.getNumberFromData(data.attr('padding_right' + i), 8)}px; 
                                                font-family: ${myMdwHelper.getValueFromData(data.headerFontFamily, '')};
                                                ${(myMdwHelper.getNumberFromData(data.attr('columnWidth' + i), null) !== null) ? `width: ${data.attr('columnWidth' + i)}px;` : ''};">
                                                    ${myMdwHelper.getValueFromData(data.attr('label' + i), 'col ' + i)}
                                            </th>`)
                    }
                }
            }
            tableElement.push(`</tr>
                            </thead>`);


            tableElement.push(`<tbody class="mdc-data-table__content">`);

            // adding Content
            if (myMdwHelper.getValueFromData(data.oid, null) !== null && vis.states.attr(data.oid + '.val') !== null) {
                tableElement.push(vis.binds.materialdesign.table.getContentElements($this, vis.states.attr(data.oid + '.val'), data));
            } else {
                tableElement.push(vis.binds.materialdesign.table.getContentElements($this, data.dataJson, data));
            }

            tableElement.push(`</tbody>`);


            tableElement.push(`</table>
                            </div>`)

            return tableElement.join('');
        } catch (ex) {
            console.error(`[Table - ${data.wid}] initialize: error: ${ex.message}, stack: ${ex.stack}`);
        }
    },
    handle: function (el, data) {
        try {
            let $this = $(el);
            $this.append(this.initialize(el, data));

            myMdwHelper.waitForElement($this, `.mdc-data-table`, data.wid, 'Table', function () {
                myMdwHelper.waitForRealHeight($this.context, data.wid, 'Table', function () {
                    let table = $this.find('.mdc-data-table').get(0);

                    let height = window.getComputedStyle($this.context, null).height
                    $this.find('.mdc-data-table').css('height', height);
                    // $this.find('.mdc-data-table__table').css('height', height);

                    let heightHeader = window.getComputedStyle($this.find('.mdc-data-table__header-row').get(0), null).height;
                    $this.find('.mdc-data-table__content').css('height', (parseInt(height.replace('px', '')) - parseInt(heightHeader.replace('px', '')) - 2) + 'px');

                    table.style.setProperty("--materialdesign-color-table-background", myMdwHelper.getValueFromData(data.colorBackground, ''));
                    table.style.setProperty("--materialdesign-color-table-border", myMdwHelper.getValueFromData(data.borderColor, ''));
                    table.style.setProperty("--materialdesign-color-table-header-row-background", myMdwHelper.getValueFromData(data.colorHeaderRowBackground, ''));
                    table.style.setProperty("--materialdesign-color-table-header-row-text-color", myMdwHelper.getValueFromData(data.colorHeaderRowText, ''));
                    table.style.setProperty("--materialdesign-color-table-row-background", myMdwHelper.getValueFromData(data.colorRowBackground, ''));
                    table.style.setProperty("--materialdesign-color-table-row-text-color", myMdwHelper.getValueFromData(data.colorRowText, ''));
                    table.style.setProperty("--materialdesign-color-table-row-divider", myMdwHelper.getValueFromData(data.dividers, ''));

                    const mdcTable = new mdc.dataTable.MDCDataTable(table);

                    vis.states.bind(data.oid + '.val', function (e, newVal, oldVal) {
                        $this.find('.mdc-data-table__content').empty();
                        $this.find('.mdc-data-table__content').append(vis.binds.materialdesign.table.getContentElements($this, newVal, data));
                    });

                    $this.find('.mdc-data-table__header-cell').click(function (obj) {
                        let colIndex = $(this).attr('colIndex');
                        let sortASC = true;

                        let jsonData = [];
                        if (myMdwHelper.getValueFromData(data.oid, null) !== null && vis.states.attr(data.oid + '.val') !== null) {
                            jsonData = vis.binds.materialdesign.table.getJsonData(vis.states.attr(data.oid + '.val'), data);
                        } else {
                            jsonData = JSON.parse(data.dataJson)
                        }

                        let key = (myMdwHelper.getValueFromData(data.attr('sortKey' + colIndex), null) !== null) ? data.attr('sortKey' + colIndex) : Object.keys(jsonData[0])[colIndex];

                        if ($(this).attr('sort')) {
                            if ($(this).attr('sort') === 'ASC') {
                                sortASC = false;
                                $(this).attr('sort', 'DESC');
                                ($(this).text().includes('▾') || $(this).text().includes('▴')) ?
                                    $(this).text($(this).text().replace('▾', '▴')) : $(this).text($(this).text() + '▴');
                            } else {
                                sortASC = true;
                                $(this).attr('sort', 'ASC');
                                ($(this).text().includes('▾') || $(this).text().includes('▴')) ?
                                    $(this).text($(this).text().replace('▴', '▾')) : $(this).text($(this).text() + '▾');
                            }
                        } else {
                            // sort order is not defined -> sortASC
                            sortASC = true;
                            $(this).attr('sort', 'ASC');
                            $(this).text($(this).text() + '▾');
                        }

                        $('.mdc-data-table__header-cell').each(function () {
                            if ($(this).attr('colIndex') !== colIndex) {
                                $(this).text($(this).text().replace('▴', '').replace('▾', ''));
                            }
                        });

                        $this.find('.mdc-data-table__content').empty();
                        $this.find('.mdc-data-table__content').append(vis.binds.materialdesign.table.getContentElements($this, null, data, sortByKey(jsonData, key, sortASC)));      //TODO: sort key by user defined

                        function sortByKey(array, key, sortASC) {
                            return array.sort(function (a, b) {
                                var x = a[key];
                                var y = b[key];

                                if (sortASC) {
                                    return ((x < y) ? -1 : ((x > y) ? 1 : 0));
                                } else {
                                    return ((x > y) ? -1 : ((x < y) ? 1 : 0));
                                }
                            });
                        }
                    });
                });
            });
        } catch (ex) {
            console.error(`[Table - ${data.wid}] handle: error: ${ex.message}, stack: ${ex.stack}`);
        }
    },
    getContentElements: function ($this, input, data, jsonData = null) {
        let contentElements = [];

        if (jsonData === null) {
            jsonData = vis.binds.materialdesign.table.getJsonData(input, data);
        }

        if (jsonData && jsonData != null) {

            for (var row = 0; row <= jsonData.length - 1; row++) {
                contentElements.push(`<tr class="mdc-data-table__row" style="height: ${(myMdwHelper.getNumberFromData(data.rowHeight, null) !== null) ? data.rowHeight + 'px' : '1px'};">`);

                if (jsonData[row]) {
                    // col items is object
                    let until = (Object.keys(jsonData[row]).length - 1 > data.countCols) ? data.countCols : Object.keys(jsonData[row]).length - 1;

                    for (var col = 0; col <= until; col++) {
                        if (data.attr('showColumn' + col)) {
                            let textSize = myMdwHelper.getFontSize(data.attr('colTextSize' + col));

                            contentElements.push(getContentElement(row, col, Object.values(jsonData[row])[col], textSize, jsonData[row]));
                        }
                    }
                }
                contentElements.push(`</tr>`);
            }

            function getContentElement(row, col, objValue, textSize, rowData = null) {
                let prefix = myMdwHelper.getValueFromData(data.attr('prefix' + col), '');
                let suffix = myMdwHelper.getValueFromData(data.attr('suffix' + col), '');

                if (rowData != null) {
                    if (prefix !== '') {
                        prefix = getInternalTableBinding(prefix, rowData);
                    }

                    if (suffix !== '') {
                        suffix = getInternalTableBinding(suffix, rowData);
                    }

                    function getInternalTableBinding(str, rowData) {
                        let regex = str.match(/(#\[obj\..*?\])/g);

                        if (regex && regex.length > 0) {
                            for (var i = 0; i <= regex.length - 1; i++) {
                                let objName = regex[i].replace('#[obj.', '').replace(']', '');

                                if (objName && rowData[objName]) {
                                    str = str.replace(regex[i], rowData[objName]);
                                } else {
                                    str = str.replace(regex[i], '');
                                }
                            }
                        }

                        return str;
                    }
                }

                if (data.attr('colType' + col) === 'image') {
                    objValue = `<img src="${objValue}" style="height: auto; vertical-align: middle; width: ${myMdwHelper.getValueFromData(data.attr('imageSize' + col), '', '', 'px;')}">`;
                }

                let element = `${prefix}${objValue}${suffix}`

                if (typeof (objValue) === 'object') {
                    let elementData = vis.binds.materialdesign.table.getElementData(objValue, data.wid);

                    if (objValue.type === 'buttonToggle' || objValue.type === 'buttonToggle_vertical') {

                        let init = vis.binds.materialdesign.button.initializeButton(elementData);
                        if (objValue.type === 'buttonToggle_vertical') {
                            init = vis.binds.materialdesign.button.initializeVerticalButton(elementData);
                        }

                        element = `<div class="vis-widget materialdesign-widget materialdesign-button ${init.style} materialdesign-button-table-row_${row}-col_${col}" data-oid="${elementData.oid}" isLocked="${myMdwHelper.getBooleanFromData(elementData.lockEnabled, false)}" style="display: inline-block; position: relative; ${objValue.width ? `width: ${objValue.width};` : 'width: 80%;'} ${objValue.height ? `height: ${objValue.height};` : ''}">
                                        ${init.button}
                                    </div>`

                        myMdwHelper.waitForElement($this, `.materialdesign-button-table-row_${row}-col_${col}`, data.wid, 'Table Button Toggle Vertical', function () {
                            let btn = $this.find(`.materialdesign-button-table-row_${row}-col_${col}`).children().get(0);
                            vis.binds.materialdesign.addRippleEffect(btn, elementData);
                            vis.binds.materialdesign.button.handleToggle(btn, elementData);
                        });
                    } else if (objValue.type === 'buttonToggle_icon') {
                        let init = vis.binds.materialdesign.button.initializeButton(elementData, true);

                        element = `<div class="vis-widget materialdesign-widget materialdesign-icon-button ${init.style} materialdesign-button-table-row_${row}-col_${col}" data-oid="${elementData.oid}" isLocked="${myMdwHelper.getBooleanFromData(elementData.lockEnabled, false)}" style="display: inline-block; position: relative; ${objValue.width ? `width: ${objValue.width};` : 'width: 48px;'} ${objValue.height ? `height: ${objValue.height};` : 'height: 48px;'}">
                                        ${init.button}
                                    </div>`

                        myMdwHelper.waitForElement($this, `.materialdesign-button-table-row_${row}-col_${col}`, data.wid, 'Table Button Toggle Vertical', function () {
                            let btn = $this.find(`.materialdesign-button-table-row_${row}-col_${col}`).children().get(0);
                            vis.binds.materialdesign.addRippleEffect(btn, elementData, true);
                            vis.binds.materialdesign.button.handleToggle(btn, elementData);
                        });
                    } else if (objValue.type === 'progress') {
                        element = `<div class="vis-widget materialdesign-widget materialdesign-progress materialdesign-progress-table-row_${row}-col_${col}" data-oid="${elementData.oid}" style="display: inline-block; position: relative; ${objValue.width ? `width: ${objValue.width};` : 'width: 80%;'} ${objValue.height ? `height: ${objValue.height};` : 'height: 24px;'}">
                                    </div>`

                        myMdwHelper.oidNeedSubscribe(elementData.oid, data.wid, 'Table Progress', true);

                        myMdwHelper.subscribeStatesAtRuntime(data.wid, 'Table Progress', function () {
                            myMdwHelper.waitForElement($this, `.materialdesign-progress-table-row_${row}-col_${col}`, data.wid, 'Table Button Toggle Vertical', function () {
                                let progress = $this.find(`.materialdesign-progress-table-row_${row}-col_${col}`);

                                vis.binds.materialdesign.progress.linear(progress, elementData);
                            });
                        });
                    } else if (objValue.type === 'progress_circular') {
                        element = `<div class="vis-widget materialdesign-widget materialdesign-progress materialdesign-progress-circular-table-row_${row}-col_${col}" data-oid="${elementData.oid}" style="display: inline-block; position: relative; ${objValue.width ? `width: ${objValue.width};` : 'width: 60px;'} ${objValue.height ? `height: ${objValue.height};` : 'height: 60px;'}">
                                    </div>`

                        myMdwHelper.oidNeedSubscribe(elementData.oid, data.wid, 'Table Progress Circular', true);

                        myMdwHelper.subscribeStatesAtRuntime(data.wid, 'Table Progress Circular', function () {
                            myMdwHelper.waitForElement($this, `.materialdesign-progress-circular-table-row_${row}-col_${col}`, data.wid, 'Table Button Toggle Vertical', function () {
                                let progress = $this.find(`.materialdesign-progress-circular-table-row_${row}-col_${col}`);

                                vis.binds.materialdesign.progress.circular(progress, elementData);
                            });
                        });
                    }


                }

                return `<td class="mdc-data-table__cell ${textSize.class}" 
                            style="
                            text-align: ${data.attr('textAlign' + col)};${textSize.style}; 
                            padding-left: ${myMdwHelper.getNumberFromData(data.attr('padding_left' + col), 8)}px; 
                            padding-right: ${myMdwHelper.getNumberFromData(data.attr('padding_right' + col), 8)}px; 
                            color: ${myMdwHelper.getValueFromData(data.attr('colTextColor' + col), '')}; 
                            font-family: ${myMdwHelper.getValueFromData(data.attr('fontFamily' + col), '')};
                            white-space: ${(data.attr('colNoWrap' + col) ? 'nowrap' : 'unset')};
                            ${(myMdwHelper.getNumberFromData(data.attr('columnWidth' + col), null) !== null) ? `width: ${data.attr('columnWidth' + col)}px;` : ''};
                            ">
                                ${element}
                        </td>`
            };

            return contentElements.join('');
        }
    },
    getJsonData: function (input, data) {
        let jsonData = [];

        if (input && typeof input === 'string') {
            try {
                jsonData = JSON.parse(input)
            } catch (err) {
                console.error(`[Table - ${data.wid}] getJsonData: input: ${input}, error: ${err.message}`);
            }
        } else {
            jsonData = input;

            if (!Array.isArray(jsonData)) {
                // convert to array
                jsonData = Object.keys(jsonData).map(function (_) { return jsonData[_]; });

                // extract data (json is diffrent to vis)
                let tmp = [];
                for (var i = 0; i <= Object.keys(jsonData).length - 1; i++) {
                    if (jsonData[i]._data) {
                        tmp.push(jsonData[i]._data);
                    }
                }
                jsonData = tmp;
            }
        }

        return jsonData;
    },
    getElementData: function (obj, widgetId) {
        if (obj.type === 'buttonToggle' || obj.type === 'buttonToggle_vertical' || obj.type === 'buttonToggle_icon') {
            return {
                wid: widgetId,

                //attrs
                oid: obj.oid,
                buttonStyle: myMdwHelper.getValueFromData(obj.buttonStyle, 'raised'),                   // nur Button Toggle, Button Toggle Vertical
                readOnly: obj.readOnly,
                toggleType: myMdwHelper.getValueFromData(obj.toggleType, 'boolean'),
                pushButton: obj.pushButton,
                valueOff: obj.valueOff,
                valueOn: obj.valueOn,
                stateIfNotTrueValue: myMdwHelper.getValueFromData(obj.stateIfNotTrueValue, 'on'),
                vibrateOnMobilDevices: obj.vibrateOnMobilDevices,

                //attrs0
                buttontext: obj.text,                                                                   // nur Button Toggle, Button Toggle Vertical
                labelTrue: obj.textTrue,                                                                // nur Button Toggle, Button Toggle Vertical
                labelColorFalse: obj.textColor,                                                         // nur Button Toggle, Button Toggle Vertical
                labelColorTrue: obj.textColorTrue,                                                      // nur Button Toggle, Button Toggle Vertical
                labelWidth: obj.textWidth,                                                              // nur Button Toggle

                //attrs1
                image: obj.image,
                imageColor: obj.imageColor,
                imageTrue: obj.imageTrue,
                imageTrueColor: obj.imageTrueColor,
                iconPosition: myMdwHelper.getValueFromData(obj.imagePosition, 'top'),                   // nur Button Toggle, Button Toggle Vertical
                iconHeight: obj.imageHeight,

                //attrs2
                colorBgFalse: obj.backgroundColor,
                colorBgTrue: obj.backgroundTrueColor,
                colorPress: obj.backgroundPressColor,

                //attrs3
                lockEnabled: obj.lockEnabled,
                autoLockAfter: obj.autoLockAfter,
                lockIcon: obj.lockIcon,
                lockIconTop: obj.lockIconTop,                                                           // nur Button Toggle Vertical, Button Toggle Icon
                lockIconLeft: obj.lockIconLeft,                                                         // nur Button Toggle Vertical, Button Toggle Icon
                lockIconSize: obj.lockIconSize,
                lockIconColor: obj.lockIconColor,
                lockFilterGrayscale: obj.lockFilterGrayscale,
            };
        } else if (obj.type === 'progress' || obj.type === 'progress_circular') {
            return {
                wid: widgetId,

                //attrs
                oid: obj.oid,
                min: obj.min,
                max: obj.max,
                reverse: obj.reverse,                                                                   // nur Progress

                //attrs0
                progressRounded: obj.progressRounded,                                                   // nur Progress
                progressStriped: obj.progressStriped,                                                   // nur Progress
                progressStripedColor: obj.progressStripedColor,                                         // nur Progress
                progressCircularSize: obj.progressCircularSize,                                         // nur Progress  Circular                    
                progressCircularWidth: obj.progressCircularWidth,                                       // nur Progress  Circular
                progressCircularRotate: obj.progressCircularRotate,                                     // nur Progress  Circular

                //attrs1
                colorProgressBackground: obj.backgroundColor,
                colorProgress: obj.progressColor,
                colorOneCondition: obj.colorOneCondition,
                colorOne: obj.colorOne,
                colorTwoCondition: obj.colorTwoCondition,
                colorTwo: obj.colorTwo,
                innerColor: obj.innerColor,                                                             // nur Progress  Circular

                //attrs2
                showValueLabel: obj.showValueLabel,
                valueLabelStyle: obj.valueLabelStyle,
                valueLabelUnit: obj.valueLabelUnit,
                valueMaxDecimals: obj.valueMaxDecimals,
                valueLabelCustum: obj.valueLabelCustom,
                textColor: obj.textColor,
                textFontSize: obj.textFontSize,
                textFontFamily: obj.textFontFamily,
                textAlign: obj.textAlign                                                                // nur Progress
            }
        }
    }

};