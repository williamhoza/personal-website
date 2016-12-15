function HoldemGame()
{
  this.players=new Array();
  
  this.addPlayer(2, "You");
  this.community=this.addPlayer(5, "Community");
  this.addPlayer(2, "Player 2");
  
  this.unusedCards=deck.slice(0);
  
  //this.players[0].cardSlots[0].setCard(deck[12]);
  //this.players[0].cardSlots[1].setCard(deck[25]);
}
HoldemGame.prototype.addPlayer=function(numberOfCards, name)
{
  var index=this.players.length;
  this.players[index]=new Player(numberOfCards, name, this);
  return this.players[index];
}
//returns 1 for win, 0 for tie, -1 for lose
HoldemGame.prototype.checkIfPlayerWon=function(p)
{
  var retVal=1;
  var pSet=setFromSlotCollection(this.community.cardSlots.concat(p.cardSlots));
  p.bestHand=pSet.getHand();
  for(var i=1;i<this.players.length;i++)
  {
    if(this.players[i]!=p && this.players[i]!=this.community)
    {
      var otherSet=setFromSlotCollection(this.community.cardSlots.concat(this.players[i].cardSlots));
      this.players[i].bestHand=otherSet.getHand();
      var c=Hand.compare(p.bestHand, this.players[i].bestHand);
      if(c == 0) retVal++;
      if(c < 0) return 0;
    }
  }
  return retVal;
}
HoldemGame.prototype.removeExtraPlayers=function()
{
  for(var i=3;i<this.players.length;i++)
  {
    for(var j=0;j<this.players[i].cardSlots.length;j++)
    {
      this.players[i].cardSlots[j].setCard(null);
    }
  }
  this.players.splice(3, this.players.length-3);
}

function setFromSlotCollection(c)
{
  var cards=new Array();
  for(var i=0;i<c.length;i++)
  {
    if(c[i].card!=null) cards[cards.length]=c[i].card;
  }
  return new Set(cards);
}

function CardSlot(parentGame)
{
  this.parentGame=parentGame;
}
CardSlot.prototype.setCard=function(card, unusedCardsIndex)
{
  if(card!=this.card)
  {
    var foundCard=false;

    if(card!=null)
    {
      if(unusedCardsIndex==undefined)
      {
        for(var i=0;i<this.parentGame.unusedCards.length;i++)
        {
          if(this.parentGame.unusedCards[i]==card)
          {
            this.parentGame.unusedCards.splice(i,1);
            foundCard=true;
            break;
          }
        }
      }
      else
      {
        if(this.parentGame.unusedCards[unusedCardsIndex]==card)
        {
          this.parentGame.unusedCards.splice(unusedCardsIndex,1);
          foundCard=true;
        }
      }

      if(!foundCard) return false;
    }

    if(this.card!=null)
    {
      this.parentGame.unusedCards[this.parentGame.unusedCards.length]=this.card;
    }
    
    this.card=card;
  }
  
  return true;
}
CardSlot.prototype.toString=function()
{
  if(this.card==null) return "null";
  return this.card.toString();
}

function Player(numberOfCards, name, parentGame) //note that the "community" is a "player".
{
  this.cardSlots=new Array();
  for(var i=0;i<numberOfCards;i++)
  {
    this.cardSlots[i]=new CardSlot(parentGame);
  }
  this.name=name;
  this.parentGame=parentGame;
  this.cardDiv=null;
}
