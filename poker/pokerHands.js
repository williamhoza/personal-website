var cardRanks=new Array();
var suits=new Array();
var deck=new Array();
var handTypes=new Array();

var HIGH_CARD=null;
var PAIR=null;
var TWO_PAIR=null;
var THREE_OF_A_KIND=null;
var STRAIGHT=null;
var FLUSH=null;
var FULL_HOUSE=null;
var FOUR_OF_A_KIND=null;
var STRAIGHT_FLUSH=null;

function HandType(rank, name)
{
  this.rank=rank;
  this.name=name;
}
HandType.compare=function(a, b)
{
  return a.rank-b.rank;
}

function CardRank(value, shortName, longName)
{
  this.value=value;
  this.shortName=this.value+"";
  this.longName=this.value+"";
}
CardRank.compare=function(a,b)
{
  return a.value-b.value;
}
CardRank.prototype.toString=function()
{
  return this.shortName;
}

function Suit(value, shortName, longName, index)
{
  this.value=value;
  this.shortName=shortName;
  this.longName=longName;
}
Suit.compare=function(a,b)
{
  return a.rank-b.rank;
}
Suit.prototype.toString=function()
{
  return this.shortName;
}

Array.prototype.getMaximum=function(compareFunc)
{
  var maxElement=this[0];
  for(var i=1;i<this.length;i++)
  {
    var c=compareFunc(this[i], maxElement);
    if(c > 0) maxElement=this[i];
  }
  return maxElement;
}

Array.prototype.getHistogramFromSorted=function(compareFunc)
{
  var retVal=new Array();
  var j=0;

  for(var i=0;i<this.length;i++)
  {
    if(i==0 || compareFunc(this[i],this[i-1])!=0)
    {
      retVal[retVal.length]=new Array();
      j=0;
    }
    retVal[retVal.length-1][j]=this[i];
    j++;
  }
  
  return retVal.sort(compareLengthsThenCardsDesc);
}

Array.prototype.getFirstValues=function()
{
  var retVal=new Array();
  for(var i=0;i<this.length;i++)
  {
    retVal[i]=this[i][0];
  }
  return retVal;
}

function compareLengthsThenCardsDesc(a, b)
{
  var diff=b.length-a.length;
  if(diff!=0) return diff;
  return Card.compareDesc(a[0], b[0]);
}

Array.prototype.toStringRecursive=function()
{
  var retVal="[";
  for(var i=0;i<this.length;i++)
  {
    if(typeof this[i] == "object")
    {
      if(this[i].toStringRecursive)
      {
        retVal+=this[i].toStringRecursive();
      }
      else if(this[i].toString)
      {
        retVal+=this[i].toString();
      }
      else
      {
        retVal+="[object]";
      }
    }
    else
    {
      retVal+=this[i];
    }
    
    if(i!=this.length-1) retVal+=", ";
  }
  retVal+="]";
  return retVal;
}

function Card(rank, suit)
{
  this.rank=rank;
  this.suit=suit;
}
Card.compare=function(a,b)
{
  return CardRank.compare(a.rank, b.rank);
}
Card.compareDesc=function(a,b)
{
  return -Card.compare(a,b);
}
Card.prototype.toString=function()
{
  return this.rank.toString()+this.suit.toString();
}

function Hand(type, definingCards)
{
  this.type=type;
  this.definingCards=definingCards;
}
Hand.compare=function(a,b)
{
  if(a.type != b.type) return HandType.compare(a.type, b.type);
  for(var i=0;i<a.definingCards.length;i++)
  {
    var c=Card.compare(a.definingCards[i], b.definingCards[i]);
    if(c!=0) return c;
  }
  return 0;
}
Hand.prototype.toString=function()
{
  return this.type.name + " : " + this.definingCards.toStringRecursive();
}

