"""Run `python seed.py` from Backend to create a demo tenant."""
from database import *
import bcrypt
init_db(); db=SessionLocal()
if not db.query(User).filter_by(email='demo@acme.test').first():
 c=Company(name='Acme Outdoors',slug='acme-outdoors',website_domain='acme.test',industry='Retail',onboarding_complete=True);db.add(c);db.flush();db.add(User(company_id=c.id,name='Demo Admin',email='demo@acme.test',password_hash=bcrypt.hashpw(b'demo-password',bcrypt.gensalt()).decode()));db.add(BotSettings(company_id=c.id,bot_name='Acme Guide',welcome_message='Hi! Ask us about products, shipping, or returns.'));db.add(KnowledgeSource(company_id=c.id,title='Demo FAQ',content='Shipping usually takes 3–5 business days. Returns are accepted within 30 days for unused items. Contact support for order changes.'));db.commit();print('Demo: demo@acme.test / demo-password — /support/acme-outdoors')
else: print('Demo account already exists')
db.close()
