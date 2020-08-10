import fetch from 'node-fetch';

import { getMainContent, getHelp } from './blocks';

const DEFAULT_REQUEST_PAYLOAD = {
	method: 'POST',
	headers: {
		'Content-type': 'application/json'
	}
};

export default async (req, res) => {
	try {
		const { payload } = req.body;
		const { actions, token, response_url } = JSON.parse(payload);

		if (token !== process.env.SLACK_TOKEN) {
			return res.status(400);
		}

		const [{ value }] = actions;

		const { cancel, keyMatch, message } = JSON.parse(value);

		const responseBody = {
			"delete_original": "true",
		};

		if (!cancel) {
			responseBody["response_type"] = "in_channel";
			responseBody["blocks"] = getMainContent(keyMatch, message);
		}

		await fetch(response_url, {
			...DEFAULT_REQUEST_PAYLOAD,
			body: JSON.stringify(responseBody)
		});

		res.send('');
	} catch (error) {
		res.status(402).send(getHelp(error));
	}
}