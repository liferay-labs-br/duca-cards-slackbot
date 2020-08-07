import {findBestMatch} from 'string-similarity';
import {fetch} from 'node-fetch';

const DEFAULT_RESPONSE_PROPERTIES = {
    EPHEMERAL: {response_type: 'ephemeral'},
    IN_CHANNEL: {response_type: 'in_channel'},
};

// A fraction between 0 and 1, which indicates the degree of similarity between the two strings.
// 0 indicates completely different strings, 1 indicates identical strings.
// The comparison is case-sensitive.
const DEGREE_OF_SIMILARITY = 0.3;

const HELP_MESSAGE = `:book: Here is a list containing all the possible card names:

• Arretado
• Botou pra torar
• dale
• Massa visse, Massa, visse
• Pipôco, pipoco
• Rochedo
• Se garantiu
• Só da tu, so da tu
`;

const POSSIBLE_VALUES = {
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

const getHelp = (message) => ({
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

const getMainContent = (keyMatch, message) => {
    const blocks = [getImage(keyMatch)];

    if (message) {
        blocks.push(getMarkdownBlock(message));
    }

    return blocks;
}

const getConfirmationCard = (cardName, message) => {
    const {bestMatch: {target: keyMatch, rating}} = findBestMatch(cardName, Object.keys(POSSIBLE_VALUES));

    if (rating < DEGREE_OF_SIMILARITY) {
        return getHelp(`Oops, I didn't found any match for the given card name :sob: \n ${HELP_MESSAGE}`);
    }
    
    return {
        ...DEFAULT_RESPONSE_PROPERTIES.EPHEMERAL,
        blocks: [...getMainContent(keyMatch, message), {
			type: "actions",
			elements: [
				{
					type: "button",
					text: {
						type: "plain_text",
						text: "Confirm",
                        emoji: true,
                    },
                    style: "primary",
					value: JSON.stringify({keyMatch, message})
				}
			]
		}]
    }
}

const getMarkdownBlock = (message) => (
    {
        type: "section",
        text: {
            type: "mrkdwn",
            text: message
        }
    }
);

export default async (req, res) => {
    const { actions, text, token, command, response_url } = req.body;
  
    if (token !== process.env.SLACK_TOKEN) { 
        return res.status(400);
    }

    if (!command) {
        const [{value}] = actions;

        try {
            const {keyMatch, message} = JSON.parse(value);

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

            return res.status(200).send(getHelp(JSON.stringify(req)));
        } catch (error) {
            return res.status(402).send(getHelp(error));
        }
    }

    const [cardName, message] = text.split(`"`);

    switch (cardName) {
        case "":
        case "help":
            return res.status(200).send(getHelp(HELP_MESSAGE));

        default:
            return res.status(200).send(getConfirmationCard(cardName, message));
    }
  };