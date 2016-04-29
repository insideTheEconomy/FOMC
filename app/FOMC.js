// JavaScript Document

var jsonObj = {}, visibiltyAccess=false, inactivityTimer, attractLooper, attractVideo, attractButtonTimer, timerCallback, tickerNews, oldtickItem, newtick=0, tickerInterval, inactivityCount=0, countDown=0, inactivityAlertVisible = false, inactivityTolerance= 30, giD, nextButton, choiceButtons;

function initializeMe() {
	$( document ).ready(function() {
		// Handler for .ready() called.
	 /*$.getJSON("http://localhost:40553/session/1/?callback=?",  
function (data) {  
    alert("Title: " + data.Title);  
});  
		$.getJSON('fomc.json?callback=?',{ format: "json" })*/
		$.getJSON('fomc.json?t='+ new Date().getTime(),{ format: "json" })
		.fail(function() { console.log( "error" ); })
		.done(function(data){
			jsonObj = data;
			//jsObj = $.parseJSON( jsonObj );
			jsObj = jsonObj[0];
			console.log("Success");
		})    

		setTimeout( function(){
			$("body").mousemove( function(){resetInactivityTimer()} ); 
			$("body").click( function(){resetInactivityTimer()} ); 
			var offset = $('#contentTable').offset();
			$('#contentTable').css( 'background-position-y', 7-offset.top*1.0+ 'px');
			
			clickA.volume=0.1;
			clickB.volume=0.1;

		}, 500 );
		//$('#visualaccess').click( function(){ toggleVisibility()} );
		$('#visualaccess').on('mousedown', function(e){ clickA.play()} );
		$('#visualaccess').on('click', function(e){ toggleVisibility()} );
		
		$('body').bind('keypress', function(e) {
			if (e.which == 113){ //'q'
				gui.App.quit();
			} else if (e.which == 119) { //'w'
				gui.Window.get().leaveKioskMode();
			} else if (e.which == 100) { //'d'
				//environment.nodeWebKit = (typeof(process) === 'object' && process.features.uv) ? true : false;s
				//if (environment.nodeWebKit === true) 
				require('nw.gui').Window.get().showDevTools();
			}
			//alert(e.which);
		});

		//environment.nodeWebKit = (typeof(process) === 'object' && process.features.uv) ? true : false;
		//	if (environment.nodeWebKit === true) { require('nw.gui').Window.get().showDevTools(); }
		
		attractVideo = document.getElementById('attractvideo');
		launchAttract();
	});	
}


