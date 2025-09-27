import { Injectable } from '@angular/core';
import { Loader } from '@googlemaps/js-api-loader';
import { environment } from '../../environments/environment';

export interface PlaceResult {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat(): number;
      lng(): number;
    };
  };
}

@Injectable({
  providedIn: 'root'
})
export class GooglePlacesService {
  private loader?: Loader;
  private autocompleteService: any = null;
  private placesService: any = null;
  private map: any = null;

  constructor() {
    // Initialize Google Maps Loader only if API key is available
    if (environment.googleMapsApiKey && environment.googleMapsApiKey.trim() !== '') {
      this.loader = new Loader({
        apiKey: environment.googleMapsApiKey,
        version: 'weekly',
        libraries: ['places']
      });
    }
  }

  async initializeService(mapElement: HTMLElement): Promise<void> {
    // If no API key, skip initialization and use fallback mode
    if (!environment.googleMapsApiKey || environment.googleMapsApiKey.trim() === '') {
      console.log('No Google Maps API key provided, using fallback search mode');
      return;
    }

    try {
      await this.loader!.load();
      
      // Create a hidden map for Places service
      this.map = new (window as any).google.maps.Map(mapElement, {
        center: { lat: 0, lng: 0 },
        zoom: 1
      });

      this.autocompleteService = new (window as any).google.maps.places.AutocompleteService();
      this.placesService = new (window as any).google.maps.places.PlacesService(this.map);
    } catch (error) {
      console.error('Error loading Google Maps:', error);
      // Don't throw error, just fall back to demo mode
      console.log('Falling back to demo search mode');
    }
  }

  async searchPlaces(query: string): Promise<PlaceResult[]> {
    // If no API key or service not initialized, use fallback
    if (!environment.googleMapsApiKey || environment.googleMapsApiKey.trim() === '' || !this.autocompleteService) {
      return this.fallbackSearch(query);
    }

    return new Promise((resolve, reject) => {
      this.autocompleteService!.getPlacePredictions(
        {
          input: query,
          types: ['establishment', 'geocode']
        },
        (predictions: any, status: any) => {
          if (status === (window as any).google.maps.places.PlacesServiceStatus.OK && predictions) {
            // Get detailed place information for each prediction
            const placePromises = predictions.slice(0, 5).map((prediction: any) => 
              this.getPlaceDetails(prediction.place_id)
            );
            
            Promise.all(placePromises)
              .then(places => resolve(places.filter(place => place !== null) as PlaceResult[]))
              .catch(reject);
          } else {
            resolve([]);
          }
        }
      );
    });
  }

