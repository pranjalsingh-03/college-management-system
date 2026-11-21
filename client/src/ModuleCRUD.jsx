
import React,{useEffect,useMemo,useState} from "react";
import {Plus, Pencil, Trash2, Save, X, RefreshCw, Search} from "lucide-react";
import {PieChart,Pie,Cell,ResponsiveContainer,Tooltip,Legend} from "recharts";
const specs={
 "Teachers":{id:"teachers",fields:["name","employeeId","department","subject","email","phone"]},
 "Classes":{id:"classes",fields:["name","section","course","semester","room","classTeacher"]},
 "Subjects":{id:"subjects",fields:["name","code","course","semester","teacher","credits"]},
 "Attendance":{id:"attendance",fields:["studentName","rollNo","className","date","status"]},
 "Fees & Finance":{id:"fees",fields:["studentName","rollNo","amount","dueDate","status","paymentMode"]},
 "Homework":{id:"homework",fields:["title","subject","className","dueDate","description","status"]},
 "Timetable":{id:"timetable",fields:["day","className","subject","teacher","startTime","endTime","room"]},
 "Notice Board":{id:"notices",fields:["title","category","date","description"]},
 "Messages":{id:"messages",fields:["sender","recipient","subject","message","date"]},
 "Exams & Results":{id:"exams",fields:["name","subject","className","date","maxMarks","obtainedMarks","studentName"]},
 "Study Material":{id:"materials",fields:["title","subject","className","type","url","description"]}
};
const labels={employeeId:"Employee ID",classTeacher:"Class teacher",className:"Class",rollNo:"Roll number",dueDate:"Due date",startTime:"Start time",endTime:"End time",maxMarks:"Maximum marks",obtainedMarks:"Marks obtained",studentName:"Student name",paymentMode:"Payment mode"};
const title=k=>labels[k]||k.replace(/([A-Z])/g," $1").replace(/^./,x=>x.toUpperCase());
const choices={
 status:{attendance:["Present","Absent","Leave"],fees:["Pending","Paid","Overdue"],homework:["Assigned","Submitted","Checked"]},
 day:["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
 category:["General","Academic","Event","Urgent"],
 type:["PDF","Notes","Video","Link","Other"],
 paymentMode:["Cash","UPI","Card","Bank transfer"]
};
function Field({field,module,value,onChange}){
 const opts=field==="status"?(choices.status[module]||[]):choices[field];
 const inputType=/date/i.test(field)?"date":/^(startTime|endTime)$/.test(field)?"time":/^(amount|credits|maxMarks|obtainedMarks)$/.test(field)?"number":"text";
 return <label className="crud-field"><span>{title(field)}</span>{opts?<select value={value||""} onChange={e=>onChange(field,e.target.value)}><option value="">Select {title(field)}</option>{opts.map(o=><option key={o}>{o}</option>)}</select>:field==="description"||field==="message"?<textarea rows="3" value={value||""} onChange={e=>onChange(field,e.target.value)}/>:<input type={inputType} value={value||""} onChange={e=>onChange(field,e.target.value)} placeholder={`Enter ${title(field).toLowerCase()}`}/>}</label>;
}
export default function ModuleCRUD({name}){
 const spec=specs[name], [rows,setRows]=useState([]),[form,setForm]=useState(null),[editing,setEditing]=useState(null),[busy,setBusy]=useState(false),[error,setError]=useState(""),[query,setQuery]=useState("");
 const base=`http://localhost:5000/api/modules/${spec.id}`;
 async function load(){
  setBusy(true);setError("");
  try{const r=await fetch(base);const d=await r.json();if(!r.ok)throw Error(d.message||"Could not load records");setRows(d);}
  catch(e){setError("Backend or MongoDB unavailable: "+e.message);}
  finally{setBusy(false);}
 }
 useEffect(()=>{setForm(null);setEditing(null);setQuery("");load();},[name]);
 function add(){setEditing(null);setForm(Object.fromEntries(spec.fields.map(k=>[k,""])));}
 function edit(row){setEditing(row._id);setForm(Object.fromEntries(spec.fields.map(k=>[k,row[k]||""])));}
 async function save(e){
  e.preventDefault();setBusy(true);setError("");
  try{
   const r=await fetch(editing?`${base}/${editing}`:base,{method:editing?"PUT":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});
   const d=await r.json();if(!r.ok)throw Error(d.message||"Save failed");
   setForm(null);setEditing(null);await load();
  }catch(e){setError(e.message)}finally{setBusy(false)}
 }
 async function remove(row){
  if(!window.confirm("Delete this record permanently?"))return;
  setBusy(true);setError("");
  try{const r=await fetch(`${base}/${row._id}`,{method:"DELETE"});if(!r.ok){const d=await r.json();throw Error(d.message)}await load();}
  catch(e){setError(e.message)}finally{setBusy(false)}
 }
 const filtered=useMemo(()=>rows.filter(row=>spec.fields.some(k=>String(row[k]||"").toLowerCase().includes(query.toLowerCase()))),[rows,query,name]);
 const counts={Present:0,Absent:0,Leave:0};
 if(spec.id==="attendance")rows.forEach(r=>{if(r.status in counts)counts[r.status]++});
 const total=Object.values(counts).reduce((a,b)=>a+b,0);
 const data=Object.entries(counts).map(([name,value])=>({name,value,percent:total?Math.round(value*100/total):0}));
 const colors=["#16b88a","#ff6b75","#ffb547"];
 return <section className="panel crud-panel">
  <div className="crud-toolbar"><div><h2>{name} records</h2><p>Add, edit and delete records stored in MongoDB · {rows.length} total</p></div><div className="crud-buttons"><button onClick={load} title="Refresh" disabled={busy}><RefreshCw size={17}/></button><button className="primary-btn" onClick={add}><Plus size={17}/> Add {name==="Fees & Finance"?"fee":name==="Attendance"?"attendance":name==="Exams & Results"?"exam":name==="Study Material"?"material":"record"}</button></div></div>
  {error&&<div className="crud-error">{error}. Check your backend terminal and server/.env MONGO_URI.</div>}
  {spec.id==="attendance"&&<div className="crud-attendance"><div className="crud-pie">{total?<ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data} dataKey="value" nameKey="name" innerRadius={63} outerRadius={91} paddingAngle={2}>{data.map((d,i)=><Cell key={d.name} fill={colors[i]}/>)}</Pie><Tooltip/><Legend/></PieChart></ResponsiveContainer>:<div className="crud-empty-circle">No attendance<br/>records yet</div>}</div><div className="crud-attendance-numbers">{data.map((d,i)=><div key={d.name}><span style={{color:colors[i]}}>{d.percent}%</span><small>{d.name} ({d.value})</small></div>)}</div></div>}
  {form&&<form className="crud-form" onSubmit={save}><div className="crud-form-head"><h3>{editing?"Edit":"Add"} {name} record</h3><button type="button" onClick={()=>setForm(null)}><X size={18}/></button></div><div className="crud-form-grid">{spec.fields.map(field=><Field key={field} field={field} module={spec.id} value={form[field]} onChange={(k,v)=>setForm(f=>({...f,[k]:v}))}/>)}</div><div className="crud-form-actions"><button type="button" onClick={()=>setForm(null)}>Cancel</button><button className="primary-btn" disabled={busy} type="submit"><Save size={16}/> Save record</button></div></form>}
  <div className="crud-search"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={`Search ${name.toLowerCase()} records...`}/></div>
  <div className="table-scroll"><table><thead><tr>{spec.fields.map(f=><th key={f}>{title(f)}</th>)}<th>Actions</th></tr></thead><tbody>{filtered.map(row=><tr key={row._id}>{spec.fields.map(f=><td key={f}>{f==="url"&&/^https?:\/\//.test(row[f]||"")?<a href={row[f]} target="_blank" rel="noopener noreferrer">Open link</a>:row[f]||"—"}</td>)}<td><div className="crud-row-actions"><button title="Edit" onClick={()=>edit(row)}><Pencil size={15}/></button><button title="Delete" onClick={()=>remove(row)}><Trash2 size={15}/></button></div></td></tr>)}</tbody></table>{!filtered.length&&<p className="crud-empty">{busy?"Loading records...":rows.length?"No matching records.":"No records yet. Click Add to create your first record."}</p>}</div>
 </section>;
}
