import {createHash,randomInt} from 'node:crypto';
import {resolveDifficulty} from './difficulty';
import {MockLLM,RemoteLLM,MockImage,RemoteImage,structured,type ImageProvider} from './providers';
import {findTopic,topics,type WordEntry} from './story-topics';
export const GENERATION_VERSION='themed-stories-v2';
export type Knowledge={id:string;word:string;meaning:string;ipa:string;example:string;context:string;collocations:string[]};
export type Panel={id:string;scene:string;dialogue:string;chinese:string;targets:string[];image?:string};
export type Question={knowledgeId:string;stage:number;type:string;prompt:string;answer:string;options:string[]};
export type Comic={id:string;title:string;characters:string[];panels:Panel[];knowledge:Knowledge[];questions:Question[];mode:string;goals:string[];moderated:boolean;difficulty:string;imageMode?:string;generationVersion?:string;topic?:string;idea?:string;imageFallbacks?:number;genre?:string;style?:string};
export type GenerateInput={difficulty:string;genre:string;style:string;idea:string;lowCost?:boolean};
export type GenerationOptions={variation?:number;recentDialogues?:string[]};
let sequence=randomInt(1000000);
export function localModeration(text:string){const unsafe=/色情|裸照|自杀|自残|杀死|炸弹|毒品|仇恨|身份证|手机号|\b(?:rape|porn|suicide|kill|bomb)\b|\b\d{11}\b|[\w.+-]+@[\w.-]+\.[a-z]{2,}/i.test(text);return {safe:!unsafe,reason:unsafe?'minor-safety-or-privacy':'',rewritten:unsafe?'在学校开展保护环境的友好探索':text};}
export function requestKey(input:GenerateInput){return createHash('sha256').update(JSON.stringify({version:GENERATION_VERSION,...input})).digest('hex');}
function shuffled<T>(items:T[],seed:number){const copy=[...items];let n=(seed>>>0)||1;for(let i=copy.length-1;i>0;i--){n=(Math.imul(n,1664525)+1013904223)>>>0;const j=n%(i+1);[copy[i],copy[j]]=[copy[j],copy[i]];}return copy;}
export function createLocalStory(input:GenerateInput,variation:number){
 const level=resolveDifficulty(input.difficulty),topic=findTopic(input.idea,input.genre),arc=variation%topic.arcs.length;
 const allWords=[...new Map(topics.flatMap(t=>t.words).map(w=>[w.word,w])).values()];
 const explicit=allWords.filter(w=>new RegExp('\\b'+w.word+'\\b','i').test(input.idea));
 const selected=[...new Map([...explicit,...shuffled(topic.words,variation+1)].map(w=>[w.word,w])).values()].slice(0,Number(level.targets));
 const knowledge:Knowledge[]=selected.map((w,i)=>({id:'word-'+w.word,word:w.word,meaning:w.meaning,ipa:w.ipa,example:w.examples[(variation+i)%w.examples.length],context:'',collocations:[w.collocation]}));
 const panels:Panel[]=Array.from({length:6},(_,i)=>{
  const ks=knowledge.filter((_,j)=>j%6===i);const lead=topic.arcs[arc][i];
  return {id:'panel-'+i,scene:`${topic.label}: ${topic.setting}. Story beat ${i+1}: ${topic.hints[arc][i]}. Action: ${lead} ${ks.map(k=>k.example).join(' ')} Camera: ${['wide establishing view','medium reaction shot','close-up discovery','over-the-shoulder planning','dynamic action shot','wide celebratory ending'][i]}. Mia and Pip remain consistent.`,dialogue:[lead,...ks.map(k=>k.example)].join(' '),chinese:`${topic.hints[arc][i]}。${ks.map(k=>`${k.word}：${k.meaning}`).join('；')}`,targets:ks.map(k=>k.id)};
 });
 knowledge.forEach(k=>{k.context=panels.find(p=>p.targets.includes(k.id))!.dialogue;});
 const questions:Question[]=knowledge.flatMap((k,i)=>[3,2,1,0].map(stage=>{
  const type=stage===3?'meaning':stage===2?'cloze':stage===1?'collocation':i%2?'sentence':'usage';
  return {knowledgeId:k.id,stage,type,prompt:stage===3?`“${k.word}” 在漫画中的含义是什么？`:stage===2?k.example.replace(new RegExp('\\b'+k.word+'\\b','ig'),'_____'):stage===1?`选择与 “${k.word}” 搭配正确的短语`:i%2?`用 “${k.word}” 写一个完整的英语句子。`:`选择 “${k.word}” 的正确用法。`,answer:stage===3?k.meaning:stage===2?k.word:stage===1?k.collocations[0]:k.example,options:stage===3?[k.meaning,...knowledge.filter(x=>x.id!==k.id).slice(0,3).map(x=>x.meaning)]:stage===2?[k.word,...knowledge.filter(x=>x.id!==k.id).slice(0,3).map(x=>x.word)]:stage===1?[k.collocations[0],...knowledge.filter(x=>x.id!==k.id).slice(0,3).map(x=>x.collocations[0])]:i%2?[]:[k.example,`She ${k.word} yesterday is.`,`They is ${k.word}.`,`A ${k.word} are go.`]};
 }));
 return {knowledge,panels,questions,characters:['Mia: curious student, dark bob hair, warm skin, mustard jacket and navy trousers; cream spacesuit in space or underwater','Pip: friendly small yellow cube robot, dark teal face screen, two mint eyes, short articulated arms'],title:`${topic.title} · ${topic.hints[arc][0]}`,goals:knowledge.map(k=>`在${topic.label}故事中掌握 ${k.word} 的含义与用法`),topic};
}
const imageCache=new Map<string,string>();
export async function generateComic(input:GenerateInput,options:GenerationOptions={}):Promise<Comic>{
 resolveDifficulty(input.difficulty);
 const moderation=localModeration(input.idea);const safeInput={...input,idea:moderation.rewritten};
 const useRemote=process.env.LLM_PROVIDER==='remote';
 if(useRemote&&!process.env.LLM_API_KEY)throw new Error('请在服务器环境变量中设置 LLM_API_KEY，或使用本地主题模式');
 const provider=useRemote?new RemoteLLM():new MockLLM();
 let variation=options.variation??++sequence;
 let local=createLocalStory(safeInput,variation);
 // Also avoid repeats across server restarts, using recent user-visible dialogue.
 for(let attempt=0;attempt<12&&options.recentDialogues?.includes(local.panels.map(p=>p.dialogue).join('\n'));attempt++)local=createLocalStory(safeInput,++variation);
 const context={request:safeInput,difficulty:resolveDifficulty(input.difficulty),variation,avoidRepeating:options.recentDialogues?.slice(0,3)||[]};
 const audit=await structured<{safe:boolean;reason:string;rewritten:string}>(provider,'moderation',useRemote?context:moderation);
 if(!audit.safe){safeInput.idea=audit.rewritten||'友好的校园冒险';local=createLocalStory(safeInput,variation);}
 const safeContext={...context,request:safeInput};
 const goals=await structured<{goals:string[]}>(provider,'goals',useRemote?safeContext:{goals:local.goals});
 const script=await structured<{title:string;characters:string[];panels:Panel[]}>(provider,'script',useRemote?{...safeContext,goals}:{title:local.title,characters:local.characters,panels:local.panels});
 if(script.panels.length!==6)throw new Error('MVP 必须生成六个分镜');
 const extracted=await structured<{knowledge:Knowledge[]}>(provider,'knowledge',useRemote?{...safeContext,script,goals}:{knowledge:local.knowledge});
 const quiz=await structured<{questions:Question[]}>(provider,'quiz',useRemote?{...safeContext,script,knowledge:extracted.knowledge}:{questions:local.questions});
 const ids=new Set(extracted.knowledge.map(k=>k.id));if(ids.size!==extracted.knowledge.length)throw new Error('知识点 ID 重复');
 for(const k of extracted.knowledge){if(!script.panels.some(p=>p.dialogue.toLowerCase().includes(k.word.toLowerCase())&&p.targets.includes(k.id)))throw new Error('目标词未出现在漫画对话中');for(const stage of [3,2,1,0]){const qs=quiz.questions.filter(q=>q.knowledgeId===k.id&&q.stage===stage);if(qs.length!==1)throw new Error('四阶段题目不完整');const q=qs[0];if(q.type!=='sentence'&&(!q.options.includes(q.answer)||new Set(q.options).size!==q.options.length))throw new Error('测验选项无效');}}
 if(script.panels.some(p=>p.targets.some(id=>!ids.has(id)))||quiz.questions.some(q=>!ids.has(q.knowledgeId)))throw new Error('未知知识点引用');
 if(!localModeration(JSON.stringify({script,knowledge:extracted,quiz})).safe)throw new Error('生成内容未通过安全审核，请更换设想重试');
 if(options.recentDialogues?.includes(script.panels.map(p=>p.dialogue).join('\n')))throw new Error('生成内容与最近的故事重复，请重新生成');
 const wantsRemoteImages=process.env.IMAGE_PROVIDER==='remote'&&!input.lowCost;
 if(wantsRemoteImages&&!process.env.IMAGE_API_KEY&&!process.env.LLM_API_KEY)throw new Error('请在服务器环境变量中设置 IMAGE_API_KEY 后启用 AI 作画');
 const images:ImageProvider=wantsRemoteImages?new RemoteImage():new MockImage();let imageFallbacks=0;
 // Bounded concurrency avoids holding six image requests at once on a small demo instance.
 for(let offset=0;offset<script.panels.length;offset+=2){await Promise.all(script.panels.slice(offset,offset+2).map(async(p,j)=>{
  const i=offset+j;const imageContext={idea:safeInput.idea,genre:input.genre,characters:script.characters,variation,theme:useRemote?undefined:local.topic.id};
  const key=createHash('sha256').update(JSON.stringify({scene:p.scene,style:input.style,provider:wantsRemoteImages?'remote':'local',characters:script.characters,variation})).digest('hex');
  let src=imageCache.get(key);for(let attempt=0;!src&&attempt<2;attempt++){try{src=await images.generate(p.scene,i,input.style,imageContext);}catch{}}
  if(!src){imageFallbacks++;src=await new MockImage().generate(p.scene,i,input.style,imageContext);}p.image=src;
  // Bounded cache; comics themselves remain persisted in SQLite.
  if(imageCache.size>=72)imageCache.delete(imageCache.keys().next().value!);imageCache.set(key,src);
 }));}
 return {id:crypto.randomUUID(),...script,knowledge:extracted.knowledge,questions:quiz.questions,goals:goals.goals,mode:useRemote?'remote':'local',moderated:!moderation.safe||!audit.safe,difficulty:input.difficulty,imageMode:wantsRemoteImages?(imageFallbacks?'mixed':'remote'):'local',imageFallbacks,generationVersion:GENERATION_VERSION,topic:local.topic.label,idea:safeInput.idea,genre:input.genre,style:input.style};
}
