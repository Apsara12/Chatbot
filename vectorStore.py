import getpass
import os
from langchain.text_splitter import CharacterTextSplitter
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings

openAIApiKey = os.environ.get("OPENAI_API_KEY")
loader = TextLoader("F:/AI/src/progit.pdf")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)
embeddings = OpenAIEmbeddings()
db = FAISS.from_documents(docs, embeddings)
query = "What is git commit"
docs = db.similarity_search(query)

print(docs[0].page_content)