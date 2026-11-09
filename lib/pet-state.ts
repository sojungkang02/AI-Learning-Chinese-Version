export const petEmotions=['neutral','happy','curious','surprised','scared','determined','sleepy'] as const;
export const petActions=['idle','wave','jump','think','run','tremble','celebrate'] as const;
export type PetEmotion=typeof petEmotions[number];
export type PetAction=typeof petActions[number];
export type PetSceneState={emotion:PetEmotion;action:PetAction};
export type CareState={lastSeen:string;lastInteraction:string|null;lastCleaned:string;cleanliness:number;affection:number;interactions:number;reaction:PetEmotion;reactionUntil:string|null};
export const careRules={absenceGraceDays:1,dirtPerAbsentDay:14,minCleanliness:20,reactionMs:12000,interactionCooldownMs:900};
const day=86400000;
export function freshCare(now:string):CareState{return {lastSeen:now,lastInteraction:null,lastCleaned:now,cleanliness:100,affection:0,interactions:0,reaction:'neutral',reactionUntil:null};}
export function deriveCare(saved:CareState,now:string){const elapsed=Math.max(0,Date.parse(now)-Date.parse(saved.lastSeen));const days=Math.floor(elapsed/day);const cleanliness=Math.max(careRules.minCleanliness,Math.min(100,saved.cleanliness)-Math.max(0,days-careRules.absenceGraceDays)*careRules.dirtPerAbsentDay);const reactionActive=!!saved.reactionUntil&&Date.parse(saved.reactionUntil)>Date.parse(now);const emotion:PetEmotion=reactionActive?saved.reaction:cleanliness<50?'sleepy':saved.affection>=25?'happy':'neutral';return {...saved,cleanliness,emotion,dirt:100-cleanliness,needsBath:cleanliness<65,awayDays:days,action:(reactionActive&&emotion==='happy'?'jump':'idle') as PetAction};}
export type CareAction='pet'|'play'|'clean'|'feed'|'study';
export function applyCare(saved:CareState,action:CareAction,now:string){const view=deriveCare(saved,now);if(['pet','play'].includes(action)&&saved.lastInteraction&&Date.parse(now)-Date.parse(saved.lastInteraction)<careRules.interactionCooldownMs)throw new Error('小伙伴还在回应你，稍等一下再互动吧');return {...saved,lastSeen:now,lastInteraction:now,lastCleaned:action==='clean'?now:saved.lastCleaned,cleanliness:action==='clean'?100:view.cleanliness,affection:Math.min(100,saved.affection+(action==='clean'&&view.cleanliness===100?0:({pet:2,play:3,clean:2,feed:2,study:4}[action]))),interactions:saved.interactions+1,reaction:'happy' as PetEmotion,reactionUntil:new Date(Date.parse(now)+careRules.reactionMs).toISOString()};}
export function scenePetState(text:string,index:number):PetSceneState{
 if(/afraid|scared|fright|danger|storm|nervous|害怕|紧张|暴风|무서|두려/i.test(text))return {emotion:'scared',action:'tremble'};
 if(/surpris|wow|strange light|suddenly|惊讶|意外|놀라/i.test(text))return {emotion:'surprised',action:'wave'};
 if(index===5||/celebrat|hooray|hooray|庆祝|欢呼|축하/i.test(text))return {emotion:'happy',action:'celebrate'};
 if(/plan|strategy|ready|challenge|计划|准备|挑战|계획/i.test(text)&&index>=3)return {emotion:'determined',action:index===4?'run':'think'};
 return ([{emotion:'curious',action:'think'},{emotion:'scared',action:'tremble'},{emotion:'surprised',action:'wave'},{emotion:'determined',action:'think'},{emotion:'determined',action:'run'},{emotion:'happy',action:'celebrate'}] as PetSceneState[])[index%6];
}
