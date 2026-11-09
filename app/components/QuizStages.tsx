import {ComicArtwork} from './PetAvatar';
import type {Panel} from '@/lib/generation';
import {Check} from 'lucide-react';
export function QuizStages({stage}:{stage:number}){return <div className="stages" aria-label="支架进度">{[3,2,1,0].map(s=><div key={s} className={s===stage?'current':s>stage?'passed':''} aria-current={s===stage?'step':undefined}><span>{s>stage?<Check size={16}/>: 'L'+s}</span><strong>{['独立运用','仅漫画','撤去释义','全支架'][s]}</strong></div>)}</div>;}
export function QuizSupport({support}:{support:{meaning?:string;example?:string;panel?:Panel}}){return Object.keys(support).length>0?<div className="support" data-testid="support">{support.meaning&&<p data-testid="meaning">📖 释义：{support.meaning}</p>}{support.example&&<p data-testid="example">✎ 例句：{support.example}</p>}{support.panel&&<div data-testid="comic-support"><ComicArtwork panel={support.panel}/></div>}</div>:null;}
