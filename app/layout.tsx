import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'漫游英语 · Learn a little, explore a lot',description:'用漫画开启英语小冒险。学习、练习、和小伙伴一起成长。'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="zh-CN"><body>{children}</body></html>;}
