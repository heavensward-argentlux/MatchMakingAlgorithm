// modules
let rainbow = require("./rainbow");

// get matchmaker
let matchmaker = rainbow.matchmaker;

async function fulfill(req, res) {
	if (req.body.queryResult.action === 'queue.number') getQueueNumber(req, res);
	else {
		res.send(req.body.queryResult);
	}
}

function getQueueNumber(req, res) {
		let rgx = new RegExp(`@number@`,"g");
		let userId = req.body.queryResult.parameters.userId

		let agentId, queueNumber = await matchmaker.search(userId);

		if (queueNumber === null) queueNumber = "null, please try refreshing"

		req.body.queryResult.fulfillmentMessages = JSON.parse(JSON.stringify(req.body.queryResult.fulfillmentMessages).replace(rgx, val))
		res.send(req.body.queryResult);
}

// exports
exports.fulfill = fulfill;
