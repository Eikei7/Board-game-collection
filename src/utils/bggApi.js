import axios from 'axios';

const BGG_API_BASE = 'https://boardgamegeek.com/xmlapi2';
const BGG_API_TOKEN = import.meta.env.VITE_BGG_API_TOKEN;

/**
 * Create axios instance with authorization header
 */
const apiClient = axios.create({
  baseURL: BGG_API_BASE,
  headers: {
    'Authorization': `Bearer ${BGG_API_TOKEN}`
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

/**
 * Search for board games by name
 * @param {string} query - The game name to search for
 * @returns {Promise<Array>} Array of game objects with id, name, and year published
 */
export const searchGames = async (query) => {
  try {
    const response = await apiClient.get('/search', {
      params: {
        query,
        type: 'boardgame',
        exact: 0 // Fuzzy search for better results
      }
    });

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
    console.error('Error searching games:', error);
    throw new Error('Failed to search games. Please try again.');
  }
};

/**
 * Get detailed information about specific games
 * @param {string|string[]} gameIds - Single game ID or array of game IDs
 * @returns {Promise<Array>} Array of detailed game objects
 */
export const getGameDetails = async (gameIds) => {
  try {
    // Can fetch multiple games at once by comma-separated IDs
    const ids = Array.isArray(gameIds) ? gameIds.join(',') : gameIds;

    const response = await apiClient.get('/thing', {
      params: {
        id: ids,
        stats: 1 // Include rating statistics
      }
    });

    const xmlDoc = parseXML(response.data);
    const items = xmlDoc.querySelectorAll('item');
    const results = [];

    items.forEach(item => {
      const id = item.getAttribute('id');
      
      // Get primary name
      const nameElements = item.querySelectorAll('name');
      let name = 'Unknown';
      nameElements.forEach(el => {
        if (el.getAttribute('type') === 'primary') {
          name = el.getAttribute('value');
        }
      });

      // Get description
      const description = item.querySelector('description')?.textContent || '';

      // Get year published
      const yearpublished = item.querySelector('yearpublished')?.getAttribute('value') || 'N/A';

      // Get player counts
      const minplayers = item.querySelector('minplayers')?.getAttribute('value') || '1';
      const maxplayers = item.querySelector('maxplayers')?.getAttribute('value') || '1';

      // Get playtime
      const minplaytime = item.querySelector('minplaytime')?.getAttribute('value') || '0';
      const maxplaytime = item.querySelector('maxplaytime')?.getAttribute('value') || '0';

      // Get images
      const thumbnail = item.querySelector('thumbnail')?.textContent || '';
      const image = item.querySelector('image')?.textContent || '';

      // Get rating
      let rating = 'N/A';
      const avgRating = item.querySelector('average');
      if (avgRating) {
        rating = avgRating.getAttribute('value');
      }

      // Get categories and mechanics
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
    console.error('Error fetching game details:', error);
    throw new Error('Failed to load game details.');
  }
};