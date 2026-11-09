import type {PetEmotion} from './pet-state';
import {petSpecies,normalizeEquipment} from './pet-catalog';
export const fittedHeads=['hat','beret','crown'] as const;
export const fittedBodies=['sweater','overalls'] as const;
export const fittedLookIds=['hat-none','beret-none','crown-none','none-sweater','none-overalls','hat-sweater','hat-overalls','beret-sweater','beret-overalls','crown-sweater','crown-overalls'] as const;
export function fittedItemLook(equipped:readonly string[],species:string,emotion:PetEmotion='neutral'){
 const current=normalizeEquipment([...equipped]);const head=fittedHeads.find(id=>current.includes(id)),body=fittedBodies.find(id=>current.includes(id));
 if(!head&&!body)return null;
 const id=`${head||'none'}-${body||'none'}`;
 const row=emotion==='happy'?1:emotion==='surprised'||emotion==='scared'?2:emotion==='determined'?3:emotion==='sleepy'?4:0;
 const column=Math.max(0,petSpecies.findIndex(p=>p.id===species));
 return {id,src:`/pets/looks/${id}.webp`,row,column};
}
