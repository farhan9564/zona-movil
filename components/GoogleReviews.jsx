'use client';
import {useState} from 'react';
import {ArrowUpRight,ChevronDown,Star,ExternalLink,Pause,Play} from 'lucide-react';
import {selectedGoogleReviews} from '../lib/static-google-reviews';
import {googleProfile} from '../lib/google-reviews.mjs';
function Stars({rating}){return <span className="google-stars" aria-label={rating+' de 5 estrellas'}>{[1,2,3,4,5].map(i=><Star key={i} size={17} aria-hidden="true" fill={i<=Math.round(rating)?'currentColor':'none'}/>)}</span>}
function Attribution(){return <span className="google-attribution" translate="no">Google Maps</span>}
function Review({review}){return <article className="google-review-card"><div className="google-card-top"><Attribution/><Stars rating={review.rating}/></div>{review.text?<div lang={review.language} dir="auto">{review.text.length>230?<details className="google-review-full"><summary><span>{review.text.slice(0,230)}…</span><b>Leer reseña completa <ChevronDown size={14}/></b></summary><p>{review.text}</p></details>:<p className="google-review-text">{review.text}</p>}</div>:<p className="google-review-text">Valoración sin comentario.</p>}<div className="google-review-author"><span className="review-initial" aria-hidden="true">{review.name.slice(0,1).toUpperCase()}</span><div><strong>{review.name}</strong><small>{review.translated?'Traducción de Google · EN':'Reseña de Google'}{review.excerpt?' · Extracto':''}</small></div></div><a className="google-source" href={googleProfile} target="_blank" rel="noopener noreferrer">Ver ficha en Google Maps <ExternalLink size={12}/></a></article>}
export default function GoogleReviews(){
 const [paused,setPaused]=useState(false);
 const data={available:true,profile:googleProfile,rating:4.7,count:17,reviews:selectedGoogleReviews,attributions:[]};
 const available=!!(data?.available&&data.reviews?.length),profile=data?.profile||googleProfile;
 return <section className={'google-reviews-section '+(!available?'google-reviews-unavailable':'')} id="opiniones" dir="ltr" aria-labelledby="google-reviews-title">
 {!available?<div className="section google-review-compact"><div><span className="eyebrow">RESEÑAS SELECCIONADAS</span><h2 id="google-reviews-title">Tu experiencia en Zona Móvil cuenta.</h2><p>{!data?'Cargando opiniones de Google…':'Consulta las reseñas de nuestra tienda en Google Maps.'}</p></div><a className="button blue" href={profile} target="_blank" rel="noopener noreferrer">Ver opiniones en Google <ArrowUpRight size={17}/></a></div>:
 <div className="section google-reviews-layout">
  <div className="google-reviews-intro"><span className="eyebrow">RESEÑAS SELECCIONADAS</span><h2 id="google-reviews-title">¿Qué dicen<br/>de <span>Zona Móvil?</span></h2><p>Experiencias de quienes nos visitan en Castelldefels. Conoce sus opiniones en Google Maps.</p>
   <div className="google-rating-panel">{data.rating!==null&&<strong>{data.rating.toLocaleString('es-ES',{maximumFractionDigits:1})}<small>/ 5</small></strong>}<div>{data.rating!==null&&<Stars rating={data.rating}/>}<p>{data.count.toLocaleString('es-ES')} valoraciones en <Attribution/></p></div></div>
   <div className="google-review-actions"><a className="button outline" href={profile} target="_blank" rel="noopener noreferrer">Ver todas las reseñas <ArrowUpRight size={17}/></a>{data.writeUrl&&<a className="button blue" href={data.writeUrl} target="_blank" rel="noopener noreferrer">Escribir una reseña</a>}</div>
   <p className="google-review-note">Selección de 14 reseñas facilitadas por la tienda. Puntuación y total de Google según las capturas del 23/10/2026. Sin actualización automática.</p>
   <button type="button" className="google-motion-toggle" aria-pressed={paused} onClick={()=>setPaused(v=>!v)}>{paused?<Play size={15}/>:<Pause size={15}/>} {paused?'Activar movimiento':'Pausar y leer reseñas'}</button>
  </div>
  <div className={'google-review-wall '+(paused?'is-paused':'')} aria-label="Reseñas de Google Maps">
   <div className="google-review-columns">{[0,1].map(column=>{const reviews=data.reviews.filter((_,i)=>i%2===column);if(!reviews.length)return null;return <div className={'google-review-lane lane-'+column} key={column}><div className="google-review-track">{[0,1].map(copy=><div className="google-review-group" key={copy} aria-hidden={copy===1?true:undefined} inert={copy===1?true:undefined}>{reviews.map((r,i)=><Review key={r.name+i} review={r}/>)}</div>)}</div></div>})}</div>
   <div className="google-wall-credit"><Attribution/>{data.attributions.map((a,i)=><a key={i} href={a.url} target="_blank" rel="noopener noreferrer">{a.name}</a>)}</div>
  </div>
 </div>}
 </section>
}
