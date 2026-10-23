import {googleProfile,normalizeGoogleReviews} from '../../../lib/google-reviews.mjs';
export const dynamic='force-dynamic';
const respond=(data)=>Response.json(data,{headers:{'Cache-Control':'no-store'}});
export async function GET(){
 const key=process.env.GOOGLE_PLACES_API_KEY,placeId=process.env.GOOGLE_PLACE_ID;
 if(!key||!placeId||!/^[-\w]+$/.test(placeId))return respond({available:false,profile:googleProfile});
 try{
  const res=await fetch('https://places.googleapis.com/v1/places/'+encodeURIComponent(placeId)+'?languageCode=es',{headers:{'X-Goog-Api-Key':key,'X-Goog-FieldMask':'rating,userRatingCount,reviews,googleMapsUri,attributions'},cache:'no-store',signal:AbortSignal.timeout(8000)});
  if(!res.ok){console.error('Google reviews request failed',res.status);return respond({available:false,profile:googleProfile})}
  const data=normalizeGoogleReviews(await res.json());
  return respond({...data,writeUrl:'https://search.google.com/local/writereview?placeid='+encodeURIComponent(placeId)});
 }catch{console.error('Google reviews unavailable');return respond({available:false,profile:googleProfile})}
}
