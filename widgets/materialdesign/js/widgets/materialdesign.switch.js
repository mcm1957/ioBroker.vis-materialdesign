/*
    ioBroker.vis vis-materialdesign Widget-Set
    
    Copyright 2019 Scrounger scrounger@gmx.net
*/
"use strict";

vis.binds.materialdesign.switch = {
    initialize: function (data) {
        try {

            let labelClickActive = '';
            if (data.labelClickActive === 'false' || data.labelClickActive === false) {
                labelClickActive = 'pointer-events:none;'
            }

            let labelPosition = '';
            if (data.labelPosition === 'left') {
                labelPosition = 'mdc-form-field mdc-form-field--align-end'
            } else if (data.labelPosition === 'right') {
                labelPosition = 'mdc-form-field'
            }

            let element = `
            <div class="mdc-switch" style="margin-left: 10px; margin-right: 10px;">
                <div class="mdc-switch__track"></div>
                <div class="mdc-switch__thumb-underlay">
                    <div class="mdc-switch__thumb">
                        <input class="mdc-switch__native-control" id="materialdesign-checkbox-switch-${data.wid}" type="checkbox" data-oid="${data.oid}" role="switch">
                    </div>
                </div>
            </div>
            ${data.labelPosition !== 'off' ? `<label id="label" for="materialdesign-checkbox-switch-${data.wid}" style="width: 100%; cursor: pointer; ${labelClickActive}; font-family: ${myMdwHelper.getValueFromData(data.valueFontFamily, '')}; font-size: ${myMdwHelper.getStringFromNumberData(data.valueFontSize, 'inherit', '', 'px')};">Switch 1</label>` : ''}
            `

            return { myswitch: element, labelPosition: labelPosition };

        } catch (ex) {
            console.error(`[Switch - ${data.wid}] initialize: error: ${ex.message}, stack: ${ex.stack}`);
        }

    },
    handle: function (el, data) {
        try {
            var $this = $(el);

            if (myMdwHelper.getBooleanFromData(data.lockEnabled) === true) {
                // Append lock icon if activated
                $this.append(`<span class="mdi mdi-${myMdwHelper.getValueFromData(data.lockIcon, 'lock-outline')} materialdesign-lock-icon" 
                        style="position: absolute; left: ${myMdwHelper.getNumberFromData(data.lockIconLeft, 5)}%; top: ${myMdwHelper.getNumberFromData(data.lockIconTop, 5)}%; ${(myMdwHelper.getNumberFromData(data.lockIconSize, undefined) !== '0') ? `width: ${data.lockIconSize}px; height: ${data.lockIconSize}px; font-size: ${data.lockIconSize}px;` : ''} color: ${myMdwHelper.getValueFromData(data.lockIconColor, '#B22222')};"></span>`);

                $this.attr('isLocked', true);
                $this.css('filter', `grayscale(${myMdwHelper.getNumberFromData(data.lockFilterGrayscale, 0)}%)`);
            }

            let switchElement = $this.find('.mdc-switch').get(0);

            const mdcFormField = new mdc.formField.MDCFormField($this.get(0));
            const mdcSwitch = new mdc.switchControl.MDCSwitch(switchElement);
            mdcFormField.input = mdcSwitch;

            mdcSwitch.disabled = myMdwHelper.getBooleanFromData(data.readOnly, false);

            switchElement.style.setProperty("--materialdesign-color-switch-on", myMdwHelper.getValueFromData(data.colorSwitchTrue, ''));
            switchElement.style.setProperty("--materialdesign-color-switch-on-hover", myMdwHelper.getValueFromData(data.colorSwitchHoverTrue, myMdwHelper.getValueFromData(data.colorSwitchTrue, '')));
            switchElement.style.setProperty("--materialdesign-color-switch-off", myMdwHelper.getValueFromData(data.colorSwitchThumb, ''));
            switchElement.style.setProperty("--materialdesign-color-switch-track", myMdwHelper.getValueFromData(data.colorSwitchTrack, ''));
            switchElement.style.setProperty("--materialdesign-color-switch-off-hover", myMdwHelper.getValueFromData(data.colorSwitchHover, ''));

            setSwitchState();

            if (!vis.editMode) {
                $this.find('.mdc-switch').on('click', function () {
                    vis.binds.materialdesign.helper.vibrate(data.vibrateOnMobilDevices);

                    if ($this.attr('isLocked') === 'false' || $this.attr('isLocked') === undefined) {
                        if (data.toggleType === 'boolean') {
                            myMdwHelper.setValue(data.oid, mdcSwitch.checked);
                        } else {
                            if (!mdcSwitch.checked === true) {
                                myMdwHelper.setValue(data.oid, data.valueOff);
                            } else {
                                myMdwHelper.setValue(data.oid, data.valueOn);
                            }
                        }
                        setSwitchState();

                    } else {
                        mdcSwitch.checked = !mdcSwitch.checked;
                        unlockSwitch();
                    }
                });
            }

            vis.states.bind(data.oid + '.val', function (e, newVal, oldVal) {
                setSwitchState();
            });

            function setSwitchState() {
                var val = vis.states.attr(data.oid + '.val');

                let buttonState = false;

                if (data.toggleType === 'boolean') {
                    buttonState = val;
                } else {
                    if (!isNaN(val) && !isNaN(data.valueOn)) {
                        if (parseFloat(val) === parseFloat(data.valueOn)) {
                            buttonState = true;
                        } else if (parseFloat(val) !== parseFloat(data.valueOn) && parseFloat(val) !== parseFloat(data.valueOff) && data.stateIfNotTrueValue === 'on') {
                            buttonState = true;
                        }
                    } else if (val === parseInt(data.valueOn) || val === data.valueOn) {
                        buttonState = true;
                    } else if (data.stateIfNotTrueValue === 'on' && val !== data.valueOn && val !== data.valueOff) {
                        buttonState = true;
                    }
                }

                mdcSwitch.checked = buttonState;

                let label = $this.find('label[id="label"]');
                if (buttonState) {
                    label.css('color', myMdwHelper.getValueFromData(data.labelColorTrue, ''));
                    label.html(myMdwHelper.getValueFromData(data.labelTrue, ''));
                } else {
                    label.css('color', myMdwHelper.getValueFromData(data.labelColorFalse, ''));
                    label.html(myMdwHelper.getValueFromData(data.labelFalse, ''));
                }
            }

            function unlockSwitch() {
                $this.find('.materialdesign-lock-icon').fadeOut();
                $this.attr('isLocked', false);
                $this.css('filter', 'grayscale(0%)');

                setTimeout(function () {
                    $this.attr('isLocked', true);
                    $this.find('.materialdesign-lock-icon').show();
                    $this.css('filter', `grayscale(${myMdwHelper.getNumberFromData(data.lockFilterGrayscale, 0)}%)`);
                }, myMdwHelper.getNumberFromData(data.autoLockAfter, 10) * 1000);
            }
        } catch (ex) {
            console.error(`[Switch - ${data.wid}] error: ${ex.message}, stack: ${ex.stack}`);
        }
    },
    getDataFromJson(obj, widgetId) {
        return {
            wid: widgetId,

            // Common
            oid: obj.oid,
            readOnly: obj.readOnly,
            toggleType: obj.toggleType,
            valueOff: obj.valueOff,
            valueOn: obj.valueOn,
            stateIfNotTrueValue: obj.stateIfNotTrueValue,
            vibrateOnMobilDevices: obj.vibrateOnMobilDevices,
            generateHtmlControl: obj.generateHtmlControl,

            // labeling
            labelFalse: obj.labelFalse,
            labelTrue: obj.labelTrue,
            labelPosition: obj.labelPosition,
            labelClickActive: obj.labelClickActive,
            valueFontFamily: obj.valueFontFamily,
            valueFontSize: obj.valueFontSize,

            // colors
            colorSwitchThumb: obj.colorSwitchThumb,
            colorSwitchTrack: obj.colorSwitchTrack,
            colorSwitchTrue: obj.colorSwitchTrue,
            colorSwitchHover: obj.colorSwitchHover,
            colorSwitchHoverTrue: obj.colorSwitchHoverTrue,
            labelColorFalse: obj.labelColorFalse,
            labelColorTrue: obj.labelColorTrue,

            // Locking
            lockEnabled: obj.lockEnabled,
            autoLockAfter: obj.autoLockAfter,
            lockIcon: obj.lockIcon,
            lockIconTop: obj.lockIconTop,
            lockIconLeft: obj.lockIconLeft,
            lockIconSize: obj.lockIconSize,
            lockIconColor: obj.lockIconColor,
            lockFilterGrayscale: obj.lockFilterGrayscale,
        }
    },
    getHtmlConstructor(widgetData, type) {
        try {
            let html;
            let width = widgetData.width ? widgetData.width : '100%';
            let height = widgetData.height ? widgetData.height : '50px';

            delete widgetData.width;
            delete widgetData.height;

            html = `<div class="vis-widget materialdesign-widget materialdesign-switch materialdesign-switch-html-element"` + '\n' +
                '\t' + `style="width: ${width}; height: ${height}; position: relative; overflow: visible !important; display: flex; align-items: center;"` + '\n' +
                '\t' + `mdw-data='${JSON.stringify(widgetData, null, "\t\t\t")}'>`.replace("}'>", '\t\t' + "}'>") + '\n';

            return html + `</div>`;

        } catch (ex) {
            console.error(`[Switch getHtmlConstructor]: ${ex.message}, stack: ${ex.stack} `);
        }
    }
}

