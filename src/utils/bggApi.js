import axios from 'axios';

const BGG_API_BASE = 'https://boardgamegeek.com/xmlapi2';

export const getBggApiToken = () => String(import.meta.env.VITE_BGG_API_TOKEN ?? '').trim();

export const ensureBggApiToken = (token = getBggApiToken()) => {
  if (!token || !String(token).trim()) {
    throw new Error('Missing VITE_BGG_API_TOKEN. Add a BoardGameGeek API token before searching games.');
  }

  return token;
};

export const getApiErrorMessage = (error) => {
  if (!error) return 'The BoardGameGeek service is unavailable right now.';

  if (error.code === 'ERR_NETWORK') {
    return 'BoardGameGeek is temporarily unavailable. Please try again in a moment.';
  }

  if (error.response?.status === 401) {
    return 'The BoardGameGeek token is invalid or expired. Please update the API token.';
  }

  if (error.response?.status === 429) {
    return 'BoardGameGeek is rate-limiting requests due to too many requests. Please wait a moment and try again.';
  }

  if (error.response?.status >= 500) {
    return 'BoardGameGeek is currently experiencing server issues. Please try again later.';
  }

  return 'Something went wrong while loading BoardGameGeek data. Please try again.';
};

const apiClient = axios.create({
  baseURL: BGG_API_BASE,
  headers: {
    'Authorization': `Bearer ${getBggApiToken()}`
  }
});

/**
 * Parse XML response using DOMParser (browser-native)
 * @param {string} xmlString - The XML string to parse
 * @returns {Document} Parsed XML document
 */
const parseXML = (xmlString) => {
  const parser = new DOMParser();
  return parser.parseFromString(xmlString, 'application/xml');
};

export const getRankedSearchResults = (query, results = []) => {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return [];
  }

  return [...results]
    .filter((game) => {
      const name = String(game?.name ?? '').toLowerCase();
      return name.includes(normalizedQuery);
    })
    .sort((a, b) => {
      const aName = String(a.name ?? '').toLowerCase();
      const bName = String(b.name ?? '').toLowerCase();

      const aExact = aName === normalizedQuery ? 0 : aName.startsWith(normalizedQuery) ? 1 : 2;
      const bExact = bName === normalizedQuery ? 0 : bName.startsWith(normalizedQuery) ? 1 : 2;

      if (aExact !== bExact) {
        return aExact - bExact;
      }

      return aName.localeCompare(bName);
    });
};

export const formatSearchFeedback = (query, count) => {
  const trimmedQuery = String(query ?? '').trim();

  if (!trimmedQuery) {
    return '';
  }

  if (count === 0) {
    return `No games found for "${trimmedQuery}".`;
  }

  return `Showing ${count} result${count === 1 ? '' : 's'} for "${trimmedQuery}".`;
};

/**
 * @param {string} query
 * @returns {Promise<Array>}
 */
export const searchGames = async (query) => {
  try {
    ensureBggApiToken();

    const response = await apiClient.get('/search', {
      params: {
        query,
        type: 'boardgame',
        exact: 0
      }
    });

    if (!response || !response.data) {
      throw new Error('Empty response from BoardGameGeek.');
    }

    const xmlDoc = parseXML(response.data);
    const items = xmlDoc.querySelectorAll('item');
    const results = [];

    items.forEach(item => {
      const id = item.getAttribute('id');
      const nameElement = item.querySelector('name');
      const name = nameElement ? nameElement.getAttribute('value') : 'Unknown';
      const yearElement = item.querySelector('yearpublished');
      const yearpublished = yearElement ? yearElement.getAttribute('value') : 'N/A';

      results.push({
        id,
        name,
        yearpublished
      });
    });

    return results;
  } catch (error) {
    const message = error instanceof Error && error.message.includes('VITE_BGG_API_TOKEN')
      ? error.message
      : getApiErrorMessage(error);

    console.error('Error searching games:', error);
    throw new Error(message);
  }
};

/**
 * Get detailed information about specific games
 * @param {string|string[]} gameIds - Single game ID or array of game IDs
 * @returns {Promise<Array>} Array of detailed game objects
 */
export const getGameDetails = async (gameIds) => {
  try {
    ensureBggApiToken();

    const ids = Array.isArray(gameIds) ? gameIds.join(',') : gameIds;

    if (!ids || !String(ids).trim()) {
      return [];
    }

    const response = await apiClient.get('/thing', {
      params: {
        id: ids,
        stats: 1
      }
    });

    if (!response || !response.data) {
      return [];
    }

    const xmlDoc = parseXML(response.data);
    const items = xmlDoc.querySelectorAll('item');
    const results = [];

    items.forEach(item => {
      const id = item.getAttribute('id');
      
      const nameElements = item.querySelectorAll('name');
      let name = 'Unknown';
      nameElements.forEach(el => {
        if (el.getAttribute('type') === 'primary') {
          name = el.getAttribute('value');
        }
      });

      const description = item.querySelector('description')?.textContent || '';

      const yearpublished = item.querySelector('yearpublished')?.getAttribute('value') || 'N/A';

      const minplayers = item.querySelector('minplayers')?.getAttribute('value') || '1';
      const maxplayers = item.querySelector('maxplayers')?.getAttribute('value') || '1';

      const minplaytime = item.querySelector('minplaytime')?.getAttribute('value') || '0';
      const maxplaytime = item.querySelector('maxplaytime')?.getAttribute('value') || '0';

      const thumbnail = item.querySelector('thumbnail')?.textContent || '';
      const image = item.querySelector('image')?.textContent || '';

      let rating = 'N/A';
      const avgRating = item.querySelector('average');
      if (avgRating) {
        rating = avgRating.getAttribute('value');
      }

      const categories = [];
      const mechanics = [];
      const links = item.querySelectorAll('link');

      links.forEach(link => {
        const type = link.getAttribute('type');
        const value = link.getAttribute('value');
        if (type === 'boardgamecategory') {
          categories.push(value);
        } else if (type === 'boardgamemechanic') {
          mechanics.push(value);
        }
      });

      results.push({
        id,
        name,
        description,
        yearpublished,
        minplayers,
        maxplayers,
        minplaytime,
        maxplaytime,
        thumbnail,
        image,
        rating,
        categories,
        mechanics
      });
    });

    return results;
  } catch (error) {
    const message = error instanceof Error && error.message.includes('VITE_BGG_API_TOKEN')
      ? error.message
      : getApiErrorMessage(error);

    console.error('Error fetching game details:', error);
    throw new Error(message);
  }
};