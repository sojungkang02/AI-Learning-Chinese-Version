export const petSpecies=[
 {id:'cat',name:'小橘',label:'橘猫',english:'orange tabby kitten',look:'orange tabby fur, cream chest, triangular ears, huge glossy dark eyes, pink cheeks',column:0,row:0,faceX:285,faceY:195,hatY:122,bodyY:365},
 {id:'white-cat',name:'奶糖',label:'奶油猫',english:'cream kitten',look:'white cream fur, pale golden patches, triangular ears, huge glossy dark eyes, pink cheeks',column:1,row:0,faceX:256,faceY:195,hatY:120,bodyY:365},
 {id:'dog',name:'布丁',label:'小狗',english:'tan-and-white puppy',look:'tan and white fur, floppy ears, white forehead stripe, huge glossy dark eyes, pink cheeks',column:2,row:0,faceX:222,faceY:180,hatY:95,bodyY:365},
 {id:'capybara',name:'卡布',label:'水豚',english:'golden capybara',look:'golden brown fur, round ears, broad brown muzzle, huge glossy dark eyes, pink cheeks',column:0,row:1,faceX:278,faceY:176,hatY:132,bodyY:370},
 {id:'sheep',name:'棉棉',label:'小羊',english:'fluffy white lamb',look:'fluffy white wool, small cream horns, pink ears, dark hooves, huge glossy dark eyes',column:1,row:1,faceX:252,faceY:200,hatY:128,bodyY:375},
 {id:'rabbit',name:'雪球',label:'小兔',english:'white rabbit',look:'white fur, very long pink ears, tiny pink nose, huge glossy dark eyes, pink cheeks',column:2,row:1,faceX:228,faceY:223,hatY:165,bodyY:380},
] as const;
export type PetSpeciesId=typeof petSpecies[number]['id'];
export function speciesInfo(species:string){return petSpecies.find(p=>p.id===species)||petSpecies[0];}
export type PetSlot='head'|'body'|'face'|'neck'|'toy'|'background';
export type PetItem={id:string;name:string;icon:string;price:number;kind:string;slot?:PetSlot;description:string};
export const shop:PetItem[]=[
 {id:'food',name:'能量小鱼干',icon:'🐟',price:10,kind:'food',description:'补充 25 点饱腹值'},
 {id:'hat',name:'探险家帽',icon:'🤠',price:40,kind:'outfit',slot:'head',description:'和小伙伴一起去冒险的棕色帽子'},
 {id:'beret',name:'画家贝雷帽',icon:'🎨',price:45,kind:'outfit',slot:'head',description:'温柔的莓果红，让每个故事更有灵感'},
 {id:'crown',name:'星星小王冠',icon:'👑',price:65,kind:'outfit',slot:'head',description:'送给每天努力一点点的你'},
 {id:'glasses',name:'圆框眼镜',icon:'👓',price:30,kind:'outfit',slot:'face',description:'戴上眼镜，变身故事里的小博士'},
 {id:'sweater',name:'森林针织衫',icon:'🧥',price:50,kind:'outfit',slot:'body',description:'柔软的薄荷绿毛衣，配一颗小爱心'},
 {id:'overalls',name:'蓝莓背带裤',icon:'👖',price:55,kind:'outfit',slot:'body',description:'有大口袋的蓝色背带装，装满新知识'},
 {id:'scarf',name:'暖暖围巾',icon:'🧣',price:25,kind:'outfit',slot:'neck',description:'暖橙色小围巾，陪伴每一次探索'},
 {id:'bow',name:'樱花蝴蝶结',icon:'🎀',price:25,kind:'outfit',slot:'neck',description:'一份刚刚好的粉色小可爱'},
 {id:'ball',name:'星球玩具',icon:'🧶',price:25,kind:'toy',slot:'toy',description:'和小伙伴一起玩耍的毛线球'},
 {id:'garden',name:'月光花园',icon:'🌿',price:60,kind:'background',slot:'background',description:'为小伙伴布置温暖的花园小窝'},
];
export type CastMember={name:string;role:string;appearance:string};
export type StoryCast={pet:{species:string;name:string;equipped:string[]};additional:CastMember[]};
export function normalizeEquipment(equipped:string[]){const slots=new Set<PetSlot>();return [...equipped].reverse().filter(id=>{const item=shop.find(i=>i.id===id);if(!item?.slot||slots.has(item.slot))return false;slots.add(item.slot);return true;}).reverse();}
const outfitEnglish:Record<string,string>={hat:'brown felt explorer hat',beret:'berry pink artist beret',crown:'small gold star crown',glasses:'brown round glasses',sweater:'mint green knitted sweater with a cream heart',overalls:'blue denim overalls',scarf:'warm orange scarf',bow:'pink bow tie'};
export function describeCast(cast:StoryCast){const info=speciesInfo(cast.pet.species);const outfits=cast.pet.equipped.map(id=>shop.find(i=>i.id===id)).filter(i=>i&&['head','body','face','neck'].includes(i.slot||''));return [`${cast.pet.name}: MAIN CHARACTER, a friendly anthropomorphic ${info.english}; ${info.look}; ${outfits.length?'wearing '+outfits.map(i=>outfitEnglish[i!.id]+' ['+i!.id+']').join(', '):'no accessories'}; keep this exact species, colors and outfit in all six panels.`,...cast.additional.map(c=>`${c.name}: ${c.role}; appearance: ${c.appearance||'friendly student, warm skin, dark hair, teal jacket'}.`)];}
