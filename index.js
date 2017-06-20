let Slack = require('@slack/client');
const Game = require('./game/rockpaperscissors');
const CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
const Player = require('./game/player');
const SlackEnv = require('./.env/environment').GLOBAL_VARIABLES;

let rtm = new Slack.RtmClient(SlackEnv.token, {logLevel: 'error', dataStore: new Slack.MemoryDataStore()});

let users = [];
let game = null;

rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, () => {
  console.log('Logged in...');
});

rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, () => {
  console.log('In !');
  rtm.sendMessage('Hello. Time is currently ' + new Date().toDateString(), SlackEnv.channelId);
});

rtm.on(Slack.RTM_EVENTS.MESSAGE, (message) => {
  if (message.type === 'message') {
    if (message.text === '!join') {
      let user = rtm.dataStore.getUserById(message.user);
      user.dm = rtm.dataStore.getDMByUserId(message.user);
      if (users.length < 2) {
        if (users.filter(user => user.id === message.user).length === 0) {
          users.push(new Player(user.id, user.name, user.dm.id, rtm));
          rtm.sendMessage(user.name + ', vous avez rejoint la partie !', SlackEnv.channelId);
          if (users.length === 2) {
            startGame();
          }
        } else {
          rtm.sendMessage(user.name + ', vous avez déjà rejoint la partie !', SlackEnv.channelId);
        }
      }
    } else if(game && game.started && (message.text === Game.Rock || message.text === Game.Paper || message.text === Game.Scissors)) {
      game.registerMove(message);
    } else if(message.text === '!quit') {
      if(game && game.started) {
        users = game.removePlayer(message.user);
      } else if(users && users[0]) {
        rtm.sendMessage(users[0].name + ' a quitté la partie ! Qui veut jouer ? :)', SlackEnv.channelId);
        users = [];
      }
    }
  }
});

rtm.start();

let startGame = () => {
  game = new Game.RockPaperScissors(users, SlackEnv.channelId, rtm);
  game.startGame();
};