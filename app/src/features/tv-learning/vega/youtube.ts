import type {Playback} from './playback';

/** The app's installed package identity, following YouTube's WebView guidance. */
export const youtubeIdentity = 'https://com.arenavoca.tv';

export function youtubePlayerSource(pageUrl: string, restore: number) {
  if (!/^(https:\/\/[^\s/@?#]+|http:\/\/10\.0\.2\.2(?::\d+)?)(\/[^\s#]*)?$/.test(pageUrl)) {
    throw new Error('Use HTTPS for the player page, or the Vega emulator host for local testing.');
  }
  const position = Number.isFinite(restore) ? Math.max(0, Math.min(36, restore)) : 0;
  return {uri: pageUrl + '#position=' + position, headers: {Referer: youtubeIdentity + '/'}};
}

export function readYouTubePlayback(data: string, duration: number): Playback | null {
  try {
    const value = JSON.parse(data);
    if (value.type !== 'playback' || !Number.isFinite(value.position) ||
        typeof value.paused !== 'boolean' || typeof value.ended !== 'boolean') return null;
    return {position: Math.max(0, Math.min(duration, value.position)),
      paused: value.paused, ended: value.ended, ready: true};
  } catch { return null; }
}

export function youtubePlayerHtml(videoId: string, start: number, duration: number, restore: number) {
  if (!/^[A-Za-z0-9_-]{11}$/.test(videoId)) throw new Error('Invalid YouTube video id');
  const config = JSON.stringify({videoId, start, duration,
    restore: Math.max(0, Math.min(duration, restore)), identity: youtubeIdentity});
  return `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="referrer" content="strict-origin-when-cross-origin">
<base href="${youtubeIdentity}/">
<style>html,body{margin:0;width:100%;height:100%;background:#000;overflow:hidden}#player{width:100%;height:100%}</style>
</head><body><div id="player"></div><script>
const config=${config};let player,ready=false;
if(location.protocol==='https:'||location.protocol==='http:'){
  const saved=Number(new URLSearchParams(location.hash.slice(1)).get('position'));
  if(Number.isFinite(saved))config.restore=Math.max(0,Math.min(config.duration,saved));
}
function send(value){if(window.ReactNativeWebView)window.ReactNativeWebView.postMessage(JSON.stringify(value));}
function observe(){
  if(!ready)return;
  const absolute=player.getCurrentTime(),state=player.getPlayerState();
  if(!Number.isFinite(absolute)||state<0||state===5)return;
  send({type:'playback',position:absolute-config.start,sourceSeconds:absolute,buffering:state===3,
    paused:state!==1&&state!==3,ended:state===0});
}
window.onYouTubeIframeAPIReady=function(){
  player=new YT.Player('player',{width:'100%',height:'100%',videoId:config.videoId,
    playerVars:{autoplay:0,controls:1,playsinline:1,fs:0,
      start:Math.floor(config.start+config.restore),end:config.start+config.duration,
      origin:location.origin,widget_referrer:config.identity},
    events:{onReady:function(){
      player.cueVideoById({videoId:config.videoId,startSeconds:config.start+config.restore,endSeconds:config.start+config.duration});
      ready=true;send({type:'ready'});observe();},
      onStateChange:observe,onError:function(event){send({type:'error',code:event.data});}}});
};
window.arenaCommand=function(command){
  if(!ready)return;
  if(command==='pause')player.pauseVideo();
  if(command==='toggle'){
    if(player.getPlayerState()===0)player.loadVideoById({videoId:config.videoId,startSeconds:config.start,endSeconds:config.start+config.duration});
    else if(player.getPlayerState()===1||player.getPlayerState()===3)player.pauseVideo();else player.playVideo();
  }
  if(command==='restart')player.loadVideoById({videoId:config.videoId,startSeconds:config.start,endSeconds:config.start+config.duration});
};
setInterval(observe,250);
const script=document.createElement('script');script.src='https://www.youtube.com/iframe_api';
script.onerror=function(){send({type:'error',code:'network'});};document.head.appendChild(script);
</script></body></html>`;
}

export function youtubeError(code: unknown) {
  if (code === 101 || code === 150) return 'The publisher does not allow this video in an embedded player.';
  if (code === 100) return 'This YouTube video is unavailable.';
  if (code === 153) return 'YouTube could not verify this embedded player.';
  return 'YouTube could not load the match. Check your connection or try the original animation.';
}
