/*
 * The purpose of this function is to express a difference between two
 * dates using a phrase of the form "X years, Y months, and Z days". Due
 * to leap years and varying month lengths, it is not totally clear how
 * to define the "correct" values of X, Y, and Z. (I am talking about an
 * issue of meaning, not an issue of calculation.)
 * 
 * Here I adopt the following convention (and calculation method).
 * Suppose we are trying to compute the amount of time elapsed since
 * date D. First we set X to be the number of anniversaries of D that
 * have occurred, where an "anniversary" is a day when either (a) the
 * (month, day) of D have occurred again, or (b) we "just skipped over"
 * that (month, day) pair due to leap year. (Here we are following the
 * "March 1 birthday" convention used legally in the UK, though other
 * countries use the "February 28 birthday" convention.) Let D' be the
 * most recent anniversary (or just D itself if there have been no
 * anniversaries). Then we set Y to be the number of "mensiversaries" of
 * D' that have occurred, where a "mensiversary" is a day when (a) the
 * day number of D' has occurred again, or (b) we "just skipped over"
 * that day number due to a short month. Let D'' be the most recent
 * mensiversary (or D' itself). Finally, we set Z to be the number of
 * days from D'' to now.
 * 
 * I think one reason the "March 1 birthday" convention feels intuitive
 * to me is that I imagine if I were born on February 29, and I was
 * watching a calendar, and I simply didn't realize that February 29 was
 * getting skipped this year. I would therefore not celebrate my
 * birthday on February 28; I would happily look forward to celebrating
 * it the next day. So when the next day rolls around... I'll just
 * celebrate anyway, even though it's March 1. */
 
function eliminateTime(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

// Assumption: td1 and td2 have been time-eliminated
function mostRecentAnniversary(td1, td2) {
  // The only thing that makes this tricky is leap years. (Maybe td1 is
  // on Feb 29.) Conveniently, if you try to instantiate a date with a
  // nonexistent Feb 29, it automatically becomes Mar 1.
  let ret = new Date(td2.getFullYear(), td1.getMonth(), td1.getDate());
  
  if (ret > td2) {
    // td2 is before its year's anniversary of td1
    ret = new Date(td2.getFullYear() - 1, td1.getMonth(), td1.getDate());
  }
  
  return ret;
}

// Assumption: td1 and td2 have been time-eliminated
function mostRecentMensiversary(td1, td2) {
  // What makes this one tricky is varying month lengths. (Maybe td1 is
  // on the 31st of a month.)
  
  if (td2.getDate() >= td1.getDate()) {
    // The mensiversary was earlier this month, or even today
    return new Date(td2.getFullYear(), td2.getMonth(), td1.getDate());
  } else {
    // The mensiversary was last month -- or possibly the first of this
    // month. Conveniently, if you set the month to -1, it will treat it
    // as December of the previous year.
    let ret = new Date(td2.getFullYear(), td2.getMonth() - 1, td1.getDate());
    if (ret.getDate() != td1.getDate()) {
      return new Date(td2.getFullYear(), td2.getMonth(), 1);
    }
    return ret;
  }
}

function dateDifference(d1, d2) {
  let td1 = eliminateTime(d1);
  let td2 = eliminateTime(d2);
  
  let mra = mostRecentAnniversary(td1, td2);
  let mrm = mostRecentMensiversary(mra, td2);
  
  // Now we can just crudely round to deal with leap year, varying month lengths, and daylight savings
  let years = mra.getFullYear() - td1.getFullYear();
  let months = Math.round((mrm.getTime() - mra.getTime()) / (1000 * 60 * 60 * 24 * 30.5));
  let days = Math.round((td2.getTime() - mrm.getTime()) / (24 * 60 * 60 * 1000));
  
  return [years, months, days];
}

function plural(num, unit) {
  if (num == 1) return "1 " + unit;
  return num + " " + unit + "s";
}

function dateDifferenceString(d1, d2) {
  let arr = dateDifference(d1, d2);
  
  let ys = plural(arr[0], "year");
  let ms = plural(arr[1], "month");
  let ds = plural(arr[2], "day");
  
  if (arr[0] > 0) {
    return ys + ", " + ms + ", and " + ds;
  }
  
  if (arr[1] > 0) {
    return ms + " and " + ds;
  }
  
  return ds;
}
