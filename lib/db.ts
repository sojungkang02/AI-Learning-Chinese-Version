import {DatabaseSync} from 'node:sqlite';
import {mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
const dir=resolve(process.env.DATA_DIR||'.data');mkdirSync(dir,{recursive:true});
export const db=new DatabaseSync(resolve(dir,'comiclingo.sqlite'));
db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;
CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY, nickname TEXT NOT NULL, profile TEXT NOT NULL, balance INTEGER NOT NULL DEFAULT 0, created TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS comics(id TEXT PRIMARY KEY, user_id TEXT NOT NULL, request TEXT NOT NULL, content TEXT NOT NULL, cache_key TEXT NOT NULL, read_done INTEGER DEFAULT 0, created TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS quizzes(id TEXT PRIMARY KEY,user_id TEXT NOT NULL,comic_id TEXT NOT NULL,state TEXT NOT NULL,created TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS mastery(user_id TEXT,knowledge_id TEXT,highest INTEGER DEFAULT -1,errors INTEGER DEFAULT 0,mastered INTEGER DEFAULT 0,word TEXT,PRIMARY KEY(user_id,knowledge_id));
CREATE TABLE IF NOT EXISTS reviews(id TEXT PRIMARY KEY,user_id TEXT,knowledge_id TEXT,comic_id TEXT,due TEXT,completed INTEGER DEFAULT 0);
CREATE TABLE IF NOT EXISTS ledger(id TEXT PRIMARY KEY,user_id TEXT,event TEXT,knowledge_id TEXT,amount INTEGER,created TEXT,UNIQUE(user_id,event));
CREATE TABLE IF NOT EXISTS pets(user_id TEXT PRIMARY KEY,species TEXT,hunger INTEGER,mood INTEGER,xp INTEGER,equipped TEXT);
CREATE TABLE IF NOT EXISTS inventory(user_id TEXT,item_id TEXT,quantity INTEGER,PRIMARY KEY(user_id,item_id));
CREATE TABLE IF NOT EXISTS moderation(id TEXT PRIMARY KEY,user_id TEXT,category TEXT,rewritten INTEGER,created TEXT);
CREATE TABLE IF NOT EXISTS favorites(user_id TEXT,knowledge_id TEXT,PRIMARY KEY(user_id,knowledge_id));
CREATE TABLE IF NOT EXISTS flags(id TEXT PRIMARY KEY,user_id TEXT,reason TEXT,created TEXT);
`);
export function row(sql:string,...params:any[]):any{return db.prepare(sql).get(...params);}
export function rows(sql:string,...params:any[]):any[]{return db.prepare(sql).all(...params);}
export function run(sql:string,...params:any[]){return db.prepare(sql).run(...params);}
export function transaction<T>(fn:()=>T):T {db.exec('BEGIN IMMEDIATE');try{const value=fn();db.exec('COMMIT');return value;}catch(e){db.exec('ROLLBACK');throw e;}}
export const now=()=>new Date().toISOString();
export function ensureUser(id:string){if(!row('SELECT id FROM users WHERE id=?',id)){transaction(()=>{run('INSERT INTO users VALUES(?,?,?,?,?)',id,'星际学员'+id.slice(0,4),JSON.stringify({exam:'CET4',target:425,minutes:10,interests:'科幻',minor:true,leaderboard:true}),0,now());run('INSERT INTO pets VALUES(?,?,?,?,?,?)',id,'cat',70,85,0,'[]');run('INSERT INTO inventory VALUES(?,?,?)',id,'food',2);});}}
export const shop=[{id:'food',name:'能量小鱼干',icon:'🐟',price:10,kind:'food',description:'给小伙伴补充 25 点饱腹值'}, {id:'ball',name:'星球玩具',icon:'🧶',price:25,kind:'toy',description:'让小伙伴心情更好'}, {id:'hat',name:'探险家帽',icon:'🎩',price:40,kind:'outfit',description:'下一次冒险的专属装扮'}, {id:'garden',name:'月光花园',icon:'🌿',price:60,kind:'background',description:'为小伙伴布置温暖的家'}];
export function grantPoints(userId:string,event:string,base:number,knowledgeId=''){if(row('SELECT id FROM ledger WHERE user_id=? AND event=?',userId,event))return 0;const today=now().slice(0,10);const earned=Number(row('SELECT COALESCE(SUM(amount),0) AS total FROM ledger WHERE user_id=? AND amount>0 AND created LIKE ?',userId,today+'%').total);const repeats=knowledgeId?Number(row('SELECT COUNT(*) AS n FROM ledger WHERE user_id=? AND knowledge_id=? AND amount>0',userId,knowledgeId).n):0;const amount=Math.max(0,Math.min(200-earned,Math.floor(base/(1+repeats))));run('INSERT INTO ledger VALUES(?,?,?,?,?,?)',crypto.randomUUID(),userId,event,knowledgeId,amount,now());run('UPDATE users SET balance=balance+? WHERE id=?',amount,userId);return amount;}
export function pet(userId:string){const p=row('SELECT * FROM pets WHERE user_id=?',userId);return {...p,equipped:JSON.parse(p.equipped),level:Math.floor(p.xp/50)+1,balance:row('SELECT balance FROM users WHERE id=?',userId).balance,inventory:rows('SELECT item_id,quantity FROM inventory WHERE user_id=?',userId),shop};}
