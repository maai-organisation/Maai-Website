import { ArrowUpRight } from "lucide-react";

export default function StatsGrid({
stats
}){

return(

<div className="
grid
gap-6
md:grid-cols-2
xl:grid-cols-4
">

{stats.map(stat=>{

const Icon=stat.icon;

return(

<article

key={stat.id}

className="
rounded-[28px]
bg-white
p-6
shadow-sm
border
border-slate-100
min-h-[180px]

flex
flex-col
justify-between
"

>

<div className="
flex
justify-between
">

<div className={`
rounded-2xl
p-3
${stat.bg}
`}>

<Icon className={`
h-5
w-5
${stat.color}
`}/>

</div>

<ArrowUpRight className="
text-slate-300
h-4
w-4
"/>

</div>

<div>

<p className="
text-4xl
font-black
">

{stat.value}

</p>

<p className="
mt-2
text-xs
uppercase
tracking-[0.16em]
text-slate-400
">

{stat.label}

</p>

<p className={`
mt-2
text-sm
font-bold
${stat.color}
`}>

{stat.trend}

</p>

</div>

</article>

);

})}

</div>

);

}