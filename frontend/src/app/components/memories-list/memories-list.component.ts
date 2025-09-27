import { Component, EventEmitter, Input, Output, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PinService } from '../../services/pin.service';
import { Pin } from '../../models/pin.model';

@Component({
  selector: 'app-memories-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './memories-list.component.html',
  styleUrls: ['./memories-list.component.scss']
})
export class MemoriesListComponent implements OnInit, OnChanges {
  @Input() isVisible = false;
  @Output() memorySelected = new EventEmitter<Pin>();
  @Output() listClosed = new EventEmitter<void>();

  memories: Pin[] = [];
  isLoading = false;
  error: string | null = null;

  constructor(private pinService: PinService) {}

  ngOnInit(): void {
    if (this.isVisible) {
      this.loadMemories();
    }
  }

  ngOnChanges(): void {
    if (this.isVisible) {
      this.loadMemories();
    }
  }

  loadMemories(): void {
    this.isLoading = true;
    this.error = null;

    this.pinService.getAllPins().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.memories = response.data;
        } else {
          this.error = response.error || 'Failed to load memories';
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load memories. Please try again.';
        this.isLoading = false;
        console.error('Error loading memories:', err);
      }
    });
  }

  selectMemory(memory: Pin): void {
    this.memorySelected.emit(memory);
  }

  closeList(): void {
    this.listClosed.emit();
  }

  formatDate(timestamp: string): string {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getMemoryPreview(story: string): string {
    return story.length > 100 ? story.substring(0, 100) + '...' : story;
  }

  trackByMemoryId(index: number, memory: Pin): string {
    return memory.id;
  }
}