function fillSection( index ) {
	var iD = index;
	if (jsObj === undefined) return;
	console.log( "fillsection: "+iD );
	$('h1').html(jsObj.set[iD].title);
	$('#bodyText').html(jsObj.set[iD].bodyText);
	$('#contentTable').html(jsObj.set[iD].tableText);
	$('#bodyText').html(jsObj.set[iD].bodyText);
	$('.nextButton').html('Next');
	if (jsObj.set[iD].subTitle !== undefined) $('#subtitle').html(jsObj.set[iD].subTitle); else $('#subtitle').html('');
	
	var q = jsObj.set[iD].question;
	if (q !== undefined) {
		$('#question').html(q);
		$('.choice').removeClass().addClass('choice');
		$('#choice1').html(jsObj.set[iD].choices.A);
		$('#choice2').html(jsObj.set[iD].choices.B);
		if (jsObj.set[iD].choices.C !== undefined) {
			$('#choice3').html(jsObj.set[iD].choices.C);
			setTimeout(function(){ $('#choice2').addClass("moveIn"); }, 100);
			setTimeout(function(){ $('#choice1').addClass("moveIn"); }, 400);
			setTimeout(function(){ $('#choice3').addClass("moveIn"); }, 700);
			setTimeout(function(){ $('#question').addClass("moveUp"); }, 1000);
		} else {
			$('#choice3').removeClass("moveIn").css({'display':'none'});
			setTimeout(function(){ $('#choice2').removeClass("moveIn").addClass("moveIn2"); }, 100);
			setTimeout(function(){ $('#choice1').removeClass("moveIn").addClass("moveIn2"); }, 400);
			setTimeout(function(){ $('#question').addClass("moveUp2"); }, 700);
		}
		$('#what').html(jsObj.set[iD].answerTitle);
		$('#didit').html(jsObj.set[iD].correctAnswer);
		$('#answerText').html(jsObj.set[iD].answerText);
		$('#answerQuote').html(jsObj.set[iD].answerQuote);
		$('#correctAnswer .source').html(jsObj.set[iD].answerSource);
		activateChoiceButtons();
	} else {
		$('.choice').css({'opacity':'0'});
	}
	if ((iD > 1) && (iD <= 5)) {
		$('#contentTable').css({'width':'900px'});
	} else {
		$('#contentTable').css({'width':'auto'});
	}

	if (iD > 5) {
		$('aside').css({'display':'block'});
		$('#ticker').removeClass("hidden");
		$('#ticker ul').html(jsObj.set[iD].headlineTicker);
		tickerNews = [];
		$('#ticker li').each(function() { tickerNews.push( $(this) ); });		
		oldtickItem = tickerNews[tickerNews.length - 1];
		clearInterval(tickerInterval);
		loopNews();
		tickerInterval = setInterval(function(){ loopNews(); }, Number(jsObj.tickerInterval));
		if (iD < 9) { 
			$('#helpPanel div').html( '<h3>'+jsObj.set[2].subTitle + '</h3>' + jsObj.set[2].bodyText + '<h3>' + jsObj.set[3].subTitle + '</h3>' + jsObj.set[3].bodyText );
		} else {
			$('#helpPanel div').html( '<h3>'+jsObj.set[4].subTitle + '</h3>' + jsObj.set[4].bodyText );
		}
	} else {
		$('#ticker').addClass("hidden");
		setTimeout(function(){ activateNextButton(); }, 1000);
	}
	if (iD != 0 && iD != 1 && iD != 5) {
		setTimeout(function(){ $('aside').css({'display':'block'}); }, 800);
		setTimeout(function(){ $('aside').addClass('slideIn'); }, 900);
		var iDD = (iD < 5) ? iD+4 :iD;
		if (iD == 4 ) iDD = 9;
		$('#graph1 h3').html(jsObj.set[iDD].graphs[0].graph);
		$('#graph1 .legend').html(jsObj.set[iDD].graphs[0].legend);
		$('#graph1 .vert').html(jsObj.set[iDD].graphs[0].vert);
		var st="", h = (jsObj.set[iDD].graphs[0].horiz).split(",");
		for ( n=0; n<h.length; n++) st=st+"<td>"+String(h[n])+"</td>";
		$('#graph1 .horiz').html("<tr>"+st+"</tr>");
		console.log( "path: "+jsObj.set[iDD].graphs[0].path );
		$('#graph1 .source').html(jsObj.set[iDD].graphs[0].source); 
		$('#graph1').removeClass().addClass('gid'+iDD);
		
		$('#graph2 h3').html(jsObj.set[iDD].graphs[1].graph);
		$('#graph2 .legend').html(jsObj.set[iDD].graphs[1].legend);
		$('#graph2 .vert').html(jsObj.set[iDD].graphs[1].vert);
		st="", h = (jsObj.set[iDD].graphs[1].horiz).split(",");
		for ( n=0; n<h.length; n++)  st=st+"<td>"+String(h[n])+"</td>";
		$('#graph2 .horiz').html("<tr>"+st+"</tr>");
		$('#graph2 .source').html(jsObj.set[iDD].graphs[1].source); 
		$('#graph2').removeClass().addClass('gid'+iDD);

	} 
	if (iD == 5) {
		$('#buttonBar .nextButton').html('Begin');
		$('#photo').html('<img src="'+jsObj.set[iD].photo+'">');
		$('#photo').removeClass().removeAttr( 'style' );
		$('#seal').addClass('stamp');
		$('#contentTable').css({'display':'none'});
		$('aside ul').html('');
		$('aside .legend').html('');
		setTimeout(function(){ $('#photo').addClass('moveIn'); }, 500);
	} else {
		if (iD == 9) {$(nextButton).html('Done');}
		$('#contentTable').css({'display':'table'});	
	}
	
	if (iD == 6) {
		$('#buttonBar .nextButton').addClass('moveRight');
		deactivateNextButton();
		$('#help').addClass('slideIn');
		activateHelpButton();
	}

	setTimeout(function(){ $('#subtitle').addClass("moveIn"); }, 00);
	setTimeout(function(){ $('#bodyText').addClass("moveIn"); }, 300);
	setTimeout(function(){ $('#contentTable').addClass("slideIn"); }, 600);
	setTimeout(function(){
		var offset = $('#contentTable').offset();
		$('#contentTable').css( 'background-position-y', 7-offset.top*1.0+ 'px');
	}, 900);
	
}

function toggleVisibility() {
	clickB.play()
	if (!visibiltyAccess) {
		$('#outerContainer').addClass('makeNegative');
		visibiltyAccess=true;
	} else {
		$('#outerContainer').removeClass('makeNegative');
		visibiltyAccess=false;
	}
}


