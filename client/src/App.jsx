import React, { useMemo, useState } from "react";
import AIChat from "./AIChat.jsx";
import ModuleCRUD from "./ModuleCRUD.jsx";
import ManagementModule from "./ManagementModule.jsx";
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, ClipboardCheck, IndianRupee,
  NotebookPen, CalendarDays, Bell, MessageSquare, ChartNoAxesColumn, FolderOpen,
  BrainCircuit, Search, Menu, ChevronRight, Plus, ArrowUpRight, Wallet,
  TrendingUp, UserCheck, Clock3, MoreHorizontal, CircleHelp
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const nav = [
  ["Dashboard", LayoutDashboard], ["Students", Users], ["Teachers", GraduationCap],
  ["Classes", BookOpen], ["Subjects", BookOpen], ["Attendance", ClipboardCheck],
  ["Fees & Finance", IndianRupee], ["Homework", NotebookPen], ["Timetable", CalendarDays],
  ["Notice Board", Bell], ["Messages", MessageSquare], ["Exams & Results", ChartNoAxesColumn],
  ["Study Material", FolderOpen], ["AI Assistant", BrainCircuit]
];
const income = [{month:"Jan",income:420,expense:270},{month:"Feb",income:510,expense:300},{month:"Mar",income:450,expense:320},{month:"Apr",income:660,expense:370},{month:"May",income:590,expense:400},{month:"Jun",income:730,expense:440}];
const notices = [
  {tag:"ACADEMIC",title:"Mid-semester examination schedule released",time:"Today · 10:30 AM",color:"purple"},
  {tag:"EVENT",title:"Annual cultural fest registrations are open",time:"Yesterday · 3:15 PM",color:"orange"},
  {tag:"GENERAL",title:"Library timings updated for this week",time:"24 Oct · 9:00 AM",color:"green"}
];
const attendance = [{name:"Present",value:82,color:"#16b88a"},{name:"Absent",value:11,color:"#ff6b75"},{name:"Leave",value:7,color:"#ffb547"}];
const initialStudents = [
  {name:"Aarav Sharma",rollNo:"BCA2401",course:"BCA",semester:"3rd",email:"aarav@example.com"},
  {name:"Diya Verma",rollNo:"BCA2402",course:"BCA",semester:"3rd",email:"diya@example.com"},
  {name:"Rohan Singh",rollNo:"BCA2403",course:"BCA",semester:"3rd",email:"rohan@example.com"}
];
function Donut({value,color,label}) { return <div className="donut-wrap"><div className="donut" style={{background:`conic-gradient(${color} ${value}%, #edf0f6 0)`}}><div className="donut-hole"><b>{value}%</b></div></div><span>{label}</span></div>; }
function App(){
  const [active,setActive]=useState("Dashboard"),[mobile,setMobile]=useState(false),[query,setQuery]=useState(""),[students,setStudents]=useState(initialStudents),[showAdd,setShowAdd]=useState(false),[newStudent,setNewStudent]=useState({name:"",rollNo:"",course:"BCA",semester:"1st",email:""});
  const filtered=useMemo(()=>students.filter(s=>(s.name+s.rollNo+s.course).toLowerCase().includes(query.toLowerCase())),[students,query]);
  const addStudent=()=>{if(!newStudent.name.trim()||!newStudent.rollNo.trim())return;setStudents([newStudent,...students]);setNewStudent({name:"",rollNo:"",course:"BCA",semester:"1st",email:""});setShowAdd(false);};
  const quick=[["Add Student",Users,"Students"],["Mark Attendance",ClipboardCheck,"Attendance"],["Collect Fee",IndianRupee,"Fees & Finance"],["Create Notice",Bell,"Notice Board"],["Create Exam",ChartNoAxesColumn,"Exams & Results"],["AI Assistant",BrainCircuit,"AI Assistant"]];
  return <div className="app-shell">
    <aside className={`sidebar ${mobile?"open":""}`}>
      <div className="brand"><span className="brand-mark">C</span> Campus<span>Flow</span></div>
      <div className="admin-pill"><span className="shield">✦</span> ADMIN ACCESS</div>
      <div className="nav-label">WORKSPACE</div>
      <nav>{nav.map(([label,Icon])=><button key={label} className={`nav-item ${active===label?"selected":""}`} onClick={()=>{setActive(label);setMobile(false)}}><Icon size={19}/><span>{label}</span>{active===label&&<ChevronRight size={16} className="nav-arrow"/>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="help-icon"><CircleHelp size={19}/></div><div><b>Need some help?</b><small>Visit our help centre</small></div><ChevronRight size={16}/></div>
      <div className="profile"><div className="avatar">AD</div><div><b>Admin User</b><small>Administrator</small></div><MoreHorizontal size={20}/></div>
    </aside>
    <main className="main-area">
      <header className="topbar"><button className="mobile-menu" onClick={()=>setMobile(!mobile)}><Menu/></button><div className="crumb">Workspace <span>/</span> <b>{active}</b></div><div className="top-actions"><div className="search"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search students, classes..."/></div><button className="icon-button"><Bell size={19}/><i/></button><div className="top-avatar">AD</div></div></header>
      <div className="page-content">
        <div className="page-heading"><div><p className="eyebrow">OVERVIEW</p><h1>{active}</h1><p className="subheading">{active==="Dashboard"?"Welcome back! Here's what's happening at your institution.":`Manage your institution's ${active.toLowerCase()} in one place.`}</p></div><div className="date-chip"><CalendarDays size={16}/> Friday, 30 October 2026</div></div>
        {active==="Dashboard" ? <>
          <section className="stats-grid">
            <Stat title="Total Students" value="2,450" change="+12.8%" icon={Users} tint="blue" note="vs last semester"/>
            <Stat title="Total Teachers" value="148" change="+4.2%" icon={GraduationCap} tint="purple" note="vs last semester"/>
            <Stat title="Attendance Rate" value="92.4%" change="+2.4%" icon={UserCheck} tint="green" note="this month"/>
            <Stat title="Fee Collection" value="₹18.6L" change="+8.1%" icon={Wallet} tint="orange" note="this academic year"/>
          </section>
          <section className="dashboard-grid">
            <div className="panel finance-panel"><div className="panel-heading"><div><h2>Finance overview</h2><p>Income vs expenses · Amount in thousands</p></div><button className="select-chip">This year⌄</button></div><div className="chart-area"><ResponsiveContainer width="100%" height="100%"><BarChart data={income} barGap={7}><CartesianGrid strokeDasharray="4 5" vertical={false} stroke="#e9edf4"/><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill:"#78849a",fontSize:13}}/><YAxis axisLine={false} tickLine={false} tick={{fill:"#78849a",fontSize:12}}/><Tooltip cursor={{fill:"#f4f7fc"}}/><Bar dataKey="income" name="Income" fill="#3978ed" radius={[7,7,0,0]} barSize={24}/><Bar dataKey="expense" name="Expenses" fill="#aab6c9" radius={[7,7,0,0]} barSize={24}/></BarChart></ResponsiveContainer></div><div className="legend"><span><i className="blue-dot"/> Income</span><span><i className="grey-dot"/> Expenses</span></div></div>
            <div className="panel notice-panel"><div className="panel-heading"><div><h2>Recent notices</h2><p>Latest announcements</p></div><button className="dots"><MoreHorizontal/></button></div>{notices.map(n=><div className="notice" key={n.title}><span className={`notice-icon ${n.color}`}><Bell size={16}/></span><div><span className={`tag ${n.color}`}>{n.tag}</span><b>{n.title}</b><small>{n.time}</small></div></div>)}<button className="text-link" onClick={()=>setActive("Notice Board")}>View all notices <ArrowUpRight size={15}/></button></div>
          </section>
          <section className="lower-grid"><div className="panel quick-panel"><div className="panel-heading"><div><h2>Quick actions</h2><p>Jump into common tasks</p></div></div><div className="quick-grid">{quick.map(([label,Icon,target])=><button className="quick-action" key={label} onClick={()=>setActive(target)}><span><Icon size={19}/></span><b>{label}</b><ChevronRight size={16}/></button>)}</div></div>
            <div className="panel attendance-panel"><div className="panel-heading"><div><h2>Attendance snapshot</h2><p>Today's overall attendance</p></div><button className="dots" onClick={()=>setActive("Attendance")}><ArrowUpRight size={17}/></button></div><div className="attendance-content"><div className="big-donut"><div className="donut" style={{background:"conic-gradient(#16b88a 0 82%, #ff6b75 82% 93%, #ffb547 93% 100%)"}}><div className="donut-hole"><b>82%</b><small>Present</small></div></div></div><div className="attendance-legend">{attendance.map(a=><div key={a.name}><span><i style={{background:a.color}}/>{a.name}</span><b>{a.value}%</b></div>)}</div></div></div>
          </section>
        </>: active==="Students" ? <section className="panel table-panel"><div className="panel-heading"><div><h2>Student directory</h2><p>{students.length} students in this demo list</p></div><button className="primary-btn" onClick={()=>setShowAdd(!showAdd)}><Plus size={17}/> Add student</button></div>{showAdd&&<div className="add-form">{Object.keys(newStudent).map(k=><input key={k} placeholder={k==="rollNo"?"Roll number":k[0].toUpperCase()+k.slice(1)} value={newStudent[k]} onChange={e=>setNewStudent({...newStudent,[k]:e.target.value})}/>)}<button className="primary-btn" onClick={addStudent}>Save student</button></div>}<div className="table-scroll"><table><thead><tr><th>Student</th><th>Roll number</th><th>Course</th><th>Semester</th><th>Email</th></tr></thead><tbody>{filtered.map(s=><tr key={s.rollNo}><td><b>{s.name}</b></td><td>{s.rollNo}</td><td>{s.course}</td><td>{s.semester}</td><td>{s.email||"—"}</td></tr>)}</tbody></table></div></section>
        : active==="AI Assistant" ? <AIChat/> : <ModuleCRUD key={active} name={active}/> }
        <footer>© 2026 CampusFlow · College Management System <span>Made for smarter campus operations</span></footer>
      </div>
    </main>
  </div>
}
function Stat({title,value,change,icon:Icon,tint,note}){return <div className="stat-card"><div className={`stat-icon ${tint}`}><Icon size={21}/></div><div className="stat-title">{title}</div><div className="stat-value">{value}</div><div className="stat-bottom"><span className="positive"><TrendingUp size={13}/>{change}</span><small>{note}</small></div></div>}
export default App;
