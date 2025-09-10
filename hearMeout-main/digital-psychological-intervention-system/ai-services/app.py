from flask import Flask, render_template, jsonify, request, session
import os
import uuid
import logging
from dotenv import load_dotenv
from src.helper import download_hugging_face_embeddings
from langchain_pinecone import PineconeVectorStore
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate
from src.prompt import system_prompt

# Load environment variables
load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__, static_folder="static", template_folder="templates")
app.secret_key = os.environ.get("FLASK_SECRET_KEY", "dev-secret-change-me")

# In-memory per-user history (not persisted, for dev only)
user_histories = {}

# Global services
embeddings = None
docsearch = None
retriever = None
llm = None
rag_chain = None

def init_services():
    global embeddings, docsearch, retriever, llm, rag_chain
    try:
        PINE_API_KEY = os.environ.get("PINECONE_API_KEY")
        GOOGLE_API_KEY = os.environ.get("GOOGLE_API_KEY")

        if not GOOGLE_API_KEY:
            logger.warning("GOOGLE_API_KEY not found in environment.")
        if not PINE_API_KEY:
            logger.warning("PINECONE_API_KEY not found in environment.")

        # Load embeddings
        embeddings = download_hugging_face_embeddings()
        logger.info("Embeddings initialized.")

        # Connect to Pinecone index
        index_name = os.environ.get("PINECONE_INDEX_NAME", "therapybot")
        try:
            docsearch = PineconeVectorStore.from_existing_index(
                index_name=index_name,
                embedding=embeddings
            )
            retriever = docsearch.as_retriever(
                search_type="similarity",
                search_kwargs={"k": 3}
            )
            logger.info("Connected to Pinecone index: %s", index_name)
        except Exception:
            logger.exception("Could not connect to Pinecone index.")
            raise

        # Initialize LLM + RAG
        llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            temperature=0.4,
            max_tokens=200,
            google_api_key=GOOGLE_API_KEY
        )
        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("human", "{input}")
        ])
        question_answer_chain = create_stuff_documents_chain(llm, prompt)
        rag_chain = create_retrieval_chain(retriever, question_answer_chain)
        logger.info("LLM and RAG chain initialized.")
    except Exception:
        logger.exception("init_services failed")
        raise

# Initialize services on startup
init_services()

@app.route("/")
def index():
    if "user_id" not in session:
        session["user_id"] = str(uuid.uuid4())
    return render_template("chat.html")

@app.route("/chat", methods=["POST"])
def chat():
    try:
        if "user_id" not in session:
            session["user_id"] = str(uuid.uuid4())
        user_id = session["user_id"]

        # Accept form or JSON
        msg = request.form.get("msg")
        if not msg:
            payload = request.get_json(silent=True) or {}
            msg = payload.get("msg")
        if not msg:
            return jsonify({"error": "no msg provided"}), 400

        logger.info("user_id=%s input=%s", user_id, msg)

        # Invoke RAG chain
        response = None
        if rag_chain is not None:
            response = rag_chain.invoke({"input": msg})
        else:
            logger.error("rag_chain not initialized.")
            return jsonify({"error": "server not ready"}), 500

        logger.debug("RAG raw response: %s", response)

        # Extract answer safely
        answer = None
        if isinstance(response, dict):
            answer = (
                response.get("answer")
                or response.get("result")
                or response.get("output")
                or next(
                    (v for v in response.values() if isinstance(v, str) and v.strip()),
                    None
                )
            )
        elif isinstance(response, str):
            answer = response

        if not answer:
            answer = "Sorry, I couldn't generate a reply."

        # Append to memory (trim to last 200 turns)
        history = user_histories.get(user_id, [])
        history.append(("user", msg))
        history.append(("bot", answer))
        user_histories[user_id] = history[-200:]

        return jsonify({"answer": answer})

    except Exception as e:
        logger.exception("Chat endpoint error")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080, debug=True)
