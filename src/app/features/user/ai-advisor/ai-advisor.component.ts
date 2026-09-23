import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RagAiService } from '../../../core/services/rag-ai.service';
import { DestinationService } from '../../../core/services/destination.service';
import { RagDocumentChunk } from '../../../core/models/rag.model';

@Component({
  selector: 'app-ai-advisor',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './ai-advisor.component.html',
  styleUrl: './ai-advisor.component.css'
})
export class AiAdvisorComponent {
  public ragService = inject(RagAiService);
  private destService = inject(DestinationService);

  public userInput: string = '';
  public showKnowledgeDrawer = signal<boolean>(false);

  sendPresetQuery(query: string): void {
    this.userInput = query;
    this.onSendQuery();
  }

  onSendQuery(): void {
    const q = this.userInput.trim();
    if (!q || this.ragService.isGenerating()) return;

    this.userInput = '';
    this.ragService.askRagAssistant(q);
  }
}
