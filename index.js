var qm = require('qm');
var schedule = require('node-schedule');
////////////////////////////////////////////////////////////////////////////////

var rule = new schedule.RecurrenceRule();
rule.hour = 23; //每天23点
rule.minute = 56; //55分
var j = schedule.scheduleJob(rule, function() {
    qm.check('record', function(json) {

    });
});