import { Component, OnInit } from '@angular/core';
import { ChatService } from '../../services/chat.service';

interface ChatMessage {
  from: 'user' | 'bot';
  text: string;
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

  messages: ChatMessage[] = [];
  input = '';
  loading = false;
  opened = false;

  constructor(private chatService: ChatService) {}

  ngOnInit(): void {
    // ✅ Welcome message
    this.messages.push({
      from: 'bot',
      text: 'Hi 👋 I can help you choose hunting gear.'
    });
  }

  toggleChat() {
    this.opened = !this.opened;
  }

  send() {
    if (!this.input.trim() || this.loading) return;

    const userMessage = this.input;
    this.messages.push({ from: 'user', text: userMessage });
    this.input = '';
    this.loading = true;

    this.chatService.sendMessage(userMessage).subscribe({
      next: res => {
        this.messages.push({ from: 'bot', text: res.reply });
        this.loading = false;
      },
      error: () => {
        this.messages.push({
          from: 'bot',
          text: 'AI is currently unavailable.'
        });
        this.loading = false;
      }
    });
  }
}
