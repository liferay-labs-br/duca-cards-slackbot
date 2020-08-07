import fetch from 'node-fetch';

import { getMainContent, getHelp } from './blocks';

export default async (req, res) => {
	try {
		const { payload } = req.body;
		const { actions, token, response_url } = JSON.parse(payload);

		if (token !== process.env.SLACK_TOKEN) {
			return res.status(400);
		}

		const [{ value }] = actions;

		const { keyMatch, message } = JSON.parse(value);

		await fetch(response_url, {
			method: 'POST',
			headers: {
				'Content-type': 'application/json'
			},
			body: JSON.stringify({
				"delete_original": "true",
				"response_type": "in_channel",
				"blocks": getMainContent(keyMatch, message)
			})
		});

		res.send('');
	} catch (error) {
		res.status(402).send(getHelp(error));
	}
}