

<html>

<head>
  <title>
    Mandelbrot Set Visualization
  </title>
  
  <meta property="og:title" content="Mandelbrot Set Visualization" />
  <meta property="og:description" content="Pan and zoom and watch it go" />
  <meta property="og:image" content="http://william.hoza.us/images/mandelbrot-small.png" />
  
  <style>
    A
    {
      color:#00FFFF;
    }
  </style>
</head>

<body style="background-color:black;" onkeydown="body_keydown(event);" onkeyup="body_keyup(event);" onmouseup="body_mouseup(event);" onmousemove="body_mousemove(event);">

<div style="text-align:center;">
  <table style="color:white;display:inline-block;" cellspacing="0px" cellpadding="0px" border="0" onselectstart="return false;">
    <tr>
      <td style="padding-right:20px;">
  <script type="text/javascript"><!--
  google_ad_client = "ca-pub-7377269250431987";
  /* mandelbrot2 */
  google_ad_slot = "9744056722";
  google_ad_width = 120;
  google_ad_height = 600;
  //-->
  </script>
  <script type="text/javascript"
  src="http://pagead2.googlesyndication.com/pagead/show_ads.js">
  </script>
      </td>
      <td valign="middle" style="border:1px solid #940f04;padding:20px;text-align:center;">
        <div>Double click to zoom in. Right click to zoom out. Drag to pan. <a href=".">Reset</a></div>
        <div style="width:502px;height:502px;overflow:hidden;display:inline-block;background-color:#808080;" onselectstart="return false;">
          <canvas id="canv" width="500px" height="500px" style="position:relative;left:0;top:0;background-color:white;border:1px solid red;" onselectstart="return false;" oncontextmenu="return false;" onclick="canv_click(event);" onmousedown="canv_mousedown(event);" ondblclick="zoom(event,true,zoomPower);">
            You need a canvas-enabled browser. Try Google Chrome or Mozilla Firefox.
          </canvas>
          <canvas id="pathCanv" width="500px" height="500px" style="position:absolute;border:1px solid red;" onselectstart="return false;" oncontextmenu="return false;" onclick="canv_click(event);" onmousedown="canv_mousedown(event);" ondblclick="zoom(event,true,zoomPower);">
          </canvas>
        </div>
        <br>
        <div>
          Rendering... <span id="iters"></span>/&infin; steps complete (0%)
          &nbsp;<a href="help.html" target="_BLANL">???</a>
          &nbsp;<a href="http://william.hoza.us">More cool stuff</a>
        </div>
      </td>
    </tr>
  </table>
</div>

