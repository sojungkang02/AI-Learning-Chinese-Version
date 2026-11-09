import {describe,it,expect} from 'vitest';
import {readFileSync,statSync} from 'node:fs';
import {resolve} from 'node:path';
import {fittedItemLook,fittedLookIds} from '../lib/pet-looks';
import {petSpecies,shop} from '../lib/pet-catalog';
import {petEmotions} from '../lib/pet-state';
describe('naturally worn existing single items',()=>{
 it('ships every supported head/body combination as a complete real image',()=>{for(const id of fittedLookIds){const file=resolve('public/pets/looks',id+'.webp');const bytes=readFileSync(file);expect(bytes.subarray(0,4).toString()).toBe('RIFF');expect(bytes.subarray(8,12).toString()).toBe('WEBP');expect(statSync(file).size).toBeGreaterThan(10000);}});
 it('resolves all six species and emotions without changing the outfit',()=>{for(let i=0;i<petSpecies.length;i++){for(const emotion of petEmotions){const look=fittedItemLook(['hat','sweater'],petSpecies[i].id,emotion)!;expect(look.id).toBe('hat-sweater');expect(look.column).toBe(i);expect(look.row).toBe(emotion==='happy'?1:emotion==='surprised'||emotion==='scared'?2:emotion==='determined'?3:emotion==='sleepy'?4:0);}}});
 it('keeps the original item IDs and prices so existing owners need not repurchase',()=>{for(const [id,price] of [['hat',40],['beret',45],['crown',65],['sweater',50],['overalls',55]] as const)expect(shop.find(item=>item.id===id)?.price).toBe(price);expect(fittedItemLook(['hat'],'cat')!.id).toBe('hat-none');expect(fittedItemLook(['overalls'],'cat')!.id).toBe('none-overalls');});
 it('composes the selected pieces and honors slot replacement and removal',()=>{expect(fittedItemLook(['beret','sweater'],'dog')!.id).toBe('beret-sweater');expect(fittedItemLook(['crown','overalls'],'rabbit')!.id).toBe('crown-overalls');expect(fittedItemLook(['hat','beret','sweater'],'cat')!.id).toBe('beret-sweater');expect(fittedItemLook(['glasses'],'cat')).toBeNull();expect(fittedItemLook(['hat','winter-set'],'cat')).toBeNull();});
});
