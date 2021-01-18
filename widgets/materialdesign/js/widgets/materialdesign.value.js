/*
    ioBroker.vis vis-materialdesign Widget-Set
    
    Copyright 2019 Scrounger scrounger@gmx.net
*/
"use strict";

vis.binds.materialdesign.value = {
    initialize: async function (el, data) {
        try {
            let $this = $(el);

            $this.html(`
                <div class="materialdesign-value prepand-text" style="margin: 0 2px 0 2px;"></div>
                <div class="materialdesign-value value-text" style="margin: 0 2px 0 2px; flex: 1;"></div>
                <div class="materialdesign-value append-text" style="margin: 0 2px 0 2px;"></div>
            `);

            let $prepandText = $this.find('.prepand-text');
            let $valueText = $this.find('.value-text');
            let $appendText = $this.find('.append-text');

            let obj = await myMdwHelper.getObjectAsync(data.oid);
            if (obj && obj.common && obj.common['type']) {
                let val = vis.states.attr(data.oid + '.val');

                let type = obj.common['type'];
                let unit = obj.common.unit ? obj.common.unit : '';

                setValue(val, type);

                vis.states.bind(data.oid + '.val', function (e, newVal, oldVal) {
                    setValue(newVal, type);
                });

                function setValue(value, type) {
                    $prepandText.html(myMdwHelper.getValueFromData(data.prepandText, ''));
                    $appendText.html(myMdwHelper.getValueFromData(data.prepandText, ''));

                    if (type === 'number') {
                        value = myMdwHelper.formatNumber(value, data.minDecimals, data.maxDecimals)
                        unit = myMdwHelper.getValueFromData(data.customUnit, unit);

                        $valueText.html(`${value} ${unit}`);
                    } else if (type === 'string') {
                        $valueText.html(`${value}`);
                    }
                }
            } else {
                if (data.oid !== 'nothing_selected') {
                    $valueText.html(`Error '${data.oid}' not exist!`);
                    $this.css('color', 'FireBrick');
                }
            }
        } catch (ex) {
            console.error(`[Value - ${data.wid}] initialize: error: ${ex.message}, stack: ${ex.stack}`);
        }
    },
    getDataFromJson(obj, widgetId) {
        return {
            wid: widgetId,

            // Common
            oid: obj.oid,
            generateHtmlControl: obj.generateHtmlControl,

            // layout
            valuesFontColor: obj.valuesFontColor,
            valuesFontFamily: obj.valuesFontFamily,
            valuesFontSize: obj.valuesFontSize,
            prepandText: obj.prepandText,
            prepandTextColor: obj.prepandTextColor,
            prepandTextFontFamily: obj.prepandTextFontFamily,
            prepandTextFontSize: obj.prepandTextFontSize,
            appendText: obj.appendText,
            appendTextColor: obj.appendTextColor,
            appendTextFontFamily: obj.appendTextFontFamily,
            appendTextFontSize: obj.appendTextFontSize,

            // group_formatNumber
            customUnit: obj.customUnit,
            minDecimals: obj.minDecimals,
            maxDecimals: obj.maxDecimals,
        }
    },
    getHtmlConstructor(widgetData, type) {
        try {
            let html;
            let width = widgetData.width ? widgetData.width : '100%';
            let height = widgetData.height ? widgetData.height : '100%';

            delete widgetData.width;
            delete widgetData.height;

            html = `<div class="vis-widget materialdesign-widget materialdesign-value materialdesign-value-html-element"` + '\n' +
                '\t' + `style="width: ${width}; height: ${height}; position: relative; display: flex; align-items: center;"` + '\n' +
                '\t' + `mdw-data='${JSON.stringify(widgetData, null, "\t\t\t")}'>`.replace("}'>", '\t\t' + "}'>") + '\n';

            return html + `</div>`;

        } catch (ex) {
            console.error(`[Value getHtmlConstructor]: ${ex.message}, stack: ${ex.stack} `);
        }
    }
}

$.initialize(".materialdesign-value-html-element", function () {
    let $this = $(this);
    let parentId = 'unknown';
    let logPrefix = `[Value HTML Element - ${parentId.replace('w', 'p')}]`;

    try {
        let mdwDataString = $this.attr('mdw-data');
        let widgetName = `Value HTML Element`;

        let $parent = $this.closest('.vis-widget[id^=w]');
        parentId = $parent.attr('id');
        if (!parentId) {
            // Fallback if no parent id is found (e.g. MDW Dialog)            
            parentId = Object.keys(vis.widgets)[0];
        }

        logPrefix = `[Value HTML Element - ${parentId.replace('w', 'p')}]`;

        console.log(`${logPrefix} initialize html element`);

        let mdwData = JSON.parse(mdwDataString);

        if (mdwData.debug) console.log(`${logPrefix} parsed mdw - data: ${JSON.stringify(mdwData)} `);

        if (mdwData) {
            let widgetData = vis.binds.materialdesign.value.getDataFromJson(mdwData, `${parentId} `);
            if (mdwData.debug) console.log(`${logPrefix} widgetData: ${JSON.stringify(widgetData)} `);

            if (widgetData.oid) {
                let oidsNeedSubscribe = myMdwHelper.oidNeedSubscribe(widgetData.oid, parentId, widgetName, false, false, mdwData.debug);

                if (oidsNeedSubscribe) {
                    myMdwHelper.subscribeStatesAtRuntime(parentId, widgetName, function () {
                        initializeHtml()
                    }, mdwData.debug);
                } else {
                    initializeHtml();
                }
            } else {
                initializeHtml();
            }

            function initializeHtml() {
                vis.binds.materialdesign.value.initialize($this, widgetData);
            }
        }
    } catch (ex) {
        console.error(`${logPrefix} $.initialize: error: ${ex.message}, stack: ${ex.stack} `);
        $this.append(`<div style = "background: FireBrick; color: white;">Error ${ex.message}</div >`);
    }
});
