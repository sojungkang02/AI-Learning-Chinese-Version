import {defineConfig} from 'vitest/config';
export default defineConfig({test:{include:['tests/*.test.ts'],fileParallelism:false,maxWorkers:1,env:{DATA_DIR:'/tmp/comiclingo-unit-tests',LLM_PROVIDER:'mock'}}});
