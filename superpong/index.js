var playTo=11;
var winBy=2;

var normalPaddleSpeed=7;
var normalBallSpeed=9;
var normalBulletSpeed=17;

var paddleSpeed=7;
var ballSpeed=9;
var bulletSpeed=17;
var normalPaddleSize=350;
var frameDelay=15;

  var leftPaddleUp=87; //W
  var leftPaddleDown=83; //S
  var leftPaddleShoot=68; //D

  var rightPaddleUp=73; //I 38; //
  var rightPaddleDown=75; //K 40; //
  var rightPaddleShoot=74; //J 37; //

  var keyLeftPaddleSmaller=49; //1
  var keyLeftPaddleBigger=50; //2
  var keyLeftPaddleReset=51; //3

  var keyRightPaddleSmaller=56; //8
  var keyRightPaddleBigger=57; //9
  var keyRightPaddleReset=48; //0

  var keyNewMatch=78;

var bulletColor="#FF0000"; //#0060C0
var aboutToLose='';
var gameEndingBalls=new Array();

var leftPaddleUpKeyDown=false;
var leftPaddleDownKeyDown=false;
var leftPaddleShootKeyDown=false;
var rightPaddleUpKeyDown=false;
var rightPaddleDownKeyDown=false;
var rightPaddleShootKeyDown=false;
var lastLeftShootTime=0;
var lastRightShootTime=0;
var leftGunLossTime=0;
var rightGunLossTime=0;
var soundNum=0;
var stop=false;
var leftWins=0;
var rightWins=0;

var leftChange=0;
var rightChange=0;

var balls=new Array();

var leftPaddle;
var rightPaddle;
var leftGun;
var rightGun;

var leftScore=0;
var rightScore=0;
var leftBullets=5;
var rightBullets=5;
var soundLoaded=false;
var soundOn=true;
var keyDivBeingSet;

var bullets=new Array();

function updateSpans()
{
  $('LPUK').innerHTML=keyNameFromCode(keyLeftPaddleUp);
}

function switchSound()
{
  if(soundOn)
  {
    soundOn=false;
    $('speakerIcon').src="soundoff.gif";
  }
  else
  {
    soundOn=true;
    $('speakerIcon').src="soundon.gif";
  }
}

function keyNameFromCode(keyCode)
{
  var alphabet="ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  if(keyCode>=65 && keyCode<=91)
  {
    return alphabet.charAt(keyCode-65);
  }
  else if(keyCode>=48 && keyCode<=57)
  {
    return keyCode-48;
  }
  else if(keyCode>=96 && keyCode<=105)
  {
    return keyCode-96;
  }
  else if(keyCode==37)
  {
    return "LEFT";
  }
  else if(keyCode==39)
  {
    return "RIGHT";
  }
  else if(keyCode==38)
  {
    return "UP";
  }
  else if(keyCode==40)
  {
    return "DOWN";
  }
  return "?";
}

