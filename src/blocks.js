export const DEFAULT_RESPONSE_PROPERTIES = {
	EPHEMERAL: { response_type: 'ephemeral' },
	IN_CHANNEL: { response_type: 'in_channel' },
};

export const POSSIBLE_VALUES = {
	"Arretado": "arretado",
	"Botou pra torar": "botou_pra_torar",
	"Dale": "dale",
	"Massa, visse": "massa_visse",
	"Pipoco": "pipoco",
	"Rochedo": "rochedo",
	"Se garantiu": "se_garantiu",
	"So da tu": "so_da_tu",
};

const getGithubImage = (imageKey) => `https://raw.githubusercontent.com/liferay-labs-br/duca-cards-slackbot/master/static/${imageKey}.png`;

const getMarkdownBlock = (message) => (
	{
		type: "section",
		text: {
			type: "mrkdwn",
			text: message
		}
	}
);

export const getHelp = (message) => ({
	...DEFAULT_RESPONSE_PROPERTIES.EPHEMERAL,
	blocks: [
		getMarkdownBlock(message)
	]
});

const getImage = (keyMatch) => ({
	type: "image",
	title: {
		type: "plain_text",
		text: keyMatch
	},
	block_id: "image4",
	image_url: getGithubImage(POSSIBLE_VALUES[keyMatch]),
	alt_text: `A card containing the following message: ${keyMatch}`
});

export const getMainContent = (keyMatch, message) => {
	const blocks = [getImage(keyMatch)];

	if (message) {
		blocks.push(getMarkdownBlock(message));
	}

	return blocks;
}