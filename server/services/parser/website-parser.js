import axios from "axios";
import * as cheerio from "cheerio";

const extractWebsite = async (url) => {

    const response = await axios.get(url);

    const $ = cheerio.load(response.data);

    $("script").remove();
    $("style").remove();

    return $("body").text();

}

export default extractWebsite;