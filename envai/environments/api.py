from ninja import NinjaAPI
from ninja import NinjaAPI, Body
from environments.models import Environment
from environments.RAG.query_engine import Query_engine
api = NinjaAPI()
query_engine = Query_engine()

@api.get("/rag")
def hello(request, code: str, user: str):

    course = Environment.objects.get(code=code)

    context = query_engine.get_context(code, user)


    return {"msg": "hello", "prompt": course.system_prompt}






