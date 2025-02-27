# Setting Up Google Maps API for Outline Guru

This guide will help you set up a Google Maps API key to use with Outline Guru for fetching real review data.

## Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Make note of your project ID

## Step 2: Enable Required APIs

1. In your Google Cloud project, navigate to "APIs & Services" > "Library"
2. Search for and enable the following APIs:
   - Places API
   - Maps JavaScript API

## Step 3: Create an API Key

1. In your Google Cloud project, navigate to "APIs & Services" > "Credentials"
2. Click "Create Credentials" and select "API Key"
3. Your new API key will be displayed. Copy this key.
4. (Optional but recommended) Restrict the API key to only the APIs you need (Places API and Maps JavaScript API)

## Step 4: Set Up the API Key in Your Project

### For Local Development

1. Create a `.env.local` file in the root of your project (if it doesn't exist)
2. Add the following line to the file:
   ```
   GOOGLE_MAPS_API_KEY=your_api_key_here
   ```
3. Replace `your_api_key_here` with the API key you copied in Step 3

### For Supabase Edge Functions

If you have the Supabase CLI installed:

```bash
supabase secrets set GOOGLE_MAPS_API_KEY="your_api_key_here"
```

If you don't have the Supabase CLI, you can set the secret in the Supabase dashboard:

1. Go to your Supabase project dashboard
2. Navigate to "Settings" > "API"
3. Scroll down to "Project API keys"
4. Add a new secret with the key `GOOGLE_MAPS_API_KEY` and your API key as the value

## Step 5: Test Your API Key

We've included a simple test script to verify that your Google Maps API key is working correctly:

1. Open the `test-google-maps-api.js` file in the root of your project
2. Replace `YOUR_API_KEY_HERE` with your actual Google Maps API key
3. Set up the test environment:
   ```bash
   # Rename the test package.json file
   mv test-package.json package.json
   
   # Install dependencies
   npm install
   
   # Run the test
   npm test
   ```
   
   Alternatively, if you don't want to modify your existing package.json:
   ```bash
   # Install node-fetch directly
   npm install node-fetch
   
   # Run the test script
   node test-google-maps-api.js
   ```

4. If everything is set up correctly, you should see output showing places and reviews from Google Maps

Example successful output:
```
Searching for places matching: "restaurants in New York"
Making request to: https://maps.googleapis.com/maps/api/place/textsearch/json?query=restaurants%20in%20New%20York&key=YOUR_API_KEY
Found 20 places matching "restaurants in New York"
[
  {
    name: 'Restaurant Name',
    rating: 4.5,
    reviews_count: 1234,
    place_id: 'ChIJxxxxxxxxxxxxxxxx',
    address: '123 Main St, New York, NY 10001, USA',
    url: 'https://www.google.com/maps/place/?q=place_id:ChIJxxxxxxxxxxxxxxxx'
  },
  // More places...
]

Getting reviews for: Restaurant Name (ChIJxxxxxxxxxxxxxxxx)
Making request to: https://maps.googleapis.com/maps/api/place/details/json?place_id=ChIJxxxxxxxxxxxxxxxx&fields=name,rating,formatted_address,review,url&key=YOUR_API_KEY
Found 5 reviews for "Restaurant Name"
[
  {
    reviewer_name: 'John Doe',
    rating: 5,
    review_text: 'Great food and service!',
    review_date: '2023-05-15T12:34:56.000Z'
  },
  // More reviews...
]

Test completed successfully!
```

## Step 6: Test Your Setup in the Application

1. Start your development server:
   ```bash
   npm run dev
   ```
2. Navigate to the reviews section of your application
3. Enter a keyword and location, then click search
4. If everything is set up correctly, you should see real data from Google Maps

## Troubleshooting

### API Key Not Working

- Make sure you've enabled the correct APIs in your Google Cloud project
- Check that the API key has the correct restrictions
- Verify that the API key is correctly set in your environment variables

### Rate Limiting

Google Maps API has usage limits. If you're hitting rate limits:

1. Create a billing account in Google Cloud
2. Enable billing for your project
3. Set up quotas and alerts to monitor your usage

### API Errors

If you're seeing errors from the Google Maps API:

1. Check the error message in the browser console
2. Verify that your API key is correct
3. Make sure you're not exceeding usage limits

## Next Steps

Once you have your Google Maps API key set up, you can:

1. Customize the review fetching logic in `supabase/functions/python-maps-scraper/index.ts`
2. Adjust the number of reviews fetched in `src/services/googleMapsReviewService.ts`
3. Implement additional features using the Google Maps API

For more information, refer to the [Google Maps Platform Documentation](https://developers.google.com/maps/documentation). 