'use strict';

define(function (require) {
	var Postmonger = require('postmonger');
	var connection = new Postmonger.Session();
	var payload = {};
	var steps = [
		{'key': 'eventdefinitionkey', 'label': 'Event Definition Key'}
    ];

    //Traitement des colonnes et id de la dataExtension (OPTIONNEL)
    var deID;
    var deFields;
    connection.trigger('requestSchema');

    connection.on('requestedSchema', function (data) {
        // save schema
        console.log('*** Schema ***', JSON.stringify(data['schema']));
        let schema = data['schema'];
        deFields = getFields(schema);
        console.log("CONNECTION: "+deFields);
    });

    var typeArray = [];
    function getFields(jsonSchema) {
        var index = 0;
        var array = [];
        var currentField = jsonSchema[index].key.toString();
        var field;
        var type;

        while (currentField !== undefined) {
            if (currentField.startsWith('Event.DEAudience')) {
                deID = currentField.split('.')[1];
                field = currentField.split('.')[2];
                type = jsonSchema[index].type.toString();
                array.push(field);
                typeArray.push(type)
            }
            index = index + 1;
            try {
                currentField = jsonSchema[index].key.toString();
            } catch{
                currentField = undefined;
            };
        };
        console.log(array);
        return array;
    };
    //---------------


    var currentStep = steps[0].key;

	$(window).ready(function () {
        connection.trigger('ready');
	});

    function initialize(data) {
		if (data) {
			payload = data;
		}
	}

    function onClickedNext() {
        if (currentStep.key === 'eventdefinitionkey') {
			save();
		} else {
			connection.trigger('nextStep');
		}
	}

	function onClickedBack () {
		connection.trigger('prevStep');
	}

	function onGotoStep (step) {
		showStep(step);
		connection.trigger('ready');
	}

	function showStep (step, stepIndex) {
		if (stepIndex && !step) {
			step = steps[stepIndex - 1];
		}
		currentStep = step;
        $('.step').hide();

		switch 	(currentStep.key) {
		case 'eventdefinitionkey':
			$('#step1').show();
			$('#step1 input').focus();
			break;
		}
    }

    function save() {
        let exampleInputField = $('#select-examplefield').val();
        payload['arguments'] = payload['arguments'] || {};
        payload['arguments'].execute = payload['arguments'].execute || {};

        //Mise en place du payload
        payload['arguments'].execute.inArguments = [{}];

        //On récupère l'id de la DE d'origine et ses colonnes (OPTIONNEL)
        for (var i = 0; i < deFields.length; i++) {
            if (deFields[i].includes(' ')) {
                var Space = deFields[i];
                deFields[i] = '"' + deFields[i] + '"';
                payload['arguments'].execute.inArguments[0][Space] = "{{Event." + deID + "." + deFields[i] + "}}";
            } else {
                payload['arguments'].execute.inArguments[0][deFields[i]] = "{{Event." + deID + "." + deFields[i] + "}}";
            }
        };
        payload['arguments'].execute.inArguments[0].length = deFields.length;
        payload['arguments'].execute.inArguments[0].typeArray = typeArray;
        //-------------

        payload['arguments'].execute.inArguments[0].exampleInputField = exampleInputField;
        console.log(JSON.stringify(payload['arguments'].execute.inArguments));
        //Fin des inArguments

        payload['metaData'] = payload['metaData'] || {};
        payload['metaData'].isConfigured = true;
        connection.trigger('updateActivity', payload);
    }

	connection.on('initActivity', initialize);
	connection.on('clickedNext', onClickedNext);
	connection.on('clickedBack', onClickedBack);
    connection.on('gotoStep', onGotoStep);
});
