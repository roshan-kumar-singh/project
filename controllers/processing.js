function normalizeValue(value, min, max) {
    return (value - min) / (max - min);
}

function denormalizeValue(value, min, max) {
    return (value * (max - min)) + min;
}

const PUNCTUATION_RGX = /[^\w\s]|_/g;

const processString = word => word.replace(PUNCTUATION_RGX, '').toLowerCase();

const prepareInput = (input, { maxWords }) => {
    let words = input.split(/\s+/).map(word => processString(word));

    if(words.length < maxWords) {
        const diff = maxWords - words.length;
        const padding = [...new Array(diff)].map((_) => '');
        words = words.concat(...padding);
    }

    return words;
}

const normalizePrompt = (words, { uniqueWords }) => words.map(word => {
    const uIndex = uniqueWords.indexOf(word);

    return normalizeValue(uIndex, 0, uniqueWords.length);
});

const preparePrompt = (string, options) => normalizePrompt(prepareInput(string, options), options);

const getResponse = (output, { responses }) => {
    const denormalizedValue = denormalizeValue(output, 0, responses.length - 1);

    console.log(denormalizedValue, Math.round(denormalizedValue))

    return responses[Math.round(denormalizedValue)];
};

module.exports = { getResponse, preparePrompt };