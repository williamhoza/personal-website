<html>

<head>
  <title>
    Centrifuge Volleyball!
  </title>
  
  <meta property="og:title" content="Centrifuge Volleyball" />
  <meta property="og:description" content="Confusing and difficult two-player game" />
  <meta property="og:image" content="http://william.hoza.us/images/volleyball-small.png" />
</head>

<body onkeydown="body_keydown(event);" onkeyup="body_keyup(event);" style="margin:0px;">
  <audio id="hitSound" preload="PRELOAD">
    <source src="hit.ogg" type="audio/ogg" />
    <source src="hit.mp3" type="audio/mpeg" />
  </audio>
  <audio id="oopsSound" preload="PRELOAD">
    <source src="oops.ogg" type="audio/ogg" />
    <source src="oops.mp3" type="audio/mpeg" />
  </audio>
  <audio id="winSound" preload="PRELOAD">
    <source src="win.ogg" type="audio/ogg" />
    <source src="win.mp3" type="audio/mpeg" />
  </audio>
  <div style="text-align:center;">
<script type="text/javascript"><!--
google_ad_client = "pub-7377269250431987";
/* 728x90, created 8/16/11 */
google_ad_slot = "0572397802";
google_ad_width = 728;
google_ad_height = 90;
//>
</script>
<script type="text/javascript"
src="http://pagead2.googlesyndication.com/pagead/show_ads.js">
</script>
    <div style="margin-top:10px;margin-bottom:10px;font-family:sans-serif;font-size:13px;">
      Use <a href="http://google.com/chrome">Google Chrome</a> for best results. More cool stuff: <a href="http://william.hoza.us">http://william.hoza.us</a>
    </div>
    <canvas id="canv" width="450px" height="450px" style="background-color:#000000;" onclick="canv_click(event);" onmousemove="canv_mousemove(event);">
      To play this game, you need a canvas-enabled browser, such as Google Chrome.
    </canvas>
    <br>
    <span style="font-size:10px;"><span id="fps">-</span> fps</span>
  </div>

  <script type="text/javascript">
    var canv=$('canv');
    var ctx=canv.getContext('2d');
    var cylinderRadius=200;
    var cylinderAngle=0;
    var camAngle=0;
    var angVelocity=0.02;
    var camAngVelocity=0.02;
    var players=new Array();
    var balls=new Array();
    var numberOfPlayers=2;
    var num=1150;
    var startTime=null;
    var gameStarted=false;
    var highPerformance=true;
    var gameScore=25;
    var gameEnded=false;
    var winner=-1;
    var multiplier=1;
    /* To anyone reading this code: There is a secret query string
       parameter ?m=x where x is any positive number. It gives blue an
       advantage if x<1 and it gives blue a disadvantage if x>1.
       Centrifuge Volleyball multiplies blue's score by x for the
       purpose of calculating the size of the sectors. */
    
    <? if(isset($_GET['m'])) echo "multiplier=" . $_GET['m'] . ";" ?>
    
    var stars=new Array();
    
    var KEY_LEFT=37;
    var KEY_RIGHT=39;
    var KEY_UP=38;
    
    var KEY_A=65;
    var KEY_D=68;
    var KEY_W=87;
    
    var KEY_I=73;
    var KEY_J=74;
    var KEY_L=76;
    
    var KEY_NUMPAD4=100;
    var KEY_NUMPAD6=102;
    var KEY_NUMPAD8=104;
    
    var KEY_2=50;
    var KEY_3=51;
    var KEY_4=52;
    
    var KEY_SPACE=32;
    
    var CentrifugeObject_BALL=0;
    var CentrifugeObject_PLAYER=1;
    
    var CentrifugeObject_POWERUPBIG=2;
    var CentrifugeObject_POWERUPFAST=3;
    var CentrifugeObject_POWERUPJUMP=4;
    
    function playSound(id)
    {
      var player=document.getElementById(id);
      player.currentTime=0;
      player.play();
    }
    
    function Player(r,g,b)
    {
      this.x=cylinderRadius*Math.cos(2*Math.PI*players.length/numberOfPlayers);
      this.y=cylinderRadius*Math.sin(2*Math.PI*players.length/numberOfPlayers);
      this.angle=Math.atan2(this.y,this.x);
      this.angularVelocity=0; //kinda misleading name -- this has
                              //nothing to do with the player spinning
                              //in place. this field is rather the rate
                              //of change of the "angle" field.
      this.xVelocity=0;
      this.yVelocity=0;
      this.jumpPower=4;
      this.angAccel=0.01;
      this.maxVelocity=0.2;
      this.grounded=true;
      this.radius=40;
      this.targetRadius=this.radius;
      
      this.cylinderCircleCenterX=0;
      this.cylinderCircleCenterY=0;
      
      this.keyLeft=0;
      this.keyRight=0;
      this.keyJump=0;
      this.keyLeftPressed=false;
      this.keyRightPressed=false;
      this.score=0;
      this.type=CentrifugeObject_PLAYER;
      this.r=r;
      this.g=g;
      this.b=b;
      this.color="rgb(" + this.r + "," + this.g + "," + this.b + ")";
      this.drawnAngle=this.angle;
      
      this.fraction=1/numberOfPlayers;
      this.targetFraction=this.fraction;
      this.targetTargetFraction=this.fraction; //okay this might seem a little ridiculous but just trust me
      
      this.winning=false;
    }
    Player.prototype=new CentrifugeObject();
    Player.prototype.draw=function()
    {
      this.drawnAngle=this.angle; //+Math.PI/2; //TODO: maybe make this.drawnAngle not change too fast?
      
      ctx.beginPath();
      ctx.moveTo(this.x,this.y);
      
      this.cylinderIntersectAng=2*Math.acos(1-0.5*Math.pow(this.radius/cylinderRadius,2)); //law of cosines
      this.playerIntersectAng=2*Math.asin(cylinderRadius/this.radius*Math.sin(this.cylinderIntersectAng/2)); //law of sines
      
      this.cylinderCircleCenterX=this.x-cylinderRadius*Math.cos(this.drawnAngle+cylinderAngle);
      this.cylinderCircleCenterY=this.y-cylinderRadius*Math.sin(this.drawnAngle+cylinderAngle);
      
      ctx.arc(this.cylinderCircleCenterX,this.cylinderCircleCenterY,cylinderRadius,this.drawnAngle + cylinderAngle - this.cylinderIntersectAng/2, this.drawnAngle + cylinderAngle + this.cylinderIntersectAng/2, false);
      ctx.arc(this.x,this.y,this.radius,this.drawnAngle + cylinderAngle - this.playerIntersectAng/2 + Math.PI, this.drawnAngle + cylinderAngle + this.playerIntersectAng/2 + Math.PI, false);
    
      ctx.fillStyle=this.color;
      ctx.fill();
      
      ctx.fillStyle="#000000";
      
      var centerX=this.x-this.radius/2*Math.cos(this.drawnAngle+cylinderAngle);
      var centerY=this.y-this.radius/2*Math.sin(this.drawnAngle+cylinderAngle);
      
      ctx.translate(centerX,centerY);
      ctx.rotate(camAngle);
      ctx.fillText(this.score,0,0);
      ctx.rotate(-camAngle);
      ctx.translate(-centerX,-centerY);
      
      this.fraction+=(this.targetFraction-this.fraction)/10;
      
      <?
        if(isset($_GET['powerups']))
        {
          ?>
            this.angAccel+=(0.01-this.angAccel)/500;
            this.maxVelocity+=(0.2-this.maxVelocity)/500;
            this.jumpPower+=(4-this.jumpPower)/500;
            if(Math.abs(this.targetRadius-this.radius)>1)
            {
              this.radius+=(this.targetRadius-this.radius)/20;
            }
            else
            {
              this.targetRadius=this.radius;
              this.radius+=(40-this.radius)/600;
            }
          <?
        }
      ?>
    }
    Player.prototype.jump=function()
    {
      this.grounded=false;

      var speed=cylinderRadius*(angVelocity+this.angularVelocity);
      this.xVelocity=speed*Math.cos(cylinderAngle+this.angle+Math.PI/2);
      this.yVelocity=speed*Math.sin(cylinderAngle+this.angle+Math.PI/2);
      
      var extraSpeed=-this.jumpPower;
      this.xVelocity+=extraSpeed*Math.cos(cylinderAngle+this.angle);
      this.yVelocity+=extraSpeed*Math.sin(cylinderAngle+this.angle);
    }
    Player.prototype.handleCollisions=function()
    {
      for(var i=0;i<balls.length;i++)
      {
        if(balls[i].pauseNum==-1)
        {
          var dxA=balls[i].x-this.x;
          var dyA=balls[i].y-this.y;
          var dxB=balls[i].x-this.cylinderCircleCenterX;
          var dyB=balls[i].y-this.cylinderCircleCenterY;
          var distA=Math.sqrt(Math.pow(dxA,2) + Math.pow(dyA,2));
          var distB=Math.sqrt(Math.pow(dxB,2) + Math.pow(dyB,2));
          if(distA<this.radius+balls[i].radius && distB<cylinderRadius + balls[i].radius)
          {
            //collision! assume same masses for easier trajectories.

            
            var collisionVector;
            var centerX=0;
            var centerY=0;
            var centerRadius=0;
            var cornerCollision=false;
            
            var angleFromPlayerCenter=Math.atan2(balls[i].y-this.y,balls[i].x-this.x);
            var angleFromCylinderCircleCenter=Math.atan2(balls[i].y-this.cylinderCircleCenterY, balls[i].x-this.cylinderCircleCenterX);
            
            var AFPCLowerBound=this.drawnAngle + cylinderAngle - this.playerIntersectAng/2 + Math.PI;
            var AFPCUpperBound=this.drawnAngle + cylinderAngle + this.playerIntersectAng/2 + Math.PI;
            
            var AFCCCLowerBound=this.drawnAngle + cylinderAngle - this.cylinderIntersectAng/2;
            var AFCCCUpperBound=this.drawnAngle + cylinderAngle + this.cylinderIntersectAng/2;
            
            var AFPCDiff=mod(angleFromPlayerCenter-AFPCLowerBound,2*Math.PI);
            var AFPCDiffMax=mod(AFPCUpperBound-AFPCLowerBound,2*Math.PI);
            
            var AFCCCDiff=mod(angleFromCylinderCircleCenter-AFCCCLowerBound,2*Math.PI);
            var AFCCCDiffMax=mod(AFCCCUpperBound-AFCCCLowerBound,2*Math.PI);
            
            if(AFPCDiff <= AFPCDiffMax)
            {
              centerX=this.x;
              centerY=this.y;
              centerRadius=this.radius;
              collisionVector=new Vector(dxA,dyA);
            }
            else if(AFCCCDiff <= AFCCCDiffMax)
            {
              centerX=this.cylinderCircleCenterX;
              centerY=this.cylinderCircleCenterY;
              centerRadius=cylinderRadius;
              collisionVector=new Vector(dxB,dyB);
            }
            else if(AFPCDiff - AFPCDiffMax >= (2*Math.PI-AFPCDiffMax)/2)
            {
              //left corner
              cornerCollision=true;
              centerX=this.x + this.radius*Math.cos(this.drawnAngle + cylinderAngle - this.playerIntersectAng/2 + Math.PI);
              centerY=this.y + this.radius*Math.sin(this.drawnAngle + cylinderAngle - this.playerIntersectAng/2 + Math.PI);
              centerRadius=0;
              var dxC=balls[i].x-centerX;
              var dyC=balls[i].y-centerY;
              collisionVector=new Vector(dxC,dyC);
            }
            else
            {
              //right corner
              cornerCollision=true;
              centerX=this.x + this.radius*Math.cos(this.drawnAngle + cylinderAngle + this.playerIntersectAng/2 + Math.PI);
              centerY=this.y + this.radius*Math.sin(this.drawnAngle + cylinderAngle + this.playerIntersectAng/2 + Math.PI);
              centerRadius=0;
              var dxD=balls[i].x-centerX;
              var dyD=balls[i].y-centerY;
              collisionVector=new Vector(dxD,dyD);
            }

            if(this.grounded)
            {
              var speed=cylinderRadius*(angVelocity+this.angularVelocity);
              this.xVelocity=speed*Math.cos(cylinderAngle+this.angle+Math.PI/2);
              this.yVelocity=speed*Math.sin(cylinderAngle+this.angle+Math.PI/2);
              
              var ballSpeed=Math.sqrt(Math.pow(balls[i].xVelocity,2) + Math.pow(balls[i].yVelocity,2));
              var extraSpeed=-ballSpeed;
              this.xVelocity+=extraSpeed*Math.cos(cylinderAngle+this.angle);
              this.yVelocity+=extraSpeed*Math.sin(cylinderAngle+this.angle);
            }

            
            if(balls[i].type==CentrifugeObject_BALL)
            {
              playSound("hitSound");
            
              var playerVelocity=new Vector(this.xVelocity,this.yVelocity);
              var playerVelocityOnCollision=new Vector(collisionVector.x,collisionVector.y);
              var multiplier=playerVelocity.dot(collisionVector)/collisionVector.dot(collisionVector);
              playerVelocityOnCollision.mult(multiplier);
              
              var playerVelocityPerpCollision=new Vector(playerVelocity.x,playerVelocity.y);
              playerVelocityPerpCollision.subtract(playerVelocityOnCollision);
              
              var ballVelocity=new Vector(balls[i].xVelocity,balls[i].yVelocity);
              var ballVelocityOnCollision=new Vector(collisionVector.x,collisionVector.y);
              multiplier=ballVelocity.dot(collisionVector)/collisionVector.dot(collisionVector);
              ballVelocityOnCollision.mult(multiplier);
              
              var ballVelocityPerpCollision=new Vector(ballVelocity.x,ballVelocity.y);
              ballVelocityPerpCollision.subtract(ballVelocityOnCollision);
              
              //now to change stuff up.
              
              var newPlayerVelocity=playerVelocityPerpCollision.sum(ballVelocityOnCollision);
              var newBallVelocity=ballVelocityPerpCollision.sum(playerVelocityOnCollision);
            
              this.xVelocity=newPlayerVelocity.x;
              this.yVelocity=newPlayerVelocity.y;
            
              balls[i].xVelocity=newBallVelocity.x;
              balls[i].yVelocity=newBallVelocity.y;
              
              var collisionAngle=collisionVector.angle();
              
              balls[i].x=centerX + (centerRadius+balls[i].radius)*Math.cos(collisionAngle);
              balls[i].y=centerY + (centerRadius+balls[i].radius)*Math.sin(collisionAngle);
              
              if(cornerCollision)
              {
                //the ball might still be inside.
                dxA=balls[i].x-this.x;
                dyA=balls[i].y-this.y;
                dxB=balls[i].x-this.cylinderCircleCenterX;
                dyB=balls[i].y-this.cylinderCircleCenterY;
                distA=Math.sqrt(Math.pow(dxA,2) + Math.pow(dyA,2));
                distB=Math.sqrt(Math.pow(dxB,2) + Math.pow(dyB,2));
                while(distA<this.radius+balls[i].radius && distB<cylinderRadius + balls[i].radius)
                {
                  balls[i].x+=2*Math.cos(collisionAngle);
                  balls[i].y+=2*Math.sin(collisionAngle);
                  
                  dxA=balls[i].x-this.x;
                  dyA=balls[i].y-this.y;
                  dxB=balls[i].x-this.cylinderCircleCenterX;
                  dyB=balls[i].y-this.cylinderCircleCenterY;
                  distA=Math.sqrt(Math.pow(dxA,2) + Math.pow(dyA,2));
                  distB=Math.sqrt(Math.pow(dxB,2) + Math.pow(dyB,2));
                }
              }
            }
            else
            {
              //it's a powerup
              balls[i].affect(this);
              balls[i].grounded=true;
              balls[i].pauseNum=num;
            }
          }
        }
      }
    }
    
    function generateStars()
    {
      for(var i=0;i<1000;i++)
      {
        stars[i]=new CentrifugeObject();
        stars[i].x=Math.random()*637-318;
        stars[i].y=Math.random()*637-318;
      }
    }
    
    function renderStars()
    {
      ctx.beginPath();
      ctx.strokeStyle="#FFFFFF";
      ctx.lineWidth=2;
      for(var i=0;i<1000;i++)
      {
        ctx.moveTo(stars[i].x,stars[i].y);
        ctx.lineTo(stars[i].x+1,stars[i].y+1);
      }
      ctx.stroke();
    }
    
    function sgn(n)
    {
      if(n>0) return 1;
      if(n<0) return -1;
      return 0;
    }
    
    function Vector(a,b)
    {
      this.x=a;
      this.y=b;
    }
    Vector.prototype.dot=function(v)
    {
      return this.x*v.x + this.y*v.y;
    }
    Vector.prototype.mult=function(m)
    {
      this.x*=m;
      this.y*=m;
    }
    Vector.prototype.subtract=function(v)
    {
      this.x-=v.x;
      this.y-=v.y;
    }
    Vector.prototype.sum=function(v)
    {
      return new Vector(this.x+v.x,this.y+v.y);
    }
    Vector.prototype.difference=function(v)
    {
      return new Vector(this.x-v.x,this.y-v.y);
    }
    Vector.prototype.magnitude=function()
    {
      return Math.sqrt(Math.pow(this.x,2) + Math.pow(this.y,2));
    }
    Vector.prototype.angle=function()
    {
      return Math.atan2(this.y,this.x);
    }
    
    function Ball(x,y)
    {
      this.x=x;
      this.y=y;
      this.angle=Math.atan2(this.y,this.x);
      this.angularVelocity=0;
      this.xVelocity=0;
      this.yVelocity=0;
      this.radius=25;
      this.grounded=false;
      this.type=CentrifugeObject_BALL;
      this.color="#FFFFFF";
      this.pauseNum=-1;
    }
    Ball.prototype=new CentrifugeObject();
    Ball.prototype.draw=function()
    {
      ctx.fillStyle=this.color;
      ctx.beginPath();
      
      ctx.moveTo(this.x,this.y);
      ctx.arc(this.x,this.y,this.radius,0,2*Math.PI,false);

      ctx.fill();
    }
    Ball.prototype.handlePoints=function()
    {
      if(this.grounded && this.pauseNum==-1)
      {
        //TODO: generalize for any # of players
        
        var a=mod(this.angle,2*Math.PI); //to handle stupid negative stuff
        playSound("oopsSound");
        
        var lowerBound=Math.PI-players[0].fraction*Math.PI;
        var hitPlayer=0;
        
        for(var i=0;i<players.length;i++)
        {
          if(mod(a-lowerBound,2*Math.PI) <= 2*Math.PI*players[i].fraction)
          {
            hitPlayer=i;
            break;
          }
          
          lowerBound+=players[i].fraction*2*Math.PI;
        }
        
        players[hitPlayer].score++;
        if(players[hitPlayer].score>=gameScore) players[hitPlayer].winning=true;
        this.color=players[hitPlayer].color;
        
        var highestScore=-1;
        var apparentWinner=0;
        var tie=false;
        
        for(var i=0;i<players.length;i++)
        {
          if(players[i].score-highestScore>1)
          {
            highestScore=players[i].score;
            apparentWinner=i;
            tie=false;
          }
          else if(players[i].score>highestScore)
          {
            highestScore=players[i].score;
            tie=true;
          }
          else if(highestScore-players[i].score<=1)
          {
            tie=true;
          }
        }
        
        if(!tie && highestScore!=-1 && players[apparentWinner].winning)
        {
          gameEnded=true;
          winner=apparentWinner;
        }
        
        setFractions();

        this.pauseNum=num;
      }
      else if(this.pauseNum!=-1)
      {
        if(this.type==CentrifugeObject_BALL)
        {
          this.radius-=1;
          if(num-this.pauseNum>=25)
          {
            for(var i=0;i<players.length;i++)
            {
              players[i].targetFraction=players[i].targetTargetFraction;
            }
            this.reset();
          }
        }
        else
        {
          this.radius-=1/3;
          if(num-this.pauseNum>=75)
          {
            this.reset();
          }
        }
      }
    }
    Ball.prototype.reset=function()
    {
      this.pauseNum=-1;
      this.grounded=false;
      this.x=0;
      this.y=0;
      this.radius=25;
      if(this.type!=CentrifugeObject_BALL)
      {
        this.type=Math.floor(Math.random()*3)+2;
        this.setColor();
      }
      else
      {
        this.color="#FFFFFF";
        this.angle=Math.random()*2*Math.PI;
        this.xVelocity=2*Math.cos(this.angle);
        this.yVelocity=2*Math.sin(this.angle);
      }
    }
    
    
    function Powerup(type)
    {
      this.type=type;
      this.setColor();
    }
    Powerup.prototype=new Ball(0,0);
    Powerup.prototype.affect=function(p)
    {
      if(this.type==CentrifugeObject_POWERUPBIG)
      {
        p.targetRadius+=80;
      }
      else if(this.type==CentrifugeObject_POWERUPFAST)
      {
        p.angAccel+=0.005;
        p.maxVelocity+=0.2;
      }
      else if(this.type==CentrifugeObject_POWERUPJUMP)
      {
        p.jumpPower+=4;
      }
    }
    Powerup.prototype.setColor=function()
    {
      switch(this.type)
      {
        case CentrifugeObject_POWERUPBIG: this.color="#FF8080"; break;
        case CentrifugeObject_POWERUPJUMP: this.color="#8080FF"; break;
        case CentrifugeObject_POWERUPFAST: this.color="#80FF80"; break;
      }
    }
    
    function gameOver(winner)
    {
      playSound('winSound');
    
      ctx.rotate(camAngle);
      ctx.fillStyle="rgba(0,0,0,0.5)";
      ctx.fillRect(-318,-318,637,637);
      ctx.fillStyle="#FFFFFF";
      
      var text="";
      
      if(winner==0) text="YELLOW WINS!";
      if(winner==1) text="BLUE WINS!";
      if(winner==2) text="GREEN WINS!";
      if(winner==3) text="PINK WINS!";
      
      ctx.font="50px sans-serif";
      ctx.fillText(text,0,0);
    }
    
    function mod(a,b) //always returns something in [0,b)
    {
      return ((a%b)+b)%b;
    }
    
    function CentrifugeObject()
    {
      //nothing to see here
    }
    CentrifugeObject.prototype.move=function()
    {
      if(!this.grounded)
      {
        this.x+=this.xVelocity;
        this.y+=this.yVelocity;
        this.angle=Math.atan2(this.y,this.x) - cylinderAngle;
        if((this.type==CentrifugeObject_PLAYER && Math.sqrt(Math.pow(this.x,2)+Math.pow(this.y,2)) >= cylinderRadius) ||
            (this.type==CentrifugeObject_BALL && Math.sqrt(Math.pow(this.x,2)+Math.pow(this.y,2)) >= cylinderRadius-this.radius))
        {
          this.x=cylinderRadius*Math.cos(this.angle + cylinderAngle);
          this.y=cylinderRadius*Math.sin(this.angle + cylinderAngle);
          this.grounded=true;
        }
      }
      
      if(this.grounded)
      {
        if(this.keyLeftPressed && this.angularVelocity>-this.maxVelocity) this.angularVelocity+=this.angAccel;
        if(this.keyRightPressed && this.angularVelocity<this.maxVelocity) this.angularVelocity-=this.angAccel;
        
        //change the angle
        this.angle+=this.angularVelocity;
        this.angularVelocity*=0.9; //friction
        
        //make x,y match up to angle (friction)
        if(this.type==CentrifugeObject_PLAYER)
        {
          this.x=cylinderRadius*Math.cos(this.angle + cylinderAngle);
          this.y=cylinderRadius*Math.sin(this.angle + cylinderAngle);
        }
        else if(this.type==CentrifugeObject_BALL)
        {
          this.x=(cylinderRadius-this.radius)*Math.cos(this.angle + cylinderAngle);
          this.y=(cylinderRadius-this.radius)*Math.sin(this.angle + cylinderAngle);
        }
      }
    }
    
    function canv_click(evt)
    {
      if(!gameStarted)
      {
        var cy=evt.clientY-canv.offsetTop;
        
        if(Math.abs(cy-(225 + 180)) <= 10)
        {
          document.location="http://william.hoza.us/centrifuge";
        }
      }
    }
    
    function canv_mousemove(evt)
    {
      var cy=evt.clientY-canv.offsetTop;
      
      if(!gameStarted && Math.abs(cy-(225 + 180)) <= 10)
      {
        canv.style.cursor="pointer";
      }
      else
      {
        canv.style.cursor="default";
      }
    }
    
    function body_keydown(evt)
    {
      if(gameStarted)
      {
        for(var i=0;i<players.length;i++)
        {
          if(evt.keyCode==players[i].keyLeft) players[i].keyLeftPressed=true;
          if(evt.keyCode==players[i].keyRight) players[i].keyRightPressed=true;
          if(evt.keyCode==players[i].keyJump && players[i].grounded) players[i].jump();
        }
      }
      else
      {
        if(evt.keyCode==KEY_SPACE)
        {
          gameStarted=true;
          begin();
        }
        if(evt.keyCode==KEY_2)
        {
          numberOfPlayers=2;
          gameScore=25;
          showIntro();
        }
        if(evt.keyCode==KEY_3)
        {
          numberOfPlayers=3;
          gameScore=25;
          showIntro();
        }
        if(evt.keyCode==KEY_4)
        {
          numberOfPlayers=4;
          gameScore=25;
          showIntro();
        }
      }
    }
    
    function setFractions()
    {
      var total=0;
      for(var i=0;i<players.length;i++)
      {
        players[i].hScore=Math.max(players[i].score,1);
        if(i==1) players[i].hScore*=multiplier;
        
        players[i].hScore=1/players[i].hScore;
        total+=players[i].hScore;
      }
      
      for(var i=0;i<players.length;i++)
      {
        players[i].targetTargetFraction=players[i].hScore/total;
      }
    }
    
    function body_keyup(evt)
    {
      for(var i=0;i<players.length;i++)
      {
        if(evt.keyCode==players[i].keyLeft) players[i].keyLeftPressed=false;
        if(evt.keyCode==players[i].keyRight) players[i].keyRightPressed=false;
      }
    }
    
    function init()
    {
      ctx.translate(canv.offsetWidth/2,canv.offsetHeight/2);
      generateStars();
      showIntro();
    }
    
    function begin()
    {     
      players[0]=new Player(255,255,0);
      players[0].keyLeft=KEY_LEFT;
      players[0].keyRight=KEY_RIGHT;
      players[0].keyJump=KEY_UP;
      
      if(numberOfPlayers>1)
      {
        players[1]=new Player(0,255,255);
        players[1].keyLeft=KEY_A;
        players[1].keyRight=KEY_D;
        players[1].keyJump=KEY_W;
      }
      
      if(numberOfPlayers>2)
      {
        players[2]=new Player(0,255,0);
        players[2].keyLeft=KEY_J;
        players[2].keyRight=KEY_L;
        players[2].keyJump=KEY_I;
      }
      
      if(numberOfPlayers>3)
      {
        players[3]=new Player(255,0,255);
        players[3].keyLeft=KEY_NUMPAD4;
        players[3].keyRight=KEY_NUMPAD6;
        players[3].keyJump=KEY_NUMPAD8;
      }
      
      setFractions();
      for(var i=0;i<players.length;i++)
      {
        players[i].targetFraction=players[i].targetTargetFraction;
      }
      
      balls[0]=new Ball(0,0);
      balls[0].reset();
      
      <?
        if(isset($_GET['powerups']))
        {
          ?>
            balls[1]=new Powerup(Math.floor(Math.random()*3)+2);
          <?
        }
      ?>
      
      /* good for testing corners
      players[0].grounded=false;
      players[0].xVelocity=-3;
      players[0].yVelocity=-0.1 //0.1
      balls[0].xVelocity=-1;
      balls[0].yVelocity=0;
      */
      
      ctx.font="14pt sans-serif"
      timer();
    }
    
    function showIntro()
    {
      ctx.clearRect(-318,-318,637,637);
    
      if(ctx.textBaseline) ctx.textBaseline="middle";
      ctx.textAlign="center";

      ctx.fillStyle="#00C0FF";
      ctx.font="30px sans-serif";
      ctx.fillText("CENTRIFUGE VOLLEYBALL", 0, -180);

      ctx.fillStyle="#FFFFFF";
      ctx.font="12px sans-serif";
      ctx.fillText("This is a multiplayer game.", 0, -130);
      ctx.fillText("Hit the ball onto the section of the spinning spaceship that's your color.", 0, -100);
      
      ctx.fillText("Controls for YELLOW are UP, LEFT, RIGHT.", 0, -20);
      ctx.fillText("Controls for BLUE are W, A, D.", 0, 10);
      
      if(numberOfPlayers<3)
      {
        ctx.fillStyle="#808080";
        ctx.fillText("[Controls for GREEN are I, J, L - press '3' to enable]", 0, 40);
      }
      else
      {
        ctx.fillStyle="#FFFFFF";
        ctx.fillText("Controls for GREEN are I, J, L (press 2 to disable)", 0, 40);
      }
      
      if(numberOfPlayers<4)
      {
        ctx.fillStyle="#808080";
        ctx.fillText("[Controls for PINK are numpad 8, 4, 6 - press '4' to enable]", 0, 70);
      }
      else
      {
        ctx.fillStyle="#FFFFFF";
        ctx.fillText("Controls for PINK are numpad 8, 4, 6 (press 3 to disable)", 0, 70);
      }
      
      ctx.fillStyle="#FFFFFF";
      ctx.fillText("Press SPACE to start. First to " + gameScore + " points wins (win by 2.)", 0, 150);
      
      ctx.fillStyle="#00C0FF";
      ctx.fillText("If the motion is confusing or you haven't anyone to play with, click here.", 0, 180);
    }
    
    function timer()
    {
      var beg=new Date();
      
      cylinderAngle+=angVelocity;
      camAngle+=camAngVelocity;
      
      num++;
      var m = num % 2300;
      if(m >= 1000 && m < 1150)
      {
        camAngVelocity+=angVelocity/150;
      }
      else if(m >= 2150 && m < 2300)
      {
        camAngVelocity-=angVelocity/150;
      }
      
      if(num % 20 == 0)
      {
        var now=new Date();
        if(startTime)
        {
          var framerate=20/((now.getTime()-startTime.getTime())/1000);
          $('fps').innerHTML=Math.round(framerate);
          if(framerate<29) highPerformance=false;
        }
        startTime=now;
      }
      
      if(camAngVelocity!=0)
      {
        ctx.rotate(-camAngVelocity);
      }
      //ctx.drawImage(starsImage,-318,-318);
      
      if(highPerformance)
      {
        ctx.fillStyle="rgba(0,0,0,0.5)";
        ctx.fillRect(-318,-318,637,637);
      }
      else
      {
        ctx.clearRect(-318,-318,637,637);
      }

      renderStars();
      
      ctx.strokeStyle="#FFFFFF";
      ctx.lineWidth=1;
      
      var angle=cylinderAngle+Math.PI-players[0].fraction*Math.PI;
      var opacity=highPerformance? 0.2 : 0.35;
      
      for(var i=0;i<players.length;i++)
      {
        ctx.beginPath();
        ctx.moveTo(0,0);
        ctx.arc(0,0,cylinderRadius+4,angle,angle + players[i].fraction*2*Math.PI,false);
        ctx.fillStyle="rgba(" + players[i].r + "," + players[i].g + "," + players[i].b + "," + opacity + ")";
        ctx.fill();
        ctx.stroke();
        
        angle+=players[i].fraction*2*Math.PI;
      }
      
      ctx.beginPath();
      ctx.arc(0,0,cylinderRadius+4,0,2*Math.PI,false);
      ctx.strokeStyle="#FFFFFF";
      ctx.lineWidth=10;
      ctx.stroke();
      
      for(var i=0;i<players.length;i++)
      {
        players[i].move();
        players[i].handleCollisions();
      }
      
      for(var i=0;i<balls.length;i++)
      {
        balls[i].move();
        balls[i].handlePoints();
        balls[i].draw();
      }
      
      for(var i=0;i<players.length;i++)
      {
        players[i].draw();
      }
      
      var end=new Date();
      var computationTime=end.getTime()-beg.getTime();
    
      if(gameEnded)
      {
        gameOver(winner);
      }
      else
      {
        setTimeout(timer,Math.max(30-computationTime,17)); //17 is a magical, magical number
      }
    }
    
    function $(id)
    {
      return document.getElementById(id);
    }
    
    init();
  </script>

</body>

</html>