function keyPressedOrReleased(keyCode,down) //down is true if the key was pressed, false if the key was released
{
  var beginKey=71; //G

  var leftPaddleShootKeyWasDown=leftPaddleShootKeyDown;
  var rightPaddleShootKeyWasDown=rightPaddleShootKeyDown;

  if(keyDivBeingSet)
  {
    switch(keyDivBeingSet.id)
    {
      case "LPUK":
        leftPaddleUp=keyCode;
        createCookie('leftPaddleUp',keyCode,1000);
        break;
      case "LPDK":
        leftPaddleDown=keyCode;
        createCookie('leftPaddleDown',keyCode,1000);
        break;
      case "LPSK":
        leftPaddleShoot=keyCode;
        createCookie('leftPaddleShoot',keyCode,1000);
        break;
      case "RPUK":
        rightPaddleUp=keyCode;
        createCookie('rightPaddleUp',keyCode,1000);
        break;
      case "RPDK":
        rightPaddleDown=keyCode;
        createCookie('rightPaddleDown',keyCode,1000);
        break;
      case "RPSK":
        rightPaddleShoot=keyCode;
        createCookie('rightPaddleShoot',keyCode,1000);
        break;
    }

    if(keyDivBeingSet)
    {
      keyDivBeingSet.innerHTML=keyNameFromCode(keyCode);
      keyDivBeingSet.style.backgroundColor='';
      keyDivBeingSet=null;
    }
  }
  else if(keyCode==leftPaddleUp)
  {
    leftPaddleUpKeyDown=down;
    return false;
  }
  else if(keyCode==leftPaddleDown)
  {
    leftPaddleDownKeyDown=down;
    return false;
  }
  else if(keyCode==rightPaddleUp)
  {
    rightPaddleUpKeyDown=down;
    return false;
  }
  else if(keyCode==rightPaddleDown)
  {
    rightPaddleDownKeyDown=down;
    return false;
  }
  else if(keyCode==leftPaddleShoot)
  {
    leftPaddleShootKeyDown=down;
    if(!leftPaddleShootKeyWasDown && $('playButton').style.display=='none')
    {
      shoot(true);
    }
    return false;
  }
  else if(keyCode==rightPaddleShoot)
  {
    rightPaddleShootKeyDown=down;
    if(!rightPaddleShootKeyWasDown && $('playButton').style.display=='none')
    {
      shoot(false);
    }
    return false;
  }
  else if(keyCode==beginKey && $('playButton').style.display!='none')
  {
    start();
    return false;
  }
  else if(keyCode==keyLeftPaddleSmaller && down)
  {
    if(leftPaddle.offsetHeight>leftGun.offsetHeight)
    {
      leftPaddle.style.height=leftPaddle.offsetHeight-10;
      leftGun.style.top=leftGun.offsetTop-5;
      leftPaddle.style.top=leftPaddle.offsetTop+5;

      leftChange=leftChange-10;
    }
    if(leftGun.offsetTop<0)
    {
      leftGun.style.top=0;
    }
    if(leftGun.offsetTop+leftGun.offsetHeight>leftPaddle.offsetHeight)
    {
      leftGun.style.top=leftPaddle.offsetHeight-leftGun.offsetHeight;
    }
    return false;
  }
  else if(keyCode==keyLeftPaddleBigger && down)
  {
    if(leftPaddle.offsetHeight<document.body.clientHeight)
    {
      leftPaddle.style.height=leftPaddle.offsetHeight+10;
      leftGun.style.top=leftGun.offsetTop+5;
      leftPaddle.style.top=leftPaddle.offsetTop-5;

      leftChange=leftChange+10;
    }
    return false;
  }
  else if(keyCode==keyLeftPaddleReset && down)
  {
    leftPaddle.style.height=document.body.clientHeight/(750/normalPaddleSize);
    leftGun.style.top=leftPaddle.offsetHeight/2-leftGun.offsetHeight/2;
    leftPaddle.style.top=document.body.clientHeight/2-leftPaddle.offsetHeight/2;

    leftChange=0;
    return false;
  }
  else if(keyCode==keyRightPaddleSmaller && down)
  {
    if(rightPaddle.offsetHeight>rightGun.offsetHeight)
    {
      rightPaddle.style.height=rightPaddle.offsetHeight-10;
      rightGun.style.top=rightGun.offsetTop-5;
      rightPaddle.style.top=rightPaddle.offsetTop+5;

      rightChange=rightChange-10;
    }
    if(rightGun.offsetTop<0)
    {
      rightGun.style.top=0;
    }
    if(rightGun.offsetTop+rightGun.offsetHeight>rightPaddle.offsetHeight)
    {
      rightGun.style.top=rightPaddle.offsetHeight-rightGun.offsetHeight;
    }
    return false;
  }
  else if(keyCode==keyRightPaddleBigger && down)
  {
    if(rightPaddle.offsetHeight<document.body.clientHeight)
    {
      rightPaddle.style.height=rightPaddle.offsetHeight+10;
      rightGun.style.top=rightGun.offsetTop+5;
      rightPaddle.style.top=rightPaddle.offsetTop-5;

      rightChange=rightChange+10;
    }
    return false;
  }
  else if(keyCode==keyRightPaddleReset && down)
  {
    rightPaddle.style.height=document.body.clientHeight/(750/normalPaddleSize);
    rightGun.style.top=rightPaddle.offsetHeight/2-rightGun.offsetHeight/2;
    rightPaddle.style.top=document.body.clientHeight/2-rightPaddle.offsetHeight/2;

    rightChange=0;
    return false;
  }
  else if(keyCode==keyNewMatch && down && $('playButton').style.display!='none')
  {
    document.location='index.html';
  }
  else if(keyCode==32 && down) //space bar
  {
    return false;
  }
  else if(keyCode==40 && down) //down arrow
  {
    return false;
  }
  else if(keyCode==38 && down) //up arrow
  {
    return false;
  }

  return true;
}

