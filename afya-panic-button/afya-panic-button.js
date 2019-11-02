/**
 * PanicButton by Marcin Chuć
 * e-mail: marcin ...change it to at... afya.pl
 * (C) 2019
 */

module.exports = function(RED) {
  /**
   main function
  */
  function AFYAPanicButton(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    node.on('input', function(msg) {

      // my Panic Button variable
      var variableName = config.variableName;
      // how many time to click x times
      var timeToClick = config.timeToClick; //seconds
      // how many times to click
      var howManyTimesToClick = config.howManyTimesToClick;
      // set the answers
      var answerPanic = config.answerPanic;
      var answerDontPanic = config.answerDontPanic;
      var timestamp = Date.now();
      var panicButton = this.context().flow.get(variableName) || {};
      // what if panicButton isn't declared
      if (panicButton.count === undefined) {
        panicButton.count = 0;
      }
      if (panicButton.timestamp === undefined) {
        panicButton.timestamp = timestamp;
      }


      // if clickable arrives within a set time
      if (panicButton.timestamp + (timeToClick * 1000) > timestamp) {
        panicButton.count++;
        var timeLeft = Math.round((timeToClick * 100) - ((timestamp - panicButton.timestamp) / 10)) / 100;
        this.status({
          fill: "green",
          shape: "ring",
          text: "state: " + answerDontPanic + " - " + panicButton.count + "/" + howManyTimesToClick + " left: " + timeLeft + " seconds <" + timeConvert(timestamp) + ">"
        });
      } else // and if don't - reset counter
      {
        panicButton.count = 1;
        panicButton.timestamp = timestamp;
        this.status({
          fill: "green",
          shape: "ring",
          text: "state: " + answerDontPanic + " - " + panicButton.count + "/" + howManyTimesToClick + " left: " + timeToClick + " seconds <" + timeConvert(timestamp) + ">"
        });
      }

      // recommended number of clicks reached: report Panic
      if (panicButton.count > howManyTimesToClick - 1) {
        panicButton.count = 0;
        panicButton.timestamp = timestamp;
        this.status({
          fill: "red",
          shape: "dot",
          text: "state: " + answerPanic + " - " + howManyTimesToClick + "/" + howManyTimesToClick + " timestamp:" + timestamp + " <" + timeConvert(timestamp) + ">"
        });
        msg = {
          payload: {
            state: answerPanic,
            timestamp: panicButton.timestamp
          }
        };
      } else //if don't
      {
        msg = {
          payload: {
            state: answerDontPanic,
            count: panicButton.count,
            timestamp: panicButton.timestamp
          }
        };
      }
      // save my variable
      this.context().flow.set(variableName, panicButton);
      //fire message
      node.send(msg);
    });
  }

  /**
  function timeConvert returns string from given timestamp as: 2010-10-1 17:09:11
  */
  function timeConvert(myTimeStamp) {
    var d = new Date(myTimeStamp);
    var time = [d.getFullYear(), d.getMonth() + 1, d.getDate()].join('/') + ' ' + [d.getHours(), d.getMinutes(), d.getSeconds()].join(':');
    return time;
  }


  //register node
  RED.nodes.registerType("afya-panic-button", AFYAPanicButton);
}
