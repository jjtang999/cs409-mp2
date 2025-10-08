import axios from 'axios';
import CryptoJS from 'crypto-js';
import { MarvelApiResponse } from '../types/marvel';

const MARVEL_API_BASE_URL = 'https://gateway.marvel.com/v1/public';
const PUBLIC_KEY = '733ff2e5bb73aac4328772e99d23d0b0';
const PRIVATE_KEY = '5cd6cf140ab3a93966f8040f9059124baa51d407';

// Generate proper authentication parameters for Marvel API
const generateAuthParams = () => {
  const timestamp = Date.now().toString();
  const hash = CryptoJS.MD5(timestamp + PRIVATE_KEY + PUBLIC_KEY).toString();
  
  return {
    ts: timestamp,
    apikey: PUBLIC_KEY,
    hash: hash
  };
};

export const marvelApi = {
  getCharacters: async (params: {
    nameStartsWith?: string;
    limit?: number;
    offset?: number;
    orderBy?: string;
  } = {}): Promise<MarvelApiResponse> => {
    const authParams = generateAuthParams();
    const response = await axios.get(`${MARVEL_API_BASE_URL}/characters`, {
      params: {
        ...authParams,
        limit: params.limit || 50, // Default to 50 characters
        offset: params.offset || 0,
        orderBy: params.orderBy || 'name',
        ...(params.nameStartsWith && { nameStartsWith: params.nameStartsWith }),
      },
    });
    return response.data;
  },

  getCharacterById: async (id: number): Promise<MarvelApiResponse> => {
    const authParams = generateAuthParams();
    const response = await axios.get(`${MARVEL_API_BASE_URL}/characters/${id}`, {
      params: authParams,
    });
    return response.data;
  },
};
