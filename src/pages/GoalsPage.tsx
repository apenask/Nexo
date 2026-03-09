
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Goal = {
  id: string;
  name: string;
  target_amount: number;
  saved_amount: number;
  deadline?: string;
};

export function GoalsPage() {
  const [goals,setGoals]=useState<Goal[]>([]);
  const [name,setName]=useState("");
  const [target,setTarget]=useState("");

  async function load(){
    const {data}=await supabase.from("goals").select("*").order("created_at",{ascending:false});
    setGoals(data||[]);
  }

  useEffect(()=>{load()},[]);

  async function createGoal(){
    if(!name || !target) return;
    await supabase.from("goals").insert({
      name,
      target_amount:Number(target),
      saved_amount:0
    });
    setName("");setTarget("");
    load();
  }

  async function addMoney(id:string){
    const value=prompt("Quanto deseja adicionar?");
    if(!value) return;
    const g=goals.find(g=>g.id===id);
    if(!g) return;
    await supabase.from("goals")
      .update({saved_amount:g.saved_amount+Number(value)})
      .eq("id",id);
    load();
  }

  return (
    <div style={{padding:20}}>
      <h1>Metas</h1>

      <div style={{marginBottom:20}}>
        <input placeholder="Nome da meta" value={name} onChange={e=>setName(e.target.value)} />
        <input placeholder="Valor alvo" value={target} onChange={e=>setTarget(e.target.value)} />
        <button onClick={createGoal}>Criar meta</button>
      </div>

      {goals.map(g=>{
        const percent=Math.min(100,(g.saved_amount/g.target_amount)*100);
        return (
          <div key={g.id} style={{border:"1px solid #ddd",padding:15,marginBottom:10,borderRadius:10}}>
            <h3>{g.name}</h3>
            <div>R$ {g.saved_amount} / R$ {g.target_amount}</div>
            <div style={{background:"#eee",height:10,borderRadius:6,marginTop:6}}>
              <div style={{width:percent+"%",height:10,background:"#22c55e",borderRadius:6}}/>
            </div>
            <button onClick={()=>addMoney(g.id)} style={{marginTop:10}}>Adicionar dinheiro</button>
          </div>
        )
      })}
    </div>
  )
}
