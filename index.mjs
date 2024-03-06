import { ChatOpenAI } from "@langchain/openai";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { formatDocumentsAsString } from "langchain/util/document";
import readline from 'readline';
import {
  ChatPromptTemplate,
  SystemMessagePromptTemplate,
} from "@langchain/core/prompts";
import {
  RunnablePassthrough,
  RunnableSequence,
} from "@langchain/core/runnables";
import 'dotenv/config';
import { getVectorStore } from "./vectorstore.mjs";

const openAIApiKey = process.env.OPENAI_API_KEY;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const chatModel = new ChatOpenAI(openAIApiKey);
const SYSTEM_TEMPLATE = `You just need to give answers relating to the context:{context} for the given {question} . If the question is out of the context, give the answer as: Sorry! I have no knowledge about {question}. Use three sentences maximum and keep the answer as concise as possible."`;

const systemPrompt = SystemMessagePromptTemplate.fromTemplate(SYSTEM_TEMPLATE);
function askQuestion(prompt) {
  return new Promise(resolve => {
    rl.question(prompt, resolve);
  });
}

async function getUserInput() {
  try {
    const vectorStoreRetriever = await getVectorStore();
    //const VectorStore = vectorStoreRetriever.asRetriever();

    while (true) {
      const input = await askQuestion('Enter your input: ');

      if (input.toLowerCase() === 'stop') {
        console.log('Thank you for reaching out!');
        rl.close();
        return;
      }

      const chain = RunnableSequence.from([
        {
          context: vectorStoreRetriever,
          question: new RunnablePassthrough({input}),

        },
        systemPrompt,
        chatModel,
        new StringOutputParser(),
      ]);
 
      const systemAnswer = await chain.invoke(input);
      console.log('System Answer:', systemAnswer);
    }
  } catch (error) {
    console.error("Error loading vector store:", error);
    rl.close();
  }
}
(async () => {
  const userInput = await getUserInput();
  console.log('User Input:', userInput);
})();




