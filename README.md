# Outline Guru - Google Maps Review Scraper Integration

This project integrates with Google Maps API to extract and analyze reviews from Google Maps.

## Overview

The integration allows you to:

1. Search for businesses on Google Maps using keywords and locations
2. Extract reviews from Google Maps using place IDs
3. Analyze the reviews to identify sentiment, topics, and feedback

## Setup Instructions

### Prerequisites

- Node.js and npm
- Supabase account
- Google Maps API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/outline-guru.git
cd outline-guru
```

2. Install JavaScript dependencies:
```bash
npm install
```

3. Deploy the Supabase Edge Function:
```bash
supabase functions deploy python-maps-scraper
```

### Configuration

1. Set up a Google Maps API key:
   - Follow the instructions in [GOOGLE_MAPS_API_SETUP.md](./GOOGLE_MAPS_API_SETUP.md) to create and configure your Google Maps API key.

2. Set the following environment variables in your Supabase project:
   - `GOOGLE_MAPS_API_KEY`: Your Google Maps API key

3. For local development, you can use the mock implementation which doesn't require the Google Maps API key.

## Usage

### Frontend

The application provides a user interface to:

1. Search for businesses by keyword and location
2. View and analyze reviews
3. Save reviews to the database

### API

The integration exposes the following API endpoints through the Supabase Edge Function:

#### Search Places

```javascript
const { data, error } = await supabase.functions.invoke('python-maps-scraper', {
  body: {
    action: 'search_places',
    query: 'restaurants in New York',
    max_results: 5
  }
});
```

#### Scrape Reviews

```javascript
const { data, error } = await supabase.functions.invoke('python-maps-scraper', {
  body: {
    action: 'scrape_reviews',
    place_id: 'ChIJxxxxxxxxxxxxxxxx',
    place_url: 'https://www.google.com/maps/place/?q=place_id:ChIJxxxxxxxxxxxxxxxx',
    max_reviews: 30
  }
});
```

## Architecture

The integration consists of the following components:

1. **Frontend**: React application that provides the user interface
2. **Supabase Edge Function**: Acts as a bridge between the frontend and the Google Maps API
3. **Google Maps API**: Provides data about places and reviews
4. **Database**: Stores the extracted reviews and analysis

## Recent Changes

We've updated the integration to use the Google Maps API directly instead of relying on a Python scraper. This provides several benefits:

1. **Reliability**: The Google Maps API is more reliable than web scraping, which can break when Google changes their website.
2. **Performance**: API calls are faster and more efficient than web scraping.
3. **Compliance**: Using the official API ensures compliance with Google's terms of service.

The changes include:

1. Updated the Supabase Edge Function to make direct calls to the Google Maps API
2. Modified the frontend service to work with the updated API
3. Added fallback to mock data when the API key is not configured or when errors occur

## Development

### Local Development

For local development, the Supabase Edge Function will use mock data if the `GOOGLE_MAPS_API_KEY` environment variable is not set. This allows you to develop without needing to set up the Google Maps API key.

### Production

In production, the Supabase Edge Function will use the Google Maps API if the `GOOGLE_MAPS_API_KEY` environment variable is set. If not, it will fall back to the mock implementation.

## Troubleshooting

### Common Issues

1. **API Key Not Found**: Make sure the `GOOGLE_MAPS_API_KEY` environment variable is set correctly in your Supabase project.
2. **API Quota Exceeded**: The Google Maps API has usage limits. Check your Google Cloud Console for quota usage.
3. **Missing Reviews**: Some businesses may not have reviews available through the API.
4. **API Errors**: Check the Supabase Edge Function logs for detailed error messages.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
