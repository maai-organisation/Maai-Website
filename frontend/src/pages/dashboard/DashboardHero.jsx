import { CheckCircle2 } from "lucide-react";

export default function DashboardHero({
displayName,
membershipStatus,
profileCompletion,
role,
}) {

return (

<section className="
relative
overflow-hidden
rounded-[32px]
bg-gradient-to-br
from-slate-950
via-slate-900
to-cyan-950
px-8
py-8
shadow-[0_24px_80px_rgba(15,23,42,0.18)]
">

<div className="
grid
gap-8
xl:grid-cols-[1fr_280px]
">

<div>

<p className="
text-xs
font-black
uppercase
tracking-[0.18em]
text-cyan-300
">

{membershipStatus==="verified"

?`CERTIFIED ${role?.toUpperCase()}`

:membershipStatus

}

</p>

<h1 className="
mt-4
text-4xl
font-black
text-white
">

Welcome back,
{displayName}

</h1>

<p className="
mt-4
max-w-xl
text-sm
leading-7
text-slate-300
">

Track certificates,
camps,
membership
and volunteer activity.

</p>

</div>

<div className="
rounded-[24px]
border
border-white/10
bg-white/10
p-6
backdrop-blur
">

<div className="
flex
items-center
justify-between
">

<div>

<p className="
text-xs
uppercase
text-slate-400
">

Profile completion

</p>

<p className="
mt-2
text-4xl
font-black
text-white
">

{profileCompletion}%

</p>

</div>

<CheckCircle2 className="
h-8
w-8
text-cyan-300
"/>

</div>

<div className="
mt-5
h-3
rounded-full
bg-white/10
">

<div

className="
h-full
rounded-full
bg-cyan-300
"

style={{
width:`${profileCompletion}%`
}}

>

</div>

</div>

</div>

</div>

</section>

);

}