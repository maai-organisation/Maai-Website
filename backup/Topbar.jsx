import {
Crown,
LogOut,
Search
} from "lucide-react";

import { Link } from "react-router-dom";

import NotificationBell from "../components/notifications/NotificationBell";

export default function Topbar({
displayName,
isItStaff,
isSuperadmin,
onLogout,
user
}){

return(

<header className="
flex
items-center
gap-5
">

<div className="
hidden
xl:flex
h-12
max-w-md
flex-1
items-center
gap-3
rounded-2xl
border
border-slate-200
bg-slate-50
px-4
">

<Search className="h-5 w-5 text-slate-400"/>

<span className="
text-slate-400
font-medium
">
Search dashboard...
</span>

</div>

<div className="
ml-auto
flex
items-center
gap-3
">

<span className="
hidden
md:flex
rounded-full
bg-slate-100
px-4
py-2
text-xs
font-black
uppercase
">
{user?.role}
</span>

{isSuperadmin && (

<Link
to="/admin"

className="
rounded-full
bg-cyan-500
px-4
py-2
text-white
font-black
"
>

God Mode

</Link>

)}

<NotificationBell/>

<div className="
grid
h-11
w-11
place-items-center
rounded-full
bg-cyan-500
text-white
font-black
">

{displayName[0]}

</div>

<button
onClick={onLogout}

className="
hidden
md:flex
items-center
gap-2
rounded-full
px-3
py-2
hover:bg-slate-100
"
>

<LogOut className="h-4 w-4"/>

Logout

</button>

</div>

</header>

);

}