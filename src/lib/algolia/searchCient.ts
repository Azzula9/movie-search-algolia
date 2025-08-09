import { liteClient as algoliasearch } from 'algoliasearch/lite';
import 'dotenv'

const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
const apiKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY;

if(!appId || !apiKey){
    throw new Error('algolia app id or api key is missing...');
}

export const searchClient = algoliasearch(appId, apiKey);