function shoot(left)
{
  var index=bullets.length;
  var curDate=new Date();

  if(balls[0].xSpeed!=0 && ((left && leftPaddleShootKeyDown && leftBullets>0 && leftGun.ready) || (!left && rightPaddleShootKeyDown && rightBullets>0 && rightGun.ready)))
  {
    if(left)
    {
      playSound('shoot.mp3',-90);
    }
    else
    {
      playSound('shoot.mp3',90);
    }

    bullets[index]=new Object();
    bullets[index].element=document.createElement('div');
    bullets[index].element.style.width="30px";
    bullets[index].element.style.height="10px";
    bullets[index].element.style.backgroundColor=bulletColor;
    //if(left)
    //{
    //  bullets[index].element.style.backgroundImage='url(bullet.png)';
    //}
    //else
    //{
    //  bullets[index].element.style.backgroundImage='url(bulletleft.png)';
    //}
    bullets[index].element.style.fontSize="0px";
    document.body.appendChild(bullets[index].element);
    bullets[index].element.style.position='absolute';
    if(left)
    {
      leftGun.style.width="0px";
      leftGun.ready=false;
      leftGun.style.backgroundColor="#808080";
      lastLeftShootTime=curDate.getTime();
      leftBullets--;
      $('leftBullets').innerHTML=leftBullets;
      bullets[index].element.style.left=leftPaddle.offsetLeft+leftPaddle.offsetWidth;
      bullets[index].element.style.top=leftPaddle.offsetTop+leftGun.offsetTop;
      bullets[index].xSpeed=bulletSpeed;
    }
    else
    {
      rightGun.style.width="0px";
      rightGun.ready=false;
      rightGun.style.backgroundColor="#808080";
      lastRightShootTime=curDate.getTime();
      rightBullets--;
      $('rightBullets').innerHTML=rightBullets;
      bullets[index].element.style.left=rightPaddle.offsetLeft-bullets[index].element.offsetWidth;
      bullets[index].element.style.top=rightPaddle.offsetTop+rightGun.offsetTop;
      bullets[index].xSpeed=-bulletSpeed;
    }

    setTimeout("shoot("+left+")",1000);
  }
  else if(left && leftPaddleShootKeyDown && leftBullets==0)
  {
    playSound('outofbullets.mp3',-90);
  }
  else if(!left && rightPaddleShootKeyDown && rightBullets==0)
  {
    playSound('outofbullets.mp3',90);
  }
}

function playSound(theUrl,thePan)
{
  if(soundOn)
  {
    var aSoundObject = soundManager.createSound({
     id:'mySound'+soundNum,
     url:'sounds/'+theUrl,
     pan:thePan
    });
    aSoundObject.play();
    soundNum++;
  }
}

