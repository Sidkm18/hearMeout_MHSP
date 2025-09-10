from langchain.document_loaders import PyPDFLoader, DirectoryLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings import HuggingFaceEmbeddings


#extracting data 
def load_pdf_file(data):
    loader = DirectoryLoader(data,glob="*.pdf",
    loader_cls=PyPDFLoader)

    documents=loader.load()
    return documents

#splitting data : chunks 
def text_split(extracted_data):
    text_splitter= RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=20)
    text_chunks= text_splitter.split_documents(extracted_data)
    return text_chunks

# download embeddings from HuggingFace
def download_hugging_face_embeddings():
    embeddings = HuggingFaceEmbeddings(model_name='sentence-transformers/all-MiniLM-L6-v2')
    return embeddings



# def load_pdf_data(data_path):
#     """
#     Loads PDF documents from a specified directory.
#     """
#     print("Loading PDF documents...")
#     loader = DirectoryLoader(data_path, glob="*.pdf", loader_cls=PyPDFLoader)
#     documents = loader.load()
#     return documents

# def split_text_into_chunks(documents):
#     """
#     Splits a list of documents into smaller, manageable chunks.
#     """
#     print("Splitting documents into chunks...")
#     text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=20)
#     text_chunks = text_splitter.split_documents(documents)
#     return text_chunks

# def get_huggingface_embeddings():
#     """
#     Downloads and returns the Hugging Face embeddings model.
#     """
#     print("Downloading Hugging Face embeddings...")
#     embeddings = HuggingFaceEmbeddings(model_name='sentence-transformers/all-MiniLM-L6-v2')
#     return embeddings