function loopNews() {
	oldtickItem.removeClass();
	tickerNews[newtick].addClass('showNewsItem');
	oldtickItem = tickerNews[newtick];
	newtick = (newtick+1)%tickerNews.length;
		
}

function headGradient() {
	var c=document.getElementById("h1canvas");
	var ctx=c.getContext("2d");
	ctx.font="5.5em Univers-Ultra-Condensed";
	
	// Create gradient
	var gradient=ctx.createLinearGradient(0,0,0,c.height);
	gradient.addColorStop("0","#5fceb1");
	gradient.addColorStop("1.0","#318d82");
	// Fill with gradient
	ctx.fillStyle=gradient;
	ctx.fillText("OPEN MARKET OPERATIONS",10,50);
		
}

function activateChoiceButtons() {
	choiceButtons = '.choice';
	$(choiceButtons).mousedown(function(){ clickA.play(); $(this).addClass('pressed'); });
	$(choiceButtons).mouseout(function(){ $(this).removeClass('pressed'); });
	$(choiceButtons).click(function(){
		clickB.play();
		$(this).removeClass('pressed');
		console.log( "this: "+$(this).html()+"  correct: "+$('#didit').html() );
		if ($(this).html() == $('#didit').html()) {
			$(this).addClass('correct');
		} else {
			$(this).addClass('incorrect');
		}
		$('#correctAnswer').addClass('reveal');
		deactivateChoiceButtons();			
		activateNextButton();
	});
}
function deactivateChoiceButtons() {
	$(choiceButtons).unbind('mousedown click'); 
}
function activateHelpButton() {
	$('#help').mousedown(function(){ clickA.play(); $(this).addClass('pressed'); });
	$('#help').mouseout(function(){ $(this).removeClass('pressed'); });
	$('#help').click(function(){
		clickB.play();
		$(this).removeClass('pressed');
		$('#helpPanel').addClass('slideIn');
		$('#closeButton').mousedown(function(){ clickA.play();  $('#closeButton').addClass('pressed'); });
		$('#closeButton').mouseout(function(){ $(this).removeClass('pressed'); });
		$('#closeButton').click(function(){ closeMe(); });
	});
}
function deactivateHelpButton() {
	$('#help').unbind('mousedown click'); 
}
function closeMe() {
	clickB.play();
	$('#helpPanel').removeClass('slideIn');
	$('#closeButton').removeClass('pressed');
}
function activateNextButton() { 
	nextButton = (giD<=6) ? "#buttonBar .nextButton" : "#correctAnswer .nextButton";
	$(nextButton).mousedown(function(){ clickA.play(); $(this).addClass('pressed'); });
	$(nextButton).mouseout(function(){ $(this).removeClass('pressed'); });
	$(nextButton).click(function(){
		clickB.play();
		$(this).removeClass('pressed');
		$('#correctAnswer').removeClass('reveal');		
		$('aside').removeClass('slideIn');
		$('.choice').removeClass("moveIn moveIn2");
		$('#helpPanel').removeClass();
		setTimeout(function(){ $('#question').removeClass(); }, 100);
		deactivateNextButton();
		setTimeout(function(){$('#contentTable').removeClass("slideIn"); }, 200);
		setTimeout(function(){$('#bodyText').removeClass("moveIn"); }, 400);
		setTimeout(function(){$('#subtitle').removeClass("moveIn"); }, 600);
		if (giD==10) {
			$('#help').removeClass();
			deactivateHelpButton();
			setTimeout(function(){ launchAttract(); },1000);
		} else {
			setTimeout(function(){ giD%=10; fillSection(giD++); },1000);
		}
		if (giD==6) {
			$('#seal').removeClass("stamp");
			setTimeout(function(){$('#photo').removeClass("moveIn"); }, 100);
			setTimeout(function(){ $('#photo').css({ 'display':'none' }); }, 900);
	
		} else {
			setTimeout(function(){ $('aside').css({ 'display':'none' }); }, 900);
		}
	
		var offset = $('#contentTable').offset();
		$('#contentTable').css( 'background-position-y', 7-offset.top*1.0+ 'px');
		
	});
}


function deactivateNextButton() {
	$(nextButton).unbind('mousedown click').removeClass('moveIn drop');
}


function secondsCounter() {
	inactivityCount++;
	$("#inactivityAlertBox center").html(inactivityCount);
	if(inactivityTolerance<inactivityCount) inactivityAlert();
}

function inactivityAlert() { 
	$("#inactivityAlertBox").addClass('showMe');
	inactivityAlertVisible = true;
	clearTimeout(inactivityTimer);
	setTimeout(function(){ inactivityTimer = setTimeout(function(){secondsCountdown()}, 1000); }, 500);
	countDown = 10;
	$("#inactivityAlertBox center").html(countDown);
}