function Set(cards)
{
  this.cards=cards;
  this.hand=null;
}
Set.prototype.getHand=function()
{
  if(this.hand==null) return this.findHand();
  return this.hand;
}
Set.prototype.findHand=function()
{
  if(this.cards.length>5)
  {
    var subSets=new Array();
    for(var i=0;i<this.cards.length;i++)
    {
      subSets[i]=new Set(this.cards.slice(0));
      subSets[i].cards.splice(i, 1);
    }
    this.hand=subSets.getMaximum(Set.compare).getHand();
  }
  else if(this.cards.length==5)
  {
    this.cards.sort(Card.compareDesc);
    var histogram=this.cards.getHistogramFromSorted(Card.compare);
    var threeOfAKindPresent=null;
    var pairsPresent=new Array();
    
    if(histogram[0].length==4)
    {
      this.hand=new Hand(FOUR_OF_A_KIND, histogram.getFirstValues());
    }
    else if(histogram[0].length==3)
    {
      if(histogram[1].length==2)
      {
        this.hand=new Hand(FULL_HOUSE, histogram.getFirstValues());
      }
      else
      {
        this.hand=new Hand(THREE_OF_A_KIND, histogram.getFirstValues());
      }
    }
    else if(histogram[0].length==2)
    {
      if(histogram[1].length==2)
      {
        this.hand=new Hand(TWO_PAIR, histogram.getFirstValues());
      }
      else
      {
        this.hand=new Hand(PAIR, histogram.getFirstValues());
      }
    }
    
    if(this.hand==null)
    {
      //no two cards have the same rank. time to check for flush/straight
      var flushSuit=this.cards[0].suit;
      for(var i=1;i<this.cards.length;i++)
      {
        if(this.cards[i].suit!=flushSuit)
        {
          flushSuit=null;
          break;
        }
      }
      
      var cardDiff=Card.compare(this.cards[0],this.cards[4]);
      var topOfStraight=null;
      if(cardDiff==4)
      {
        topOfStraight=this.cards[0];
      }
      else if(this.cards[0].rank==cardRankFromVal(14) && this.cards[1].rank==cardRankFromVal(5))
      {
        topOfStraight=this.cards[1];
      }
      
      if(flushSuit!=null && topOfStraight!=null)
      {
        this.hand=new Hand(STRAIGHT_FLUSH, [topOfStraight]);
      }
      else if(flushSuit!=null)
      {
        this.hand=new Hand(FLUSH, this.cards);
      }
      else if(topOfStraight!=null)
      {
        this.hand=new Hand(STRAIGHT, [topOfStraight]);
      }
      else
      {
        this.hand=new Hand(HIGH_CARD, this.cards);
      }
    }
  }
  return this.hand;
}
Set.compare=function(a,b)
{
  return Hand.compare(a.getHand(), b.getHand());
}

function defineCardRanks()
{
  for(var i=2;i<=14;i++)
  {
    cardRanks[cardRanks.length]=new CardRank(i);
  }
  cardRankFromVal(10).shortName='T';
  cardRankFromVal(11).shortName='J';
  cardRankFromVal(11).longName='Jack';
  cardRankFromVal(12).shortName='Q';
  cardRankFromVal(12).longName='Queen';
  cardRankFromVal(13).shortName='K';
  cardRankFromVal(13).longName='King';
  cardRankFromVal(14).shortName='A';
  cardRankFromVal(14).longName='Ace';
}

function defineSuits()
{
  suits[0]=new Suit(0, "C", "Clubs");
  suits[1]=new Suit(1, "D", "Diamonds");
  suits[2]=new Suit(2, "H", "Hearts");
  suits[3]=new Suit(3, "S", "Spades");
}

function defineDeck()
{
  for(var i=0;i<suits.length;i++)
  {
    for(var j=0;j<cardRanks.length;j++)
    {
      deck[deck.length]=new Card(cardRanks[j], suits[i]);
    }
  }
}

function defineHandTypes()
{
  handTypes[handTypes.length]=HIGH_CARD=new HandType(0, "High Card");
  handTypes[handTypes.length]=PAIR=new HandType(1, "Pair");
  handTypes[handTypes.length]=TWO_PAIR=new HandType(2, "Two Pair");
  handTypes[handTypes.length]=THREE_OF_A_KIND=new HandType(3, "Three of a Kind");
  handTypes[handTypes.length]=STRAIGHT=new HandType(4, "Straight");
  handTypes[handTypes.length]=FLUSH=new HandType(5, "Flush");
  handTypes[handTypes.length]=FULL_HOUSE=new HandType(6, "Full House");
  handTypes[handTypes.length]=FOUR_OF_A_KIND=new HandType(7, "Four of a Kind");
  handTypes[handTypes.length]=STRAIGHT_FLUSH=new HandType(8, "Straight Flush");
}

function init()
{
  defineCardRanks();
  defineSuits();
  defineDeck();
  defineHandTypes();
}

function cardRankFromVal(v)
{
  return cardRanks[v-2];
}

function cardFromSuitAndRank(suit, rank)
{
  return deck[suit.value*cardRanks.length + rank.value-2];
}

init();
