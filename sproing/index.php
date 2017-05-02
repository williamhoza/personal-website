<html>

<head>
  <title>
    Sproing
  </title>
  <style>
    .borderleft
    {
      border-left:1px solid #000080;
      padding-left:5px;
    }
  </style>
  
  <meta property="og:title" content="Sproing" />
  <meta property="og:description" content="Just some fun sproingies" />
  <meta property="og:image" content="http://william.hoza.us/sproing/thumb.png" />
</head>

<body onresize="needsToResize=true;" onload="bodyLoad();" onblur="holdingShift=false;holdingCtrl=false;if(huntedObject!=null) { huntedObject.hunted=false;huntedObject.grabbed=false;huntedObject=null; }" onkeydown="bodyKeyDown(event);" onkeyup="bodyKeyUp(event);" style="padding:0px;margin:0px;background-color:#000000;">
  <div style="background-color:#C0FFE0;" id="topBox">
    <table cellpadding="0px" cellspacing="0px" style="padding:5px;font-size:9pt;">
      <tr>
        <td>
          <b style="font-size:12pt;">How to use:</b><br>
        </td>
        <td colspan="3" class="borderleft">
          <b style="font-size:12pt;">Options:</b><br>
        </td>
        <td rowspan="5" style="padding-left:15px;">
