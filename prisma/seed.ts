// Local runtime seed, idempotent. No real personal data or credentials.
import {DatabaseSync} from 'node:sqlite';
import {mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
const dir=resolve(process.env.DATA_DIR||'.data');mkdirSync(dir,{recursive:true});
const db=new DatabaseSync(resolve(dir,'comiclingo.sqlite'));
db.exec('CREATE TABLE IF NOT EXISTS difficulty_levels(id TEXT PRIMARY KEY,config TEXT); CREATE TABLE IF NOT EXISTS catalog(id TEXT PRIMARY KEY,name TEXT,kind TEXT,price INTEGER)');
const levels=[['A1',5,8,1,.05,6,.9],['A2',5,10,2,.08,6,.8],['B1',5,14,3,.1,6,.6],['B2',6,18,4,.12,8,.4],['C1',8,23,5,.15,8,.25],['C2',10,28,6,.18,10,.1]];
for(const [id,targets,maxSentenceWords,grammarComplexity,newWordDensity,dialogueTurns,chineseRatio] of levels)db.prepare('INSERT OR REPLACE INTO difficulty_levels VALUES(?,?)').run(String(id),JSON.stringify({targets,maxSentenceWords,grammarComplexity,newWordDensity,dialogueTurns,chineseRatio}));
for(const item of [['food','能量小鱼干','food',10],['ball','星球玩具','toy',25],['hat','探险家帽','outfit',40],['beret','画家贝雷帽','outfit',45],['crown','星星小王冠','outfit',65],['glasses','圆框眼镜','outfit',30],['sweater','森林针织衫','outfit',50],['overalls','蓝莓背带裤','outfit',55],['scarf','暖暖围巾','outfit',25],['bow','樱花蝴蝶结','outfit',25],['garden','月光花园','background',60]])db.prepare('INSERT OR REPLACE INTO catalog VALUES(?,?,?,?)').run(...item as [string,string,string,number]);
console.log('Seeded 6 difficulty levels and 11 pet items.');db.close();