<script type="text/javascript">
  var m=new Array();
  var iterations=0;
  var canv=document.getElementById('canv');
  var ctx=canv.getContext('2d');
  var itersDiv=document.getElementById('iters');
  
  var pathCanv=document.getElementById('pathCanv');
  var pathCtx=pathCanv.getContext('2d');
  
  var xMin=-2.287;
  var xMax=1.713;
  var yMin=-2;
  var yMax=2;
  
  var zoomLevel=1;
  var minDeath=-1;
  var maxDeath=-1;
  var grabX=0;
  var grabY=0;
  var grabbed=false;
  
  var pathSeed=null;
  var pathRe=0;
  var pathIm=0;
  
  var zoomPower=3;
  var shiftHeld=false;
  
  function updateURL()
  {
    <?
    if(isset($_GET['path']))
    {
      ?>
      document.location="./?path#x=" + ((xMax+xMin)/2) + "&y=" + (yMax+yMin)/2 + "&z=" + zoomLevel;
      <?
    }
    else
    {
      ?>
      document.location="./#x=" + ((xMax+xMin)/2) + "&y=" + (yMax+yMin)/2 + "&z=" + zoomLevel;
      <?
    }
    ?>
  }
  
  function zoom(evt,zoomIn,zoomMagnitude)
  {
    var sX=250; 
    var sY=250;
    if(evt)
    {
      sX=screenX(evt.clientX);
      sY=screenY(evt.clientY);
    }
    
    var xWidth=xMax-xMin;
    var yWidth=yMax-yMin;
    
    var actualX=xMin+(sX*xWidth/500);
    var actualY=yMin+(sY*yWidth/500);
    
    var s=zoomIn? 1 : -1;
    var z=s*(1-Math.pow(zoomMagnitude,-s));
    
    xMin+=s*(actualX-xMin)*z;
    xMax-=s*(xMax-actualX)*z;
    yMin+=s*(actualY-yMin)*z;
    yMax-=s*(yMax-actualY)*z;
    
    zoomLevel*=Math.pow(zoomMagnitude,s);
    updateURL();
    
    startOver();
  }
  
  function canv_mousedown(evt)
  {
    if(evt.button==2) //right click
    {
      zoom(evt, false,zoomPower);
    }
    else if(!shiftHeld)
    {
      grabX=evt.clientX;
      grabY=evt.clientY;
      grabbed=true;
    }
    else
    {
      pathCtx.clearRect(0,0,500,500);
      var x = screenX(evt.clientX);
      var y = screenY(evt.clientY);
      for(var i=0;i<m.length;i++)
      {
        if(m[i].sX == x && m[i].sY == y)
        {
          pathSeed=m[i];
          break;
        }
      }
      pathRe=pathSeed.re;
      pathIm=pathSeed.im;
    }
  }
  
  function body_mousemove(evt)
  {
    if(grabbed)
    {
      var dx=grabX-evt.clientX;
      var dy=grabY-evt.clientY;
      canv.style.left=-dx;
      canv.style.top=-dy;
    }
  }
  
  function body_keydown(evt)
  {
    if(evt.keyCode==82) //R
    {
      document.location=".";
    }
    if(evt.keyCode==16) //shift
    {
      shiftHeld=true;
    }
  }
  
  function body_keyup(evt)
  {
    if(evt.keyCode==16) //shift
    {
      shiftHeld=false;
    }
  }
  
  function body_mouseup(evt)
  {
    if(grabbed)
    {
      var dx=grabX-evt.clientX;
      var dy=grabY-evt.clientY;
      
      grabbed=false;
      canv.style.left=0;
      canv.style.top=0;
      
      if(dx!=0 || dy!=0)
      {
        dx*=(xMax-xMin)/500;
        dy*=(yMax-yMin)/500;
        
        xMin+=dx;
        xMax+=dx;
        yMin+=dy;
        yMax+=dy;
        updateURL();
        startOver();
      }
    }
  }
  
  function screenX(cx)
  {
    return cx-canv.offsetLeft;
  }
  function screenY(cy)
  {
    return cy-canv.offsetTop;
  }
  
  function timer()
  {
    checkOneMore();
    draw();

    setTimeout(timer, 0);
  }
  
  function nextPathElement()
  {
    if(pathSeed!=null)
    {
      var newPathRe=Math.pow(pathRe,2)-Math.pow(pathIm,2) + pathSeed.re;
      var newPathIm=2*pathRe*pathIm + pathSeed.im;
      
      var oSX = (pathRe - xMin)/(xMax-xMin) * 500;
      var oSY = (pathIm - yMin)/(yMax-yMin) * 500;
      var sX = (newPathRe - xMin)/(xMax-xMin) * 500;
      var sY = (newPathIm - yMin)/(yMax-yMin) * 500;
      
      pathCtx.beginPath();
      pathCtx.moveTo(oSX, oSY);
      pathCtx.arc(oSX, oSY, 2, 0, 2*Math.PI, false);
      pathCtx.fill();
      pathCtx.moveTo(oSX, oSY);
      pathCtx.lineTo(sX, sY);
      pathCtx.stroke();
      
      pathRe=newPathRe;
      pathIm=newPathIm;
    }
  }
  
  function startOver()
  {
    var screenX=0;
    var screenY=0;
    minDeath=-1;
    //maxDeath=-1;
    iterations=0;
    m=new Array();
    ctx.fillRect(0,0,500,500);
    pathSeed=null;
    pathCtx.clearRect(0,0,500,500);
    
    for(var screenX=0;screenX<500;screenX++)
    {
      for(var screenY=0;screenY<500;screenY++)
      {
        var i=m.length;
        m[i]=new Object();
        m[i].re=xMin+screenX/500*(xMax-xMin);
        m[i].im=yMin+screenY/500*(xMax-xMin);
        m[i].vRe=m[i].re;
        m[i].vIm=m[i].im;
        m[i].death=-1;
        m[i].sX=screenX;
        m[i].sY=screenY;
        updateVal(m[i]);
      }
    }
    
    draw();
  }
  
  function updateVal(p)
  {
    p.val=Math.pow(p.vRe,2)+Math.pow(p.vIm,2);
    if(p.val>4)
    {
      p.death=iterations;
      if(minDeath==-1) minDeath=iterations;
    }
  }
  
  function checkOneMore()
  {
    iterations++;
    for(var i=0;i<m.length;i++)
    {
      if(m[i].death==-1)
      {
        var newVRe=Math.pow(m[i].vRe,2)-Math.pow(m[i].vIm,2) + m[i].re;
        var newVIm=2*m[i].vRe*m[i].vIm + m[i].im;
        
        m[i].vRe=newVRe;
        m[i].vIm=newVIm;
        updateVal(m[i]);
      }
    }
    itersDiv.innerHTML=iterations;
  }
  
  function draw()
  {
    var d=ctx.getImageData(0,0,500,500);
  
    for(var i=0;i<m.length;i++)
    {
      if(m[i].death==iterations) //it JUST died.
      {
        var index=(m[i].sY*d.width+m[i].sX)*4;
        var opac=Math.floor(2550/(m[i].death-minDeath+11));
        
        d.data[index]=255;
        d.data[index+3]=opac;
      }
    }
    ctx.putImageData(d,0,0);
  }
  
  function init()
  {
    var l=document.location + "";
    var i=l.indexOf('#');
    if(i!=-1)
    {
      var s=l.substr(i+1);
      var chunks=s.split("&");
      var cx=parseFloat(chunks[0].substr(2));
      var cy=parseFloat(chunks[1].substr(2));
      var z=parseFloat(chunks[2].substr(2));
      
      var origCx=(xMax+xMin)/2;
      var origCy=(yMax+yMin)/2;
      
      xMin+=cx-origCx;
      xMax+=cx-origCx;
      yMin+=cy-origCy;
      yMax+=cy-origCy;
      
      zoom(null, true, z);
    }
    
    pathCanv.style.left=canv.offsetLeft+8; //why 8 you ask? idk. TODO: figure out
    pathCanv.style.top=canv.offsetTop;
    pathCtx.fillStyle='#0000FF';
    pathCtx.strokeStyle='#0000FF';
    pathCtx.lineWidth=1;
    
    startOver();
    timer();
  }
  
  init();
</script>

</body>

</html>