function moveStuff()
{
  var i=0;
  var i2=0;
  var curDate=new Date();
  var index=0;
  var middle=0;
  var missed=false;

  if(!leftGun.ready)
  {
    if(leftGun.isThere!='hidden')
    {
      leftGun.style.width=7/(1000/(curDate.getTime()-lastLeftShootTime));
    }
    else
    {
      leftGun.style.width=7/(10000/(curDate.getTime()-leftGunLossTime));
    }

    if(leftGun.offsetWidth>=7)
    {
      if(leftGun.isThere=='hidden')
      {
        playSound('gunback.mp3',-90);
      }
      leftGun.ready=true;
      leftGun.style.backgroundColor=bulletColor;
      leftGun.isThere='';
    }
  }
  if(!rightGun.ready)
  {
    if(rightGun.isThere!='hidden')
    {
      rightGun.style.width=7/(1000/(curDate.getTime()-lastRightShootTime));
    }
    else
    {
      rightGun.style.width=7/(10000/(curDate.getTime()-rightGunLossTime));
    }

    if(rightGun.offsetWidth>=7)
    {
      if(rightGun.isThere=='hidden')
      {
        playSound('gunback.mp3',90);
      }
      rightGun.ready=true;
      rightGun.style.backgroundColor=bulletColor;
      rightGun.isThere='';
    }
  }

  //this moves the paddles up and down, if they should be moved up and down
  if(leftPaddleUpKeyDown && leftPaddle.offsetTop>-leftGun.offsetTop)
  {
    leftPaddle.style.top=leftPaddle.offsetTop-paddleSpeed;
  }
  if(leftPaddleDownKeyDown && leftPaddle.offsetTop+leftGun.offsetTop+leftGun.offsetHeight<document.body.clientHeight)
  {
    leftPaddle.style.top=leftPaddle.offsetTop+paddleSpeed;
  }

  if(rightPaddleUpKeyDown && rightPaddle.offsetTop>-rightGun.offsetTop)
  {
    rightPaddle.style.top=rightPaddle.offsetTop-paddleSpeed;
  }
  if(rightPaddleDownKeyDown && rightPaddle.offsetTop+rightGun.offsetTop+rightGun.offsetHeight<document.body.clientHeight)
  {
    rightPaddle.style.top=rightPaddle.offsetTop+paddleSpeed;
  }

  for(i=0;i<bullets.length;i++)
  {
    bullets[i].element.style.left=bullets[i].element.offsetLeft+bullets[i].xSpeed;
    if(bullets[i].element.offsetLeft<(-bullets[i].element.offsetWidth) || bullets[i].element.offsetLeft>document.body.clientWidth)
    {
      document.body.removeChild(bullets[i].element);
      bullets.splice(i,1);
      break;
    }

    if(bullets[i].element.offsetLeft<leftPaddle.offsetLeft+leftPaddle.offsetWidth)
    {
      if(bullets[i].element.offsetLeft+bullets[i].element.offsetWidth>leftPaddle.offsetLeft)
      {
        if(bullets[i].element.offsetTop+bullets[i].element.offsetHeight>leftPaddle.offsetTop)
        {
          if(bullets[i].element.offsetTop<leftPaddle.offsetTop+leftPaddle.offsetHeight)
          {
            //the bullet is inside the left paddle
            //if(leftGun.isThere!='hidden')
            //{
              middle=leftGun.offsetTop;
            //}
            //else
            //{
            //  middle=leftPaddle.offsetHeight/2;
            //}

            if(bullets[i].element.offsetTop>=leftPaddle.offsetTop+middle-leftGun.offsetHeight && bullets[i].element.offsetTop<leftPaddle.offsetTop+middle+leftGun.offsetHeight)
            {
              //the bullet is inside the gun

              leftGun.isThere='hidden';
              leftGun.style.width="0px";
              leftGun.ready=false;
              leftGun.style.backgroundColor="#808080";
              leftGunLossTime=curDate.getTime();

              playSound('gungone.mp3',-90);

              document.body.removeChild(bullets[i].element);
              bullets.splice(i,1);
              break;
            }
            else if(bullets[i].element.offsetTop<leftPaddle.offsetTop+middle)
            {
              playSound('paddlehit.mp3',-90);
              //the bullet is above the gun

              leftPaddle.style.height=leftPaddle.offsetHeight-(bullets[i].element.offsetTop+bullets[i].element.offsetHeight-leftPaddle.offsetTop);
              leftGun.style.top=middle-(bullets[i].element.offsetTop+bullets[i].element.offsetHeight-leftPaddle.offsetTop);
              leftPaddle.style.top=leftPaddle.offsetTop+(bullets[i].element.offsetTop+bullets[i].element.offsetHeight-leftPaddle.offsetTop);
              
              document.body.removeChild(bullets[i].element);
              bullets.splice(i,1);
              break;
            }
            else
            {
              playSound('paddlehit.mp3',-90);
              //the bullet is below the gun

              leftPaddle.style.height=leftPaddle.offsetHeight-(leftPaddle.offsetTop+leftPaddle.offsetHeight-bullets[i].element.offsetTop);
            
              document.body.removeChild(bullets[i].element);
              bullets.splice(i,1);
              break;
            }
          }
        }
      }
    }

    if(bullets[i].element.offsetLeft+bullets[i].element.offsetWidth>rightPaddle.offsetLeft)
    {
      if(bullets[i].element.offsetLeft<rightPaddle.offsetLeft+rightPaddle.offsetWidth)
      {
        if(bullets[i].element.offsetTop+bullets[i].element.offsetHeight>rightPaddle.offsetTop)
        {
          if(bullets[i].element.offsetTop<rightPaddle.offsetTop+rightPaddle.offsetHeight)
          {
            //the bullet is inside the right paddle
            //if(rightGun.isThere!='hidden')
            //{
              middle=rightGun.offsetTop;
            //}
            //else
            //{
            //  middle=rightPaddle.offsetHeight/2;
            //}
            
            if(bullets[i].element.offsetTop>=rightPaddle.offsetTop+middle-rightGun.offsetHeight && bullets[i].element.offsetTop<rightPaddle.offsetTop+middle+rightGun.offsetHeight)
            {
              //the bullet is inside the gun
              playSound('gungone.mp3',90);

              rightGun.isThere='hidden';
              rightGun.style.width="0px";
              rightGun.ready=false;
              rightGun.style.backgroundColor="#808080";
              rightGunLossTime=curDate.getTime();

              document.body.removeChild(bullets[i].element);
              bullets.splice(i,1);
              break;
            }
            else if(bullets[i].element.offsetTop<rightPaddle.offsetTop+middle)
            {
              playSound('paddlehit.mp3',90);
              //the bullet is above the gun

              rightPaddle.style.height=rightPaddle.offsetHeight-(bullets[i].element.offsetTop+bullets[i].element.offsetHeight-rightPaddle.offsetTop);
              rightGun.style.top=middle-(bullets[i].element.offsetTop+bullets[i].element.offsetHeight-rightPaddle.offsetTop);
              rightPaddle.style.top=rightPaddle.offsetTop+(bullets[i].element.offsetTop+bullets[i].element.offsetHeight-rightPaddle.offsetTop);
              
              document.body.removeChild(bullets[i].element);
              bullets.splice(i,1);
              break;
            }
            else
            {
              playSound('paddlehit.mp3',90);
              //the bullet is below the gun

              rightPaddle.style.height=rightPaddle.offsetHeight-(rightPaddle.offsetTop+rightPaddle.offsetHeight-bullets[i].element.offsetTop);
            
              document.body.removeChild(bullets[i].element);
              bullets.splice(i,1);
              break;
            }
          }
        }
      }
    }
  }

  for(i2=0;i2<balls.length;i2++)
  {
    balls[i2].style.left=balls[i2].offsetLeft+balls[i2].xSpeed;
    balls[i2].style.top=balls[i2].offsetTop+balls[i2].ySpeed;

    if(balls[i2].offsetTop>document.body.clientHeight-balls[i2].offsetHeight)
    {
      balls[i2].ySpeed=-(Math.abs(balls[i2].ySpeed));
    }
    if(balls[i2].offsetTop<0)
    {
      balls[i2].ySpeed=Math.abs(balls[i2].ySpeed);
    }

    if(balls[i2].offsetTop>leftPaddle.offsetTop-balls[i2].offsetHeight && balls[i2].offsetTop<leftPaddle.offsetTop+leftPaddle.offsetHeight)
    {
      //vertically, it's inside the left paddle
      if(balls[i2].offsetLeft<leftPaddle.offsetLeft+leftPaddle.offsetWidth)
      {
        if(!balls[i2].hit) playSound('hit.mp3',-90);
        if(balls[i2].offsetLeft>leftPaddle.offsetLeft)
        {
          balls[i2].xSpeed=Math.abs(balls[i2].xSpeed);
          leftBullets++;
          $('leftBullets').innerHTML=leftBullets;
          if(aboutToLose=='left')
          {
            if((!gameEndingBalls[0] || gameEndingBalls[0].xSpeed>0) && (!gameEndingBalls[1] || gameEndingBalls[1].xSpeed>0))
            {
              playSound('ahh.mp3',-90);
              aboutToLose='';
            }
          }
        }
        else
        {
          if(balls[i2].offsetTop<leftPaddle.offsetTop)
          {
            balls[i2].ySpeed=-Math.abs(balls[i2].ySpeed);
          }
          else
          {
            balls[i2].ySpeed=Math.abs(balls[i2].ySpeed);
          }
          balls[i2].hit=true;
        }
      }
    }
    if(balls[i2].offsetTop>rightPaddle.offsetTop-balls[i2].offsetHeight && balls[i2].offsetTop<rightPaddle.offsetTop+rightPaddle.offsetHeight)
    {
      //vertically, it's inside the right paddle
      if(balls[i2].offsetLeft>rightPaddle.offsetLeft-balls[i2].offsetWidth)
      {
        if(!balls[i2].hit) playSound('hit.mp3',90);
        if(balls[i2].offsetLeft+balls[i2].offsetWidth<rightPaddle.offsetLeft+rightPaddle.offsetWidth)
        {
          balls[i2].xSpeed=-(Math.abs(balls[i2].xSpeed));
          rightBullets++;
          $('rightBullets').innerHTML=rightBullets;
          if(aboutToLose=='right')
          {
            if((!gameEndingBalls[0] || gameEndingBalls[0].xSpeed<0) && (!gameEndingBalls[1] || gameEndingBalls[1].xSpeed<0))
            {
              playSound('ahh.mp3',90);
              aboutToLose='';
            }
          }
        }
        else
        {
          if(balls[i2].offsetTop<rightPaddle.offsetTop)
          {
            balls[i2].ySpeed=-Math.abs(balls[i2].ySpeed);
          }
          else
          {
            balls[i2].ySpeed=Math.abs(balls[i2].ySpeed);
          }
          balls[i2].hit=true;
        }
      }
    }

    missed=false;

    if(balls[i2].offsetLeft<(-balls[i2].offsetWidth))
    {
      playSound('miss.mp3',-90);
      rightScore++;
      $('rightScore').innerHTML=rightScore;
      missed=true;
    }
    if(balls[i2].offsetLeft>document.body.clientWidth)
    {
      playSound('miss.mp3',90);
      leftScore++;
      $('leftScore').innerHTML=leftScore;
      missed=true;
    }

    if(missed)
    {
      if(leftScore>=playTo && leftScore-rightScore>=winBy)
      {
        someoneWon(true);
        break;
      }
      if(rightScore>=playTo && rightScore-leftScore>=winBy)
      {
        someoneWon(false);
        break;
      }

      if(balls.length==1)
      {
        resetBall(i2);
      }
      else
      {
        document.body.removeChild(balls[i2]);
        if(balls[i2].timeout) clearTimeout(balls[i2].timeout);
        balls.splice(i2,1);
        break;
      }
    }

    for(i=0;i<bullets.length;i++)
    {
      if(bullets[i].element.offsetLeft+bullets[i].element.offsetWidth>balls[i2].offsetLeft)
      {
        if(bullets[i].element.offsetLeft<balls[i2].offsetLeft+balls[i2].offsetWidth)
        {
          if(bullets[i].element.offsetTop+bullets[i].element.offsetHeight>balls[i2].offsetTop)
          {
            if(bullets[i].element.offsetTop<balls[i2].offsetTop+balls[i2].offsetHeight)
            {
              if(bullets[i].xSpeed>0)
              {
                leftBullets=leftBullets+2;
                $('leftBullets').innerHTML=leftBullets;
              }
              else
              {
                rightBullets=rightBullets+2;
                $('rightBullets').innerHTML=rightBullets;
              }
              
              playSound('ballbreak.mp3',bullets[i].element.offsetLeft/document.body.clientWidth*200-100);
              
              if(balls[i2].offsetWidth>10)
              {
                balls[i2].style.width=balls[i2].offsetWidth/2;
                balls[i2].style.height=balls[i2].offsetWidth;
                index=balls.length;
                balls[index]=document.createElement('img');
                balls[index].src="ball.png";
                balls[index].style.position='absolute';
                balls[index].style.width=balls[i2].offsetWidth;
                balls[index].style.height=balls[i2].offsetWidth;
                balls[index].style.left=balls[i2].offsetLeft;
                balls[index].style.top=balls[i2].offsetTop;
                document.body.appendChild(balls[index]);

                balls[i2].xSpeed=bullets[i].xSpeed/bulletSpeed*ballSpeed; //make the balls go the same direction as the shot
                balls[index].xSpeed=bullets[i].xSpeed/bulletSpeed*ballSpeed;

                if(balls[i2].xSpeed<0 && rightScore>=10 && rightScore-leftScore>=1)
                {
                  playSound('triumphant.mp3',90);
                  aboutToLose='left';
                  gameEndingBalls[0]=balls[i2];
                  gameEndingBalls[1]=balls[index];
                }
                else if(balls[i2].xSpeed>0 && leftScore>=10 && leftScore-rightScore>=1)
                {
                  playSound('triumphant.mp3',-90);
                  aboutToLose='right';
                  gameEndingBalls[0]=balls[i2];
                  gameEndingBalls[1]=balls[index];
                }

                balls[i2].ySpeed=ballSpeed;
                balls[index].ySpeed=-ballSpeed
                //alert(balls[i2].ySpeed+","+balls[index].ySpeed);
              }
              else
              {
                if(balls.length>1)
                {
                  document.body.removeChild(balls[i2]);
                  if(balls[i2].timeout) clearTimeout(balls[i2].timeout);
                  balls.splice(i2,1);
                }
                else
                {
                  resetBall(i2);
                }
              }
              document.body.removeChild(bullets[i].element);
              bullets.splice(i,1);
            }
          }
        }
      }
    }
  }

  if(!stop)
  {
    setTimeout("moveStuff();",frameDelay);
  }
  else
  {
    stop=false;
  }
}

