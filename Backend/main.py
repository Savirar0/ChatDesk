import os,re,time,io
from datetime import datetime,timedelta
import bcrypt,httpx
from dotenv import load_dotenv
from fastapi import FastAPI,Depends,HTTPException,Request,UploadFile,File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer,HTTPAuthorizationCredentials
from jose import jwt,JWTError
from pydantic import BaseModel,EmailStr,Field
from pypdf import PdfReader
from sqlalchemy.orm import Session
from database import *
load_dotenv(); app=FastAPI(title='Chat Desk'); app.add_middleware(CORSMiddleware,allow_origins=os.getenv('CORS_ORIGINS','http://localhost:5173').split(','),allow_credentials=True,allow_methods=['*'],allow_headers=['*'])
SECRET=os.getenv('JWT_SECRET_KEY','change-me-in-production'); auth=HTTPBearer(auto_error=False); rate={}
@app.on_event('startup')
def start(): init_db()
def serial(x): return {c.name:(getattr(x,c.name).isoformat() if isinstance(getattr(x,c.name),datetime) else getattr(x,c.name)) for c in x.__table__.columns}
def slug(db,name):
 b=re.sub('[^a-z0-9]+','-',name.lower()).strip('-')[:90] or 'support'; s=b; i=2
 while db.query(Company).filter_by(slug=s).first(): s=f'{b}-{i}';i+=1
 return s
def current(c:HTTPAuthorizationCredentials=Depends(auth),db:Session=Depends(get_db)):
 if not c: raise HTTPException(401,'Please log in')
 try: u=db.get(User,int(jwt.decode(c.credentials,SECRET,algorithms=['HS256']).get('sub')))
 except (JWTError,TypeError): u=None
 if not u: raise HTTPException(401,'Invalid session')
 return u
def comp(u,db): return db.get(Company,u.company_id)
def make_token(u): return jwt.encode({'sub':str(u.id),'exp':datetime.utcnow()+timedelta(days=7)},SECRET,algorithm='HS256')
class Signup(BaseModel): company_name:str=Field(min_length=2,max_length=150);name:str=Field(min_length=2,max_length=150);email:EmailStr;password:str=Field(min_length=8,max_length=72)
class Login(BaseModel): email:EmailStr;password:str
class Config(BaseModel): company_name:str='';website_domain:str='';industry:str='';knowledge_text:str='';faqs:str='';avoid_topics:str='';tone:str='helpful and concise';escalation_rules:str='refunds, legal, angry customers';never_promise:str='';bot_name:str='Support Assistant';welcome_message:str='Hi! How can I help today?';fallback_message:str="I don't have enough information to answer that. Our team can help."
class Chat(BaseModel): conversation_id:int|None=None;visitor_id:str=Field(min_length=4,max_length=80);message:str=Field(min_length=1,max_length=3000)
class Handoff(BaseModel): conversation_id:int;name:str=Field(min_length=2);email:EmailStr;phone:str=Field(min_length=6,max_length=50,pattern=r'^[0-9+() .-]+$')
class Status(BaseModel): status:str
@app.get('/api/health')
def health(): return {'ok':True,'responder':'llm' if os.getenv('LLM_API_KEY') else 'mock retrieval-only'}
@app.post('/api/auth/signup')
def signup(x:Signup,db:Session=Depends(get_db)):
 if db.query(User).filter_by(email=x.email.lower()).first(): raise HTTPException(409,'An account already uses this email')
 co=Company(name=x.company_name.strip(),slug=slug(db,x.company_name));db.add(co);db.flush();u=User(company_id=co.id,name=x.name.strip(),email=x.email.lower(),password_hash=bcrypt.hashpw(x.password.encode(),bcrypt.gensalt()).decode());db.add(u);db.add(BotSettings(company_id=co.id));db.commit();return {'token':make_token(u),'user':{'name':u.name,'email':u.email},'company':serial(co)}
@app.post('/api/auth/login')
def login(x:Login,db:Session=Depends(get_db)):
 u=db.query(User).filter_by(email=x.email.lower()).first()
 if not u or not bcrypt.checkpw(x.password.encode(),u.password_hash.encode()): raise HTTPException(401,'Incorrect email or password')
 return {'token':make_token(u),'user':{'name':u.name,'email':u.email},'company':serial(comp(u,db))}