<script type="text/javascript"><!--
google_ad_client = "ca-pub-7377269250431987";
/* sproing ad */
google_ad_slot = "4617515242";
google_ad_width = 125;
google_ad_height = 125;
//-->
</script>
<script type="text/javascript"
src="http://pagead2.googlesyndication.com/pagead/show_ads.js">
</script>
        </td>
      </tr>
      <tr>
        <td valign="top" rowspan="4" style="width:250px;">
          <b>Click</b> to add a ball.
          <b>Click+drag</b> to add a square.
          <b>Click+drag stuff</b> to move it.
          <b>Shift+click stuff</b> to delete it.
          Use fullscreen for best results.
          <br><br>
          more cool stuff: <a href="http://william.hoza.us">http://william.hoza.us</a>
        </td>
        <td class="borderleft">
          Gravitational constant:
        </td>
        <td>
          <input type="text" id="gInp">
        </td>
        <td rowspan="2" valign="top" style="padding-left:10px;padding-bottom:0px;">
          <input type="radio" name="gravStyle" id="planet" CHECKED> <label for="gravStyle">Balls fall downward</label><br>
          <input type="radio" name="gravStyle" id="space"> <label for="gravStyle">Balls attract each other</label>
        </td>
      </tr>
      <tr>
        <td class="borderleft">
          Ball decay constant:
        </td>
        <td>
          <input type="text" id="ageInp">
        </td>
      </tr>
      <tr>
        <td class="borderleft">
          Spring decay constant:
        </td>
        <td>
          <input type="text" id="decayInp">
        </td>
        <td rowspan="2" valign="bottom" style="text-align:right;">
          <button onclick="updateStuff();" style="font-size:15pt;">apply</button>
        </td>
      </tr>
      <tr>
        <td class="borderleft">
          Maximum spring stiffness:
        </td>
        <td>
          <input type="text" id="stiffnessInp">
        </td>
      </tr>
    </table>
    <span id="debug" style="font-size:8pt;"></span>
  </div>
  <canvas onmousedown="canvMouseDown(event);return false;" onmousemove="canvMouseMove(event);" onmouseup="canvMouseUp(event);" id="canv">you need a canvas-enabled web browser like chrome or firefox</canvas>

  <script type = "text/javascript">
    var hubs = new Array();
    var springs = new Array();
    var blocks = new Array();

    var holdingShift=false;

    var springLimit=8;
    var idNumber = 0;
    
    var canv=document.getElementById('canv');
    var ctx=canv.getContext('2d');
    var topBox=document.getElementById('topBox');
    var debugSpan=document.getElementById('debug');

    var g = 0.33;
    var decay = 0;
    var agingRate=1;
    var stiffness=30;
    var topAccel=100;
    
    var grabX=0;
    var grabY=0;
    var canvMouseIsDown=false;
    var buildingBlock=false;

    var huntedObject;
    var planet=true;
    var loaded=false;
    var lastResizeTime=0;
    var needsToResize=false;
    var canvX;
    var canvY;
    
    fixTxts();
    
    document.getElementById('gInp').value=g;
    document.getElementById('decayInp').value=decay;
    document.getElementById('ageInp').value=agingRate;
    document.getElementById('stiffnessInp').value=stiffness;

    function debug(s)
    {
      debugSpan.innerHTML=s+":"+debugSpan.innerHTML;
    }

    function bodyResize()
    {
      lastResizeTime=new Date().getTime();
      canvWidth=document.body.clientWidth;
      canvHeight=document.body.clientHeight-topBox.offsetHeight;
      canv.width=canvWidth;
      canv.height=canvHeight;
      
      blocks[0].width=canvWidth+100; //(-50,-50,canvWidth+100,50)
      
      blocks[1].width=canvWidth+100;
      blocks[1].move(-50,canvHeight); //(-50,canvHeight,canvWidth+100,50)
      
      
      blocks[2].height=canvHeight; //(-50,0,50,canvHeight)
      
      blocks[3].height=canvHeight;
      blocks[3].move(canvWidth,0); //(canvWidth,0,50,canvHeight)
    }

    function fixTxts()
    {
      document.getElementById('planet').checked=planet;
      document.getElementById('space').checked=!planet;
      document.getElementById('ageInp').value=agingRate;
      document.getElementById('decayInp').value=decay;
      document.getElementById('stiffnessInp').value=stiffness;
      document.getElementById('gInp').value=g;
    }
    
    function updateStuff()
    {
      planet=document.getElementById('planet').checked;
      agingRate=parseFloat(document.getElementById('ageInp').value);
      decay=parseFloat(document.getElementById('decayInp').value);
      stiffness=parseFloat(document.getElementById('stiffnessInp').value);
      g=parseFloat(document.getElementById('gInp').value);
    }

    function radiansFromPoints(dx, dy)
    {
      var slope = 0;
      var angle = 0;

      if (dx == 0)
      {
        return Math.PI / 2 * sgn(dy);
      }
      else
      {
        slope = dy / dx;
        angle = Math.atan(slope);
        if (dx < 0) angle += Math.PI;

        return angle;
      }
    }

    function sgn(num)
    {
      if(num>0)
      {
        return 1;
      }
      else if(num<0)
      {
        return -1;
      }
      return 0;
    }

    function hub(x, y, xSpeed, ySpeed, index, beginning)
    {
      this.id = ++idNumber;
      this.index=index;
      this.hunted=false;
      
      this.offsetX=0;
      this.offsetY=0;
      this.grabbed=false;

      this.x = x;
      this.y = y;

      this.xSpeed = xSpeed;
      this.ySpeed = ySpeed;

      this.m = Math.random()*200+50;
      this.grounded = false;

      this.springs = 0;
      this.joinedHubs = new Object();

      this.totalForceX = 0;
      this.totalForceY = 0;
      
      this.life=1;
      if(beginning==undefined) beginning=true;
      this.beginning=beginning;
    }
    hub.prototype.draw=hub_draw;
    hub.prototype.move=hub_move;
    hub.prototype.obType="hub";
    
    function hub_move()
    {
      if (this.springs < springLimit || !planet)
      {
        var dist=0;
        for (var i = 0; i < hubs.length; i++)
        {
          if(hubs[i] !== this)
          {
            distSquared=Math.pow(hubs[i].x-this.x,2)+Math.pow(hubs[i].y-this.y,2);
            dist=Math.sqrt(distSquared);
            
            if(dist < 8*springLimit - 4*(hubs[i].springs+this.springs))
            {
              if(hubs[i].springs<springLimit)
              {
                if(!hubs[i].joinedHubs[this.id])
                {
                  addSpring(this, hubs[i], 50);
                }
              }
            }
            
            if(!planet)
            {
              if(dist<100) distSquared=10000;
            
              var force = g * 6 * hubs[i].m * this.m / distSquared;
              var angle = radiansFromPoints(hubs[i].x-this.x,hubs[i].y-this.y);
            
              this.totalForceX += force * Math.cos(angle);
              this.totalForceY += force * Math.sin(angle);
            }
          }
        }
      }

      if(planet) this.totalForceY += this.m * g;
      if (this.grounded) this.xSpeed *= 0.95;

      //this.totalForceX -= this.xSpeed * 1;
      //this.totalForceY -= this.ySpeed * 1;

      this.xSpeed += this.totalForceX / this.m;
      this.ySpeed += this.totalForceY / this.m;
      
      if(Math.abs(this.xSpeed-this.oldXSpeed)>topAccel || Math.abs(this.ySpeed-this.oldYSpeed)>topAccel) //not really accel, but it's what I care about atm
      {
        //accelerating too fast! sever all ties! (solves explosion problem)
        for(var j in this.joinedHubs)
        {
          springs[this.joinedHubs[j].id].k=-1; //effectively deleting those springs
        }
      }
      

      var oldX = this.x;
      var oldY = this.y;

      this.x += this.xSpeed;
      this.y += this.ySpeed;

      this.grounded = false;

      for (i = 0; i < blocks.length; i++)
      {
        <? 
        if($_GET['julianna']=='true')
        {
          ?>
          if (this.x > blocks[i].x && this.x < blocks[i].x + blocks[i].width
            && this.y > blocks[i].y && this.y < blocks[i].y + blocks[i].height)
          {
            if (oldX > blocks[i].x && oldX < blocks[i].x + blocks[i].width)
            {
              this.ySpeed *= -1;
              this.y += this.ySpeed;
              this.ySpeed *= 0.8;

              if (this.y < blocks[i].y && Math.abs(this.ySpeed) < 1) this.grounded = true;
            }
            else
            {
              this.xSpeed *= -1;
              this.x += this.xSpeed;
              this.xSpeed *= 0.8;
            }
          }
          <?
        }
        else
        {?>
          if((this.x>blocks[i].x != oldX>blocks[i].x || this.x<blocks[i].x+blocks[i].width != oldX<blocks[i].x+blocks[i].width)
              && ((this.y>blocks[i].y && this.y<blocks[i].y+blocks[i].height)
              || (oldY>blocks[i].y && oldY<blocks[i].y+blocks[i].height)))
          {
            //uh oh. crossed over left/right side of block.
            this.xSpeed*=-1;
            this.x+=this.xSpeed;
            this.xSpeed*=0.8;
          }
          
          if((this.y>blocks[i].y != oldY>blocks[i].y || this.y<blocks[i].y+blocks[i].height != oldY<blocks[i].y+blocks[i].height)
              && ((this.x>blocks[i].x && this.x<blocks[i].x+blocks[i].width)
              ||(oldX>blocks[i].x && oldX<blocks[i].x+blocks[i].width) ))
          {
            //uh oh. crossed over top/bottom side of block.
            this.ySpeed*=-1;
            this.y+=this.ySpeed;
            this.ySpeed*=0.8;
            
            if(Math.abs(this.ySpeed)<1) this.grounded=true;
          }
          <?
        }?>
      }

      this.totalForceX = 0;
      this.totalForceY = 0;
      
      
      this.oldXSpeed=this.xSpeed;
      this.oldYSpeed=this.ySpeed;
      
      
      this.life-=agingRate/3000;
    }
    function hub_draw()
    {
      ctx.lineCap='round';
      if(this.hunted)
      {
        ctx.fillStyle='rgba(0,255,0,0.5)';
        ctx.beginPath();
        ctx.arc(this.x,this.y,10,0,Math.PI*2,true);
        ctx.fill();
      }
      ctx.lineWidth=10;
      ctx.fillStyle='rgba(0,255,0,'+goodNum(this.life)+')';
      ctx.beginPath();
      ctx.arc(this.x,this.y,5,0,Math.PI*2,true);
      ctx.fill();
    }

    function spring(hub1, hub2, length)
    {
      this.k = Math.random() * stiffness/2 + stiffness/2;
      this.damper= Math.random()*0.4 + 0.1;
      this.nLength = length + Math.random() * 20; //natural length
      this.cLength = 0; //current length
      this.oLength=this.nLength;

      this.hub1 = hub1;
      this.hub2 = hub2;
      
      this.velocity=0; //this is the velocity of the length.

      hub1.springs++;
      hub2.springs++;
      hub1.joinedHubs[hub2.id] = this;
      hub2.joinedHubs[hub1.id] = this;
      
      this.id=0;
    }
    spring.prototype.act=spring_act;
    spring.prototype.draw=spring_draw;
    
    function spring_act()
    {
      var dx = this.hub1.x - this.hub2.x;
      var dy = this.hub1.y - this.hub2.y;

      this.cLength = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

      var displacement = this.nLength - this.cLength;
      
      this.velocity=this.cLength-this.oLength;
      
      var springForce = this.k * displacement;
      var angle = radiansFromPoints(dx, dy);
      
      var totForce = springForce - this.damper * this.k * this.velocity;
      
      var totForceX=totForce*Math.cos(angle);
      var totForceY=totForce*Math.sin(angle);
      
      this.hub1.totalForceX+=totForceX;
      this.hub1.totalForceY+=totForceY;
      
      this.hub2.totalForceX-=totForceX;
      this.hub2.totalForceY-=totForceY;
      
      this.oLength=this.cLength;

      this.k+=displacement * decay / 100;
      if(this.k>stiffness)
      {
        this.k=stiffness;
      }
    }
    function spring_draw()
    {
      ctx.lineWidth=2;
      ctx.strokeStyle='rgba(0,255,0,'+goodNum(this.k/stiffness * Math.max(this.hub1.life,0.5) * Math.max(this.hub2.life,0.5))+')';
      
      ctx.beginPath();
      ctx.moveTo(this.hub1.x,this.hub1.y);
      ctx.lineTo(this.hub2.x,this.hub2.y);
      ctx.stroke();
    }
    
    function block(x, y, width, height, index)
    {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.hunted=false;
      this.offsetX=0;
      this.offsetY=0;
      this.grabbed=false;
      this.index=index;
    }
    block.prototype.draw=block_draw;
    block.prototype.move=block_move;
    block.prototype.obType="block";
    
    function block_draw()
    {
      if(this.hunted)
      {
        ctx.lineWidth=20;
        ctx.strokeStyle='rgba(255,0,0,0.15)';
        ctx.strokeRect(this.x,this.y,this.width,this.height);
      }
      ctx.strokeStyle='rgb(255,0,0)';
      ctx.lineWidth=3;
      ctx.strokeRect(this.x,this.y,this.width,this.height);
    }
    function block_move(newX,newY)
    {
      var oldX=this.x;
      var oldY=this.y;
      this.x=newX;
      this.y=newY;
      
      for(i=0;i<hubs.length;i++)
      {
        if((hubs[i].x>oldX != hubs[i].x>newX || hubs[i].x<oldX+this.width != hubs[i].x<newX+this.width)
            && ((hubs[i].y>newY && hubs[i].y<newY+this.height)
            || (hubs[i].y>oldY && hubs[i].y<oldY+this.height)))
        {
          //uh oh. crossed over left/right side of block.
          hubs[i].x+=(newX-oldX)*1.1;
        }
        
        if((hubs[i].y>oldY != hubs[i].y>newY || hubs[i].y<oldY+this.height != hubs[i].y<newY+this.height)
            && ((hubs[i].x>newX && hubs[i].x<newX+this.width)
            || (hubs[i].x>oldX && hubs[i].x<oldX+this.width)))
        {
          //uh oh. crossed over top/bottom side of block.
          hubs[i].y+=(newY-oldY)*1.1;
          
          if(Math.abs(hubs[i].ySpeed)<1) hubs[i].grounded=true;
        }
      }
    }

    function addHub(x, y, xSpeed, ySpeed, beginning)
    {
      if(loaded) return hubs[hubs.length] = new hub(x, y, xSpeed, ySpeed, hubs.length, beginning);
    }

    function addSpring(hub1, hub2, length)
    {
      springs[springs.length] = new spring(hub1, hub2, length);
      springs[springs.length-1].id=springs.length-1;
      hub1.life=1;
      hub2.life=1;
    }

    function addBlock(x, y, width, height)
    {
      blocks[blocks.length] = new block(x, y, width, height, blocks.length);
    }
    
    function goodNum(n)
    {
      return Math.abs(Math.round(n*1000)/1000);
    }

    function killHub(i)
    {
      for(var j in hubs[i].joinedHubs)
      {
        springs[hubs[i].joinedHubs[j].id].k=-1; //effectively deleting those springs
      }
      
      hubs.splice(i,1);
    }

    function timer()
    {
      ctx.clearRect(0,0,canvWidth,canvHeight);
      
      for(var i=0;i<blocks.length;i++)
      {
        blocks[i].index=i;
        blocks[i].draw();
      }
      
      for(i=0;i<springs.length;i++)
      {
        springs[i].act();
        if(springs[i].k<0)
        {
          delete springs[i].hub1.joinedHubs[springs[i].hub2.id];
          delete springs[i].hub2.joinedHubs[springs[i].hub1.id];
          springs[i].hub1.springs--;
          springs[i].hub2.springs--;
        
          springs.splice(i,1);
          i--;
        }
        else
        {
          springs[i].id=i;
        }
      }
      
      for(i=0;i<hubs.length;i++)
      {
        hubs[i].index=i;
        if(!hubs[i].grabbed)
        {
          hubs[i].move();
        }
        else
        {
          hubs[i].totalForceX=0;
          hubs[i].totalForceY=0;
        }
        if(hubs[i].life<=0.3)
        {
          killHub(i);
          i--;
        }
      }
      
      
      for(i=0;i<springs.length;i++)
      {
        springs[i].draw();
      }
      for(i=0;i<hubs.length;i++)
      {
        hubs[i].draw();
      }

      movingMouseStuff();

      if(needsToResize)
      {
        var curTime=new Date().getTime();
        if(curTime-lastResizeTime>1500)
        {
          bodyResize();
          needsToResize=false;
        }
      }

      setTimeout("timer();", 33);
    }

    function bodyLoad()
    {
      //makeSquare(200, 50, 50);
      
      loaded=true;
      canvWidth=document.body.clientWidth;
      canvHeight=document.body.clientHeight-topBox.offsetHeight;
      canv.width=canvWidth;
      canv.height=canvHeight;

      addBlock(-50,-50,canvWidth+100,50);
      addBlock(-50,canvHeight,canvWidth+100,50);
      addBlock(-50,0,50,canvHeight);
      addBlock(canvWidth,0,50,canvHeight);
      
      addHub(canvWidth/2-20,canvHeight-20,0,0,false);
      addHub(canvWidth/2+20,canvHeight-20,0,0,false);
      addHub(canvWidth/2-20,canvHeight,0,0,false);
      addHub(canvWidth/2+20,canvHeight,0,0,false);

      /*
      addBlock(84, 269, 266, 32);
      addBlock(84, 481, 600, 17);
      
      //walls
      addBlock(0, 780, 800, 20);
      addBlock(780, 0, 20, 780);
      addBlock(0, 0, 780, 20);
      addBlock(0, 20, 20, 760);
      */

      timer();
    }

    function bodyKeyDown(evt)
    {
      if(evt.keyCode==16) //shift
      {
        holdingShift=true;
      }
      else if(evt.keyCode==13)
      {
        updateStuff();
      }
    }

    function bodyKeyUp(evt)
    {
      if(evt.keyCode==16) //shift
      {
        holdingShift=false;
        if(huntedObject!=null)
        {
          huntedObject.hunted=false;        
          huntedObject=null;
        }
      }
    }

    function canvMouseDown(evt)
    {
      var canvX=evt.clientX;
      var canvY=evt.clientY-canv.offsetTop;
      canvMouseIsDown=true;
      grabX=canvX;
      grabY=canvY;
      var curBlock;
      var curHub;
      var killedHub=false;
      
      if(huntedObject!=null)
      {
        if(holdingShift)
        {
          if(huntedObject.obType=="hub")
          {
            killHub(huntedObject.index);
          }
          else
          {
            blocks.splice(huntedObject.index,1);
          }
          huntedObject=null;
        }
        else
        {
          huntedObject.offsetX=canvX-huntedObject.x;
          huntedObject.offsetY=canvY-huntedObject.y;
          huntedObject.grabbed=true;
          huntedObject.xSpeed=0;
          huntedObject.ySpeed=0;
        }
      }
    }
    
    function movingMouseStuff()
    {
      if(canvMouseIsDown && huntedObject!=null && !huntedObject.grabbed)
      {
        //it fell into my waiting grasp.
        huntedObject.offsetX=canvX-huntedObject.x;
        huntedObject.offsetY=canvY-huntedObject.y;
        huntedObject.grabbed=true;
        huntedObject.xSpeed=0;
        huntedObject.ySpeed=0;
      }
      
      if(canvMouseIsDown && huntedObject==null && ((Math.abs(canvX-grabX) > 15 && Math.abs(canvY-grabY) > 15) || buildingBlock))
      {
        var left=Math.min(grabX,canvX);
        var top=Math.min(grabY,canvY);
        
        var width=Math.abs(grabX-canvX);
        var height=Math.abs(grabY-canvY);
        
        if(!buildingBlock)
        {
          if(!holdingShift)
          {
            addBlock(left,top,width,height);
            buildingBlock=true;
          }
        }
        else
        {
          blocks[blocks.length-1].x=left;
          blocks[blocks.length-1].y=top;
          blocks[blocks.length-1].width=width;
          blocks[blocks.length-1].height=height;
        }
      }
      else if(huntedObject!=null && huntedObject.grabbed)
      {
        canv.style.cursor="move";
        if(huntedObject.obType=="block")
        {
          huntedObject.move(canvX-huntedObject.offsetX, canvY-huntedObject.offsetY);
        }
        else
        {
          huntedObject.x=canvX-huntedObject.offsetX;
          huntedObject.y=canvY-huntedObject.offsetY;
          if(huntedObject.obType=='hub') huntedObject.life=1;
        }
      }
      else
      {
        var huntingHub=false;
        canv.style.cursor="default";
        if(huntedObject!=null)
        {
          huntedObject.hunted=false;
          huntedObject=null;
        }
        for(i=0;i<hubs.length;i++)
        {
          curHub=hubs[i];
          if(hubs[i].x-15<=canvX && hubs[i].y-15<=canvY && hubs[i].x+15>=canvX && hubs[i].y+15>=canvY)
          {
            if(!hubs[i].beginning)
            {
              //user hovered on hub.
              curHub.hunted=true;
              huntedObject=curHub;
              huntingHub=true;
              break;
            }
          }
          else
          {
            curHub.beginning=false;
          }
        }
        if(!huntingHub)
        {
          for(var i=4;i<blocks.length;i++) //start at 4 because the first 4 are walls. they don't move/get deleted.
          {
            curBlock=blocks[i];
            if(((Math.abs(curBlock.x-canvX)<15 || Math.abs(curBlock.x+curBlock.width-canvX)<15) && canvY>=curBlock.y-15 && canvY<=curBlock.y+curBlock.height+15)
              || ((Math.abs(curBlock.y-canvY)<15 || Math.abs(curBlock.y+curBlock.height-canvY)<15) && canvX>=curBlock.x-15 && canvX<=curBlock.x+curBlock.width+15))
            {
              //user hovered on block while holding shift or ctrl.
              curBlock.hunted=true;
              huntedObject=curBlock;
              break;
            }
          }
        }
        if(huntedObject!=null) canv.style.cursor="pointer";
      }
    }
    
    function canvMouseMove(evt)
    {
      canvX=evt.clientX;
      canvY=evt.clientY-canv.offsetTop;
    }
    
    function canvMouseUp(evt)
    {
      if(canvMouseIsDown)
      {
        if(!buildingBlock && !holdingShift && huntedObject==null)
        {
          var canvX=evt.clientX;
          var canvY=evt.clientY-canv.offsetTop;
          addHub(canvX,canvY,0,0);
        }
        else if(huntedObject!=null)
        {
          huntedObject.grabbed=false;
        }
        buildingBlock=false;
        canvMouseIsDown=false;
      }
    }

    /*
    function bodyClick(evt)
    {
      var canvX=evt.clientX;
      var canvY=evt.clientY-canv.offsetTop;
      addHub(canvX, canvY, 0, 0);
    }
    */
  </script>
</body>

</html>