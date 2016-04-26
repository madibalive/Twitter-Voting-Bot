var twit = require('twit');
var _ = require('lodash');
var natural = require('natural');
var secret = require("./secret.js");

var Twitter = new twit(secret);
var tokenizer = new natural.WordTokenizer();

//sample database ,improve to redis persistance store
var contestants = [
  { 'name': 'MAHAMA', 'votes': 10 },
  { 'name': 'NANA', 'votes': 10 },
  { 'name': 'INDOM', 'votes': 10 }
]
//sample database ,improve to redis persistance store

var voterRegistration = [];
// we will randomly pick one of these items in this array

var successMsg = [
  "retweet so other can vote too.",
  "Most likely.",
  "vote is confirmed.",
  "Thank you for voting ."
]
var errorMsg = [
  "Reply hazy, try again.",
  "try again later.",
]

var denyMsg = [
  "Don't vote more once .",
  "double votes ,gets rejected",
]
function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function matchRE(re, text) {
  var wordArray = tokenizer.tokenize(text);
  for (var i = 0; i < wordArray.length; i++) {
    if (re.test(wordArray[i])) {
      return true;
    }
  }
  return false;
}

function post(content) {
  console.log(content);
  Twitter.post('statuses/update', { status: content }, function (err, data, response) {
  })
}

function postHelp(mention) {
  var msg = '@' + mention + ' ' + 'Hi,i am twitter voting bot,Tweet at me [OPTIONS,RESULT] to get started';
  post(msg);
}

function postOptions(mention) {
  var msg = '@' + mention + ' OPTIONS are [MAHAMA,NANA,NDOUM],reply with VOTE followed by one of the options ';
  post(msg);
}

function postResult(mention) {

  var string1 = contestants[0].name + " : " + contestants[0].votes;
  var string2 = contestants[1].name + " : " + contestants[1].votes;
  var string3 = contestants[2].name + " : " + contestants[2].votes;

  var msg = "@" + mention + " " + string1 + " ," + string2 + " " + string3;
  post(msg)
}

function doVote(name, mention) {
  var msg;
  //has already voted 
  var checkVoted = _.findKey(voterRegistration, { 'name': mention });

  if (!checkVoted) {
    var a = _.findKey(contestants, { 'name': name });
    contestants[a].votes = contestants[a].votes + 1;

    msg = '@' + mention + ' ' + ' Vote success';
    post(msg)
    voterRegistration.push({ 'name': mention })
    return
  } else {
    msg = "@" + mention + " Sorry you cant vote twice, or see admin if this is not an error";
    post(msg);
  }
}

function vote(mention, tweet) {
  var mahamaRe = /^MAHAMA$/;
  var nanaRe = /^NANA$/;
  var induomRe = /^INDUOM$/;
  if (matchRE(mahamaRe, tweet)) {
    doVote('MAHAMA', mention)
  } else if (matchRE(nanaRe, tweet)) {
    doVote('NANA', mention)
  } else if (matchRE(induomRe, tweet)) {
    doVote('NDOUM', mention)
  } else {
    var msg = '@' + mention + ' ' + 'Please include a contestant name to vote for the person,reply with HELP'
    post(msg);
  }
}

var stream = Twitter.stream('statuses/filter', { track: '#GhanaDecides' })

// Call the stream function and pass in 'statuses/filter', our filter object, and our callback
stream.on('tweet', function (tweet) {

  var mention = tweet.user.screen_name;
  var text = tweet.text;
  console.log(text);

  // RegExes
  var optionsRe = /^OPTIONS$/;
  var helpRE = /^HELP$/;
  var voteRE = /^VOTE$/;
  var resultRE = /^RESULT$/;

  if (matchRE(optionsRe, text)) {
    postOptions(mention)
  } else if (matchRE(helpRE, text)) {
    postHelp(mention)
  } else if (matchRE(voteRE, text)) {
    vote(mention, text);
  } else if (matchRE(resultRE, text)) {
    postResult(mention)
  } else {
    post("Hey " + "@" + mention + "am a voting bot, tweet me with [HELP, OPTIONS ,RESULT] for more infor");
  }
});

stream.on('error', function (error) {
  //print out the error
  console.log(error);
});
