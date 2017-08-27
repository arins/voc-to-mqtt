let paramters = require('./parameters').parameters;
let EventPublisher = require('./event-publisher').EventPublushier;
(function refresh() {

    EventPublisher.publishNewData().then(() => {
        setTimeout(() => {
            return refresh();
        }, paramters.refreshIntervallSeconds);
    }, () => {
        setTimeout(() => {
            return refresh();
        }, paramters.refreshIntervallSeconds);
    });


})();

(function(){

    EventPublisher.setUpLockingEvent();
    EventPublisher.setUpHeaterEvent();

})();