import {describe,it,expect} from 'vitest';
import {db,ensureUser,grantPoints,row,run,transaction,now} from '../lib/db';
import {generateComic,requestKey} from '../lib/generation';
import {startQuiz,answerQuiz,transition} from '../lib/quiz';
import {MockLLM,structured} from '../lib/providers';
const user=crypto.randomUUID();ensureUser(user);
describe('generation and safe output',()=>{
it('generates six panels and all four stages per knowledge point',async()=>{const c=await generateComic({difficulty:'CET4',genre:'科幻',style:'水彩',idea:'火星学校的环境故事'});expect(c.panels).toHaveLength(6);expect(c.knowledge).toHaveLength(5);for(const k of c.knowledge){expect(c.panels.some(p=>p.dialogue.includes(k.word)&&p.targets.includes(k.id))).toBe(true);expect(c.questions.filter(q=>q.knowledgeId===k.id).map(q=>q.stage)).toEqual([3,2,1,0]);}});
it('rewrites unsafe input without copying sensitive text',async()=>{const c=await generateComic({difficulty:'A1',genre:'校园',style:'简笔',idea:'我的手机号 13812345678 和炸弹'});expect(c.moderated).toBe(true);expect(JSON.stringify(c)).not.toContain('13812345678');});
it('rejects invalid AI output after exactly one repair',async()=>{let attempts=0;const broken={generate:async()=>{attempts++;return {};}};await expect(structured(broken,'goals',{})).rejects.toThrow();expect(attempts).toBe(2);});
});
describe('transactional rewards',()=>{
it('prevents duplicate claims, diminishes repeats and caps a day',()=>{transaction(()=>{expect(grantPoints(user,'a',20,'word')).toBe(20);expect(grantPoints(user,'a',20,'word')).toBe(0);expect(grantPoints(user,'b',20,'word')).toBe(10);expect(grantPoints(user,'c',1000)).toBe(170);expect(grantPoints(user,'d',10)).toBe(0);});expect(row('SELECT balance FROM users WHERE id=?',user).balance).toBe(200);});
it('rolls back balance and inventory together on failure',()=>{const before=row('SELECT balance FROM users WHERE id=?',user).balance;expect(()=>transaction(()=>{run('UPDATE users SET balance=balance-10 WHERE id=?',user);run('UPDATE inventory SET quantity=quantity+1 WHERE user_id=?',user);throw new Error('fail');})).toThrow('fail');expect(row('SELECT balance FROM users WHERE id=?',user).balance).toBe(before);expect(row('SELECT quantity FROM inventory WHERE user_id=?',user).quantity).toBe(2);});
});
describe('strict scaffolding and mastery',()=>{
it('bounds regression',()=>{expect(transition(3,false)).toBe(3);expect(transition(1,false)).toBe(2);expect(transition(0,true)).toBe(-1);});
it('strips support, regresses errors, rejects replay, schedules 1/3/7/14 day reviews',async()=>{const u=crypto.randomUUID();ensureUser(u);const c=await generateComic({difficulty:'A1',genre:'科幻',style:'水彩',idea:'environment'});run('INSERT INTO comics VALUES(?,?,?,?,?,1,?)',c.id,u,'{}',JSON.stringify(c),'test',now());let q:any=startQuiz(u,c.id);expect(q.support.meaning).toBeTruthy();q=await answerQuiz(u,q.id,'wrong',q.revision);expect(q.stage).toBe(3);expect(q.last.correct).toBe(false);for(let i=0;i<c.knowledge.length;i++){for(const stage of [3,2,1,0]){expect(q.stage).toBe(stage);expect('meaning' in q.support).toBe(stage===3);expect('example' in q.support).toBe(stage>=2);expect('panel' in q.support).toBe(stage>=1);const question=c.questions.find(x=>x.knowledgeId===c.knowledge[i].id&&x.stage===stage)!;const rev=q.revision;const id=q.id;q=await answerQuiz(u,id,question.type==='sentence'?c.knowledge[i].example:question.answer,rev);await expect(answerQuiz(u,id,question.answer,rev)).rejects.toThrow();}}expect(q.done).toBe(true);expect(row('SELECT COUNT(*) AS n FROM mastery WHERE user_id=? AND mastered=1',u).n).toBe(5);expect(row('SELECT COUNT(*) AS n FROM reviews WHERE user_id=?',u).n).toBe(20);expect(row('SELECT errors FROM mastery WHERE user_id=? AND knowledge_id=?',u,c.knowledge[0].id).errors).toBe(1);});
});