  private async fallbackSearch(query: string): Promise<PlaceResult[]> {
    console.log('Using fallback search for query:', query);
    // Comprehensive demo locations for hackathon presentation
    const demoLocations: PlaceResult[] = [
      // Canadian Locations
      {
        place_id: 'uvic-1',
        name: 'University of Victoria',
        formatted_address: '3800 Finnerty Rd, Victoria, BC V8P 5C2, Canada',
        geometry: {
          location: {
            lat: () => 48.4634,
            lng: () => -123.3117
          }
        }
      },
      {
        place_id: 'cn-tower-1',
        name: 'CN Tower',
        formatted_address: '290 Bremner Blvd, Toronto, ON M5V 3L9, Canada',
        geometry: {
          location: {
            lat: () => 43.6426,
            lng: () => -79.3871
          }
        }
      },
      {
        place_id: 'banff-1',
        name: 'Banff National Park',
        formatted_address: 'Banff, AB, Canada',
        geometry: {
          location: {
            lat: () => 51.1784,
            lng: () => -115.5708
          }
        }
      },
      {
        place_id: 'vancouver-1',
        name: 'Vancouver',
        formatted_address: 'Vancouver, BC, Canada',
        geometry: {
          location: {
            lat: () => 49.2827,
            lng: () => -123.1207
          }
        }
      },
      {
        place_id: 'montreal-1',
        name: 'Montreal',
        formatted_address: 'Montreal, QC, Canada',
        geometry: {
          location: {
            lat: () => 45.5017,
            lng: () => -73.5673
          }
        }
      },

      // US Locations
      {
        place_id: 'times-square-1',
        name: 'Times Square',
        formatted_address: 'Times Square, New York, NY 10036, USA',
        geometry: {
          location: {
            lat: () => 40.7580,
            lng: () => -73.9855
          }
        }
      },
      {
        place_id: 'central-park-1',
        name: 'Central Park',
        formatted_address: 'Central Park, New York, NY, USA',
        geometry: {
          location: {
            lat: () => 40.7829,
            lng: () => -73.9654
          }
        }
      },
      {
        place_id: 'golden-gate-1',
        name: 'Golden Gate Bridge',
        formatted_address: 'Golden Gate Bridge, San Francisco, CA, USA',
        geometry: {
          location: {
            lat: () => 37.8199,
            lng: () => -122.4783
          }
        }
      },
      {
        place_id: 'hollywood-sign-1',
        name: 'Hollywood Sign',
        formatted_address: 'Hollywood Sign, Los Angeles, CA, USA',
        geometry: {
          location: {
            lat: () => 34.1341,
            lng: () => -118.3215
          }
        }
      },
      {
        place_id: 'grand-canyon-1',
        name: 'Grand Canyon',
        formatted_address: 'Grand Canyon National Park, AZ, USA',
        geometry: {
          location: {
            lat: () => 36.1069,
            lng: () => -112.1129
          }
        }
      },
      {
        place_id: 'miami-beach-1',
        name: 'Miami Beach',
        formatted_address: 'Miami Beach, FL, USA',
        geometry: {
          location: {
            lat: () => 25.7907,
            lng: () => -80.1300
          }
        }
      },

      // European Locations
      {
        place_id: 'eiffel-tower-1',
        name: 'Eiffel Tower',
        formatted_address: 'Champ de Mars, 5 Avenue Anatole France, 75007 Paris, France',
        geometry: {
          location: {
            lat: () => 48.8584,
            lng: () => 2.2945
          }
        }
      },
      {
        place_id: 'big-ben-1',
        name: 'Big Ben',
        formatted_address: 'Westminster, London SW1A 0AA, UK',
        geometry: {
          location: {
            lat: () => 51.4994,
            lng: () => -0.1245
          }
        }
      },
      {
        place_id: 'colosseum-1',
        name: 'Colosseum',
        formatted_address: 'Piazza del Colosseo, 1, 00184 Roma RM, Italy',
        geometry: {
          location: {
            lat: () => 41.8902,
            lng: () => 12.4922
          }
        }
      },
      {
        place_id: 'sagrada-familia-1',
        name: 'Sagrada Familia',
        formatted_address: 'Carrer de Mallorca, 401, 08013 Barcelona, Spain',
        geometry: {
          location: {
            lat: () => 41.4036,
            lng: () => 2.1744
          }
        }
      },

      // Asian Locations
      {
        place_id: 'tokyo-tower-1',
        name: 'Tokyo Tower',
        formatted_address: '4 Chome-2-8 Shibakoen, Minato City, Tokyo 105-0011, Japan',
        geometry: {
          location: {
            lat: () => 35.6586,
            lng: () => 139.7454
          }
        }
      },
      {
        place_id: 'great-wall-1',
        name: 'Great Wall of China',
        formatted_address: 'Huairou District, Beijing, China',
        geometry: {
          location: {
            lat: () => 40.4319,
            lng: () => 116.5704
          }
        }
      },
      {
        place_id: 'taj-mahal-1',
        name: 'Taj Mahal',
        formatted_address: 'Dharmapuri, Forest Colony, Tajganj, Agra, Uttar Pradesh 282001, India',
        geometry: {
          location: {
            lat: () => 27.1751,
            lng: () => 78.0421
          }
        }
      },

      // Australian Locations
      {
        place_id: 'sydney-opera-1',
        name: 'Sydney Opera House',
        formatted_address: 'Bennelong Point, Sydney NSW 2000, Australia',
        geometry: {
          location: {
            lat: () => -33.8568,
            lng: () => 151.2153
          }
        }
      },
      {
        place_id: 'uluru-1',
        name: 'Uluru',
        formatted_address: 'Uluru-Kata Tjuta National Park, NT, Australia',
        geometry: {
          location: {
            lat: () => -25.3444,
            lng: () => 131.0369
          }
        }
      },

      // Popular Cities
      {
        place_id: 'london-1',
        name: 'London',
        formatted_address: 'London, UK',
        geometry: {
          location: {
            lat: () => 51.5074,
            lng: () => -0.1278
          }
        }
      },
      {
        place_id: 'paris-1',
        name: 'Paris',
        formatted_address: 'Paris, France',
        geometry: {
          location: {
            lat: () => 48.8566,
            lng: () => 2.3522
          }
        }
      },
      {
        place_id: 'tokyo-1',
        name: 'Tokyo',
        formatted_address: 'Tokyo, Japan',
        geometry: {
          location: {
            lat: () => 35.6762,
            lng: () => 139.6503
          }
        }
      },
      {
        place_id: 'sydney-1',
        name: 'Sydney',
        formatted_address: 'Sydney, NSW, Australia',
        geometry: {
          location: {
            lat: () => -33.8688,
            lng: () => 151.2093
          }
        }
      },
      {
        place_id: 'dubai-1',
        name: 'Dubai',
        formatted_address: 'Dubai, UAE',
        geometry: {
          location: {
            lat: () => 25.2048,
            lng: () => 55.2708
          }
        }
      }
    ];

    // Enhanced search logic
    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
    
    const filteredResults = demoLocations.filter(location => {
      const name = location.name.toLowerCase();
      const address = location.formatted_address.toLowerCase();
      
      // Check if all search terms are found in name or address
      return searchTerms.every(term => 
        name.includes(term) || address.includes(term)
      ) || 
      // Or if any search term is found (less strict)
      searchTerms.some(term => 
        name.includes(term) || address.includes(term)
      );
    });

    // Sort results by relevance (exact matches first, then partial matches)
    const sortedResults = filteredResults.sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      const queryLower = query.toLowerCase();
      
      // Exact name match gets highest priority
      if (aName === queryLower) return -1;
      if (bName === queryLower) return 1;
      
      // Name starts with query gets second priority
      if (aName.startsWith(queryLower) && !bName.startsWith(queryLower)) return -1;
      if (bName.startsWith(queryLower) && !aName.startsWith(queryLower)) return 1;
      
      // Otherwise maintain original order
      return 0;
    });

    // If no results found, create a generic location
    const results = sortedResults.length > 0 ? sortedResults : [
      {
        place_id: 'generic-1',
        name: `${query} (Demo Location)`,
        formatted_address: `Demo location for ${query}`,
        geometry: {
          location: {
            lat: () => 40.7128 + (Math.random() - 0.5) * 0.1,
            lng: () => -74.0060 + (Math.random() - 0.5) * 0.1
          }
        }
      }
    ];

    return new Promise(resolve => {
      setTimeout(() => {
        console.log('Fallback search results:', results.slice(0, 8));
        resolve(results.slice(0, 8));
      }, 300); // Limit to 8 results
    });
  }

  private getPlaceDetails(placeId: string): Promise<PlaceResult | null> {
    return new Promise((resolve) => {
      if (!this.placesService) {
        resolve(null);
        return;
      }

      this.placesService.getDetails(
        {
          placeId: placeId,
          fields: ['place_id', 'name', 'formatted_address', 'geometry']
        },
        (place: any, status: any) => {
          if (status === (window as any).google.maps.places.PlacesServiceStatus.OK && place) {
            resolve(place as PlaceResult);
          } else {
            resolve(null);
          }
        }
      );
    });
  }
}