function someoneWon(left)
{
  var s="";

  stop=true;

  if(left)
  {
    leftWins++;
  }
  else
  {
    rightWins++;
  }
  s="index.html?leftWon="+left + "&leftWins="+leftWins + "&rightWins="+rightWins + "&leftChange="+leftChange + "&rightChange="+rightChange + "&soundOn="+soundOn + "&leftScore="+leftScore + "&rightScore="+rightScore;
  if(leftPaddle.style.visibility=='hidden')
  {
    s+="&leftVisible=hidden";
  }
  if(rightPaddle.style.visibility=='hidden')
  {
    s+="&rightVisible=hidden";
  }
  document.location=s;
}

function resetBall(ball)
{
  if(balls[ball])
  {
    balls[ball].style.width="";
    balls[ball].style.height="";
    balls[ball].style.left=document.body.clientWidth/2-balls[ball].offsetWidth/2;
    balls[ball].style.top=document.body.clientHeight/2-balls[ball].offsetHeight/2;
    balls[ball].xSpeed=0;
    balls[ball].ySpeed=0;
    balls[ball].hit=false;
    balls[ball].timeout=setTimeout("setBallSpeeds("+ball+");",1000);
  }
}

function setBallSpeeds(ball)
{
  var xRand=Math.round(Math.random());
  var yRand=Math.round(Math.random());
  if(balls[ball].xSpeed==0 && balls[ball].timeout)
  {
    if(xRand==0)
    {
      balls[ball].xSpeed=-ballSpeed;
    }
    else
    {
      balls[ball].xSpeed=ballSpeed;
    }
    if(yRand==0)
    {
      balls[ball].ySpeed=-ballSpeed;
    }
    else
    {
      balls[ball].ySpeed=ballSpeed;
    }
  }
}

