import { Component, EventEmitter, Input, Output, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GooglePlacesService, PlaceResult } from '../../services/google-places.service';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-location-search',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './location-search.component.html',
  styleUrls: ['./location-search.component.scss']
})
export class LocationSearchComponent implements OnInit, OnDestroy {
  @Input() isVisible = false;
  @Output() locationSelected = new EventEmitter<{ lat: number; lng: number; name: string }>();
  @Output() searchClosed = new EventEmitter<void>();

  searchQuery = '';
  searchResults: PlaceResult[] = [];
  isSearching = false;
  showResults = false;
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(private googlePlacesService: GooglePlacesService) {}

  ngOnInit(): void {
    // Debounce search input
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(query => {
        if (query.trim().length > 2) {
          this.performSearch(query);
        } else {
          this.searchResults = [];
          this.showResults = false;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery = target.value;
    this.onSearchInput();
  }

  onSearchInput(): void {
    this.searchSubject.next(this.searchQuery);
  }

  private async performSearch(query: string): Promise<void> {
    console.log('Starting search for:', query);
    this.isSearching = true;
    this.showResults = true;

    try {
      this.searchResults = await this.googlePlacesService.searchPlaces(query);
      console.log('Search completed, results:', this.searchResults);
    } catch (error) {
      console.error('Search error:', error);
      this.searchResults = [];
    } finally {
      this.isSearching = false;
    }
  }

  selectLocation(place: PlaceResult): void {
    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();
    
    this.locationSelected.emit({
      lat,
      lng,
      name: place.name || place.formatted_address
    });

    this.searchQuery = place.name || place.formatted_address;
    this.showResults = false;
    this.searchResults = [];
  }

  closeSearch(): void {
    this.searchClosed.emit();
    this.searchQuery = '';
    this.searchResults = [];
    this.showResults = false;
  }

  onInputFocus(): void {
    if (this.searchResults.length > 0) {
      this.showResults = true;
    }
  }

  onInputBlur(): void {
    // Delay hiding results to allow for click events
    setTimeout(() => {
      this.showResults = false;
    }, 200);
  }
}
