import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.css']
})
export class RoomComponent implements OnInit {
	username: string = "";
	roomName: string = "";
  constructor() { }

  ngOnInit() {
  }

  

  // Register new Chat Room
  createRoom ()  {
  
    // eslint-disable-next-line no-console
    console.log('Creating new room:' + this.roomName);
   // webrtc.createRoom(roomName, (err, name) => {
     // formEl.form('clear');
      //showChatRoom(name);
      //postMessage(`${username} created chatroom`);
    //});
  }
}