function resizeStuff()
{
      $('playButton').style.left=document.body.clientWidth/2-$('playButton').offsetWidth/2;
      $('playButton').style.top=document.body.clientHeight/2-$('playButton').offsetHeight/2;
      $('leftWins').style.left=document.body.clientWidth/2-$('leftWins').offsetWidth-10;
      $('rightWins').style.left=document.body.clientWidth/2+10;

      $('helpFrame').style.left=document.body.clientWidth/2-$('helpFrame').offsetWidth/2;
      $('helpFrame').style.top=document.body.clientHeight/2-$('helpFrame').offsetHeight/2;

  ballSpeed=document.body.clientWidth/(1024/normalBallSpeed);
  paddleSpeed=document.body.clientWidth/(1024/normalPaddleSpeed);
  paddleSize=document.body.clientHeight/(750/normalPaddleSize);
  bulletSpeed=document.body.clientWidth/(1024/normalBulletSpeed);

  leftPaddle.style.height=paddleSize;
  rightPaddle.style.height=paddleSize;

  leftGun.style.top=leftPaddle.offsetHeight/2-leftGun.offsetHeight/2;
  rightGun.style.top=rightPaddle.offsetHeight/2-rightGun.offsetHeight/2;

  leftPaddle.style.top=document.body.clientHeight/2-leftPaddle.offsetHeight/2;
  rightPaddle.style.top=document.body.clientHeight/2-rightPaddle.offsetHeight/2;
}

