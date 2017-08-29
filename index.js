let paramters = require('./parameters').parameters;
let EventPublisher = require('./event-publisher').EventPublushier;
(function refresh() {

    EventPublisher.publishNewData().then(() => {
        setTimeout(() => {
            return refresh();
        }, paramters.refreshIntervallSeconds * 1000);
    }, () => {
        setTimeout(() => {
            return refresh();
        }, paramters.refreshIntervallSeconds* 1000);
    });


})();

(function(){
    EventPublisher.resetLockingStatus();
    EventPublisher.resetHeaterStatus();
    EventPublisher.setUpLockingEvent();
    EventPublisher.setUpHeaterEvent();
    EventPublisher.setUpRefreshEvent();

})();