import {afterEach,describe,it,expect,vi} from 'vitest';
import {generateComic,createLocalStory,requestKey} from '../lib/generation';
import {RemoteImage} from '../lib/providers';
import {findTopic} from '../lib/story-topics';
const request={difficulty:'A1',genre:'科幻',style:'水彩',idea:'在火星学校寻找失踪的机器人'};
afterEach(()=>{vi.unstubAllEnvs();vi.restoreAllMocks();vi.unstubAllGlobals();});
describe('topic-specific stories and panels',()=>{
 it.each([
  ['我想做蛋糕，学烘焙英语','food','recipe'],['농구 시합에서 친구들과 함께 이기는 이야기','sports','team'],['a friendly dragon learning magic','fantasy','dragon'],['海底潜水寻找珊瑚','ocean','coral'],['火星学校冒险','space','planet'],['在图书馆寻找一本书','school','library'],['旅行时买火车票','travel','ticket'],['乐队准备音乐会','music','melody'],['帮小狗找到家','animals','shelter'],['侦探寻找线索','mystery','clue']
 ])('matches %s instead of always using environment',async(idea,id,target)=>{
  expect(findTopic(idea,'日常').id).toBe(id);
  const comic=await generateComic({...request,difficulty:'C2',idea,genre:'日常'},{variation:3});
  expect(comic.knowledge.map(k=>k.word)).toContain(target);
  expect(comic.panels.map(p=>p.scene).join(' ')).not.toContain('A Greener Tomorrow');
  expect(comic.knowledge.map(k=>k.word)).not.toContain('environment');
  expect(new Set(comic.panels.map(p=>p.image)).size).toBe(6);
 });
 it('produces different dialogue, actions and images on repeated generation',async()=>{
  const first=await generateComic(request,{variation:0});
  const next=await generateComic(request,{variation:1});
  expect(first.panels.map(p=>p.dialogue)).not.toEqual(next.panels.map(p=>p.dialogue));
  expect(first.panels.map(p=>p.scene)).not.toEqual(next.panels.map(p=>p.scene));
  expect(first.panels[0].image).not.toBe(next.panels[0].image);
  const dialogue=first.panels.map(p=>p.dialogue).join('\n');
  const afterRestart=await generateComic(request,{variation:0,recentDialogues:[dialogue]});
  expect(afterRestart.panels.map(p=>p.dialogue).join('\n')).not.toBe(dialogue);
 });
 it('keeps explicit English vocabulary and comic context aligned across topics',async()=>{
  const comic=await generateComic({...request,idea:'在火星学校冒险，重点学习 environment 和 oxygen'},{variation:7});
  expect(comic.knowledge.map(k=>k.word)).toEqual(expect.arrayContaining(['environment','oxygen']));
  for(const k of comic.knowledge){expect(comic.panels.some(p=>p.dialogue===k.context&&p.targets.includes(k.id))).toBe(true);expect(k.context).toContain(k.word);expect(comic.questions.filter(q=>q.knowledgeId===k.id).map(q=>q.stage)).toEqual([3,2,1,0]);}
 });
 it('has more than one dialogue variant in each supported theme',()=>{
  for(const genre of ['科幻','校园','悬疑','职场','旅行','日常']){
   const outputs=Array.from({length:8},(_,variation)=>createLocalStory({...request,genre,idea:'友好的冒险故事'},variation));
   expect(new Set(outputs.map(c=>c.panels.map(p=>p.dialogue).join('\n'))).size).toBe(8);
  }
 });
 it('versions cache keys and does not include unsafe input in rendered SVG',async()=>{
  expect(requestKey(request)).not.toBe(requestKey({...request,idea:'烘焙蛋糕'}));
  const c=await generateComic({...request,idea:'炸弹 13812345678 <script>alert(1)</script>'},{variation:5});
  expect(c.moderated).toBe(true);expect(JSON.stringify(c)).not.toContain('13812345678');
  for(const panel of c.panels){const svg=Buffer.from(panel.image!.split(',')[1],'base64').toString();expect(svg).not.toContain('<script>');}
 });
});
describe('real image provider and truthful fallback',()=>{
 it('sends precise story, scene, style and shared characters to the image service',async()=>{
  vi.stubEnv('IMAGE_API_KEY','test-only');
  const png='iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jZk0AAAAASUVORK5CYII=';
  const fetchMock=vi.fn().mockResolvedValue(new Response(JSON.stringify({data:[{b64_json:png}]})));vi.stubGlobal('fetch',fetchMock);
  const image=await new RemoteImage().generate('A dragon reads beside the castle window',2,'水彩',{idea:'Help a friendly dragon read',genre:'科幻',characters:['Mia: dark bob','Pip: yellow robot'],variation:1});
  expect(image).toBe('data:image/png;base64,'+png);
  const body=JSON.parse(fetchMock.mock.calls[0][1].body);expect(body.prompt).toContain('dragon reads beside the castle window');expect(body.prompt).toContain('Pip: yellow robot');expect(body.prompt).toContain('水彩');
 });
 it('retries images once and marks fallback rather than claiming AI art worked',async()=>{
  vi.stubEnv('IMAGE_PROVIDER','remote');vi.stubEnv('IMAGE_API_KEY','test-only');
  const generate=vi.spyOn(RemoteImage.prototype,'generate').mockRejectedValue(new Error('service unavailable'));
  const c=await generateComic(request,{variation:0});expect(generate).toHaveBeenCalledTimes(12);expect(c.imageMode).toBe('mixed');expect(c.imageFallbacks).toBe(6);expect(c.panels.every(p=>p.image?.startsWith('data:image/svg+xml'))).toBe(true);
 });
 it('requires credentials when remote generation is explicitly selected',async()=>{
  vi.stubEnv('LLM_PROVIDER','remote');vi.stubEnv('LLM_API_KEY','');await expect(generateComic(request)).rejects.toThrow('LLM_API_KEY');
 });
});
