import { findBestMatch } from 'string-similarity';

import {
    DEFAULT_RESPONSE_PROPERTIES,
    getHelp,
    getMainContent,
    POSSIBLE_VALUES,
} from './blocks';

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

const getConfirmationCard = (cardName, message) => {
    const { bestMatch: { target: keyMatch, rating } } = findBestMatch(cardName, Object.keys(POSSIBLE_VALUES));

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
                    value: JSON.stringify({ keyMatch, message })
                },
                {
                    type: "button",
                    text: {
                        type: "plain_text",
                        emoji: true,
                        text: "Cancel"
                    },
                    style: "danger",
                    value: JSON.stringify({cancel: true})
                }
            ]
        }]
    }
}

export default async (req, res) => {
    const { actions, text, token, command, response_url } = req.body;

    if (token !== process.env.SLACK_TOKEN) {
        return res.status(400);
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