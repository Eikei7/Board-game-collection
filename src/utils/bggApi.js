import axios from 'axios';
import { parseStringPromise } from 'xml2js';

// IMPORTANT: Get your token from BGG after registration
// Store it in .env.local file as REACT_APP_BGG_API_TOKEN
const BGG_API_TOKEN = import.meta.env.VITE_BGG_API_TOKEN || '';
const BGG_API_BASE = 'https://boardgamegeek.com/xmlapi2';

const getHeaders = () => {
  const headers = {};
  if (BGG_API_TOKEN) {
    headers['Authorization'] = `Bearer ${BGG_API_TOKEN}`;
  }
  return headers;
};

export const searchGames = async (query) => {
  try {
    const response = await axios.get(`${BGG_API_BASE}/search`, {
      params: { 
        query, 
        type: 'boardgame',
        exact: 0 // 0 for fuzzy search, 1 for exact match
      },
      headers: getHeaders()
    });
    
    const result = await parseStringPromise(response.data);
    
    if (result.items && result.items.item) {
      return result.items.item.map(item => ({
        id: item.$.id,
        name: item.name ? item.name[0].$.value : 'Unknown',
        type: item.$.type,
        yearpublished: item.yearpublished ? item.yearpublished[0].$.value : ''
      }));
    }
    return [];
  } catch (error) {
    console.error('Error searching games:', error);
    if (error.response?.status === 401) {
      console.error('API Token missing or invalid. Register at: https://boardgamegeek.com/applications');
    }
    return getMockGames(query); // Fallback during development
  }
};

export const getGameDetails = async (gameIds) => {
  try {
    const ids = Array.isArray(gameIds) ? gameIds.join(',') : gameIds;
    
    const response = await axios.get(`${BGG_API_BASE}/thing`, {
      params: {
        id: ids,
        stats: 1, // Include rating statistics
        videos: 0, // Exclude videos to reduce payload
        marketplace: 0,
        comments: 0
      },
      headers: getHeaders()
    });
    
    const result = await parseStringPromise(response.data);
    
    if (result.items && result.items.item) {
      const games = Array.isArray(result.items.item) 
        ? result.items.item 
        : [result.items.item];
      
      return games.map(game => ({
        id: game.$.id,
        name: getPrimaryName(game.name),
        description: game.description ? game.description[0] : '',
        yearpublished: game.yearpublished ? game.yearpublished[0].$.value : '',
        minplayers: game.minplayers ? game.minplayers[0].$.value : '',
        maxplayers: game.maxplayers ? game.maxplayers[0].$.value : '',
        minplaytime: game.minplaytime ? game.minplaytime[0].$.value : '',
        maxplaytime: game.maxplaytime ? game.maxplaytime[0].$.value : '',
        thumbnail: game.thumbnail ? game.thumbnail[0] : '',
        image: game.image ? game.image[0] : '',
        rating: game.statistics ? game.statistics[0].ratings[0].average[0].$.value : 'N/A',
        categories: extractValues(game.link, 'boardgamecategory'),
        mechanics: extractValues(game.link, 'boardgamemechanic')
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching game details:', error);
    return [];
  }
};


export const getUserCollection = async (username) => {
  try {
    const response = await axios.get(`${BGG_API_BASE}/collection`, {
      params: {
        username,
        stats: 1,
        own: 1 // Only get games they own
      },
      headers: getHeaders()
    });
    
    const result = await parseStringPromise(response.data);
    return result;
  } catch (error) {
    console.error('Error fetching user collection:', error);
    return null;
  }
};

const getPrimaryName = (names) => {
  if (!names) return 'Unknown';
  const primary = names.find(name => name.$.type === 'primary');
  return primary ? primary.$.value : names[0].$.value;
};

const extractValues = (links, type) => {
  if (!links) return [];
  return links
    .filter(link => link.$.type === type)
    .map(link => link.$.value);
};

const getMockGames = (query) => {
  const mockGames = [
    {
      id: '174430',
      name: 'Gloomhaven',
      type: 'boardgame',
      yearpublished: '2017'
    },
    {
      id: '169786',
      name: 'Scythe',
      type: 'boardgame', 
      yearpublished: '2016'
    },
    {
      id: '167791',
      name: 'Terraforming Mars',
      type: 'boardgame',
      yearpublished: '2016'
    },
    {
      id: '224517',
      name: 'Wingspan',
      type: 'boardgame',
      yearpublished: '2019'
    },
    {
      id: '266192',
      name: 'Gloomhaven: Jaws of the Lion',
      type: 'boardgame',
      yearpublished: '2020'
    }
  ];
  
  if (!query) return mockGames;
  
  return mockGames.filter(game => 
    game.name.toLowerCase().includes(query.toLowerCase())
  );
};