function init()
{
  leftPaddle=$('leftPaddle');
  rightPaddle=$('rightPaddle');
  leftGun=$('leftGun');
  leftGun.ready=true;
  rightGun=$('rightGun');
  rightGun.ready=true;

  resizeStuff();

  if(window.CollectGarbage) window.CollectGarbage();
  
  soundManager.onload=function()
  {
    setTimeout("analyzeAddress();",100);
  }
}

function analyzeAddress()
{
  var leftWon;
  var leftWinNum=0;
  var rightWinNum=0;
  var leftChangeNum=0;
  var rightChangeNum=0;
  var end=0;

  var a=document.location.href;
  var soundIsOn=false;

  if(a.indexOf('?leftWon=')!=-1)
  {
    leftWon=a.substring(a.indexOf('?leftWon=')+9,a.indexOf('&leftWins='));

    if(leftWon=="true")
    {
      playSound('win.mp3',-75);
    }
    else
    {
      playSound('win.mp3',75);
    }

    leftWinNum=a.substring(a.indexOf('&leftWins=')+10,a.indexOf('&rightWins='));
    leftWins=parseInt(leftWinNum);
    $('leftWins').innerHTML=leftWins;

    rightWinNum=a.substring(a.indexOf('&rightWins=')+11,a.indexOf('&leftChange='));
    rightWins=parseInt(rightWinNum);
    $('rightWins').innerHTML=rightWins;

    leftChangeNum=a.substring(a.indexOf('&leftChange=')+12,a.indexOf('&rightChange='));
    leftChange=parseInt(leftChangeNum);
    leftPaddle.style.height=leftPaddle.offsetHeight+leftChange;
    leftGun.style.top=leftGun.offsetTop+leftChange/2;
    leftPaddle.style.top=leftPaddle.offsetTop-leftChange/2;

    rightChangeNum=a.substring(a.indexOf('&rightChange=')+13,a.indexOf('&soundOn='));
    rightChange=parseInt(rightChangeNum);
    rightPaddle.style.height=rightPaddle.offsetHeight+rightChange;
    rightGun.style.top=rightGun.offsetTop+rightChange/2;
    rightPaddle.style.top=rightPaddle.offsetTop-rightChange/2;

    soundIsOn=a.substring(a.indexOf('&soundOn=')+9,a.indexOf('&leftScore='));
    soundOn=soundIsOn=='true';
    if(!soundOn) $('speakerIcon').src='soundoff.gif';

    leftScore=a.substring(a.indexOf('&leftScore=')+11,a.indexOf('&rightScore='));
    end=a.indexOf('&leftVisible=');
    if(end==-1) end=a.indexOf('&rightVisible=');
    if(end==-1) end=a.length;
    rightScore=a.substring(a.indexOf('&rightScore=')+12,end);

    $('leftScore').innerHTML=leftScore;
    $('rightScore').innerHTML=rightScore;

    setOpac($('playButton'),0);
    fadeButtonsIn(0);
  }
  if(a.indexOf('leftVisible=')!=-1)
  {
    end=a.indexOf('&',a.indexOf('leftVisible=')+12);
    if(end==-1) end=a.length;
    leftPaddle.style.visibility=a.substring(a.indexOf('leftVisible=')+12,end);
  }
  if(a.indexOf('rightVisible=')!=-1)
  {
    end=a.indexOf('&',a.indexOf('rightVisible=')+13);
    if(end==-1) end=a.length;
    rightPaddle.style.visibility=a.substring(a.indexOf('rightVisible=')+13,end);
  }

  leftPaddleUp=readCookie('leftPaddleUp',leftPaddleUp); //a.substring(a.indexOf('&leftPaddleUp=')+14,a.indexOf('&leftPaddleDown='));
  leftPaddleDown=readCookie('leftPaddleDown',leftPaddleDown); //a.substring(a.indexOf('&leftPaddleDown=')+16,a.indexOf('&leftPaddleShoot='));
  leftPaddleShoot=readCookie('leftPaddleShoot',leftPaddleShoot); //a.substring(a.indexOf('&leftPaddleShoot=')+17,a.indexOf('&rightPaddleUp='));
  rightPaddleUp=readCookie('rightPaddleUp',rightPaddleUp); //a.substring(a.indexOf('&rightPaddleUp=')+15,a.indexOf('&rightPaddleDown='));
  rightPaddleDown=readCookie('rightPaddleDown',rightPaddleDown); //a.substring(a.indexOf('&rightPaddleDown=')+17,a.indexOf('&rightPaddleShoot='));
  rightPaddleShoot=readCookie('rightPaddleShoot',rightPaddleShoot); //a.substring(a.indexOf('&rightPaddleShoot=')+18,a.length);

  fillInKeyNames();

  $('playButton').style.visibility='visible';
  $('leftScore').style.visibility='visible';
  $('rightScore').style.visibility='visible';
}

