export function getIdVideoYoutube(url: string) {
    let videoId = ''
    if (url.includes('youtu')) {
        if (url.includes('watch')) {
            // url example https://www.youtube.com/watch?v=SCM0xI64Peo
            const idConvert = url.split('=')?.[1];
            videoId = `http://img.youtube.com/vi/${idConvert}/hqdefault.jpg`
        } else {
            // url example https://youtu.be/_MZ5y8wMAEk?si=GLhVAnNzifan0hJ3o
            // http://img.youtube.com/vi/[video-id]/hqdefault.jpg
            const idConvert = url.split('/')?.[3].split('?')?.[0];
            videoId = `http://img.youtube.com/vi/${idConvert}/hqdefault.jpg`
        }
        return videoId
    }else{
        videoId = url
    }
    return videoId
}