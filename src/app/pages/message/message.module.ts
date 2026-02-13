import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { MessageRoutingModule } from './message-routing.module';
import { MessagePageComponent } from './message-page/message-page.component';

@NgModule({
  declarations: [MessagePageComponent],
  imports: [CommonModule, ReactiveFormsModule, MessageRoutingModule]
})
export class MessageModule {}
