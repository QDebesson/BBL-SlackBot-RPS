let RockPaperScissors = require('./rockpaperscissors.js');

class Player {
  constructor(id, name, privateChannel, slack) {
    this.id = id;
    this.name = name;
    this.privateChannel = privateChannel;
    this.slack = slack;
  }

  registerPlay(message) {
    if(message === RockPaperScissors.Rock
      || message === RockPaperScissors.Paper
      || message === RockPaperScissors.Scissors) {
      this.play = message;
      this.hasPlayed = true;
      this.sendMessage('C\'est noté ! :)');
    } else {
      this.sendMessage('Commande invalide, essaye encore avec "!rock", "!paper" ou "!scissors".');
    }
  }

  sendMessage(message) {
    this.slack.sendMessage(message, this.privateChannel);
  }
}

module.exports = Player;