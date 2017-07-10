;
jQuery(function($){
    'use strict';

    var IO = {
        init: function() {
            IO.socket = io.connect();
            IO.bindEvents();
        },

        bindEvents : function() {
        IO.socket.on('connected', IO.onConnected );
	    IO.socket.on('newCanvasCreated', IO.onNewCanvasCreated );
	    IO.socket.on('playerJoinedCanvas', IO.playerJoinedCanvas );
	    IO.socket.on('updateCanvasGyro', IO.onUpdateCanvasGyro );
        },

        onConnected : function(data) {
            console.log(data);
            App.mySocketId = IO.socket.socket.sessionid;
            console.log(App.mySocketId);
        },

        onNewCanvasCreated : function(data) {
            App.Host.canvasInit(data);
        },

        playerJoinedCanvas : function(data) {
            App[App.myRole].updateGyroScreen(data);
        },
	
        onUpdateCanvasGyro : function(data){
	        App[App.myRole].ipdateCanvasGyro(data);	
        }
    };

    var App = {
        canvasId: 0,
	
        myRole: '',   // 'Canvas' or 'gyro'

        mySocketId: '',

        /* *************************************
         *                Setup                *
         * *********************************** */

        init: function () {
            App.cacheElements();
            App.showInitScreen();
            App.bindEvents();
            FastClick.attach(document.body);
       
        },

        cacheElements: function () {
            App.$doc = $(document);
            App.$canvasArea = $('#mainBody');
            App.$templateIntroScreen = $('#intro-screen-template').html();
            App.$templateNewCanvas = $('#create-canvas-template').html();
            App.$templateJoinCanvas = $('#join-canvas-template').html();
            App.$hostJmolCanvas = $('#host-jmol-code').html();
            App.$gyroEvent = $('#player-gyro-code').html();
            App.$jmolCode = $('#jmole-code');
        },

        bindEvents: function () {
            // Host
            App.$doc.on('click', '#btnCreateCanvas', App.Host.onCreateClick);
            // Player
            App.$doc.on('click', '#btnJoinCanvas', App.Player.onJoinClick);
			App.$doc.on('click', '#btnStart', App.Player.onPlayerStartClick);
        },

        showInitScreen: function() {
            App.$canvasArea.html(App.$templateIntroScreen);
        },
	

        /* *******************************
           *         HOST CODE           *
           ******************************* */

        Host : {
            oldLR : 0,
            oldFB : 0,
            oldDir : 0,
		
            players : [],
            isNewCanvas : false,
            numPlayersInRoom: 0,
       
            onCreateClick: function () {
                // console.log('Clicked "Create A Game"');
                IO.socket.emit('hostCreateNewCanvas');
            },

            canvasInit: function (data) {
                App.canvasId = data.canvasId;
                App.mySocketId = data.mySocketId;
                App.myRole = 'Host';
                App.Host.numPlayersInRoom = 0;

                App.Host.displayNewCanvasScreen();
                // console.log("Game started with ID: " + App.gameId + ' by host: ' + App.mySocketId);
       
            },

            displayNewCanvasScreen : function() {
                App.$canvasArea.html(App.$templateNewCanvas);
       
                var width1 = $("#jsmolContainer").width();
                var height1 = $("#jsmolContainer").height();
				
				console.log(width1,height1);
				
				
                Jmol.setDocument(false);
                Jmol.getApplet("myJmol", Info);
       
       
                $("#jsmolContainer").html(Jmol.getAppletHtml(myJmol));
				Jmol.resizeApplet(myJmol, [width1,height1]);
       
                $('#gameURL').text(window.location.href);
                $('#spanNewGameCode').text(App.canvasId);
            },
	
                updateGyroScreen: function(data) {
                if ( App.Host.isNewCanvas ) {
                    App.Host.displayNewCanvasScreen();
                }
				
                $('#playersWaitingMessage').html(App.$gyroEvent);
                $('#jmolDiv').append(App.$hostJmolCanvas);
       
                // Store the new player's data on the Host.
                App.Host.players.push(data);

                // Increment the number of players in the room
                App.Host.numPlayersInRoom += 1;

                // If two players have joined, start the game!
                if (App.Host.numPlayersInRoom === 2) {
                    // console.log('Canvas is already paired!');
                    // Let the server know that two players are present.
                    IO.socket.emit('canvasPaired',App.canvasId);
                }
            },
	
            ipdateCanvasGyro: function(data) {
                document.getElementById("doTiltLR").innerHTML = data.LR;
                document.getElementById("doTiltFB").innerHTML = data.FB;
                document.getElementById("doDirection").innerHTML = data.D;
		
                var presentLR = data.LR;
                var presentFB = data.FB;
                var presentDir = data.Dir;
		
                var amountLR = presentLR - App.Host.oldLR;
                var amountFB = presentFB - App.Host.oldFB;
		
                var command = 'rotate y '+ amountLR +';rotate x '+amountFB; // +';rotate z '+amountDir;
                console.log(command);
                javascript:Jmol.script(myJmol,command);
		
                App.Host.oldLR = presentLR;
                App.Host.oldFB = presentFB;
                App.Host.oldDir = presentDir;

            }
        },

        /* *****************************
           *        PLAYER CODE        *
           ***************************** */

        Player : {

            /**
             * A reference to the socket ID of the Host
             */
            hostSocketId: '',

            /**
             * The player's name entered on the 'Join' screen.
             */
            myName: '',

            /**
             * Click handler for the 'JOIN' button
             */
            onJoinClick: function () {
                // console.log('Clicked "Join A Game"');

                // Display the Join Game HTML on the player's screen.
                App.$canvasArea.html(App.$templateJoinCanvas);
            },
       

            onPlayerStartClick: function() {
                console.log('Player clicked "Start"');

                var data = {
                    canvasId : +($('#inputCanvasId').val()),
                    playerName : $('#inputPlayerName').val() || 'anon'
                };
		
                IO.socket.emit('playerJoinCanvas', data);
				console.log(data);
                App.myRole = 'Player';
                App.Player.myName = data.playerName;
            },
       
            ipdateCanvasGyro: function(data) {
            },
	
            updateGyroScreen : function(data) {
            if(IO.socket.socket.sessionid === data.mySocketId){
                App.myRole = 'Player';
                App.canvasId = data.canvasId;
                $('#playerWaitingMessage').html(App.$gyroEvent);
				
                calculateValues(IO.socket);
                }
            }
        },
	
       /* **************************
                  UTILITY CODE
           ************************** */


        /**
         * Make the text inside the given element as big as possible
         * See: https://github.com/STRML/textFit
         *
         * @param el The parent element of some text
         */
        doTextFit : function(el) {
            textFit(
                $(el)[0],
                {
                    alignHoriz:true,
                    alignVert:false,
                    widthOnly:true,
                    reProcess:true,
                    maxFontSize:300
                }
            );
        }

    };

    IO.init();
    App.init();

}($));
