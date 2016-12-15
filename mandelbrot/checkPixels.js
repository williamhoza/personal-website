var iterations=0;
var minIndex=0;
var numberOfPoints=0;
var m=new Array();
var notAllDead=true;

function nextIteration()
{
  iterations++;
  notAllDead=false;
  var toBeMessaged=new Array();
  for(var i=minIndex;i<minIndex+numberOfPoints;i++)
  {
    if(m[i].death==-1)
    {
      var newVRe=Math.pow(m[i].vRe,2)-Math.pow(m[i].vIm,2) + m[i].re;
      var newVIm=2*m[i].vRe*m[i].vIm + m[i].im;
      
      m[i].vRe=newVRe;
      m[i].vIm=newVIm;
      
      m[i].val=Math.pow(m[i].vRe,2)+Math.pow(m[i].vIm,2);
      if(m[i].val>4)
      {
        m[i].death=iterations;
        toBeMessaged[toBeMessaged.length]=i;
      }
      else
      {
        notAllDead=true;
      }
    }
  }
  
  self.postMessage({'died':toBeMessaged, 'iterations':iterations});
}

function init()
{
  self.onmessage=function(evt)
  {
    for(var screenX=0;screenX<evt.data.imageSize;screenX++)
    {
      for(var screenY=0;screenY<evt.data.imageSize;screenY++)
      {
        var i=m.length;
        m[i]=new Object();
        m[i].re=evt.data.xMin+screenX/evt.data.imageSize*(evt.data.xMax-evt.data.xMin);
        m[i].im=evt.data.yMin+screenY/evt.data.imageSize*(evt.data.xMax-evt.data.xMin);
        m[i].vRe=m[i].re;
        m[i].vIm=m[i].im;
        m[i].death=-1;
        m[i].index=i;
        m[i].sX=screenX;
        m[i].sY=screenY;
        m[i].justDied=false;
      }
    }
    minIndex=evt.data.minIndex;
    numberOfPoints=evt.data.numberOfPoints;
    
    while(notAllDead)
    {
      nextIteration();
    }
    self.postMessage('done');
    self.close();
  }
}

init();
