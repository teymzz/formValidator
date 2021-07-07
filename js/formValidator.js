(function($) {
    $.fn.validateForm = function(defOps) {
        var field = $(this);
        var responseField, submitBtn;

        //set the field object
        indefaults.field = field;

        //get the submit button
        if (field.find('[data-type="submit"]')) {
            submitBtn = field.find('[data-type="submit"]')
        } else {
            submitBtn = field.find('[type="submit"]');
        }

        //all input fields
        var allInputs = field.find(":input:not(:button):not([data-skip])");

        //set all inputs and submit buttons
        indefaults.allInputs = allInputs;
        indefaults.submitBtn = submitBtn;

        //default options
        defaultOptions = {
            responsePane: "",
            validateBtn: true,
            submitButton: submitBtn,
        }

        var mainOps = $.extend(defaultOptions, defOps);
        var validateBtn = mainOps.validateBtn;
        indefaults.validateBtn = validateBtn

        var buttonHolder = submitBtn.closest("fieldset");
        indefaults.buttonHolder = buttonHolder;
        buttonHolder.attr({ "data-active": "false" });
        (validateBtn == true) ? buttonHolder.attr({ "disabled": "disabled" }): null;
        (validateBtn == true) ? submitBtn.attr({ "disabled": "disabled" }): null;

        indefaults.responseField = responseField = field.find(mainOps.responsePane);


        passFieldCount = field.find("input[type='password']").length;

        passField1 = (passFieldCount > 0) ? field.find("input[type='password']").eq(0) : false;
        passField2 = (passFieldCount > 1) ? field.find("input[type='password']").eq(1) : false;

        field.find(":input:not(:button):not([data-skip])").each(function(index, item) {
            runChecker(this);
            $(this).on("input keyup", function() {
                //get the input controllers
                let timeout = $(this).attr('data-wait') || field.attr('data-wait') || 0;
                timeout = +timeout;

                setTimeout(() => {
                    var rChecker = runChecker(this);
                }, timeout);

            })
        })

    }

    function runChecker(elem) {
        var anchors = inputAttributes(elem);

        dataType = anchors.dataType;
        dataValue = anchors.dataValue;
        dataLength = anchors.dataLength;
        dataMin = anchors.dataMin;
        dataMax = anchors.dataMax;
        fieldName = anchors.fieldName;
        isNumField = anchors.isNumField;
        isPassField = anchors.isPassField;
        isTextField = anchors.isTextField;
        isRequired = anchors.isRequired;
        isTextArea = anchors.isTextArea;
        isStrict = anchors.isStrict;

        var buttonHolder, submitBtn;
        var field = indefaults.field;

        var responseField = indefaults.responseField;

        buttonHolder = indefaults.buttonHolder;
        validateBtn = indefaults.validateBtn;
        submitBtn = indefaults.submitBtn;

        anchors.buttonHolder = buttonHolder;
        anchors.submitBtn = submitBtn;
        anchors.responseBox = responseField;
        anchors.formField = field;
        anchors.passFieldCount = passFieldCount;
        anchors.userPassField1 = passField1;

        anchors.userPassField2 = passField2;
        anchors.validateBtn = validateBtn;

        var fieldObject = {
            field: field,
            buttonHolder: buttonHolder,
            submitBtn: submitBtn,
            responseBox: responseField,
            formField: field,
            passFieldCount: passFieldCount,
            userPassField1: passField1,
            userPassField2: passField2,
            validateBtn: validateBtn,
            allInputs: indefaults.allInputs,
            initMess: false
        }

        buttonHolder.attr({ "data-active": "false" });
        (validateBtn == true) ? buttonHolder.attr({ "disabled": "disabled" }): null;
        (validateBtn == true) ? submitBtn.attr({ "disabled": "disabled" }): null;
        anchors.initMess = fieldObject.initMess;

        //CASE 1: (empty fields)
        if (dataLength < 1) {
            if (field.is('[data-init]')) { fieldObject.initMess = true; }
            if (isRequired) {
                $(responseField).html("<span class='form-validator-message'> please fill " + fieldName + " <span class='fa fa-times-circle'></span> </span>");
                allValidator(field, fieldObject)
                return false;
            } else {
                return allValidator(field, fieldObject);
            }
        }

        //CASE 2: (not empty fields) 
        if (isRequired) {
            var validation = BasicValidator(anchors);

            if (validation === true) {
                return allValidator(field, fieldObject);
            } else {
                return false;
            }
        } else {
            //if field is not required
            if ((dataLength > 0)) {

                //do validation;
                var validation;

                if ((validation = BasicValidator(anchors)) !== true) {
                    return validation;
                } else {
                    return allValidator(field, fieldObject)
                }

            } else {
                responseField.html("");
                return allValidator(field, fieldObject);
            }
        }

    }

    function inputAttributes(elem) {

        var dataMin = $(elem).attr('data-min') || 0;
        var dataMax = $(elem).attr('data-max') || 1000000000000000000;
        var dataType = ($(elem).attr("type")) ? $(elem).attr("type") : (($(elem).attr("data-type")) ? $(elem).attr("data-type") : "text");
        var fieldName = ($(elem).attr("name")) ? $(elem).attr("name") + " field" : "";
        var fieldName = fieldName.replace("_", " ");
        var fieldName = ($(elem).attr("data-fieldname")) ? $(elem).attr("data-fieldname") : fieldName;
        var strict = ($(elem).attr("data-strict"));
        var allowSpace = ($(elem).attr("allow-space") == "false") ? false : true; //def: false
        var specialChars = $(elem).attr("allow-chars");

        var allowChars = (specialChars == 'all' || specialChars == '*') ? "all" : ((specialChars == null || specialChars == undefined) ? "text" : specialChars);
        var rexPattern = $(elem).attr("data-rex");
        var isNumField = ($(elem).attr('type') == 'number' || $(elem).attr('data-type') == 'number') ? true : false;
        var isPassField = ($(elem).attr('type') == 'password' || $(elem).attr('data-type') == 'password') ? true : false;
        var isTextField = ($(elem).attr('type') == 'text' || $(elem).attr('type') == '' || $(elem).attr('type') == 'undefined' || $(elem).attr('data-type') == 'text') ? true : false;
        var isMailField = ($(elem).attr('type') == 'email' || $(elem).attr('data-type') == 'email') ? true : false;
        var isTextArea = ($(elem).prop('tagName') == 'TEXTAREA' || $(elem).attr('data-type') == 'textarea') ? true : false;
        var isStrict = (strict == 'false') ? false : true;
        var isRequired = ($(elem).attr("required")) ? true : false;
        var formField = indefaults.field;

        var error_response = "invalid data supplied in" + fieldName;

        //colors controllers
        var colorSets = ['fill', 'text', 'shadow', 'line'];

        var colorSet = $(elem).attr("data-fillset") || formField.attr('data-fillset');
        var colorFill = $(elem).attr("data-fill") || formField.attr('data-fill');

        let objectFiller = {};

        if (colorSet != false) {
            if (colorFill && colorSet) {

                //split the color filler
                let colors = colorFill.split(" ");

                //ensure that both colors and fill type is set
                if ((colors.length > 0) && colorSets.includes(colorSet)) {

                    objectFiller.type = colorSet;

                    if (colors.length == 1) {
                        objectFiller.error = "";
                        objectFiller.success = colors[0];
                    }

                    if (colors.length > 1) {
                        objectFiller.error = (colors[0] == "-") ? '' : colors[0];
                        objectFiller.success = (colors[1] == "-") ? '' : colors[1];
                    }

                    if (colors.length === 3) {
                        objectFiller.shadow = +colors[2];
                    }

                }
            }
        }



        //split the color fill

        var dataValue = ($(elem).val() != null) ? $(elem).val().trim() : null;
        var dataLength = (dataValue == null) ? 0 : dataValue.length;

        if (isTextArea && (specialChars == undefined)) {
            allowChars = "all";
        }

        var dataIndex = formField.find(":input:not(:button):not([data-skip])").index($(elem)) + 1;

        var inputObject = {
            dataInput: $(elem),
            dataIndex: dataIndex,
            dataType: dataType,
            dataValue: dataValue,
            dataLength: dataLength,
            dataMin: dataMin,
            dataMax: dataMax,
            fieldName: fieldName,
            isStrict: isStrict,
            isNumField: isNumField,
            isPassField: isPassField,
            isTextField: isTextField,
            isMailField: isMailField,
            isTextArea: isTextArea,
            isRequired: isRequired,
            allowSpace: allowSpace,
            allowChars: allowChars,
            rexPattern: rexPattern,
            filler: objectFiller,
        }

        return inputObject;
    }

    function BasicValidator(anchors) {

        var input = anchors.dataInput;
        var isRequired = anchors.isRequired;
        var isTextField = anchors.isTextField;
        var isMailField = anchors.isMailField;
        var isPassField = anchors.isPassField;
        var isNumField = anchors.isNumField;
        var isStrict = anchors.isStrict;

        var dataIndex = anchors.dataIndex;
        var dataValue = anchors.dataValue;
        var dataLength = anchors.dataLength;
        var dataMin = anchors.dataMin;
        var dataMax = anchors.dataMax;
        var fieldName = anchors.fieldName;
        var responseField = anchors.responseBox;
        var button = anchors.submitBtn;
        var buttonHolder = anchors.buttonHolder;
        var formField = anchors.formField;
        var passFieldCount = anchors.passFieldCount;
        var userPassField1 = anchors.userPassField1;
        var userPassField2 = anchors.userPassField2;
        var validateBtn = anchors.validateBtn;

        //special validation
        var allowSpace = anchors.allowSpace;
        var allowChars = anchors.allowChars;
        var rexPattern = anchors.rexPattern;

        //colors
        var filler = anchors.filler;

        fieldName = (fieldName == "") ? "field " + dataIndex : fieldName;
        buttonHolder.attr({ "data-active": "false" });
        (validateBtn == true) ? buttonHolder.attr({ "disabled": "disabled" }): null;
        (validateBtn == true) ? button.attr({ "disabled": "disabled" }): null;

        testMail = (isMailField && allowChars == 'mail') ? true : false;

        //field count

        var voids = 0;
        var fieldCount = indefaults.field.find(":input:not(:button):not([data-skip])").length;
        var mshide = "";

        if (anchors.initMess == false) {

            var iField;
            for (var i = 0; i < fieldCount; i++) {
                iField = indefaults.field.find(":input:not(:button):not([data-skip])").eq(i);
                if (iField.val() == "" || iField.val() == null) {
                    voids = voids + 1;
                }
            }

            if (voids == fieldCount) {
                buttonHolder.attr({ "disabled": "disabled" })
                button.attr({ "disabled": "disabled" });
                responseField.html('');
                inputFiller(input, filler, false);
                return false;
            }
        }

        if (isRequired == false && dataLength < 1) {
            responseField.html("");
            buttonHolder.removeAttr("disabled");
            inputFiller(input, filler, 'reset');
            button.removeAttr("disabled");
            return true;
        }

        if (isNumField == true && isNaN(dataValue)) {
            responseField.html(" <span class='form-validator-message'> " + fieldName + " must be number </span>");
            inputFiller(input, filler, false);
            return false;
        }

        if (isNumField == true && dataValue == false && isStrict != false) {
            responseField.html(" <span class='form-validator-message'> " + fieldName + " must be valid </span>");
            inputFiller(input, filler, false);
            return false;
        }

        if (((dataLength < dataMin) || (dataLength > dataMax)) && (dataLength != 0)) {
            if (dataLength < dataMin) {
                responseField.html(" <span class='form-validator-message'> " + fieldName + " is too short </span>");
            }

            if (dataLength > dataMax) {
                responseField.html(" <span class='form-validator-message'> " + fieldName + " is too long  </span>");
            }

            inputFiller(input, filler, false);

            return false;
        }

        if (dataLength < 1) {
            responseField.html("<span class='form-validator-message'> Please fill " + fieldName + " </span>");
            inputFiller(input, filler, false);
            return false;
        }

        if (dataLength > 1 && !isNumField && !testMail) {

            if (allowSpace == false) {
                if (/\s/.test(dataValue)) {
                    responseField.html("<span class='form-validator-message'> Invalid space in " + fieldName + "</span>");
                    inputFiller(input, filler, false);
                    return false;
                }
            }

            if (allowChars == "text" && dataLength > 1) {
                if (/^[\w+\s]*$/i.test(dataValue) != true) {
                    responseField.html("<span class='form-validator-message'> Invalid characters in " + fieldName + "</span>");
                    inputFiller(input, filler, false);
                    return false;
                }
            } else if (allowChars != "text" && allowChars != 'all') {

                if (allowChars == "rex" && rexPattern != undefined) {
                    var pattern = "^[" + rexPattern + "]*$";
                } else {
                    var pattern = "^[\\w+\\s" + allowChars + "]*$";
                }

                var regex = new RegExp(pattern, "i");

                if (regex.test(dataValue) != true) {
                    responseField.html("<span class='form-validator-message'> Invalid characters in " + fieldName + "</span>");
                    inputFiller(input, filler, false);
                    return false;
                }
            }
        }


        if ((testMail == true) && (dataLength > 1)) {
            var pattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            if (pattern.test(String(dataValue).toLowerCase()) == false) {
                responseField.html("<span class='form-validator-message'> invalid " + fieldName + "</span>");
                inputFiller(input, filler, false);
                return false;
            }

        }


        if (isPassField) {
            //find the other password field and check for matches.
            //get password field
            if (passFieldCount > 1) {
                if ((userPassField1.val() === userPassField2.val()) && (userPassField1.val() != false) && (userPassField1.val() != "undefined")) {
                    //password matched
                } else {
                    //password mismatch
                    responseField.html("<span class='form-validator-message'> password does not match </span>");
                    inputFiller(input, filler, false);
                    return false;
                }
            }
        }

        //enable button;
        responseField.html("");
        buttonHolder.attr({ "data-active": "true" });
        (validateBtn == true) ? buttonHolder.removeAttr("disabled"): null;
        (validateBtn == true) ? button.removeAttr("disabled"): null;
        inputFiller(input, filler, true);
        return true;
    }

    function inputFiller(input, filler, action) {

        if (action === "reset") {
            if (filler.success || filler.error) {
                input.css({ 'color': '' });
            }

            if (filler.shadow) {
                input.css({ 'box-shadow': '' });
            }

            return;
        }

        let key, color, width;

        key = (action === true) ? 'success' : 'error';

        if ((key === 'success') || (key === 'error')) {
            color = filler[key];



            if (filler.type === 'fill') {
                input.css({ 'background-color': color });
            }

            if (filler.type === 'text') {
                input.css({ "color": color });
            }

            if (filler.type === 'shadow') {
                width = filler.border;
                input.css({ 'border': `0 0 0 ${width}px ${color} inset` });
            }

            if (filler.type === 'line') {
                width = filler.shadow;
                if ((key == "error") && (color == "")) {
                    input.css({ 'color': `${color}`, 'box-shadow': '' });
                } else {
                    input.css({ 'color': `${color}`, 'box-shadow': `0 0 0 ${width}px ${color} inset` });
                }
            }
        }



    }

    function isButton(selector) {

        itemName = selector.prop('tagName');
        itemAttr = selector.attr('type');

        if (item == "") { return; }

        item = item.toLowerCase();

        if (itemName == 'button') return true;

        if (itemName == 'input' && itemAttr == 'submit') return true;

        return false;
    }

    function allValidator(field, fieldObject) {

        //validate
        indefaults.allInputs.each(function() {

            //set inputAttributes
            anchors = inputAttributes(this);

            //set fieldObject into anchors
            anchors.responseBox = fieldObject.responseBox;
            anchors.submitBtn = fieldObject.submitBtn;
            anchors.buttonHolder = fieldObject.buttonHolder;
            anchors.passFieldCount = fieldObject.passFieldCount;
            anchors.userPassField1 = fieldObject.userPassField1;
            anchors.userPassField2 = fieldObject.userPassField2;
            anchors.validateBtn = fieldObject.validateBtn;
            anchors.initMess = fieldObject.initMess || false;

            if (anchors.isRequired === false) {
                if (anchors.dataLength > 0) {
                    return BasicValidator(anchors);
                }
                fieldObject.responseBox.html("");
                fieldObject.buttonHolder.attr({ "data-active": "true" });

                (fieldObject.validateBtn == true) ? fieldObject.submitBtn.removeAttr("disabled"): null;
                (fieldObject.validateBtn == true) ? fieldObject.buttonHolder.removeAttr("disabled"): null;
                inputFiller(input, filler, 'reset');
                return true;
            }

            return BasicValidator(anchors);

        })

    }

    var indefaults = {
        responseField: ""
    }


    /*
     accepted attributes
     data-min // minimum input value
     data-max // maximum input value
     data-type // input type (used to specify attributes in cases where user needs to specify type of data to be allowed in the input)
       data-type may be (number,text,password) etc. 

     required // for required fields to be validated


    NOTE: This validator does not support email validation as at this moment. Email will be verified simply as a textField
    NOTE: data-type should not be used for passwords. Use <input type='password'> instead
    NOTE: Numeric field will not be allowed to have characters included. Any addition of characters will reset the field
    */

})(jQuery)


/*This function uses data-form="validate" to validate forms*/
function formValidator() {
    if ($("[data-form='validate']").length < 1) { return false; }

    $("[data-form='validate']").each(function() {
        var thisForm = $(this);
        var thisId = thisForm.data("id") || thisForm.attr("id");

        var tId = thisForm.data("id") ? '[data-id="' + thisId + '"]' : '#' + thisId;
        var tForm = (thisId) ? tId : thisForm;
        var resPane = thisForm.data("resp") || false;
        var dataForm = $(tForm).validateForm({ responsePane: resPane });
    })
}