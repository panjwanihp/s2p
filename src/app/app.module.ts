import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { MatCardModule } from '@angular/material';
import { AppComponent } from './app.component';
import { RoomComponent } from './room/room.component';
import { ChatComponent } from './chat/chat.component';
import { SocketService } from './socket.service';

@NgModule({
  declarations: [
    AppComponent,
    RoomComponent,
    ChatComponent
  ],
  imports: [
    BrowserModule,
    MatCardModule
  ],
  providers: [SocketService],
  bootstrap: [AppComponent]
})
export class AppModule { }
