var game=null;
var emptySlots=null;
var simulating=false;

importScripts('pokerHands.js', 'holdem.js');

self.onmessage=function(evt)
{
  game=new HoldemGame();
  emptySlots=new Array();
  for(var i=0;i<evt.data.players.length;i++)
  {
    if(i >= game.players.length)
    {
      //self.postMessage(evt.data.players[i].cardSlots.length + " , " + evt.data.players[i].name);
      game.addPlayer(evt.data.players[i].cardSlots.length, evt.data.players[i].name);
    }
    
    for(var j=0;j<evt.data.players[i].cardSlots.length;j++)
    {
      if(game.players[i].cardSlots.length<=j)
      {
        game.players[i].cardSlots[j]=new CardSlot(game);
      }
      var c=evt.data.players[i].cardSlots[j].card;
      if(c!=null)
      {
        game.players[i].cardSlots[j].setCard(cardFromSuitAndRank(c.suit,c.rank));
      }
      else
      {
        emptySlots[emptySlots.length]=game.players[i].cardSlots[j];
      }
    }
  }
  
  simulateGame();
}

function simulateGame()
{
  while(true)
  {
    for(var i=0;i<emptySlots.length;i++)
    {
      emptySlots[i].setCard(null);
    }
    
    for(var i=0;i<emptySlots.length;i++)
    {
      var index=Math.floor(Math.random()*game.unusedCards.length);
      emptySlots[i].setCard(game.unusedCards[index],index);
    }
    
    /*
    var pSet=setFromSlotCollection(game.community.cardSlots.concat(game.players[0].cardSlots));
    var qSet=setFromSlotCollection(game.community.cardSlots.concat(game.players[2].cardSlots));
    
    var s="player 1 has " + game.players[0].cardSlots.toStringRecursive() + "\n";
    s+="player 2 has " + game.players[2].cardSlots.toStringRecursive() + "\n";
    s+="community is " + game.players[1].cardSlots.toStringRecursive() + "\n";
    s+="player 1's best hand is " + pSet.getHand().toString() + "\n";
    s+="player 2's best hand is " + qSet.getHand().toString() + "\n";
    s+="does player 1 win? " + game.checkIfPlayerWon(game.players[0]);
    
    self.postMessage(s);
    */
    
    self.postMessage({'outcome': game.checkIfPlayerWon(game.players[0]), 'handTypeRank': game.players[0].bestHand.type.rank});
  }
}
