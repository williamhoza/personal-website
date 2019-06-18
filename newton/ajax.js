///////////////////////////////////////////////////////////////////////////////
// ajax.js BY BRADLEY HOZA
//
// defines class Ajax.
//
// An Ajax object makes it very simple to use ajax in your application.
// Simply create an instance and invoke the send() method for GET requests.
// For POSTing form data, just invoke postForm(), passing in a reference
// to the form, or one of it's buttons.
//
// Throw the instance away immediately; it will live long enough to call
// your handler function when the server response is received.
//
// version history:
// 03/19/06 bjh: created
// 06/14/07 bjh: spruced up for production use.
// 06/26/07 bjh: added support for SELECT (list/combo boxes)
// 09/18/07 bjh: modified to honor the DISABLED status of form fields.
//               (Disabled fields should not be posted, to reflect what happens
//               during normal, non-ajax form post.) Previously, all form
//               fields were posted.
// 04/02/08 bjh: changed String.prototype.urlEncode() function to use
//               encodeURIComponent() function, which fixed bugs related to
//               non-ascii characters.  Previously, these characters, such as
//               accented characters, were escaped rather than UTF8 encoded,
//               which mangled them (since the server was decoding them using
//               UTF8).
///////////////////////////////////////////////////////////////////////////////

//define a urlEncode() function on the String object for use in POSTing data
if( !String.prototype.urlEncode ) //function does not exist yet
{
  String.prototype.urlEncode = function()
  {
    return encodeURIComponent(this);
  } //end fn urlEncode()
} //end if function does not exist yet


//////////////////////////////////////////////////////////////////////////////
//constructor
//
//url is the target url; the web request (GET) or form POST will be sent here.
//
//handler is a reference to a function that will be invoked once the
//response is received from the server.  The handler must be a function
//which accepts one parameter - a reference to this Ajax object.
//The handler has access to this object's 'responseText' property.
//TODO: also give the handler access to the http status code.
//
//After creating the object with this constructor, invoke either the
//send() method (simple web GET request) or the postForm() method.
//Single use only.  Don't invoke more than once.  (Multiple use is
//simply untested.)
//////////////////////////////////////////////////////////////////////////////
function Ajax(url, handler)
{
  if( !url || url.length==0 )
  {
    alert('invalid url passed');
    return;
  }

  //save instance data
  this.url = url;
  this.handler = handler;
  this.inet = getInet(); //new XMLHttpRequest(); //may not work in MSIE 5, but we don't care

  //an instance variable available to event handler below
  var me = this;

  //an event handler with access to 'me'
  this.inet.onreadystatechange = function()
  {
    if( me.inet.readyState != 4 ) return;
    me.responseText = me.inet.responseText;
    if( me.handler ) me.handler(me);
    me.handler = null;
    me.inet = null;
  };
} //end class ajax


Ajax.prototype.send = function(postParameters)
{
  if( !postParameters ) //simple GET
  {
    this.inet.open('GET', this.url, true);
    this.inet.send(null);
  }
  else //do POST
  {
    this.inet.open('POST', this.url, true);
    this.inet.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    this.inet.send(postParameters);
  }
}


//b is a button on a form (TODO: document this function better)
//TODO: okay to pass in a form or a button either one...
Ajax.prototype.postForm = function(b)
{
  if( !b || !b.nodeName )
  {
    var s = '' + b + ': ';
    var p;
    if( b ) for( p in b ) s += p +'='+ b[p] +'; ';
    if( b.length )
    {
      s += '\nThe parameter may be an array.  The form may have ' +
           'multiple buttons with the same name.';
    }
    alert('Internal Error: invalid parameter passed to postForm().\n\n' +
          'The following information is for technical support:\n' + s);
    return; //--------------- note early exit -------------------
  }
  
  var f = ( b.nodeName.toLowerCase()=='input' ) ? b.form : b;
  var postParameters = '';

  //loop through form fields, gather names and values, URL encoding them
  var i;
  var fields = f.elements;
  for(i=0; i<fields.length; i++)
  {
    var e = fields[i];

    if ( !e.disabled ) //only consider form fields that are not disabled
    switch( e.nodeName.toLowerCase() ) //textarea, input, etc
    {
      case 'textarea':
        postParameters += ((i==0) ? '' : '&') + e.name +'='+ e.innerText.urlEncode();
        break;

      case 'input':
        var addparam = false;
        switch( e.type.toLowerCase() ) //submit, button, checkbox, radio, etc
        {
          case 'submit':
          case 'button':
            addparam = ( b==e ); //if current element *is* the button parameter passed in
            break;

          case 'checkbox':
          case 'radio':
            addparam = ( e.checked  );
            break;

          default:
            addparam = true;
            break;
        } //end switch on 'input' node 'type'
        if( addparam ) postParameters += ((i==0) ? '' : '&') + e.name +'='+ e.value.urlEncode();
        break; //end case for 'input' node
        
      case 'select':
        var opts = e.options;
        var j;
        for( j=0; j<opts.length; j++ ) //look at one option
        {
          var opt = opts[j];
          //Note: when the option is selected, we use the SELECT name with the OPTION value
          if( opt.selected ) postParameters += ((i==0) ? '' : '&') + e.name +'='+ opt.value.urlEncode();
        } //look at next option
        break;

      default:
        alert('internal error: unexpected item in form.elements collection (not <input>, <select> or <textarea>): ' + e.nodeName);
        //unexpected element ignored
        break;
    } //end switch on nodeName (and end if not disabled)

  } //next field

  //special handling of image button - which is not part of elements collection
  if( b.nodeName.toLowerCase()=='input' && b.type.toLowerCase()=='image' )
  {
    var x = event.x - b.offsetLeft - b.clientLeft - 2; //hack: -2 accommodates what???
    var y = event.y - b.offsetTop - b.clientTop - 2;
    alert( x +','+ y );
    postParameters += ((i==0) ? '' : '&') + b.name +'.X='+ x;
    postParameters += ((i==0) ? '' : '&') + b.name +'.Y='+ y;
  } //end if image button

  this.send(postParameters);
}


function getInet()
{
    var xmlhttp;

    // @-c-c-o-n is a conditional-compilation compiler directive
    // !!! This code is not actually commented out !!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // cf. http://ns7.webmasters.com/caspdoc/html/jscript_cc_on_statement.htm

    /*@cc_on
      @if (@_jscript_version >= 5)
          try
          {
              xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
          }
          catch (e)
          {
              try
              {
                  xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
              }
              catch (E)
              {
                  xmlhttp = false;
              }
         }
      @else
         xmlhttp = false;
    @end @*/

    /** Every other browser on the planet */
    if (!xmlhttp && typeof XMLHttpRequest != 'undefined')
    {
        try
        {
            xmlhttp = new XMLHttpRequest();
        }
        catch (e)
        {
            xmlhttp = false;
        }
    }

    return xmlhttp;
} //end fn getInet()