$.initialize(".materialdesign-switch-html-element", function () {
    let $this = $(this);
    let parentId = 'unknown';
    let logPrefix = `[Switch HTML Element - ${parentId.replace('w', 'p')}]`;

    try {
        let mdwDataString = $this.attr('mdw-data');
        let widgetName = `Switch HTML Element`;

        let $parent = $this.closest('.vis-widget[id^=w]');
        $parent.css('padding', '0 12px 0 12px');
        parentId = $parent.attr('id');
        logPrefix = `[Switch HTML Element - ${parentId.replace('w', 'p')}]`;

        console.log(`${logPrefix} initialize html element`);

        let mdwData = JSON.parse(mdwDataString);

        if (mdwData) {
            let widgetData = vis.binds.materialdesign.switch.getDataFromJson(mdwData, `${parentId} `);
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
                let init = vis.binds.materialdesign.switch.initialize(widgetData);

                if (init) {
                    $this.addClass(init.labelPosition);
                    $this.append(init.myswitch);

                    vis.binds.materialdesign.switch.handle($this, widgetData);
                }
            }
        }
    } catch (ex) {
        console.error(`${logPrefix} $.initialize: error: ${ex.message}, stack: ${ex.stack} `);
        $this.append(`<div style = "background: FireBrick; color: white;">Error ${ex.message}</div >`);
    }
});