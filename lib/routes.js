'use strict';

var api = require('./controllers/api'),
    index = require('./controllers');

/**
 * Application routes
 */
module.exports = function(app) {
	// USER LOGIN
	app.route('/api/insightly/login')
		.post(api.login);
		
	// INSIGHTLY API
	app.route('/api/teams/monthlystats')
		.post(api.getMonthlyTeamStats);
		
  // All undefined api routes should return a 404
  app.route('/api/*')
    .get(function(req, res) {
      res.send(404);
    });

  // All other routes to use Angular routing in app/scripts/app.js
  app.route('/partials/*')
    .get(index.partials);
  app.route('/*')
    .get( index.index);
};
