const rx = require('rx');

const Rock ='!rock';
const Paper = '!paper';
const Scissors = '!scissors';

class RockPaperScissors {
  constructor(players, channel, slack) {
    this.players = players;
    this.channel = channel;
    this.slack = slack;
  }

  startGame() {
    this.sendMessage('Vous êtes deux joueurs, la partie va commencer...');
    this.players.forEach(player => {
      player.sendMessage(player.name + ', faites votre choix : !paper, !rock ou !scissors ?');
    });
    this.started = true;
    this.players.forEach(player => player.hasPlayed = false);
  }

  registerMove(message) {
    let user = this.players.find(player => player.id === message.user && player.privateChannel === message.channel);
    if(user && (!user.hasPlayed)) {
      user.registerPlay(message.text);

      if(this.players[0].hasPlayed && this.players[1].hasPlayed) {
        this.started = false;
        this.showResult();
      }
    } else {
      this.sendMessage('Hem... soit je ne te connais pas, soit tu n\as pas parlé là où il fallait !');
    }
  }

  showResult() {
    this.sendMessage(this.players[0].name + ' a fait ' + this.players[0].play);
    this.sendMessage(this.players[1].name + ' a fait ' + this.players[1].play);

    switch (this.comparePlays()) {
      case -1:
        this.sendMessage('Oh ! C\'est une égalité ! C\'est très rare :) ... hem.');
        break;
      case 0:
        this.sendMessage(this.players[0].name + ' a gagné !');
        break;
      case 1:
        this.sendMessage(this.players[1].name + ' a gagné !');
        break;
    }
    this.startGame();
  }

  sendMessage(message) {
    this.slack.sendMessage(message, this.channel);
  }

  comparePlays() {
    let player1 = this.players[0];
    let player2 = this.players[1];
    if(player1.play === player2.play) {
      return -1;
    }

    switch (player1.play) {
      case Rock:
        return player2.play === Scissors ? 0 : 1;
      case Paper:
        return player2.play === Rock ? 0 : 1;
      case Scissors:
        return player2.play === Paper ? 0 : 1;
    }
  }

  removePlayer(userId) {
    let user = this.players.find(player => player.id === userId);
    user && this.players.splice(this.players.indexOf(user), 1);
    this.started = false;
    this.players.forEach(player => {
      player.sendMessage('Votre adversaire a quitté la partie :(');
      player.hasPlayed = false;
    });
    this.sendMessage(user.name + ' a quitté la partie ! Qui veut jouer ? :)');
    return this.players;
  }
}

module.exports = {
  RockPaperScissors: RockPaperScissors,
  Rock: Rock,
  Paper: Paper,
  Scissors: Scissors
};