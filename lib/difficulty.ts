export const difficulties = Object.fromEntries([
 ['A1',5,8,1,.05,6,.9],['A2',5,10,2,.08,6,.8],['B1',5,14,3,.1,6,.6],['B2',6,18,4,.12,8,.4],['C1',8,23,5,.15,8,.25],['C2',10,28,6,.18,10,.1],
].map(([id,targets,maxSentenceWords,grammarComplexity,newWordDensity,dialogueTurns,chineseRatio])=>[id,{targets,maxSentenceWords,grammarComplexity,newWordDensity,dialogueTurns,chineseRatio}]));
export const examMap: Record<string,string> = {'CET4':'B1','CET6':'B2','IELTS 5.5':'B2','IELTS 6.5':'C1','IELTS 7.5+':'C2','TOEFL 60–80':'B1','TOEFL 80–100':'B2','TOEFL 100+':'C1'};
export function resolveDifficulty(value:string){const key=examMap[value]||value; if(!difficulties[key])throw new Error('无效难度');return {cefr:key,...difficulties[key]};}
