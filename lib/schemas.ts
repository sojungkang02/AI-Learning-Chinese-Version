import {petEmotions,petActions} from './pet-state';
import Ajv from 'ajv';
const ajv=new Ajv({allErrors:true});
const str={type:'string',minLength:1};
export const knowledgeSchema={type:'object',additionalProperties:false,required:['id','word','meaning','ipa','example','context','collocations'],properties:{id:str,word:str,meaning:str,ipa:str,example:str,context:str,collocations:{type:'array',minItems:1,items:str}}};
export const panelSchema={type:'object',additionalProperties:false,required:['id','scene','dialogue','chinese','targets'],properties:{id:str,scene:str,dialogue:str,chinese:str,emotion:{enum:[...petEmotions]},action:{enum:[...petActions]},targets:{type:'array',items:str}}};
export const goalSchema={type:'object',additionalProperties:false,required:['goals'],properties:{goals:{type:'array',minItems:5,maxItems:10,items:str}}};
export const scriptSchema={type:'object',additionalProperties:false,required:['title','characters','panels'],properties:{title:str,characters:{type:'array',minItems:1,items:str},panels:{type:'array',minItems:6,maxItems:10,items:panelSchema}}};
export const extractionSchema={type:'object',additionalProperties:false,required:['knowledge'],properties:{knowledge:{type:'array',minItems:5,maxItems:10,items:knowledgeSchema}}};
export const quizSchema={type:'object',additionalProperties:false,required:['questions'],properties:{questions:{type:'array',minItems:20,items:{type:'object',additionalProperties:false,required:['knowledgeId','stage','type','prompt','answer','options'],properties:{knowledgeId:str,stage:{type:'integer',minimum:0,maximum:3},type:{enum:['meaning','cloze','collocation','usage','sentence']},prompt:str,answer:str,options:{type:'array',items:str}}}}}};
export const moderationSchema={type:'object',additionalProperties:false,required:['safe','reason','rewritten'],properties:{safe:{type:'boolean'},reason:{type:'string'},rewritten:{type:'string'}}};
export const scoreSchema={type:'object',additionalProperties:false,required:['score','errors','suggestion'],properties:{score:{type:'number',minimum:0,maximum:100},errors:{type:'array',items:str},suggestion:str}};
export const schemas={goals:goalSchema,script:scriptSchema,knowledge:extractionSchema,quiz:quizSchema,moderation:moderationSchema,score:scoreSchema};
export function validate<T>(schema:object,data:unknown):T {const check=ajv.compile(schema);if(!check(data))throw new Error('AI JSON Schema 校验失败: '+ajv.errorsText(check.errors));return data as T;}
