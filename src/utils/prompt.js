import { OpenAI } from 'langchain'
import { marked } from 'marked'

const model = new OpenAI({ openAIApiKey: process.env.REACT_APP_OPENAI_API_KEY, temperature: 0.9, modelName: 'gpt-3.5-turbo' })

export const chat = async ({ name, convo, prompt }) => {

    const userPrefix = `# ${name}: `
    const aiPrefix = '# Radi: '
    // var convo = 'Your name is Radi. You are a powerful wizard. Respond to the prompts as a helpful, ' +
    //             'yet arrogant (and slightly sarcastic) wizard. Use markdown to format your ' + 
    //             'responses (ex. **bold**, *italics*, `code`, etc.). Underline does not work (dont try). ' + 
    //             'Make a lot of use of formatting to emphasize words. Use colors whenever possible.\n\n'

    const res = await model.call(
        convo + userPrefix + prompt + aiPrefix
    )
    convo = convo + userPrefix + prompt + aiPrefix + res

    const response = marked(res)
    return {response, convo}
}