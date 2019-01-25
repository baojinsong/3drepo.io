/**
 *  Copyright (C) 2019 3D Repo Ltd
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as
 *  published by the Free Software Foundation, either version 3 of the
 *  License, or (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

"use strict";
const C = require("../constants");
const config = require("../config");
const session = require("../services/session").session(config);
const apiKey = require("./apikey");

module.exports = async (req, res, next) => {
	await apiKey(req, res, next);
	if (req.query.key && req.session) {
		next();
		return;
	}

	session(req, res, function(err) {
		if(err) {
			// something is wrong with the library or the session (i.e. corrupted json file) itself, log the user out
			// res.clearCookie("connect.sid", { domain: config.cookie_domain, path: "/" });

			req[C.REQ_REPO].logger.logError(`express-session internal error: ${err}`);
			req[C.REQ_REPO].logger.logError(`express-session internal error: ${JSON.stringify(err)}`);
			req[C.REQ_REPO].logger.logError(`express-session internal error: ${err.stack}`);

			// responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.AUTH_ERROR, err);

		} else {
			next();
		}
	});
};