import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PinService } from '../../services/pin.service';
import { GooglePlacesService } from '../../services/google-places.service';
import { AuthService } from '../../services/auth.service';
import { StoryFormComponent } from '../story-form/story-form.component';
import { LocationSearchComponent } from '../location-search/location-search.component';
import { MemoriesListComponent } from '../memories-list/memories-list.component';
import { Pin } from '../../models/pin.model';
import * as L from 'leaflet';

@Component({
  selector: 'app-memory-map',
  standalone: true,
  imports: [CommonModule, StoryFormComponent, LocationSearchComponent, MemoriesListComponent],
  templateUrl: './memory-map.component.html',
  styleUrls: ['./memory-map.component.scss']
})
export class MemoryMapComponent implements OnInit, OnDestroy {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef;

  private map!: L.Map;
  private markers: L.Marker[] = [];
  private isAddingPin = false;
  private pendingLatLng: { lat: number; lng: number; name?: string } | null = null;
  private searchedLocationMarker: L.Marker | null = null;

  pins: Pin[] = [];
  showStoryForm = false;
  showLocationSearch = false;
  showMemoriesList = false;
  isLoading = false;
  error: string | null = null;
  isSharedMode = false;
  mapOwner: string | null = null;

  constructor(
    private pinService: PinService,
    private googlePlacesService: GooglePlacesService,
    private authService: AuthService
  ) {}

