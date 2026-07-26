import { YoutubeTranscript } from "youtube-transcript";

const extractYoutube = async(url)=>{

    const transcript =
    await YoutubeTranscript.fetchTranscript(url);

    return transcript
    .map(line=>line.text)
    .join(" ");

}

export default extractYoutube;