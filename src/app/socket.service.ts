import { Injectable } from '@angular/core';
import "webrtc-adapter";
import * as io from 'socket.io-client';
import { Observable, of } from 'rxjs';
import { Observer } from 'rxjs/Observer';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
	socket: SocketIOClient.Socket;
	observer: Observer<any>;
	constructor() { 
  		//this.socket = io.connect('https://localhost:10001');
  		this.socket = io();
  	}

  	onEvent(event): Observable<any> {
  		return new Observable<any>(observer => {
  			console.log("In socket event");
  			console.log(event);
            this.socket.on(event, (x) => observer.next(x));
        });
  	}

  emit(x,y)  {
	this.socket.emit(x,y);
	}
}