  async ngOnInit(): Promise<void> {
    // Check if this is a shared view
    this.checkSharedMode();
    
    this.initializeMap();
    this.loadPins();
    
    // Initialize Google Places service
    try {
      const hiddenMapElement = document.createElement('div');
      hiddenMapElement.style.display = 'none';
      document.body.appendChild(hiddenMapElement);
      await this.googlePlacesService.initializeService(hiddenMapElement);
      console.log('Google Places service initialized successfully');
    } catch (error) {
      console.warn('Google Places API not available, using fallback mode:', error);
    }
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  private initializeMap(): void {
    // Initialize the map centered on New York City
    this.map = L.map(this.mapContainer.nativeElement, {
      zoomControl: false // Disable default zoom control
    }).setView([40.7128, -74.0060], 13);

    // Add custom zoom control at bottom right with proper positioning
    const zoomControl = L.control.zoom({
      position: 'bottomright'
    }).addTo(this.map);

    // Adjust positioning to keep within viewport
    setTimeout(() => {
      const zoomElement = document.querySelector('.leaflet-control-zoom');
      if (zoomElement) {
        (zoomElement as HTMLElement).style.bottom = '120px';
        (zoomElement as HTMLElement).style.right = '20px';
        (zoomElement as HTMLElement).style.top = 'auto';
        (zoomElement as HTMLElement).style.left = 'auto';
      }
    }, 100);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    // Add click event listener to the map (only if not in shared mode)
    this.map.on('click', (e: L.LeafletMouseEvent) => {
      // Close searched location marker if it exists
      if (this.searchedLocationMarker) {
        this.closeSearchedLocationMarker();
      }
      
      // Start adding pin if not in shared mode and not already adding
      if (!this.isSharedMode && !this.isAddingPin) {
        this.startAddingPin(e.latlng.lat, e.latlng.lng);
      }
    });
  }

  private createPinIcon(): L.DivIcon {
    return L.divIcon({
      className: 'custom-pin',
      html: `
        <div class="pin-container">
          <div class="pin-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </div>
          <div class="pin-shadow"></div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 36],
      popupAnchor: [0, -36]
    });
  }

  private startAddingPin(lat: number, lng: number): void {
    this.pendingLatLng = { lat, lng };
    this.showStoryForm = true;
    this.isAddingPin = true;
  }

  onStorySubmitted(pinData: { lat: number; lng: number; story: string; placeName: string; imagePath?: string }): void {
    this.isLoading = true;
    this.error = null;

    this.pinService.createPin(pinData).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.pins.unshift(response.data);
          this.addMarkerToMap(response.data);
          this.closeStoryForm();
        } else {
          this.error = response.error || 'Failed to save memory';
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to save memory. Please try again.';
        this.isLoading = false;
        console.error('Error creating pin:', err);
      }
    });
  }

  onStoryCancelled(): void {
    this.closeStoryForm();
  }

  private closeStoryForm(): void {
    this.showStoryForm = false;
    this.isAddingPin = false;
    this.pendingLatLng = null;
  }

  loadPins(): void {
    this.isLoading = true;
    this.error = null;

    this.pinService.getAllPins().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.pins = response.data;
          this.addAllMarkersToMap();
        } else {
          this.error = response.error || 'Failed to load memories';
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load memories. Please try again.';
        this.isLoading = false;
        console.error('Error loading pins:', err);
      }
    });
  }

  private addAllMarkersToMap(): void {
    // Clear existing markers
    this.markers.forEach(marker => this.map.removeLayer(marker));
    this.markers = [];

    // Add all pins as markers
    this.pins.forEach(pin => this.addMarkerToMap(pin));
  }

  private addMarkerToMap(pin: Pin): void {
    const marker = L.marker([pin.lat, pin.lng], {
      icon: this.createPinIcon()
    })
      .addTo(this.map)
      .bindPopup(this.createPopupContent(pin), {
        maxWidth: 320,
        className: 'custom-popup'
      });

    this.markers.push(marker);
  }

  private createPopupContent(pin: Pin): string {
    const date = new Date(pin.timestamp);
    const formattedDate = date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    const formattedTime = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    return `
      <div class="clean-card-popup">
        <div class="popup-profile">
          <div class="profile-avatar">
            <div class="avatar-circle">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
          </div>
          <div class="profile-info">
            <div class="profile-name">Memory</div>
            <div class="profile-details">${formattedDate}</div>
          </div>
        </div>
        
        <div class="popup-info-grid">
          <div class="info-box">
            <div class="info-label">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <span>Location</span>
            </div>
            <div class="info-value">${pin.placeName}</div>
          </div>
          
          <div class="info-box">
            <div class="info-label">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 3h18v18H3zM8 8h8v8H8z"></path>
                <path d="M12 2v4M12 18v4M2 12h4M18 12h4"></path>
              </svg>
              <span>Date & Time</span>
            </div>
            <div class="info-value">${formattedDate} at ${formattedTime}</div>
          </div>
        </div>
        
          <div class="popup-content">
            <div class="content-label">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14,2 14,8 20,8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
              </svg>
              <span>Memory Story</span>
            </div>
            <div class="memory-story">${this.escapeHtml(pin.story)}</div>
            ${pin.imagePath ? `
              <div class="memory-image">
                <div class="image-preview">
                  <img src="${pin.imagePath}" alt="Memory image" class="memory-image-display" />
                </div>
              </div>
            ` : ''}
          </div>
        
          <div class="popup-actions">
            <button class="action-button like-button" onclick="this.classList.toggle('liked')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
              <span>Like</span>
            </button>
            <button class="action-button">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              <span>Comment</span>
            </button>
          </div>
      </div>
    `;
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  get pendingCoordinates(): { lat: number; lng: number; name?: string } | null {
    return this.pendingLatLng;
  }

  openLocationSearch(): void {
    this.showLocationSearch = true;
  }

  onLocationSelected(location: { lat: number; lng: number; name: string }): void {
    this.pendingLatLng = { lat: location.lat, lng: location.lng, name: location.name };
    this.showLocationSearch = false;
    this.showStoryForm = false; // Don't show story form immediately
    this.isAddingPin = false; // Don't start adding pin immediately
    
    // Pan map to selected location
    this.map.setView([location.lat, location.lng], 15);
    
    // Show a temporary marker to indicate the searched location
    this.showSearchedLocationMarker(location);
  }

  onSearchClosed(): void {
    this.showLocationSearch = false;
  }

  openMemoriesList(): void {
    this.showMemoriesList = true;
  }

  onMemorySelected(memory: Pin): void {
    this.showMemoriesList = false;
    // Pan map to selected memory location
    this.map.setView([memory.lat, memory.lng], 15, {
      animate: true,
      duration: 0.5
    });
    
    // Find and open the marker popup
    const marker = this.markers.find(m => 
      Math.abs(m.getLatLng().lat - memory.lat) < 0.0001 && 
      Math.abs(m.getLatLng().lng - memory.lng) < 0.0001
    );
    
    if (marker) {
      // Wait for map animation to complete, then open popup
      setTimeout(() => {
        marker.openPopup();
      }, 600);
    }
  }

  onMemoriesListClosed(): void {
    this.showMemoriesList = false;
  }


  private showSearchedLocationMarker(location: { lat: number; lng: number; name: string }): void {
    // Remove any existing searched location marker
    if (this.searchedLocationMarker) {
      this.map.removeLayer(this.searchedLocationMarker);
    }

    // Create a temporary marker for the searched location
    this.searchedLocationMarker = L.marker([location.lat, location.lng], {
      icon: this.createSearchedLocationIcon()
    })
      .addTo(this.map)
      .bindPopup(`
        <div class="clean-card-popup">
          <div class="popup-profile">
            <div class="profile-avatar">
              <div class="avatar-circle">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>
            </div>
            <div class="profile-info">
              <div class="profile-name">Add Memory</div>
              <div class="profile-details">${location.name}</div>
            </div>
          </div>
          
          <div class="popup-info-grid">
            <div class="info-box">
              <div class="info-label">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <span>Location</span>
              </div>
              <div class="info-value">${location.name}</div>
            </div>
            
            <div class="info-box">
              <div class="info-label">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14,2 14,8 20,8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                </svg>
                <span>Action</span>
              </div>
              <div class="info-value">Create New Memory</div>
            </div>
          </div>
          
          <div class="popup-content">
            <div class="content-label">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 12l2 2 4-4"></path>
                <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"></path>
                <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"></path>
                <path d="M13 12h3a2 2 0 0 1 2 2v1"></path>
                <path d="M13 12h-3a2 2 0 0 0-2 2v1"></path>
              </svg>
              <span>Ready to Add Memory</span>
            </div>
            <div class="memory-story">Click the button below to start creating a memory at this location. You'll be able to add a story and details about your experience here.</div>
          </div>
          
          <div class="popup-actions">
            <button onclick="window.addMemoryAtSearchedLocation()" class="action-button">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14,2 14,8 20,8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
              </svg>
              <span>Add Memory Here</span>
            </button>
            <button onclick="window.closeSearchedLocationMarker()" class="action-button">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
              <span>Cancel</span>
            </button>
          </div>
        </div>
      `)
      .openPopup();

    // Make the functions available globally
    (window as any).addMemoryAtSearchedLocation = () => {
      this.addMemoryAtSearchedLocation();
    };
    
    (window as any).closeSearchedLocationMarker = () => {
      this.closeSearchedLocationMarker();
    };


  }

  private createSearchedLocationIcon(): L.DivIcon {
    return L.divIcon({
      className: 'searched-location-pin',
      html: `
        <div class="searched-pin-container">
          <div class="searched-pin-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </div>
          <div class="searched-pin-shadow"></div>
        </div>
      `,
      iconSize: [26, 26],
      iconAnchor: [13, 26],
      popupAnchor: [0, -26]
    });
  }

  addMemoryAtSearchedLocation(): void {
    if (this.pendingLatLng) {
      this.startAddingPin(this.pendingLatLng.lat, this.pendingLatLng.lng);
      // Remove the searched location marker
      if (this.searchedLocationMarker) {
        this.map.removeLayer(this.searchedLocationMarker);
        this.searchedLocationMarker = null;
      }
    }
  }

  closeSearchedLocationMarker(): void {
    // Remove the searched location marker
    if (this.searchedLocationMarker) {
      this.map.removeLayer(this.searchedLocationMarker);
      this.searchedLocationMarker = null;
    }
    // Clear pending coordinates
    this.pendingLatLng = null;
  }

  private checkSharedMode(): void {
    const urlParams = new URLSearchParams(window.location.search);
    this.isSharedMode = urlParams.get('shared') === 'true' && urlParams.get('view') === 'readonly';
    this.mapOwner = urlParams.get('owner') ? decodeURIComponent(urlParams.get('owner')!) : null;
    
    if (this.isSharedMode) {
      this.showSharedModeNotification();
    }
  }

  private showSharedModeNotification(): void {
    const notificationDiv = document.createElement('div');
    notificationDiv.innerHTML = `
      <div style="
        position: fixed;
        top: 80px;
        left: 50%;
        transform: translateX(-50%);
        background: #3b82f6;
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        font-weight: 500;
        text-align: center;
        max-width: 400px;
      ">
        👁️ View-Only Mode - This memory map has been shared with you
      </div>
    `;
    
    document.body.appendChild(notificationDiv);
    
    setTimeout(() => {
      if (document.body.contains(notificationDiv)) {
        document.body.removeChild(notificationDiv);
      }
    }, 5000);
  }

  shareMap(): void {
    // Generate a shareable URL with current map state
    const currentUrl = window.location.origin + window.location.pathname;
    const currentUser = this.authService.getCurrentUser();
    const ownerName = currentUser ? encodeURIComponent(currentUser.username) : 'Anonymous';
    const shareUrl = `${currentUrl}?shared=true&view=readonly&owner=${ownerName}`;
    
    // Copy to clipboard
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        this.showShareSuccess();
      }).catch(() => {
        this.fallbackCopyToClipboard(shareUrl);
      });
    } else {
      this.fallbackCopyToClipboard(shareUrl);
    }
  }

  private fallbackCopyToClipboard(text: string): void {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      this.showShareSuccess();
    } catch (err) {
      console.error('Failed to copy: ', err);
      this.showShareError();
    }
    
    document.body.removeChild(textArea);
  }

  private showShareSuccess(): void {
    // Create a temporary success message
    const successDiv = document.createElement('div');
    successDiv.innerHTML = `
      <div style="
        position: fixed;
        top: 80px;
        right: 20px;
        background: #4ade80;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        font-weight: 500;
      ">
        ✅ Share link copied to clipboard!
      </div>
    `;
    
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
      document.body.removeChild(successDiv);
    }, 3000);
  }

  private showShareError(): void {
    // Create a temporary error message
    const errorDiv = document.createElement('div');
    errorDiv.innerHTML = `
      <div style="
        position: fixed;
        top: 80px;
        right: 20px;
        background: #ef4444;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        font-weight: 500;
      ">
        ❌ Failed to copy link. Please try again.
      </div>
    `;
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
      document.body.removeChild(errorDiv);
    }, 3000);
  }
}
