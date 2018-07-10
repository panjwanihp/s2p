import { Component, OnInit } from '@angular/core';
import {ViewChild} from '@angular/core';
import "webrtc-adapter";
import * as io from 'socket.io-client';
import { SocketService } from './socket.service'
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  	@ViewChild('video') video:any; 
    @ViewChild('remotevideo') remVideo:any;
    @ViewChild('remotevideo1') remVideo1:any;
    peerConnCfg : any;
    peerConnection:any;
    dataChannel: any;
    localStream:any;
    recvChannel:any;  
    remoteStreams =[];
    constructor(private socket: SocketService) {
    	
    	this.socket.onEvent('candidate').subscribe(x => {
    		console.log("11. on event candidate");
    		var rtcCandidate = new RTCIceCandidate(x);
    		console.log("12. object created of RTCIcecandidate");
    		this.peerConnection.addIceCandidate(rtcCandidate);
    	});
    	this.socket.onEvent('answer').subscribe(x => {
    		this.onAnswer(x);
    	});
    	this.socket.onEvent('signal').subscribe(x => {
    		this.initializePeerConn();
    	});
    	//this.socket.onEvent('ready').subscribe(x => {

    	//});
    	//this.socket.onEvent('file').subscribe(x => {

    	//});


  	}
  	
  	ngOnInit() {

  		let _video=this.video.nativeElement;

  		//navigator.getUserMedia = (navigator.getUserMedia);
  		if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    		navigator.mediaDevices.getUserMedia({ video: true,audio: true })
            .then(stream => {
                console.log(stream);
                _video.srcObject = stream;
    			this.localStream = stream;
    			
            });
	  	}	
		this.socket.emit('join', 'test');
    	
  	}

  	ngAfterViewInit(){
		this.socket.onEvent('offer').subscribe(x => {
			console.log("Getting offer here from socket");
			console.log(x);
    		this.onOffer(x);  		
    	});
	}

	startCall(){
    	console.log("1. Starting call...");
    	this.initializePeerConn();
    	console.log("23. emiting signal");
    	this.socket.emit('signal','test');
    	console.log("24. onevent answer");
    	this.socket.onEvent('answer').subscribe(x => {
    	    console.log("25. in anser");
    	    this.onAnswer(x);
    	});
    	this.createOffer();
    }

	initializePeerConn(){
		console.log("2. In init");

	    this.peerConnCfg = {"iceServers":[{urls:'stun:stun.l.google.com:19302'},{"urls":"turn:numb.viagenie.ca", "username":"gandharpatwardhan@s2pedutech.com", "credential":"gandhar"}] ,"iceTransportPolicy":"all","iceCandidatePoolSize":"0"};
		console.log("3. peerconfig");    		
   		this.peerConnection = new RTCPeerConnection(this.peerConnCfg);
   		console.log("4. peerconnection");
     		
    	this.peerConnection.ondatachannel = ev => {
    		console.log("4. on datachannel");
    		this.recvChannel = ev.channel;
   			console.log("5. "+ev.channel);
   			this.recvChannel.onopen = event => {
       			console.log("6. Data channel open on recv side");
 			};

     		//this.recvChannel.onmessage = this.onMessageCallBack;
     		
     		this.recvChannel.onerror = error => {
        		console.log("6. Error: "+error);
      		};
     		this.recvChannel.onclose = even => {
        		console.log("6. Data channel close on recv side");
      		};
    	};
    	console.log("7. out of datachannelcallback");    	
    	this.peerConnection.addStream(this.localStream);
    	console.log("8. add stream");
    	this.peerConnection.onicecandidate = ev => {
    			console.log("9. In onicecandidate event");
    			if(ev.candidate){
    				console.log("10. emiting canditate");
    				this.socket.emit('candidate', ev.candidate);
    				console.log("13. emitted candidate");
    			}
    	};
    	console.log("14. adding stream");
    	this.peerConnection.onaddstream = ev =>{
    		this.onAddStream(ev);
    		console.log("17. added stream");
    	};
    	console.log("18. fun open data channel");
      	this.openDataChannel();
      	console.log("22. completed initpeer");
	}

    onOffer(offer){
    	console.log("on call OnOffer");
    	this.createAnswer(offer);
    }

    createOffer(){
    	console.log("In create offer");
    	this.peerConnection.createOffer({offerToReceiveVideo: true, offerToReceiveAudio: true}).then(offer => {
    		console.log(offer);
    		this.peerConnection.setLocalDescription(offer);
    		offer.sdp = this.setMediaBitrates(offer.sdp);
    		this.socket.emit('offer', offer);
    	});
    	
    }
	
	onAnswer(x)
	{
		console.log("On Answer");
		//console.log(x);
		var rtcAnswer = new RTCSessionDescription(x);
    	this.peerConnection.setRemoteDescription(rtcAnswer);
    	console.log("After setremotedesc");
	}
	
	createAnswer(offer){
      console.log("In create Answer");
      var rtcOffer = new RTCSessionDescription(offer);
      console.log("After rtcoffer");
      this.peerConnection.setRemoteDescription(rtcOffer);
      console.log("Before Create Answer");
      this.peerConnection.createAnswer().then(answer => {
      console.log("before set local description");
      //console.log(answer);
      this.peerConnection.setLocalDescription(answer);
      console.log("After set local desc");
      this.socket.emit('answer', answer);
      });
      
    }

	onAddStream(event){
			console.log("15. In onAddstream()");
    	
    	this.remoteStreams.push(event.stream);
    	if(this.remoteStreams.length == 1)
		{
				console.log("In push 1");
    			let remoteVideo = this.remVideo.nativeElement;
    			remoteVideo.srcObject = event.stream;
    	}
    	else
    	if(this.remoteStreams.length == 2)
    	{
    			console.log("In push 2");
    		let remoteVideo1 = this.remVideo1.nativeElement;
    		remoteVideo1.srcObject = event.stream;
    	}
    	else
    			console.log("Extra stream");
  		console.log("16. going back to init peer");
  	}

	openDataChannel(){
		console.log("19. In opendatachannel");
		var dataChannelOptions = {
      		reliable: true,
      		maxRetransmitTime: "2000"
    	};

    	//VideoChat.endcallButton.removeAttribute('disabled');
    	//console.log(this.peerConnection);
    
    	this.dataChannel = this.peerConnection.createDataChannel('testDataChannel',dataChannelOptions);

	    this.dataChannel.binaryType = 'arraybuffer';
    	console.log('20. Created send data channel');

    	this.dataChannel.onopen = event => {
      		console.log("21. Data channel open");
    	};

    	this.dataChannel.onclose = event => {
    	  console.log("21. on close"+event);
    	};
    	
    	this.dataChannel.onerror = event => {
    	  console.log("21. on error"+event);
    	};

	}
	
    
    setMediaBitrates(sdp) {
    	return this.setMediaBitrate(this.setMediaBitrate(sdp, "video", 150), "audio", 120);
  	}

  	setMediaBitrate(sdp, media, bitrate) {
    	var lines = sdp.split("\n");
    	var line = -1;
    	for (var i = 0; i < lines.length; i++) {
      		if (lines[i].indexOf("m="+media) === 0) {
        		line = i;
        		break;
      		}
    	}
    	if (line === -1) {
      		console.debug("Could not find the m line for", media);
      		return sdp;
    	}
     
    	line++;
 
    	// Skip i and c lines
    	while(lines[line].indexOf("i=") === 0 || lines[line].indexOf("c=") === 0) {
      		line++;
    	}
 
    	// If we're on a b line, replace it
    	if (lines[line].indexOf("b") === 0 ){
      		lines[line] = "b=AS:"+bitrate;
      		return lines.join("\n");
    	}
  
    	// Add a new b line
    	var newLines = lines.slice(0, line)
    	newLines.push("b=AS:"+bitrate)
    	newLines = newLines.concat(lines.slice(line, lines.length))
    	return newLines.join("\n")
  	}
    
    
}
