const brain = require('brain.js');
const { getResponse, preparePrompt } = require("./processing.js");
const { join } = require('path');
const { cwd } = require('process');
const { readFile } = require('fs/promises');

const chatbot = async (req, res) => {
    try {
        const { model, options } = JSON.parse((await readFile(join(cwd(), '/data', '/chatbot-model.json'))).toString());

        const net = new brain.NeuralNetwork().fromJSON(model);

        const output = net.run(preparePrompt(req.body.prompt, options));

        const response = getResponse(output, options);

        return res.status(200).send({ response });
    } catch(e) {
        console.error(e);
        return res.status(500).send({ message: 'Could not generate response' });
    }
};

module.exports = { chatbot };