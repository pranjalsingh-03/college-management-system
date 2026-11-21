import React, {useEffect,useMemo,useState} from "react";
import {Plus, Pencil, Trash2, Save, X, Search, RefreshCcw, ExternalLink} from "lucide-react";

const definitions = {
 "Teachers":[["name","Teacher name"],["employeeId","Employee ID"],["department","Department"],["subject","Subject"],["email","Email"],["phone","Phone"]],
 "Classes":[["name","Class name"],["section","Section"],["semester","Semester"],["room","Room"],["teacher","Class teacher"]],
 "Subjects":[["name","Subject name"],["code","Subject code"],["course","Course"],["semester","Semester"],["teacher","Teacher"]],
 "Attendance":[["student","Student name"],["rollNo","Roll number"],["className","Class"],["date","Date","date"],["status","Status","status"]],
 "Fees & Finance":[["student","Student name"],["rollNo","Roll number"],["amount","Amount (₹)","number"],["type","Fee type"],["dueDate","Due date","date"],["status","Payment status","payment"]],
 "Homework":[["title","Homework title"],["className","Class"],["subject","Subject"],["description","Description","textarea"],["dueDate","Due date","date"]],
 "Timetable":[["day","Day","day"],["className","Class"],["subject","Subject"],["teacher","Teacher"],["start","Start time","time"],["end","End time","time"],["room","Room"]],
 "Notice Board":[["title","Notice title"],["audience","Audience"],["message","Announcement","textarea"],["date","Date","date"]],
 "Messages":[["sender","From"],["recipient","To"],["subject","Subject"],["message","Message","textarea"],["date","Date","date"]],
 "Exams & Results":[["student","Student name"],["rollNo","Roll number"],["exam","Exam"],["subject","Subject"],["marks","Marks obtained","number"],["total","Maximum marks","number"],["date","Exam date","date"]],
 "Study Material":[["title","Material title"],["subject","Subject"],["className","Class"],["description","Description","textarea"],["url","File or resource URL","url"]]
};
const api="http://localhost:5000/api/records/";
function defaults(fields){return Object.fromEntries(fields.map(([k])=>[k,""]));}
export default function ManagementModule({module}){
 const fields=definitions[module]||[];
 const [records,setRecords]=useState([]),[form,setForm]=useState(defaults(fields)),[editing,setEditing]=useState(null);
 const [open,setOpen]=useState(false),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState(""),[query,setQuery]=useState("");
 const endpoint=api+encodeURIComponent(module);
 async function load(){
   setLoading(true);setError("");
   try{const r=await fetch(endpoint);const data=await r.json();if(!r.ok)throw Error(data.message||"Failed to load");setRecords(data);}
   catch(e){setError("Cannot load records: "+e.message+". Check MongoDB and the backend on port 5000.");}
   finally{setLoading(false);}
 }
 useEffect(()=>{load();},[module]);
 const filtered=useMemo(()=>records.filter(r=>Object.values(r.fields||{}).some(v=>String(v).toLowerCase().includes(query.toLowerCase()))),[records,query]);
 function add(){setForm(defaults(fields));setEditing(null);setOpen(true);setError("");}
 function edit(r){setForm({...defaults(fields),...r.fields});setEditing(r._id);setOpen(true);setError("");}
 async function submit(e){
  e.preventDefault();setBusy(true);setError("");
  try{
   const response=await fetch(editing?endpoint+"/"+editing:endpoint,{method:editing?"PUT":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({fields:form})});
   const result=await response.json();if(!response.ok)throw Error(result.message||"Save failed");
   setOpen(false);setEditing(null);await load();
  }catch(e){setError("Unable to save: "+e.message);}finally{setBusy(false);}
 }
 async function remove(r){
  if(!window.confirm("Delete this record permanently?"))return;
  try{const response=await fetch(endpoint+"/"+r._id,{method:"DELETE"});if(!response.ok)throw Error("Delete failed");await load();}
  catch(e){setError(e.message);}
 }
 const attendance=module==="Attendance";
 const counts={Present:records.filter(r=>r.fields.status==="Present").length,Absent:records.filter(r=>r.fields.status==="Absent").length,Leave:records.filter(r=>r.fields.status==="Leave").length};
 const total=records.length;
 return <section className="panel record-panel">
  <div className="panel-heading"><div><h2>{module} records</h2><p>Add, edit, search and delete {module.toLowerCase()} entries. Saved in MongoDB.</p></div><div className="record-buttons"><button className="record-refresh" onClick={load} title="Refresh"><RefreshCcw size={17}/></button><button className="primary-btn" onClick={add}><Plus size={17}/> Add {module==="Fees & Finance"?"fee":module==="Attendance"?"attendance":module==="Exams & Results"?"result":"record"}</button></div></div>
  {attendance&&<div className="record-attendance">{[["Present","#16b88a"],["Absent","#ff6b75"],["Leave","#ffb547"]].map(([name,color])=><div className="record-circle-card" key={name}><div className="record-circle" style={{background:`conic-gradient(${color} ${total?counts[name]/total*100:0}%, #e9edf5 0)`}}><div><b>{total?Math.round(counts[name]/total*100):0}%</b></div></div><strong>{name}</strong><small>{counts[name]} of {total} records</small></div>)}</div>}
  <div className="record-toolbar"><Search size={17}/><input placeholder={`Search ${module.toLowerCase()}...`} value={query} onChange={e=>setQuery(e.target.value)}/><span>{filtered.length} records</span></div>
  {error&&<div className="record-error">{error}</div>}
  {open&&<form className="record-form" onSubmit={submit}><div className="record-form-heading"><h3>{editing?"Edit":"Add"} {module} record</h3><button type="button" onClick={()=>setOpen(false)}><X size={18}/></button></div><div className="record-fields">{fields.map(([key,label,type])=><label key={key}>{label}{type==="textarea"?<textarea value={form[key]||""} onChange={e=>setForm({...form,[key]:e.target.value})} rows={3}/>:type==="status"||type==="payment"||type==="day"?<select value={form[key]||""} onChange={e=>setForm({...form,[key]:e.target.value})}><option value="">Select</option>{(type==="status"?["Present","Absent","Leave"]:type==="payment"?["Paid","Pending","Overdue"]:["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]).map(x=><option key={x}>{x}</option>)}</select>:<input type={type||"text"} value={form[key]||""} onChange={e=>setForm({...form,[key]:e.target.value})} required={key===fields[0][0]}/>}</label>)}</div><div className="record-form-actions"><button type="button" onClick={()=>setOpen(false)}>Cancel</button><button className="primary-btn" disabled={busy} type="submit"><Save size={16}/>{busy?"Saving...":"Save record"}</button></div></form>}
  <div className="table-scroll"><table className="records-table"><thead><tr>{fields.slice(0,5).map(([k,label])=><th key={k}>{label}</th>)}<th>Actions</th></tr></thead><tbody>{filtered.map(r=><tr key={r._id}>{fields.slice(0,5).map(([key])=><td key={key}>{key==="url"&&r.fields[key]?<a href={r.fields[key]} target="_blank" rel="noopener noreferrer">Open resource <ExternalLink size={12}/></a>:String(r.fields[key]||"—")}</td>)}<td><div className="record-row-actions"><button title="Edit" onClick={()=>edit(r)}><Pencil size={16}/></button><button title="Delete" onClick={()=>remove(r)}><Trash2 size={16}/></button></div></td></tr>)}</tbody></table>{!loading&&!filtered.length&&<div className="record-empty">No records found. Click Add to create your first entry.</div>}{loading&&<div className="record-empty">Loading records...</div>}</div>
  <p className="record-footnote">Development version: connect authentication and role permissions before using real college or student data. Study material currently accepts links, not direct file uploads.</p>
 </section>;
}
