function mockDoQuery(queryText, onPlanReceived, onResultReceived, onError) {
    
    setTimeout(() => {
        onPlanReceived("This is the plan data. This is the plan data. This is the plan data. This is the plan data.");
    }, 1000);

    setTimeout(() => {
        onResultReceived("This is the result data. This is the result data. This is the result data. This is the result data. ");
    }, 2000);
    
}
