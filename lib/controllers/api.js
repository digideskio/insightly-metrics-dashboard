'use strict';

var unirest = require('unirest'),
		moment = require('moment'),
    config = require('../config/config');
  

function insightlyGetRequest(resource, key, cb) {
	var headers ={
		'Content-Type': 'application/json', 
		'Authorization': 'Basic ' + key
	};
	unirest.get(resource)
	.headers(headers)
	.end(function (response) {
		cb(response.body);
	});
}

exports.login = function(req,res) {
	try {
	var keyToBase64 = new Buffer(req.body.key).toString('base64');
	var headers ={
		'Content-Type': 'application/json', 
		'Authorization': 'Basic ' + keyToBase64
	};
	// doesnt exist, just used to see if the keys valid
	unirest.get('https://api.insight.ly/v2/Opportunities/32423423423423423423423423424234234')
	.headers(headers)
	.end(function (response) {
		if (response.code === 401) {
			res.send(401);
		} else {
			if ( req.cookies.rememberMe === 'true' ) {
				res.cookie('key', keyToBase64, { maxAge: 2000000000, httpOnly: false});
			}
			res.json(200, {status: 'OK', key: keyToBase64});
		}
	});
	} catch(err) {
		console.log(err);
		res.send(401);
	}
};

exports.getMonthlyTeamStats = function(req, res) {
	
	try {
	insightlyGetRequest('https://api.insight.ly/v2/Opportunities', req.cookies.key, function(data) {
		
		var teams = {};
		// Set to start of month
		var intervalFilter = 'month';
		var daysPassed = 1 + moment().diff( moment().startOf(intervalFilter), 'days');
		
		for(var i = data.length - 1; i >= 0; i--) {
			// If it doesnt contain a team name ( OPPORTUNITY_FIELD_3 ), discard.
			if ( ! data[i].OPPORTUNITY_FIELD_3 ) { data.splice(i, 1); continue;}
			if ( typeof data[i].OPPORTUNITY_FIELD_3 ==='undefined') { data.splice(i, 1); continue;}
			// ** IF THE TEAM NAME ISNT THREE CHARACTERS DISCARD ** THIS WAS REQUESTED BY CUSTOMER.
			if ( data[i].OPPORTUNITY_FIELD_3.length > 3 ) { data.splice(i, 1); continue;}
			// Make sure this isn't an entry older than a month.
			var entryUpdatedOn = moment(data[i].DATE_UPDATED_UTC, "YYYY-MM-DD HH:mm:ss");
			if (entryUpdatedOn.isBefore(moment().startOf('year'))){ data.splice(i, 1); continue;}
			// If there is a null bid amount, set 0.
			if ( ! data[i].BID_AMOUNT ) { data[i].BID_AMOUNT = 0; }
			// If there is a null bid type, set 0.
			if ( ! data[i].BID_TYPE ) { data[i].BID_TYPE = 0; }
			// Remove non numerical from custom profit field and force integer
			if (data[i].OPPORTUNITY_FIELD_5) {data[i].OPPORTUNITY_FIELD_5 = data[i].OPPORTUNITY_FIELD_5.replace(/\D/g,'');}
			if ( ! data[i].OPPORTUNITY_FIELD_5 ) { data[i].OPPORTUNITY_FIELD_5 = 0; }
			
			// ** MAIN TEAM SORTING LOGIC
			var currentTeam = data[i].OPPORTUNITY_FIELD_3;
			if (! teams[currentTeam] ) { // ADD NEW TEAM OBJECT TO LIST
				teams[currentTeam] = {
					name: currentTeam,
					grossMargin: 0,
					valueWon : 0,
					valueOpen : 0,
					profitWon : 0,
					valueWonCount : 0,
					profitPerDay : 0,
					topWinners : []
				};
				// Add the value of an OPEN opportunity
				if ( data[i].OPPORTUNITY_STATE === 'OPEN' ) {teams[currentTeam].valueOpen = data[i].BID_AMOUNT;}
				if ( data[i].OPPORTUNITY_STATE === 'WON' ) {
					if ( entryUpdatedOn.isAfter( moment().startOf(intervalFilter) ) ){
						teams[currentTeam].valueWonCount++;
						// Add all monthly only values
						teams[currentTeam].profitWon = parseFloat(data[i].OPPORTUNITY_FIELD_5);
						teams[currentTeam].valueWon = parseFloat(data[i].BID_AMOUNT);
						// If this opportunities value is more than $25,000, add to special field
						if (data[i].BID_AMOUNT > 25000.00) { teams[currentTeam].topWinners.push(data[i]); }
					}
				}		
			} else { // THE TEAM ALREADY EXISTS, LETS JUST ADD ONTO THE EXISTING OBJECT
					if ( data[i].OPPORTUNITY_STATE === 'OPEN' ) { teams[currentTeam].valueOpen = parseFloat(teams[currentTeam].valueOpen) + parseFloat(data[i].BID_AMOUNT); }
					if ( data[i].OPPORTUNITY_STATE === 'WON' ) {
						if ( entryUpdatedOn.isAfter( moment().startOf(intervalFilter) ) ){
							teams[currentTeam].valueWonCount++;
							teams[currentTeam].profitWon = parseFloat(teams[currentTeam].profitWon) + parseFloat(data[i].OPPORTUNITY_FIELD_5);
							teams[currentTeam].valueWon = parseFloat(teams[currentTeam].valueWon) + parseFloat(data[i].BID_AMOUNT);
							if (data[i].BID_AMOUNT > 25000.00) { teams[currentTeam].topWinners.push(data[i]); }
						}
					}
					
			} // ** END THE TEAM LOOP
		}
			
		// Generate the sales metrics from the team data
		var teamResults = [];
		var keys = Object.keys(teams);
		
		for (var ii = 0; ii < keys.length; ii++) {
			var val = teams[keys[ii]];		
			var team = {
				name: val.name,
				grossMargin: parseFloat( (val.valueWon / val.valueWonCount).toFixed(2) ),
				valueWon : parseFloat( (val.valueWon).toFixed(2) ),
				valueOpen : parseFloat( (val.valueOpen).toFixed(2) ),
				profitWon : parseFloat( (val.profitWon).toFixed(2) ),
				valueWonCount : parseFloat( val.valueWonCount ),
				profitPerDay : parseFloat( (val.profitWon / daysPassed).toFixed(2) ),
				topWinners : val.topWinners
			};

			if ( ! team.grossMargin || isNaN(team.grossMargin) ) { team.grossMargin = 0; }
			if ( ! team.profitPerDay || isNaN(team.profitPerDay) ) { team.profitPerDay= 0; }
			// Add the parsed team metrics to the results.
			teamResults.push(team);
		}
		
		// ** DEBUG 
		/**var totalValue = 0;
		for(var i = teamResults.length - 1; i >= 0; i--) {
			totalValue = parseFloat(totalValue + teamResults[i].valueWon);
		}
		console.log('total teams tracked ' + totalValue.toString() );**/
		
		// *** TRANSMIT TO CLIENT
		res.json(teamResults);
		
	}); // End insightly callback
	} catch(err) {
		console.log(err);
		res.send(500);
	}
};



