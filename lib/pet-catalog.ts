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
export type PetItem={id:string;name:string;icon:string;price:number;kind:string;slot?:PetSlot;look?:number;species?:string;occupies?:PetSlot[];description:string};
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
 {id:'winter-set',name:'暖冬红绒球套装',icon:'🧶',price:80,kind:'outfit',slot:'body',look:0,species:'cat',occupies:['head','body','neck'],description:'橘猫专属：红绒球针织帽、围巾与奶油红边毛衣'},
 {id:'sailor-set',name:'蓝莓水手套装',icon:'⚓',price:80,kind:'outfit',slot:'body',look:1,species:'white-cat',occupies:['head','body','neck'],description:'奶油猫专属：蝴蝶结贝雷帽与立体水手服'},
 {id:'forest-set',name:'森林小爪套装',icon:'🌿',price:80,kind:'outfit',slot:'body',look:2,species:'dog',occupies:['head','body','neck'],description:'小狗专属：奶油渔夫帽与柔软橄榄绿连帽衫'},
 {id:'honey-set',name:'蜂蜜小熊套装',icon:'🧸',price:80,kind:'outfit',slot:'body',look:3,species:'capybara',occupies:['head','body','neck'],description:'水豚专属：格纹小帽、奶油衬衫与小熊背带装'},
 {id:'blossom-set',name:'樱花蕾丝套装',icon:'🌸',price:80,kind:'outfit',slot:'body',look:4,species:'sheep',occupies:['head','body','neck'],description:'小羊专属：软帽与蕾丝刺绣披肩，自然包裹肩膀'},
 {id:'strawberry-set',name:'草莓格纹套装',icon:'🎀',price:80,kind:'outfit',slot:'body',look:5,species:'rabbit',occupies:['head','body','neck'],description:'小兔专属：雏菊贝雷帽与奶油蕾丝格纹裙'},
 {id:'garden',name:'月光花园',icon:'🌿',price:60,kind:'background',slot:'background',description:'为小伙伴布置温暖的花园小窝'},
];
export type CastMember={name:string;role:string;appearance:string};
export type StoryCast={pet:{species:string;name:string;equipped:string[];cleanliness?:number};additional:CastMember[]};
export function itemSlots(item:PetItem){return item.occupies||(item.slot?[item.slot]:[]);}
export function normalizeEquipment(equipped:string[]){const slots=new Set<PetSlot>();return [...equipped].reverse().filter(id=>{const item=shop.find(i=>i.id===id);if(!item)return false;const used=itemSlots(item);if(!used.length||used.some(slot=>slots.has(slot)))return false;used.forEach(slot=>slots.add(slot));return true;}).reverse();}
const outfitEnglish:Record<string,string>={'winter-set':'red pompom hat, red knitted scarf, cream sweater with red cuffs fitted around torso and sleeves','sailor-set':'blue bow beret and blue sailor blouse naturally fitted around body','forest-set':'cream bucket hat and olive green plush hoodie with sleeves around forelegs','honey-set':'yellow gingham cap, cream shirt and yellow bear-pocket overalls','blossom-set':'pink lace bonnet and embroidered pink cape fitted around shoulders','strawberry-set':'pink flower beret and pink plaid lace dress fitted around the torso',
hat:'brown felt explorer hat',beret:'berry pink artist beret',crown:'small gold star crown',glasses:'brown round glasses',sweater:'mint green knitted sweater with a cream heart',overalls:'blue denim overalls',scarf:'warm orange scarf',bow:'pink bow tie'};
export function describeCast(cast:StoryCast){const info=speciesInfo(cast.pet.species);const outfits=cast.pet.equipped.map(id=>shop.find(i=>i.id===id)).filter(i=>i&&['head','body','face','neck'].includes(i.slot||''));return [`${cast.pet.name}: MAIN CHARACTER, a friendly anthropomorphic ${info.english}; ${info.look}; ${outfits.length?'wearing '+outfits.map(i=>outfitEnglish[i!.id]+' ['+i!.id+']').join(', '):'no accessories'}; ${(cast.pet.cleanliness??100)<50?'light playful dust smudges on the fur; ':''}keep this exact species, colors and outfit in all six panels.`,...cast.additional.map(c=>`${c.name}: ${c.role}; appearance: ${c.appearance||'friendly student, warm skin, dark hair, teal jacket'}.`)];}
