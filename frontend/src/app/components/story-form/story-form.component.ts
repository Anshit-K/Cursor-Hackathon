import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-story-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './story-form.component.html',
  styleUrls: ['./story-form.component.scss']
})
export class StoryFormComponent implements OnInit {
  @Input() lat!: number;
  @Input() lng!: number;
  @Input() locationName?: string;
  @Output() storySubmitted = new EventEmitter<{ lat: number; lng: number; story: string; placeName: string; imagePath?: string }>();
  @Output() cancelled = new EventEmitter<void>();

  storyForm!: FormGroup;
  readonly maxStoryLength = 200;
  selectedImagePath: string | null = null;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.storyForm = this.fb.group({
      placeName: [this.locationName || '', [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(100)
      ]],
      story: ['', [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(this.maxStoryLength)
      ]]
    });
  }

      onSubmit(): void {
        if (this.storyForm.valid) {
          const story = this.storyForm.get('story')?.value;
          const placeName = this.storyForm.get('placeName')?.value;
          this.storySubmitted.emit({
            lat: this.lat,
            lng: this.lng,
            story: story,
            placeName: placeName,
            imagePath: this.selectedImagePath || undefined
          });
        }
      }

  onCancel(): void {
    this.cancelled.emit();
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Convert image to base64 for storage
      const reader = new FileReader();
      reader.onload = (e) => {
        this.selectedImagePath = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.selectedImagePath = null;
  }

  get remainingCharacters(): number {
    const currentLength = this.storyForm.get('story')?.value?.length || 0;
    return this.maxStoryLength - currentLength;
  }

  get isStoryValid(): boolean {
    const storyControl = this.storyForm.get('story');
    return storyControl ? storyControl.valid && storyControl.touched : false;
  }
}