function fillInKeyNames()
{
  $('LPUK').innerHTML=keyNameFromCode(leftPaddleUp);
  $('LPDK').innerHTML=keyNameFromCode(leftPaddleDown);
  $('LPSK').innerHTML=keyNameFromCode(leftPaddleShoot);

  $('RPUK').innerHTML=keyNameFromCode(rightPaddleUp);
  $('RPDK').innerHTML=keyNameFromCode(rightPaddleDown);
  $('RPSK').innerHTML=keyNameFromCode(rightPaddleShoot);
}

function setKeyDivBeingSet(ob)
{
  if(keyDivBeingSet!=ob)
  {
    if(keyDivBeingSet)
    {
      keyDivBeingSet.style.backgroundColor='';
    }
    keyDivBeingSet=ob;
    ob.style.backgroundColor='#7090FF';
  }
  else
  {
    keyDivBeingSet=null;
    ob.style.backgroundColor='';
  }
}

function resetKeys()
{
  leftPaddleUp=87; //W
  createCookie('leftPaddleUp',leftPaddleUp,1000);
  leftPaddleDown=83; //S
  createCookie('leftPaddleDown',leftPaddleDown,1000);
  leftPaddleShoot=68; //D
  createCookie('leftPaddleShoot',leftPaddleShoot,1000);

  rightPaddleUp=73; //I 38; //
  createCookie('rightPaddleUp',rightPaddleUp,1000);
  rightPaddleDown=75; //K 40; //
  createCookie('rightPaddleDown',rightPaddleDown,1000);
  rightPaddleShoot=74; //J 37; //
  createCookie('rightPaddleShoot',rightPaddleShoot,1000);

  fillInKeyNames();
}

function fadeButtonsIn(o)
{
  o=o+0.005;
  setOpac($('playButton'),o);

  setTimeout('fadeButtonsIn('+o+');',10); 
}

function setOpac(ob,opac) //from 0 to 1
{
  ob.style.opacity=opac;
  ob.style.MozOpacity=opac;
  ob.style.KhtmlOpacity=opac;
  ob.style.filter="alpha(opacity="+opac*100+")";
}

function start()
{
  leftScore=0;
  rightScore=0;
  $('leftScore').innerHTML=leftScore;
  $('rightScore').innerHTML=rightScore;

  balls[0]=document.createElement('img');
  balls[0].src="ball.png";
  balls[0].style.position='absolute';
  document.body.appendChild(balls[0]);
  resetBall(0);
  moveStuff();

  $('playButton').style.display='none';
}

function $(id)
{
  return document.getElementById(id);
}

 	function createCookie(name,value,days)
	{
		if (days)
		{
			var date = new Date();
			date.setTime(date.getTime()+(days*24*60*60*1000));
			var expires = "; expires=" + date.toGMTString();
		}
		else var expires = "";
		
		document.cookie = name+"="+value+expires+"; path=/;"
			if (value != "" && readCookie(name) != value)
		{
			return false;
		}
		return true;
	}
	
	function readCookie(name,defaultValue)
	{
		var n = 0;
		var nameEQ = name + "=";
		var ca = document.cookie.split(';');
	
		for(n = 0; n < ca.length;n++)
		{
			var c = ca[n];
			
			while (c.charAt(0)==' ') c = c.substring(1,c.length);
			
			if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
		}
		
		return defaultValue;
	}