function secondsCountdown() {
	if ( countDown-- ) {
			$("#inactivityAlertBox center").html(countDown);
			clearTimeout(inactivityTimer);
			inactivityTimer = setTimeout(function(){secondsCountdown()}, 1000);
		} else {
			clearTimeout(inactivityTimer);
			//	window.location.reload();
			//	 or  these three lines /**/
			$("#inactivityAlertBox").removeClass('showMe'); //
			inactivityAlertVisible = false; //
			$('#attract').css({'display':'block' });	
			setTimeout(function(){ launchAttract(); },1000);
		}
}

function resetInactivityTimer() {
	clearTimeout(inactivityTimer);
	if (attractIsPlaying) { 
		$('#attractbuttons').addClass('movein');
	} else {
		inactivityTimer = setTimeout(function(){ inactivityAlert(); },inactivityTolerance*1000);
		if ( inactivityAlertVisible ) {
		  $("#inactivityAlertBox").removeClass('showMe'); 
		  inactivityAlertVisible = false;
		  clickA.play();
		  setTimeout(function(){ clickB.play(); },180);
		} else {
			timerCallback = secondsCounter;
			inactivityCount=0;
			$("#inactivityAlertBox center").html(inactivityCount);
		}
	}
}

function launchAttract() {
	deactivateNextButton();
	attractIsPlaying=true;
	clearTimeout(inactivityTimer);

	if (visibiltyAccess) {
		visibiltyAccess = false;
		$('#outerContainer').removeClass('makeNegative');
	}
	
	$('#attract').css({'display':'block' });
	$('#taketutorial').mousedown(function(){ clickA.play(); $(this).addClass('pressed'); });
	$('#taketutorial').mouseout(function(){ $(this).removeClass('pressed'); });
	$("#taketutorial").click(function(){
		clickB.play();
		$(this).removeClass('pressed');
		deactivateAttract();
		giD=0;
		fillSection(giD++);
	});
	
	$('#playgame').mousedown(function(){ clickA.play();$(this).addClass('pressed'); });
	$('#playgame').mouseout(function(){ $(this).removeClass('pressed'); });
	$("#playgame").click(function(){
		clickB.play();
		$(this).removeClass('pressed');
		deactivateAttract();
		giD=5;
		fillSection(giD++);
	});
	
	$('#buttonBar').css({'opacity':'0'});
	setTimeout(function(){
		//setAttractButtonTimer();
		attractvideo.play();
		//attractvideo.addEventListener("playing", function() { setAttractButtonTimer(); }, true);
		$('#ticker').removeClass().addClass( 'hidden' );
		$('#attract').addClass('fadein');
		$('aside').removeClass('slideIn').removeAttr( 'style' ).css({'display':'none'});
		$('#subtitle').removeClass();
		$('#bodyText').removeClass();
		$('#contentTable').removeClass();
		$('#question').removeClass();
		$('.choice').removeClass().addClass('choice').removeAttr( 'style' );
		$('#correctAnswer').removeClass();
		$('#help').removeClass();
		$('#helpPanel').removeClass();
		$('#seal').removeClass();
		$('#photo').removeClass();
		$('#buttonBar .nextButton').removeClass('moveRight');
	},1000);
}

function setAttractButtonTimer() {
	clearTimeout(attractButtonTimer);
	//attractButtonTimer = setTimeout(function(){ hideAttractButtons(); }, 1600);
}

function displayAttractButtons() {
	$('#attractbuttons').addClass('movein');
	clearTimeout(attractButtonTimer);
	//attractButtonTimer = setTimeout(function(){ hideAttractButtons(); }, 5500);
	
}
function hideAttractButtons() {
	$('#attractbuttons').removeClass('movein');	
	clearTimeout(attractButtonTimer);
	//attractButtonTimer = setTimeout(function(){ displayAttractButtons(); }, 8400);

}

function advanceSection() {
	ageCount++;
	ageCount%=4;
}

function deactivateAttract() {
	clearTimeout(attractButtonTimer);
	//$('#buttonBar').css({'opacity':'1'});
	$('#buttonBar').removeAttr( 'style' );
	$('#taketutorial').unbind('mousedown click');
	$('#playgame').unbind('mousedown click');
	attractIsPlaying = false;
	$('#attract').removeClass();
	setTimeout(function(){ attractvideo.pause(); attractvideo.currentTime = 0; },1000);
	setTimeout(function(){ $('#attract').css({'display':'none' }); },1100);
}