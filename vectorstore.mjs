import { Chroma } from "@langchain/community/vectorstores/chroma";
import { OpenAIEmbeddings } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { ChromaClient } from 'chromadb';
import 'dotenv/config';
import { VectorStore, VectorStoreRetriever } from "@langchain/core/vectorstores";

const openAIApiKey = process.env.OPENAI_API_KEY;

export async function getVectorStore() {
  try {
    const loader = new TextLoader("./src/test.txt");
    const docs = await loader.load();
    console.log("Done loading documents");
    const client = new ChromaClient();
   

    /*Split documents using RecursiveCharacterTextSplitter
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 2,
      chunkOverlap: 1,
    });
   
    const docOutput = await splitter.splitDocuments(docs);*/

     //Create in Chroma database
    const collectionName = "mycollection";
    let collection = await client.getOrCreateCollection({
      name: "mycollection",
    });
    
  

    const vectorStore = await Chroma.fromDocuments(
      docs,
      new OpenAIEmbeddings(openAIApiKey),
      {
        collectionName: "mycollection",
        url: "http://localhost:8000", 
        collectionMetadata: {
          "hnsw:space": "cosine",
        },
      }
      );
    console.log("Chroma vectorstore created ",vectorStore);
    console.log(vectorStore);
    return vectorStore;
   }catch (error) {
    console.error("Error creating vector store", error);
  }
}

 getVectorStore();