@app.get('/api/me')
def me(u=Depends(current),db:Session=Depends(get_db)): return {'user':{'name':u.name,'email':u.email},'company':serial(comp(u,db))}
def save(db,co,x):
 co.name=x.company_name.strip() or co.name;co.website_domain=x.website_domain.strip();co.industry=x.industry.strip();co.onboarding_complete=True;s=db.query(BotSettings).filter_by(company_id=co.id).one()
 for k in ['avoid_topics','tone','escalation_rules','never_promise','bot_name','welcome_message','fallback_message']:setattr(s,k,getattr(x,k))
 for t,v in [('Pasted knowledge',x.knowledge_text),('FAQs',x.faqs)]:
  if v.strip():db.add(KnowledgeSource(company_id=co.id,title=t,kind='text',content=v.strip()))
 db.commit()
@app.post('/api/onboarding')
def onboard(x:Config,u=Depends(current),db:Session=Depends(get_db)):
 co=comp(u,db);save(db,co,x);return {'company':serial(co),'chat_url':f'/support/{co.slug}'}
@app.post('/api/knowledge/upload')
async def upload(file:UploadFile=File(...),u=Depends(current),db:Session=Depends(get_db)):
 if not file.filename.lower().endswith(('.txt','.md','.pdf')):raise HTTPException(400,'Upload a txt, md, or pdf file')
 raw=await file.read()
 if len(raw)>5000000:raise HTTPException(413,'File must be under 5 MB')
 try: text='\n'.join(p.extract_text() or '' for p in PdfReader(io.BytesIO(raw)).pages) if file.filename.lower().endswith('.pdf') else raw.decode()
 except Exception:raise HTTPException(400,'Could not read that document')
 if not text.strip():raise HTTPException(400,'The document contains no readable text')
 co=comp(u,db);db.add(KnowledgeSource(company_id=co.id,title=file.filename,kind='document',content=text[:200000]));db.commit();return {'ok':True}
@app.get('/api/public/support/{slug}')
def pub(slug:str,db:Session=Depends(get_db)):
 co=db.query(Company).filter_by(slug=slug).first()
 if not co:raise HTTPException(404,'Support page not found')
 s=db.query(BotSettings).filter_by(company_id=co.id).one();return {'company':co.name,'slug':slug,'bot_name':s.bot_name,'welcome_message':s.welcome_message}
def handoff_needed(q,s):
 terms=['human','agent','representative','refund','legal','lawyer','angry','furious','complaint']+[v.strip().lower() for v in re.split('[,\n]',s.escalation_rules+' '+s.avoid_topics) if v.strip()];return any(t in q.lower() for t in terms)
def context(db,cid,q):
 terms=set(re.findall('[a-z0-9]{3,}',q.lower()));r=[]
 for src in db.query(KnowledgeSource).filter_by(company_id=cid):
  for p in re.split(r'\n\s*\n',src.content):
   n=len(terms&set(re.findall('[a-z0-9]{3,}',p.lower())))
   if n:r.append((n,p.strip()))
 return '\n\n'.join(x[1][:1500] for x in sorted(r,reverse=True)[:3])
async def respond(q,ctx,s):
 if not ctx:return s.fallback_message,True
 if not os.getenv('LLM_API_KEY'):return '[Mock responder — configure LLM_API_KEY for AI responses] '+ctx[:900],False
 try:
  url=os.getenv('LLM_BASE_URL','https://api.groq.com/openai/v1').rstrip('/')+'/chat/completions';prompt=f'Answer ONLY from this knowledge. If missing, reply exactly: {s.fallback_message}. Tone: {s.tone}. Never promise: {s.never_promise}.\nKnowledge:\n{ctx}\nQuestion:{q}'
  async with httpx.AsyncClient(timeout=20) as client:r=await client.post(url,headers={'Authorization':'Bearer '+os.environ['LLM_API_KEY']},json={'model':os.getenv('LLM_MODEL','llama-3.1-8b-instant'),'messages':[{'role':'system','content':'Never invent information.'},{'role':'user','content':prompt}],'temperature':.1,'max_tokens':350});r.raise_for_status()
  ans=r.json()['choices'][0]['message']['content'].strip();return ans,ans==s.fallback_message
 except Exception:return '[Mock responder — LLM temporarily unavailable] '+ctx[:900],False
