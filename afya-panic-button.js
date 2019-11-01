/**
 * PanicButton by Marcin Chuć
 * e-mail: marcin ...change it to at... afya.pl
 * (C) 2019
 */

module.exports = function(RED) {
    function AFYAPanicButton(config) {
        RED.nodes.createNode(this,config);
        var node = this;
        node.on('input', function(msg) {

  // my Panic Button variable
  var variableName = config.variableName;
  // how many time to click x times
  var timeToClick = config.timeToClick; //seconds
  // how many times to click
  var howManyTimesToClick =config.howManyTimesToClick;
  // set the answers
  var answerOk=config.answerOk;
  var answerFalse=config.answerFalse;
  var timestamp = Date.now();
  var panicButton = this.context().flow.get(variableName) || {};
  // what if panicButton isn't declared
  if (panicButton.count===undefined)
  {
    panicButton.count=1;
  }
  if (panicButton.timestamp===undefined)
  {
    panicButton.timestamp=timestamp;
  }


  // if clickable arrives within a set time
  if(panicButton.timestamp + (timeToClick*1000)>timestamp)
  {
      panicButton.count++;
  } else // and if don't - reset counter
  {
      panicButton.count=1;
      panicButton.timestamp=timestamp;
  }

  // recommended number of clicks reached: report OK
  if(panicButton.count>howManyTimesToClick-1)
  {
      panicButton.count=0;
      panicButton.timestamp=timestamp;
      msg = {payload: {state :answerOk,timestamp: panicButton.timestamp}};
  } else //if don't
  {
       msg = {payload: {state:answerFalse,count: panicButton.count, timestamp: panicButton.timestamp}};
  }
  // save my variable
  this.context().flow.set(variableName,panicButton);

            node.send(msg);
        });
    }
    RED.nodes.registerType("afya-panic-button",AFYAPanicButton);
}
