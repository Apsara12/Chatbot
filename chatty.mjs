import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import readline from 'readline';
import 'dotenv/config';
import {  getVectorStore} from "./chroma_db.mjs"; 

const openAIApiKey = process.env.OPENAI_API_KEY;

const chatModel = new ChatOpenAI(openAIApiKey);
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const prompt = ChatPromptTemplate.fromMessages([
    ["system", "You just need to give answers relating to the context:{context}. If the question is out of the context, give the answer as: Sorry! I have no knowledge about {input}. Use three sentences maximum and keep the answer as concise as possible."],
    ["user", "{input}"],
]);

const outputParser = new StringOutputParser();
const llmChain = prompt.pipe(chatModel).pipe(outputParser);


async function getUserInput() {
    try {
        const vectorStore = await getVectorStore();
        const retriever = vectorStore.asRetriever();
        

        rl.question('Enter your input: ', async (input) => {
            if (input.toLowerCase() === 'stop') {
                console.log('Thank you for reaching out!');
                rl.close();
                return;
            }
            

           
        const result = await llmChain.invoke({ input, context:retriever});
        console.log('Output:', result);

            getUserInput();
        });
    } catch (error) {
        console.error("Error loading vector store:", error);
        rl.close();
    }
}

getUserInput();






