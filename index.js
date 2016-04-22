var twit = require('twit');
var _ = require('lodash');


// importing my secret.json file
var secret = require("./secret");

// my secret.json file looks like this:
var Twitter = new twit(secret);

//sample database ,improve to redis persistance store
var contestants = [
    { 'name': 'MAHAMA', 'votes': 10 },
    { 'name': 'NANA', 'votes': 10 },
    { 'name': 'INDOM', 'votes': 10 }
]
//sample database ,improve to redis persistance store

var voterRegistration = []

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
    twitter.post('statuses/update', { status: content }, function (err, data, response) {
    })
}
function postHelp(mention) {
    var msg = 'Hi,i am twitter voting bot,Tweet at me [HELP, OPTIONS,RESULT] to get started';
    post(message);
}

function options(mention) {
    var msg = '@' + mention + ' OPTIONS are [MAHAMA,NANA,NDOUM],reply with VOTE followed by one of the options ';
}
function doVote(name, mention) {
    var msg;
    //has already voted 
    var checkVoted = _.findKey(voterRegistration, { 'name': mention });

    if (!checkVoted) {
        var contestant = _.find(contestants, { 'name': name });
        constestant.vote = contestant.votes + 1;

        msg = mention + ' Vote success'
        post(message)
        voterRegistration.push({ 'name': mention })
        return
    } else {
        msg = mention + " Sorry you cant vote twice, or see admin if this is not an error";
        post(msg);
    }


}

function vote(mention, tweet) {
    var mahamaRe = /^MAHAMA$/;
    var nanaRe = /^NANA$/;
    var induomRe = /^INDUOM$/
    var wordArray = tokenizer.tokenize(tweet);
    if (matchRE(mahamaRe, text)) {
        doVote(mention)
    } else if (matchRE(nanaRe, text)) {
        doVote(mention)
    } else if (matchRE(induomRe, text)) {
        doVote(mention)
    } else {
        post('Please include a contestant name to vote for the person ');
    }
}

// Call the stream function and pass in 'statuses/filter', our filter object, and our callback
Twitter.stream('statuses/filter', { track: '#GhVoteBot' }, function (stream) {

    // ... when we get tweet data...
    stream.on('data', function (tweet) {

        var mention = tweet.user.screen_name;
        var text = tweet.text;

        // RegExes
        var optionsRe = /^OPTIONS$/;
        var helpRE = /^HELP$/;
        var voteRE = /^VOTE$/;
        var resultRE = /^RESULT$/;
        var jokesRE = /^jokes$/;

        if (matchRE(optionsRe, text)) {
            postOptions(mention)
        } else if (matchRE(helpRE, text)) {
            postHelp(mention)
        } else if (matchRE(voteRE, text)) {
            vote(mention, text);
        } else if (matchRE(resultRe, text)) {
            postResult(mention)
        } else {
            post("Hey " + "@" + mention + "  tweet me with [HELP, OPTIONS ,RESULT] for more infor");
        }

        // ... when we get an error...
        stream.on('error', function (error) {
            //print out the error
            console.log(error);
        });
    });

}