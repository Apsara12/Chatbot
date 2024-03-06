import { ChatOpenAI } from "@langchain/openai";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { formatDocumentsAsString } from "langchain/util/document";
import readline from 'readline';
import {
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
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

const SYSTEM_TEMPLATE = `You just need to give answers relating to the context. If the question is out of the context, give the answer as: Sorry! I have no knowledge about {input}. 
Use three sentences maximum and keep the answer as concise as possible.
----------------
{context}`;

async function getUserInput() {
  try {
    let vectorStore;
    let vectorStoreRetriever;

    if (!vectorStore) {
      vectorStore = await getVectorStore();
      vectorStoreRetriever = vectorStore.asRetriever();
    }

    rl.question('Enter your input: ', async (input) => {
      if (input.toLowerCase() === 'stop') {
        console.log('Thank you for reaching out!');
        rl.close();
        return;
      }

      // Continue with the conversation 
      const chain = RunnableSequence.from([
        {
          context: vectorStoreRetriever.pipe(formatDocumentsAsString),
          question: new RunnablePassthrough(),
        },
        new SystemMessagePromptTemplate(SYSTEM_TEMPLATE),
        new HumanMessagePromptTemplate(input),
        chatModel, 
        new StringOutputParser(),
      ]);

      // Retrieve system answer from the chain
      const systemAnswer = await chain.invoke(input);
      console.log('System Answer:', systemAnswer);

      getUserInput();
    });
  } catch (error) {
    console.error("Error loading vector store:", error);
    rl.close();
  }
}

getUserInput();



