import sys, os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from src.helper import load_pdf_file,text_split,download_hugging_face_embeddings

from pinecone.grpc import PineconeGRPC as Pinecone
from pinecone import ServerlessSpec
from langchain_pinecone import PineconeVectorStore
from dotenv import load_dotenv
import os
load_dotenv()
PINECONE_API_KEY=os.environ.get("PINECONE_API_KEY")
os.environ["PINECONE_API_KEY"]=PINECONE_API_KEY

extracted_data=load_pdf_file(data="C:\\Users\\Shounak Dutta\\Documents\\Sih'25 hearMeout\\hearMeout\\digital-psychological-intervention-system\\ai-services\\Data")
text_chunks=text_split(extracted_data)
embeddings=download_hugging_face_embeddings()



pc= Pinecone(api_key=PINECONE_API_KEY)
index_name="therapybot"
index_name = "therapybot"
if index_name not in pc.list_indexes().names():
    pc.create_index(
        name=index_name,
        dimension=384,  # match your embedding dimensions
        metric="cosine",
        spec=ServerlessSpec(
            cloud="aws",
            region="us-east-1"
        )
    )
index=pc.Index(index_name)  
docsearch= PineconeVectorStore.from_documents(
    documents=text_chunks,
    index_name=index_name,
    embedding=embeddings,
)