/** OPPORTUNITY MODEL
 * 
  { OPPORTUNITY_ID: 0,
    OPPORTUNITY_NAME: '',
    OPPORTUNITY_DETAILS: null,
    PROBABILITY: 50,
    BID_CURRENCY: 'USD',
    BID_AMOUNT: 0,
    BID_TYPE: 'Fixed Bid',
    BID_DURATION: null,
    FORECAST_CLOSE_DATE: '2014-04-23 00:00:00',
    CATEGORY_ID: 0,
    PIPELINE_ID: 0,
    STAGE_ID: 216025,
    OPPORTUNITY_STATE: 'WON',
    IMAGE_URL: '',
    RESPONSIBLE_USER_ID: 108282,
    OWNER_USER_ID: 108282,
    DATE_CREATED_UTC: '2014-04-23 17:17:22',
    DATE_UPDATED_UTC: '2014-04-23 17:18:19',
    VISIBLE_TO: 'EVERYONE',
    VISIBLE_TEAM_ID: null,
    VISIBLE_USER_IDS: null,
    OPPORTUNITY_FIELD_1: null,
    OPPORTUNITY_FIELD_2: null,
    OPPORTUNITY_FIELD_3: 'MC1',
    OPPORTUNITY_FIELD_4: null,
    OPPORTUNITY_FIELD_5: '699',
    OPPORTUNITY_FIELD_6: null,
    OPPORTUNITY_FIELD_7: null,
    OPPORTUNITY_FIELD_8: null,
    OPPORTUNITY_FIELD_9: null,
    OPPORTUNITY_FIELD_10: null,
    TAGS: [],
    LINKS: [ [Object], [Object], [Object] ],
    EMAILLINKS: null },
**/
 
