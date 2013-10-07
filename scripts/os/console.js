/* ------------
Console.js

Requires globals.js

The OS Console - stdIn and stdOut by default.
Note: This is not the Shell. The Shell is the "command line interface" (CLI) or interpreter for this console.
------------ */

function CLIconsole() {
    // Properties
    this.CurrentFont = _DefaultFontFamily;
    this.CurrentFontSize = _DefaultFontSize;
    this.CurrentXPosition = 0;
    this.CurrentYPosition = _DefaultFontSize;
    this.buffer = "";
    var lastChr = new Array("");
    var lastCmd = "";

    // Methods
    this.init = function() {
       this.clearScreen();
       this.resetXY();
    };

    this.clearScreen = function() {
       _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
    };

    this.resetXY = function() {
       this.CurrentXPosition = 0;
       this.CurrentYPosition = this.CurrentFontSize;
    };

    this.handleInput = function() {
       while (_KernelInputQueue.getSize() > 0)
       {
           // Get the next character from the kernel input queue.
           var chr = _KernelInputQueue.dequeue();
           // Check to see if it's "special" (enter or ctrl-c) or "normal" (anything else that the keyboard device driver gave us).
           if (chr == String.fromCharCode(13)) // Enter key
           {
			   var i = 0;
			   while(i<lastChr.length)
			   {
			       lastCmd += lastChr[i];
			       i+=1;
               }
               // The enter key marks the end of a console command, so ...
               // ... tell the shell ...
               _OsShell.handleInput(this.buffer);
               // ... and reset our buffer.
               this.buffer = "";
           }
           else if (chr == String.fromCharCode(38))
		   {
		   		this.putText(lastCmd);
		   		var i = 0;
		   		while(i<lastCmd.length){
		   			this.buffer += lastCmd.charAt(i);
		   			i+=1;
		   				}
           }
           else if (chr == String.fromCharCode(8)&&this.buffer.length>0)
		  	{
		   		if (lastChr[lastChr.length-1] !== "")
		        {
		            var offset = _DrawingContext.measureText(this.CurrentFont, this.CurrentFontSize, lastChr[lastChr.length-1]);
		        }

		   		_DrawingContext.clearRect(this.CurrentXPosition-offset,this.CurrentYPosition-this.CurrentFontSize, offset, this.CurrentFontSize+_FontHeightMargin);
		   		this.buffer = this.buffer.slice(0,this.buffer.length-1);
		   		this.CurrentXPosition = this.CurrentXPosition - offset;
		   		lastChr = lastChr.slice(0,lastChr.length-1);
		   }
           // TODO: Write a case for Ctrl-C.
           else
           {
               // This is a "normal" character, so ...
               // ... draw it on the screen...
               this.putText(chr);
               // ... and add it to our buffer.
               this.buffer += chr;
               lastChr[lastChr.length] = chr;
           }
       }
    };

    this.putText = function(text) {
       // My first inclination here was to write two functions: putChar() and putString().
       // Then I remembered that JavaScript is (sadly) untyped and it won't differentiate
       // between the two. So rather than be like PHP and write two (or more) functions that
       // do the same thing, thereby encouraging confusion and decreasing readability, I
       // decided to write one function and use the term "text" to connote string or char.
       if (text !== "")
       {
           // Draw the text at the current X and Y coordinates.
           _DrawingContext.drawText(this.CurrentFont, this.CurrentFontSize, this.CurrentXPosition, this.CurrentYPosition, text);
         // Move the current X position.
           var offset = _DrawingContext.measureText(this.CurrentFont, this.CurrentFontSize, text);
           this.CurrentXPosition = this.CurrentXPosition + offset;
       }
    };

    this.advanceLine = function() {
       this.CurrentXPosition = 0;
       this.CurrentYPosition += _DefaultFontSize + _FontHeightMargin;
       //Scroll when the Y position is below the bottom of the canvas, multiple font size by two because we need to move down one line
       //for each line being displayed and a second line for the prompt and/or doing that just makes it work like magic
       if (this.CurrentYPosition > _Canvas.height){
			//move(_DrawingContext, this.CurrentFontSize);
			var imgData = _DrawingContext.getImageData(0,(this.CurrentFontSize*2),_Canvas.width,_Canvas.height-(this.CurrentFontSize*2));
			this.clearScreen();
			_DrawingContext.putImageData(imgData, 0,0);
			this.CurrentYPosition = this.CurrentYPosition - (this.CurrentFontSize*2)
	   }
    };
}