@app.post('/api/public/support/{slug}/chat')
async def chat(slug:str,x:Chat,request:Request,db:Session=Depends(get_db)):
 ip=request.client.host if request.client else 'unknown';now=time.time();rate[ip]=[t for t in rate.get(ip,[]) if now-t<60]
 if len(rate[ip])>=30:raise HTTPException(429,'Please wait a moment before sending more messages')
 rate[ip].append(now);co=db.query(Company).filter_by(slug=slug).first()
 if not co:raise HTTPException(404,'Support page not found')
 cv=db.get(Conversation,x.conversation_id) if x.conversation_id else None
 if cv and (cv.company_id!=co.id or cv.visitor_id!=x.visitor_id):raise HTTPException(403,'Invalid conversation')
 if not cv:cv=Conversation(company_id=co.id,visitor_id=x.visitor_id);db.add(cv);db.flush()
 db.add(Message(conversation_id=cv.id,role='visitor',content=x.message));s=db.query(BotSettings).filter_by(company_id=co.id).one();es=handoff_needed(x.message,s);ans='I’ll have the team get back to you. Please share your name, email, and phone number.' if es else None
 if not ans:ans,es=await respond(x.message,context(db,co.id,x.message),s)
 db.add(Message(conversation_id=cv.id,role='assistant',content=ans));cv.updated_at=datetime.utcnow()
 if not db.query(Issue).filter_by(conversation_id=cv.id).first():db.add(Issue(company_id=co.id,conversation_id=cv.id,summary=x.message[:240]))
 db.commit();return {'conversation_id':cv.id,'answer':ans,'handoff_required':es}
@app.post('/api/public/support/{slug}/handoff')
def create_handoff(slug:str,x:Handoff,db:Session=Depends(get_db)):
 co=db.query(Company).filter_by(slug=slug).first();cv=db.get(Conversation,x.conversation_id)
 if not co or not cv or cv.company_id!=co.id:raise HTTPException(404,'Conversation not found')
 db.add(HandoffRequest(company_id=co.id,conversation_id=cv.id,name=x.name,email=x.email,phone=x.phone));db.commit();return {'ok':True,'message':'Thanks — the team will get back to you.'}
def tq(cls,u,db):return db.query(cls).filter_by(company_id=u.company_id)
@app.get('/api/dashboard/overview')
def overview(u=Depends(current),db:Session=Depends(get_db)):return {'total_chats':tq(Conversation,u,db).count(),'open_issues':tq(Issue,u,db).filter(Issue.status!='resolved').count(),'handoff_requests':tq(HandoffRequest,u,db).count()}
@app.get('/api/dashboard/conversations')
def convs(q:str='',status:str='',handoff:str='',u=Depends(current),db:Session=Depends(get_db)):
 out=[]
 for c in tq(Conversation,u,db).order_by(Conversation.updated_at.desc()):
  ms=db.query(Message).filter_by(conversation_id=c.id).order_by(Message.created_at).all();h=db.query(HandoffRequest).filter_by(conversation_id=c.id).first();txt=' '.join(m.content for m in ms)
  if (q and q.lower() not in txt.lower())or(status and c.status!=status)or(handoff and str(bool(h)).lower()!=handoff.lower()):continue
  out.append({**serial(c),'has_handoff':bool(h),'preview':ms[-1].content[:120] if ms else '','messages':[serial(m) for m in ms]})
 return out
@app.get('/api/dashboard/issues')
def issues(u=Depends(current),db:Session=Depends(get_db)):return [serial(x) for x in tq(Issue,u,db).order_by(Issue.created_at.desc())]
@app.get('/api/dashboard/handoffs')
def hands(u=Depends(current),db:Session=Depends(get_db)):return [serial(x) for x in tq(HandoffRequest,u,db).order_by(HandoffRequest.created_at.desc())]
@app.patch('/api/dashboard/{kind}/{id}')
def patch(kind:str,id:int,x:Status,u=Depends(current),db:Session=Depends(get_db)):
 cls={'issues':Issue,'handoffs':HandoffRequest}.get(kind)
 if not cls or x.status not in ['open','in_progress','resolved','closed']:raise HTTPException(400,'Invalid update')
 row=tq(cls,u,db).filter_by(id=id).first()
 if not row:raise HTTPException(404,'Not found')
 row.status=x.status;db.commit();return serial(row)
@app.get('/api/settings')
def settings(u=Depends(current),db:Session=Depends(get_db)):
 co=comp(u,db);return {'company':serial(co),'settings':serial(db.query(BotSettings).filter_by(company_id=co.id).one()),'sources':[serial(x) for x in tq(KnowledgeSource,u,db)]}
@app.put('/api/settings')
def put_settings(x:Config,u=Depends(current),db:Session=Depends(get_db)):
 co=comp(u,db);save(db,co,x);return {'ok':True}
