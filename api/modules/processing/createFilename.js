export default function(f, template, isAudioOnly, isAudioMuted) {
    let filename = '';

    switch(template) {
        default:
        case "classic":
            // youtube_MMK3L4W70g4_1920x1080_h264_mute.mp4
            // youtube_MMK3L4W70g4_audio.mp3
            filename += `${f.service}_${f.id}`;
            if (!isAudioOnly) {
                if (f.resolution) filename += `_${f.resolution}`;
                if (f.youtubeFormat) filename += `_${f.youtubeFormat}`;
                if (!isAudioMuted && f.youtubeDubName) filename += `_${f.youtubeDubName}`;
                if (isAudioMuted) filename += '_mute';
                filename += `.${f.extension}`
            } else {
                filename += `_audio`;
                if (f.youtubeDubName) filename += `_${f.youtubeDubName}`;
            }
            break;
        case "pretty":
            // Loossemble (루셈블) - 'Sensitive' MV (1080p, h264, mute, youtube).mp4
            // How secure is 256 bit security? - 3Blue1Brown (es, youtube).mp3
            filename += `${f.title} `;
            if (!isAudioOnly) {
                filename += '('
                if (f.qualityLabel) filename += `${f.qualityLabel}, `;
                if (f.youtubeFormat) filename += `${f.youtubeFormat}, `;
                if (!isAudioMuted && f.youtubeDubName) filename += `${f.youtubeDubName}, `;
                if (isAudioMuted) filename += 'mute, ';
                filename += `${f.service}`;
                filename += ')';
                filename += `.${f.extension}`
            } else {
                filename += `- ${f.author} (`;
                if (f.youtubeDubName) filename += `${f.youtubeDubName}, `;
                filename += `${f.service})`
            }
            break;
        case "basic":
            // Loossemble (루셈블) - 'Sensitive' MV (1080p, h264, ru).mp4
            // How secure is 256 bit security? - 3Blue1Brown (es).mp3
            filename += `${f.title} `;
            if (!isAudioOnly) {
                filename += '('
                if (f.qualityLabel) filename += `${f.qualityLabel}, `;
                if (f.youtubeFormat) filename += `${f.youtubeFormat}`;
                if (!isAudioMuted && f.youtubeDubName) filename += `, ${f.youtubeDubName}`;
                if (isAudioMuted) filename += ', mute';
                filename += ')';
                filename += `.${f.extension}`
            } else {
                filename += `- ${f.author}`;
                if (f.youtubeDubName) filename += ` (${f.youtubeDubName})`;
            }
            break;
        case "nerdy":
            // Loossemble (루셈블) - 'Sensitive' MV (1080p, h264, ru, youtube, MMK3L4W70g4).mp4
            // Loossemble (루셈블) - 'Sensitive' MV - Loossemble (ru, youtube, MMK3L4W70g4).mp4
            filename += `${f.title} `;
            if (!isAudioOnly) {
                filename += '('
                if (f.qualityLabel) filename += `${f.qualityLabel}, `;
                if (f.youtubeFormat) filename += `${f.youtubeFormat}, `;
                if (!isAudioMuted && f.youtubeDubName) filename += `${f.youtubeDubName}, `;
                if (isAudioMuted) filename += 'mute, ';
                filename += `${f.service}, ${f.id}`;
                filename += ')'
                filename += `.${f.extension}`
            } else {
                filename += `- ${f.author} (`;
                if (f.youtubeDubName) filename += `${f.youtubeDubName}, `;
                filename += `${f.service}, ${f.id})`
            }
            break;
    }
    return filename.replace(' ,', '').replace(', )', ')').replace(',)', ')')
}
